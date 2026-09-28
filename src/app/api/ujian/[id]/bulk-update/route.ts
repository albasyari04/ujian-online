import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { requireAdmin, requireGuru } from "@/lib/api-auth"

type Params = { params: Promise<{ id: string }> }

type SoalInput = {
  id: string
  pertanyaan: string
  tipe: "PILIHAN_GANDA" | "ESSAY"
  poin: number
  opsi?: { teks: string; benar: boolean }[]
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id: ujianId } = await params
  let guard = await requireGuru()
  if (guard.error) {
    guard = await requireAdmin()
    if (guard.error) return guard.error
  }

  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.soal)) {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 })
  }

  const soalList = body.soal as SoalInput[]

  // Validasi
  for (const s of soalList) {
    if (!s.id || !s.pertanyaan?.trim()) {
      return NextResponse.json(
        { message: "Setiap soal harus memiliki ID dan pertanyaan." },
        { status: 400 }
      )
    }
    if (typeof s.poin !== "number" || s.poin <= 0) {
      return NextResponse.json(
        { message: "Poin harus berupa angka lebih dari 0." },
        { status: 400 }
      )
    }
    if (s.tipe === "PILIHAN_GANDA") {
      if (!Array.isArray(s.opsi) || s.opsi.length < 2) {
        return NextResponse.json(
          { message: "Soal PG minimal harus punya 2 opsi." },
          { status: 400 }
        )
      }
      const jumlahBenar = s.opsi.filter((o) => o.benar).length
      if (jumlahBenar !== 1) {
        return NextResponse.json(
          { message: "Tepat satu opsi harus ditandai benar di setiap soal PG." },
          { status: 400 }
        )
      }
    }
  }

  try {
    // Pastikan ujian milik guru yang login
    // FIX: guard.userId, bukan guard.user.id
    const ujian = await prisma.ujian.findFirst({
      where: { id: ujianId, pembuatId: guard.userId },
      select: { id: true },
    })

    if (!ujian) {
      return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
    }

    // Update semua soal dalam satu transaksi
    await prisma.$transaction(async (tx) => {
      for (const s of soalList) {
        // Hapus opsi lama
        await tx.opsi.deleteMany({ where: { soalId: s.id } })

        // Update soal + buat opsi baru
        await tx.soal.update({
          where: { id: s.id },
          data: {
            pertanyaan: s.pertanyaan.trim(),
            tipe: s.tipe,
            poin: s.poin,
            opsi:
              s.tipe === "PILIHAN_GANDA" && s.opsi
                ? {
                    create: s.opsi.map((o, i) => ({
                      teks: o.teks.trim(),
                      benar: Boolean(o.benar),
                      urutan: i,
                    })),
                  }
                : undefined,
          },
        })
      }
    })

    return NextResponse.json({ message: "Semua soal berhasil diperbarui." })
  } catch (error) {
    console.error("Bulk update error:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: `Gagal memperbarui: ${error.code}` },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { message: "Gagal menyimpan perubahan." },
      { status: 500 }
    )
  }
}
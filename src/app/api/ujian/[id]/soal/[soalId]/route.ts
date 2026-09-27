import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { requireAdmin, requireGuru } from "@/lib/api-auth"

type Params = { params: Promise<{ id: string; soalId: string }> }
type OpsiInput = { teks: string; benar: boolean }

/* =========================================================
   PUT /api/ujian/:id/soal/:soalId
========================================================= */
export async function PUT(request: NextRequest, { params }: Params) {
  const { soalId } = await params
  let guard = await requireGuru()
  if (guard.error) {
    guard = await requireAdmin()
    if (guard.error) return guard.error
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Data yang dikirim tidak valid." }, { status: 400 })
  }

  const { pertanyaan, tipe, poin, opsi } = body as {
    pertanyaan?: string
    tipe?: string
    poin?: number
    opsi?: OpsiInput[]
  }

  if (typeof pertanyaan !== "string" || pertanyaan.trim().length === 0) {
    return NextResponse.json({ message: "Pertanyaan wajib diisi." }, { status: 400 })
  }

  if (tipe !== "PILIHAN_GANDA" && tipe !== "ESSAY") {
    return NextResponse.json({ message: "Tipe soal tidak valid." }, { status: 400 })
  }

  const poinValue = Number(poin)
  if (!Number.isFinite(poinValue) || poinValue <= 0) {
    return NextResponse.json({ message: "Poin harus berupa angka lebih dari 0." }, { status: 400 })
  }

  let opsiValid: OpsiInput[] = []

  if (tipe === "PILIHAN_GANDA") {
    opsiValid = Array.isArray(opsi) ? opsi.filter((o) => typeof o?.teks === "string" && o.teks.trim().length > 0) : []

    if (opsiValid.length < 2) {
      return NextResponse.json({ message: "Soal pilihan ganda minimal harus punya 2 opsi jawaban." }, { status: 400 })
    }

    const jumlahBenar = opsiValid.filter((o) => o.benar).length
    if (jumlahBenar !== 1) {
      return NextResponse.json({ message: "Tepat satu opsi harus ditandai sebagai jawaban benar." }, { status: 400 })
    }
  }

  try {
    const soal = await prisma.$transaction(async (tx) => {
      await tx.opsi.deleteMany({ where: { soalId } })

      return tx.soal.update({
        where: { id: soalId },
        data: {
          pertanyaan: pertanyaan.trim(),
          tipe,
          poin: poinValue,
          opsi:
            tipe === "PILIHAN_GANDA"
              ? {
                  create: opsiValid.map((o, index) => ({
                    teks: o.teks.trim(),
                    benar: Boolean(o.benar),
                    urutan: index,
                  })),
                }
              : undefined,
        },
        include: { opsi: { orderBy: { urutan: "asc" } } },
      })
    })

    return NextResponse.json(soal)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Soal tidak ditemukan." }, { status: 404 })
    }
    throw error
  }
}

/* =========================================================
   DELETE /api/ujian/:id/soal/:soalId
   Hapus SATU soal. Urutan: Jawaban → Opsi → Soal.
========================================================= */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { soalId } = await params
  let guard = await requireGuru()
  if (guard.error) {
    guard = await requireAdmin()
    if (guard.error) return guard.error
  }

  try {
    const soal = await prisma.soal.findUnique({
      where: { id: soalId },
      select: { id: true },
    })

    if (!soal) {
      return NextResponse.json({ message: "Soal tidak ditemukan." }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      // 1. Hapus jawaban peserta yang mengacu ke soal ini
      await tx.jawaban.deleteMany({ where: { soalId } })
      // 2. Hapus opsi
      await tx.opsi.deleteMany({ where: { soalId } })
      // 3. Hapus soal
      await tx.soal.delete({ where: { id: soalId } })
    })

    return NextResponse.json({ message: "Soal berhasil dihapus." })
  } catch (error) {
    console.error("DELETE /api/ujian/[id]/soal/[soalId] error:", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Soal tidak ditemukan." }, { status: 404 })
    }

    return NextResponse.json(
      { message: "Gagal menghapus soal. Silakan coba lagi." },
      { status: 500 }
    )
  }
}
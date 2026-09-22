import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

type Params = { params: Promise<{ id: string; soalId: string }> }

type OpsiInput = { teks: string; benar: boolean }

/* =========================================================
   PUT /api/ujian/:id/soal/:soalId
   Body: { pertanyaan, tipe, poin, opsi?: [{ teks, benar }] }
   Strategi opsi: hapus semua opsi lama lalu buat ulang (lebih sederhana
   & aman daripada mencocokkan id opsi satu per satu).
========================================================= */
export async function PUT(request: NextRequest, { params }: Params) {
  const { soalId } = await params
  const guard = await requireAdmin()
  if (guard.error) return guard.error

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
========================================================= */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { soalId } = await params
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    await prisma.soal.delete({ where: { id: soalId } })
    return NextResponse.json({ message: "Soal berhasil dihapus." })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ message: "Soal tidak ditemukan." }, { status: 404 })
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { message: "Soal tidak dapat dihapus karena sudah ada peserta yang menjawabnya." },
          { status: 409 }
        )
      }
    }
    throw error
  }
}
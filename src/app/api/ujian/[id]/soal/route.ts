import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

type Params = { params: Promise<{ id: string }> }

type OpsiInput = { teks: string; benar: boolean }

/* =========================================================
   GET /api/ujian/:id/soal
========================================================= */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const daftarSoal = await prisma.soal.findMany({
    where: { ujianId: id },
    orderBy: { urutan: "asc" },
    include: { opsi: { orderBy: { urutan: "asc" } } },
  })

  return NextResponse.json(daftarSoal)
}

/* =========================================================
   POST /api/ujian/:id/soal
   Body: { pertanyaan, tipe, poin, opsi?: [{ teks, benar }] }
========================================================= */
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const ujian = await prisma.ujian.findUnique({ where: { id }, select: { id: true } })
  if (!ujian) {
    return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
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

  const urutanTerakhir = await prisma.soal.aggregate({
    where: { ujianId: id },
    _max: { urutan: true },
  })

  const soalBaru = await prisma.soal.create({
    data: {
      pertanyaan: pertanyaan.trim(),
      tipe,
      poin: poinValue,
      urutan: (urutanTerakhir._max.urutan ?? 0) + 1,
      ujianId: id,
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

  return NextResponse.json(soalBaru, { status: 201 })
}
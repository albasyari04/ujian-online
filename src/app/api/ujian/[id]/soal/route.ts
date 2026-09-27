import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireAdmin, requireGuru } from "@/lib/api-auth"

type Params = { params: Promise<{ id: string }> }

type OpsiInput = { teks: string; benar: boolean }

/* =========================================================
   GET /api/ujian/:id/soal
========================================================= */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  // Coba autentikasi sebagai guru dulu, jika gagal coba admin
  let guard = await requireGuru()
  if (guard.error) {
    guard = await requireAdmin()
    if (guard.error) return guard.error
  }

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
  // Coba autentikasi sebagai guru dulu, jika gagal coba admin
  let guard = await requireGuru()
  if (guard.error) {
    guard = await requireAdmin()
    if (guard.error) return guard.error
  }

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

/* =========================================================
   DELETE /api/ujian/:id/soal
   Menghapus SEMUA soal dalam satu ujian.
   - Ambil dulu semua ID soal
   - Hapus opsi terkait (jika tidak ada onDelete: Cascade)
   - Hapus semua soal
========================================================= */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  // Coba autentikasi sebagai guru dulu, jika gagal coba admin
  let guard = await requireGuru()
  if (guard.error) {
    guard = await requireAdmin()
    if (guard.error) return guard.error
  }

  const ujian = await prisma.ujian.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!ujian) {
    return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
  }

  try {
    // Ambil semua ID soal dalam ujian ini
    const daftarSoal = await prisma.soal.findMany({
      where: { ujianId: id },
      select: { id: true },
    })

    const soalIds = daftarSoal.map((s) => s.id)

    // Hapus opsi terkait dulu (jaga-jaga jika tidak ada onDelete: Cascade)
    if (soalIds.length > 0) {
      await prisma.opsi.deleteMany({ where: { soalId: { in: soalIds } } })
    }

    // Hapus semua soal
    const hasil = await prisma.soal.deleteMany({ where: { ujianId: id } })

    return NextResponse.json({
      message: `${hasil.count} soal berhasil dihapus.`,
      count: hasil.count,
    })
  } catch (error) {
    console.error("DELETE /api/ujian/[id]/soal error:", error)
    return NextResponse.json(
      {
        message:
          "Gagal menghapus semua soal. Pastikan tidak ada data peserta yang bergantung pada soal ini.",
      },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

type Params = { params: Promise<{ id: string }> }

/* =========================================================
   GET /api/ujian/:id/hasil
   Daftar hasil pengerjaan seluruh peserta untuk satu ujian,
   lengkap dengan log pelanggaran masing-masing.
========================================================= */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const ujian = await prisma.ujian.findUnique({
    where: { id },
    select: {
      id: true,
      judul: true,
      batasPelanggaran: true,
      soal: { select: { poin: true } },
    },
  })

  if (!ujian) {
    return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
  }

  const totalPoin = ujian.soal.reduce((total, soal) => total + soal.poin, 0)

  const daftarHasil = await prisma.hasilUjian.findMany({
    where: { ujianId: id },
    include: {
      user: { select: { id: true, nama: true, email: true } },
      logPelanggaran: { orderBy: { waktu: "asc" } },
    },
    orderBy: [{ waktuMulai: "asc" }],
  })

  return NextResponse.json({
    ujian: { id: ujian.id, judul: ujian.judul, batasPelanggaran: ujian.batasPelanggaran, totalPoin },
    hasil: daftarHasil,
  })
}
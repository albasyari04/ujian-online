import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireAdmin, requireGuru } from "@/lib/api-auth"

type Params = { params: Promise<{ id: string }> }
type OpsiInput = { teks: string; benar: boolean }

const MAKS_KUNCI_JAWABAN = 10000

/* =========================================================
   GET /api/ujian/:id/soal
   (khusus guru/admin, jadi kunciJawaban ikut dikirim)
========================================================= */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
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
========================================================= */
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
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

  const { pertanyaan, tipe, poin, opsi, kunciJawaban } = body as {
    pertanyaan?: string
    tipe?: string
    poin?: number
    opsi?: OpsiInput[]
    kunciJawaban?: string | null
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

  if (kunciJawaban != null && typeof kunciJawaban !== "string") {
    return NextResponse.json({ message: "Kunci jawaban tidak valid." }, { status: 400 })
  }
  if (typeof kunciJawaban === "string" && kunciJawaban.length > MAKS_KUNCI_JAWABAN) {
    return NextResponse.json(
      { message: `Kunci jawaban maksimal ${MAKS_KUNCI_JAWABAN} karakter.` },
      { status: 400 }
    )
  }

  // Kunci jawaban hanya berlaku untuk essay; kosong disimpan sebagai null.
  const kunciFinal =
    tipe === "ESSAY" && typeof kunciJawaban === "string" && kunciJawaban.trim().length > 0
      ? kunciJawaban.trim()
      : null

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
      kunciJawaban: kunciFinal,
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
   Hapus SEMUA soal dalam satu ujian.
   Urutan: Jawaban → Opsi → Soal (dalam 1 transaksi).
========================================================= */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
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
    const daftarSoal = await prisma.soal.findMany({
      where: { ujianId: id },
      select: { id: true },
    })

    const soalIds = daftarSoal.map((s) => s.id)

    if (soalIds.length === 0) {
      return NextResponse.json({ message: "Tidak ada soal untuk dihapus.", count: 0 })
    }

    const hasil = await prisma.$transaction(async (tx) => {
      // 1. Hapus jawaban peserta
      await tx.jawaban.deleteMany({ where: { soalId: { in: soalIds } } })
      // 2. Hapus opsi
      await tx.opsi.deleteMany({ where: { soalId: { in: soalIds } } })
      // 3. Hapus soal
      return tx.soal.deleteMany({ where: { ujianId: id } })
    })

    return NextResponse.json({
      message: `${hasil.count} soal berhasil dihapus.`,
      count: hasil.count,
    })
  } catch (error) {
    console.error("DELETE /api/ujian/[id]/soal error:", error)
    return NextResponse.json(
      { message: "Gagal menghapus semua soal. Silakan coba lagi." },
      { status: 500 }
    )
  }
}
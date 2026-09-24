import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireAdmin, requireGuru } from "@/lib/api-auth"

/* =========================================================
   GET /api/ujian
   Daftar semua ujian. Query opsional: ?q=kata-kunci (cari judul)
========================================================= */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const q = request.nextUrl.searchParams.get("q")?.trim()

  const daftarUjian = await prisma.ujian.findMany({
    where: q
      ? {
          judul: { contains: q },
        }
      : undefined,
    include: {
      _count: {
        select: { soal: true, hasilUjian: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(daftarUjian)
}

/* =========================================================
   POST /api/ujian
   Membuat ujian baru.
   Body: { judul, deskripsi?, durasiMenit, acakSoal?, batasPelanggaran?, mulai, selesai }
========================================================= */
export async function POST(request: NextRequest) {
  const guard = await requireGuru()
  if (guard.error) return guard.error

  const body = await request.json().catch(() => null)

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Data yang dikirim tidak valid." }, { status: 400 })
  }

  const { judul, deskripsi, durasiMenit, acakSoal, batasPelanggaran, mulai, selesai } = body as Record<string, unknown>

  if (typeof judul !== "string" || judul.trim().length === 0) {
    return NextResponse.json({ message: "Judul ujian wajib diisi." }, { status: 400 })
  }

  const durasi = Number(durasiMenit)
  if (!Number.isFinite(durasi) || durasi <= 0) {
    return NextResponse.json({ message: "Durasi ujian harus berupa angka lebih dari 0 menit." }, { status: 400 })
  }

  const tanggalMulai = new Date(mulai as string)
  const tanggalSelesai = new Date(selesai as string)

  if (Number.isNaN(tanggalMulai.getTime()) || Number.isNaN(tanggalSelesai.getTime())) {
    return NextResponse.json({ message: "Tanggal mulai/selesai tidak valid." }, { status: 400 })
  }

  if (tanggalMulai >= tanggalSelesai) {
    return NextResponse.json({ message: "Waktu mulai harus lebih awal dari waktu selesai." }, { status: 400 })
  }

  const batas = batasPelanggaran === undefined || batasPelanggaran === null ? 3 : Number(batasPelanggaran)
  if (!Number.isFinite(batas) || batas < 1) {
    return NextResponse.json({ message: "Batas pelanggaran harus berupa angka minimal 1." }, { status: 400 })
  }

  const ujianBaru = await prisma.ujian.create({
    data: {
      judul: judul.trim(),
      deskripsi: typeof deskripsi === "string" && deskripsi.trim().length > 0 ? deskripsi.trim() : null,
      durasiMenit: durasi,
      acakSoal: Boolean(acakSoal),
      batasPelanggaran: batas,
      mulai: tanggalMulai,
      selesai: tanggalSelesai,
      pembuatId: guard.userId,
    },
  })

  return NextResponse.json(ujianBaru, { status: 201 })
}
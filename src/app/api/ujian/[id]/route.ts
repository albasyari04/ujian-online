import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"


/* =========================================================
   GET /api/ujian/:id
   Detail ujian lengkap dengan soal & opsi (untuk halaman edit/soal).
========================================================= */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })
    }

    const ujian = await prisma.ujian.findUnique({
      where: { id },
      include: {
        soal: {
          orderBy: { urutan: "asc" },
          include: { opsi: { orderBy: { urutan: "asc" } } },
        },
        _count: { select: { hasilUjian: true } },
      },
    })

    if (!ujian) {
      return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
    }

    const user = session.user as { id: string; role?: string }
    const isAdmin = user.role === "ADMIN"
    const isPembuat = ujian.pembuatId === user.id

    if (!isAdmin && !isPembuat) {
      return NextResponse.json({ message: "Anda tidak memiliki akses ke resource ini." }, { status: 403 })
    }

    return NextResponse.json(ujian)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Terjadi kesalahan internal." }, { status: 500 })
  }
}

/* =========================================================
   PATCH /api/ujian/:id
   Memperbarui data ujian (tidak termasuk soal).
========================================================= */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })
    }

    const ujianToUpdate = await prisma.ujian.findUnique({
      where: { id },
      select: { pembuatId: true },
    })

    if (!ujianToUpdate) {
      return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
    }

    const user = session.user as { id: string; role?: string }
    const isAdmin = user.role === "ADMIN"
    const isPembuat = ujianToUpdate.pembuatId === user.id

    if (!isAdmin && !isPembuat) {
      return NextResponse.json({ message: "Anda tidak memiliki akses untuk mengubah resource ini." }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Data yang dikirim tidak valid." }, { status: 400 })
    }

    const { judul, deskripsi, durasiMenit, acakSoal, batasPelanggaran, mulai, selesai } =
      body as Record<string, unknown>

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
    if (!Number.isFinite(batas) || batas < 0) {
      return NextResponse.json({ message: "Batas pelanggaran harus berupa angka minimal 0." }, { status: 400 })
    }

    const ujian = await prisma.ujian.update({
      where: { id },
      data: {
        judul: judul.trim(),
        deskripsi: typeof deskripsi === "string" && deskripsi.trim().length > 0 ? deskripsi.trim() : null,
        durasiMenit: durasi,
        acakSoal: Boolean(acakSoal),
        batasPelanggaran: batas,
        mulai: tanggalMulai,
        selesai: tanggalSelesai,
      },
    })

    return NextResponse.json(ujian)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
    }
    console.error(error)
    return NextResponse.json({ message: "Terjadi kesalahan internal." }, { status: 500 })
  }
}

/* =========================================================
   DELETE /api/ujian/:id
========================================================= */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })
    }

    const ujian = await prisma.ujian.findUnique({
      where: { id },
      select: { pembuatId: true },
    })

    if (!ujian) {
      return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
    }

    const user = session.user as { id: string; role?: string }
    const isAdmin = user.role === "ADMIN"
    const isPembuat = ujian.pembuatId === user.id

    if (!isAdmin && !isPembuat) {
      return NextResponse.json({ message: "Anda tidak memiliki akses untuk menghapus resource ini." }, { status: 403 })
    }

    await prisma.ujian.delete({ where: { id } })
    return NextResponse.json({ message: "Ujian berhasil dihapus." })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ message: "Ujian tidak ditemukan." }, { status: 404 })
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { message: "Ujian tidak dapat dihapus karena sudah memiliki peserta yang mengerjakan." },
          { status: 409 }
        )
      }
    }
    throw error
  }
}
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as XLSX from "xlsx"
import type { Prisma } from "@prisma/client"
import { StatusUjian } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

/* =========================================================
   GET /api/nilai/export
   Mengunduh nilai peserta sebagai file Excel (.xlsx).
   Menerima query param yang sama dengan halaman /nilai
   (ujianId, status, q) supaya filter yang aktif di tabel
   ikut terbawa ke file yang di-download.
========================================================= */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { searchParams } = new URL(request.url)
  const ujianId = searchParams.get("ujianId") || undefined
  const statusParam = searchParams.get("status") || undefined

  // Sama seperti di halaman /nilai: harus di-cast ke enum StatusUjian,
  // bukan dibiarkan bertipe string, supaya cocok dengan HasilUjianWhereInput.
  const status: StatusUjian | undefined =
    statusParam === "SELESAI"
      ? StatusUjian.SELESAI
      : statusParam === "SEDANG_DIKERJAKAN"
        ? StatusUjian.SEDANG_DIKERJAKAN
        : undefined

  const q = searchParams.get("q") || undefined

  const where: Prisma.HasilUjianWhereInput = {
    ...(ujianId ? { ujianId } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? {
          user: {
            OR: [{ nama: { contains: q } }, { email: { contains: q } }],
          },
        }
      : {}),
  }

  const daftarHasil = await prisma.hasilUjian.findMany({
    where,
    include: {
      user: { select: { nama: true, email: true } },
      ujian: { select: { judul: true, soal: { select: { poin: true } } } },
    },
    orderBy: [{ waktuSelesai: "desc" }, { waktuMulai: "desc" }],
  })

  if (daftarHasil.length === 0) {
    return NextResponse.json({ message: "Tidak ada data nilai untuk diunduh." }, { status: 404 })
  }

  const baris = daftarHasil.map((hasil) => {
    const totalPoin = hasil.ujian.soal.reduce((total, soal) => total + soal.poin, 0)
    return {
      "Nama Peserta": hasil.user.nama,
      Email: hasil.user.email,
      Ujian: hasil.ujian.judul,
      Skor: hasil.skor ?? "-",
      "Total Poin": totalPoin,
      Status: hasil.status === "SELESAI" ? "Selesai" : "Sedang Dikerjakan",
      "Jumlah Pelanggaran": hasil.jumlahPelanggaran,
      "Waktu Mulai": hasil.waktuMulai.toLocaleString("id-ID"),
      "Waktu Selesai": hasil.waktuSelesai ? hasil.waktuSelesai.toLocaleString("id-ID") : "-",
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(baris)
  // Lebar kolom manual supaya nama ujian/peserta yang panjang tidak terpotong saat dibuka di Excel.
  worksheet["!cols"] = [
    { wch: 24 }, // Nama Peserta
    { wch: 28 }, // Email
    { wch: 30 }, // Ujian
    { wch: 8 }, // Skor
    { wch: 11 }, // Total Poin
    { wch: 18 }, // Status
    { wch: 16 }, // Jumlah Pelanggaran
    { wch: 20 }, // Waktu Mulai
    { wch: 20 }, // Waktu Selesai
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nilai")

  const bufferData = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer

  // FIX: Buffer<ArrayBufferLike> tidak cocok langsung dengan tipe BodyInit
  // pada versi @types/node yang lebih baru. Bungkus jadi Uint8Array murni.
  const body = new Uint8Array(bufferData)

  const tanggal = new Date().toISOString().slice(0, 10)
  const filename = `nilai-ujian-${tanggal}.xlsx`

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import { DaftarUjianBerlangsung } from "./DaftarUjianBerlangsung"

export const dynamic = "force-dynamic"

/* =========================================================
   FORMAT & HELPER
========================================================= */

const formatTanggalPanjang = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value)

/**
 * Batas waktu personal peserta = waktu mulai pengerjaan + durasi ujian,
 * tapi tidak boleh melewati waktu tutup ujian itu sendiri.
 */
function hitungBatasWaktu(waktuMulai: Date, durasiMenit: number, selesaiUjian: Date) {
  const batasDurasi = new Date(waktuMulai.getTime() + durasiMenit * 60_000)
  return batasDurasi < selesaiUjian ? batasDurasi : selesaiUjian
}

/* =========================================================
   TIPE (diekspor supaya dipakai ulang oleh komponen client)
========================================================= */

export type UjianBerlangsungData = {
  hasilId: string
  ujianId: string
  judul: string
  deskripsi: string | null
  batasPelanggaran: number
  jumlahPelanggaran: number
  totalSoal: number
  terjawab: number
  waktuMulaiIso: string
  batasWaktuIso: string
}

/* =========================================================
   HALAMAN
========================================================= */

export default async function UjianBerlangsungPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  if (!userId) return null

  const sekarang = new Date()

  const hasilAktif = await prisma.hasilUjian.findMany({
    where: {
      userId,
      status: "SEDANG_DIKERJAKAN",
    },
    include: {
      ujian: {
        select: {
          id: true,
          judul: true,
          deskripsi: true,
          durasiMenit: true,
          batasPelanggaran: true,
          selesai: true,
          soal: { select: { id: true } },
        },
      },
      _count: { select: { jawaban: true } },
    },
    orderBy: { waktuMulai: "asc" },
  })

  const data: UjianBerlangsungData[] = hasilAktif.map((hasil) => {
    const batasWaktu = hitungBatasWaktu(hasil.waktuMulai, hasil.ujian.durasiMenit, hasil.ujian.selesai)

    return {
      hasilId: hasil.id,
      ujianId: hasil.ujian.id,
      judul: hasil.ujian.judul,
      deskripsi: hasil.ujian.deskripsi,
      batasPelanggaran: hasil.ujian.batasPelanggaran,
      jumlahPelanggaran: hasil.jumlahPelanggaran,
      totalSoal: hasil.ujian.soal.length,
      terjawab: hasil._count.jawaban,
      waktuMulaiIso: hasil.waktuMulai.toISOString(),
      batasWaktuIso: batasWaktu.toISOString(),
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[12.5px] font-medium text-[#b45309]">{formatTanggalPanjang(sekarang)}</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f]">Ujian Sedang Berlangsung</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86]">
          Ujian yang sudah Anda mulai dan belum diselesaikan. Segera lanjutkan sebelum waktu habis.
        </p>
      </header>

      <DaftarUjianBerlangsung data={data} />
    </div>
  )
}
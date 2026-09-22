import Image from "next/image"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RingkasanCard } from "@/components/ui/Card"
import { CalendarCard } from "@/components/ui/CalendarCard"
import { JadwalUjianList, type JadwalItemDTO } from "@/components/ui/JadwalUjianList"

export const dynamic = "force-dynamic"

/* =========================================================
   FORMAT & HELPER TANGGAL
========================================================= */

const formatTanggalSingkat = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(value)

const formatJam = (value: Date) =>
  `${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(value)} WIB`

function formatDurasi(menit: number) {
  if (menit < 60) return `${menit} menit`
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  return sisa > 0 ? `${jam} jam ${sisa} menit` : `${jam} jam`
}

const dateKey = (value: Date) => `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`

/* =========================================================
   TIPE
========================================================= */

type StatusJadwal = "berlangsung" | "akan_datang" | "berakhir"

type HasilRingkas = {
  id: string
  status: "SEDANG_DIKERJAKAN" | "SELESAI"
  skor: number | null
}

/* =========================================================
   HALAMAN
========================================================= */

export default async function JadwalUjianPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  if (!userId) return null

  const sekarang = new Date()

  const [semuaUjian, hasilSaya] = await Promise.all([
    prisma.ujian.findMany({
      include: { soal: { select: { id: true } } },
      orderBy: { mulai: "asc" },
    }),
    prisma.hasilUjian.findMany({
      where: { userId },
      select: { id: true, ujianId: true, status: true, skor: true },
    }),
  ])

  const hasilMap = new Map(hasilSaya.map((hasil) => [hasil.ujianId, hasil as HasilRingkas]))

  // Susun DTO siap-pakai untuk komponen client (semua tanggal sudah diformat di server
  // agar locale "id-ID" konsisten antara render server & hydration client).
  const daftar: JadwalItemDTO[] = semuaUjian.map((ujian) => {
    let status: StatusJadwal = "akan_datang"
    if (sekarang > ujian.selesai) status = "berakhir"
    else if (sekarang >= ujian.mulai) status = "berlangsung"

    const hasil = hasilMap.get(ujian.id) ?? null

    return {
      id: ujian.id,
      judul: ujian.judul,
      tanggalLabel: formatTanggalSingkat(ujian.mulai),
      jamLabel: `${formatJam(ujian.mulai)} – ${formatJam(ujian.selesai)}`,
      durasiLabel: formatDurasi(ujian.durasiMenit),
      jumlahSoal: ujian.soal.length,
      status,
      hasilStatus: hasil?.status ?? null,
      hasilId: hasil?.id ?? null,
    }
  })

  const jumlahBerlangsung = daftar.filter((item) => item.status === "berlangsung").length
  const jumlahAkanDatang = daftar.filter((item) => item.status === "akan_datang").length
  const jumlahBerakhir = daftar.filter((item) => item.status === "berakhir").length

  // Tandai tanggal di kalender berdasarkan status ujian pada tanggal mulai/selesainya.
  // Prioritas warna kalau satu tanggal punya lebih dari satu ujian: berlangsung > akan datang > berakhir.
  const prioritasStatus: Record<StatusJadwal, number> = { berlangsung: 3, akan_datang: 2, berakhir: 1 }
  const tandaiTanggal: Record<string, StatusJadwal> = {}
  semuaUjian.forEach((ujian) => {
    let status: StatusJadwal = "akan_datang"
    if (sekarang > ujian.selesai) status = "berakhir"
    else if (sekarang >= ujian.mulai) status = "berlangsung"

    const kunciTanggal = [dateKey(ujian.mulai), dateKey(ujian.selesai)]
    kunciTanggal.forEach((key) => {
      const existing = tandaiTanggal[key]
      if (!existing || prioritasStatus[status] > prioritasStatus[existing]) {
        tandaiTanggal[key] = status
      }
    })
  })

  return (
    <div className="flex flex-col gap-6">
      {/* ===================== RINGKASAN ===================== */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <RingkasanCard
          label="Sedang Berlangsung"
          value={jumlahBerlangsung}
          tone="navy"
          iconImageSrc="/image/icon/ujian-sedang-dikerjakan.png"
          icon={null}
        />
        <RingkasanCard
          label="Akan Datang"
          value={jumlahAkanDatang}
          tone="blue"
          iconImageSrc="/image/icon/akan-datang-icon.png"
          icon={null}
        />
        <RingkasanCard
          label="Sudah Berakhir"
          value={jumlahBerakhir}
          tone="violet"
          iconImageSrc="/image/icon/sudah-berkhir-icon.png"
          icon={null}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ===================== KOLOM UTAMA ===================== */}
        <div className="lg:col-span-2">
          <JadwalUjianList items={daftar} />
        </div>

        {/* ===================== PANEL KANAN ===================== */}
        <div className="flex flex-col gap-6">
          <CalendarCard
            initialYear={sekarang.getFullYear()}
            initialMonth={sekarang.getMonth()}
            todayKey={dateKey(sekarang)}
            markedDates={tandaiTanggal}
          />

          <QuoteCard />
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   KARTU MOTIVASI
========================================================= */

function QuoteCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_14px_30px_-16px_rgba(22,35,63,0.35)] dark:bg-[#141c30]">
      <Image
        src="/image/banner/Quots.jpg"
        alt="Kutipan motivasi tentang belajar"
        width={818}
        height={730}
        className="h-auto w-full object-cover"
        sizes="(min-width: 1024px) 340px, 100vw"
      />
    </div>
  )
}
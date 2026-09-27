import Image from "next/image"
import Link from "next/link"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { IconAlertTriangle, IconDocument } from "@/components/ui/Icons"
// NOTE: sesuaikan path import ini dengan lokasi file subject-icons.ts di proyek Anda
// (mis. "@/lib/subject-icons" atau "@/utils/subject-icons").
import { getSubjectIconSrc } from "@/lib/subject-icons"

export const dynamic = "force-dynamic"

/* =========================================================
   FORMAT & HELPER TANGGAL
========================================================= */

const formatTanggalPanjang = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value)

const formatJam = (value: Date) =>
  `${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(value)} WIB`

function formatDurasi(menit: number) {
  if (menit < 60) return `${menit} menit`
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  return sisa > 0 ? `${jam} jam ${sisa} menit` : `${jam} jam`
}

function formatSisaWaktu(selesai: Date, sekarang: Date) {
  const selisihMs = selesai.getTime() - sekarang.getTime()
  if (selisihMs <= 0) return "Segera ditutup"

  const totalMenit = Math.floor(selisihMs / 60000)
  const hari = Math.floor(totalMenit / (60 * 24))
  const jam = Math.floor((totalMenit % (60 * 24)) / 60)
  const menit = totalMenit % 60

  if (hari > 0) return `${hari} hari ${jam} jam lagi`
  if (jam > 0) return `${jam} jam ${menit} menit lagi`
  return `${menit} menit lagi`
}

/* =========================================================
   TIPE
========================================================= */

type HasilRingkas = {
  id: string
  status: "SEDANG_DIKERJAKAN" | "SELESAI"
  skor: number | null
}

type ItemUjianTersedia = {
  ujian: {
    id: string
    judul: string
    deskripsi: string | null
    durasiMenit: number
    acakSoal: boolean
    batasPelanggaran: number
    mulai: Date
    selesai: Date
    soal: { id: string }[]
  }
  hasil: HasilRingkas | null
}

/* =========================================================
   HALAMAN
========================================================= */

export default async function UjianTersediaPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  if (!userId) return null

  const sekarang = new Date()

  // Ujian yang jendela waktunya sedang aktif (sudah mulai, belum ditutup)
  const ujianAktif = await prisma.ujian.findMany({
    where: {
      mulai: { lte: sekarang },
      selesai: { gte: sekarang },
    },
    include: { soal: { select: { id: true } } },
    orderBy: { selesai: "asc" },
  })

  const hasilSaya = await prisma.hasilUjian.findMany({
    where: {
      userId,
      ujianId: { in: ujianAktif.map((ujian) => ujian.id) },
    },
    select: { id: true, ujianId: true, status: true, skor: true },
  })

  const hasilMap = new Map(hasilSaya.map((hasil) => [hasil.ujianId, hasil as HasilRingkas]))

  const daftar: ItemUjianTersedia[] = ujianAktif.map((ujian) => ({
    ujian,
    hasil: hasilMap.get(ujian.id) ?? null,
  }))

  const belumDikerjakan = daftar.filter((item) => !item.hasil)
  const sedangDikerjakan = daftar.filter((item) => item.hasil?.status === "SEDANG_DIKERJAKAN")
  const sudahSelesai = daftar.filter((item) => item.hasil?.status === "SELESAI")

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[12.5px] font-medium text-[#b45309] dark:text-amber-400">
          {formatTanggalPanjang(sekarang)}
        </p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f] dark:text-white">Ujian Tersedia</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86] dark:text-white/50">
          Daftar ujian yang sedang dibuka dan dapat Anda kerjakan saat ini.
        </p>
      </header>

      {/* =========================================================
          RINGKASAN
          Memakai StatCard — komponen & style yang SAMA persis
          dengan halaman Jadwal Ujian / Riwayat / Hasil & Nilai
          (icon polos kanan-atas, angka besar, efek gradient/
          shadow 3D, grid 3 kolom dengan gap yang mengecil di
          layar sempit).
      ========================================================= */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          label="Belum dikerjakan"
          value={belumDikerjakan.length}
          description="ujian yang belum dimulai"
          iconImageSrc="/image/icon/belum-dikerjakan-icon.png"
          tone="blue"
        />
        <StatCard
          label="Sedang dikerjakan"
          value={sedangDikerjakan.length}
          description="ujian yang sedang berjalan"
          iconImageSrc="/image/icon/sedang-mengerjakan-icon.png"
          tone="amber"
        />
        <StatCard
          label="Sudah selesai"
          value={sudahSelesai.length}
          description="ujian yang telah diselesaikan"
          iconImageSrc="/image/icon/ujian-selesai.png"
          tone="emerald"
        />
      </div>

      {daftar.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[18px] border border-[#e7e4dc] bg-white px-6 py-14 text-center shadow-[0_1px_2px_rgba(22,35,63,0.04),0_10px_24px_-12px_rgba(49,46,129,0.18)] dark:border-white/10 dark:bg-[#101a30]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff] text-[#3457c9] dark:bg-blue-400/10 dark:text-blue-300">
            <IconDocument className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">
              Belum ada ujian yang tersedia
            </p>
            <p className="mt-1 max-w-sm text-[13px] text-[#8b93a6] dark:text-white/40">
              Ujian akan muncul di sini secara otomatis saat jadwalnya dibuka. Cek menu{" "}
              <span className="font-medium text-[#34435f] dark:text-white/70">Jadwal Ujian</span> untuk melihat
              jadwal mendatang.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {daftar.map((item) => (
            <UjianTersediaCard key={item.ujian.id} item={item} sekarang={sekarang} />
          ))}
        </div>
      )}
    </div>
  )
}

/* =========================================================
   KARTU PER-UJIAN
   Gaya 3D: gradient permukaan + glare atas + shadow bertingkat +
   hover-lift, konsisten dengan ItemJadwalCard di JadwalUjianList.
   Icon di kiri sekarang icon mata pelajaran (bukan icon status),
   status tetap terbaca lewat Badge di bawah judul.
========================================================= */

function UjianTersediaCard({ item, sekarang }: { item: ItemUjianTersedia; sekarang: Date }) {
  const { ujian, hasil } = item
  const sisaWaktu = formatSisaWaktu(ujian.selesai, sekarang)
  const akanDitutupSegera = ujian.selesai.getTime() - sekarang.getTime() <= 60 * 60 * 1000

  return (
    <div className="group relative flex flex-col gap-3.5 overflow-hidden rounded-[16px] border border-[#e7e4dc] bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_0_#e3e7ee,0_22px_34px_-16px_rgba(22,35,63,0.4)] dark:border-white/10 dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_7px_0_#0d1424,0_24px_36px_-16px_rgba(0,0,0,0.68)] sm:flex-row sm:items-center sm:justify-between">
      {/* glare atas — dekorasi permukaan 3D */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#16233f]/[0.04] blur-2xl dark:bg-white/[0.04]"
        aria-hidden="true"
      />

      <div className="relative flex items-start gap-3">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#eef0f4] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_6px_14px_-6px_rgba(22,35,63,0.3)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3 dark:from-white/10 dark:to-white/[0.02] sm:h-[54px] sm:w-[54px]">
          <Image
            src={getSubjectIconSrc(ujian.judul)}
            alt=""
            width={30}
            height={30}
            className="h-7 w-7 object-contain sm:h-8 sm:w-8"
          />
        </span>

        <div className="relative min-w-0">
          <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">{ujian.judul}</p>

          {ujian.deskripsi && (
            <p className="mt-0.5 line-clamp-2 max-w-md text-[12.5px] text-[#8b93a6] dark:text-white/40">
              {ujian.deskripsi}
            </p>
          )}

          <p className="mt-1.5 text-[12px] text-[#8b93a6] dark:text-white/40">
            Ditutup pukul {formatJam(ujian.selesai)}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="slate">{formatDurasi(ujian.durasiMenit)}</Badge>
            <Badge tone="slate">{ujian.soal.length} soal</Badge>
            {ujian.acakSoal && <Badge tone="blue">Soal diacak</Badge>}
            <StatusBadge hasil={hasil} />
            <Badge tone={akanDitutupSegera ? "red" : "amber"}>
              {akanDitutupSegera && <IconAlertTriangle className="h-3 w-3" />}
              {sisaWaktu}
            </Badge>
          </div>
        </div>
      </div>

      <div className="relative flex border-t border-dashed border-[#e7e4dc] pt-3 dark:border-white/10 sm:border-0 sm:pt-0">
        <AksiUjian ujianId={ujian.id} hasil={hasil} />
      </div>
    </div>
  )
}

function StatusBadge({ hasil }: { hasil: HasilRingkas | null }) {
  if (hasil?.status === "SEDANG_DIKERJAKAN") return <Badge tone="amber">Sedang dikerjakan</Badge>
  if (hasil?.status === "SELESAI") return <Badge tone="emerald">Sudah selesai</Badge>
  return <Badge tone="blue">Belum dikerjakan</Badge>
}

function AksiUjian({ ujianId, hasil }: { ujianId: string; hasil: HasilRingkas | null }) {
  if (hasil?.status === "SEDANG_DIKERJAKAN") {
    return (
      <Link href={`/ujian/${ujianId}`} className="shrink-0">
        <Button variant="secondary" size="sm" className="w-full sm:w-auto">
          Lanjutkan ujian
        </Button>
      </Link>
    )
  }

  if (hasil?.status === "SELESAI") {
    return (
      <Link href={`/hasil/${hasil.id}`} className="shrink-0">
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          Lihat hasil
        </Button>
      </Link>
    )
  }

  return (
    <Link href={`/ujian/${ujianId}`} className="shrink-0">
      <Button size="sm" className="w-full sm:w-auto">
        Mulai ujian
      </Button>
    </Link>
  )
}
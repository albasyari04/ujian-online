import Link from "next/link"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, RingkasanCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { IconAlertTriangle, IconCheckCircle, IconClock } from "@/components/ui/Icons"

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
        <p className="text-[12.5px] font-medium text-[#b45309]">{formatTanggalPanjang(sekarang)}</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f]">Ujian Tersedia</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86]">
          Daftar ujian yang sedang dibuka dan dapat Anda kerjakan saat ini.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <RingkasanCard
          label="Belum dikerjakan"
          value={belumDikerjakan.length}
          tone="blue"
          iconImageSrc="/image/icon/belum-dikerjakan-icon.png"
          icon={null}
        />
        <RingkasanCard
          label="Sedang dikerjakan"
          value={sedangDikerjakan.length}
          tone="amber"
          iconImageSrc="/image/icon/sedang-mengerjakan-icon.png"
          icon={null}
        />
        <RingkasanCard
          label="Sudah selesai"
          value={sudahSelesai.length}
          tone="emerald"
          iconImageSrc="/image/icon/ujian-selesai.png"
          icon={null}
        />
      </div>

      {daftar.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff] text-[#3457c9]">
            <IconClock className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[14.5px] font-semibold text-[#16233f]">Belum ada ujian yang tersedia</p>
            <p className="mt-1 max-w-sm text-[13px] text-[#8b93a6]">
              Ujian akan muncul di sini secara otomatis saat jadwalnya dibuka. Cek menu{" "}
              <span className="font-medium text-[#34435f]">Jadwal Ujian</span> untuk melihat jadwal mendatang.
            </p>
          </div>
        </Card>
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
========================================================= */

const ikonBg: Record<"selesai" | "dikerjakan" | "belum", string> = {
  selesai: "bg-[#ecfdf5] text-[#047857]",
  dikerjakan: "bg-[#fdf6e7] text-[#b45309]",
  belum: "bg-[#eef4ff] text-[#3457c9]",
}

function statusKunci(hasil: HasilRingkas | null): "selesai" | "dikerjakan" | "belum" {
  if (hasil?.status === "SELESAI") return "selesai"
  if (hasil?.status === "SEDANG_DIKERJAKAN") return "dikerjakan"
  return "belum"
}

function UjianTersediaCard({ item, sekarang }: { item: ItemUjianTersedia; sekarang: Date }) {
  const { ujian, hasil } = item
  const kunci = statusKunci(hasil)
  const sisaWaktu = formatSisaWaktu(ujian.selesai, sekarang)
  const akanDitutupSegera = ujian.selesai.getTime() - sekarang.getTime() <= 60 * 60 * 1000

  return (
    <Card className="flex flex-col gap-3.5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${ikonBg[kunci]}`}>
          {kunci === "selesai" ? <IconCheckCircle className="h-5 w-5" /> : <IconClock className="h-5 w-5" />}
        </span>

        <div>
          <p className="text-[14px] font-semibold text-[#16233f]">{ujian.judul}</p>

          {ujian.deskripsi && (
            <p className="mt-0.5 line-clamp-2 max-w-md text-[12.5px] text-[#8b93a6]">{ujian.deskripsi}</p>
          )}

          <p className="mt-1.5 text-[12px] text-[#8b93a6]">Ditutup pukul {formatJam(ujian.selesai)}</p>

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

      <AksiUjian ujianId={ujian.id} hasil={hasil} />
    </Card>
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
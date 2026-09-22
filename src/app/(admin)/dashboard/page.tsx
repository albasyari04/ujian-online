import Link from "next/link"
import Image from "next/image"
import { Role, StatusUjian } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { AreaChart } from "@/components/dashboard/AreaChart"
import { LineChart } from "@/components/dashboard/LineChart"
import { ExamCalendar } from "@/components/dashboard/ExamCalendar"
import { getSubjectIconSrc } from "@/lib/subject-icons"

// Data di halaman ini berubah terus (ujian berlangsung, pelanggaran, dst),
// jadi jangan di-cache statis oleh Next.js.
export const dynamic = "force-dynamic"

/* =========================================================
   ICONS
========================================================= */

function IconUsers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 20C3.8 15.7 5.9 13.5 9 13.5C12.1 13.5 14.2 15.7 15 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="17.2" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.6 13.3C17.9 13.5 19.3 15 20 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconClipboard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="5" y="4.5" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 4V3.2C9 2.5 9.6 2 10.3 2H13.7C14.4 2 15 2.5 15 3.2V4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 10H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.5 13.5H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.5 17H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5V12L15.2 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconChartBars({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 19.5H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="5.5" y="12.5" width="2.8" height="5" rx="0.8" fill="currentColor" />
      <rect x="10.6" y="9" width="2.8" height="8.5" rx="0.8" fill="currentColor" />
      <rect x="15.7" y="5.5" width="2.8" height="12" rx="0.8" fill="currentColor" />
      <circle cx="17.1" cy="4" r="1.1" fill="currentColor" />
    </svg>
  )
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* =========================================================
   HELPERS
========================================================= */

const DAY_LABEL_PENDEK = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const MONTH_LABEL_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

const AKSEN_JADWAL = [
  "bg-gradient-to-br from-[#007fc4] to-[#00a7ff]",
  "bg-gradient-to-br from-[#155d8c] to-[#2d8cc4]",
  "bg-gradient-to-br from-[#003868] to-[#1565a8]",
  "bg-gradient-to-br from-[#008fc9] to-[#42c7f5]",
]

// Kelas dasar untuk semua card di dashboard ini — memberi kesan "3D":
// gradasi tipis + shadow ganda (jauh & dekat) + border halus.
const CARD_3D =
  "rounded-[18px] border border-[#dce7ee] bg-gradient-to-b from-white to-[#f7fbfd] shadow-[0_10px_28px_rgba(0,56,104,0.08),0_2px_6px_rgba(0,56,104,0.05)] transition-shadow hover:shadow-[0_14px_34px_rgba(0,56,104,0.13),0_3px_8px_rgba(0,56,104,0.07)]"

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, amount: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function formatJam(date: Date) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

function getStatusUjian(mulai: Date, selesai: Date, now: Date) {
  if (now < mulai) {
    return { label: "Akan Datang", className: "bg-[#eaf1ff] text-[#2563eb]" }
  }

  if (now > selesai) {
    return { label: "Selesai", className: "bg-[#eef0f4] text-[#666f80]" }
  }

  return { label: "Berlangsung", className: "bg-[#e5f7ff] text-[#007fc4]" }
}

function formatWaktuRelatif(date: Date, now: Date) {
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffMin < 1) return "Baru saja"
  if (diffMin < 60) return `${diffMin} menit lalu`

  const diffJam = Math.floor(diffMin / 60)
  if (diffJam < 24) return `${diffJam} jam lalu`

  const diffHari = Math.floor(diffJam / 24)
  return `${diffHari} hari lalu`
}

const LABEL_PELANGGARAN: Record<string, string> = {
  PINDAH_TAB: "Pindah tab",
  KELUAR_FULLSCREEN: "Keluar fullscreen",
  KEHILANGAN_FOKUS: "Kehilangan fokus",
  COPY_PASTE: "Copy-paste",
  KLIK_KANAN: "Klik kanan",
  DEVTOOLS: "Membuka DevTools",
}

/* =========================================================
   PAGE
========================================================= */

export default async function DashboardPage() {
  const now = new Date()
  const today0 = startOfDay(now)
  const tujuhHariLalu = addDays(today0, -6) // rentang 7 hari termasuk hari ini
  const bulanIni = addMonths(now, 0)
  const awalBulanBerikut = addMonths(bulanIni, 1)
  const enamBulanLalu = addMonths(bulanIni, -5) // jendela bergulir 6 bulan

  const [
    totalPeserta,
    totalUjian,
    ujianBerlangsung,
    rataRataAgg,
    ujianTerbaru,
    pelanggaranTerbaru,
    pelanggaranSeminggu,
    ujianEnamBulan,
    ujianBulanIni,
    ujianTerdekat,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.PESERTA } }),
    prisma.ujian.count(),
    prisma.ujian.count({ where: { mulai: { lte: now }, selesai: { gte: now } } }),
    prisma.hasilUjian.aggregate({
      _avg: { skor: true },
      where: { status: StatusUjian.SELESAI },
    }),
    prisma.ujian.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { soal: true, hasilUjian: true } },
      },
    }),
    prisma.logPelanggaran.findMany({
      take: 5,
      orderBy: { waktu: "desc" },
      include: {
        hasilUjian: { include: { user: true, ujian: true } },
      },
    }),
    prisma.logPelanggaran.findMany({
      where: { waktu: { gte: tujuhHariLalu } },
      select: { waktu: true },
    }),
    prisma.ujian.findMany({
      where: { createdAt: { gte: enamBulanLalu } },
      select: { createdAt: true },
    }),
    prisma.ujian.findMany({
      where: { mulai: { gte: bulanIni, lt: awalBulanBerikut } },
      select: { mulai: true },
    }),
    prisma.ujian.findMany({
      where: { mulai: { gte: now } },
      orderBy: { mulai: "asc" },
      take: 4,
      select: { id: true, judul: true, mulai: true, selesai: true },
    }),
  ])

  const rataRata = rataRataAgg._avg.skor ?? 0

  // Grafik: jumlah pelanggaran per hari, 7 hari terakhir
  const grafikPelanggaran = Array.from({ length: 7 }, (_, i) => {
    const tanggal = addDays(tujuhHariLalu, i)
    const jumlah = pelanggaranSeminggu.filter(
      (log) => startOfDay(log.waktu).getTime() === tanggal.getTime(),
    ).length
    return { label: DAY_LABEL_PENDEK[tanggal.getDay()], value: jumlah }
  })

  // Grafik: jumlah ujian dibuat per bulan, 6 bulan terakhir
  const grafikUjianBulanan = Array.from({ length: 6 }, (_, i) => {
    const bulan = addMonths(enamBulanLalu, i)
    const jumlah = ujianEnamBulan.filter(
      (u) => u.createdAt.getFullYear() === bulan.getFullYear() && u.createdAt.getMonth() === bulan.getMonth(),
    ).length
    return { label: MONTH_LABEL_PENDEK[bulan.getMonth()], value: jumlah }
  })

  const tanggalUjianBulanIni = ujianBulanIni.map((u) => u.mulai.getDate())

  const statCards = [
    {
      label: "Total Peserta",
      value: totalPeserta.toLocaleString("id-ID"),
      icon: IconUsers,
      iconClass: "bg-gradient-to-br from-[#007fc4] to-[#00a7ff] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_10px_16px_-8px_rgba(0,126,196,0.75)]",
    },
    {
      label: "Total Ujian",
      value: totalUjian.toLocaleString("id-ID"),
      icon: IconClipboard,
      iconClass: "bg-gradient-to-br from-[#003868] to-[#1565a8] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_16px_-8px_rgba(0,56,104,0.75)]",
    },
    {
      label: "Ujian Berlangsung",
      value: ujianBerlangsung.toLocaleString("id-ID"),
      icon: IconClock,
      iconClass: "bg-gradient-to-br from-[#008fc9] to-[#42c7f5] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_10px_16px_-8px_rgba(0,143,201,0.7)]",
      live: ujianBerlangsung > 0,
    },
    {
      label: "Rata-rata Nilai",
      value: rataRata ? rataRata.toFixed(1) : "-",
      icon: IconChartBars,
      iconClass: "bg-gradient-to-br from-[#155d8c] to-[#4d98c2] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_10px_16px_-8px_rgba(21,93,140,0.7)]",
    },
  ] as const

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 lg:flex-row lg:items-start">
      {/* ===================== KOLOM UTAMA ===================== */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* ===== BANNER ===== */}
        <div className="relative overflow-hidden rounded-[16px] shadow-[0_8px_22px_rgba(0,56,104,0.1)]">
          <Image
            src="/image/banner/sistem-ujian-online.png"
            alt="Sistem Ujian Online — Mudah, Aman, dan Terpercaya untuk Masa Depan yang Lebih Baik"
            width={2172}
            height={724}
            priority
            className="h-auto w-full object-cover"
          />
        </div>

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, iconClass, ...rest }) => (
            <div key={label} className={`group flex items-center gap-3 ${CARD_3D} px-4 py-4 transition-transform duration-200 hover:-translate-y-1`}>
              <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/30 transition-transform duration-200 group-hover:-translate-y-0.5 ${iconClass}`}>
                <span className="pointer-events-none absolute inset-x-1 top-1 h-1/3 rounded-full bg-white/20 blur-[1px]" />
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[19px] font-semibold leading-tight text-[#16233f]">{value}</p>
                  {"live" in rest && rest.live && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" title="Sedang berlangsung" />
                  )}
                </div>
                <p className="truncate text-[11.5px] text-[#8b93a6]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== GRAFIK ===== */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className={`${CARD_3D} p-5`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[15px] font-semibold text-[#16233f]">Pelanggaran 7 Hari Terakhir</h2>
                <p className="text-[11.5px] text-[#8b93a6]">Jumlah kejadian pelanggaran per hari</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#fdf1f1] px-2.5 py-1 text-[10.5px] font-medium text-[#d23b3b]">
                {pelanggaranSeminggu.length} kejadian
              </span>
            </div>
            <div className="mt-3">
              <AreaChart data={grafikPelanggaran} color="#d23b3b" />
            </div>
          </section>

          <section className={`${CARD_3D} p-5`}>
            <div>
              <h2 className="text-[15px] font-semibold text-[#16233f]">Ujian Dibuat per Bulan</h2>
              <p className="text-[11.5px] text-[#8b93a6]">6 bulan terakhir</p>
            </div>
            <div className="mt-3">
              <LineChart data={grafikUjianBulanan} color="#007fc4" />
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* ===== UJIAN TERBARU ===== */}
          <section className={`${CARD_3D} p-5`}>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#16233f]">Ujian Terbaru</h2>
              <Link
                href="/ujian"
                className="flex items-center gap-1 text-[12.5px] font-medium text-[#007fc4] hover:underline"
              >
                Lihat Semua <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              {ujianTerbaru.length === 0 && (
                <p className="rounded-[12px] bg-[#f6f4ec] px-4 py-6 text-center text-[12.5px] text-[#8b93a6]">
                  Belum ada ujian yang dibuat.
                </p>
              )}

              {ujianTerbaru.map((ujian) => {
                const status = getStatusUjian(ujian.mulai, ujian.selesai, now)

                return (
                  <Link
                    key={ujian.id}
                    href={`/ujian/${ujian.id}`}
                    className="flex items-center justify-between gap-3 rounded-[14px] border border-[#efece4] px-4 py-3 transition-colors hover:bg-[#f6f4ec]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#d9f4ff]">
                        <Image
                          src={getSubjectIconSrc(ujian.judul)}
                          alt=""
                          width={40}
                          height={40}
                          className="h-7 w-7 object-contain"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-semibold text-[#16233f]">{ujian.judul}</p>
                        <p className="truncate text-[11.5px] text-[#8b93a6]">
                          {ujian._count.soal} soal · {ujian._count.hasilUjian} peserta mengerjakan
                        </p>
                      </div>
                    </div>

                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* ===== LOG PELANGGARAN TERBARU ===== */}
          <section className={`${CARD_3D} p-5`}>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#16233f]">Log Pelanggaran Terbaru</h2>
              <Link
                href="/ujian"
                className="flex items-center gap-1 text-[12.5px] font-medium text-[#007fc4] hover:underline"
              >
                Detail <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              {pelanggaranTerbaru.length === 0 && (
                <p className="rounded-[12px] bg-[#fffaf0] px-4 py-6 text-center text-[12.5px] text-[#8b93a6]">
                  Belum ada pelanggaran tercatat.
                </p>
              )}

              {pelanggaranTerbaru.map((log) => (
                <div key={log.id} className="flex items-start gap-3 rounded-[14px] bg-[#fffaf0] px-3.5 py-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fdeecb]">
                    <Image
                      src="/image/icon/peringatan-icon.png"
                      alt=""
                      width={32}
                      height={32}
                      className="h-5 w-5 object-contain"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold text-[#34435f]">
                      {log.hasilUjian.user.nama} — {LABEL_PELANGGARAN[log.tipe] ?? log.tipe}
                    </p>
                    <p className="truncate text-[11px] text-[#94a3b8]">
                      {log.hasilUjian.ujian.judul} · {formatWaktuRelatif(log.waktu, now)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ===================== PANEL KANAN ===================== */}
      <aside className="flex w-full flex-col gap-5 lg:w-[300px] lg:shrink-0">
        <div className={`${CARD_3D} p-5`}>
          <ExamCalendar month={bulanIni} examDays={tanggalUjianBulanIni} today={now} />
        </div>

        <div className={`${CARD_3D} p-5`}>
          <h2 className="text-[14.5px] font-semibold text-[#16233f]">Ujian Terdekat</h2>

          <div className="mt-3 flex flex-col gap-2.5">
            {ujianTerdekat.length === 0 && (
              <p className="rounded-[12px] bg-[#f6f4ec] px-3.5 py-5 text-center text-[12px] text-[#8b93a6]">
                Tidak ada ujian mendatang.
              </p>
            )}

            {ujianTerdekat.map((ujian, i) => (
              <div key={ujian.id} className="flex items-start gap-3 rounded-[14px] border border-[#efece4] px-3 py-2.5">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 text-[11px] font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_5px_10px_-6px_rgba(0,56,104,0.8)] ${AKSEN_JADWAL[i % AKSEN_JADWAL.length]}`}
                >
                  {ujian.judul.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-[#34435f]">{ujian.judul}</p>
                  <p className="text-[11px] text-[#94a3b8]">
                    {ujian.mulai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} ·{" "}
                    {formatJam(ujian.mulai)} - {formatJam(ujian.selesai)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${CARD_3D} p-5`}>
          <h2 className="text-[14.5px] font-semibold text-[#16233f]">Quick Action</h2>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Link href="/ujian/create" className="group flex items-center gap-2 rounded-[10px] border border-[#dce7ee] bg-white px-2.5 py-2.5 text-[10.5px] font-medium text-[#34435f] shadow-[0_4px_10px_-8px_rgba(0,56,104,0.45)] transition-all hover:-translate-y-0.5 hover:border-[#b7d9e9] hover:bg-[#f5fbfe] hover:shadow-[0_9px_14px_-9px_rgba(0,56,104,0.65)]">
              <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[9px] border border-white/35 bg-gradient-to-br from-[#007fc4] to-[#00a7ff] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_7px_11px_-7px_rgba(0,126,196,0.8)] transition-transform group-hover:-translate-y-0.5"><IconPlus className="relative h-4 w-4" /></span>
              Buat Ujian
            </Link>
            <Link href="/peserta" className="group flex items-center gap-2 rounded-[10px] border border-[#dce7ee] bg-white px-2.5 py-2.5 text-[10.5px] font-medium text-[#34435f] shadow-[0_4px_10px_-8px_rgba(0,56,104,0.45)] transition-all hover:-translate-y-0.5 hover:border-[#b7d9e9] hover:bg-[#f5fbfe] hover:shadow-[0_9px_14px_-9px_rgba(0,56,104,0.65)]">
              <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[9px] border border-white/35 bg-gradient-to-br from-[#003868] to-[#1565a8] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_7px_11px_-7px_rgba(0,56,104,0.85)] transition-transform group-hover:-translate-y-0.5"><IconUsers className="relative h-4 w-4" /></span>
              Tambah Peserta
            </Link>
            <Link href="/ujian" className="group flex items-center gap-2 rounded-[10px] border border-[#dce7ee] bg-white px-2.5 py-2.5 text-[10.5px] font-medium text-[#34435f] shadow-[0_4px_10px_-8px_rgba(0,56,104,0.45)] transition-all hover:-translate-y-0.5 hover:border-[#b7d9e9] hover:bg-[#f5fbfe] hover:shadow-[0_9px_14px_-9px_rgba(0,56,104,0.65)]">
              <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[9px] border border-white/35 bg-gradient-to-br from-[#155d8c] to-[#4d98c2] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_7px_11px_-7px_rgba(21,93,140,0.8)] transition-transform group-hover:-translate-y-0.5"><IconClipboard className="relative h-4 w-4" /></span>
              Import Soal
            </Link>
            <Link href="/laporan" className="group flex items-center gap-2 rounded-[10px] border border-[#dce7ee] bg-white px-2.5 py-2.5 text-[10.5px] font-medium text-[#34435f] shadow-[0_4px_10px_-8px_rgba(0,56,104,0.45)] transition-all hover:-translate-y-0.5 hover:border-[#b7d9e9] hover:bg-[#f5fbfe] hover:shadow-[0_9px_14px_-9px_rgba(0,56,104,0.65)]">
              <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[9px] border border-white/35 bg-gradient-to-br from-[#003868] to-[#007fc4] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.38),0_7px_11px_-7px_rgba(0,56,104,0.85)] transition-transform group-hover:-translate-y-0.5"><IconLaporan className="relative h-4 w-4" /></span>
              Laporan
            </Link>
          </div>
        </div>
      </aside>
    </div>
  )
}

function IconLaporan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 4.5H15L18.5 8V19.5H6V4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 4.5V8H18.5M8.5 15.5L10.5 13.5L12.2 15L15.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 17.5H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
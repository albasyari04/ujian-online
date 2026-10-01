import Link from "next/link"
import Image from "next/image"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/ui/StatCard"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { getSubjectIconSrc } from "@/lib/subject-icons"
import { IconClock } from "@/components/ui/Icons"

/* =========================================================
   ICONS
========================================================= */
const STAT_ICON = {
  ujianSaya: "/image/icon/ujian-saya-icon.png",
  totalSoal: "/image/icon/total-soal-icon.png",
  sedangMengerjakan: "/image/icon/sedang-mengerjakan-icon.png",
  rataRata: "/image/icon/rata-rata-score.png",
}

const SECTION_ICON = {
  ujianTerbaru: "/image/icon/daftar-jadwal-ujian-icon.png",
  pelanggaran: "/image/icon/pelanggaran-terbaru-icon.png",
  statistik: "/image/icon/statistik-icon.png",
}

/* =========================================================
   GLASS CARD 3D
========================================================= */
const GLASS_3D_CARD =
  "relative overflow-hidden p-5 shadow-[0_2px_4px_rgba(22,35,63,0.06),0_14px_28px_-10px_rgba(49,46,129,0.28),0_40px_70px_-28px_rgba(49,46,129,0.5)] ring-1 ring-white/70 ring-inset before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:via-white/5 before:to-transparent before:content-[''] dark:ring-white/10 dark:before:from-white/10 dark:before:via-transparent"

/* =========================================================
   ZONA WAKTU & FORMATTER
========================================================= */
const ZONA_WAKTU = "Asia/Jakarta"

const fmtHariTanggal = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: ZONA_WAKTU,
})

const fmtTanggalSingkatJam = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ZONA_WAKTU,
})

const fmtJam = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ZONA_WAKTU,
})

const fmtBulanSingkat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: ZONA_WAKTU,
})

function formatRentang(mulai: Date, selesai: Date) {
  return `${fmtTanggalSingkatJam.format(mulai)} – ${fmtTanggalSingkatJam.format(selesai)}`
}

function statusUjian(mulai: Date, selesai: Date) {
  const now = new Date()
  if (now < mulai) return { label: "Akan Datang", tone: "amber" as const }
  if (now > selesai) return { label: "Selesai", tone: "slate" as const }
  return { label: "Berlangsung", tone: "emerald" as const }
}

/* =========================================================
   HELPER DIAGRAM BATANG
   Menghasilkan path SVG untuk batang + garis tren.
========================================================= */
type BarDatum = {
  label: string
  value: number
  x: number
  y: number
  width: number
  height: number
}

function buildBarChart(data: { label: string; value: number }[]) {
  const width = 640
  const height = 240
  const padLeft = 42
  const padRight = 20
  const padTop = 30
  const padBottom = 36
  const gap = 16

  if (data.length === 0) {
    return {
      bars: [] as BarDatum[],
      linePath: "",
      width,
      height,
      yTicks: [] as number[],
      chartArea: { x: padLeft, y: padTop, w: width - padLeft - padRight, h: height - padTop - padBottom },
    }
  }

  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom
  const n = data.length
  const barWidth = Math.min(52, Math.max(28, (chartW - gap * (n - 1)) / n - 4))
  const totalBarWidth = n * barWidth + (n - 1) * gap
  const startX = padLeft + (chartW - totalBarWidth) / 2

  const maxValue = Math.max(...data.map((d) => d.value), 100)

  const bars: BarDatum[] = data.map((d, i) => {
    const x = startX + i * (barWidth + gap)
    const normalized = Math.min(d.value, maxValue) / maxValue
    const barHeight = normalized * chartH
    const y = padTop + chartH - barHeight

    return {
      label: d.label,
      value: d.value,
      x,
      y,
      width: barWidth,
      height: barHeight,
    }
  })

  // Garis tren melengkung (quadratic bezier)
  const points = bars.map((b) => ({ x: b.x + b.width / 2, y: b.y }))
  let linePath = ""
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const midX = (prev.x + curr.x) / 2
      linePath += ` Q ${midX} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`
      linePath += ` Q ${midX} ${curr.y} ${curr.x} ${curr.y}`
    }
  }

  const yTicks = [0, 25, 50, 75, 100]

  return {
    bars,
    linePath,
    width,
    height,
    yTicks,
    chartArea: { x: padLeft, y: padTop, w: chartW, h: chartH },
  }
}

/* =========================================================
   KOMPONEN DIAGRAM BATANG
========================================================= */
function BarChartStatistik({
  data,
  totalPeserta,
}: {
  data: { label: string; value: number }[]
  totalPeserta: number
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-[14px] border border-dashed border-[#e7e4dc] dark:border-white/10">
        <p className="text-[12.5px] text-[#8b93a6] dark:text-white/40">
          Belum ada data statistik. Buat ujian dan tunggu peserta selesai untuk melihat tren.
        </p>
      </div>
    )
  }

  if (data.length === 1) {
    return (
      <div className="flex h-56 items-center justify-center rounded-[14px] border border-dashed border-[#e7e4dc] dark:border-white/10">
        <p className="text-[12.5px] text-[#8b93a6] dark:text-white/40">
          Butuh minimal 2 ujian selesai untuk menampilkan tren.
        </p>
      </div>
    )
  }

  const { bars, linePath, width, height, yTicks, chartArea } = buildBarChart(data)

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-60 w-full min-w-[520px]">
        <defs>
          {/* Gradasi batang: ungu muda → ungu tua */}
          <linearGradient id="dashBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          {/* Gradasi garis tren */}
          <linearGradient id="dashLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Sumbu Y + garis grid */}
        {yTicks.map((tick) => {
          const y = chartArea.y + chartArea.h - (tick / 100) * chartArea.h
          return (
            <g key={tick}>
              <line
                x1={chartArea.x}
                y1={y}
                x2={chartArea.x + chartArea.w}
                y2={y}
                className="stroke-[#efece4] dark:stroke-white/10"
                strokeWidth="1"
                strokeDasharray={tick === 0 ? "0" : "3 3"}
              />
              <text
                x={chartArea.x - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-[#8b93a6] dark:fill-white/40"
                style={{ fontSize: "10px" }}
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Sumbu Y vertikal */}
        <line
          x1={chartArea.x}
          y1={chartArea.y}
          x2={chartArea.x}
          y2={chartArea.y + chartArea.h}
          className="stroke-[#d6d3cc] dark:stroke-white/20"
          strokeWidth="1.5"
        />

        {/* Batang */}
        {bars.map((bar, i) => (
          <g key={i}>
            {/* Shadow tipis di belakang */}
            <rect
              x={bar.x + 2}
              y={bar.y + 2}
              width={bar.width}
              height={bar.height}
              rx="6"
              className="fill-black/5 dark:fill-black/25"
            />
            {/* Batang dengan gradasi */}
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx="6"
              fill="url(#dashBarGradient)"
            />
            {/* Label nilai di atas batang */}
            <text
              x={bar.x + bar.width / 2}
              y={bar.y - 8}
              textAnchor="middle"
              className="fill-[#16233f] dark:fill-white"
              style={{ fontSize: "11px", fontWeight: 700 }}
            >
              {bar.value.toFixed(1)}
            </text>
            {/* Label bulan/tanggal di bawah batang */}
            <text
              x={bar.x + bar.width / 2}
              y={chartArea.y + chartArea.h + 18}
              textAnchor="middle"
              className="fill-[#8b93a6] dark:fill-white/40"
              style={{ fontSize: "10.5px" }}
            >
              {bar.label}
            </text>
          </g>
        ))}

        {/* Garis tren melengkung */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#dashLineGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Titik pada garis tren */}
        {bars.map((bar, i) => (
          <circle
            key={i}
            cx={bar.x + bar.width / 2}
            cy={bar.y}
            r="4.5"
            className="fill-white"
            stroke="#a855f7"
            strokeWidth="2.5"
          />
        ))}
      </svg>

      {/* Keterangan di bawah chart */}
      <div className="mt-1 flex items-center justify-between text-[11px] text-[#8b93a6] dark:text-white/40">
        <span>{data.length} ujian selesai</span>
        <span>{totalPeserta} peserta total</span>
      </div>
    </div>
  )
}

/* =========================================================
   HALAMAN
========================================================= */
export default async function BerandaGuruPage() {
  const guru = await requireGuruSession()

  const [ujianSaya, hasilSelesai, pelanggaranTerbaru, pesertaMengerjakan, hasilPerUjian] = await Promise.all([
    prisma.ujian.findMany({
      where: { pembuatId: guru.user.id },
      orderBy: { mulai: "desc" },
      include: { _count: { select: { soal: true, hasilUjian: true } } },
    }),
    prisma.hasilUjian.findMany({
      where: { ujian: { pembuatId: guru.user.id }, status: "SELESAI", skor: { not: null } },
      select: { skor: true },
    }),
    prisma.logPelanggaran.findMany({
      where: { hasilUjian: { ujian: { pembuatId: guru.user.id } } },
      orderBy: { waktu: "desc" },
      take: 5,
      include: { hasilUjian: { include: { user: true, ujian: true } } },
    }),
    prisma.hasilUjian.count({
      where: { ujian: { pembuatId: guru.user.id }, status: "SEDANG_DIKERJAKAN" },
    }),
    // Untuk diagram: rata-rata skor per ujian (yang sudah selesai)
    prisma.hasilUjian.groupBy({
      by: ["ujianId"],
      where: {
        ujian: { pembuatId: guru.user.id },
        status: "SELESAI",
        skor: { not: null },
      },
      _avg: { skor: true },
      _count: { id: true },
    }),
  ])

  const totalSoal = ujianSaya.reduce((sum, u) => sum + u._count.soal, 0)
  const rataRata = hasilSelesai.length
    ? Math.round((hasilSelesai.reduce((sum, h) => sum + (h.skor ?? 0), 0) / hasilSelesai.length) * 10) / 10
    : null

  const ujianTerbaru = ujianSaya.slice(0, 5)
  const namaDepan = (guru.user.name as string).trim().split(" ")[0] || "Guru"

  // Siapkan data diagram batang: rata-rata skor per ujian
  // Urutkan berdasarkan tanggal ujian (terlama → terbaru), ambil 6 terakhir
  const ujianMap = new Map(ujianSaya.map((u) => [u.id, u]))
  const dataStatistik = hasilPerUjian
    .map((h) => {
      const ujian = ujianMap.get(h.ujianId)
      if (!ujian) return null
      return {
        label: fmtBulanSingkat.format(ujian.mulai),
        value: Math.round((h._avg.skor ?? 0) * 10) / 10,
        tanggal: ujian.mulai,
      }
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime())
    .slice(-6)
    .map(({ label, value }) => ({ label, value }))

  const totalPesertaSeluruh = ujianSaya.reduce((sum, u) => sum + u._count.hasilUjian, 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12.5px] font-medium text-[#8b93a6] dark:text-white/40">
          {fmtHariTanggal.format(new Date())}
        </p>
        <h1 className="mt-1 text-[22px] font-semibold text-[#16233f] dark:text-white">
          Selamat datang, {namaDepan} 👋
        </h1>
        <p className="mt-1 text-[13px] text-[#5b657d] dark:text-white/50">
          Ringkasan aktivitas ujian yang Anda kelola.
        </p>
      </div>

      {/* ==================== STAT CARDS ==================== */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard iconImageSrc={STAT_ICON.ujianSaya} label="Ujian Saya" value={ujianSaya.length} tone="indigo" />
        <StatCard iconImageSrc={STAT_ICON.totalSoal} label="Total Soal" value={totalSoal} tone="emerald" />
        <StatCard
          iconImageSrc={STAT_ICON.sedangMengerjakan}
          label="Sedang Mengerjakan"
          value={pesertaMengerjakan}
          tone="amber"
        />
        <StatCard
          iconImageSrc={STAT_ICON.rataRata}
          label="Rata-rata Skor"
          value={rataRata !== null ? rataRata : "—"}
          hint={hasilSelesai.length ? `dari ${hasilSelesai.length} peserta selesai` : "belum ada data"}
          tone="slate"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* ==================== KARTU UJIAN TERBARU ==================== */}
        <Card variant="glass" className={`${GLASS_3D_CARD} lg:col-span-3`}>
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center drop-shadow-[0_12px_18px_rgba(49,46,129,0.3)]">
                <Image
                  src={SECTION_ICON.ujianTerbaru}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              </span>
              <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">Ujian Terbaru</h2>
            </div>
            <Link
              href="/ujian-guru"
              className="shrink-0 text-[12.5px] font-medium text-[#4338ca] hover:underline dark:text-[#818cf8]"
            >
              Lihat semua
            </Link>
          </div>

          <div className="relative mt-4 space-y-2.5">
            {ujianTerbaru.length === 0 && (
              <p className="rounded-[12px] bg-white/40 px-4 py-6 text-center text-[13px] text-[#8b93a6] backdrop-blur-sm dark:bg-white/5 dark:text-white/40">
                Anda belum membuat ujian apa pun.
              </p>
            )}

            {ujianTerbaru.map((ujian) => {
              const status = statusUjian(ujian.mulai, ujian.selesai)
              const subjectIconSrc = getSubjectIconSrc(ujian.judul)
              return (
                <Link
                  key={ujian.id}
                  href={`/ujian-guru/${ujian.id}`}
                  className="group flex items-center gap-3 rounded-[14px] border border-white/40 bg-white/35 px-3.5 py-3 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-[0_10px_24px_-14px_rgba(49,46,129,0.35)] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.08]"
                >
                  <Image
                    src={subjectIconSrc}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_10px_16px_rgba(49,46,129,0.25)] transition-transform duration-200 ease-out group-hover:-rotate-3 group-hover:scale-105"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-[#16233f] dark:text-white">
                      {ujian.judul}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[#8b93a6] dark:text-white/40">
                      {ujian._count.soal} soal · {ujian._count.hasilUjian} peserta ·{" "}
                      {formatRentang(ujian.mulai, ujian.selesai)}
                    </p>
                  </div>

                  <Badge tone={status.tone}>{status.label}</Badge>
                </Link>
              )
            })}
          </div>

          {/* ==================== DIAGRAM STATISTIK (DI BAWAH UJIAN TERBARU) ====================
              Diagram batang menampilkan tren rata-rata skor per ujian.
              Desain selaras dengan referensi: batang bergradasi + garis tren + label nilai.
          ================================================================================== */}
          <div className="relative mt-5 border-t border-white/40 pt-5 dark:border-white/10">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center drop-shadow-[0_8px_14px_rgba(168,85,247,0.35)]">
                  <Image
                    src={SECTION_ICON.statistik}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                </span>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#16233f] dark:text-white">
                    Statistik Tren Skor
                  </h3>
                  <p className="text-[11.5px] text-[#8b93a6] dark:text-white/40">
                    Rata-rata skor per ujian (6 terakhir)
                  </p>
                </div>
              </div>
              {dataStatistik.length > 0 && (
                <Badge tone="slate">{dataStatistik.length} ujian</Badge>
              )}
            </div>

            <BarChartStatistik data={dataStatistik} totalPeserta={totalPesertaSeluruh} />
          </div>
        </Card>

        {/* ==================== KARTU PELANGGARAN TERBARU ==================== */}
        <Card variant="glass" className={`${GLASS_3D_CARD} lg:col-span-2`}>
          <div className="relative flex items-center gap-2.5">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center drop-shadow-[0_12px_18px_rgba(181,47,47,0.3)]">
              <Image
                src={SECTION_ICON.pelanggaran}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
            </span>
            <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">Pelanggaran Terbaru</h2>
          </div>

          <div className="relative mt-4 space-y-2.5">
            {pelanggaranTerbaru.length === 0 && (
              <p className="rounded-[12px] bg-white/40 px-4 py-6 text-center text-[13px] text-[#8b93a6] backdrop-blur-sm dark:bg-white/5 dark:text-white/40">
                Tidak ada pelanggaran terbaru.
              </p>
            )}

            {pelanggaranTerbaru.map((log) => (
              <div
                key={log.id}
                className="rounded-[14px] border border-white/40 bg-white/35 px-3.5 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-medium text-[#16233f] dark:text-white">
                    {log.hasilUjian.user.nama}
                  </p>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] text-[#8b93a6] dark:text-white/40">
                    <IconClock className="h-3.5 w-3.5" />
                    {fmtJam.format(log.waktu)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11.5px] text-[#8b93a6] dark:text-white/40">
                  {log.hasilUjian.ujian.judul} · {log.tipe.replaceAll("_", " ").toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
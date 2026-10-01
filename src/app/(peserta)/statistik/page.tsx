import Image from "next/image"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
// NOTE: sesuaikan path import ini dengan lokasi file subject-icons.ts di proyek Anda
import { getSubjectIconSrc } from "@/lib/subject-icons"

export const dynamic = "force-dynamic"

/* =========================================================
   FORMAT & IKON LOKAL
========================================================= */

const formatTanggalPanjang = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value)

const formatTanggalSingkat = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(value)

/* =========================================================
   HELPER GRAFIK BATANG (SVG murni, statis di server)
========================================================= */

type BatangData = {
  x: number
  y: number
  width: number
  height: number
  skor: number
  tanggal: Date
  label: string
}

function buildBarChart(data: { tanggal: Date; skor: number }[]) {
  const width = 600
  const height = 220
  const padX = 30
  const padY = 30
  const barWidth = 40
  const gap = 15

  if (data.length === 0) {
    return { batang: [] as BatangData[], pathGaris: "", width, height, maxSkor: 100 }
  }

  const maxSkor = Math.max(...data.map((d) => d.skor), 100)
  const n = data.length
  const availableWidth = width - padX * 2
  const totalBarWidth = n * barWidth + (n - 1) * gap
  const startX = padX + (availableWidth - totalBarWidth) / 2

  const batang: BatangData[] = data.map((d, i) => {
    const x = startX + i * (barWidth + gap)
    const normalizedSkor = d.skor / maxSkor
    const barHeight = normalizedSkor * (height - padY * 2)
    const y = height - padY - barHeight

    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      skor: d.skor,
      tanggal: d.tanggal,
      label: `${d.skor.toFixed(1)}`,
    }
  })

  // Garis tren di atas batang
  const pathGaris = batang
    .map((b, i) => {
      const centerX = b.x + b.width / 2
      return `${i === 0 ? "M" : "L"} ${centerX.toFixed(1)} ${b.y.toFixed(1)}`
    })
    .join(" ")

  return { batang, pathGaris, width, height, maxSkor }
}

/* =========================================================
   HALAMAN
========================================================= */

export default async function StatistikPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  if (!userId) return null

  const sekarang = new Date()

  const hasilSelesai = await prisma.hasilUjian.findMany({
    where: { userId, status: "SELESAI" },
    include: { ujian: { select: { id: true, judul: true } } },
    orderBy: { waktuSelesai: "asc" },
  })

  const totalSelesai = hasilSelesai.length
  const skorList = hasilSelesai.map((hasil) => hasil.skor ?? 0)
  const rataRata = totalSelesai > 0 ? skorList.reduce((total, skor) => total + skor, 0) / totalSelesai : null
  const skorTertinggi = totalSelesai > 0 ? Math.max(...skorList) : null
  const skorTerendah = totalSelesai > 0 ? Math.min(...skorList) : null

  // Rata-rata kelas per ujian yang pernah diambil, untuk perbandingan
  const ujianIds = [...new Set(hasilSelesai.map((hasil) => hasil.ujianId))]
  const semuaHasilUjianTerkait =
    ujianIds.length > 0
      ? await prisma.hasilUjian.findMany({
          where: { ujianId: { in: ujianIds }, status: "SELESAI" },
          select: { ujianId: true, skor: true },
        })
      : []

  const rataKelasMap = new Map<string, number>()
  ujianIds.forEach((id) => {
    const skorUjianIni = semuaHasilUjianTerkait.filter((h) => h.ujianId === id).map((h) => h.skor ?? 0)
    const rata = skorUjianIni.length > 0 ? skorUjianIni.reduce((t, s) => t + s, 0) / skorUjianIni.length : 0
    rataKelasMap.set(id, rata)
  })

  const dataTren = hasilSelesai
    .filter((hasil) => hasil.waktuSelesai)
    .map((hasil) => ({ tanggal: hasil.waktuSelesai as Date, skor: hasil.skor ?? 0 }))

  const { batang, pathGaris, width, height } = buildBarChart(dataTren)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[12.5px] font-medium text-[#b45309] dark:text-amber-300">
          {formatTanggalPanjang(sekarang)}
        </p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f] dark:text-white">Statistik Belajar</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86] dark:text-white/50">
          Ringkasan performa Anda dari seluruh ujian yang telah diselesaikan.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Ujian diselesaikan"
          value={totalSelesai}
          tone="emerald"
          iconImageSrc="/image/icon/ujian-selesai.png"
        />
        <StatCard
          label="Rata-rata skor"
          value={rataRata === null ? "-" : rataRata.toFixed(1)}
          tone="blue"
          iconImageSrc="/image/icon/rata-rata-score.png"
        />
        <StatCard
          label="Skor tertinggi"
          value={skorTertinggi === null ? "-" : skorTertinggi.toFixed(1)}
          tone="amber"
          iconImageSrc="/image/icon/nilai-tertinggi-icon.png"
        />
        <StatCard
          label="Skor terendah"
          value={skorTerendah === null ? "-" : skorTerendah.toFixed(1)}
          tone="slate"
          iconImageSrc="/image/icon/nilai-terendah-icon.png"
        />
      </div>

      {totalSelesai === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[#e7e4dc] bg-white/60 px-4 py-14 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <p className="text-[14px] font-medium text-[#16233f] dark:text-white">Belum ada data statistik</p>
          <p className="mt-1 text-[13px] text-[#8b93a6] dark:text-white/40">
            Statistik akan muncul di sini setelah Anda menyelesaikan ujian pertama.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ===================== TREN SKOR (DIAGRAM BATANG) ===================== */}
          <Card className="flex flex-col gap-4 p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-[13.5px] font-semibold text-[#16233f] dark:text-white">Tren skor</p>
              <Badge tone="slate">{totalSelesai} ujian</Badge>
            </div>

            {batang.length < 2 ? (
              <div className="flex flex-1 items-center justify-center rounded-[12px] border border-dashed border-[#e7e4dc] py-10 dark:border-white/10">
                <p className="text-[12.5px] text-[#8b93a6] dark:text-white/40">
                  Selesaikan minimal 2 ujian untuk melihat tren skor.
                </p>
              </div>
            ) : (
              <>
                <div className="relative w-full overflow-x-auto">
                  <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full min-w-[500px]">
                    {/* Garis horizontal latar belakang */}
                    <line
                      x1="0"
                      y1={height - 30}
                      x2={width}
                      y2={height - 30}
                      className="stroke-[#efece4] dark:stroke-white/10"
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="30"
                      x2={width}
                      y2="30"
                      className="stroke-[#efece4] dark:stroke-white/10"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />

                    {/* Batang */}
                    {batang.map((b, i) => (
                      <g key={i}>
                        <rect
                          x={b.x}
                          y={b.y}
                          width={b.width}
                          height={b.height}
                          rx="4"
                          className="fill-[#c084fc] dark:fill-[#a855f7]"
                        />
                        {/* Label skor di atas batang */}
                        <text
                          x={b.x + b.width / 2}
                          y={b.y - 8}
                          textAnchor="middle"
                          className="fill-[#16233f] dark:fill-white text-[11px] font-semibold"
                        >
                          {b.label}
                        </text>
                      </g>
                    ))}

                    {/* Garis tren di atas batang */}
                    <path
                      d={pathGaris}
                      fill="none"
                      className="stroke-[#a855f7] dark:stroke-[#c084fc]"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Titik pada garis tren */}
                    {batang.map((b, i) => (
                      <circle
                        key={i}
                        cx={b.x + b.width / 2}
                        cy={b.y}
                        r="4"
                        className="fill-white stroke-[#a855f7] dark:stroke-[#c084fc]"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8b93a6] dark:text-white/40">
                  <span>{formatTanggalSingkat(batang[0].tanggal)}</span>
                  <span>{formatTanggalSingkat(batang[batang.length - 1].tanggal)}</span>
                </div>
              </>
            )}
          </Card>

          {/* ===================== PERBANDINGAN RATA-RATA KELAS ===================== */}
          <Card className="flex flex-col gap-1 p-4">
            <p className="mb-2 text-[13.5px] font-semibold text-[#16233f] dark:text-white">Vs rata-rata kelas</p>

            <div className="flex flex-col divide-y divide-[#efece4] dark:divide-white/10">
              {hasilSelesai
                .slice()
                .reverse()
                .slice(0, 6)
                .map((hasil) => {
                  const skorSaya = hasil.skor ?? 0
                  const rataKelas = rataKelasMap.get(hasil.ujianId) ?? 0
                  const delta = skorSaya - rataKelas
                  const diAtas = delta >= 0

                  return (
                    <div key={hasil.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Image
                          src={getSubjectIconSrc(hasil.ujian.judul)}
                          alt=""
                          width={28}
                          height={28}
                          className="h-7 w-7 shrink-0 object-contain"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-medium text-[#16233f] dark:text-white">
                            {hasil.ujian.judul}
                          </p>
                          <p className="text-[11px] text-[#8b93a6] dark:text-white/40">
                            Rata-rata kelas {rataKelas.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <Badge tone={diAtas ? "emerald" : "red"} className="shrink-0">
                        {diAtas ? "+" : ""}
                        {delta.toFixed(1)}
                      </Badge>
                    </div>
                  )
                })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
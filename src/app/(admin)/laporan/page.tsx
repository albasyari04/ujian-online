import Image from "next/image"
import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { getSubjectIconSrc } from "@/lib/subject-icons"

export const dynamic = "force-dynamic"

export default async function LaporanPage() {
  const [totalUjian, totalPengerjaan, selesai, rataRata, laporanUjian] = await Promise.all([
    prisma.ujian.count(),
    prisma.hasilUjian.count(),
    prisma.hasilUjian.count({ where: { status: "SELESAI" } }),
    prisma.hasilUjian.aggregate({ where: { status: "SELESAI" }, _avg: { skor: true } }),
    prisma.ujian.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { hasilUjian: true, soal: true } },
        hasilUjian: { where: { status: "SELESAI" }, select: { skor: true } },
      },
    }),
  ])

  const rataRataSkor = rataRata._avg.skor

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#b8863b]">Ujian Online</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f] dark:text-white">Laporan</h1>
        <p className="mt-1 text-[13px] text-[#5b657d] dark:text-white/50">
          Ringkasan performa ujian dan hasil pengerjaan peserta.
        </p>
      </div>

      {/* StatCard dengan iconImageSrc merender icon POLOS (tanpa card/box
          di belakangnya), memakai file 3D yang sudah disediakan. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          label="Total Ujian"
          value={totalUjian}
          iconImageSrc="/image/icon/total-ujian-icon.png"
          tone="emerald"
        />
        <StatCard
          label="Total Pengerjaan"
          value={totalPengerjaan}
          iconImageSrc="/image/icon/total-pengerjaan-icon.png"
          tone="blue"
        />
        <StatCard label="Sudah Selesai" value={selesai} iconImageSrc="/image/icon/selesai.png" tone="amber" />
        <StatCard
          label="Rata-rata Skor"
          value={rataRataSkor !== null ? rataRataSkor.toFixed(1) : "-"}
          iconImageSrc="/image/icon/rata-rata-score.png"
          tone="slate"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-[#edf0ef] px-5 py-4 dark:border-white/10">
          <h2 className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">Ringkasan per ujian</h2>
          <p className="mt-0.5 text-[12px] text-[#8b93a6] dark:text-white/40">
            Perbandingan jumlah peserta, soal, dan skor rata-rata. Geser ke kanan untuk melihat kolom lainnya.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-x-auto overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch] [touch-action:pan-x]">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="bg-[#f7f9f8] text-[11.5px] uppercase tracking-wide text-[#8b93a6] dark:bg-white/[0.03] dark:text-white/40">
                <tr>
                  <th className="px-5 py-3">Ujian</th>
                  <th className="px-5 py-3">Soal</th>
                  <th className="px-5 py-3">Peserta</th>
                  <th className="px-5 py-3">Selesai</th>
                  <th className="px-5 py-3">Rata-rata</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {laporanUjian.map((ujian) => {
                  const skor = ujian.hasilUjian.length
                    ? ujian.hasilUjian.reduce((total, hasil) => total + (hasil.skor ?? 0), 0) /
                      ujian.hasilUjian.length
                    : null
                  const iconSrc = getSubjectIconSrc(ujian.judul)
                  return (
                    <tr
                      key={ujian.id}
                      className="border-t border-[#f0f2f1] dark:border-white/[0.06]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Image
                            src={iconSrc}
                            alt=""
                            width={28}
                            height={28}
                            className="h-7 w-7 shrink-0 object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.18)]"
                          />
                          <span className="font-medium text-[#16233f] dark:text-white">{ujian.judul}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#5b657d] dark:text-white/50">{ujian._count.soal}</td>
                      <td className="px-5 py-3.5 text-[#5b657d] dark:text-white/50">{ujian._count.hasilUjian}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={ujian.hasilUjian.length ? "emerald" : "slate"}>{ujian.hasilUjian.length}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#5b657d] dark:text-white/50">
                        {skor !== null ? skor.toFixed(1) : "-"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/ujian/${ujian.id}/hasil`}
                          className="font-medium text-[#059669] hover:underline dark:text-[#6ee7b7]"
                        >
                          Detail hasil
                        </Link>
                      </td>
                    </tr>
                  )
                })}

                {laporanUjian.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-[#8b93a6] dark:text-white/40">
                      Belum ada data ujian untuk ditampilkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-[#101a30] sm:hidden"
            aria-hidden="true"
          />
        </div>
      </Card>
    </div>
  )
}
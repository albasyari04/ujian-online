import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export const dynamic = "force-dynamic"

export default async function LaporanPage() {
  const [totalUjian, totalPengerjaan, selesai, rataRata, laporanUjian] = await Promise.all([
    prisma.ujian.count(),
    prisma.hasilUjian.count(),
    prisma.hasilUjian.count({ where: { status: "SELESAI" } }),
    prisma.hasilUjian.aggregate({ where: { status: "SELESAI" }, _avg: { skor: true } }),
    prisma.ujian.findMany({ take: 12, orderBy: { createdAt: "desc" }, include: { _count: { select: { hasilUjian: true, soal: true } }, hasilUjian: { where: { status: "SELESAI" }, select: { skor: true } } } }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div><p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#b8863b]">Ujian Online</p><h1 className="mt-1 text-[26px] font-semibold text-[#16233f]">Laporan</h1><p className="mt-1 text-[13px] text-[#5b657d]">Ringkasan performa ujian dan hasil pengerjaan peserta.</p></div>

      {/* Diubah menjadi "grid-cols-2" di mobile (2 kanan-kiri, 2 ke bawah) supaya
          tiap card cukup lebar dan angkanya (value) tidak kepotong/hilang — sebelumnya
          4 kolom sekaligus di layar sempit membuat value ter-truncate. Dari breakpoint
          sm ke atas, layar sudah cukup lebar sehingga kembali ke 4 kolom sejajar. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard label="Total Ujian" value={totalUjian} icon={<span className="text-lg">Q</span>} tone="emerald" />
        <StatCard label="Total Pengerjaan" value={totalPengerjaan} icon={<span className="text-lg">#</span>} tone="blue" />
        <StatCard label="Sudah Selesai" value={selesai} icon={<span className="text-lg">✓</span>} tone="amber" />
        <StatCard label="Rata-rata Skor" value={rataRata._avg.skor !== null ? rataRata._avg.skor.toFixed(1) : "-"} icon={<span className="text-lg">↗</span>} tone="slate" />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-[#edf0ef] px-5 py-4">
          <h2 className="text-[14.5px] font-semibold text-[#16233f]">Ringkasan per ujian</h2>
          <p className="mt-0.5 text-[12px] text-[#8b93a6]">Perbandingan jumlah peserta, soal, dan skor rata-rata. Geser ke kanan untuk melihat kolom lainnya.</p>
        </div>

        {/* Rail scroll horizontal: overflow-x-auto sudah bisa di-swipe di HP,
            ditambah touch-action pan-x + smooth scroll agar gesture lebih responsif,
            dan fade gradient di tepi kanan sebagai penanda visual bahwa masih ada
            kolom lanjutan (SELESAI, RATA-RATA, AKSI) yang belum terlihat. */}
        <div className="relative">
          <div className="overflow-x-auto overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch] [touch-action:pan-x]">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="bg-[#f7f9f8] text-[11.5px] uppercase tracking-wide text-[#8b93a6]">
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
                    ? ujian.hasilUjian.reduce((total, hasil) => total + (hasil.skor ?? 0), 0) / ujian.hasilUjian.length
                    : null
                  return (
                    <tr key={ujian.id} className="border-t border-[#f0f2f1]">
                      <td className="px-5 py-3.5 font-medium text-[#16233f]">{ujian.judul}</td>
                      <td className="px-5 py-3.5 text-[#5b657d]">{ujian._count.soal}</td>
                      <td className="px-5 py-3.5 text-[#5b657d]">{ujian._count.hasilUjian}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={ujian.hasilUjian.length ? "emerald" : "slate"}>{ujian.hasilUjian.length}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#5b657d]">{skor !== null ? skor.toFixed(1) : "-"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/ujian/${ujian.id}/hasil`} className="font-medium text-[#059669] hover:underline">
                          Detail hasil
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Fade gradient penanda "masih bisa digeser" — hanya tampil di layar sempit (mobile),
              karena di layar lebar (sm ke atas) tabel biasanya sudah muat tanpa scroll. */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:hidden" aria-hidden="true" />
        </div>
      </Card>
    </div>
  )
}
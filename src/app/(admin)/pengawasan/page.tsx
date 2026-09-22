import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/Badge"
import { Card, StatCard } from "@/components/ui/Card"

const formatterWaktu = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

const labelPelanggaran: Record<string, string> = {
  PINDAH_TAB: "Pindah tab",
  KELUAR_FULLSCREEN: "Keluar fullscreen",
  KEHILANGAN_FOKUS: "Kehilangan fokus",
  COPY_PASTE: "Copy-paste",
  KLIK_KANAN: "Klik kanan",
  DEVTOOLS: "Membuka DevTools",
}

export const dynamic = "force-dynamic"

export default async function PengawasanPage() {
  const now = new Date()
  const [sedangMengerjakan, pelanggaran, totalPelanggaran] = await Promise.all([
    prisma.hasilUjian.findMany({
      where: { status: "SEDANG_DIKERJAKAN" },
      orderBy: { waktuMulai: "desc" },
      include: { user: { select: { nama: true, email: true } }, ujian: { select: { id: true, judul: true } } },
    }),
    prisma.logPelanggaran.findMany({
      take: 50,
      orderBy: { waktu: "desc" },
      include: { hasilUjian: { include: { user: { select: { nama: true } }, ujian: { select: { judul: true } } } } },
    }),
    prisma.logPelanggaran.count(),
  ])

  const pelanggaranHariIni = pelanggaran.filter((item) => item.waktu.toDateString() === now.toDateString()).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#b8863b]">Ujian Online</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f]">Pengawasan</h1>
        <p className="mt-1 text-[13px] text-[#5b657d]">Pantau peserta yang sedang mengerjakan ujian dan aktivitas mencurigakan.</p>
      </div>

      {/* Diubah dari "grid-cols-1 sm:grid-cols-3" menjadi "grid-cols-3" tetap
          agar ke-3 card selalu sejajar kanan-kiri, termasuk di layar mobile. */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          label="Sedang Mengerjakan"
          value={sedangMengerjakan.length}
          iconImageSrc="/image/icon/sedang-mengerjakan-icon.png"
          tone="emerald"
        />
        <StatCard
          label="Pelanggaran Hari Ini"
          value={pelanggaranHariIni}
          iconImageSrc="/image/icon/pelanggaran-hari-ini.png"
          tone="amber"
        />
        <StatCard
          label="Total Pelanggaran"
          value={totalPelanggaran}
          iconImageSrc="/image/icon/total-pelanggaran.png"
          tone="blue"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-[#edf0ef] px-5 py-4">
          <h2 className="text-[14.5px] font-semibold text-[#16233f]">Peserta aktif</h2>
          <p className="mt-0.5 text-[12px] text-[#8b93a6]">Sesi ujian yang saat ini masih berjalan.</p>
        </div>
        {sedangMengerjakan.length === 0 ? (
          <p className="px-5 py-12 text-center text-[13px] text-[#8b93a6]">Tidak ada peserta yang sedang mengerjakan ujian.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-[13px]"><thead className="bg-[#f7f9f8] text-[11.5px] uppercase tracking-wide text-[#8b93a6]"><tr><th className="px-5 py-3">Peserta</th><th className="px-5 py-3">Ujian</th><th className="px-5 py-3">Mulai</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{sedangMengerjakan.map((item) => <tr key={item.id} className="border-t border-[#f0f2f1]"><td className="px-5 py-3.5"><p className="font-medium text-[#16233f]">{item.user.nama}</p><p className="text-[11.5px] text-[#8b93a6]">{item.user.email}</p></td><td className="px-5 py-3.5 text-[#5b657d]">{item.ujian.judul}</td><td className="px-5 py-3.5 text-[#5b657d]">{formatterWaktu.format(item.waktuMulai)}</td><td className="px-5 py-3.5"><Badge tone="emerald">Aktif</Badge></td></tr>)}</tbody></table></div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#edf0ef] px-5 py-4"><div><h2 className="text-[14.5px] font-semibold text-[#16233f]">Log aktivitas terbaru</h2><p className="mt-0.5 text-[12px] text-[#8b93a6]">Periksa pelanggaran yang tercatat dari sesi ujian.</p></div><Link href="/laporan" className="text-[12.5px] font-medium text-[#059669] hover:underline">Lihat laporan</Link></div>
        {pelanggaran.length === 0 ? <p className="px-5 py-12 text-center text-[13px] text-[#8b93a6]">Belum ada aktivitas pelanggaran.</p> : <div className="divide-y divide-[#f0f2f1]">{pelanggaran.slice(0, 12).map((item) => <div key={item.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[13px] font-medium text-[#16233f]">{item.hasilUjian.user.nama} <span className="font-normal text-[#8b93a6]">pada {item.hasilUjian.ujian.judul}</span></p><p className="text-[11.5px] text-[#8b93a6]">{formatterWaktu.format(item.waktu)}</p></div><Badge tone="red">{labelPelanggaran[item.tipe] ?? item.tipe}</Badge></div>)}</div>}
      </Card>
    </div>
  )
}
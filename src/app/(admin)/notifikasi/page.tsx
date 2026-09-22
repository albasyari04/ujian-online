import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"

const formatterWaktu = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export const dynamic = "force-dynamic"

export default async function NotifikasiPage() {
  const [ujianMendatang, pelanggaranTerbaru] = await Promise.all([
    prisma.ujian.findMany({
      where: { mulai: { gte: new Date() } },
      take: 8,
      orderBy: { mulai: "asc" },
      select: { id: true, judul: true, mulai: true },
    }),
    prisma.logPelanggaran.findMany({
      take: 8,
      orderBy: { waktu: "desc" },
      include: { hasilUjian: { include: { user: { select: { nama: true } }, ujian: { select: { judul: true } } } } },
    }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div><p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#b8863b]">Ujian Online</p><h1 className="mt-1 text-[26px] font-semibold text-[#16233f]">Notifikasi</h1><p className="mt-1 text-[13px] text-[#5b657d]">Pembaruan penting dari aktivitas ujian dan pengawasan.</p></div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden"><div className="border-b border-[#edf0ef] px-5 py-4"><h2 className="text-[14.5px] font-semibold text-[#16233f]">Ujian akan datang</h2><p className="mt-0.5 text-[12px] text-[#8b93a6]">Jadwal ujian yang segera dimulai.</p></div>{ujianMendatang.length === 0 ? <p className="px-5 py-12 text-center text-[13px] text-[#8b93a6]">Tidak ada ujian terjadwal.</p> : <div className="divide-y divide-[#f0f2f1]">{ujianMendatang.map((ujian) => <Link key={ujian.id} href={`/ujian/${ujian.id}/hasil`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#f7f9f8]"><div><p className="text-[13px] font-medium text-[#16233f]">{ujian.judul}</p><p className="mt-0.5 text-[11.5px] text-[#8b93a6]">Mulai {formatterWaktu.format(ujian.mulai)}</p></div><Badge tone="blue">Terjadwal</Badge></Link>)}</div>}</Card>
        <Card className="overflow-hidden"><div className="border-b border-[#edf0ef] px-5 py-4"><h2 className="text-[14.5px] font-semibold text-[#16233f]">Pelanggaran terbaru</h2><p className="mt-0.5 text-[12px] text-[#8b93a6]">Aktivitas yang perlu ditinjau admin.</p></div>{pelanggaranTerbaru.length === 0 ? <p className="px-5 py-12 text-center text-[13px] text-[#8b93a6]">Belum ada notifikasi.</p> : <div className="divide-y divide-[#f0f2f1]">{pelanggaranTerbaru.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3.5"><div><p className="text-[13px] font-medium text-[#16233f]">{item.hasilUjian.user.nama}</p><p className="mt-0.5 text-[11.5px] text-[#8b93a6]">{item.hasilUjian.ujian.judul} · {formatterWaktu.format(item.waktu)}</p></div><Badge tone="red">Perlu ditinjau</Badge></div>)}</div>}</Card>
      </div>
    </div>
  )
}
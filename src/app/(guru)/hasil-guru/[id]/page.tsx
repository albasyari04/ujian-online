import { notFound } from "next/navigation"
import Link from "next/link"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IconArrowLeft } from "@/components/ui/Icons"

function formatTanggal(date: Date | null) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    date
  )
}

export default async function HasilDetailGuruPage({ params }: { params: { id: string } }) {
  const guru = await requireGuruSession()

  const ujian = await prisma.ujian.findFirst({
    where: { id: params.id, pembuatId: guru.id },
    include: {
      hasilUjian: {
        orderBy: { skor: "desc" },
        include: { user: true, logPelanggaran: true },
      },
    },
  })

  if (!ujian) notFound()

  const selesai = ujian.hasilUjian.filter((h) => h.status === "SELESAI")
  const rataRata = selesai.length
    ? Math.round((selesai.reduce((s, h) => s + (h.skor ?? 0), 0) / selesai.length) * 10) / 10
    : null

  return (
    <div className="space-y-5">
      <Link
        href="/hasil-guru"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5b657d] hover:text-[#4338ca] dark:text-white/50 dark:hover:text-[#818cf8]"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke Hasil & Nilai
      </Link>

      <Card className="p-5">
        <h1 className="text-[18px] font-semibold text-[#16233f] dark:text-white">{ujian.judul}</h1>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:max-w-md">
          <div className="rounded-[12px] bg-[#f7f9f8] p-3 text-center dark:bg-white/5">
            <p className="text-[18px] font-semibold text-[#16233f] dark:text-white">{ujian.hasilUjian.length}</p>
            <p className="text-[11px] text-[#8b93a6] dark:text-white/40">Peserta</p>
          </div>
          <div className="rounded-[12px] bg-[#f7f9f8] p-3 text-center dark:bg-white/5">
            <p className="text-[18px] font-semibold text-[#16233f] dark:text-white">{selesai.length}</p>
            <p className="text-[11px] text-[#8b93a6] dark:text-white/40">Selesai</p>
          </div>
          <div className="rounded-[12px] bg-[#f7f9f8] p-3 text-center dark:bg-white/5">
            <p className="text-[18px] font-semibold text-[#16233f] dark:text-white">{rataRata ?? "—"}</p>
            <p className="text-[11px] text-[#8b93a6] dark:text-white/40">Rata-rata</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#edf0ef] text-[11.5px] uppercase tracking-wide text-[#8b93a6] dark:border-white/10 dark:text-white/40">
              <th className="px-4 py-3 font-medium">Peserta</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Skor</th>
              <th className="px-4 py-3 font-medium">Pelanggaran</th>
              <th className="px-4 py-3 font-medium">Selesai</th>
            </tr>
          </thead>
          <tbody>
            {ujian.hasilUjian.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#8b93a6] dark:text-white/40">
                  Belum ada peserta yang mengerjakan.
                </td>
              </tr>
            )}
            {ujian.hasilUjian.map((h) => (
              <tr key={h.id} className="border-b border-[#edf0ef] last:border-0 dark:border-white/10">
                <td className="px-4 py-3 font-medium text-[#16233f] dark:text-white">{h.user.nama}</td>
                <td className="px-4 py-3">
                  <Badge tone={h.status === "SELESAI" ? "emerald" : "amber"}>
                    {h.status === "SELESAI" ? "Selesai" : "Mengerjakan"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[#34435f] dark:text-white/70">{h.skor ?? "—"}</td>
                <td className="px-4 py-3">
                  {h.logPelanggaran.length > 0 ? (
                    <Badge tone="red">{h.logPelanggaran.length}x</Badge>
                  ) : (
                    <span className="text-[#8b93a6] dark:text-white/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#8b93a6] dark:text-white/40">{formatTanggal(h.waktuSelesai)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

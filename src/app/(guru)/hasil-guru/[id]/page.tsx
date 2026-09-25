import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IconArrowLeft, IconUsers, IconCheckCircle, IconTrendingUp } from "@/components/ui/Icons"
import { getSubjectIconSrc } from "@/lib/subject-icons"

type SkorTone = "emerald" | "amber" | "red" | "slate"

function toneSkor(skor: number | null): SkorTone {
  if (skor === null) return "slate"
  if (skor >= 80) return "emerald"
  if (skor >= 60) return "amber"
  return "red"
}

function formatTanggal(date: Date | null) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    date
  )
}

function inisial(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("")
}

/** Ikon bintang lokal — dipakai khusus untuk stat "Nilai Tertinggi" di halaman ini. */
function IconStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 3.5L14.6 9.2L20.8 9.9L16.2 14.1L17.5 20.3L12 17.1L6.5 20.3L7.8 14.1L3.2 9.9L9.4 9.2L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default async function HasilDetailGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const guru = await requireGuruSession()
  const { id } = await params

  const ujian = await prisma.ujian.findFirst({
    where: { id: id, pembuatId: guru.user.id },
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
  const skorTertinggi = selesai.length ? Math.max(...selesai.map((h) => h.skor ?? 0)) : null

  return (
    <div className="space-y-5">
      <Link
        href="/hasil-guru"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5b657d] hover:text-[#4338ca] dark:text-white/50 dark:hover:text-[#818cf8]"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke Hasil & Nilai
      </Link>

      <Card className="relative overflow-hidden p-5">
        <span className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-[#4338ca]/[0.05] blur-2xl dark:bg-white/[0.04]" aria-hidden="true" />

        <div className="relative flex items-start gap-3.5">
          <Image
            src={getSubjectIconSrc(ujian.judul)}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_4px_6px_rgba(22,35,63,0.22)]"
          />
          <div className="min-w-0">
            <h1 className="text-[18px] font-semibold text-[#16233f] dark:text-white">{ujian.judul}</h1>
            <Badge tone={toneSkor(rataRata)} className="mt-1.5">
              {rataRata !== null ? `Rata-rata kelas ${rataRata}` : "Belum ada peserta selesai"}
            </Badge>
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<IconUsers className="h-5 w-5" />} label="Peserta" value={ujian.hasilUjian.length} tone="blue" />
          <StatCard icon={<IconCheckCircle className="h-5 w-5" />} label="Selesai" value={selesai.length} tone="emerald" />
          <StatCard icon={<IconTrendingUp className="h-5 w-5" />} label="Rata-rata" value={rataRata ?? "—"} tone="violet" />
          <StatCard icon={<IconStar className="h-5 w-5" />} label="Nilai Tertinggi" value={skorTertinggi ?? "—"} tone="amber" />
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[620px] text-left text-[13px]">
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
              <tr
                key={h.id}
                className="border-b border-[#edf0ef] transition-colors last:border-0 hover:bg-[#f7f9f8] dark:border-white/10 dark:hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-[11px] font-semibold text-white">
                      {inisial(h.user.nama)}
                    </span>
                    <span className="font-medium text-[#16233f] dark:text-white">{h.user.nama}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={h.status === "SELESAI" ? "emerald" : "amber"}>
                    {h.status === "SELESAI" ? "Selesai" : "Mengerjakan"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {h.skor !== null ? (
                    <Badge tone={toneSkor(h.skor)}>{h.skor}</Badge>
                  ) : (
                    <span className="text-[#8b93a6] dark:text-white/40">—</span>
                  )}
                </td>
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
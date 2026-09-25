import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IconArrowLeft } from "@/components/ui/Icons"
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
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function inisial(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("")
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
  const persentaseSelesai =
    ujian.hasilUjian.length > 0 ? Math.round((selesai.length / ujian.hasilUjian.length) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Tombol kembali */}
      <Link
        href="/hasil-guru"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5b657d] transition-colors hover:text-[#4338ca] dark:text-white/50 dark:hover:text-[#818cf8]"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke Hasil & Nilai
      </Link>

      {/* Kartu header ujian */}
      <Card variant="glass" className="relative overflow-hidden rounded-[24px] p-5 sm:p-6">
        <span
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.18),transparent_65%)]"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(129,199,253,0.12),transparent_65%)]"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="relative flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-indigo-500/15 blur-xl" />
            <Image
              src={getSubjectIconSrc(ujian.judul)}
              alt=""
              width={56}
              height={56}
              className="relative h-14 w-14 object-contain drop-shadow-[0_10px_18px_rgba(49,46,129,0.28)]"
            />
          </div>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-[19px] font-bold leading-tight text-[#16233f] dark:text-white sm:text-[22px]">
              {ujian.judul}
            </h1>
            <Badge tone={toneSkor(rataRata)} className="mt-2">
              {rataRata !== null ? `Rata-rata kelas ${rataRata}` : "Belum ada peserta selesai"}
            </Badge>
          </div>
        </div>

        {/* Statistik — pakai StatCard (gaya 3D) */}
        <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
          <StatCard
            iconImageSrc="/image/icon/total-peserta-icon.png"
            label="Peserta"
            value={ujian.hasilUjian.length}
            tone="blue"
          />
          <StatCard
            iconImageSrc="/image/icon/selesai-icon.png"
            label="Selesai"
            value={selesai.length}
            description={ujian.hasilUjian.length > 0 ? `${persentaseSelesai}% dari peserta` : undefined}
            tone="emerald"
          />
          <StatCard
            iconImageSrc="/image/icon/rata-rata-score.png"
            label="Rata-rata"
            value={rataRata ?? "—"}
            tone="violet"
          />
          <StatCard
            iconImageSrc="/image/icon/nilai-tertinggi-icon.png"
            label="Nilai Tertinggi"
            value={skorTertinggi ?? "—"}
            tone="amber"
          />
        </div>
      </Card>

      {/* Tabel peserta */}
      <Card variant="glass" className="overflow-hidden rounded-[20px] p-0">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf0ef] px-4 py-3.5 dark:border-white/10 sm:px-5">
          <div className="flex items-center gap-2.5">
            <Image
              src="/image/icon/daftar-peserta-icon.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain drop-shadow-[0_4px_8px_rgba(49,46,129,0.2)]"
            />
            <div>
              <h2 className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">
                Daftar Peserta
              </h2>
              <p className="text-[11.5px] text-[#8b93a6] dark:text-white/40">
                Diurutkan berdasarkan skor tertinggi
              </p>
            </div>
          </div>
          {ujian.hasilUjian.length > 0 && (
            <Badge tone="slate">{ujian.hasilUjian.length} peserta</Badge>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#edf0ef] text-[11px] uppercase tracking-wider text-[#8b93a6] dark:border-white/10 dark:text-white/40">
                <th className="px-4 py-3 font-semibold sm:px-5">Peserta</th>
                <th className="px-4 py-3 font-semibold sm:px-5">Status</th>
                <th className="px-4 py-3 font-semibold sm:px-5">Skor</th>
                <th className="px-4 py-3 font-semibold sm:px-5">Pelanggaran</th>
                <th className="px-4 py-3 font-semibold sm:px-5">Selesai</th>
              </tr>
            </thead>
            <tbody>
              {ujian.hasilUjian.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Image
                        src="/image/icon/daftar-peserta-icon.png"
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain opacity-60"
                      />
                      <p className="text-[13px] font-medium text-[#5b657d] dark:text-white/50">
                        Belum ada peserta yang mengerjakan.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {ujian.hasilUjian.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-[#edf0ef] transition-colors last:border-0 hover:bg-[#f7f9f8]/70 dark:border-white/10 dark:hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3.5 sm:px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-[11.5px] font-semibold text-white shadow-[0_4px_10px_-3px_rgba(67,56,202,0.5)]">
                        {inisial(h.user.nama)}
                      </span>
                      <span className="font-medium text-[#16233f] dark:text-white">{h.user.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <Badge tone={h.status === "SELESAI" ? "emerald" : "amber"}>
                      {h.status === "SELESAI" ? "Selesai" : "Mengerjakan"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    {h.skor !== null ? (
                      <Badge tone={toneSkor(h.skor)} className="font-semibold">
                        {h.skor}
                      </Badge>
                    ) : (
                      <span className="text-[#8b93a6] dark:text-white/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    {h.logPelanggaran.length > 0 ? (
                      <Badge tone="red">{h.logPelanggaran.length}x</Badge>
                    ) : (
                      <span className="text-[#8b93a6] dark:text-white/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-[#8b93a6] dark:text-white/40 sm:px-5">
                    {formatTanggal(h.waktuSelesai)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
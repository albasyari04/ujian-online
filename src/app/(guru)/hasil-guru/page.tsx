import Link from "next/link"
import Image from "next/image"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IconUsers, IconCheckCircle, IconTrendingUp, IconBook, IconChevronRight } from "@/components/ui/Icons"
// NOTE: sesuaikan path import ini dengan lokasi file subject-icons.ts di proyek Anda
import { getSubjectIconSrc } from "@/lib/subject-icons"

type SkorTone = "emerald" | "amber" | "red" | "slate"

function toneSkor(skor: number | null): SkorTone {
  if (skor === null) return "slate"
  if (skor >= 80) return "emerald"
  if (skor >= 60) return "amber"
  return "red"
}

export default async function HasilGuruPage() {
  const guru = await requireGuruSession()

  const ujian = await prisma.ujian.findMany({
    where: { pembuatId: guru.user.id },
    orderBy: { mulai: "desc" },
    include: { hasilUjian: { select: { skor: true, status: true } } },
  })

  const ringkasan = ujian.map((u) => {
    const selesai = u.hasilUjian.filter((h) => h.status === "SELESAI" && h.skor !== null)
    const rataRata = selesai.length
      ? Math.round((selesai.reduce((s, h) => s + (h.skor ?? 0), 0) / selesai.length) * 10) / 10
      : null
    return { ujian: u, peserta: u.hasilUjian.length, selesai: selesai.length, rataRata }
  })

  const totalPeserta = ringkasan.reduce((s, r) => s + r.peserta, 0)
  const totalSelesai = ringkasan.reduce((s, r) => s + r.selesai, 0)
  const semuaSkorSelesai = ringkasan.flatMap((r) =>
    r.ujian.hasilUjian.filter((h) => h.status === "SELESAI" && h.skor !== null).map((h) => h.skor as number)
  )
  const rataRataKeseluruhan = semuaSkorSelesai.length
    ? Math.round((semuaSkorSelesai.reduce((s, v) => s + v, 0) / semuaSkorSelesai.length) * 10) / 10
    : null

  return (
    <div className="space-y-6">
      {/* Ringkasan keseluruhan — ikon 3D asli, tanpa lingkaran gradient di belakangnya */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StatCard
          iconImageSrc="/image/icon/total-ujian-icon.png"
          label="Total Ujian"
          value={ujian.length}
          tone="indigo"
        />
        <StatCard
          iconImageSrc="/image/icon/total-peserta-icon.png"
          label="Total Peserta"
          value={totalPeserta}
          tone="blue"
        />
        <StatCard
          iconImageSrc="/image/icon/selesai-icon.png"
          label="Selesai Dikerjakan"
          value={totalSelesai}
          tone="emerald"
        />
        <StatCard
          iconImageSrc="/image/icon/rata-rata-score.png"
          label="Rata-rata Keseluruhan"
          value={rataRataKeseluruhan ?? "—"}
          tone="violet"
        />
      </div>

      {/* Label seksi daftar ujian */}
      <div className="flex items-center justify-between">
        <h2 className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">Daftar Ujian</h2>
        {ujian.length > 0 && <Badge tone="slate">{ujian.length} ujian</Badge>}
      </div>

      {ujian.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f5f7] text-[#8b93a6] dark:bg-white/5 dark:text-white/40">
            <IconBook className="h-5 w-5" />
          </span>
          <p className="text-[13.5px] font-medium text-[#5b657d] dark:text-white/50">Anda belum memiliki ujian.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ringkasan.map(({ ujian: u, peserta, selesai, rataRata }) => {
            const persentaseSelesai = peserta > 0 ? Math.round((selesai / peserta) * 100) : 0

            return (
              <Link key={u.id} href={`/hasil-guru/${u.id}`} className="block">
                <Card className="group relative flex flex-col gap-4 overflow-hidden bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_0_#e3e7ee,0_22px_34px_-16px_rgba(22,35,63,0.4)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_7px_0_#0d1424,0_24px_36px_-16px_rgba(0,0,0,0.68)]">
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]" aria-hidden="true" />
                  <span className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#16233f]/[0.04] blur-2xl dark:bg-white/[0.04]" aria-hidden="true" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Image
                        src={getSubjectIconSrc(u.judul)}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_3px_5px_rgba(22,35,63,0.22)] transition-transform duration-300 group-hover:-translate-y-0.5"
                      />
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-[14px] font-semibold text-[#16233f] dark:text-white">
                          {u.judul}
                        </h3>
                        <Badge tone={toneSkor(rataRata)} className="mt-1.5">
                          {rataRata !== null ? `Rata-rata ${rataRata}` : "Belum ada nilai"}
                        </Badge>
                      </div>
                    </div>
                    <IconChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#c3c9d6] transition-transform group-hover:translate-x-0.5 group-hover:text-[#4338ca] dark:text-white/20" />
                  </div>

                  <div className="relative grid grid-cols-3 gap-2 rounded-[12px] bg-[#f7f9f8] p-2.5 dark:bg-white/5">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <IconUsers className="h-3.5 w-3.5 text-[#8b93a6] dark:text-white/40" />
                      <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">{peserta}</p>
                      <p className="text-[10px] text-[#8b93a6] dark:text-white/40">Peserta</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-x border-[#edf0ef] text-center dark:border-white/10">
                      <IconCheckCircle className="h-3.5 w-3.5 text-[#8b93a6] dark:text-white/40" />
                      <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">{selesai}</p>
                      <p className="text-[10px] text-[#8b93a6] dark:text-white/40">Selesai</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <IconTrendingUp className="h-3.5 w-3.5 text-[#8b93a6] dark:text-white/40" />
                      <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">{rataRata ?? "—"}</p>
                      <p className="text-[10px] text-[#8b93a6] dark:text-white/40">Rata-rata</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between text-[10.5px] text-[#8b93a6] dark:text-white/40">
                      <span>Progres pengerjaan</span>
                      <span className="font-medium text-[#5b657d] dark:text-white/60">{persentaseSelesai}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#edf0ef] dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#818cf8] to-[#4338ca]"
                        style={{ width: `${persentaseSelesai}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
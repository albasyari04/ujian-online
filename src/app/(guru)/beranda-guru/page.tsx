import Link from "next/link"
import Image from "next/image"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/ui/StatCard"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { getSubjectIconSrc } from "@/lib/subject-icons"
import { IconClock } from "@/components/ui/Icons"

// Icon 3D untuk kartu ringkasan di atas — file disimpan di public/image/icon/
const STAT_ICON = {
  ujianSaya: "/image/icon/ujian-saya-icon.png",
  totalSoal: "/image/icon/total-soal-icon.png",
  sedangMengerjakan: "/image/icon/sedang-mengerjakan-icon.png",
  rataRata: "/image/icon/rata-rata-score.png",
}

// Icon 3D untuk header kartu ringkasan "Ujian Terbaru" & "Pelanggaran Terbaru"
const SECTION_ICON = {
  ujianTerbaru: "/image/icon/ujian-sedang-dikerjakan.png",
  pelanggaran: "/image/icon/pelanggaran-terbaru-icon.png",
}

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function statusUjian(mulai: Date, selesai: Date) {
  const now = new Date()
  if (now < mulai) return { label: "Akan Datang", tone: "amber" as const }
  if (now > selesai) return { label: "Selesai", tone: "slate" as const }
  return { label: "Berlangsung", tone: "emerald" as const }
}

export default async function BerandaGuruPage() {
  const guru = await requireGuruSession()

  const [ujianSaya, hasilSelesai, pelanggaranTerbaru, pesertaMengerjakan] = await Promise.all([
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
  ])

  const totalSoal = ujianSaya.reduce((sum, u) => sum + u._count.soal, 0)
  const rataRata = hasilSelesai.length
    ? Math.round((hasilSelesai.reduce((sum, h) => sum + (h.skor ?? 0), 0) / hasilSelesai.length) * 10) / 10
    : null

  const ujianTerbaru = ujianSaya.slice(0, 5)
  const namaDepan = (guru.user.name as string).trim().split(" ")[0] || "Guru"

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12.5px] font-medium text-[#8b93a6] dark:text-white/40">
          {new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date())}
        </p>
        <h1 className="mt-1 text-[22px] font-semibold text-[#16233f] dark:text-white">
          Selamat datang, {namaDepan} 👋
        </h1>
        <p className="mt-1 text-[13px] text-[#5b657d] dark:text-white/50">
          Ringkasan aktivitas ujian yang Anda kelola.
        </p>
      </div>

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
        <Card
          variant="glass"
          className="p-5 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_28px_52px_-26px_rgba(49,46,129,0.4)] ring-1 ring-white/60 ring-inset dark:ring-white/5 lg:col-span-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#c4b5fd] to-[#6d28d9] shadow-[0_8px_16px_-6px_rgba(109,40,217,0.5)] ring-1 ring-inset ring-black/5">
                <Image
                  src={SECTION_ICON.ujianTerbaru}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain drop-shadow-sm"
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

          <div className="mt-4 space-y-2.5">
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
                      {ujian._count.soal} soal · {ujian._count.hasilUjian} peserta · {formatTanggal(ujian.mulai)}
                    </p>
                  </div>

                  <Badge tone={status.tone}>{status.label}</Badge>
                </Link>
              )
            })}
          </div>
        </Card>

        <Card
          variant="glass"
          className="p-5 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_28px_52px_-26px_rgba(49,46,129,0.4)] ring-1 ring-white/60 ring-inset dark:ring-white/5 lg:col-span-2"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#fca5a5] to-[#b52f2f] shadow-[0_8px_16px_-6px_rgba(181,47,47,0.5)] ring-1 ring-inset ring-black/5">
              <Image
                src={SECTION_ICON.pelanggaran}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-contain drop-shadow-sm"
              />
            </span>
            <h2 className="text-[15px] font-semibold text-[#16233f] dark:text-white">Pelanggaran Terbaru</h2>
          </div>

          <div className="mt-4 space-y-2.5">
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
                    {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(log.waktu)}
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
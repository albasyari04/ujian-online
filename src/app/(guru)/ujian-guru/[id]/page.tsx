import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { getSubjectIconSrc } from "@/lib/subject-icons"
import { IconArrowLeft, IconUsers, IconDocument, IconClock } from "@/components/ui/Icons"
import { SoalManagerClient } from "./SoalManagerClient"

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function DetailUjianGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const guru = await requireGuruSession()
  const { id } = await params

  const ujian = await prisma.ujian.findFirst({
    where: { id, pembuatId: guru.user.id },
    include: {
      soal: { orderBy: { urutan: "asc" }, include: { opsi: { orderBy: { urutan: "asc" } } } },
      _count: { select: { hasilUjian: true } },
    },
  })

  if (!ujian) notFound()

  const totalPoin = ujian.soal.reduce((sum, s) => sum + s.poin, 0)
  const subjectIconSrc = getSubjectIconSrc(ujian.judul)

  return (
    <div className="space-y-6">
      {/* Tombol Kembali */}
      <Link
        href="/ujian-guru"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5b657d] transition-colors hover:text-[#4338ca] dark:text-white/50 dark:hover:text-[#818cf8]"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke Ujian Saya
      </Link>

      {/* Kartu Header Ujian - Glassmorphism 3D */}
      <div className="relative overflow-hidden rounded-[24px] border border-[#e7e4dc] bg-gradient-to-br from-white via-[#f8fafc] to-[#f1f5f9] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/10 dark:from-[#0d1526] dark:via-[#0d1526] dark:to-[#131b30] sm:p-8">
        {/* Dekorasi Background */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.15),transparent_65%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(129,199,253,0.12),transparent_65%)]"
        />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex items-start gap-5">
            {/* Ikon Subjek dengan efek 3D */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />
              <Image
                src={subjectIconSrc}
                alt=""
                width={64}
                height={64}
                className="relative h-16 w-16 object-contain drop-shadow-[0_12px_20px_rgba(49,46,129,0.3)] transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-[22px] font-bold leading-tight text-[#16233f] dark:text-white sm:text-[24px]">
                {ujian.judul}
              </h1>
              {ujian.deskripsi && (
                <p className="max-w-xl text-[13.5px] leading-relaxed text-[#5b657d] dark:text-white/50">
                  {ujian.deskripsi}
                </p>
              )}
              
              {/* Info Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2ff] px-3 py-1 text-[11.5px] font-medium text-[#4338ca] dark:bg-[#818cf8]/10 dark:text-[#818cf8]">
                  <IconClock className="h-3.5 w-3.5" />
                  {formatTanggal(ujian.mulai)} – {formatTanggal(ujian.selesai)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] px-3 py-1 text-[11.5px] font-medium text-[#166534] dark:bg-emerald-500/10 dark:text-emerald-400">
                  <IconDocument className="h-3.5 w-3.5" />
                  {ujian.soal.length} soal · {totalPoin} poin
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7ed] px-3 py-1 text-[11.5px] font-medium text-[#9a3412] dark:bg-orange-500/10 dark:text-orange-400">
                  <IconUsers className="h-3.5 w-3.5" />
                  {ujian._count.hasilUjian} peserta
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Lihat Hasil */}
          <Link href={`/hasil-guru/${ujian.id}`} className="shrink-0">
            <button className="group flex items-center gap-2 rounded-[12px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(67,56,202,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(67,56,202,0.6)] active:translate-y-0">
              Lihat Hasil & Nilai
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Manajer Soal */}
      <SoalManagerClient ujianId={ujian.id} soalAwal={ujian.soal} />
    </div>
  )
}
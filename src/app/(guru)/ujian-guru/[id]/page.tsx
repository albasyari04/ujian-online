import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { getSubjectIconSrc } from "@/lib/subject-icons"
import {
  IconArrowLeft,
  IconUsers,
  IconDocument,
  IconClock,
  IconChevronRight,
  IconSparkles,
} from "@/components/ui/Icons"
import { SoalManagerClient } from "./SoalManagerClient"
import { TombolRepairSkor } from "./TombolRepairSkor"

/* =========================================================
   FORMAT TANGGAL & JAM
   Format diperpendek: "28 Sep 2026, 03.37 – 05.15 WIB"
========================================================= */

const fmtTanggalSingkat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
})

const fmtJam = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
})

function formatRentangWaktu(mulai: Date, selesai: Date) {
  const tanggalSama =
    fmtTanggalSingkat.format(mulai) === fmtTanggalSingkat.format(selesai)

  if (tanggalSama) {
    return `${fmtTanggalSingkat.format(mulai)}, ${fmtJam.format(mulai)} – ${fmtJam.format(selesai)} WIB`
  }
  return `${fmtTanggalSingkat.format(mulai)}, ${fmtJam.format(mulai)} – ${fmtTanggalSingkat.format(selesai)}, ${fmtJam.format(selesai)} WIB`
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
  const jumlahPg = ujian.soal.filter((s) => s.tipe === "PILIHAN_GANDA").length
  const jumlahEssay = ujian.soal.length - jumlahPg

  return (
    <div className="space-y-6">
      {/* ==================== TOMBOL KEMBALI ==================== */}
      <Link
        href="/ujian-guru"
        className="group inline-flex items-center gap-2 rounded-full border border-[#e7e4dc] bg-white/80 px-4 py-2 text-[12.5px] font-medium text-[#5b657d] shadow-[0_2px_0_#eef0f4,0_8px_16px_-8px_rgba(22,35,63,0.2)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c7d2fe] hover:bg-[#eef2ff] hover:text-[#4338ca] hover:shadow-[0_3px_0_#dbe4f5,0_12px_20px_-8px_rgba(67,56,202,0.3)] dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-[#818cf8]/10 dark:hover:text-[#818cf8]"
      >
        <IconArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Kembali ke Ujian Saya
      </Link>

      {/* ==================== KARTU HEADER UJIAN (3D ELEGANT) ==================== */}
      <div className="group relative overflow-hidden rounded-[28px] border border-[#e7e4dc]/60 bg-gradient-to-br from-white via-[#f8fafc] to-[#f1f5f9] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_0_#e8ecf1,0_24px_48px_-20px_rgba(22,35,63,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_0_#e3e7ee,0_30px_56px_-20px_rgba(22,35,63,0.4)] dark:border-white/10 dark:from-[#0d1526] dark:via-[#0d1526] dark:to-[#131b30] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_0_#0a1220,0_24px_48px_-20px_rgba(0,0,0,0.6)] sm:p-8">
        {/* Dekorasi Background - Orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.22),transparent_65%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(129,199,253,0.18),transparent_65%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 right-1/3 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(192,132,252,0.12),transparent_65%)] blur-2xl"
        />

        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/[0.05]"
          aria-hidden="true"
        />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          {/* SISI KIRI: Icon + Judul + Info */}
          <div className="flex flex-1 items-start gap-5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-white to-[#eef2ff] shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(129,140,248,0.15),0_12px_24px_-8px_rgba(67,56,202,0.4)] dark:from-white/10 dark:to-white/[0.02] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_12px_24px_-8px_rgba(0,0,0,0.5)] sm:h-24 sm:w-24">
                <Image
                  src={subjectIconSrc}
                  alt=""
                  width={80}
                  height={80}
                  className="h-14 w-14 object-contain drop-shadow-[0_12px_20px_rgba(49,46,129,0.35)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 sm:h-16 sm:w-16"
                />
              </div>
              <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#fbbf24] to-[#d97706] text-white shadow-[0_4px_10px_-2px_rgba(217,119,6,0.6)]">
                <IconSparkles className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h1 className="text-[22px] font-bold leading-tight text-[#16233f] dark:text-white sm:text-[26px]">
                  {ujian.judul}
                </h1>
                {ujian.deskripsi && (
                  <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-[#5b657d] dark:text-white/50">
                    {ujian.deskripsi}
                  </p>
                )}
              </div>

              {/* Info Pills - 3D Style (format waktu diperpendek) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c7d2fe] bg-gradient-to-b from-[#eef2ff] to-[#dbe4f5] px-3 py-1.5 text-[11.5px] font-medium text-[#4338ca] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_0_#c7d2fe,0_4px_8px_-4px_rgba(67,56,202,0.3)] dark:border-[#818cf8]/30 dark:from-[#818cf8]/15 dark:to-[#818cf8]/5 dark:text-[#818cf8] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_0_rgba(129,140,248,0.2)]">
                  <IconClock className="h-3.5 w-3.5" />
                  {formatRentangWaktu(ujian.mulai, ujian.selesai)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a7f3d0] bg-gradient-to-b from-[#ecfdf5] to-[#d1fae5] px-3 py-1.5 text-[11.5px] font-medium text-[#047857] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_0_#a7f3d0,0_4px_8px_-4px_rgba(4,120,87,0.25)] dark:border-emerald-400/30 dark:from-emerald-400/15 dark:to-emerald-400/5 dark:text-emerald-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_0_rgba(16,185,129,0.2)]">
                  <IconDocument className="h-3.5 w-3.5" />
                  {ujian.soal.length} soal · {totalPoin} poin
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fed7aa] bg-gradient-to-b from-[#fff7ed] to-[#ffedd5] px-3 py-1.5 text-[11.5px] font-medium text-[#9a3412] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_0_#fed7aa,0_4px_8px_-4px_rgba(154,52,18,0.25)] dark:border-orange-400/30 dark:from-orange-400/15 dark:to-orange-400/5 dark:text-orange-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_0_rgba(249,115,22,0.2)]">
                  <IconUsers className="h-3.5 w-3.5" />
                  {ujian._count.hasilUjian} peserta
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1 text-[11.5px] text-[#8b93a6] dark:text-white/40">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-br from-[#818cf8] to-[#4338ca]" />
                  {jumlahPg} PG
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#d97706]" />
                  {jumlahEssay} Essay
                </span>
              </div>
            </div>
          </div>

          {/* ==================== SISI KANAN: Tombol Aksi ====================
              Ukuran selaras dengan tombol "Import soal" & "Tambah Soal" di section bawah:
              - px-4 py-2.5
              - text-[12.5px]
              - icon h-4 w-4
              - min-w-[180px] untuk konsistensi lebar
          ================================================================ */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[200px] lg:shrink-0">
            {/* Tombol Utama: Lihat Hasil & Nilai */}
            <Link href={`/hasil-guru/${ujian.id}`} className="w-full">
              <button className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[10px] bg-gradient-to-b from-[#818cf8] to-[#4338ca] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_0_#312e81,0_12px_20px_-8px_rgba(67,56,202,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_0_#312e81,0_16px_24px_-8px_rgba(67,56,202,0.6)] active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#312e81,0_4px_8px_-4px_rgba(67,56,202,0.5)]">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
                <span className="relative">Lihat Hasil & Nilai</span>
                <IconChevronRight className="relative h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </button>
            </Link>

            {/* Tombol Sekunder: Hitung Ulang Skor */}
            <TombolRepairSkor ujianId={ujian.id} />
          </div>
        </div>
      </div>

      {/* ==================== MANAJER SOAL ==================== */}
      <SoalManagerClient ujianId={ujian.id} soalAwal={ujian.soal} />
    </div>
  )
}
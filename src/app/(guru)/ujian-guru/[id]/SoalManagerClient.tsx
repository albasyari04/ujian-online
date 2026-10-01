"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import type { Soal, Opsi } from "@prisma/client"
import { ImportSoal, BACAAN_START, BACAAN_END, SOAL_START } from "@/components/admin/ImportSoal"
import { Card } from "@/components/ui/Card"
import {
  IconDocument,
  IconPencil,
  IconPlus,
  IconTrash,
  IconChevronRight,
  IconTrendingUp,
} from "@/components/ui/Icons"
import { TombolRepairSkor } from "./TombolRepairSkor"

/** Pisahkan bacaan & soal dari field "pertanyaan" */
function splitBacaanDanSoal(pertanyaan: string): { bacaan: string | null; soal: string } {
  if (!pertanyaan.includes(BACAAN_START)) return { bacaan: null, soal: pertanyaan }

  const startIdx = pertanyaan.indexOf(BACAAN_START)
  const endIdx = pertanyaan.indexOf(BACAAN_END)
  const soalIdx = pertanyaan.indexOf(SOAL_START)

  if (endIdx === -1) return { bacaan: null, soal: pertanyaan }

  const bacaan = pertanyaan.slice(startIdx + BACAAN_START.length, endIdx).trim()
  const soal =
    soalIdx !== -1
      ? pertanyaan.slice(soalIdx + SOAL_START.length).trim()
      : pertanyaan.slice(endIdx + BACAAN_END.length).trim()

  return { bacaan: bacaan || null, soal }
}

/* =========================================================
   TOMBOL PUTIH SERAGAM (tanpa efek 3D, tanpa shadow tebal)
   Dipakai untuk semua tombol aksi di header Bank Soal.
========================================================= */
const TOMBOL_PUTIH =
  "inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border border-[#e7e4dc] bg-white px-3 text-[12.5px] font-medium text-[#34435f] transition-colors duration-150 hover:border-[#c7d2fe] hover:bg-[#f8faff] hover:text-[#4338ca] dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-[#818cf8]/40 dark:hover:bg-[#818cf8]/10 dark:hover:text-[#818cf8]"

export function SoalManagerClient({
  ujianId,
  soalAwal,
}: {
  ujianId: string
  soalAwal: (Soal & { opsi: Opsi[] })[]
}) {
  const router = useRouter()
  const [daftarSoal, setDaftarSoal] = useState(soalAwal)

  function handleSuccess() {
    router.refresh()
    fetch(`/api/ujian/${ujianId}/soal`)
      .then((res) => res.json())
      .then((data) => setDaftarSoal(data))
      .catch(() => router.refresh())
  }

  async function handleDelete(soalId: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus soal ini?")) return

    const res = await fetch(`/api/ujian/${ujianId}/soal/${soalId}`, { method: "DELETE" })
    if (res.ok) {
      handleSuccess()
    }
  }

  return (
    <>
      {/* ==================== HEADER BANK SOAL ==================== */}
      <div className="space-y-4">
        {/* Judul Section */}
        <div>
          <h2 className="flex items-center gap-2 text-[18px] font-bold text-[#16233f] dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#eef2ff] text-[#4338ca] dark:bg-[#818cf8]/15 dark:text-[#818cf8]">
              <IconDocument className="h-4 w-4" />
            </span>
            Bank Soal Ujian Ini
          </h2>
          <p className="mt-1 ml-10 text-[12.5px] text-[#5b657d] dark:text-white/50">
            Kelola daftar pertanyaan untuk ujian ini.
          </p>
        </div>

        {/* ==================== GRID 4 TOMBOL PUTIH (RAPI KANAN-KIRI) ====================
            Layout:
            - Mobile: grid-cols-2 → 2 baris × 2 kolom (rapi kotak)
            - Desktop: grid-cols-4 → 1 baris × 4 kolom (sejajar)
            Semua tombol: warna putih, ukuran sama, tanpa efek 3D.
        ============================================================================== */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Tombol 1: Import Soal */}
          <ImportSoal
            ujianId={ujianId}
            onSuccess={handleSuccess}
            triggerClassName={TOMBOL_PUTIH}
          />

          {/* Tombol 2: Tambah Soal */}
          <Link href={`/ujian-guru/${ujianId}/soal/baru`} className={TOMBOL_PUTIH}>
            <IconPlus className="h-4 w-4" />
            <span>Tambah Soal</span>
          </Link>

          {/* Tombol 3: Lihat Hasil & Nilai */}
          <Link href={`/hasil-guru/${ujianId}`} className={TOMBOL_PUTIH}>
            <IconTrendingUp className="h-4 w-4" />
            <span className="truncate">Lihat Hasil</span>
            <IconChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Link>

          {/* Tombol 4: Hitung Ulang Skor (TANPA prop variant) */}
          <TombolRepairSkor ujianId={ujianId} />
        </div>
      </div>

      {/* ==================== DAFTAR SOAL ==================== */}
      {daftarSoal.length === 0 ? (
        <Card
          variant="glass"
          className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_16px_-6px_rgba(67,56,202,0.2)] dark:from-white/5 dark:to-white/[0.02]">
            <IconDocument className="h-8 w-8 text-[#818cf8]" />
          </div>
          <div>
            <p className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">Belum ada soal</p>
            <p className="mt-1 text-[12.5px] text-[#5b657d] dark:text-white/50">
              Tambahkan soal pertama untuk ujian ini.
            </p>
          </div>
          <Link href={`/ujian-guru/${ujianId}/soal/baru`} className={TOMBOL_PUTIH}>
            <IconPlus className="h-3.5 w-3.5" />
            Tambah Soal Pertama
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {daftarSoal.map((soal, i) => {
            const { bacaan, soal: teksSoal } = splitBacaanDanSoal(soal.pertanyaan)
            return (
              <Card
                key={soal.id}
                variant="glass"
                className="group relative flex flex-col gap-3 overflow-hidden rounded-[18px] border border-[#e7e4dc]/60 bg-gradient-to-br from-white via-[#f8fafc] to-[#f1f5f9] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_0_#e8ecf1,0_16px_28px_-16px_rgba(22,35,63,0.25)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_0_#e3e7ee,0_22px_34px_-16px_rgba(22,35,63,0.35)] dark:border-white/10 dark:from-[#0d1526] dark:via-[#0d1526] dark:to-[#131b30] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_0_#0a1220,0_16px_28px_-16px_rgba(0,0,0,0.5)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.15),transparent_65%)]" />

                {/* Header Soal */}
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#818cf8] to-[#4338ca] text-[13px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_0_#312e81,0_8px_14px_-4px_rgba(67,56,202,0.4)]">
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          soal.tipe === "PILIHAN_GANDA"
                            ? "bg-[#eef2ff] text-[#4338ca] dark:bg-[#818cf8]/15 dark:text-[#818cf8]"
                            : "bg-[#fef3c7] text-[#b45309] dark:bg-amber-500/15 dark:text-amber-400"
                        }`}
                      >
                        {soal.tipe === "PILIHAN_GANDA" ? "PG" : "Essay"}
                      </span>
                      <span className="rounded-full bg-gradient-to-b from-[#ecfdf5] to-[#d1fae5] px-2.5 py-1 text-[11px] font-semibold text-[#047857] shadow-[0_1px_0_#a7f3d0] dark:from-emerald-400/15 dark:to-emerald-400/5 dark:text-emerald-300">
                        {soal.poin} Poin
                      </span>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center gap-1.5 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                    <Link
                      href={`/ujian-guru/${ujianId}/soal/${soal.id}/edit`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4338ca] shadow-sm transition-all duration-200 hover:bg-[#eef2ff] dark:bg-white/10 dark:text-[#818cf8] dark:hover:bg-white/15"
                      aria-label="Edit soal"
                    >
                      <IconPencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(soal.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#d23b3b] shadow-sm transition-all duration-200 hover:bg-[#fef2f2] dark:bg-white/10 dark:text-red-400 dark:hover:bg-red-500/15"
                      aria-label="Hapus soal"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Card Bacaan */}
                {bacaan && (
                  <div className="relative rounded-[12px] border border-amber-200 bg-gradient-to-br from-amber-50/90 to-amber-100/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-amber-500/20 dark:from-amber-500/10 dark:to-amber-500/5">
                    <div className="mb-2 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-[#fbbf24] to-[#d97706] text-[10px] font-bold text-white shadow-[0_2px_4px_-1px_rgba(217,119,6,0.5)]">
                        B
                      </span>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                        Bacaan / Stimulus
                      </p>
                    </div>
                    <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-amber-900 dark:text-amber-100">
                      {bacaan}
                    </p>
                  </div>
                )}

                {/* Teks Soal */}
                <p className="relative text-[14.5px] leading-relaxed text-[#16233f] dark:text-white/90">
                  {teksSoal}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
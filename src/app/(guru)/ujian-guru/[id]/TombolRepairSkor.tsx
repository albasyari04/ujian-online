"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconSpinner, IconRefresh } from "@/components/ui/Icons"
import { repairSkorUjian } from "./actions"

export function TombolRepairSkor({ ujianId }: { ujianId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pesan, setPesan] = useState<{ tipe: "sukses" | "gagal"; teks: string } | null>(null)
  const [debug, setDebug] = useState<string[]>([])

  async function handleRepair() {
    if (
      !confirm(
        "Hitung ulang skor semua peserta berdasarkan bobot poin terbaru? Gunakan ini jika ada skor yang tidak sesuai setelah edit bobot."
      )
    ) {
      return
    }

    setLoading(true)
    setPesan(null)
    setDebug([])

    const hasil = await repairSkorUjian(ujianId)

    if (hasil.success) {
      setPesan({ tipe: "sukses", teks: hasil.message })
      if (hasil.debug) setDebug(hasil.debug)
      router.refresh()
    } else {
      setPesan({ tipe: "gagal", teks: hasil.message })
      if (hasil.debug) setDebug(hasil.debug)
    }

    setLoading(false)
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {/* Tombol Sekunder: UKURAN SELARAS dengan tombol "Import soal" & "Tambah Soal"
          - px-4 py-2.5, text-[12.5px], icon h-4 w-4 */}
      <button
        type="button"
        onClick={handleRepair}
        disabled={loading}
        className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[10px] border border-[#c7d2fe] bg-gradient-to-b from-white to-[#eef2ff] px-4 py-2.5 text-[12.5px] font-semibold text-[#4338ca] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_0_#c7d2fe,0_12px_20px_-8px_rgba(67,56,202,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a5b4fc] hover:from-[#f5f7ff] hover:to-[#e0e7ff] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_6px_0_#c7d2fe,0_16px_24px_-8px_rgba(67,56,202,0.4)] active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_0_#c7d2fe,0_4px_8px_-4px_rgba(67,56,202,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-[#818cf8]/40 dark:from-white/5 dark:to-[#818cf8]/10 dark:text-[#a5b4fc] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_0_rgba(129,140,248,0.25),0_12px_20px_-8px_rgba(0,0,0,0.5)] dark:hover:from-white/10 dark:hover:to-[#818cf8]/15"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/[0.06]" />
        {loading ? (
          <>
            <IconSpinner className="relative h-4 w-4 animate-spin" />
            <span className="relative">Menghitung ulang...</span>
          </>
        ) : (
          <>
            <IconRefresh className="relative h-4 w-4 transition-transform duration-500 group-hover/btn:rotate-180" />
            <span className="relative">Hitung Ulang Skor Peserta</span>
          </>
        )}
      </button>

      {pesan && (
        <div
          className={`flex items-start gap-2 rounded-[10px] border px-3 py-2 text-[11.5px] ${
            pesan.tipe === "sukses"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          }`}
        >
          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
          <p className="flex-1">{pesan.teks}</p>
        </div>
      )}

      {debug.length > 0 && (
        <div className="mt-1 max-h-48 overflow-auto rounded-[10px] border border-amber-200 bg-amber-50/80 p-2.5 text-[10px] leading-relaxed text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="mb-1 font-bold text-[10.5px]">🔍 Debug:</p>
          {debug.map((d, i) => (
            <p key={i} className="border-t border-amber-200/50 py-0.5 break-all first:border-0 first:pt-0">
              {d}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
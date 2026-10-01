"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconSpinner, IconRefresh } from "@/components/ui/Icons"
import { repairSkorUjian } from "./actions"

/* =========================================================
   TOMBOL PUTIH SERAGAM (tanpa efek 3D, tanpa shadow tebal)
========================================================= */
const TOMBOL_PUTIH =
  "inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border border-[#e7e4dc] bg-white px-3 text-[12.5px] font-medium text-[#34435f] transition-colors duration-150 hover:border-[#c7d2fe] hover:bg-[#f8faff] hover:text-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-[#818cf8]/40 dark:hover:bg-[#818cf8]/10 dark:hover:text-[#818cf8]"

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
    <>
      <button
        type="button"
        onClick={handleRepair}
        disabled={loading}
        className={TOMBOL_PUTIH}
      >
        {loading ? (
          <>
            <IconSpinner className="h-4 w-4 animate-spin" />
            <span>Menghitung...</span>
          </>
        ) : (
          <>
            <IconRefresh className="h-4 w-4" />
            <span className="truncate">Hitung Ulang Skor</span>
          </>
        )}
      </button>

      {/* Notifikasi & debug di bawah grid, muncul sebagai baris terpisah */}
      {(pesan || debug.length > 0) && (
        <div className="col-span-2 mt-1 space-y-2 sm:col-span-4">
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
            <div className="max-h-48 overflow-auto rounded-[10px] border border-amber-200 bg-amber-50/80 p-2.5 text-[10px] leading-relaxed text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              <p className="mb-1 font-bold text-[10.5px]">🔍 Debug:</p>
              {debug.map((d, i) => (
                <p key={i} className="border-t border-amber-200/50 py-0.5 break-all first:border-0 first:pt-0">
                  {d}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
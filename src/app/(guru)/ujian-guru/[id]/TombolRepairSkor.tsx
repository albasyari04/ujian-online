"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconSpinner } from "@/components/ui/Icons"
import { repairSkorUjian } from "./actions"

export function TombolRepairSkor({ ujianId }: { ujianId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pesan, setPesan] = useState<{ tipe: "sukses" | "gagal"; teks: string } | null>(null)

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

    const hasil = await repairSkorUjian(ujianId)

    if (hasil.success) {
      setPesan({ tipe: "sukses", teks: hasil.message })
      router.refresh()
    } else {
      setPesan({ tipe: "gagal", teks: hasil.message })
    }

    setLoading(false)
    setTimeout(() => setPesan(null), 5000)
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleRepair}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-br from-[#f59e0b] to-[#b45309] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(180,83,9,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(180,83,9,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <IconSpinner className="h-4 w-4 animate-spin" />
            Menghitung ulang...
          </>
        ) : (
          <>🔄 Hitung Ulang Skor Peserta</>
        )}
      </button>

      {pesan && (
        <p
          className={`text-[12px] ${
            pesan.tipe === "sukses"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {pesan.teks}
        </p>
      )}
    </div>
  )
}
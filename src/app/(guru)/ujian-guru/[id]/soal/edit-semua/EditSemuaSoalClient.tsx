"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  IconSpinner,
  IconCheckCircle,
  IconAlertTriangle,
  IconCalculator,
} from "@/components/ui/Icons"

type TipeSoal = "PILIHAN_GANDA" | "ESSAY"

type Opsi = { id: string; teks: string; benar: boolean }

type SoalItem = {
  id: string
  pertanyaan: string
  tipe: TipeSoal
  poin: number
  opsi: Opsi[]
}

type Props = {
  ujianId: string
  totalSoal: number
  initialSoal: SoalItem[]
}

export function EditSemuaSoalClient({ ujianId, totalSoal, initialSoal }: Props) {
  const router = useRouter()
  const [soal, setSoal] = useState<SoalItem[]>(initialSoal)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Update poin per soal
  function ubahPoin(soalId: string, newPoin: number) {
    setSoal((prev) =>
      prev.map((s) => (s.id === soalId ? { ...s, poin: newPoin } : s))
    )
  }

  // Update pertanyaan
  function ubahPertanyaan(soalId: string, newPertanyaan: string) {
    setSoal((prev) =>
      prev.map((s) => (s.id === soalId ? { ...s, pertanyaan: newPertanyaan } : s))
    )
  }

  // Update opsi (teks)
  function ubahOpsi(soalId: string, opsiId: string, newTeks: string) {
    setSoal((prev) =>
      prev.map((s) =>
        s.id === soalId
          ? {
              ...s,
              opsi: s.opsi.map((o) =>
                o.id === opsiId ? { ...o, teks: newTeks } : o
              ),
            }
          : s
      )
    )
  }

  function pilihJawabanBenar(soalId: string, opsiId: string) {
    setSoal((prev) =>
      prev.map((s) =>
        s.id === soalId
          ? {
              ...s,
              opsi: s.opsi.map((o) => ({ ...o, benar: o.id === opsiId })),
            }
          : s
      )
    )
  }

  // ================= AUTO BOBOT =================
  function hitungAutoBobot() {
    if (totalSoal <= 0) {
      alert("Tidak ada soal untuk dihitung.")
      return
    }
    const bobotIdeal = 100 / totalSoal
    const bobotFinal = Number.isInteger(bobotIdeal)
      ? bobotIdeal
      : Number(bobotIdeal.toFixed(2))

    setSoal((prev) => prev.map((s) => ({ ...s, poin: bobotFinal })))
    setSuccess(
      `Auto Bobot diterapkan: setiap soal bernilai ${bobotFinal} poin (100 ÷ ${totalSoal}).`
    )
    setTimeout(() => setSuccess(null), 4000)
  }

  // ================= SIMPAN SEMUA =================
  async function simpanSemua() {
    if (!confirm("Simpan perubahan untuk SEMUA soal? Tindakan ini akan menimpa data sebelumnya dan menghitung ulang skor semua peserta.")) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/ujian/${ujianId}/bulk-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soal: soal.map((s) => ({
            id: s.id,
            pertanyaan: s.pertanyaan,
            tipe: s.tipe,
            poin: s.poin,
            opsi:
              s.tipe === "PILIHAN_GANDA"
                ? s.opsi.map((o) => ({ 
                    id: o.id,      // <-- KIRIM ID OPSI (INI KUNCI PERBAIKANNYA)
                    teks: o.teks, 
                    benar: o.benar 
                  }))
                : undefined,
          })),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message ?? "Gagal menyimpan.")

      setSuccess(`Semua soal berhasil disimpan! ${data.jumlahPesertaDiupdate ? `${data.jumlahPesertaDiupdate} peserta telah dihitung ulang skornya.` : ""}`)
      router.refresh()
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* TOOLBAR */}
      <div className="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#e7e4dc] bg-white/95 p-4 shadow-[0_4px_12px_-4px_rgba(22,35,63,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-[#101a30]/95">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#16233f] dark:text-white/80">
            {soal.length} Soal
          </span>
          <span className="rounded-full bg-[#eef2ff] px-2.5 py-0.5 text-[11px] font-bold text-[#4338ca] dark:bg-[#4338ca]/20 dark:text-[#818cf8]">
            {soal.filter((s) => s.tipe === "PILIHAN_GANDA").length} PG
          </span>
          <span className="rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[11px] font-bold text-[#b45309] dark:bg-amber-500/20 dark:text-amber-400">
            {soal.filter((s) => s.tipe === "ESSAY").length} Essay
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={hitungAutoBobot}
            title={`Hitung otomatis: 100 / ${totalSoal} soal`}
            className="inline-flex items-center gap-1.5 rounded-[12px] bg-gradient-to-br from-[#34d399] to-[#059669] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(5,150,105,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(5,150,105,0.6)]"
          >
            <IconCalculator className="h-4 w-4" />
            Auto Bobot
          </button>

          <button
            type="button"
            onClick={simpanSemua}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-[12px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(67,56,202,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(67,56,202,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <IconSpinner className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <IconCheckCircle className="h-4 w-4" />
                Simpan Semua
              </>
            )}
          </button>
        </div>
      </div>

      {/* NOTIFIKASI */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-[12px] border border-red-200 bg-red-50 p-3.5 text-[13px] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 rounded-[12px] border border-emerald-200 bg-emerald-50 p-3.5 text-[13px] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          <IconCheckCircle className="h-4 w-4 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* DAFTAR SOAL */}
      <div className="space-y-3">
        {soal.map((s, idx) => (
          <div
            key={s.id}
            className="rounded-[18px] border border-[#e7e4dc] bg-white p-4 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_8px_20px_-12px_rgba(49,46,129,0.2)] transition-all hover:shadow-[0_4px_16px_-6px_rgba(49,46,129,0.3)] dark:border-white/10 dark:bg-[#101a30] sm:p-5"
          >
            {/* Header soal */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-[12px] font-bold text-white shadow-[0_4px_10px_-2px_rgba(67,56,202,0.5)]">
                  {idx + 1}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    s.tipe === "PILIHAN_GANDA"
                      ? "bg-[#eef2ff] text-[#4338ca] dark:bg-[#4338ca]/20 dark:text-[#818cf8]"
                      : "bg-[#fef3c7] text-[#b45309] dark:bg-amber-500/20 dark:text-amber-400"
                  }`}
                >
                  {s.tipe === "PILIHAN_GANDA" ? "PG" : "Essay"}
                </span>
              </div>

              {/* Input Poin */}
              <div className="flex items-center gap-2">
                <label className="text-[11.5px] font-semibold text-[#5b657d] dark:text-white/50">
                  Poin:
                </label>
                <input
                  type="number"
                  min={0.1}
                  step="0.01"
                  value={s.poin}
                  onChange={(e) => ubahPoin(s.id, Number(e.target.value))}
                  className="w-20 rounded-[10px] border border-[#e7e4dc] bg-[#fdfdfd] px-2.5 py-1.5 text-[12.5px] font-semibold text-[#34435f] shadow-sm focus:border-[#818cf8] focus:outline-none focus:ring-2 focus:ring-[#818cf8]/20 dark:border-white/10 dark:bg-[#0d1526] dark:text-white/80"
                />
              </div>
            </div>

            {/* Textarea Pertanyaan */}
            <textarea
              value={s.pertanyaan}
              onChange={(e) => ubahPertanyaan(s.id, e.target.value)}
              rows={2}
              className="mt-3 w-full resize-y rounded-[12px] border border-[#e7e4dc] bg-[#fdfdfd] p-3 text-[13px] text-[#34435f] shadow-inner focus:border-[#818cf8] focus:outline-none focus:ring-2 focus:ring-[#818cf8]/20 dark:border-white/10 dark:bg-[#0d1526] dark:text-white/80"
            />

            {/* Opsi Jawaban (hanya PG) */}
            {s.tipe === "PILIHAN_GANDA" && (
              <div className="mt-3 space-y-2">
                {s.opsi.map((o, oIdx) => (
                  <div
                    key={o.id}
                    className={`flex items-center gap-2 rounded-[10px] border p-2 transition-all ${
                      o.benar
                        ? "border-[#818cf8] bg-[#f5f3ff] dark:border-[#818cf8]/50 dark:bg-[#818cf8]/10"
                        : "border-[#e7e4dc] bg-white dark:border-white/10 dark:bg-white/5"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => pilihJawabanBenar(s.id, o.id)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-bold transition-all ${
                        o.benar
                          ? "bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_2px_6px_-1px_rgba(67,56,202,0.5)]"
                          : "bg-[#f7f9f8] text-[#8b93a6] hover:bg-[#eef2ff] dark:bg-white/10 dark:text-white/40"
                      }`}
                    >
                      {o.benar ? (
                        <IconCheckCircle className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(65 + oIdx)
                      )}
                    </button>
                    <input
                      type="text"
                      value={o.teks}
                      onChange={(e) => ubahOpsi(s.id, o.id, e.target.value)}
                      className="w-full bg-transparent px-1 text-[12.5px] text-[#34435f] focus:outline-none dark:text-white/80"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BOTTOM ACTION */}
      <div className="flex justify-end border-t border-[#edf0ef] pt-5 dark:border-white/10">
        <button
          type="button"
          onClick={simpanSemua}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] px-8 py-3 text-[13.5px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(67,56,202,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(67,56,202,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <IconSpinner className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <IconCheckCircle className="h-4 w-4" />
              Simpan Semua Perubahan
            </>
          )}
        </button>
      </div>
    </div>
  )
}
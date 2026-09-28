"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"

import {
  IconSpinner,
  IconTrash,
  IconPlus,
  IconCheckCircle, // <-- Diperbaiki (sebelumnya IconCheck)
  IconAlertTriangle, // <-- Diperbaiki (sebelumnya IconAlertCircle)
} from "@/components/ui/Icons"

type TipeSoal = "PILIHAN_GANDA" | "ESSAY"

type OpsiAwal = { id?: string; teks: string; benar: boolean }

export type SoalAwal = {
  id?: string
  pertanyaan: string
  tipe: TipeSoal
  poin: number
  opsi: OpsiAwal[]
}

let counterOpsiSementara = 0
function idOpsiSementara() {
  counterOpsiSementara += 1
  return `sementara-${counterOpsiSementara}`
}

function opsiKosong(): Required<Pick<OpsiAwal, "teks" | "benar">> & { key: string } {
  return { key: idOpsiSementara(), teks: "", benar: false }
}

/**
 * Form soal versi halaman penuh (bukan modal).
 * Dipakai di route `/soal/baru` dan `/soal/[soalId]/edit`.
 */
export function FormSoalPage({
  ujianId,
  initialData,
  redirectTo,
}: {
  ujianId: string
  initialData?: SoalAwal
  /** URL tujuan setelah simpan/batal. */
  redirectTo: string
}) {
  const router = useRouter()
  const mode = initialData?.id ? "edit" : "create"

  const [pertanyaan, setPertanyaan] = useState(initialData?.pertanyaan ?? "")
  const [tipe, setTipe] = useState<TipeSoal>(initialData?.tipe ?? "PILIHAN_GANDA")
  const [poin, setPoin] = useState(String(initialData?.poin ?? 1))
  const [opsi, setOpsi] = useState(() => {
    const awal = initialData?.opsi?.map((o) => ({
      key: o.id ?? idOpsiSementara(),
      teks: o.teks,
      benar: o.benar,
    }))
    return awal && awal.length > 0 ? awal : [opsiKosong(), opsiKosong()]
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function tambahOpsi() {
    setOpsi((prev) => [...prev, opsiKosong()])
  }

  function hapusOpsi(key: string) {
    if (opsi.length <= 2) return
    setOpsi((prev) => prev.filter((o) => o.key !== key))
  }

  function ubahTeksOpsi(key: string, teks: string) {
    setOpsi((prev) => prev.map((o) => (o.key === key ? { ...o, teks } : o)))
  }

  function pilihJawabanBenar(key: string) {
    setOpsi((prev) => prev.map((o) => ({ ...o, benar: o.key === key })))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const url =
        mode === "create"
          ? `/api/ujian/${ujianId}/soal`
          : `/api/ujian/${ujianId}/soal/${initialData!.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pertanyaan,
          tipe,
          poin: Number(poin),
          opsi:
            tipe === "PILIHAN_GANDA"
              ? opsi.map(({ teks, benar }) => ({ teks, benar }))
              : undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.message ?? "Gagal menyimpan soal.")
        return
      }

      // Refresh cache server, lalu kembali ke halaman detail ujian
      router.refresh()
      router.push(redirectTo)
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2.5 rounded-[12px] border border-red-200 bg-red-50 p-3.5 text-[13px] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* ================= PERTANYAAN ================= */}
      <div className="space-y-2">
        <label className="text-[13px] font-semibold text-[#16233f] dark:text-white/80">
          Pertanyaan <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <textarea
            value={pertanyaan}
            onChange={(e) => setPertanyaan(e.target.value)}
            required
            rows={4}
            placeholder="Tulis pertanyaan soal di sini..."
            className="w-full resize-y rounded-[14px] border border-[#e7e4dc] bg-[#fdfdfd] p-4 text-[13.5px] text-[#34435f] shadow-inner transition-all placeholder:text-[#a0aec0] focus:border-[#818cf8] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#818cf8]/10 dark:border-white/10 dark:bg-[#0d1526] dark:text-white/80 dark:placeholder:text-white/30 dark:focus:border-[#818cf8] dark:focus:bg-[#0d1526]"
          />
        </div>
      </div>

      {/* ================= TIPE & POIN ================= */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-[#16233f] dark:text-white/80">Tipe Soal</label>
          <div className="relative">
            <select
              value={tipe}
              onChange={(e) => setTipe(e.target.value as TipeSoal)}
              className="w-full appearance-none rounded-[14px] border border-[#e7e4dc] bg-[#fdfdfd] px-4 py-3 text-[13.5px] text-[#34435f] shadow-sm transition-all focus:border-[#818cf8] focus:outline-none focus:ring-4 focus:ring-[#818cf8]/10 dark:border-white/10 dark:bg-[#0d1526] dark:text-white/80"
            >
              <option value="PILIHAN_GANDA">Pilihan Ganda</option>
              <option value="ESSAY">Essay</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8b93a6]">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-[#16233f] dark:text-white/80">Poin / Bobot Nilai</label>
          <input
            type="number"
            min={1}
            value={poin}
            onChange={(e) => setPoin(e.target.value)}
            required
            className="w-full rounded-[14px] border border-[#e7e4dc] bg-[#fdfdfd] px-4 py-3 text-[13.5px] text-[#34435f] shadow-sm transition-all focus:border-[#818cf8] focus:outline-none focus:ring-4 focus:ring-[#818cf8]/10 dark:border-white/10 dark:bg-[#0d1526] dark:text-white/80"
          />
        </div>
      </div>

      {/* ================= OPSI JAWABAN (Hanya PG) ================= */}
      {tipe === "PILIHAN_GANDA" && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-[#16233f] dark:text-white/80">
              Opsi Jawaban
            </label>
            <button
              type="button"
              onClick={tambahOpsi}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2ff] px-3 py-1.5 text-[12px] font-semibold text-[#4338ca] transition-all hover:-translate-y-0.5 hover:bg-[#e0e7ff] dark:bg-[#4338ca]/20 dark:text-[#818cf8] dark:hover:bg-[#4338ca]/30"
            >
              <IconPlus className="h-3.5 w-3.5" />
              Tambah Opsi
            </button>
          </div>

          <div className="space-y-2.5">
            {opsi.map((o, idx) => (
              <div
                key={o.key}
                className={`group flex items-center gap-3 rounded-[14px] border p-2 transition-all ${
                  o.benar
                    ? "border-[#818cf8] bg-[#f5f3ff] shadow-[0_4px_12px_-4px_rgba(129,140,248,0.3)] dark:border-[#818cf8]/50 dark:bg-[#818cf8]/10"
                    : "border-[#e7e4dc] bg-white hover:border-[#c7cdd8] dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                }`}
              >
                {/* Tombol Radio Benar (3D) */}
                <button
                  type="button"
                  onClick={() => pilihJawabanBenar(o.key)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] transition-all ${
                    o.benar
                      ? "bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_4px_10px_-2px_rgba(67,56,202,0.5)]"
                      : "bg-[#f7f9f8] text-[#8b93a6] hover:bg-[#eef2ff] hover:text-[#4338ca] dark:bg-white/10 dark:text-white/40 dark:hover:bg-white/20"
                  }`}
                  title="Tandai sebagai jawaban benar"
                >
                  {o.benar ? (
                    <IconCheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-[14px] font-bold">{String.fromCharCode(65 + idx)}</span>
                  )}
                </button>

                {/* Input Teks Opsi */}
                <input
                  type="text"
                  value={o.teks}
                  onChange={(e) => ubahTeksOpsi(o.key, e.target.value)}
                  placeholder={`Teks opsi ${String.fromCharCode(65 + idx)}...`}
                  required
                  className="w-full bg-transparent px-1 text-[13.5px] text-[#16233f] placeholder:text-[#a0aec0] focus:outline-none dark:text-white/80 dark:placeholder:text-white/30"
                />

                {/* Hapus Opsi */}
                {opsi.length > 2 && (
                  <button
                    type="button"
                    onClick={() => hapusOpsi(o.key)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#d23b3b] opacity-0 transition-all hover:bg-[#fdf1f1] group-hover:opacity-100 dark:hover:bg-red-500/20"
                    title="Hapus opsi"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] text-[#8b93a6] dark:text-white/40">
            Pilih tombol di samping opsi untuk menandai jawaban yang benar.
          </p>
        </div>
      )}

      {/* ================= TOMBOL AKSI ================= */}
      <div className="flex flex-col-reverse gap-3 border-t border-[#edf0ef] pt-6 dark:border-white/10 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push(redirectTo)}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#e7e4dc] bg-white px-6 py-3 text-[13.5px] font-semibold text-[#5b657d] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#f7f9f8] disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 sm:w-auto"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] px-8 py-3 text-[13.5px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(67,56,202,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(67,56,202,0.7)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? (
            <>
              <IconSpinner className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            mode === "create" ? "Simpan Soal" : "Simpan Perubahan"
          )}
        </button>
      </div>
    </form>
  )
}
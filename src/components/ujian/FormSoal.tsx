"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"

import { Modal } from "@/components/ui/Modal"

type TipeSoal = "PILIHAN_GANDA" | "ESSAY"

type OpsiAwal = { id?: string; teks: string; benar: boolean }

export type SoalAwal = {
  id: string
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

export function FormSoal({
  ujianId,
  initialData,
  open,
  onClose,
  onSuccess,
}: {
  ujianId: string
  initialData?: SoalAwal
  /** Kontrol modal dari parent. */
  open: boolean
  onClose: () => void
  /** Dipanggil setelah soal berhasil disimpan. */
  onSuccess?: () => void
}) {
  const router = useRouter()
  const mode = initialData ? "edit" : "create"

  const [pertanyaan, setPertanyaan] = useState(initialData?.pertanyaan ?? "")
  const [tipe, setTipe] = useState<TipeSoal>(initialData?.tipe ?? "PILIHAN_GANDA")
  const [poin, setPoin] = useState(String(initialData?.poin ?? 1))
  const [opsi, setOpsi] = useState(() => {
    const awal = initialData?.opsi?.map((o) => ({ key: o.id ?? idOpsiSementara(), teks: o.teks, benar: o.benar }))
    return awal && awal.length > 0 ? awal : [opsiKosong(), opsiKosong()]
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function tambahOpsi() {
    setOpsi((prev) => [...prev, opsiKosong()])
  }

  function hapusOpsi(key: string) {
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
      const url = mode === "create" ? `/api/ujian/${ujianId}/soal` : `/api/ujian/${ujianId}/soal/${initialData!.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pertanyaan,
          tipe,
          poin: Number(poin),
          opsi: tipe === "PILIHAN_GANDA" ? opsi.map(({ teks, benar }) => ({ teks, benar })) : undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.message ?? "Gagal menyimpan soal.")
        return
      }

      router.refresh()
      onSuccess?.()
      onClose()
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Tambah Soal" : "Edit Soal"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-[10px] border border-[#f3caca] bg-[#fdf1f1] px-4 py-3 text-[13px] text-[#d23b3b] dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#34435f] dark:text-white/70">
            Pertanyaan
          </label>
          <textarea
            value={pertanyaan}
            onChange={(e) => setPertanyaan(e.target.value)}
            required
            rows={3}
            className="w-full resize-none rounded-[10px] border border-[#e7e4dc] px-3.5 py-2.5 text-[14px] text-[#16233f] outline-none focus:border-[#818cf8] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#34435f] dark:text-white/70">
              Tipe soal
            </label>
            <select
              value={tipe}
              onChange={(e) => setTipe(e.target.value as TipeSoal)}
              className="w-full rounded-[10px] border border-[#e7e4dc] px-3.5 py-2.5 text-[14px] text-[#16233f] outline-none focus:border-[#818cf8] dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="PILIHAN_GANDA">Pilihan ganda</option>
              <option value="ESSAY">Essay</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#34435f] dark:text-white/70">
              Poin
            </label>
            <input
              type="number"
              min={1}
              value={poin}
              onChange={(e) => setPoin(e.target.value)}
              required
              className="w-full rounded-[10px] border border-[#e7e4dc] px-3.5 py-2.5 text-[14px] text-[#16233f] outline-none focus:border-[#818cf8] dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>

        {tipe === "PILIHAN_GANDA" && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[13px] font-medium text-[#34435f] dark:text-white/70">
                Opsi jawaban
              </label>
              <button
                type="button"
                onClick={tambahOpsi}
                className="text-[12.5px] font-medium text-[#4338ca] hover:underline dark:text-[#818cf8]"
              >
                + Tambah opsi
              </button>
            </div>

            <div className="space-y-2">
              {opsi.map((o) => (
                <div key={o.key} className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="jawaban-benar"
                    checked={o.benar}
                    onChange={() => pilihJawabanBenar(o.key)}
                    title="Tandai sebagai jawaban benar"
                    className="h-4 w-4 shrink-0 text-[#4338ca] focus:ring-[#4338ca]"
                  />
                  <input
                    type="text"
                    value={o.teks}
                    onChange={(e) => ubahTeksOpsi(o.key, e.target.value)}
                    placeholder="Teks opsi jawaban"
                    required
                    className="w-full rounded-[10px] border border-[#e7e4dc] px-3.5 py-2 text-[13.5px] text-[#16233f] outline-none focus:border-[#818cf8] dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                  {opsi.length > 2 && (
                    <button
                      type="button"
                      onClick={() => hapusOpsi(o.key)}
                      className="shrink-0 text-[12.5px] font-medium text-[#d23b3b] hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[11.5px] text-[#8b93a6] dark:text-white/40">
              Pilih bulatan di samping opsi untuk menandai jawaban yang benar.
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-[#edf0ef] pt-4 dark:border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="rounded-[10px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(67,56,202,0.4)] transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan Soal"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] px-5 py-2.5 text-[13.5px] font-medium text-[#5b657d] hover:bg-[#f4f5f7] dark:text-white/60 dark:hover:bg-white/10"
          >
            Batal
          </button>
        </div>
      </form>
    </Modal>
  )
}
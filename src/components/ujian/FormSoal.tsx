"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"

type TipeSoal = "PILIHAN_GANDA" | "ESSAY"

type OpsiAwal = { id?: string; teks: string; benar: boolean }

type SoalAwal = {
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

export function FormSoal({ ujianId, initialData }: { ujianId: string; initialData?: SoalAwal }) {
  const router = useRouter()
  const mode = initialData ? "edit" : "create"

  const [open, setOpen] = useState(false)
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

      setOpen(false)
      router.refresh()
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          mode === "create"
            ? "rounded-[10px] bg-[#4338ca] px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#3730a3]"
            : "rounded-[8px] px-2.5 py-1.5 text-[12.5px] font-medium text-[#4338ca] hover:bg-[#f2f1fc]"
        }
      >
        {mode === "create" ? "+ Tambah soal" : "Edit"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="text-[16px] font-semibold text-[#241f4d]">
              {mode === "create" ? "Tambah soal" : "Edit soal"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-[10px] border border-[#f3caca] bg-[#fdf1f1] px-4 py-3 text-[13px] text-[#d23b3b]">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#241f4d]">Pertanyaan</label>
                <textarea
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  required
                  rows={3}
                  className="w-full resize-none rounded-[10px] border border-[#dcd9ee] px-3.5 py-2.5 text-[14px] text-[#241f4d] outline-none focus:border-[#4338ca]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-[#241f4d]">Tipe soal</label>
                  <select
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value as TipeSoal)}
                    className="w-full rounded-[10px] border border-[#dcd9ee] px-3.5 py-2.5 text-[14px] text-[#241f4d] outline-none focus:border-[#4338ca]"
                  >
                    <option value="PILIHAN_GANDA">Pilihan ganda</option>
                    <option value="ESSAY">Essay</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-[#241f4d]">Poin</label>
                  <input
                    type="number"
                    min={1}
                    value={poin}
                    onChange={(e) => setPoin(e.target.value)}
                    required
                    className="w-full rounded-[10px] border border-[#dcd9ee] px-3.5 py-2.5 text-[14px] text-[#241f4d] outline-none focus:border-[#4338ca]"
                  />
                </div>
              </div>

              {tipe === "PILIHAN_GANDA" && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[13px] font-medium text-[#241f4d]">Opsi jawaban</label>
                    <button type="button" onClick={tambahOpsi} className="text-[12.5px] font-medium text-[#4338ca] hover:underline">
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
                          className="w-full rounded-[10px] border border-[#dcd9ee] px-3.5 py-2 text-[13.5px] text-[#241f4d] outline-none focus:border-[#4338ca]"
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
                  <p className="mt-1.5 text-[11.5px] text-[#8b87a8]">
                    Pilih bulatan di samping opsi untuk menandai jawaban yang benar.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 border-t border-[#f1f0f8] pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-[10px] bg-[#4338ca] px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#3730a3] disabled:opacity-60"
                >
                  {loading ? "Menyimpan..." : "Simpan soal"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-[10px] px-5 py-2.5 text-[13.5px] font-medium text-[#5b5490] hover:bg-[#f5f4fb]"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
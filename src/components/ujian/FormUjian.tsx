"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"

import { toDatetimeLocalValue } from "@/lib/ujian-utils"

type UjianAwal = {
  id: string
  judul: string
  deskripsi: string | null
  durasiMenit: number
  acakSoal: boolean
  batasPelanggaran: number
  mulai: string | Date
  selesai: string | Date
}

export function FormUjian({ initialData }: { initialData?: UjianAwal }) {
  const router = useRouter()
  const mode = initialData ? "edit" : "create"

  const [judul, setJudul] = useState(initialData?.judul ?? "")
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi ?? "")
  const [durasiMenit, setDurasiMenit] = useState(String(initialData?.durasiMenit ?? 60))
  const [acakSoal, setAcakSoal] = useState(initialData?.acakSoal ?? false)
  const [batasPelanggaran, setBatasPelanggaran] = useState(String(initialData?.batasPelanggaran ?? 3))
  const [mulai, setMulai] = useState(toDatetimeLocalValue(initialData?.mulai))
  const [selesai, setSelesai] = useState(toDatetimeLocalValue(initialData?.selesai))

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const url = mode === "create" ? "/api/ujian" : `/api/ujian/${initialData!.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          deskripsi,
          durasiMenit: Number(durasiMenit),
          acakSoal,
          batasPelanggaran: Number(batasPelanggaran),
          mulai: mulai ? new Date(mulai).toISOString() : null,
          selesai: selesai ? new Date(selesai).toISOString() : null,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.message ?? "Gagal menyimpan ujian.")
        return
      }

      router.push("/ujian")
      router.refresh()
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-[#ecebf7] bg-white p-6">
      {error && (
        <div className="rounded-[10px] border border-[#f3caca] bg-[#fdf1f1] px-4 py-3 text-[13px] text-[#d23b3b]">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[#241f4d]">Judul ujian</label>
        <input
          type="text"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          required
          placeholder="mis. Ujian Tengah Semester - Matematika"
          className="w-full rounded-[10px] border border-[#dcd9ee] px-3.5 py-2.5 text-[14px] text-[#241f4d] outline-none focus:border-[#4338ca]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[#241f4d]">Deskripsi (opsional)</label>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={3}
          placeholder="Instruksi atau catatan tambahan untuk peserta"
          className="w-full resize-none rounded-[10px] border border-[#dcd9ee] px-3.5 py-2.5 text-[14px] text-[#241f4d] outline-none focus:border-[#4338ca]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#241f4d]">Waktu mulai</label>
          <input
            type="datetime-local"
            value={mulai}
            onChange={(e) => setMulai(e.target.value)}
            required
            className="w-full rounded-[10px] border border-[#dcd9ee] px-3.5 py-2.5 text-[14px] text-[#241f4d] outline-none focus:border-[#4338ca]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#241f4d]">Waktu selesai</label>
          <input
            type="datetime-local"
            value={selesai}
            onChange={(e) => setSelesai(e.target.value)}
            required
            className="w-full rounded-[10px] border border-[#dcd9ee] px-3.5 py-2.5 text-[14px] text-[#241f4d] outline-none focus:border-[#4338ca]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#241f4d]">Durasi pengerjaan (menit)</label>
          <input
            type="number"
            min={1}
            value={durasiMenit}
            onChange={(e) => setDurasiMenit(e.target.value)}
            required
            className="w-full rounded-[10px] border border-[#dcd9ee] px-3.5 py-2.5 text-[14px] text-[#241f4d] outline-none focus:border-[#4338ca]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#241f4d]">Batas pelanggaran</label>
          <input
            type="number"
            min={1}
            value={batasPelanggaran}
            onChange={(e) => setBatasPelanggaran(e.target.value)}
            required
            className="w-full rounded-[10px] border border-[#dcd9ee] px-3.5 py-2.5 text-[14px] text-[#241f4d] outline-none focus:border-[#4338ca]"
          />
          <p className="mt-1 text-[11.5px] text-[#8b87a8]">
            Peserta otomatis didiskualifikasi setelah melewati batas ini.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={acakSoal}
          onChange={(e) => setAcakSoal(e.target.checked)}
          className="h-4 w-4 rounded border-[#dcd9ee] text-[#4338ca] focus:ring-[#4338ca]"
        />
        <span className="text-[13.5px] text-[#3a3564]">Acak urutan soal untuk setiap peserta</span>
      </label>

      <div className="flex items-center gap-3 border-t border-[#f1f0f8] pt-5">
        <button
          type="submit"
          disabled={loading}
          className="rounded-[10px] bg-[#4338ca] px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#3730a3] disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : mode === "create" ? "Buat ujian" : "Simpan perubahan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/ujian")}
          className="rounded-[10px] px-5 py-2.5 text-[13.5px] font-medium text-[#5b5490] hover:bg-[#f5f4fb]"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
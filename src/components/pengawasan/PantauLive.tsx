"use client"

import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"

const POLL_MS = 5_000
const STALE_DETIK = 30

type Peserta = {
  id: string
  nama: string
  ujian: string
  jumlahPelanggaran: number
  batasPelanggaran: number
  fokus: boolean
  kameraV: number | null
  layarV: number | null
  umurDetik: number | null
}

type Status = { label: string; tone: "emerald" | "red" | "slate"; bermasalah: boolean }

function hitungStatus(p: Peserta): Status {
  if (p.umurDetik === null) return { label: "Belum terpantau", tone: "slate", bermasalah: false }
  if (p.umurDetik > STALE_DETIK) return { label: "Tidak mengirim", tone: "red", bermasalah: true }
  if (!p.fokus) return { label: "Keluar dari ujian", tone: "red", bermasalah: true }
  return { label: "Terpantau", tone: "emerald", bermasalah: false }
}

function formatUmur(detik: number | null) {
  if (detik === null) return "-"
  if (detik < 5) return "baru saja"
  if (detik < 60) return `${detik} dtk lalu`
  return `${Math.floor(detik / 60)} mnt lalu`
}

function Gambar({
  id,
  jenis,
  versi,
  className = "",
}: {
  id: string
  jenis: "kamera" | "layar"
  versi: number | null
  className?: string
}) {
  if (versi === null) {
    return (
      <div
        className={`flex items-center justify-center bg-[#f0f2f1] text-[11px] text-[#8b93a6] dark:bg-white/[0.04] dark:text-white/40 ${className}`}
      >
        {jenis === "layar" ? "Layar tidak tersedia" : "Kamera tidak tersedia"}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/pantau/gambar/${id}/${jenis}?v=${versi}`}
      alt={jenis === "layar" ? "Layar peserta" : "Kamera peserta"}
      loading="lazy"
      className={`bg-black ${jenis === "layar" ? "object-contain" : "object-cover"} ${className}`}
    />
  )
}

export function PantauLive() {
  const [data, setData] = useState<Peserta[]>([])
  const [dimuat, setDimuat] = useState(false)
  const [error, setError] = useState("")
  const [cari, setCari] = useState("")
  const [hanyaBermasalah, setHanyaBermasalah] = useState(false)
  const [dipilihId, setDipilihId] = useState<string | null>(null)

  useEffect(() => {
    let aktif = true
    let timer: ReturnType<typeof setTimeout> | undefined

    async function muat() {
      // Tidak perlu memuat ulang saat tab admin sedang tidak terlihat.
      if (!document.hidden) {
        try {
          const response = await fetch("/api/pantau", { cache: "no-store" })
          if (!response.ok) throw new Error("gagal")
          const json = (await response.json()) as { peserta: Peserta[] }
          if (aktif) {
            setData(json.peserta)
            setError("")
          }
        } catch {
          if (aktif) setError("Gagal memuat data pemantauan. Mencoba lagi otomatis...")
        } finally {
          if (aktif) setDimuat(true)
        }
      }
      if (aktif) timer = setTimeout(muat, POLL_MS)
    }

    void muat()
    return () => {
      aktif = false
      if (timer) clearTimeout(timer)
    }
  }, [])

  const jumlahBermasalah = useMemo(() => data.filter((p) => hitungStatus(p).bermasalah).length, [data])

  const daftar = useMemo(() => {
    const kata = cari.trim().toLowerCase()
    return data
      .filter((p) => !kata || p.nama.toLowerCase().includes(kata) || p.ujian.toLowerCase().includes(kata))
      .filter((p) => !hanyaBermasalah || hitungStatus(p).bermasalah)
      .sort((a, b) => {
        const selisih = Number(hitungStatus(b).bermasalah) - Number(hitungStatus(a).bermasalah)
        return selisih !== 0 ? selisih : a.nama.localeCompare(b.nama, "id")
      })
  }, [data, cari, hanyaBermasalah])

  const dipilih = data.find((p) => p.id === dipilihId) ?? null
  const statusDipilih = dipilih ? hitungStatus(dipilih) : null

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#edf0ef] px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">Pantau langsung</h2>
          <p className="mt-0.5 text-[12px] text-[#8b93a6] dark:text-white/40">
            Kamera dan layar peserta, diperbarui otomatis tiap beberapa detik. Klik kartu untuk memperbesar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={cari}
            onChange={(event) => setCari(event.target.value)}
            placeholder="Cari peserta..."
            className="h-9 w-full rounded-[10px] border border-[#e7e4dc] bg-white px-3 text-[12.5px] text-[#16233f] outline-none placeholder:text-[#8b93a6] focus:border-[#4338ca] dark:border-white/10 dark:bg-white/[0.04] dark:text-white sm:w-52"
          />
          <button
            type="button"
            aria-pressed={hanyaBermasalah}
            onClick={() => setHanyaBermasalah((v) => !v)}
            className={`h-9 shrink-0 rounded-[10px] border px-3 text-[12.5px] font-medium transition-colors ${
              hanyaBermasalah
                ? "border-[#d23b3b] bg-[#fdf1f1] text-[#d23b3b] dark:bg-red-400/10 dark:text-red-300"
                : "border-[#e7e4dc] text-[#5b657d] hover:bg-[#f4f5f7] dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10"
            }`}
          >
            Bermasalah{jumlahBermasalah > 0 ? ` (${jumlahBermasalah})` : ""}
          </button>
        </div>
      </div>

      {error && (
        <p className="mx-5 mt-4 rounded-[10px] bg-[#fdf1f1] px-3.5 py-2.5 text-[12.5px] text-[#d23b3b] dark:bg-red-400/10 dark:text-red-300">
          {error}
        </p>
      )}

      {!dimuat ? (
        <p className="px-5 py-12 text-center text-[13px] text-[#8b93a6] dark:text-white/40">Memuat data pemantauan...</p>
      ) : data.length === 0 ? (
        <p className="px-5 py-12 text-center text-[13px] text-[#8b93a6] dark:text-white/40">
          Belum ada peserta yang sedang mengerjakan ujian.
        </p>
      ) : daftar.length === 0 ? (
        <p className="px-5 py-12 text-center text-[13px] text-[#8b93a6] dark:text-white/40">
          Tidak ada peserta yang cocok dengan filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
          {daftar.map((p) => {
            const status = hitungStatus(p)
            const adaLayar = p.layarV !== null
            return (
              <button key={p.id} type="button" onClick={() => setDipilihId(p.id)} className="group text-left">
                <Card
                  className={`overflow-hidden transition-shadow group-hover:shadow-lg ${
                    status.bermasalah ? "ring-2 ring-[#d23b3b]/60" : ""
                  }`}
                >
                  <div className="relative aspect-video w-full">
                    <Gambar
                      id={p.id}
                      jenis={adaLayar ? "layar" : "kamera"}
                      versi={adaLayar ? p.layarV : p.kameraV}
                      className="h-full w-full"
                    />
                    {adaLayar && p.kameraV !== null && (
                      <Gambar
                        id={p.id}
                        jenis="kamera"
                        versi={p.kameraV}
                        className="absolute bottom-2 right-2 h-14 w-[72px] rounded-md border-2 border-white shadow-md"
                      />
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2 px-3.5 pb-1 pt-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#16233f] dark:text-white">{p.nama}</p>
                      <p className="truncate text-[11.5px] text-[#8b93a6] dark:text-white/40">{p.ujian}</p>
                    </div>
                    <Badge tone={status.tone} className="shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="px-3.5 pb-3 text-[11.5px] text-[#8b93a6] dark:text-white/40">
                    Pelanggaran {p.jumlahPelanggaran}/{p.batasPelanggaran} · {formatUmur(p.umurDetik)}
                  </p>
                </Card>
              </button>
            )
          })}
        </div>
      )}

      <Modal
        open={dipilih !== null}
        onClose={() => setDipilihId(null)}
        title={dipilih?.nama ?? ""}
        description={dipilih?.ujian}
        maxWidth="max-w-5xl"
      >
        {dipilih && statusDipilih && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div>
              <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6] dark:text-white/40">
                Layar
              </p>
              <Gambar
                id={dipilih.id}
                jenis="layar"
                versi={dipilih.layarV}
                className="aspect-video w-full rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-[#8b93a6] dark:text-white/40">
                  Kamera
                </p>
                <Gambar
                  id={dipilih.id}
                  jenis="kamera"
                  versi={dipilih.kameraV}
                  className="aspect-[4/3] w-full rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5 text-[12.5px] text-[#5b657d] dark:text-white/60">
                <div className="flex items-center justify-between gap-2">
                  <span>Status</span>
                  <Badge tone={statusDipilih.tone}>{statusDipilih.label}</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Pelanggaran</span>
                  <span className="font-medium text-[#16233f] dark:text-white">
                    {dipilih.jumlahPelanggaran}/{dipilih.batasPelanggaran}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Kiriman terakhir</span>
                  <span className="font-medium text-[#16233f] dark:text-white">{formatUmur(dipilih.umurDetik)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  )
}
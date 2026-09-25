"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { IconSearch, IconSpinner, IconAlertTriangle } from "@/components/ui/Icons"
import { KartuUjianPreview } from "@/components/admin/KartuUjianPreview"

type PesertaItem = {
  id: string
  nama: string
  email: string
  nisn: string | null
  noUrut: number | null
  createdAt: string
}

type KartuData = {
  id: string
  nama: string
  email: string
  nisn: string | null
  noUrut: number | null
  password: string
}

export default function KartuUjianPage() {
  const [items, setItems] = useState<PesertaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [kartuList, setKartuList] = useState<KartuData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Debounce pencarian: update `query` setelah user berhenti mengetik 400ms.
  useEffect(() => {
    const t = setTimeout(() => setQuery(searchInput.trim()), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Fetch data ketika `query` berubah. setState hanya dipanggil di dalam
  // callback async (bukan langsung di body effect), sehingga lolos rule
  // react-hooks/set-state-in-effect.
  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setErrorMessage("")

      try {
        const params = new URLSearchParams()
        if (query) params.set("q", query)

        const res = await fetch(`/api/kartu-ujian?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error("Gagal memuat data")

        const data = await res.json()
        setItems(data.items)
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        setErrorMessage("Gagal memuat data peserta.")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [query])

  async function handleGenerateKartu() {
    if (items.length === 0) return
    setIsGenerating(true)
    setErrorMessage("")

    try {
      const res = await fetch("/api/kartu-ujian/generate-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: items.map((i) => i.id) }),
      })

      if (!res.ok) throw new Error("Gagal generate password")

      const data = await res.json()
      const passwordMap = new Map<string, string>(
        data.results.map((r: { id: string; password: string }) => [r.id, r.password])
      )

      const kartu: KartuData[] = items.map((p) => ({
        id: p.id,
        nama: p.nama,
        email: p.email,
        nisn: p.nisn,
        noUrut: p.noUrut,
        password: passwordMap.get(p.id) ?? "-",
      }))

      setKartuList(kartu)
    } catch {
      setErrorMessage("Gagal generate kartu ujian. Coba lagi.")
    } finally {
      setIsGenerating(false)
    }
  }

  function handleCetak() {
    window.print()
  }

  return (
    <div className="flex flex-col gap-6">
      {/*
        Header — judul di kiri, kedua tombol (Generate & Cetak)
        dikelompokkan berdampingan di kanan dalam satu baris yang
        sama, bukan lagi terpisah di baris sendiri-sendiri.
      */}
      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#007fc4] sm:text-[12px]">
            Ujian Online
          </p>
          <h1 className="mt-1 truncate text-[21px] font-semibold text-[#16233f] dark:text-white sm:text-[26px]">
            Kartu Ujian
          </h1>
          <p className="mt-1 text-[12px] text-[#5b657d] dark:text-white/50 sm:text-[13px]">
            Generate dan cetak kartu ujian peserta. Password akan di-reset otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
          <Button
            onClick={handleGenerateKartu}
            disabled={isGenerating || items.length === 0}
            className="shrink-0 rounded-[12px] bg-gradient-to-b from-[#00a7ff] to-[#007fc4] px-3.5 py-2.5 text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_18px_-8px_rgba(0,127,196,0.65)] transition-all hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_22px_-8px_rgba(0,127,196,0.75)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60 sm:px-4 sm:py-2.5 sm:text-[13px]"
          >
            {isGenerating ? (
              <>
                <IconSpinner className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Image src="/image/icon/unduh-icon.png" alt="" width={18} height={18} className="object-contain" />
                Generate Kartu
              </>
            )}
          </Button>

          {kartuList.length > 0 && (
            <Button
              onClick={handleCetak}
              variant="outline"
              className="shrink-0 rounded-[12px] border border-[#dfe3e6] bg-white px-3.5 py-2.5 text-[12px] font-semibold text-[#16233f] shadow-[0_6px_14px_-6px_rgba(22,35,63,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-6px_rgba(22,35,63,0.28)] active:translate-y-0 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:shadow-[0_6px_14px_-6px_rgba(0,0,0,0.45)] sm:px-4 sm:py-2.5 sm:text-[13px]"
            >
              🖨 Cetak Semua Kartu
            </Button>
          )}
        </div>
      </div>

      {/* Pencarian */}
      <Card className="p-4 shadow-[0_4px_0_#eef0f4,0_14px_26px_-16px_rgba(22,35,63,0.25)] transition-shadow dark:shadow-[0_4px_0_#0d1424,0_14px_26px_-16px_rgba(0,0,0,0.55)] print:hidden">
        <div className="relative max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8] dark:text-white/30" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type="search"
            placeholder="Cari nama, email, atau NISN..."
            className="h-10 w-full rounded-[10px] border border-[#e7e4dc] bg-[#f7f9f8] pl-10 pr-3.5 text-[13px] text-[#34435f] shadow-[inset_0_1px_2px_rgba(22,35,63,0.04)] placeholder:text-[#94a3b8] transition-colors focus:border-[#6ee7b7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6ee7b7]/25 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#6ee7b7]/60 dark:focus:bg-white/[0.06]"
          />
        </div>
      </Card>

      {/* Error */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-[10px] bg-[#fdf1f1] px-4 py-3 text-[13px] text-[#d23b3b] shadow-[0_4px_10px_-4px_rgba(210,59,59,0.3)] dark:bg-[#d23b3b]/15 dark:text-[#f28b8b] print:hidden">
          <IconAlertTriangle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {/* Preview Kartu — tidak diubah ke dark mode, karena dibuat untuk dicetak */}
      {kartuList.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 print:gap-2">
          {kartuList.map((kartu) => (
            <KartuUjianPreview key={kartu.id} data={kartu} />
          ))}
        </div>
      )}

      {/* Info */}
      {kartuList.length === 0 && !isLoading && items.length > 0 && (
        <Card className="flex flex-col items-center gap-3 py-16 text-center shadow-[0_4px_0_#eef0f4,0_14px_26px_-16px_rgba(22,35,63,0.25)] dark:shadow-[0_4px_0_#0d1424,0_14px_26px_-16px_rgba(0,0,0,0.55)] print:hidden">
          <p className="text-[14px] font-medium text-[#16233f] dark:text-white">
            {items.length} peserta siap dicetak kartunya
          </p>
          <p className="max-w-md text-[12.5px] text-[#8b93a6] dark:text-white/40">
            Klik <strong className="dark:text-white/70">Generate Kartu</strong> untuk membuat password baru dan
            menampilkan preview kartu ujian.
          </p>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <Card className="flex flex-col items-center gap-3 py-16 shadow-[0_4px_0_#eef0f4,0_14px_26px_-16px_rgba(22,35,63,0.25)] dark:shadow-[0_4px_0_#0d1424,0_14px_26px_-16px_rgba(0,0,0,0.55)] print:hidden">
          <IconSpinner className="h-6 w-6 animate-spin text-[#007fc4]" />
          <p className="text-[13px] text-[#8b93a6] dark:text-white/40">Memuat data peserta...</p>
        </Card>
      )}
    </div>
  )
}
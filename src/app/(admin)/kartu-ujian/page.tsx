"use client"

import { useEffect, useRef, useState } from "react"
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
      {/* Header */}
      <div className="flex items-end justify-between gap-3 print:hidden">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#007fc4] sm:text-[12px]">
            Ujian Online
          </p>
          <h1 className="mt-1 truncate text-[21px] font-semibold text-[#16233f] sm:text-[26px]">
            Kartu Ujian
          </h1>
          <p className="mt-1 text-[12px] text-[#5b657d] sm:text-[13px]">
            Generate dan cetak kartu ujian peserta. Password akan di-reset otomatis.
          </p>
        </div>

        <Button
          onClick={handleGenerateKartu}
          disabled={isGenerating || items.length === 0}
          className="shrink-0 px-3 py-2 text-[12px] sm:px-4 sm:py-2.5 sm:text-[13px]"
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
      </div>

      {/* Tombol Cetak */}
      {kartuList.length > 0 && (
        <div className="flex justify-end print:hidden">
          <Button onClick={handleCetak} variant="outline">
            🖨 Cetak Semua Kartu
          </Button>
        </div>
      )}

      {/* Pencarian */}
      <Card className="p-4 print:hidden">
        <div className="relative max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type="search"
            placeholder="Cari nama, email, atau NISN..."
            className="h-10 w-full rounded-[10px] border border-[#e7e4dc] bg-[#f7f9f8] pl-10 pr-3.5 text-[13px] text-[#34435f] placeholder:text-[#94a3b8] focus:border-[#6ee7b7] focus:bg-white focus:outline-none"
          />
        </div>
      </Card>

      {/* Error */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-[10px] bg-[#fdf1f1] px-4 py-3 text-[13px] text-[#d23b3b] print:hidden">
          <IconAlertTriangle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {/* Preview Kartu */}
      {kartuList.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 print:gap-2">
          {kartuList.map((kartu) => (
            <KartuUjianPreview key={kartu.id} data={kartu} />
          ))}
        </div>
      )}

      {/* Info */}
      {kartuList.length === 0 && !isLoading && items.length > 0 && (
        <Card className="flex flex-col items-center gap-3 py-16 text-center print:hidden">
          <p className="text-[14px] font-medium text-[#16233f]">
            {items.length} peserta siap dicetak kartunya
          </p>
          <p className="max-w-md text-[12.5px] text-[#8b93a6]">
            Klik <strong>Generate Kartu</strong> untuk membuat password baru dan menampilkan preview kartu ujian.
          </p>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <Card className="flex flex-col items-center gap-3 py-16 print:hidden">
          <IconSpinner className="h-6 w-6 animate-spin text-[#007fc4]" />
          <p className="text-[13px] text-[#8b93a6]">Memuat data peserta...</p>
        </Card>
      )}
    </div>
  )
}
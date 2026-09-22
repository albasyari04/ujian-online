"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { IconSearch } from "@/components/ui/Icons"

/* =========================================================
   IKON LOKAL
   Belum ada di components/ui/Icons.tsx, jadi didefinisikan
   lokal di sini (sama seperti pola IconRiwayat di halaman riwayat).
========================================================= */

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* =========================================================
   TIPE
========================================================= */

export type FaqItem = {
  id: string
  kategori: string
  pertanyaan: string
  jawaban: string
}

const SEMUA_KATEGORI = "Semua"

/* =========================================================
   KOMPONEN
========================================================= */

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [kataKunci, setKataKunci] = useState("")
  const [kategoriAktif, setKategoriAktif] = useState(SEMUA_KATEGORI)
  const [terbuka, setTerbuka] = useState<Set<string>>(new Set())

  const kategoriList = useMemo(() => {
    const unik = Array.from(new Set(items.map((item) => item.kategori)))
    return [SEMUA_KATEGORI, ...unik]
  }, [items])

  const hasilFilter = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase()
    return items.filter((item) => {
      const cocokKategori = kategoriAktif === SEMUA_KATEGORI || item.kategori === kategoriAktif
      const cocokKunci =
        !kunci ||
        item.pertanyaan.toLowerCase().includes(kunci) ||
        item.jawaban.toLowerCase().includes(kunci)
      return cocokKategori && cocokKunci
    })
  }, [items, kataKunci, kategoriAktif])

  function toggle(id: string) {
    setTerbuka((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pencarian */}
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
        <Input
          type="search"
          value={kataKunci}
          onChange={(event) => setKataKunci(event.target.value)}
          placeholder="Cari pertanyaan, mis. 'lupa kata sandi'..."
          aria-label="Cari pertanyaan bantuan"
          className="pl-9"
        />
      </div>

      {/* Filter kategori */}
      <div className="flex flex-wrap gap-2">
        {kategoriList.map((kategori) => {
          const aktif = kategori === kategoriAktif
          return (
            <button
              key={kategori}
              type="button"
              onClick={() => setKategoriAktif(kategori)}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                aktif
                  ? "border-[#16233f] bg-[#16233f] text-white"
                  : "border-[#e7e4dc] bg-white text-[#5b6a86] hover:bg-[#f6f4ec]"
              }`}
            >
              {kategori}
            </button>
          )
        })}
      </div>

      {/* Daftar FAQ */}
      {hasilFilter.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[#e7e4dc] bg-white/60 px-4 py-10 text-center">
          <p className="text-[13px] text-[#8b93a6]">
            Tidak ada pertanyaan yang cocok dengan pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {hasilFilter.map((item) => {
            const buka = terbuka.has(item.id)
            return (
              <div key={item.id} className="overflow-hidden rounded-[14px] border border-[#e7e4dc] bg-white">
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={buka}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Badge tone="slate" className="hidden shrink-0 sm:inline-flex">
                      {item.kategori}
                    </Badge>
                    <span className="truncate text-[13.5px] font-medium text-[#16233f]">
                      {item.pertanyaan}
                    </span>
                  </div>
                  <IconChevronDown
                    className={`h-4 w-4 shrink-0 text-[#8b93a6] transition-transform ${buka ? "rotate-180" : ""}`}
                  />
                </button>

                {buka && (
                  <div className="border-t border-[#efece4] px-4 py-3.5">
                    <p className="text-[13px] leading-6 text-[#5b6a86]">{item.jawaban}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
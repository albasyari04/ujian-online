"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { IconChevronDown, IconSearch, IconDocument } from "@/components/ui/Icons"

type SoalRingkas = { id: string; pertanyaan: string; tipe: "PILIHAN_GANDA" | "ESSAY"; poin: number }
type UjianRingkas = { id: string; judul: string; soal: SoalRingkas[] }

export function BankSoalClient({ data }: { data: UjianRingkas[] }) {
  const [cari, setCari] = useState("")
  const [terbuka, setTerbuka] = useState<string | null>(data[0]?.id ?? null)

  const hasil = useMemo(() => {
    if (!cari.trim()) return data
    const q = cari.trim().toLowerCase()
    return data
      .map((u) => ({ ...u, soal: u.soal.filter((s) => s.pertanyaan.toLowerCase().includes(q)) }))
      .filter((u) => u.judul.toLowerCase().includes(q) || u.soal.length > 0)
  }, [data, cari])

  const totalSoal = data.reduce((sum, u) => sum + u.soal.length, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold text-[#16233f] dark:text-white">Bank Soal</h1>
        <p className="mt-0.5 text-[13px] text-[#5b657d] dark:text-white/50">
          {totalSoal} soal dari {data.length} ujian yang Anda kelola.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-[11px] border border-[#e7e4dc] bg-white px-3.5 py-2.5 dark:border-white/10 dark:bg-[#101a30] sm:max-w-[360px]">
        <IconSearch className="h-4 w-4 shrink-0 text-[#94a3b8]" />
        <input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari soal atau judul ujian..."
          className="w-full bg-transparent text-[13px] text-[#34435f] placeholder:text-[#94a3b8] focus:outline-none dark:text-white/80"
        />
      </div>

      <div className="space-y-3">
        {hasil.length === 0 && (
          <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <IconDocument className="h-9 w-9 text-[#c7cdd8]" />
            <p className="text-[13.5px] font-medium text-[#5b657d] dark:text-white/50">Tidak ada soal yang cocok.</p>
          </Card>
        )}

        {hasil.map((u) => {
          const buka = terbuka === u.id
          return (
            <Card key={u.id} className="overflow-hidden">
              <button
                onClick={() => setTerbuka(buka ? null : u.id)}
                className="flex w-full items-center justify-between gap-3 px-4.5 py-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_16px_-6px_rgba(67,56,202,0.5)]">
                    <IconDocument className="h-4 w-4" />
                  </span>
                  <div className="text-left">
                    <p className="text-[13.5px] font-semibold text-[#16233f] dark:text-white">{u.judul}</p>
                    <p className="text-[11.5px] text-[#8b93a6] dark:text-white/40">{u.soal.length} soal</p>
                  </div>
                </div>
                <IconChevronDown className={`h-4 w-4 text-[#8b93a6] transition-transform ${buka ? "rotate-180" : ""}`} />
              </button>

              {buka && (
                <div className="border-t border-[#edf0ef] px-4.5 py-3.5 dark:border-white/10">
                  {u.soal.length === 0 ? (
                    <p className="py-3 text-center text-[12.5px] text-[#8b93a6] dark:text-white/40">
                      Belum ada soal di ujian ini.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {u.soal.map((s, i) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-3 rounded-[10px] bg-[#f7f9f8] px-3 py-2 dark:bg-white/5"
                        >
                          <p className="min-w-0 truncate text-[12.5px] text-[#34435f] dark:text-white/70">
                            <span className="mr-1.5 text-[#8b93a6] dark:text-white/40">{i + 1}.</span>
                            {s.pertanyaan}
                          </p>
                          <Badge tone={s.tipe === "PILIHAN_GANDA" ? "blue" : "amber"}>
                            {s.tipe === "PILIHAN_GANDA" ? "PG" : "Essay"} · {s.poin} poin
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/ujian-guru/${u.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-[#4338ca] hover:underline dark:text-[#818cf8]"
                  >
                    Kelola soal ujian ini →
                  </Link>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

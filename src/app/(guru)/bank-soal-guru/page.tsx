"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { getSubjectIconSrc } from "@/lib/subject-icons"
import { IconChevronDown, IconSearch, IconDocument } from "@/components/ui/Icons"

/* =========================================================
   IKON TAMBAHAN LOKAL
   Belum ada padanannya di components/ui/Icons.tsx.
========================================================= */
function IconGrid({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
    </svg>
  )
}

type SoalRingkas = { id: string; pertanyaan: string; tipe: "PILIHAN_GANDA" | "ESSAY"; poin: number }
type UjianRingkas = { id: string; judul: string; soal: SoalRingkas[] }

/* =========================================================
   STYLE KARTU UJIAN
   Satu gaya indigo yang konsisten untuk tombol chevron —
   tidak lagi warna-warni bergantian, supaya lebih profesional.
========================================================= */
const ARROW_STYLE =
  "bg-gradient-to-br from-[#818cf8] to-[#4338ca] shadow-[0_8px_16px_-6px_rgba(67,56,202,0.5)]"

export function BankSoalClient({ data }: { data: UjianRingkas[] }) {
  const [cari, setCari] = useState("")
  const [subjek, setSubjek] = useState<string | null>(null)
  const [terbuka, setTerbuka] = useState<string | null>(data[0]?.id ?? null)

  const subjekList = useMemo(() => Array.from(new Set(data.map((u) => u.judul))), [data])

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return data
      .filter((u) => !subjek || u.judul === subjek)
      .map((u) => (q ? { ...u, soal: u.soal.filter((s) => s.pertanyaan.toLowerCase().includes(q)) } : u))
      .filter((u) => !q || u.judul.toLowerCase().includes(q) || u.soal.length > 0)
  }, [data, cari, subjek])

  const totalSoal = data.reduce((sum, u) => sum + u.soal.length, 0)

  return (
    <div className="space-y-5">
      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden rounded-[24px] border border-[#e7e4dc] bg-gradient-to-br from-[#eef4ff] via-white to-[#f5f3ff] p-5 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_20px_40px_-20px_rgba(49,46,129,0.25)] dark:border-white/10 dark:from-[#0d1526] dark:via-[#0d1526] dark:to-[#131b30] sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.22),transparent_65%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(129,199,253,0.18),transparent_65%)]"
        />

        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-[#6d78a6] dark:text-white/50">Selamat datang,</p>
            <h1 className="mt-0.5 text-[24px] font-bold leading-tight text-[#16233f] dark:text-white sm:text-[26px]">
              Bank Soal
            </h1>
            <p className="mt-1 text-[13px] text-[#5b657d] dark:text-white/50">
              {totalSoal} soal dari {data.length} ujian yang Anda kelola.
            </p>
          </div>

          <div className="shrink-0">
            <Image
              src="/image/icon/bankujian-icon.png"
              alt=""
              width={80}
              height={80}
              className="h-14 w-14 object-contain drop-shadow-[0_12px_20px_rgba(49,46,129,0.3)] sm:h-20 sm:w-20"
            />
          </div>
        </div>

        <div className="relative mt-4 flex items-center gap-2 rounded-[12px] border border-white/60 bg-white/60 px-3.5 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]">
          <IconSearch className="h-4 w-4 shrink-0 text-[#94a3b8]" />
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari soal atau judul ujian..."
            className="w-full bg-transparent text-[13px] text-[#34435f] placeholder:text-[#94a3b8] focus:outline-none dark:text-white/80"
          />
        </div>
      </div>

      {/* ============ TAB MATA PELAJARAN ============ */}
      {subjekList.length > 1 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setSubjek(null)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all ${
              subjek === null
                ? "border-transparent bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_18px_-6px_rgba(67,56,202,0.55)]"
                : "border-[#e7e4dc] bg-white text-[#5b657d] hover:bg-[#f7f9f8] dark:border-white/10 dark:bg-white/[0.03] dark:text-white/50 dark:hover:bg-white/10"
            }`}
          >
            <IconGrid className="h-3.5 w-3.5" />
            Semua
          </button>

          {subjekList.map((s) => {
            const aktif = subjek === s
            return (
              <button
                key={s}
                onClick={() => setSubjek(s)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                  aktif
                    ? "border-transparent bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_18px_-6px_rgba(67,56,202,0.55)]"
                    : "border-[#e7e4dc] bg-white text-[#5b657d] hover:bg-[#f7f9f8] dark:border-white/10 dark:bg-white/[0.03] dark:text-white/50 dark:hover:bg-white/10"
                }`}
              >
                <Image src={getSubjectIconSrc(s)} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                {s}
              </button>
            )
          })}
        </div>
      )}

      {/* ============ DAFTAR UJIAN ============ */}
      <div className="space-y-3.5">
        {hasil.length === 0 && (
          <Card variant="glass" className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <IconDocument className="h-9 w-9 text-[#c7cdd8]" />
            <p className="text-[13.5px] font-medium text-[#5b657d] dark:text-white/50">Tidak ada soal yang cocok.</p>
          </Card>
        )}

        {hasil.map((u) => {
          const buka = terbuka === u.id
          const jumlahPg = u.soal.filter((s) => s.tipe === "PILIHAN_GANDA").length
          const jumlahEssay = u.soal.length - jumlahPg

          return (
            <Card
              key={u.id}
              variant="glass"
              className="relative overflow-hidden shadow-[0_1px_2px_rgba(22,35,63,0.04),0_18px_36px_-20px_rgba(49,46,129,0.35)]"
            >
              <button
                onClick={() => setTerbuka(buka ? null : u.id)}
                className="flex w-full items-center gap-3.5 px-4.5 py-4"
              >
                <Image
                  src={getSubjectIconSrc(u.judul)}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_10px_16px_rgba(49,46,129,0.25)]"
                />

                <div className="min-w-0 flex-1 text-left">
                  <h3 className="truncate text-[15px] font-semibold text-[#16233f] dark:text-white">{u.judul}</h3>
                  <p className="mt-0.5 text-[12px] text-[#8b93a6] dark:text-white/40">
                    {u.soal.length} soal tersedia
                  </p>
                  {u.soal.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {jumlahPg > 0 && <Badge tone="blue">{jumlahPg} PG</Badge>}
                      {jumlahEssay > 0 && <Badge tone="amber">{jumlahEssay} Essay</Badge>}
                    </div>
                  )}
                </div>

                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${ARROW_STYLE}`}>
                  <IconChevronDown className={`h-4 w-4 transition-transform ${buka ? "rotate-180" : ""}`} />
                </span>
              </button>

              {buka && (
                <div className="border-t border-[#edf0ef] px-4.5 py-3.5 dark:border-white/10">
                  {u.soal.length === 0 ? (
                    <p className="py-3 text-center text-[12.5px] text-[#8b93a6] dark:text-white/40">
                      Belum ada soal di ujian ini.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {u.soal.map((s, idx) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-3 rounded-[10px] bg-[#f7f9f8] px-3 py-2 dark:bg-white/5"
                        >
                          <p className="min-w-0 truncate text-[12.5px] text-[#34435f] dark:text-white/70">
                            <span className="mr-1.5 text-[#8b93a6] dark:text-white/40">{idx + 1}.</span>
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
"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { NavigasiSoal } from "@/components/ujian/NavigasiSoal"
import { PengawasUjian } from "@/components/ujian/PengawasUjian"
import { SoalCard, type SoalPeserta } from "@/components/ujian/SoalCard"
import { Timer } from "@/components/ujian/Timer"
import { splitBacaanDanSoal } from "@/lib/bacaan"
import type { PengaturanPelanggaranAktif } from "@/lib/pengaturan"

type JawabanAwal = { soalId: string; jawabanTeks: string | null; opsiPilihan: string | null }

/* Ikon lokal untuk panel bacaan */
function IconBookOpen({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 6.5C10.5 5.2 8.3 4.5 5.5 4.5V17.5C8.3 17.5 10.5 18.2 12 19.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6.5C13.5 5.2 15.7 4.5 18.5 4.5V17.5C15.7 17.5 13.5 18.2 12 19.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 6.5V19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconChevronUp({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconChevronDown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RuangUjian({
  ujian,
  hasilId,
  waktuSelesai,
  jawabanAwal,
  pengaturanPelanggaran,
}: {
  ujian: { id: string; judul: string; batasPelanggaran: number; soal: SoalPeserta[] }
  hasilId: string
  waktuSelesai: string
  jawabanAwal: JawabanAwal[]
  pengaturanPelanggaran: PengaturanPelanggaranAktif
}) {
  const router = useRouter()
  const [indexAktif, setIndexAktif] = useState(0)
  const [jawaban, setJawaban] = useState<Record<string, string>>(() =>
    Object.fromEntries(jawabanAwal.map((item) => [item.soalId, item.opsiPilihan ?? item.jawabanTeks ?? ""])),
  )
  const [mengirim, setMengirim] = useState(false)
  const [error, setError] = useState("")
  const [bacaanTerbukaMobile, setBacaanTerbukaMobile] = useState(true)

  const soal = ujian.soal[indexAktif]

  /* --- Ambil bacaan dari soal PERTAMA (tempat bacaan disimpan) --- */
  const bacaan = useMemo(() => {
    const soalPertama = ujian.soal[0]
    if (!soalPertama) return null
    return splitBacaanDanSoal(soalPertama.pertanyaan).bacaan
  }, [ujian.soal])

  /* --- Soal yang ditampilkan sudah dibersihkan dari marker bacaan --- */
  const soalBersih: SoalPeserta = useMemo(
    () => ({ ...soal, pertanyaan: splitBacaanDanSoal(soal.pertanyaan).soal }),
    [soal],
  )

  const adaBacaan = Boolean(bacaan && bacaan.trim().length > 0)

  const simpanJawaban = async (soalId: string, value: string) => {
    setJawaban((current) => ({ ...current, [soalId]: value }))
    const response = await fetch("/api/jawaban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hasilUjianId: hasilId, soalId, jawaban: value }),
    })
    if (!response.ok) setError("Jawaban belum tersimpan. Periksa koneksi lalu coba lagi.")
  }

  const kumpulkan = async (otomatis = false) => {
    if (!otomatis && !window.confirm("Kumpulkan jawaban sekarang? Setelah dikumpulkan, jawaban tidak dapat diubah.")) return
    setMengirim(true)
    setError("")
    const response = await fetch(`/api/hasil-ujian/${hasilId}/submit`, { method: "POST" })
    if (response.ok) router.push(`/hasil/${hasilId}`)
    else {
      const result = await response.json().catch(() => null)
      setError(result?.message ?? "Jawaban gagal dikumpulkan.")
      setMengirim(false)
    }
  }

  const hentikanKarenaPelanggaran = async () => {
    const response = await fetch(`/api/hasil-ujian/${hasilId}/submit`, { method: "POST" })
    if (response.ok) router.push(`/hasil/${hasilId}`)
  }

  return (
    <PengawasUjian
      hasilId={hasilId}
      batasPelanggaran={ujian.batasPelanggaran}
      pengaturan={pengaturanPelanggaran}
      onDihentikan={() => void hentikanKarenaPelanggaran()}
    >
      <div className="flex flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#b45309]">Ujian online</p>
            <h1 className="mt-1 text-[24px] font-semibold text-[#16233f]">{ujian.judul}</h1>
          </div>
          <Timer waktuSelesai={waktuSelesai} onHabis={() => void kumpulkan(true)} />
        </header>

        {error && <p className="rounded-[10px] bg-[#fdeaea] px-3 py-2 text-[13px] text-[#b93131]">{error}</p>}

        {/* Panel Bacaan Mobile (collapsible) */}
        {adaBacaan && (
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setBacaanTerbukaMobile((v) => !v)}
              className="flex w-full items-center justify-between gap-2 rounded-[12px] border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/60 px-4 py-3 text-left dark:border-amber-500/20 dark:from-amber-500/10 dark:to-amber-500/5"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                  <IconBookOpen className="h-3.5 w-3.5" />
                </span>
                <span className="text-[13px] font-semibold text-amber-800 dark:text-amber-300">
                  Bacaan / Stimulus
                </span>
              </span>
              {bacaanTerbukaMobile ? (
                <IconChevronUp className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              ) : (
                <IconChevronDown className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              )}
            </button>
            {bacaanTerbukaMobile && (
              <div className="mt-2 max-h-[60vh] overflow-y-auto rounded-[12px] border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-amber-900 dark:text-amber-100">
                  {bacaan}
                </p>
              </div>
            )}
          </div>
        )}

        <div
          className={`grid gap-5 ${
            adaBacaan ? "lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)_260px]" : "lg:grid-cols-[minmax(0,1fr)_260px]"
          }`}
        >
          {/* Panel Bacaan Sticky (desktop) */}
          {adaBacaan && (
            <aside className="hidden lg:block">
              <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-amber-100/40 p-4 shadow-[0_8px_24px_-12px_rgba(180,83,9,0.25)] dark:border-amber-500/20 dark:from-amber-500/10 dark:to-amber-500/5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                    <IconBookOpen className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[11.5px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                    Bacaan / Stimulus
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-amber-900 dark:text-amber-100">
                  {bacaan}
                </p>
              </div>
            </aside>
          )}

          {/* Soal */}
          <div>
            <SoalCard
              soal={soalBersih}
              nomor={indexAktif + 1}
              totalSoal={ujian.soal.length}
              jawaban={jawaban[soal.id] ?? ""}
              onJawabChange={(value) => void simpanJawaban(soal.id, value)}
            />
            <div className="mt-4 flex justify-between gap-3">
              <button
                type="button"
                disabled={indexAktif === 0}
                onClick={() => setIndexAktif((current) => current - 1)}
                className="rounded-[10px] border border-[#dcd9ee] px-4 py-2.5 text-[13px] font-semibold text-[#4338ca] disabled:opacity-40"
              >
                Sebelumnya
              </button>
              {indexAktif === ujian.soal.length - 1 ? (
                <button
                  type="button"
                  disabled={mengirim}
                  onClick={() => void kumpulkan()}
                  className="rounded-[10px] bg-[#4338ca] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  {mengirim ? "Mengirim..." : "Kumpulkan ujian"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIndexAktif((current) => current + 1)}
                  className="rounded-[10px] bg-[#4338ca] px-4 py-2.5 text-[13px] font-semibold text-white"
                >
                  Berikutnya
                </button>
              )}
            </div>
          </div>

          {/* Navigasi */}
          <NavigasiSoal
            totalSoal={ujian.soal.length}
            indexAktif={indexAktif}
            soalTerjawab={ujian.soal.map((item) => Boolean(jawaban[item.id]?.trim()))}
            onPindah={setIndexAktif}
          />
        </div>
      </div>
    </PengawasUjian>
  )
}
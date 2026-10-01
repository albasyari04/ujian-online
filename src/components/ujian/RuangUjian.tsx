"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { NavigasiSoal } from "@/components/ujian/NavigasiSoal"
import { PengawasUjian } from "@/components/ujian/PengawasUjian"
import { SoalCard, type SoalPeserta } from "@/components/ujian/SoalCard"
import { Timer } from "@/components/ujian/Timer"
import { splitBacaanDanSoal } from "@/lib/bacaan"
import { getSubjectIconSrc } from "@/lib/subject-icons"
import type { PengaturanPelanggaranAktif } from "@/lib/pengaturan"

type JawabanAwal = { soalId: string; jawabanTeks: string | null; opsiPilihan: string | null }

/* =========================================================
   IKON LOKAL
========================================================= */
function IconBookOpen({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 6.5C10.5 5.2 8.3 4.5 5.5 4.5V17.5C8.3 17.5 10.5 18.2 12 19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6.5C13.5 5.2 15.7 4.5 18.5 4.5V17.5C15.7 17.5 13.5 18.2 12 19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

function IconCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowLeft({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5M11 6L5 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSend({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20.5 3.5L3 10.8C2.4 11 2.4 11.9 3 12.1L9.8 14.8L12.5 21.6C12.7 22.2 13.6 22.2 13.8 21.6L20.9 4.1C21.1 3.5 20.9 3.3 20.5 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M9.8 14.8L20.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* =========================================================
   RUANG UJIAN
========================================================= */
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
  const [konfirmasiTerbuka, setKonfirmasiTerbuka] = useState(false)
  const [error, setError] = useState("")
  const [bacaanTerbukaMobile, setBacaanTerbukaMobile] = useState(true)

  const soal = ujian.soal[indexAktif]

  const bacaan = useMemo(() => {
    for (let i = indexAktif; i >= 0; i -= 1) {
      const b = splitBacaanDanSoal(ujian.soal[i].pertanyaan).bacaan
      if (b && b.trim().length > 0) return b
    }
    return null
  }, [ujian.soal, indexAktif])

  const soalBersih: SoalPeserta = useMemo(
    () => ({ ...soal, pertanyaan: splitBacaanDanSoal(soal.pertanyaan).soal }),
    [soal],
  )

  const adaBacaan = Boolean(bacaan && bacaan.trim().length > 0)
  const jumlahTerjawab = ujian.soal.filter((s) => Boolean(jawaban[s.id]?.trim())).length
  const progress = ujian.soal.length > 0 ? Math.round((jumlahTerjawab / ujian.soal.length) * 100) : 0

  const simpanJawaban = async (soalId: string, value: string) => {
    setJawaban((current) => ({ ...current, [soalId]: value }))
    const response = await fetch("/api/jawaban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hasilUjianId: hasilId, soalId, jawaban: value }),
    })
    if (!response.ok) setError("Jawaban belum tersimpan. Periksa koneksi lalu coba lagi.")
  }

  // Konfirmasi memakai modal di dalam halaman (bukan window.confirm) supaya jendela
  // tidak kehilangan fokus dan tidak terbaca sebagai pelanggaran.
  const mintaKonfirmasiKumpulkan = () => {
    if (mengirim) return
    setKonfirmasiTerbuka(true)
  }

  // Dipakai tombol "Ya, kumpulkan" dan pengumpulan otomatis saat waktu habis.
  // Selama mengirim = true, PengawasUjian menghentikan semua deteksi pelanggaran.
  const kumpulkan = async () => {
    if (mengirim) return
    setKonfirmasiTerbuka(false)
    setMengirim(true)
    setError("")
    try {
      const response = await fetch(`/api/hasil-ujian/${hasilId}/submit`, { method: "POST" })
      if (response.ok) {
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
        router.push(`/hasil/${hasilId}`)
        return // biarkan mengirim = true sampai halaman berpindah, agar pengawasan tetap berhenti
      }
      const result = await response.json().catch(() => null)
      setError(result?.message ?? "Jawaban gagal dikumpulkan.")
    } catch {
      setError("Jawaban gagal dikumpulkan. Periksa koneksi lalu coba lagi.")
    }
    setMengirim(false) // gagal: pengawasan aktif kembali
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
      jeda={mengirim}
    >
      <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] via-[#f6f7fb] to-[#f5f3ff] dark:from-[#0a0f1e] dark:via-[#0d1526] dark:to-[#131b30]">
        {/* ============ HEADER STICKY ============ */}
        <header className="sticky top-0 z-30 border-b border-[#e7e4dc] bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1526]/80">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src={getSubjectIconSrc(ujian.judul)}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.3)]"
              />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-[#8b93a6] dark:text-white/40">
                  Ujian Online
                </p>
                <h1 className="truncate text-[15px] font-semibold text-[#16233f] dark:text-white">
                  {ujian.judul}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex items-center gap-1.5 rounded-full bg-[#eef2ff] px-3 py-1.5 text-[11.5px] font-medium text-[#4338ca] dark:bg-[#818cf8]/10 dark:text-[#818cf8]">
                  <IconCheck className="h-3.5 w-3.5" />
                  {jumlahTerjawab}/{ujian.soal.length}
                </div>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-[#e7e4dc] dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#818cf8] to-[#4338ca] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <Timer waktuSelesai={waktuSelesai} onHabis={() => void kumpulkan()} />
            </div>
          </div>
        </header>

        {/* ============ KONTEN ============ */}
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6">
          {error && (
            <p className="mb-4 rounded-[10px] border border-[#f5cccc] bg-[#fdf1f1] px-4 py-2.5 text-[13px] text-[#b93131] dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Panel Bacaan Mobile */}
          {adaBacaan && (
            <div className="mb-4 lg:hidden">
              <button
                type="button"
                onClick={() => setBacaanTerbukaMobile((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-[12px] border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/60 px-4 py-3 text-left shadow-[0_4px_16px_-8px_rgba(180,83,9,0.3)] dark:border-amber-500/20 dark:from-amber-500/10 dark:to-amber-500/5"
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
              adaBacaan
                ? "lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)_280px]"
                : "lg:grid-cols-[minmax(0,1fr)_280px]"
            }`}
          >
            {/* Panel Bacaan Sticky */}
            {adaBacaan && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[16px] border border-amber-200 bg-gradient-to-br from-amber-50/80 to-amber-100/40 p-4 shadow-[0_8px_24px_-12px_rgba(180,83,9,0.25)] dark:border-amber-500/20 dark:from-amber-500/10 dark:to-amber-500/5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_4px_12px_-4px_rgba(180,83,9,0.5)]">
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

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={indexAktif === 0}
                  onClick={() => setIndexAktif((current) => current - 1)}
                  className="group inline-flex items-center gap-2 rounded-[12px] border border-[#e7e4dc] bg-white px-4 py-3 text-[13px] font-semibold text-[#4338ca] shadow-[0_4px_0_#e0ddef,0_8px_20px_-8px_rgba(67,56,202,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_#e0ddef,0_12px_24px_-8px_rgba(67,56,202,0.4)] active:translate-y-0 active:shadow-[0_2px_0_#e0ddef] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:text-[#818cf8]"
                >
                  <IconArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  Sebelumnya
                </button>

                {indexAktif === ujian.soal.length - 1 ? (
                  <button
                    type="button"
                    disabled={mengirim}
                    onClick={mintaKonfirmasiKumpulkan}
                    className="group inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-br from-emerald-500 to-emerald-700 px-5 py-3 text-[13px] font-semibold text-white shadow-[0_4px_0_#059669,0_10px_24px_-8px_rgba(5,150,105,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_#059669,0_14px_28px_-8px_rgba(5,150,105,0.7)] active:translate-y-0 active:shadow-[0_2px_0_#059669] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {mengirim ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <IconSend className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        Kumpulkan Ujian
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIndexAktif((current) => current + 1)}
                    className="group inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_4px_0_#3730a3,0_10px_24px_-8px_rgba(67,56,202,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_#3730a3,0_14px_28px_-8px_rgba(67,56,202,0.7)] active:translate-y-0 active:shadow-[0_2px_0_#3730a3]"
                  >
                    Berikutnya
                    <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Navigasi */}
            <aside>
              <div className="sticky top-24">
                <NavigasiSoal
                  totalSoal={ujian.soal.length}
                  indexAktif={indexAktif}
                  soalTerjawab={ujian.soal.map((item) => Boolean(jawaban[item.id]?.trim()))}
                  onPindah={setIndexAktif}
                />
              </div>
            </aside>
          </div>
        </div>

        {/* ============ MODAL KONFIRMASI KUMPULKAN ============ */}
        {konfirmasiTerbuka && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-konfirmasi-kumpulkan"
            className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/50 px-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-[#0d1526]">
              <h2 id="judul-konfirmasi-kumpulkan" className="text-[16px] font-semibold text-[#16233f] dark:text-white">
                Kumpulkan jawaban sekarang?
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-[#5b5490] dark:text-white/60">
                Terjawab {jumlahTerjawab} dari {ujian.soal.length} soal. Setelah dikumpulkan, jawaban tidak dapat diubah.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setKonfirmasiTerbuka(false)}
                  className="flex-1 rounded-[10px] border border-[#e7e4dc] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#4338ca] hover:bg-[#f6f7fb] dark:border-white/10 dark:bg-white/5 dark:text-[#818cf8]"
                >
                  Periksa lagi
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => void kumpulkan()}
                  className="flex-1 rounded-[10px] bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700"
                >
                  Ya, kumpulkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PengawasUjian>
  )
}
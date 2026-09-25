// Catatan: sesuaikan path import ThemeToggle di bawah dengan lokasi
// file ThemeToggle.tsx yang sebenarnya di proyek Anda (mis. jika ada
// di src/components/ThemeToggle.tsx, ubah menjadi "@/components/ThemeToggle").
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Card } from "@/components/ui/Card"

/* =========================================================
   ICON — SVG inline ringan, tanpa dependensi file lain
========================================================= */

function IconPalette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.5c-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5c1 0 1.75-.8 1.75-1.75 0-.45-.17-.86-.46-1.17-.28-.3-.46-.71-.46-1.16 0-.95.8-1.75 1.75-1.75h1.9c2.1 0 3.77-1.7 3.77-3.77C20.75 6.85 16.9 3.5 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="7.3" cy="10.5" r="1.15" fill="currentColor" />
      <circle cx="9.8" cy="7" r="1.15" fill="currentColor" />
      <circle cx="14.3" cy="7" r="1.15" fill="currentColor" />
      <circle cx="16.8" cy="10.5" r="1.15" fill="currentColor" />
    </svg>
  )
}

function IconShieldCheck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.5 5 6v5.2c0 4.5 2.98 7.9 7 9.3 4.02-1.4 7-4.8 7-9.3V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m9.25 12 1.9 1.9L14.75 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSparkles({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M11 3.5c.35 2.1 1.05 3.5 2 4.5s2.4 1.65 4.5 2c-2.1.35-3.55 1-4.5 2s-1.65 2.4-2 4.5c-.35-2.1-1.05-3.5-2-4.5s-2.4-1.65-4.5-2c2.1-.35 3.55-1 4.5-2s1.65-2.4 2-4.5Z"
        fill="currentColor"
      />
      <path
        d="M18.5 15c.16.98.48 1.63.93 2.08.45.45 1.1.77 2.07.92-.98.16-1.62.48-2.07.92-.45.45-.77 1.1-.93 2.08-.15-.98-.48-1.63-.92-2.08-.45-.44-1.1-.76-2.08-.92.98-.15 1.63-.47 2.08-.92.44-.45.77-1.1.92-2.08Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function PengaturanGuruPage() {
  return (
    <div className="space-y-6">
      {/* Header halaman */}
      <div>
        <h1 className="text-[19px] font-bold leading-tight text-[#16233f] dark:text-white sm:text-[22px]">
          Pengaturan
        </h1>
        <p className="mt-0.5 text-[12.5px] text-[#8b93a6] dark:text-white/40">
          Sesuaikan tampilan dan preferensi Portal Guru Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Kartu utama — Tema Tampilan (3D) */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)] sm:p-6 lg:col-span-2">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-[#16233f]/[0.04] blur-2xl dark:bg-white/[0.04]"
            aria-hidden="true"
          />

          <div className="relative flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_16px_-6px_rgba(67,56,202,0.55)] ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <IconPalette className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">Tema Tampilan</h2>
              <p className="mt-0.5 text-[12px] text-[#8b93a6] dark:text-white/40">
                Pilih tampilan terang, gelap, atau ikuti pengaturan sistem perangkat Anda.
              </p>
            </div>
          </div>

          <div className="relative mt-5 border-t border-[#edf0ef] pt-4 dark:border-white/10">
            <ThemeToggle />
          </div>
        </Card>

        {/* Kartu info samping — mengisi lebar, konsisten dengan halaman lain */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)] lg:col-span-1">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#16233f]/[0.04] blur-2xl dark:bg-white/[0.04]"
            aria-hidden="true"
          />

          <div className="relative flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#6ee7b7] to-[#047857] text-white shadow-[0_8px_16px_-6px_rgba(4,120,87,0.5)] ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <IconShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">Preferensi Tersimpan</h2>
              <p className="mt-0.5 text-[12px] text-[#8b93a6] dark:text-white/40">
                Berlaku otomatis di semua perangkat
              </p>
            </div>
          </div>

          <div className="relative mt-4 space-y-2.5 border-t border-[#edf0ef] pt-4 dark:border-white/10">
            <div className="flex items-start gap-2 text-[12px] leading-relaxed text-[#5b657d] dark:text-white/50">
              <IconSparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#818cf8]" />
              <span>Pilihan tema disimpan otomatis dan berlaku setiap kali Anda masuk ke Portal Guru.</span>
            </div>
            <div className="flex items-start gap-2 text-[12px] leading-relaxed text-[#5b657d] dark:text-white/50">
              <IconSparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#818cf8]" />
              <span>Mode &quot;Sistem&quot; mengikuti pengaturan gelap/terang pada perangkat Anda secara otomatis.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
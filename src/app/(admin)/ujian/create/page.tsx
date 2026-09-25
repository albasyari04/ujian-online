import Link from "next/link"

import { FormUjian } from "@/components/admin/FormUjian"

/* =========================================================
   ICONS
========================================================= */

function IconDocumentPlus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 3.5H14.5L18.5 7.5V20.5H7V3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M14.5 3.5V7.5H18.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12.75 12v5.5M10 14.75h5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconArrowLeft({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function CreateUjianPage() {
  return (
    <div className="space-y-6">
      {/* Tombol kembali */}
      <Link
        href="/ujian"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#8b87a8] transition-colors hover:text-[#4338ca] dark:text-white/50 dark:hover:text-[#a5b4fc]"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke daftar ujian
      </Link>

      {/* Header halaman */}
      <div className="flex items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_16px_-6px_rgba(67,56,202,0.55)] ring-1 ring-inset ring-black/5 dark:ring-white/10">
          <IconDocumentPlus className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 className="text-[19px] font-bold leading-tight text-[#241f4d] dark:text-white sm:text-[22px]">
            Buat Ujian
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[#8b87a8] dark:text-white/50">
            Lengkapi detail ujian di bawah ini — judul, jadwal, durasi, dan aturan pelanggaran.
          </p>
        </div>
      </div>

      {/* Card pembungkus form — gaya 3D */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-white via-[#fbfaff] to-[#f5f3ff] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#efedfa,0_18px_30px_-18px_rgba(37,26,110,0.35)] dark:from-[#181530] dark:via-[#14112a] dark:to-[#100d24] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d0a1f,0_20px_32px_-18px_rgba(0,0,0,0.6)] sm:p-6">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-[#4338ca]/[0.05] blur-2xl dark:bg-white/[0.04]"
          aria-hidden="true"
        />

        <div className="relative">
          <FormUjian />
        </div>
      </div>
    </div>
  )
}
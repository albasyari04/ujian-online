"use client"

import { useState, useTransition, type ReactElement } from "react"
import type { Notifikasi as NotifikasiRow, TipeNotifikasi } from "@prisma/client"

import { tandaiDibaca, tandaiSemuaDibaca } from "@/lib/actions/notifikasi"

/* =========================================================
   ICONS
========================================================= */

function IconClipboardCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 3.5H14.5L18.5 7.5V20.5H7V3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.5 3.5V7.5H18.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 13.5L11 15L15 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClockAlert({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9V13.2L14.8 15.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 3.5H14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconTrophy({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 4.5H17V9C17 11.8 14.8 14 12 14C9.2 14 7 11.8 7 9V4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 6H4.5V8C4.5 9.4 5.6 10.5 7 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 6H19.5V8C19.5 9.4 18.4 10.5 17 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 14V17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.5 17.5H14.5V20H9.5V17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function IconAlertTriangle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 4.5L21 19.5H3L12 4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10V14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </svg>
  )
}

function IconInfo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11V16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" />
    </svg>
  )
}

/* =========================================================
   KONFIGURASI TIPE NOTIFIKASI
========================================================= */

const TIPE_CONFIG: Record<
  TipeNotifikasi,
  { icon: (props: { className?: string }) => ReactElement; bg: string; text: string }
> = {
  UJIAN_TERSEDIA: { icon: IconClipboardCheck, bg: "bg-[#eaf1ff]", text: "text-[#2563a8]" },
  UJIAN_SEGERA_TUTUP: { icon: IconClockAlert, bg: "bg-[#fdf6e7]", text: "text-[#b45309]" },
  HASIL_TERSEDIA: { icon: IconTrophy, bg: "bg-[#eafbf3]", text: "text-[#1f8a5f]" },
  PELANGGARAN: { icon: IconAlertTriangle, bg: "bg-[#fdf1f1]", text: "text-[#d23b3b]" },
  SISTEM: { icon: IconInfo, bg: "bg-[#f0efe8]", text: "text-[#5b6a86]" },
}

function formatWaktuRelatif(value: Date) {
  const tanggal = new Date(value)
  const detik = Math.floor((Date.now() - tanggal.getTime()) / 1000)

  if (detik < 60) return "Baru saja"
  const menit = Math.floor(detik / 60)
  if (menit < 60) return `${menit} menit lalu`
  const jam = Math.floor(menit / 60)
  if (jam < 24) return `${jam} jam lalu`
  const hari = Math.floor(jam / 24)
  if (hari < 7) return `${hari} hari lalu`

  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(tanggal)
}

/* =========================================================
   NOTIFIKASI CLIENT
========================================================= */

export function NotifikasiClient({ notifikasiAwal }: { notifikasiAwal: NotifikasiRow[] }) {
  const [daftar, setDaftar] = useState(notifikasiAwal)
  const [isPending, startTransition] = useTransition()

  const belumDibaca = daftar.filter((n) => !n.dibaca).length

  function handleTandaiDibaca(id: string) {
    setDaftar((prev) => prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n)))

    startTransition(async () => {
      try {
        await tandaiDibaca(id)
      } catch {
        setDaftar((prev) => prev.map((n) => (n.id === id ? { ...n, dibaca: false } : n)))
      }
    })
  }

  function handleTandaiSemua() {
    if (belumDibaca === 0) return
    const sebelumnya = daftar
    setDaftar((prev) => prev.map((n) => ({ ...n, dibaca: true })))

    startTransition(async () => {
      try {
        await tandaiSemuaDibaca()
      } catch {
        setDaftar(sebelumnya)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-[#5b6a86]">
          {belumDibaca > 0 ? `${belumDibaca} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
        </p>
        <button
          type="button"
          onClick={handleTandaiSemua}
          disabled={belumDibaca === 0 || isPending}
          className="shrink-0 rounded-[10px] border border-[#e7e4dc] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#16233f] shadow-[0_2px_6px_rgba(22,35,63,0.06)] transition-colors hover:bg-[#f6f4ec] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tandai semua dibaca
        </button>
      </div>

      {daftar.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[#e7e4dc] bg-white/60 px-4 py-10 text-center">
          <p className="text-[13px] text-[#8b93a6]">Belum ada notifikasi untuk Anda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {daftar.map((n) => {
            const cfg = TIPE_CONFIG[n.tipe]
            const Icon = cfg.icon

            return (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.dibaca && handleTandaiDibaca(n.id)}
                className={`flex w-full items-start gap-3 rounded-[14px] border px-4 py-3.5 text-left transition-colors ${
                  n.dibaca
                    ? "border-[#efece4] bg-white hover:bg-[#f9f8f4]"
                    : "border-[#f0d9ad] bg-[#fdf6e7] hover:bg-[#fbeed0]"
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${cfg.bg} ${cfg.text}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13.5px] font-semibold text-[#16233f]">{n.judul}</p>
                    {!n.dibaca && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8a33d]" aria-hidden="true" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#5b6a86]">{n.pesan}</p>
                  <p className="mt-1 text-[11px] text-[#8b93a6]">{formatWaktuRelatif(n.createdAt)}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
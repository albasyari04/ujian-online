"use client"

import { useEffect, useState } from "react"

function IconClock({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12L15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Timer({
  waktuSelesai,
  onHabis,
}: {
  waktuSelesai: string
  onHabis: () => void
}) {
  const [sisaDetik, setSisaDetik] = useState<number>(() => {
    const selisih = new Date(waktuSelesai).getTime() - Date.now()
    return Math.max(0, Math.floor(selisih / 1000))
  })

  useEffect(() => {
    if (sisaDetik <= 0) {
      onHabis()
      return
    }
    const interval = setInterval(() => {
      setSisaDetik((current) => {
        if (current <= 1) {
          clearInterval(interval)
          onHabis()
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [sisaDetik, onHabis])

  const jam = Math.floor(sisaDetik / 3600)
  const menit = Math.floor((sisaDetik % 3600) / 60)
  const detik = sisaDetik % 60

  const kritis = sisaDetik < 5 * 60 // < 5 menit
  const warning = sisaDetik < 15 * 60 // < 15 menit

  const warna = kritis
    ? "from-red-500 to-red-700 shadow-[0_4px_0_#991b1b,0_10px_20px_-6px_rgba(220,38,38,0.6)]"
    : warning
      ? "from-amber-500 to-amber-700 shadow-[0_4px_0_#b45309,0_10px_20px_-6px_rgba(217,119,6,0.6)]"
      : "from-[#818cf8] to-[#4338ca] shadow-[0_4px_0_#3730a3,0_10px_20px_-6px_rgba(67,56,202,0.6)]"

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-br px-3.5 py-2 text-white transition-all duration-300 ${warna} ${
        kritis ? "animate-pulse" : ""
      }`}
    >
      <IconClock className="h-4 w-4" />
      <span className="font-mono text-[14px] font-bold tabular-nums">
        {String(jam).padStart(2, "0")}:{String(menit).padStart(2, "0")}:{String(detik).padStart(2, "0")}
      </span>
    </div>
  )
}
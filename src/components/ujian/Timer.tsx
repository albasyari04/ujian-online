"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Timer hitung mundur berbasis WAKTU DEADLINE (bukan durasi lokal).
 * Ini penting untuk keamanan: jika peserta menutup tab lalu buka lagi,
 * atau mengubah jam device, sisa waktu tetap dihitung dari `waktuSelesai`
 * yang berasal dari server (HasilUjian.waktuMulai + durasiMenit / Ujian.selesai).
 */
export function Timer({
  waktuSelesai,
  onHabis,
  ambangBahaya = 5 * 60, // detik — di bawah ini timer jadi merah & berkedip
}: {
  waktuSelesai: Date | string
  onHabis?: () => void
  ambangBahaya?: number
}) {
  const deadline = useRef(new Date(waktuSelesai).getTime())
  const sudahTriggerHabis = useRef(false)

  const [sisaDetik, setSisaDetik] = useState(() => hitungSisaDetik(new Date(waktuSelesai).getTime()))

  useEffect(() => {
    deadline.current = new Date(waktuSelesai).getTime()
    sudahTriggerHabis.current = false
    setSisaDetik(hitungSisaDetik(deadline.current))
  }, [waktuSelesai])

  useEffect(() => {
    const interval = setInterval(() => {
      const sisa = hitungSisaDetik(deadline.current)
      setSisaDetik(sisa)

      if (sisa <= 0 && !sudahTriggerHabis.current) {
        sudahTriggerHabis.current = true
        onHabis?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [onHabis])

  const bahaya = sisaDetik <= ambangBahaya
  const habis = sisaDetik <= 0

  return (
    <div
      className={`flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-[14px] font-semibold tabular-nums ${
        habis
          ? "bg-[#fdeaea] text-[#d23b3b]"
          : bahaya
            ? "animate-pulse bg-[#fdeaea] text-[#d23b3b]"
            : "bg-[#eef0fc] text-[#4338ca]"
      }`}
      role="timer"
      aria-live="polite"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 9V13L14.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 2.5H14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {habis ? "Waktu habis" : formatDurasi(sisaDetik)}
    </div>
  )
}

function hitungSisaDetik(deadlineMs: number): number {
  return Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000))
}

function formatDurasi(totalDetik: number): string {
  const jam = Math.floor(totalDetik / 3600)
  const menit = Math.floor((totalDetik % 3600) / 60)
  const detik = totalDetik % 60

  const pad = (n: number) => String(n).padStart(2, "0")

  return jam > 0 ? `${pad(jam)}:${pad(menit)}:${pad(detik)}` : `${pad(menit)}:${pad(detik)}`
}
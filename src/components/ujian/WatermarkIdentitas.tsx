"use client"

import { useEffect, useState } from "react"

/**
 * Watermark transparan yang di-tile di seluruh layar, menampilkan identitas
 * peserta + waktu real-time. Dipasang di atas seluruh halaman ujian (z-tinggi,
 * pointer-events-none) sehingga tidak mengganggu interaksi tapi tetap ikut
 * terekam jika peserta screenshot/screen-record dan membagikannya ke orang lain.
 */
export function WatermarkIdentitas({ nama, email }: { nama: string; email: string }) {
  const [waktu, setWaktu] = useState(() => formatWaktuSekarang())

  useEffect(() => {
    const interval = setInterval(() => setWaktu(formatWaktuSekarang()), 30_000)
    return () => clearInterval(interval)
  }, [])

  const teks = `${nama} · ${email} · ${waktu}`
  const baris = Array.from({ length: 30 })

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] select-none overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 flex -rotate-[28deg] flex-col justify-between opacity-[0.055]" style={{ inset: "-25%" }}>
        {baris.map((_, i) => (
          <p key={i} className="whitespace-nowrap text-[12.5px] font-medium leading-[3.4] text-[#16233f]">
            {Array.from({ length: 8 }, () => teks).join("        ")}
          </p>
        ))}
      </div>
    </div>
  )
}

function formatWaktuSekarang(): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())
}
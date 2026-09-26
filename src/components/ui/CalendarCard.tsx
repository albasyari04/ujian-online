"use client"

import { useMemo, useState } from "react"
import Image from "next/image"

import { Card } from "@/components/ui/Card"
import { IconChevronLeft, IconChevronRight } from "@/components/ui/Icons"

type StatusJadwal = "berlangsung" | "akan_datang" | "berakhir"

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

/** Warna dot per status, dipakai konsisten dengan warna badge status di daftar jadwal. */
const dotColor: Record<StatusJadwal, string> = {
  berlangsung: "#10b981", // hijau — ujian sedang berjalan hari itu
  akan_datang: "#3457c9", // biru — ujian yang akan datang
  berakhir: "#e8a33d", // oranye — ujian yang sudah berakhir
}

const legenda: { status: StatusJadwal; label: string }[] = [
  { status: "berlangsung", label: "Tanggal ujian" },
  { status: "akan_datang", label: "Ujian akan datang" },
  { status: "berakhir", label: "Ujian selesai" },
]

function buildKalender(tahun: number, bulan: number) {
  const offset = new Date(tahun, bulan, 1).getDay()
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()

  const sel: Array<{ tanggal: number; key: string } | null> = []
  for (let i = 0; i < offset; i++) sel.push(null)
  for (let d = 1; d <= jumlahHari; d++) sel.push({ tanggal: d, key: `${tahun}-${bulan}-${d}` })
  while (sel.length % 7 !== 0) sel.push(null)

  const minggu: Array<typeof sel> = []
  for (let i = 0; i < sel.length; i += 7) minggu.push(sel.slice(i, i + 7))
  return minggu
}

export function CalendarCard({
  initialYear,
  initialMonth,
  todayKey,
  markedDates,
}: {
  initialYear: number
  /** 0-indexed, sesuai konvensi Date.getMonth() */
  initialMonth: number
  /** Kunci tanggal hari ini, format `${tahun}-${bulan}-${tanggal}` */
  todayKey: string
  /** Peta tanggal (format sama dengan `todayKey`) ke status ujian pada tanggal tsb */
  markedDates: Record<string, StatusJadwal>
}) {
  const [tampil, setTampil] = useState({ tahun: initialYear, bulan: initialMonth })

  const minggu = useMemo(() => buildKalender(tampil.tahun, tampil.bulan), [tampil])

  const gantiBulan = (delta: number) => {
    setTampil((prev) => {
      const total = prev.bulan + delta
      const tahunBaru = prev.tahun + Math.floor(total / 12)
      const bulanBaru = ((total % 12) + 12) % 12
      return { tahun: tahunBaru, bulan: bulanBaru }
    })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0efe8] dark:bg-white/10">
            <Image
              src="/image/icon/calender.png"
              alt=""
              width={16}
              height={16}
              className="h-3.5 w-3.5 object-contain"
            />
          </span>
          <p className="text-[13.5px] font-semibold text-[#16233f] dark:text-white">
            {NAMA_BULAN[tampil.bulan]} {tampil.tahun}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => gantiBulan(-1)}
            aria-label="Bulan sebelumnya"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#8b93a6] transition-colors hover:bg-[#f0efe8] hover:text-[#16233f] dark:hover:bg-white/10 dark:hover:text-white"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => gantiBulan(1)}
            aria-label="Bulan berikutnya"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#8b93a6] transition-colors hover:bg-[#f0efe8] hover:text-[#16233f] dark:hover:bg-white/10 dark:hover:text-white"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1.5 text-center">
        {HARI.map((hari) => (
          <span key={hari} className="text-[10.5px] font-medium text-[#8b93a6] dark:text-white/40">
            {hari}
          </span>
        ))}

        {minggu.map((mgg, i) =>
          mgg.map((hari, j) => {
            if (!hari) return <span key={`${i}-${j}`} />
            const status = markedDates[hari.key]
            const iniHari = hari.key === todayKey
            return (
              <span
                key={hari.key}
                className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] transition-colors ${
                  iniHari
                    ? "bg-[#16233f] font-semibold text-white dark:bg-white dark:text-[#16233f]"
                    : status
                      ? "font-medium text-[#16233f] dark:text-white"
                      : "text-[#54627e] dark:text-white/50"
                }`}
              >
                {hari.tanggal}
                {status && !iniHari && (
                  <span
                    className="absolute bottom-0.5 h-1 w-1 rounded-full"
                    style={{ backgroundColor: dotColor[status] }}
                    aria-hidden="true"
                  />
                )}
              </span>
            )
          })
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-[#efece4] pt-3 dark:border-white/10">
        {legenda.map((item) => (
          <p key={item.status} className="flex items-center gap-1.5 text-[11px] text-[#8b93a6] dark:text-white/40">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor[item.status] }} aria-hidden="true" />
            {item.label}
          </p>
        ))}
      </div>
    </Card>
  )
}
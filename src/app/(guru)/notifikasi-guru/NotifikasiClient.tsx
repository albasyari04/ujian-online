"use client"

import { useState } from "react"
import type { ReactElement } from "react"

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IconAlertTriangle, IconCheckCircle, IconDocument, IconClock } from "@/components/ui/Icons"

type TipeNotifikasi = "UJIAN_TERSEDIA" | "UJIAN_SEGERA_TUTUP" | "HASIL_TERSEDIA" | "PELANGGARAN" | "SISTEM"

type Notif = {
  id: string
  judul: string
  pesan: string
  tipe: TipeNotifikasi
  dibaca: boolean
  createdAt: string | Date
}

const TIPE_ICON: Record<TipeNotifikasi, (props: { className?: string }) => ReactElement> = {
  UJIAN_TERSEDIA: IconDocument,
  UJIAN_SEGERA_TUTUP: IconClock,
  HASIL_TERSEDIA: IconCheckCircle,
  PELANGGARAN: IconAlertTriangle,
  SISTEM: IconDocument,
}

function formatWaktu(date: string | Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(date)
  )
}

export function NotifikasiClient({ notifikasiAwal }: { notifikasiAwal: Notif[] }) {
  const [daftar, setDaftar] = useState(notifikasiAwal)

  async function tandaiDibaca(id: string) {
    setDaftar((prev) => prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n)))
    await fetch(`/api/notifikasi/${id}`, { method: "PATCH" }).catch(() => {})
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold text-[#16233f] dark:text-white">Notifikasi</h1>
        <p className="mt-0.5 text-[13px] text-[#5b657d] dark:text-white/50">
          {daftar.filter((n) => !n.dibaca).length} notifikasi belum dibaca.
        </p>
      </div>

      <div className="space-y-2.5">
        {daftar.length === 0 && (
          <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <p className="text-[13.5px] font-medium text-[#5b657d] dark:text-white/50">Belum ada notifikasi.</p>
          </Card>
        )}

        {daftar.map((n) => {
          const Icon = TIPE_ICON[n.tipe]
          return (
            <button
              key={n.id}
              onClick={() => !n.dibaca && tandaiDibaca(n.id)}
              className={`flex w-full items-start gap-3 rounded-[16px] border p-4 text-left transition-colors ${
                n.dibaca
                  ? "border-[#edf0ef] bg-white dark:border-white/10 dark:bg-[#101a30]"
                  : "border-[#c7d2fe] bg-[#eef2ff] dark:border-[#818cf8]/30 dark:bg-[#818cf8]/10"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_16px_-6px_rgba(67,56,202,0.5)]">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13.5px] font-semibold text-[#16233f] dark:text-white">{n.judul}</p>
                  {!n.dibaca && <Badge tone="blue">Baru</Badge>}
                </div>
                <p className="mt-0.5 text-[12.5px] text-[#5b657d] dark:text-white/50">{n.pesan}</p>
                <p className="mt-1 text-[11px] text-[#8b93a6] dark:text-white/40">{formatWaktu(n.createdAt)}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

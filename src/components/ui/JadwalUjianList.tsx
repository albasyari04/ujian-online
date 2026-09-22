"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { IconChevronDown, IconFilter } from "@/components/ui/Icons"
// NOTE: sesuaikan path import ini dengan lokasi file subject-icons.ts di proyek Anda
// (mis. "@/lib/subject-icons" atau "@/utils/subject-icons").
import { getSubjectIconSrc } from "@/lib/subject-icons"

/** Path ikon 3D untuk header "Daftar Jadwal Ujian". */
const ICON_DAFTAR_JADWAL = "/image/icon/daftar-jadwal-ujian-icon.png"

export type StatusJadwal = "berlangsung" | "akan_datang" | "berakhir"
export type StatusHasil = "SEDANG_DIKERJAKAN" | "SELESAI" | null

export type JadwalItemDTO = {
  id: string
  judul: string
  /** Sudah diformat di server (mis. "8 Sep 2026") supaya locale konsisten SSR/CSR */
  tanggalLabel: string
  jamLabel: string
  durasiLabel: string
  jumlahSoal: number
  status: StatusJadwal
  hasilStatus: StatusHasil
  hasilId: string | null
}

const FILTER_OPTIONS: { value: "semua" | StatusJadwal; label: string }[] = [
  { value: "semua", label: "Semua Ujian" },
  { value: "berlangsung", label: "Sedang Berlangsung" },
  { value: "akan_datang", label: "Akan Datang" },
  { value: "berakhir", label: "Sudah Berakhir" },
]

function StatusBadge({ status, hasilStatus }: { status: StatusJadwal; hasilStatus: StatusHasil }) {
  if (status === "berlangsung") {
    if (hasilStatus === "SEDANG_DIKERJAKAN") return <Badge tone="amber">Sedang dikerjakan</Badge>
    if (hasilStatus === "SELESAI") return <Badge tone="emerald">Sudah dikerjakan</Badge>
    return <Badge tone="amber">Berlangsung</Badge>
  }
  if (status === "akan_datang") return <Badge tone="blue">Akan datang</Badge>
  if (hasilStatus === "SELESAI") return <Badge tone="emerald">Selesai</Badge>
  return <Badge tone="red">Terlewat</Badge>
}

function AksiJadwal({ item }: { item: JadwalItemDTO }) {
  const { status, hasilStatus, hasilId, id } = item

  if (status === "akan_datang") {
    return <p className="shrink-0 text-[11.5px] text-[#8b93a6] dark:text-white/40">Menunggu jadwal dibuka</p>
  }

  if (status === "berlangsung") {
    if (hasilStatus === "SEDANG_DIKERJAKAN") {
      return (
        <Link href={`/ujian/${id}`} className="shrink-0">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto">
            Lanjutkan ujian
          </Button>
        </Link>
      )
    }
    if (hasilStatus === "SELESAI") {
      return (
        <Link href={`/hasil/${hasilId}`} className="shrink-0">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Lihat hasil
          </Button>
        </Link>
      )
    }
    return (
      <Link href={`/ujian/${id}`} className="shrink-0">
        <Button size="sm" className="w-full sm:w-auto">
          Mulai ujian
        </Button>
      </Link>
    )
  }

  // berakhir
  if (hasilStatus === "SELESAI") {
    return (
      <Link href={`/hasil/${hasilId}`} className="shrink-0">
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          Lihat hasil
        </Button>
      </Link>
    )
  }

  return <p className="shrink-0 text-[11.5px] font-medium text-[#d23b3b]">Tidak dikerjakan</p>
}

function ItemJadwalCard({ item }: { item: JadwalItemDTO }) {
  return (
    <Card className="group relative flex flex-col gap-3.5 overflow-hidden bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_0_#e3e7ee,0_22px_34px_-16px_rgba(22,35,63,0.4)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_7px_0_#0d1424,0_24px_36px_-16px_rgba(0,0,0,0.68)] sm:flex-row sm:items-center sm:justify-between">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#16233f]/[0.04] blur-2xl dark:bg-white/[0.04]" aria-hidden="true" />

      <div className="relative flex items-start gap-3">
        <Image
          src={getSubjectIconSrc(item.judul)}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_3px_5px_rgba(22,35,63,0.22)] transition-transform duration-300 group-hover:-translate-y-0.5"
        />

        <div className="relative min-w-0">
          <p className="text-[14px] font-semibold text-[#16233f] dark:text-white">{item.judul}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#8b93a6] dark:text-white/40">
            <span>
              {item.tanggalLabel} · {item.jamLabel}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="slate">{item.durasiLabel}</Badge>
            <Badge tone="slate">{item.jumlahSoal} soal</Badge>
            <StatusBadge status={item.status} hasilStatus={item.hasilStatus} />
          </div>
        </div>
      </div>

      <AksiJadwal item={item} />
    </Card>
  )
}

/* =========================================================
   DROPDOWN FILTER
========================================================= */

function FilterDropdown({
  value,
  onChange,
}: {
  value: "semua" | StatusJadwal
  onChange: (value: "semua" | StatusJadwal) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const label = FILTER_OPTIONS.find((option) => option.value === value)?.label ?? "Semua Ujian"

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-[#e7e4dc] bg-white px-3.5 py-2 text-[12.5px] font-medium text-[#16233f] shadow-[0_2px_6px_rgba(6,78,59,0.05)] transition-colors hover:border-[#d3cdbb] dark:border-white/10 dark:bg-[#141c30] dark:text-white"
      >
        <IconFilter className="h-3.5 w-3.5 text-[#8b93a6]" />
        {label}
        <IconChevronDown className={`h-3.5 w-3.5 text-[#8b93a6] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-10 mt-2 w-52 overflow-hidden rounded-xl border border-[#e7e4dc] bg-white py-1.5 shadow-[0_16px_32px_-12px_rgba(6,78,59,0.25)] dark:border-white/10 dark:bg-[#141c30]"
        >
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-[12.5px] transition-colors hover:bg-[#f6f4ee] dark:hover:bg-white/5 ${
                value === option.value ? "font-semibold text-[#0f7a4d] dark:text-emerald-400" : "text-[#3d445a] dark:text-white/70"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* =========================================================
   DAFTAR JADWAL (dengan filter)
========================================================= */

const SEKSI: { status: StatusJadwal; judul: string; kosong: string }[] = [
  { status: "berlangsung", judul: "Sedang berlangsung", kosong: "Tidak ada ujian yang sedang berlangsung saat ini." },
  { status: "akan_datang", judul: "Akan datang", kosong: "Belum ada jadwal ujian mendatang." },
  { status: "berakhir", judul: "Sudah berakhir", kosong: "Belum ada riwayat ujian yang berakhir." },
]

export function JadwalUjianList({ items }: { items: JadwalItemDTO[] }) {
  const [filter, setFilter] = useState<"semua" | StatusJadwal>("semua")

  const seksiTampil = useMemo(() => {
    if (filter === "semua") return SEKSI
    return SEKSI.filter((seksi) => seksi.status === filter)
  }, [filter])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white to-[#eef0f4] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_6px_12px_-6px_rgba(22,35,63,0.3)] dark:from-white/10 dark:to-white/[0.02]">
            <Image src={ICON_DAFTAR_JADWAL} alt="" width={28} height={28} className="h-6 w-6 object-contain" />
          </span>
          <div>
            <h2 className="text-[15.5px] font-semibold text-[#16233f] dark:text-white">Daftar Jadwal Ujian</h2>
            <p className="mt-0.5 text-[12.5px] text-[#8b93a6] dark:text-white/40">
              Berikut adalah jadwal ujian yang telah terdaftar untuk Anda.
            </p>
          </div>
        </div>

        <FilterDropdown value={filter} onChange={setFilter} />
      </div>

      <div className="flex flex-col gap-6">
        {seksiTampil.map((seksi) => {
          const data = items.filter((item) => item.status === seksi.status)
          return (
            <section key={seksi.status} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13.5px] font-semibold text-[#16233f] dark:text-white">{seksi.judul}</h3>
                {data.length > 0 && <Badge tone="slate">{data.length} ujian</Badge>}
              </div>

              {data.length === 0 ? (
                <div className="rounded-[16px] border border-dashed border-[#e7e4dc] bg-white/60 px-4 py-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
                  <p className="text-[13px] text-[#8b93a6] dark:text-white/40">{seksi.kosong}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.map((item) => (
                    <ItemJadwalCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
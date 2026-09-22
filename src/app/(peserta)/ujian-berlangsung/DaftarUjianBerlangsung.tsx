"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { IconAlertTriangle, IconClock } from "@/components/ui/Icons"

import type { UjianBerlangsungData } from "./page"

/* =========================================================
   HELPER WAKTU
========================================================= */

const BATAS_KRITIS_MS = 5 * 60 * 1000 // 5 menit

function formatSisaWaktu(msTersisa: number) {
  if (msTersisa <= 0) return "00:00"

  const totalDetik = Math.floor(msTersisa / 1000)
  const jam = Math.floor(totalDetik / 3600)
  const menit = Math.floor((totalDetik % 3600) / 60)
  const detik = totalDetik % 60

  const bagian = [
    jam > 0 ? String(jam).padStart(2, "0") : null,
    String(menit).padStart(2, "0"),
    String(detik).padStart(2, "0"),
  ].filter((bagian): bagian is string => bagian !== null)

  return bagian.join(":")
}

/* =========================================================
   RINGKASAN PILL
========================================================= */

const ringkasanTone: Record<"amber" | "red" | "slate", string> = {
  amber: "border-[#f0d9ad] bg-[#fdf6e7] text-[#8a6a2f]",
  red: "border-[#f5cccc] bg-[#fdf1f1] text-[#b52f2f]",
  slate: "border-[#e2e5eb] bg-[#f4f5f7] text-[#5b657d]",
}

function RingkasanPill({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "amber" | "red" | "slate"
}) {
  return (
    <div className={`rounded-[14px] border px-4 py-3.5 ${ringkasanTone[tone]}`}>
      <p className="text-[20px] font-semibold leading-none">{value}</p>
      <p className="mt-1.5 text-[11.5px] opacity-80">{label}</p>
    </div>
  )
}

/* =========================================================
   DAFTAR UJIAN BERLANGSUNG
========================================================= */

export function DaftarUjianBerlangsung({ data }: { data: UjianBerlangsungData[] }) {
  const [sekarang, setSekarang] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setSekarang(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const ringkasan = useMemo(() => {
    let kritis = 0
    let waktuHabis = 0

    for (const item of data) {
      const sisaMs = new Date(item.batasWaktuIso).getTime() - sekarang
      if (sisaMs <= 0) waktuHabis += 1
      else if (sisaMs <= BATAS_KRITIS_MS) kritis += 1
    }

    return { total: data.length, kritis, waktuHabis }
  }, [data, sekarang])

  if (data.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fdf6e7] text-[#b45309]">
          <IconClock className="h-6 w-6" />
        </span>
        <div>
          <p className="text-[14.5px] font-semibold text-[#16233f]">Tidak ada ujian yang sedang berlangsung</p>
          <p className="mt-1 max-w-sm text-[13px] text-[#8b93a6]">
            Anda belum memulai ujian apa pun. Buka menu{" "}
            <span className="font-medium text-[#34435f]">Ujian Tersedia</span> untuk mulai mengerjakan.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <RingkasanPill label="Sedang dikerjakan" value={ringkasan.total} tone="amber" />
        <RingkasanPill label="Hampir habis waktu" value={ringkasan.kritis} tone="red" />
        <RingkasanPill label="Waktu habis" value={ringkasan.waktuHabis} tone="slate" />
      </div>

      <div className="flex flex-col gap-3">
        {data.map((item) => (
          <KartuUjianBerlangsung key={item.hasilId} item={item} sekarang={sekarang} />
        ))}
      </div>
    </div>
  )
}

/* =========================================================
   KARTU PER-UJIAN
========================================================= */

function KartuUjianBerlangsung({ item, sekarang }: { item: UjianBerlangsungData; sekarang: number }) {
  const batasWaktu = new Date(item.batasWaktuIso).getTime()
  const msTersisa = batasWaktu - sekarang
  const waktuHabis = msTersisa <= 0
  const kritis = !waktuHabis && msTersisa <= BATAS_KRITIS_MS
  const mendesak = waktuHabis || kritis

  const progres = item.totalSoal > 0 ? Math.round((item.terjawab / item.totalSoal) * 100) : 0
  const sisaBatasPelanggaran = item.batasPelanggaran - item.jumlahPelanggaran
  const pelanggaranDekat = item.jumlahPelanggaran > 0 && sisaBatasPelanggaran <= 1

  return (
    <Card
      className={`flex flex-col gap-3.5 p-4 sm:flex-row sm:items-center sm:justify-between ${
        mendesak ? "border-[#f5cccc] bg-[#fffaf9]" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
            mendesak ? "bg-[#fdf1f1] text-[#d23b3b]" : "bg-[#fdf6e7] text-[#b45309]"
          }`}
        >
          <IconClock className="h-5 w-5" />
        </span>

        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[#16233f]">{item.judul}</p>

          {item.deskripsi && (
            <p className="mt-0.5 line-clamp-2 max-w-md text-[12.5px] text-[#8b93a6]">{item.deskripsi}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="slate">
              {item.terjawab}/{item.totalSoal} soal terjawab
            </Badge>

            <Badge tone={mendesak ? "red" : "amber"}>
              {mendesak && <IconAlertTriangle className="h-3 w-3" />}
              {waktuHabis ? "Waktu habis" : formatSisaWaktu(msTersisa)}
            </Badge>

            {pelanggaranDekat && (
              <Badge tone="red">
                <IconAlertTriangle className="h-3 w-3" />
                Pelanggaran {item.jumlahPelanggaran}/{item.batasPelanggaran}
              </Badge>
            )}
          </div>

          <div className="mt-2.5 h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-[#efece4]">
            <div
              className="h-full rounded-full bg-[#e8a33d] transition-[width] duration-500"
              style={{ width: `${progres}%` }}
            />
          </div>
        </div>
      </div>

      <Link href={`/ujian/${item.ujianId}`} className="shrink-0">
        <Button variant={mendesak ? "danger" : "secondary"} size="sm" className="w-full sm:w-auto">
          {waktuHabis ? "Selesaikan sekarang" : "Lanjutkan sekarang"}
        </Button>
      </Link>
    </Card>
  )
}
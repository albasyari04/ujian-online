import type { StatusUjian, TipePelanggaran, TipeSoal } from "@prisma/client"

/* =========================================================
   FORMAT TANGGAL & WAKTU
========================================================= */

const formatterTanggalWaktu = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const formatterWaktu = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

/** Format Date/string ISO -> "5 Sep 2026, 22.02" */
export function formatTanggalWaktu(value: Date | string | null | undefined): string {
  if (!value) return "-"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "-"
  return formatterTanggalWaktu.format(date).replace(".", ":").replace(/(\d{2}):(\d{2})$/, "$1.$2")
}

/** Format Date/string ISO -> "22.02.05" (jam saja, dipakai di log pelanggaran) */
export function formatWaktu(value: Date | string | null | undefined): string {
  if (!value) return "-"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "-"
  return formatterWaktu.format(date)
}

/** Ubah Date/string ISO menjadi value yang bisa dipakai <input type="datetime-local"> */
export function toDatetimeLocalValue(value: Date | string | null | undefined): string {
  if (!value) return ""
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ""

  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/* =========================================================
   STATUS RUNTIME UJIAN (berdasarkan waktu, bukan field DB)
========================================================= */

export type StatusRuntimeUjian = "BELUM_MULAI" | "BERLANGSUNG" | "SELESAI"

export function statusRuntimeUjian(mulai: Date | string, selesai: Date | string): StatusRuntimeUjian {
  const now = Date.now()
  const t1 = new Date(mulai).getTime()
  const t2 = new Date(selesai).getTime()

  if (now < t1) return "BELUM_MULAI"
  if (now > t2) return "SELESAI"
  return "BERLANGSUNG"
}

export const LABEL_STATUS_RUNTIME: Record<StatusRuntimeUjian, string> = {
  BELUM_MULAI: "Belum mulai",
  BERLANGSUNG: "Berlangsung",
  SELESAI: "Selesai",
}

export const WARNA_STATUS_RUNTIME: Record<StatusRuntimeUjian, string> = {
  BELUM_MULAI: "bg-[#fdf3e2] text-[#b8863b]",
  BERLANGSUNG: "bg-[#e7f5ec] text-[#1f9254]",
  SELESAI: "bg-[#eeecf7] text-[#5b5490]",
}

/* =========================================================
   STATUS HASIL UJIAN (field DB: StatusUjian)
========================================================= */

export const LABEL_STATUS_HASIL: Record<StatusUjian, string> = {
  SEDANG_DIKERJAKAN: "Sedang dikerjakan",
  SELESAI: "Selesai",
}

export const WARNA_STATUS_HASIL: Record<StatusUjian, string> = {
  SEDANG_DIKERJAKAN: "bg-[#fdf3e2] text-[#b8863b]",
  SELESAI: "bg-[#e7f5ec] text-[#1f9254]",
}

/* =========================================================
   TIPE SOAL
========================================================= */

export const LABEL_TIPE_SOAL: Record<TipeSoal, string> = {
  PILIHAN_GANDA: "Pilihan ganda",
  ESSAY: "Essay",
}

/* =========================================================
   TIPE PELANGGARAN
========================================================= */

export const LABEL_TIPE_PELANGGARAN: Record<TipePelanggaran, string> = {
  PINDAH_TAB: "Berpindah tab",
  KELUAR_FULLSCREEN: "Keluar dari mode layar penuh",
  KEHILANGAN_FOKUS: "Kehilangan fokus jendela",
  COPY_PASTE: "Copy / paste",
  KLIK_KANAN: "Klik kanan",
  DEVTOOLS: "Membuka developer tools",
}
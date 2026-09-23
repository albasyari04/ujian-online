"use client"

import { useState } from "react"
import Image from "next/image"
import type { StatusUjian, TipePelanggaran } from "@prisma/client"

import {
  formatTanggalWaktu,
  LABEL_STATUS_HASIL,
  WARNA_STATUS_HASIL,
} from "@/lib/ujian-utils"
import { LogPelanggaranTable } from "./LogPelanggaranTable"

type HasilUjianRow = {
  id: string
  skor: number | null
  waktuMulai: string | Date
  waktuSelesai: string | Date | null
  status: StatusUjian
  jumlahPelanggaran: number
  user: { id: string; nama: string; email: string }
  logPelanggaran: { id: string; tipe: TipePelanggaran; waktu: string | Date }[]
}

export function TabelHasil({
  data,
  totalPoin,
  batasPelanggaran,
}: {
  data: HasilUjianRow[]
  totalPoin: number
  batasPelanggaran: number
}) {
  const [baruDibuka, setBaruDibuka] = useState<string | null>(null)

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ecebf7] bg-white px-6 py-16 text-center shadow-[0_10px_24px_-18px_rgba(37,26,110,0.4),0_4px_0_#f5f4fb]">
        <Image
          src="/image/icon/peserta-icon.png"
          alt="Belum ada peserta"
          width={48}
          height={48}
          className="mx-auto mb-3 object-contain opacity-50 grayscale"
        />
        <p className="mt-3 text-[14px] font-medium text-[#241f4d]">Belum ada peserta</p>
        <p className="mt-1 text-[12.5px] text-[#8b87a8]">Hasil akan muncul di sini setelah peserta mengerjakan ujian.</p>
      </div>
    )
  }

  const jumlahSelesai = data.filter((r) => r.status === "SELESAI").length
  const skorTerkumpul = data.filter((r) => r.skor !== null).map((r) => r.skor as number)
  const rataRata = skorTerkumpul.length
    ? Math.round((skorTerkumpul.reduce((a, b) => a + b, 0) / skorTerkumpul.length) * 10) / 10
    : null
  const totalPelanggaran = data.reduce((total, r) => total + r.jumlahPelanggaran, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* ===== Kartu ringkasan ===== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KartuRingkasan
          iconSrc="/image/icon/peserta-icon.png"
          label="Peserta"
          value={String(data.length)}
        />
        <KartuRingkasan
          iconSrc="/image/icon/selesai-icon.png"
          label="Selesai"
          value={String(jumlahSelesai)}
        />
        <KartuRingkasan
          iconSrc="/image/icon/rata-rata-score.png"
          label="Rata-rata skor"
          value={rataRata !== null ? `${rataRata}` : "–"}
          sub={rataRata !== null ? `dari ${totalPoin}` : undefined}
        />
        <KartuRingkasan
          iconSrc="/image/icon/peringatan-icon.png"
          label="Total pelanggaran"
          value={String(totalPelanggaran)}
          aksen={totalPelanggaran > 0 ? "peringatan" : "netral"}
        />
      </div>

      {/* ===== Daftar peserta ===== */}
      <div className="flex flex-col gap-3">
        {data.map((row) => {
          const terbuka = baruDibuka === row.id
          const melebihiBatas = row.jumlahPelanggaran >= batasPelanggaran
          const adaPelanggaranRingan = row.jumlahPelanggaran > 0 && !melebihiBatas
          const persenSkor =
            row.skor !== null && totalPoin > 0 ? Math.min(100, Math.round((row.skor / totalPoin) * 100)) : null

          return (
            <div
              key={row.id}
              className="rounded-2xl border border-[#ecebf7] bg-white p-4 shadow-[0_10px_24px_-18px_rgba(37,26,110,0.4),0_4px_0_#f5f4fb] transition-shadow duration-200 hover:shadow-[0_18px_32px_-18px_rgba(37,26,110,0.45),0_5px_0_#ecebfa] sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Identitas peserta */}
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src="/image/icon/user-icon.png"
                    alt={row.user.nama}
                    width={40}
                    height={40}
                    className="shrink-0 object-contain"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#241f4d]">{row.user.nama}</p>
                    <p className="truncate text-[12px] text-[#8b87a8]">{row.user.email}</p>
                  </div>
                </div>

                {/* Skor + status + pelanggaran + waktu */}
                <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-6">
                  <div className="w-24 shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[16px] font-semibold text-[#241f4d]">
                        {row.skor === null ? "–" : row.skor}
                      </span>
                      {row.skor !== null && <span className="text-[11px] text-[#a29cc4]">/ {totalPoin}</span>}
                    </div>
                    {persenSkor !== null && (
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f1effc]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#4338ca] to-[#6d5ce8]"
                          style={{ width: `${persenSkor}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${WARNA_STATUS_HASIL[row.status]}`}
                  >
                    {LABEL_STATUS_HASIL[row.status]}
                  </span>

                  <button
                    type="button"
                    onClick={() => setBaruDibuka(terbuka ? null : row.id)}
                    disabled={row.jumlahPelanggaran === 0}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                      melebihiBatas
                        ? "bg-[#fdecec] text-[#d23b3b] hover:bg-[#fbdede]"
                        : adaPelanggaranRingan
                          ? "bg-[#fef3e2] text-[#c8830f] hover:bg-[#fce8c8]"
                          : "bg-[#f4f3fa] text-[#a29cc4]"
                    } ${row.jumlahPelanggaran > 0 ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <Image
                      src="/image/icon/peringatan-icon.png"
                      alt="Warning"
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                    {row.jumlahPelanggaran} / {batasPelanggaran}
                  </button>

                  <div className="hidden shrink-0 text-right text-[11.5px] text-[#8b87a8] lg:block">
                    <p>{formatTanggalWaktu(row.waktuMulai)}</p>
                    <p className="text-[#c1b8f2]">
                      {row.waktuSelesai ? `→ ${formatTanggalWaktu(row.waktuSelesai)}` : "→ belum selesai"}
                    </p>
                  </div>

                  {row.jumlahPelanggaran > 0 && (
                    <button
                      type="button"
                      onClick={() => setBaruDibuka(terbuka ? null : row.id)}
                      className="shrink-0 text-[12px] font-medium text-[#4338ca] hover:underline"
                    >
                      {terbuka ? "Tutup log" : "Lihat log"}
                    </button>
                  )}
                </div>
              </div>

              {/* Waktu — tampil di mobile/tablet (disembunyikan di baris atas untuk layar lg+) */}
              <p className="mt-2 text-[11.5px] text-[#8b87a8] lg:hidden">
                {formatTanggalWaktu(row.waktuMulai)}
                <span className="mx-1 text-[#c1b8f2]">→</span>
                {row.waktuSelesai ? formatTanggalWaktu(row.waktuSelesai) : "belum selesai"}
              </p>

              {terbuka && (
                <div className="mt-4 rounded-[12px] border border-[#f1effc] bg-[#faf9ff] p-3">
                  <LogPelanggaranTable logs={row.logPelanggaran} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* =========================================================
   Sub-komponen kartu ringkasan — icon polos tanpa kotak/background,
   card putih dipertahankan sebagai wadah utama tiap statistik.
========================================================= */
function KartuRingkasan({
  iconSrc,
  label,
  value,
  sub,
  aksen = "netral",
}: {
  iconSrc: string
  label: string
  value: string
  sub?: string
  aksen?: "netral" | "peringatan"
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#ecebf7] bg-white p-4 shadow-[0_10px_24px_-18px_rgba(37,26,110,0.4),0_4px_0_#f5f4fb]">
      <Image
        src={iconSrc}
        alt={label}
        width={40}
        height={40}
        className="shrink-0 object-contain"
      />
      <div className="min-w-0">
        <p
          className={`text-[17px] font-semibold leading-tight ${
            aksen === "peringatan" && value !== "0" ? "text-[#c8830f]" : "text-[#241f4d]"
          }`}
        >
          {value}
          {sub && <span className="ml-1 text-[11px] font-normal text-[#a29cc4]">{sub}</span>}
        </p>
        <p className="truncate text-[11.5px] text-[#8b87a8]">{label}</p>
      </div>
    </div>
  )
}
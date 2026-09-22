"use client"

import { Fragment, useState } from "react"
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
      <div className="rounded-2xl border border-[#ecebf7] bg-white p-8 text-center text-[13.5px] text-[#8b87a8]">
        Belum ada peserta yang mengerjakan ujian ini.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#ecebf7] bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-[#faf9fd] text-[#8b87a8]">
          <tr>
            <th className="px-4 py-3 font-medium">Peserta</th>
            <th className="px-4 py-3 font-medium">Skor</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Pelanggaran</th>
            <th className="px-4 py-3 font-medium">Waktu mulai</th>
            <th className="px-4 py-3 font-medium">Waktu selesai</th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const terbuka = baruDibuka === row.id
            const melebihiBatas = row.jumlahPelanggaran >= batasPelanggaran

            return (
              <Fragment key={row.id}>
                <tr className="border-t border-[#f1f0f8]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#241f4d]">{row.user.nama}</p>
                    <p className="text-[11.5px] text-[#8b87a8]">{row.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[#241f4d]">
                    {row.skor === null ? "-" : `${row.skor} / ${totalPoin}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium ${WARNA_STATUS_HASIL[row.status]}`}>
                      {LABEL_STATUS_HASIL[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium ${
                        melebihiBatas ? "bg-[#fdeaea] text-[#d23b3b]" : "bg-[#f1f0f8] text-[#5b5490]"
                      }`}
                    >
                      {row.jumlahPelanggaran} / {batasPelanggaran}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8b87a8]">{formatTanggalWaktu(row.waktuMulai)}</td>
                  <td className="px-4 py-3 text-[#8b87a8]">{formatTanggalWaktu(row.waktuSelesai)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setBaruDibuka(terbuka ? null : row.id)}
                      className="text-[12px] font-medium text-[#4338ca] hover:underline"
                    >
                      {terbuka ? "Tutup" : "Log"}
                    </button>
                  </td>
                </tr>

                {terbuka && (
                  <tr className="border-t border-[#f1f0f8] bg-[#faf9fd]">
                    <td colSpan={7} className="px-4 py-3">
                      <LogPelanggaranTable logs={row.logPelanggaran} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
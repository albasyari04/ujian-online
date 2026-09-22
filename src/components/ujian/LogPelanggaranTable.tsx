import type { TipePelanggaran } from "@prisma/client"

import { formatWaktu, LABEL_TIPE_PELANGGARAN } from "@/lib/ujian-utils"

type LogPelanggaran = {
  id: string
  tipe: TipePelanggaran
  waktu: string | Date
}

export function LogPelanggaranTable({ logs }: { logs: LogPelanggaran[] }) {
  if (logs.length === 0) {
    return <p className="px-1 py-3 text-[13px] text-[#8b87a8]">Tidak ada pelanggaran yang tercatat.</p>
  }

  return (
    <table className="w-full text-left text-[12.5px]">
      <thead>
        <tr className="text-[#8b87a8]">
          <th className="w-10 py-1.5 pr-2 font-medium">No.</th>
          <th className="py-1.5 pr-2 font-medium">Jenis pelanggaran</th>
          <th className="w-32 py-1.5 font-medium">Waktu</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, index) => (
          <tr key={log.id} className="border-t border-[#f1f0f8]">
            <td className="py-1.5 pr-2 text-[#8b87a8]">{index + 1}</td>
            <td className="py-1.5 pr-2 text-[#3a3564]">{LABEL_TIPE_PELANGGARAN[log.tipe]}</td>
            <td className="py-1.5 text-[#8b87a8]">{formatWaktu(log.waktu)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
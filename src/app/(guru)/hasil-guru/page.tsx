import Link from "next/link"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/Card"

export default async function HasilGuruPage() {
  const guru = await requireGuruSession()

  const ujian = await prisma.ujian.findMany({
    where: { pembuatId: guru.user.id },
    orderBy: { mulai: "desc" },
    include: { hasilUjian: { select: { skor: true, status: true } } },
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold text-[#16233f] dark:text-white">Hasil & Nilai</h1>
        <p className="mt-0.5 text-[13px] text-[#5b657d] dark:text-white/50">
          Pilih ujian untuk melihat rincian nilai peserta.
        </p>
      </div>

      {ujian.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <p className="text-[13.5px] font-medium text-[#5b657d] dark:text-white/50">Anda belum memiliki ujian.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ujian.map((u) => {
            const selesai = u.hasilUjian.filter((h) => h.status === "SELESAI" && h.skor !== null)
            const rataRata = selesai.length
              ? Math.round((selesai.reduce((s, h) => s + (h.skor ?? 0), 0) / selesai.length) * 10) / 10
              : null

            return (
              <Link key={u.id} href={`/hasil-guru/${u.id}`}>
                <Card className="flex flex-col gap-3 p-4 transition-transform hover:-translate-y-0.5">
                  <h3 className="line-clamp-2 text-[14px] font-semibold text-[#16233f] dark:text-white">{u.judul}</h3>

                  <div className="grid grid-cols-3 gap-2 rounded-[12px] bg-[#f7f9f8] p-2.5 dark:bg-white/5">
                    <div className="text-center">
                      <p className="text-[15px] font-semibold text-[#16233f] dark:text-white">{u.hasilUjian.length}</p>
                      <p className="text-[10.5px] text-[#8b93a6] dark:text-white/40">Peserta</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-semibold text-[#16233f] dark:text-white">{selesai.length}</p>
                      <p className="text-[10.5px] text-[#8b93a6] dark:text-white/40">Selesai</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-semibold text-[#16233f] dark:text-white">{rataRata ?? "—"}</p>
                      <p className="text-[10.5px] text-[#8b93a6] dark:text-white/40">Rata-rata</p>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
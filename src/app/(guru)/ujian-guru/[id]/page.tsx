import { notFound } from "next/navigation"
import Link from "next/link"

import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IconArrowLeft, IconUsers, IconDocument, IconClock } from "@/components/ui/Icons"
import { SoalManagerClient } from "./SoalManagerClient"

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function DetailUjianGuruPage({ params }: { params: { id: string } }) {
  const guru = await requireGuruSession()

  const ujian = await prisma.ujian.findFirst({
    where: { id: params.id, pembuatId: guru.id },
    include: {
      soal: { orderBy: { urutan: "asc" }, include: { opsi: { orderBy: { urutan: "asc" } } } },
      _count: { select: { hasilUjian: true } },
    },
  })

  if (!ujian) notFound()

  const totalPoin = ujian.soal.reduce((sum, s) => sum + s.poin, 0)

  return (
    <div className="space-y-5">
      <Link
        href="/ujian-guru"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5b657d] hover:text-[#4338ca] dark:text-white/50 dark:hover:text-[#818cf8]"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke Ujian Saya
      </Link>

      <Card className="p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-[19px] font-semibold text-[#16233f] dark:text-white">{ujian.judul}</h1>
            {ujian.deskripsi && (
              <p className="mt-1.5 text-[13px] text-[#5b657d] dark:text-white/50">{ujian.deskripsi}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[#8b93a6] dark:text-white/40">
              <span className="flex items-center gap-1.5">
                <IconClock className="h-3.5 w-3.5" />
                {formatTanggal(ujian.mulai)} – {formatTanggal(ujian.selesai)}
              </span>
              <span className="flex items-center gap-1.5">
                <IconDocument className="h-3.5 w-3.5" />
                {ujian.soal.length} soal · {totalPoin} poin
              </span>
              <span className="flex items-center gap-1.5">
                <IconUsers className="h-3.5 w-3.5" />
                {ujian._count.hasilUjian} peserta
              </span>
            </div>
          </div>
          <Link href={`/hasil-guru/${ujian.id}`}>
            <Badge tone="blue" className="cursor-pointer px-3 py-1.5 text-[12px]">
              Lihat Hasil & Nilai →
            </Badge>
          </Link>
        </div>
      </Card>

      <SoalManagerClient ujianId={ujian.id} soalAwal={ujian.soal} />
    </div>
  )
}

import Link from "next/link"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { TabelHasil } from "@/components/admin/TabelHasil"

export default async function HasilUjianPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ujian = await prisma.ujian.findUnique({
    where: { id },
    select: {
      id: true,
      judul: true,
      batasPelanggaran: true,
      soal: { select: { poin: true } },
    },
  })

  if (!ujian) {
    notFound()
  }

  const totalPoin = ujian.soal.reduce((total, soal) => total + soal.poin, 0)

  const daftarHasil = await prisma.hasilUjian.findMany({
    where: { ujianId: ujian.id },
    include: {
      user: { select: { id: true, nama: true, email: true } },
      logPelanggaran: { orderBy: { waktu: "asc" } },
    },
    orderBy: [{ waktuMulai: "asc" }],
  })

  const selesaiCount = daftarHasil.filter((h) => h.status === "SELESAI").length

  return (
    <div className="space-y-5">
      <div>
        <Link href="/ujian" className="text-[12.5px] font-medium text-[#8b87a8] hover:text-[#4338ca]">
          ← Kembali ke daftar ujian
        </Link>
        <h1 className="mt-1 text-[20px] font-semibold text-[#241f4d]">Hasil — {ujian.judul}</h1>
        <p className="text-[13px] text-[#8b87a8]">
          {daftarHasil.length} peserta mengerjakan · {selesaiCount} sudah selesai
        </p>
      </div>

      <TabelHasil data={daftarHasil} totalPoin={totalPoin} batasPelanggaran={ujian.batasPelanggaran} />
    </div>
  )
}
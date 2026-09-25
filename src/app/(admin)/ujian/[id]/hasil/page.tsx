import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { TabelHasil } from "@/components/ujian/TabelHasil"
import { getSubjectIconSrc } from "@/lib/subject-icons"

export const dynamic = "force-dynamic"
export const revalidate = 0

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
  const iconMapel = getSubjectIconSrc(ujian.judul)

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="border-b border-[#ecebf7] pb-5 dark:border-white/10">
        <Link
          href="/ujian"
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[#8b87a8] transition-colors hover:text-[#4338ca] dark:text-white/50 dark:hover:text-[#a5b4fc]"
        >
          ← Kembali ke daftar ujian
        </Link>

        <div className="mt-2.5 flex items-center gap-3">
          <Image
            src={iconMapel}
            alt={ujian.judul}
            width={38}
            height={38}
            className="shrink-0 object-contain"
          />
          <div className="min-w-0">
            <h1 className="truncate text-[21px] font-semibold leading-tight text-[#241f4d] dark:text-white">
              Hasil — {ujian.judul}
            </h1>
            <p className="mt-0.5 text-[13px] text-[#8b87a8] dark:text-white/50">
              {daftarHasil.length} peserta mengerjakan · {selesaiCount} sudah selesai
            </p>
          </div>
        </div>
      </div>

      <TabelHasil data={daftarHasil} totalPoin={totalPoin} batasPelanggaran={ujian.batasPelanggaran} />
    </div>
  )
}
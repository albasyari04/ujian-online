import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { UjianGuruClient } from "./UjianGuruClient"

export default async function UjianGuruPage({
  searchParams,
}: {
  searchParams: Promise<{ cari?: string }>
}) {
  const { cari } = await searchParams
  const guru = await requireGuruSession()

  const ujian = await prisma.ujian.findMany({
    where: { pembuatId: guru.user.id },
    orderBy: { mulai: "desc" },
    include: { _count: { select: { soal: true, hasilUjian: true } } },
  })

  return <UjianGuruClient ujianAwal={ujian} cariAwal={cari ?? ""} />
}
import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { BankSoalClient } from "./BankSoalClient"

export default async function BankSoalGuruPage() {
  const guru = await requireGuruSession()

  const ujian = await prisma.ujian.findMany({
    where: { pembuatId: guru.id },
    orderBy: { judul: "asc" },
    include: {
      soal: { orderBy: { urutan: "asc" }, select: { id: true, pertanyaan: true, tipe: true, poin: true } },
    },
  })

  return <BankSoalClient data={ujian} />
}

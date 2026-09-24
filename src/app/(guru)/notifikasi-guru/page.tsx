import { requireGuruSession } from "@/lib/guru/session"
import { prisma } from "@/lib/prisma"
import { NotifikasiClient } from "./NotifikasiClient"

export default async function NotifikasiGuruPage() {
  const guru = await requireGuruSession()

  const notifikasi = await prisma.notifikasi.findMany({
    where: { userId: guru.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return <NotifikasiClient notifikasiAwal={notifikasi} />
}
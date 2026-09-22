import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NotifikasiClient } from "../notifikasi/NotifikasiClient"

export const dynamic = "force-dynamic"

export default async function NotifikasiPesertaPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id

  if (!userId) return null

  const notifikasiAwal = await prisma.notifikasi.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[12.5px] font-medium text-[#b45309]">Pusat informasi</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f]">Notifikasi</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86]">Informasi terbaru tentang ujian dan aktivitas akun Anda.</p>
      </header>

      <NotifikasiClient notifikasiAwal={notifikasiAwal} />
    </div>
  )
}
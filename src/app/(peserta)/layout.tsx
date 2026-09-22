import type { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PesertaShell } from "@/components/layout/PesertaShell"

export default async function PesertaLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN") redirect("/dashboard")
  if (session.user.role !== "PESERTA") redirect("/login")

  const jumlahNotifikasiBelumDibaca = await prisma.notifikasi.count({
    where: { userId: session.user.id, dibaca: false },
  })

  return (
    <PesertaShell
      user={{ nama: session.user.name ?? "Peserta", email: session.user.email ?? "" }}
      jumlahNotifikasiBelumDibaca={jumlahNotifikasiBelumDibaca}
    >
      {children}
    </PesertaShell>
  )
}
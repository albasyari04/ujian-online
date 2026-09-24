import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GuruShell } from "@/components/layout/GuruShell"

export default async function GuruLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const role = (session.user as { role?: string }).role

  if (role === "ADMIN") redirect("/dashboard")
  if (role === "PESERTA") redirect("/beranda-peserta")
  if (role !== "GURU") redirect("/login")

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nama: true, email: true, fotoUrl: true },
  })

  const nama = dbUser?.nama ?? session.user?.name ?? "Guru"
  const email = dbUser?.email ?? session.user?.email ?? ""
  const fotoUrl = dbUser?.fotoUrl ?? null

  return <GuruShell user={{ nama, email, fotoUrl }}>{children}</GuruShell>
}
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminShell } from "@/components/layout/AdminShell"

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // PENTING: field `role` di bawah ini di-cast manual karena tipe Session
  // bawaan next-auth tidak tahu field custom Anda. Sesuaikan nama field-nya
  // (`role`) kalau di lib/auth.ts & types/next-auth.d.ts Anda pakai nama lain.
  const role = (session.user as { role?: string }).role

  if (role === "PESERTA") redirect("/beranda-peserta")
  if (role !== "ADMIN") redirect("/login")

  // Ambil nama/email/foto langsung dari database (bukan hanya dari token JWT)
  // supaya perubahan yang dilakukan lewat halaman Profil langsung terlihat
  // di navbar tanpa perlu menunggu token di-refresh atau login ulang.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nama: true, email: true, fotoUrl: true },
  })

  const nama = dbUser?.nama ?? session.user?.name ?? "Admin"
  const email = dbUser?.email ?? session.user?.email ?? ""
  const fotoUrl = dbUser?.fotoUrl ?? null

  return <AdminShell user={{ nama, email, fotoUrl }}>{children}</AdminShell>
}
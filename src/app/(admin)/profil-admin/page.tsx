import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProfilForm } from "@/components/admin/ProfilForm"

// Data profil bisa berubah kapan saja, jangan di-cache statis.
export const dynamic = "force-dynamic"

export default async function ProfilPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, nama: true, email: true, fotoUrl: true },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="mx-auto flex w-full max-w-[800px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Page */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Profil Saya
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola informasi akun, foto profil, dan kata sandi Anda di sini.
        </p>
      </div>

      <ProfilForm initialData={user} />
    </div>
  )
}
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
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[#16233f]">Profil Saya</h1>
        <p className="mt-1 text-[12.5px] text-[#8b93a6]">
          Kelola informasi akun dan kata sandi Anda di sini.
        </p>
      </div>

      <ProfilForm initialData={user} />
    </div>
  )
}
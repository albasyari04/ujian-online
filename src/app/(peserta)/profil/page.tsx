import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProfilForm } from "@/components/profil/ProfilForm"

export default async function ProfilPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      nama: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[12.5px] font-medium text-[#b45309]">Portal Peserta</p>
        <h1 className="mt-1 text-[26px] font-semibold text-[#16233f]">Profil Saya</h1>
        <p className="mt-1 text-[13px] text-[#5b6a86]">
          Kelola informasi akun dan keamanan Anda di sini.
        </p>
      </header>

      <ProfilForm
        user={{
          nama: user.nama,
          email: user.email,
          role: user.role,
          bergabungSejak: user.createdAt.toISOString(),
        }}
      />
    </div>
  )
}
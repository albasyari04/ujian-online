import { requireGuruSession } from "@/lib/guru/session"
import { ProfilForm } from "./ProfilForm"

export default async function ProfilGuruPage() {
  const guru = await requireGuruSession()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold text-[#16233f] dark:text-white">Profil Saya</h1>
        <p className="mt-0.5 text-[13px] text-[#5b657d] dark:text-white/50">Kelola informasi akun Anda.</p>
      </div>

      <ProfilForm user={{ nama: guru.user.name as string, email: guru.user.email as string, fotoUrl: guru.user.fotoUrl as string }} />
    </div>
  )
}
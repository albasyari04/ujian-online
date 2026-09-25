import { requireGuruSession } from "@/lib/guru/session"
import { ProfilForm } from "./ProfilForm"

export default async function ProfilGuruPage() {
  const guru = await requireGuruSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[19px] font-bold leading-tight text-[#16233f] dark:text-white sm:text-[22px]">
          Profil Saya
        </h1>
        <p className="mt-0.5 text-[12.5px] text-[#8b93a6] dark:text-white/40">
          Kelola informasi akun dan keamanan Anda.
        </p>
      </div>

      <ProfilForm
        user={{
          nama: guru.user.name as string,
          email: guru.user.email as string,
          fotoUrl: guru.user.fotoUrl as string,
        }}
      />
    </div>
  )
}
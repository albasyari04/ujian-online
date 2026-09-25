import { requireGuruSession } from "@/lib/guru/session"
import { ProfilForm } from "./ProfilForm"

export default async function ProfilGuruPage() {
  const guru = await requireGuruSession()

  return (
    <div className="space-y-6">
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
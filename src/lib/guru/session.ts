import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"

export type GuruSessionUser = {
  id: string
  name: string
  email: string
  role: string
  fotoUrl: string | null
}

/**
 * Ambil session guru yang sedang login. Redirect ke /login kalau belum
 * login, dan redirect juga kalau role bukan GURU (mis. admin/peserta
 * nyasar ke sini lewat URL langsung — middleware seharusnya sudah
 * menahan ini, tapi dicek ulang di sini sebagai lapisan kedua).
 */
export async function requireGuruSession(): Promise<GuruSessionUser> {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = session.user as unknown as GuruSessionUser

  if (user.role !== "GURU") {
    redirect("/login")
  }

  return user
}

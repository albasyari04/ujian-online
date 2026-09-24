import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

// Buat interface khusus untuk session guru
interface GuruSession {
  user: {
    id: string
    name: string
    email: string
    fotoUrl: string
    role: string
  }
}

export async function requireGuruSession(): Promise<GuruSession> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }
  
  // Cek role guru
  const user = session.user as Record<string, unknown>
  if (user.role !== "GURU") {
    redirect("/")
  }
  
  // Kembalikan session dengan tipe yang benar
  return session as GuruSession
}
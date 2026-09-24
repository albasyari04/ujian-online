import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function requireGuruSession() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }
  
  // Cek role guru
  const user = session.user as Record<string, unknown>
  if (user.role !== "GURU") {
    redirect("/")
  }
  
  return session
}
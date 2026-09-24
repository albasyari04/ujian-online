import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

type UserSession = {
  user?: {
    id: string
    role?: string
    email?: string
    name?: string
  }
}

export async function requireGuruSession() {
  const session = await getServerSession(authOptions) as UserSession
  
  if (!session?.user) {
    redirect("/login")
  }
  
  const user = session.user
  if (user.role !== "GURU") {
    redirect("/")
  }
  
  return session
}

import type { Role } from "@prisma/client"
import type { DefaultSession, DefaultUser } from "next-auth"
import type { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      fotoUrl?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: Role
    fotoUrl?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: Role
    fotoUrl?: string | null
  }
}
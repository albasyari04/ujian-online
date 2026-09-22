import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 jam — cukup untuk satu sesi ujian penuh
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan kata sandi wajib diisi")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user) {
          throw new Error("Email atau kata sandi salah")
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordValid) {
          throw new Error("Email atau kata sandi salah")
        }

        return {
          id: user.id,
          name: user.nama,
          email: user.email,
          role: user.role,
          fotoUrl: user.fotoUrl,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.fotoUrl = user.fotoUrl
      } else if (!token.role && token.id) {
        // Pulihkan role & fotoUrl untuk JWT lama yang dibuat sebelum field ini tersedia.
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, fotoUrl: true },
        })

        if (currentUser) {
          token.role = currentUser.role
          token.fotoUrl = currentUser.fotoUrl
        }
      }

      // Sinkronkan token saat client memanggil useSession().update(...)
      // — dipakai oleh ProfilForm setelah nama/email/foto berhasil diubah.
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name
        if (typeof session.email === "string") token.email = session.email
        if ("fotoUrl" in session) token.fotoUrl = session.fotoUrl
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.fotoUrl = token.fotoUrl ?? null
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
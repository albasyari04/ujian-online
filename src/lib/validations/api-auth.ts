import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"

/**
 * Memastikan request berasal dari user yang sudah login DAN berrole ADMIN.
 * Dipakai di setiap API route yang khusus untuk panel admin (mis. CRUD ujian/soal).
 *
 * Pemakaian:
 *   const guard = await requireAdmin()
 *   if (guard.error) return guard.error
 *   const { userId } = guard
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      error: NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 }),
    } as const
  }

  const role = (session.user as { role?: string }).role

  if (role !== "ADMIN") {
    return {
      error: NextResponse.json({ message: "Anda tidak memiliki akses ke resource ini." }, { status: 403 }),
    } as const
  }

  const userId = (session.user as { id: string }).id

  return { error: null, userId } as const
}

/**
 * Memastikan request berasal dari user yang sudah login DAN berrole GURU.
 * Dipakai di setiap API route yang khusus untuk panel guru.
 *
 * Pemakaian:
 *   const guard = await requireGuru()
 *   if (guard.error) return guard.error
 *   const { userId } = guard
 */
export async function requireGuru() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      error: NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 }),
    } as const
  }

  const role = (session.user as { role?: string }).role

  if (role !== "GURU") {
    return {
      error: NextResponse.json({ message: "Anda tidak memiliki akses ke resource ini." }, { status: 403 }),
    } as const
  }

  const userId = (session.user as { id: string }).id

  return { error: null, userId } as const
}
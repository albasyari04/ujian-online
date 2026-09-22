import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Generate password acak yang mudah dibaca (tanpa karakter ambigu).
 */
function generateReadablePassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Tidak memiliki akses" }, { status: 403 })
  }

  const body = await request.json()
  const { userIds } = body as { userIds: string[] }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ message: "userIds wajib diisi" }, { status: 400 })
  }

  const results: { id: string; password: string }[] = []

  for (const id of userIds) {
    const plainPassword = generateReadablePassword(8)
    const hashed = await bcrypt.hash(plainPassword, 10)

    await prisma.user.update({
      where: { id },
      data: { password: hashed },
    })

    results.push({ id, password: plainPassword })
  }

  return NextResponse.json({ results })
}
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
  }

  const nama = typeof body.nama === "string" ? body.nama.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!nama || nama.length < 3) {
    return NextResponse.json({ error: "Nama minimal 3 karakter" }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 })
  }

  // Pastikan email tidak dipakai user lain.
  const emailDipakai = await prisma.user.findFirst({
    where: { email, NOT: { id: session.user.id } },
    select: { id: true },
  })

  if (emailDipakai) {
    return NextResponse.json(
      { error: "Email sudah digunakan oleh akun lain" },
      { status: 409 }
    )
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { nama, email },
    select: { nama: true, email: true },
  })

  return NextResponse.json({ user })
}

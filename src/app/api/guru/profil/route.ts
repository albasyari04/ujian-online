import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const profilSchema = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter"),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.union([z.string().min(6, "Kata sandi minimal 6 karakter"), z.literal("")]).optional(),
  fotoUrl: z.string().trim().optional().nullable(),
})

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })

  const body = await request.json()
  const parsed = profilSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    )
  }

  const emailDipakaiAkunLain = await prisma.user.findFirst({
    where: { email: parsed.data.email, NOT: { id: userId } },
  })
  if (emailDipakaiAkunLain) {
    return NextResponse.json({ message: "Email sudah digunakan akun lain" }, { status: 400 })
  }

  const data: { nama: string; email: string; fotoUrl: string | null; password?: string } = {
    nama: parsed.data.nama,
    email: parsed.data.email,
    fotoUrl: parsed.data.fotoUrl && parsed.data.fotoUrl.trim() !== "" ? parsed.data.fotoUrl : null,
  }

  if (parsed.data.password) {
    data.password = await bcrypt.hash(parsed.data.password, 10)
  }

  const user = await prisma.user.update({ where: { id: userId }, data })

  return NextResponse.json({
    data: { id: user.id, nama: user.nama, email: user.email, fotoUrl: user.fotoUrl },
  })
}

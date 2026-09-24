import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { guruUpdateSchema } from "@/lib/validations/guru.schema"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || role !== "ADMIN") {
    return null
  }

  return session
}

// GET /api/guru/:id
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
  }

  const guru = await prisma.user.findFirst({
    where: { id, role: Role.GURU },
    select: {
      id: true,
      nama: true,
      email: true,
      fotoUrl: true,
      createdAt: true,
      _count: { select: { ujianDibuat: true } },
    },
  })

  if (!guru) {
    return NextResponse.json({ message: "Guru tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.json({ guru })
}

// PUT /api/guru/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
  }

  const guru = await prisma.user.findFirst({ where: { id, role: Role.GURU } })
  if (!guru) {
    return NextResponse.json({ message: "Guru tidak ditemukan" }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const parsed = guruUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data tidak valid", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { nama, email, password } = parsed.data

  if (email !== guru.email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: { email: ["Email sudah dipakai akun lain"] } },
        { status: 422 }
      )
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      nama,
      email,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
    select: { id: true, nama: true, email: true, createdAt: true },
  })

  return NextResponse.json({ guru: updated })
}

// DELETE /api/guru/:id
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
  }

  const guru = await prisma.user.findFirst({
    where: { id, role: Role.GURU },
    include: { _count: { select: { ujianDibuat: true } } },
  })

  if (!guru) {
    return NextResponse.json({ message: "Guru tidak ditemukan" }, { status: 404 })
  }

  if (guru._count.ujianDibuat > 0) {
    return NextResponse.json(
      {
        message:
          "Guru ini masih memiliki ujian yang dibuat. Pindahkan atau hapus ujian tersebut terlebih dahulu.",
      },
      { status: 409 }
    )
  }

  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ message: "Guru berhasil dihapus" })
}
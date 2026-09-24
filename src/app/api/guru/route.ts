import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { Prisma, Role } from "@prisma/client"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { guruCreateSchema } from "@/lib/validations/guru.schema"

const PAGE_SIZE = 10

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || role !== "ADMIN") {
    return null
  }

  return session
}

// GET /api/guru?q=&page=
// Mengembalikan daftar guru (role GURU) beserta ringkasan statistik.
export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1)

  const where: Prisma.UserWhereInput = {
    role: Role.GURU,
    ...(q
      ? {
          OR: [{ nama: { contains: q } }, { email: { contains: q } }],
        }
      : {}),
  }

  const [items, total, totalGuru, totalUjianDibuat] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        nama: true,
        email: true,
        fotoUrl: true,
        createdAt: true,
        _count: { select: { ujianDibuat: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: Role.GURU } }),
    prisma.ujian.count({ where: { pembuat: { role: Role.GURU } } }),
  ])

  return NextResponse.json({
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    stats: { totalGuru, totalUjianDibuat },
  })
}

// POST /api/guru
// Membuat akun guru baru.
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = guruCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data tidak valid", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { nama, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { message: "Data tidak valid", errors: { email: ["Email sudah terdaftar"] } },
      { status: 422 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const guru = await prisma.user.create({
    data: {
      nama,
      email,
      password: hashedPassword,
      role: Role.GURU,
    },
    select: {
      id: true,
      nama: true,
      email: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ guru }, { status: 201 })
}
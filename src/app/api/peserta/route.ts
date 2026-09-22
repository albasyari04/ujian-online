import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { Prisma, Role } from "@prisma/client"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pesertaCreateSchema } from "@/lib/validations/peserta.schema"

const PAGE_SIZE = 10

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session || role !== "ADMIN") {
    return null
  }

  return session
}

// GET /api/peserta?q=&page=
// Mengembalikan daftar peserta (role PESERTA) beserta ringkasan statistik.
export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1)

  const where: Prisma.UserWhereInput = {
    role: Role.PESERTA,
    ...(q
      ? {
          OR: [
            { nama: { contains: q } },
            { email: { contains: q } },
            { nisn: { contains: q } },
          ],
        }
      : {}),
  }

  const [items, total, totalPeserta, agregatHasil] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ noUrut: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        nama: true,
        email: true,
        nisn: true,
        noUrut: true,
        createdAt: true,
        _count: { select: { hasilUjian: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: Role.PESERTA } }),
    prisma.hasilUjian.aggregate({
      where: { user: { role: Role.PESERTA }, status: "SELESAI" },
      _avg: { skor: true },
      _count: { _all: true },
    }),
  ])

  return NextResponse.json({
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    stats: {
      totalPeserta,
      ujianSelesai: agregatHasil._count._all,
      rataRataSkor: agregatHasil._avg.skor,
    },
  })
}

// POST /api/peserta
// Membuat akun peserta baru.
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = pesertaCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data tidak valid", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { nama, email, password, nisn, noUrut } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { message: "Data tidak valid", errors: { email: ["Email sudah terdaftar"] } },
      { status: 422 }
    )
  }

  // Cek duplikasi NISN
  if (nisn) {
    const existingNisn = await prisma.user.findUnique({ where: { nisn } })
    if (existingNisn) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: { nisn: ["NISN sudah terdaftar"] } },
        { status: 422 }
      )
    }
  }

  // Cek duplikasi No. Urut
  if (noUrut !== undefined && noUrut !== null) {
    const existingNoUrut = await prisma.user.findUnique({ where: { noUrut } })
    if (existingNoUrut) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: { noUrut: ["No. urut sudah dipakai"] } },
        { status: 422 }
      )
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const peserta = await prisma.user.create({
    data: {
      nama,
      email,
      password: hashedPassword,
      role: Role.PESERTA,
      nisn: nisn || null,
      noUrut: noUrut ?? null,
    },
    select: {
      id: true,
      nama: true,
      email: true,
      nisn: true,
      noUrut: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ peserta }, { status: 201 })
}
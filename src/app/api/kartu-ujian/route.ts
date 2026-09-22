import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Tidak memiliki akses" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") ?? ""

  const peserta = await prisma.user.findMany({
    where: {
      role: "PESERTA",
      ...(q
        ? {
            OR: [
              { nama: { contains: q } },
              { email: { contains: q } },
              { nisn: { contains: q } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      nama: true,
      email: true,
      nisn: true,
      noUrut: true,
      createdAt: true,
    },
    orderBy: [{ noUrut: "asc" }, { nama: "asc" }],
  })

  return NextResponse.json({ items: peserta })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Tidak memiliki akses" }, { status: 403 })
  }

  const body = await request.json()
  const { id, nisn, noUrut } = body as {
    id: string
    nisn?: string
    noUrut?: number
  }

  if (!id) {
    return NextResponse.json({ message: "ID peserta wajib diisi" }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      nisn: nisn ?? null,
      noUrut: noUrut ?? null,
    },
    select: { id: true, nama: true, nisn: true, noUrut: true },
  })

  return NextResponse.json({ item: updated })
}
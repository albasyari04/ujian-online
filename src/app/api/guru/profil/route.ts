import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })
    }

    const guru = await prisma.user.findUnique({
      where: { id: session.user.id, role: "GURU" },
      select: {
        id: true,
        nama: true,
        email: true,
        fotoUrl: true,
        createdAt: true
      }
    })

    if (!guru) {
      return NextResponse.json({ message: "Guru tidak ditemukan." }, { status: 404 })
    }

    return NextResponse.json({ guru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Terjadi kesalahan internal." }, { status: 500 })
  }
}
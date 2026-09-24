import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })

  const notifikasi = await prisma.notifikasi.findFirst({ where: { id, userId } })
  if (!notifikasi) return NextResponse.json({ message: "Notifikasi tidak ditemukan" }, { status: 404 })

  const updated = await prisma.notifikasi.update({
    where: { id },
    data: { dibaca: true },
  })

  return NextResponse.json({ data: updated })
}
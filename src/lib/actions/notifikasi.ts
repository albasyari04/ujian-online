"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function tandaiDibaca(notifikasiId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Anda harus login terlebih dahulu")
  }

  // updateMany dipakai (bukan update) supaya sekaligus memverifikasi
  // notifikasi ini benar milik user yang sedang login.
  await prisma.notifikasi.updateMany({
    where: { id: notifikasiId, userId: session.user.id },
    data: { dibaca: true },
  })

  revalidatePath("/notifikasi-peserta")
}

export async function tandaiSemuaDibaca() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Anda harus login terlebih dahulu")
  }

  await prisma.notifikasi.updateMany({
    where: { userId: session.user.id, dibaca: false },
    data: { dibaca: true },
  })

  revalidatePath("/notifikasi-peserta")
}
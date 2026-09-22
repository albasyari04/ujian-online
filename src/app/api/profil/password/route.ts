import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"

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

  const passwordSaatIni =
    typeof body.passwordSaatIni === "string" ? body.passwordSaatIni : ""
  const passwordBaru = typeof body.passwordBaru === "string" ? body.passwordBaru : ""
  const konfirmasiPasswordBaru =
    typeof body.konfirmasiPasswordBaru === "string" ? body.konfirmasiPasswordBaru : ""

  if (!passwordSaatIni || !passwordBaru || !konfirmasiPasswordBaru) {
    return NextResponse.json({ error: "Semua kolom wajib diisi" }, { status: 400 })
  }

  if (passwordBaru.length < 8) {
    return NextResponse.json(
      { error: "Kata sandi baru minimal 8 karakter" },
      { status: 400 }
    )
  }

  if (passwordBaru !== konfirmasiPasswordBaru) {
    return NextResponse.json(
      { error: "Konfirmasi kata sandi baru tidak cocok" },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 })
  }

  const valid = await bcrypt.compare(passwordSaatIni, user.password)

  if (!valid) {
    return NextResponse.json({ error: "Kata sandi saat ini salah" }, { status: 400 })
  }

  const samaDenganLama = await bcrypt.compare(passwordBaru, user.password)

  if (samaDenganLama) {
    return NextResponse.json(
      { error: "Kata sandi baru tidak boleh sama dengan kata sandi lama" },
      { status: 400 }
    )
  }

  const hash = await bcrypt.hash(passwordBaru, 10)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hash },
  })

  return NextResponse.json({ success: true })
}

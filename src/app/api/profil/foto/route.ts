import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { mkdir, unlink, writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Route ini menulis file ke disk, jadi wajib jalan di Node.js runtime (bukan Edge).
export const runtime = "nodejs"

const MAKS_UKURAN = 2 * 1024 * 1024 // 2MB

const TIPE_DIIZINKAN: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

const FOLDER_UPLOAD = path.join(process.cwd(), "public", "uploads", "avatars")

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 })
  }

  const formData = await request.formData().catch(() => null)
  const file = formData?.get("foto")

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "File foto tidak ditemukan" }, { status: 400 })
  }

  const ekstensi = TIPE_DIIZINKAN[file.type]
  if (!ekstensi) {
    return NextResponse.json(
      { error: "Format file harus JPG, PNG, atau WEBP" },
      { status: 400 }
    )
  }

  if (file.size > MAKS_UKURAN) {
    return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 })
  }

  // Pastikan folder tujuan ada (aman dipanggil berkali-kali).
  await mkdir(FOLDER_UPLOAD, { recursive: true })

  const namaFile = `${session.user.id}-${randomUUID()}.${ekstensi}`
  const tujuanPath = path.join(FOLDER_UPLOAD, namaFile)
  const buffer = Buffer.from(await file.arrayBuffer())

  await writeFile(tujuanPath, buffer)

  const fotoUrlBaru = `/uploads/avatars/${namaFile}`

  // Ambil fotoUrl lama dulu supaya bisa dihapus setelah update berhasil.
  const userLama = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { fotoUrl: true },
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { fotoUrl: fotoUrlBaru },
  })

  // Bersihkan file lama kalau itu memang hasil upload sebelumnya
  // (bukan URL eksternal seperti https://... yang tidak kita simpan sendiri).
  if (userLama?.fotoUrl?.startsWith("/uploads/avatars/")) {
    const fotoLamaPath = path.join(process.cwd(), "public", userLama.fotoUrl)
    await unlink(fotoLamaPath).catch(() => {
      // Abaikan kalau file lama sudah tidak ada / gagal dihapus — bukan fatal.
    })
  }

  return NextResponse.json({ fotoUrl: fotoUrlBaru })
}
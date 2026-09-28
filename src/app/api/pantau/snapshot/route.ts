import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MAKS_BYTE_GAMBAR = 400 * 1024
const MAKS_BYTE_REQUEST = 1024 * 1024

/** Decode base64 -> bytes, hanya menerima JPEG dengan ukuran wajar. */
function decodeJpeg(value: unknown) {
	if (typeof value !== "string" || value.length === 0) return null
	if (value.length > Math.ceil((MAKS_BYTE_GAMBAR * 4) / 3) + 8) return null
	const buffer = Buffer.from(value, "base64")
	if (buffer.length === 0 || buffer.length > MAKS_BYTE_GAMBAR) return null
	const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
	return jpeg ? new Uint8Array(buffer) : null
}

export async function POST(request: Request) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })

	const panjang = Number(request.headers.get("content-length") ?? 0)
	if (panjang > MAKS_BYTE_REQUEST) return NextResponse.json({ message: "Data terlalu besar." }, { status: 413 })

	const body = await request.json().catch(() => null)
	const hasilUjianId = typeof body?.hasilUjianId === "string" ? body.hasilUjianId : ""
	if (!hasilUjianId) return NextResponse.json({ message: "Data tidak valid." }, { status: 400 })

	const hasil = await prisma.hasilUjian.findFirst({
		where: { id: hasilUjianId, userId: session.user.id },
		select: { id: true, status: true },
	})
	if (!hasil) return NextResponse.json({ message: "Sesi ujian tidak ditemukan." }, { status: 404 })
	if (hasil.status !== "SEDANG_DIKERJAKAN") return NextResponse.json({ message: "Ujian sudah tidak aktif." }, { status: 409 })

	const kamera = decodeJpeg(body.kamera)
	const layar = decodeJpeg(body.layar)
	const fokus = body.fokus !== false
	const sekarang = new Date()

	const data = {
		fokus,
		...(kamera ? { kamera, kameraAt: sekarang } : {}),
		...(layar ? { layar, layarAt: sekarang } : {}),
	}

	await prisma.snapshotPengawasan.upsert({
		where: { hasilUjianId },
		create: { hasilUjianId, ...data },
		update: data,
	})

	return NextResponse.json({ ok: true })
}
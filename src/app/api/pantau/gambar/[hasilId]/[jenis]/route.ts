import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ hasilId: string; jenis: string }> }

export async function GET(_request: Request, { params }: Params) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })
	if (session.user.role !== "ADMIN") return NextResponse.json({ message: "Akses ditolak." }, { status: 403 })

	const { hasilId, jenis } = await params
	if (jenis !== "kamera" && jenis !== "layar") {
		return NextResponse.json({ message: "Jenis gambar tidak valid." }, { status: 400 })
	}

	// Hanya kolom yang diminta yang diambil dari database.
	const data =
		jenis === "kamera"
			? (await prisma.snapshotPengawasan.findUnique({ where: { hasilUjianId: hasilId }, select: { kamera: true } }))?.kamera
			: (await prisma.snapshotPengawasan.findUnique({ where: { hasilUjianId: hasilId }, select: { layar: true } }))?.layar

	if (!data) return NextResponse.json({ message: "Gambar belum tersedia." }, { status: 404 })

	return new NextResponse(new Uint8Array(data), {
		headers: {
			"Content-Type": "image/jpeg",
			// URL selalu membawa ?v=<timestamp>, jadi aman di-cache singkat di browser admin.
			"Cache-Control": "private, max-age=30",
		},
	})
}
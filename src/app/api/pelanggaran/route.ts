import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const TIPE_VALID = new Set([
	"PINDAH_TAB",
	"KELUAR_FULLSCREEN",
	"KEHILANGAN_FOKUS",
	"COPY_PASTE",
	"KLIK_KANAN",
	"DEVTOOLS",
])

export async function POST(request: Request) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })

	const body = await request.json().catch(() => null)
	const hasilUjianId = typeof body?.hasilUjianId === "string" ? body.hasilUjianId : ""
	const tipe = typeof body?.tipe === "string" ? body.tipe : ""
	if (!hasilUjianId || !TIPE_VALID.has(tipe)) return NextResponse.json({ message: "Data pelanggaran tidak valid." }, { status: 400 })

	const hasil = await prisma.hasilUjian.findFirst({
		where: { id: hasilUjianId, userId: session.user.id },
		select: { id: true, status: true, jumlahPelanggaran: true, ujian: { select: { batasPelanggaran: true } } },
	})
	if (!hasil) return NextResponse.json({ message: "Sesi ujian tidak ditemukan." }, { status: 404 })
	if (hasil.status !== "SEDANG_DIKERJAKAN") return NextResponse.json({ message: "Ujian sudah tidak aktif." }, { status: 409 })

	const jumlahPelanggaran = hasil.jumlahPelanggaran + 1
	const dihentikan = jumlahPelanggaran >= hasil.ujian.batasPelanggaran
	const diperbarui = await prisma.$transaction(async (tx) => {
		await tx.logPelanggaran.create({ data: { hasilUjianId, tipe: tipe as never } })
		return tx.hasilUjian.update({
			where: { id: hasilUjianId },
			data: { jumlahPelanggaran, ...(dihentikan ? { status: "SELESAI", waktuSelesai: new Date() } : {}) },
			select: { id: true, jumlahPelanggaran: true, status: true },
		})
	})

	return NextResponse.json({ ...diperbarui, batasPelanggaran: hasil.ujian.batasPelanggaran, dihentikan })
}

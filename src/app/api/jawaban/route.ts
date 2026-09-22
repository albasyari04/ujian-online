import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })

	const body = await request.json().catch(() => null)
	const hasilUjianId = typeof body?.hasilUjianId === "string" ? body.hasilUjianId : ""
	const soalId = typeof body?.soalId === "string" ? body.soalId : ""
	const jawaban = typeof body?.jawaban === "string" ? body.jawaban.trim() : ""
	if (!hasilUjianId || !soalId) return NextResponse.json({ message: "Data jawaban tidak lengkap." }, { status: 400 })

	const hasil = await prisma.hasilUjian.findFirst({ where: { id: hasilUjianId, userId: session.user.id }, select: { id: true, status: true } })
	if (!hasil) return NextResponse.json({ message: "Sesi ujian tidak ditemukan." }, { status: 404 })
	if (hasil.status !== "SEDANG_DIKERJAKAN") return NextResponse.json({ message: "Ujian sudah dikumpulkan." }, { status: 409 })

	const soal = await prisma.soal.findFirst({ where: { id: soalId, jawaban: { some: { hasilUjianId } } }, select: { id: true, tipe: true } })
	const soalUjian = soal ?? await prisma.soal.findFirst({ where: { id: soalId, ujian: { hasilUjian: { some: { id: hasilUjianId } } } }, select: { id: true, tipe: true } })
	if (!soalUjian) return NextResponse.json({ message: "Soal tidak termasuk dalam ujian ini." }, { status: 400 })

	await prisma.jawaban.upsert({
		where: { soalId_hasilUjianId: { soalId, hasilUjianId } },
		create: { soalId, hasilUjianId, opsiPilihan: soalUjian.tipe === "PILIHAN_GANDA" ? jawaban || null : null, jawabanTeks: soalUjian.tipe === "ESSAY" ? jawaban || null : null },
		update: { opsiPilihan: soalUjian.tipe === "PILIHAN_GANDA" ? jawaban || null : null, jawabanTeks: soalUjian.tipe === "ESSAY" ? jawaban || null : null },
	})

	return NextResponse.json({ saved: true })
}

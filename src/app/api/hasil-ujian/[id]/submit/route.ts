import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })

	const { id } = await params
	const hasil = await prisma.hasilUjian.findFirst({
		where: { id, userId: session.user.id },
		include: { jawaban: { include: { soal: { include: { opsi: true } } } } },
	})
	if (!hasil) return NextResponse.json({ message: "Hasil ujian tidak ditemukan." }, { status: 404 })
	if (hasil.status === "SELESAI") return NextResponse.json({ submitted: true })

	const penilaian = hasil.jawaban.map((jawaban) => {
		const opsiBenar = jawaban.soal.opsi.find((opsi) => opsi.benar)
		const benar = Boolean(opsiBenar && jawaban.opsiPilihan === opsiBenar.id)
		return { id: jawaban.id, benar }
	})
	const skor = hasil.jawaban.reduce((total, jawaban) => {
		const dinilai = penilaian.find((item) => item.id === jawaban.id)
		return total + (dinilai?.benar ? jawaban.soal.poin : 0)
	}, 0)

	await prisma.$transaction([
		...penilaian.map((item) => prisma.jawaban.update({ where: { id: item.id }, data: { benar: item.benar } })),
		prisma.hasilUjian.update({ where: { id: hasil.id }, data: { status: "SELESAI", skor, waktuSelesai: new Date() } }),
	])

	return NextResponse.json({ submitted: true, skor })
}

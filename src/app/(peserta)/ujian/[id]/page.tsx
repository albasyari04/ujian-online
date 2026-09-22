import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPengaturanPelanggaran } from "@/lib/pengaturan"
import { RuangUjian } from "@/components/ujian/RuangUjian"

type Params = { params: Promise<{ id: string }> }

export default async function KerjakanUjianPage({ params }: Params) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) redirect("/login")

	const { id } = await params
	const sekarang = new Date()
	const [ujian, pengaturanPelanggaran] = await Promise.all([
		prisma.ujian.findUnique({
			where: { id },
			include: {
				soal: {
					orderBy: { urutan: "asc" },
					include: {
						// Jawaban benar tidak pernah dikirim ke browser peserta.
						opsi: { orderBy: { urutan: "asc" }, select: { id: true, teks: true, urutan: true } },
					},
				},
			},
		}),
		getPengaturanPelanggaran(),
	])

	if (!ujian) notFound()
	if (ujian.mulai > sekarang || ujian.selesai < sekarang) redirect("/ujian-tersedia")
	if (ujian.soal.length === 0) redirect("/ujian-tersedia")

	const hasil = await prisma.hasilUjian.upsert({
		where: { userId_ujianId: { userId: session.user.id, ujianId: id } },
		create: { userId: session.user.id, ujianId: id },
		update: {},
		include: { jawaban: true },
	})

	if (hasil.status === "SELESAI") redirect(`/hasil/${hasil.id}`)

	const batasDurasi = new Date(hasil.waktuMulai.getTime() + ujian.durasiMenit * 60_000)
	const waktuSelesai = batasDurasi < ujian.selesai ? batasDurasi : ujian.selesai

	return (
		<RuangUjian
			ujian={{ id: ujian.id, judul: ujian.judul, batasPelanggaran: ujian.batasPelanggaran, soal: ujian.soal }}
			hasilId={hasil.id}
			waktuSelesai={waktuSelesai.toISOString()}
			jawabanAwal={hasil.jawaban.map((jawaban) => ({ soalId: jawaban.soalId, jawabanTeks: jawaban.jawabanTeks, opsiPilihan: jawaban.opsiPilihan }))}
			pengaturanPelanggaran={pengaturanPelanggaran}
		/>
	)
}
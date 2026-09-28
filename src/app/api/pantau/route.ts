import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) return NextResponse.json({ message: "Anda harus login terlebih dahulu." }, { status: 401 })
	if (session.user.role !== "ADMIN") return NextResponse.json({ message: "Akses ditolak." }, { status: 403 })

	// Privasi: snapshot milik sesi yang sudah selesai dihapus (hanya gambar terbaru
	// yang disimpan, dan hanya selama ujian berlangsung).
	await prisma.snapshotPengawasan.deleteMany({ where: { hasilUjian: { status: "SELESAI" } } })

	const aktif = await prisma.hasilUjian.findMany({
		where: { status: "SEDANG_DIKERJAKAN" },
		orderBy: { waktuMulai: "desc" },
		select: {
			id: true,
			jumlahPelanggaran: true,
			user: { select: { nama: true } },
			ujian: { select: { judul: true, batasPelanggaran: true } },
			// Kolom gambar (blob) sengaja tidak ikut diambil di sini.
			snapshot: { select: { fokus: true, kameraAt: true, layarAt: true, updatedAt: true } },
		},
	})

	const sekarang = Date.now()
	const peserta = aktif.map((item) => ({
		id: item.id,
		nama: item.user.nama,
		ujian: item.ujian.judul,
		jumlahPelanggaran: item.jumlahPelanggaran,
		batasPelanggaran: item.ujian.batasPelanggaran,
		fokus: item.snapshot?.fokus ?? true,
		kameraV: item.snapshot?.kameraAt?.getTime() ?? null,
		layarV: item.snapshot?.layarAt?.getTime() ?? null,
		umurDetik: item.snapshot ? Math.max(0, Math.round((sekarang - item.snapshot.updatedAt.getTime()) / 1000)) : null,
	}))

	return NextResponse.json({ peserta }, { headers: { "Cache-Control": "no-store" } })
}
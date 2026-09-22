import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { updatePengaturanPelanggaran } from "@/lib/pengaturan"
import { pengaturanPelanggaranSchema } from "@/lib/validations/pengaturan.schema"

// Hanya ADMIN yang boleh mengubah pengaturan pelanggaran global.
// Pembacaan config dilakukan server-side langsung lewat getPengaturanPelanggaran()
// di halaman Pengaturan (admin) dan halaman kerjakan ujian (peserta), jadi
// endpoint ini cukup menangani penyimpanan (PUT) saja.
export async function PUT(request: Request) {
	const guard = await requireAdmin()
	if (guard.error) return guard.error

	const body = await request.json().catch(() => null)
	const parsed = pengaturanPelanggaranSchema.safeParse(body)
	if (!parsed.success) {
		return NextResponse.json({ message: "Data pengaturan tidak valid." }, { status: 400 })
	}

	await updatePengaturanPelanggaran(parsed.data)
	return NextResponse.json({ message: "Pengaturan berhasil disimpan." })
}
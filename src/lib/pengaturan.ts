import { prisma } from "@/lib/prisma"

const ID_PENGATURAN_GLOBAL = "global"

export type PengaturanPelanggaranAktif = {
	PINDAH_TAB: boolean
	KELUAR_FULLSCREEN: boolean
	KEHILANGAN_FOKUS: boolean
	COPY_PASTE: boolean
	KLIK_KANAN: boolean
	DEVTOOLS: boolean
}

/**
 * Mengambil pengaturan jenis pelanggaran yang aktif secara global.
 * Baris pengaturan dibuat otomatis (upsert) kalau belum pernah ada,
 * supaya sistem tetap jalan dengan default "semua aktif" sebelum
 * admin pernah membuka halaman Pengaturan.
 */
export async function getPengaturanPelanggaran(): Promise<PengaturanPelanggaranAktif> {
	const pengaturan = await prisma.pengaturanPelanggaran.upsert({
		where: { id: ID_PENGATURAN_GLOBAL },
		create: { id: ID_PENGATURAN_GLOBAL },
		update: {},
	})

	return {
		PINDAH_TAB: pengaturan.cekPindahTab,
		KELUAR_FULLSCREEN: pengaturan.cekKeluarFullscreen,
		KEHILANGAN_FOKUS: pengaturan.cekKehilanganFokus,
		COPY_PASTE: pengaturan.cekCopyPaste,
		KLIK_KANAN: pengaturan.cekKlikKanan,
		DEVTOOLS: pengaturan.cekDevtools,
	}
}

export async function updatePengaturanPelanggaran(input: PengaturanPelanggaranAktif) {
	return prisma.pengaturanPelanggaran.upsert({
		where: { id: ID_PENGATURAN_GLOBAL },
		create: {
			id: ID_PENGATURAN_GLOBAL,
			cekPindahTab: input.PINDAH_TAB,
			cekKeluarFullscreen: input.KELUAR_FULLSCREEN,
			cekKehilanganFokus: input.KEHILANGAN_FOKUS,
			cekCopyPaste: input.COPY_PASTE,
			cekKlikKanan: input.KLIK_KANAN,
			cekDevtools: input.DEVTOOLS,
		},
		update: {
			cekPindahTab: input.PINDAH_TAB,
			cekKeluarFullscreen: input.KELUAR_FULLSCREEN,
			cekKehilanganFokus: input.KEHILANGAN_FOKUS,
			cekCopyPaste: input.COPY_PASTE,
			cekKlikKanan: input.KLIK_KANAN,
			cekDevtools: input.DEVTOOLS,
		},
	})
}
import { z } from "zod"

export const pengaturanPelanggaranSchema = z.object({
	PINDAH_TAB: z.boolean(),
	KELUAR_FULLSCREEN: z.boolean(),
	KEHILANGAN_FOKUS: z.boolean(),
	COPY_PASTE: z.boolean(),
	KLIK_KANAN: z.boolean(),
	DEVTOOLS: z.boolean(),
})

export type PengaturanPelanggaranInput = z.infer<typeof pengaturanPelanggaranSchema>
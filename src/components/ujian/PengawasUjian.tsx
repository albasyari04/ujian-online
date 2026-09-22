"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { TipePelanggaran } from "@prisma/client"

import { PeringatanModal } from "@/components/ujian/PeringatanModal"
import type { PengaturanPelanggaranAktif } from "@/lib/pengaturan"

const PENGATURAN_DEFAULT: PengaturanPelanggaranAktif = {
	PINDAH_TAB: true,
	KELUAR_FULLSCREEN: true,
	KEHILANGAN_FOKUS: true,
	COPY_PASTE: true,
	KLIK_KANAN: true,
	DEVTOOLS: true,
}

const DESKRIPSI_SINGKAT: Record<TipePelanggaran, string> = {
	PINDAH_TAB: "berpindah tab",
	KELUAR_FULLSCREEN: "keluar layar penuh",
	KEHILANGAN_FOKUS: "kehilangan fokus jendela",
	COPY_PASTE: "menyalin jawaban",
	KLIK_KANAN: "klik kanan",
	DEVTOOLS: "membuka developer tools",
}

export function PengawasUjian({
	hasilId,
	batasPelanggaran,
	pengaturan = PENGATURAN_DEFAULT,
	onDihentikan,
	children,
}: {
	hasilId: string
	batasPelanggaran: number
	pengaturan?: PengaturanPelanggaranAktif
	onDihentikan: () => void
	children: React.ReactNode
}) {
	const router = useRouter()
	const [dimulai, setDimulai] = useState(false)
	const [modal, setModal] = useState<TipePelanggaran | null>(null)
	const [jumlahPelanggaran, setJumlahPelanggaran] = useState(0)
	const tercatat = useRef(new Set<TipePelanggaran>())
	const sedangKirim = useRef(false)

	async function mulaiUjian() {
		try {
			await document.documentElement.requestFullscreen()
		} catch {
			// Browser dapat menolak fullscreen; pengawasan tetap berjalan.
		}
		setDimulai(true)
	}

	const catat = useCallback(async (tipe: TipePelanggaran) => {
		if (!pengaturan[tipe]) return
		if (!dimulai || sedangKirim.current || tercatat.current.has(tipe)) return
		tercatat.current.add(tipe)
		sedangKirim.current = true
		try {
			const response = await fetch("/api/pelanggaran", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ hasilUjianId: hasilId, tipe }),
			})
			const result = await response.json().catch(() => null)
			if (!response.ok) return
			setJumlahPelanggaran(result.jumlahPelanggaran)
			setModal(tipe)
			if (result.dihentikan) onDihentikan()
		} finally {
			sedangKirim.current = false
		}
	}, [dimulai, hasilId, onDihentikan, pengaturan])

	useEffect(() => {
		if (!dimulai) return

		const onVisibility = () => { if (document.hidden) void catat("PINDAH_TAB") }

		// "blur" murni sangat sensitif — bisa terpicu hanya karena klik ikon
		// ekstensi, address bar, atau notifikasi OS yang lewat sekilas, padahal
		// peserta tidak benar-benar berpindah fokus. Untuk menghindari salah
		// tangkap (false positive), kita beri jeda (grace period): baru dicatat
		// sebagai pelanggaran jika jendela MASIH belum fokus setelah jeda itu.
		const BLUR_GRACE_MS = 600
		let blurTimeout: ReturnType<typeof setTimeout> | null = null

		const onBlur = () => {
			if (document.hidden) return // sudah ditangani oleh PINDAH_TAB
			if (blurTimeout) clearTimeout(blurTimeout)
			blurTimeout = setTimeout(() => {
				blurTimeout = null
				// Cek ulang: kalau ternyata fokus sudah balik dalam masa jeda,
				// ini bukan pelanggaran — cuma gangguan sesaat (mis. notifikasi).
				if (!document.hidden && !document.hasFocus()) {
					void catat("KEHILANGAN_FOKUS")
				}
			}, BLUR_GRACE_MS)
		}

		const onFocus = () => {
			if (blurTimeout) {
				clearTimeout(blurTimeout)
				blurTimeout = null
			}
		}

		const onFullscreen = () => { if (!document.fullscreenElement) void catat("KELUAR_FULLSCREEN") }
		const onContextMenu = (event: MouseEvent) => {
			if (!pengaturan.KLIK_KANAN) return
			event.preventDefault()
			void catat("KLIK_KANAN")
		}
		const onKeyDown = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase()
			const devtools = key === "f12" || (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key))
			const clipboard = (event.ctrlKey && ["c", "v", "x"].includes(key)) || (event.metaKey && ["c", "v", "x"].includes(key))
			const tabControl = event.ctrlKey && ["t", "w", "n"].includes(key)

			if (devtools && pengaturan.DEVTOOLS) { event.preventDefault(); void catat("DEVTOOLS") }
			else if (clipboard && pengaturan.COPY_PASTE) { event.preventDefault(); void catat("COPY_PASTE") }
			else if (tabControl && pengaturan.PINDAH_TAB) { event.preventDefault(); void catat("PINDAH_TAB") }
		}

		if (pengaturan.PINDAH_TAB) document.addEventListener("visibilitychange", onVisibility)
		if (pengaturan.KEHILANGAN_FOKUS) {
			window.addEventListener("blur", onBlur)
			window.addEventListener("focus", onFocus)
		}
		if (pengaturan.KELUAR_FULLSCREEN) document.addEventListener("fullscreenchange", onFullscreen)
		document.addEventListener("contextmenu", onContextMenu)
		document.addEventListener("keydown", onKeyDown)

		return () => {
			document.removeEventListener("visibilitychange", onVisibility)
			window.removeEventListener("blur", onBlur)
			window.removeEventListener("focus", onFocus)
			document.removeEventListener("fullscreenchange", onFullscreen)
			document.removeEventListener("contextmenu", onContextMenu)
			document.removeEventListener("keydown", onKeyDown)
			if (blurTimeout) clearTimeout(blurTimeout)
		}
	}, [catat, dimulai, pengaturan])

	const daftarLarangan = (Object.keys(DESKRIPSI_SINGKAT) as TipePelanggaran[])
		.filter((tipe) => pengaturan[tipe])
		.map((tipe) => DESKRIPSI_SINGKAT[tipe])

	if (!dimulai) {
		return (
			<div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#16233f]/95 px-4">
				<div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl">
					<h2 className="text-[20px] font-semibold text-[#16233f]">Siapkan mode ujian</h2>
					<p className="mt-2 text-[13.5px] leading-6 text-[#5b5490]">
						Ujian akan berjalan dalam layar penuh.{daftarLarangan.length > 0 ? ` Jangan ${daftarLarangan.join(", ")}.` : ""}
					</p>
					<button type="button" onClick={() => void mulaiUjian()} className="mt-5 w-full rounded-[10px] bg-[#4338ca] px-5 py-3 text-[13.5px] font-semibold text-white">
						Mulai ujian
					</button>
				</div>
			</div>
		)
	}

	return (
		<>
			<div
				className="select-none"
				onCopy={(event) => { if (pengaturan.COPY_PASTE) { event.preventDefault(); void catat("COPY_PASTE") } }}
				onCut={(event) => { if (pengaturan.COPY_PASTE) { event.preventDefault(); void catat("COPY_PASTE") } }}
				onPaste={(event) => { if (pengaturan.COPY_PASTE) { event.preventDefault(); void catat("COPY_PASTE") } }}
			>
				{children}
			</div>
			<PeringatanModal
				open={modal !== null}
				tipe={modal}
				jumlahPelanggaran={jumlahPelanggaran}
				batasPelanggaran={batasPelanggaran}
				onTutup={() => {
					setModal(null)
					if (jumlahPelanggaran >= batasPelanggaran) router.push("/beranda-peserta")
				}}
			/>
		</>
	)
}
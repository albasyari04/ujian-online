"use client"

import { useState } from "react"
import Image from "next/image"
import type { TipePelanggaran } from "@prisma/client"

import { LABEL_TIPE_PELANGGARAN } from "@/lib/ujian-utils"
import type { PengaturanPelanggaranAktif } from "@/lib/pengaturan"
import { IconAlertTriangle, IconCheckCircle, IconSave, IconShield } from "@/components/ui/Icons"

const URUTAN_TIPE: TipePelanggaran[] = [
	"PINDAH_TAB",
	"KELUAR_FULLSCREEN",
	"KEHILANGAN_FOKUS",
	"COPY_PASTE",
	"KLIK_KANAN",
	"DEVTOOLS",
]

const DESKRIPSI_TIPE: Record<TipePelanggaran, string> = {
	PINDAH_TAB: "Peserta berpindah ke tab atau jendela lain.",
	KELUAR_FULLSCREEN: "Peserta keluar dari mode layar penuh.",
	KEHILANGAN_FOKUS: "Jendela ujian kehilangan fokus (mis. membuka aplikasi lain).",
	COPY_PASTE: "Peserta menyalin, memotong, atau menempelkan teks.",
	KLIK_KANAN: "Peserta melakukan klik kanan pada halaman ujian.",
	DEVTOOLS: "Peserta membuka developer tools browser.",
}

// Path ikon 3D — pastikan nama file di public/image/icon/ persis sama
// (huruf besar/kecil ikut berpengaruh di server Linux, meski di Windows tidak).
const IKON_TIPE: Record<TipePelanggaran, string> = {
	PINDAH_TAB: "/image/icon/Berpindah-tab-icon.png",
	KELUAR_FULLSCREEN: "/image/icon/Keluar-dari-mode-layar-penuh-icon.png",
	KEHILANGAN_FOKUS: "/image/icon/Kehilangan-fokus-jendela-con.png",
	COPY_PASTE: "/image/icon/copypaste-icon.png",
	KLIK_KANAN: "/image/icon/Klikkanan-icon.png",
	DEVTOOLS: "/image/icon/Membuka-developer-tools-icon.png",
}

export function PengaturanPelanggaranForm({ pengaturanAwal }: { pengaturanAwal: PengaturanPelanggaranAktif }) {
	const [aktif, setAktif] = useState(pengaturanAwal)
	const [menyimpan, setMenyimpan] = useState(false)
	const [pesan, setPesan] = useState<{ tipe: "sukses" | "error"; teks: string } | null>(null)

	const toggle = (tipe: TipePelanggaran) => {
		setAktif((current) => ({ ...current, [tipe]: !current[tipe] }))
		setPesan(null)
	}

	const simpan = async () => {
		setMenyimpan(true)
		setPesan(null)
		try {
			const response = await fetch("/api/pengaturan/pelanggaran", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(aktif),
			})
			const result = await response.json().catch(() => null)
			if (!response.ok) {
				setPesan({ tipe: "error", teks: result?.message ?? "Pengaturan gagal disimpan." })
				return
			}
			setPesan({ tipe: "sukses", teks: "Pengaturan berhasil disimpan." })
		} catch {
			setPesan({ tipe: "error", teks: "Terjadi kesalahan jaringan. Coba lagi." })
		} finally {
			setMenyimpan(false)
		}
	}

	const jumlahAktif = URUTAN_TIPE.filter((tipe) => aktif[tipe]).length

	return (
		<div className="mt-4">
			<div className="flex flex-col gap-3 rounded-[18px] border border-[#e8e6df] bg-gradient-to-br from-[#fbfaf7] via-white to-[#f4f7f5] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_-18px_rgba(22,35,63,0.45)] sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#0f1b30] dark:via-[#0b1120] dark:to-[#0b1120] dark:shadow-none">
				<div className="flex items-start gap-3">
					<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#16233f] to-[#315070] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_14px_-8px_rgba(22,35,63,0.7)]">
						<IconShield className="h-5 w-5" />
					</span>
					<div>
						<p className="text-[13px] font-semibold text-[#16233f] dark:text-white">Pusat kontrol pengawasan</p>
						<p className="mt-1 max-w-[600px] text-[11.5px] leading-5 text-[#7d879b] dark:text-white/40">Aktifkan pemeriksaan yang ingin diterapkan pada seluruh sesi ujian peserta.</p>
					</div>
				</div>
				<div className="flex w-fit items-center gap-2 rounded-full border border-[#dceee5] bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-[#047857] shadow-[0_3px_8px_rgba(6,78,59,0.06)] dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
					<span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_0_3px_rgba(16,185,129,0.13)]" />
					{jumlahAktif}/6 aktif
				</div>
			</div>

			<div className="mt-4 grid gap-2.5 sm:grid-cols-2">
				{URUTAN_TIPE.map((tipe) => (
					<div
						key={tipe}
						className={`group relative flex min-h-[88px] items-center justify-between gap-3 overflow-hidden rounded-[16px] border p-3.5 transition-all duration-200 ${
							aktif[tipe]
								? "border-[#d8e9e1] bg-white shadow-[0_8px_18px_-14px_rgba(6,78,59,0.5)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-14px_rgba(6,78,59,0.35)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:hover:bg-white/[0.06]"
								: "border-[#e8e8e5] bg-[#fafafa] opacity-[0.78] dark:border-white/5 dark:bg-white/[0.02]"
						}`}
					>
						<div className="flex min-w-0 items-center gap-3">
							<span
								className={`relative h-11 w-11 shrink-0 drop-shadow-[0_6px_10px_rgba(22,35,63,0.18)] transition-all duration-200 ${
									aktif[tipe] ? "" : "opacity-40 grayscale"
								}`}
							>
								<Image src={IKON_TIPE[tipe]} alt="" fill sizes="44px" className="object-contain" />
							</span>
							<span className="min-w-0">
								<span className="flex items-center gap-2">
									<p className="truncate text-[12.5px] font-semibold text-[#34435f] dark:text-white/85">{LABEL_TIPE_PELANGGARAN[tipe]}</p>
									{aktif[tipe] && <IconCheckCircle className="h-3.5 w-3.5 shrink-0 text-[#10a477]" />}
								</span>
								<p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#8b93a6] dark:text-white/35">{DESKRIPSI_TIPE[tipe]}</p>
							</span>
						</div>
						<button
							type="button"
							role="switch"
							aria-checked={aktif[tipe]}
							onClick={() => toggle(tipe)}
							aria-label={`${aktif[tipe] ? "Nonaktifkan" : "Aktifkan"} ${LABEL_TIPE_PELANGGARAN[tipe]}`}
							className={`relative h-7 w-[52px] shrink-0 rounded-full border p-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40 ${
								aktif[tipe] ? "border-[#3f35c9] bg-gradient-to-br from-[#5146db] to-[#352cc0] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_6px_12px_-7px_rgba(67,56,202,0.9)]" : "border-[#d4d8e0] bg-[#e5e7eb] shadow-inner dark:border-white/10 dark:bg-white/10"
							}`}
						>
							<span
								className={`block h-6 w-6 rounded-full bg-white shadow-[0_2px_5px_rgba(22,35,63,0.28)] transition-transform duration-200 ${
									aktif[tipe] ? "translate-x-[23px]" : "translate-x-0"
								}`}
							/>
						</button>
					</div>
				))}
			</div>

			{jumlahAktif === 0 && (
				<p className="mt-3 flex items-start gap-2 rounded-[12px] border border-[#f1dfbd] bg-[#fff9ed] px-3 py-2.5 text-[12px] text-[#a36e1f] shadow-[0_5px_12px_-10px_rgba(184,134,59,0.6)] dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
					<IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
					Semua jenis pelanggaran nonaktif — pengawasan otomatis ujian tidak akan mencatat apa pun.
				</p>
			)}

			{pesan && (
				<p
					className={`mt-3 flex items-center gap-2 rounded-[12px] border px-3 py-2.5 text-[12px] shadow-[0_5px_12px_-10px_rgba(6,78,59,0.4)] ${
						pesan.tipe === "sukses"
							? "bg-[#ecfdf5] text-[#047857] dark:bg-emerald-400/10 dark:text-emerald-300"
							: "bg-[#fdeaea] text-[#b93131] dark:bg-red-400/10 dark:text-red-300"
					}`}
				>
					{pesan.tipe === "sukses" && <IconCheckCircle className="h-4 w-4 shrink-0" />}
					{pesan.teks}
				</p>
			)}

			<button
				type="button"
				disabled={menyimpan}
				onClick={() => void simpan()}
				className="mt-4 inline-flex h-11 items-center gap-2 rounded-[12px] bg-gradient-to-br from-[#5146db] to-[#352cc0] px-5 text-[13px] font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_9px_16px_-8px_rgba(67,56,202,0.85)] transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_13px_20px_-8px_rgba(67,56,202,0.95)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{menyimpan ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : <IconSave className="h-4 w-4" />}
				{menyimpan ? "Menyimpan..." : "Simpan pengaturan"}
			</button>
		</div>
	)
}
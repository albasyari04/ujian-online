"use client"

import { useSyncExternalStore } from "react"
import Image from "next/image"
import { useTheme } from "@/components/providers/ThemeProvider"

// Pola resmi React untuk tahu "apakah sudah di client" tanpa memicu
// setState di dalam efek (yang ditandai oleh rule react-hooks/set-state-in-effect).
// getServerSnapshot selalu false (server tidak tahu tema), getSnapshot selalu
// true begitu kode berjalan di browser.
function subscribe() {
	return () => {}
}
function getSnapshot() {
	return true
}
function getServerSnapshot() {
	return false
}
function useSudahDiClient() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function KartuTema({
	aktif,
	label,
	deskripsi,
	onClick,
	children,
}: {
	aktif: boolean
	label: string
	deskripsi: string
	onClick: () => void
	children: React.ReactNode
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={aktif}
			className={`group relative flex flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 ${
				aktif
					? "border-[#00a7ff]/60 bg-[#f4faff] dark:border-[#00a7ff]/50 dark:bg-[#0f1f36]"
					: "border-[#e9e7e1] bg-white hover:border-[#d7d3c9] hover:bg-[#fafaf8] dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
			}`}
		>
			<span
				className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors ${
					aktif ? "bg-white ring-1 ring-[#00a7ff]/30 dark:bg-white/5" : "bg-[#f4f3ef] dark:bg-white/5"
				}`}
			>
				{children}
			</span>

			<span className="min-w-0 flex-1">
				<span
					className={`block truncate text-[12.5px] font-semibold leading-tight ${
						aktif ? "text-[#005a94] dark:text-[#6ec9ff]" : "text-[#16233f] dark:text-white"
					}`}
				>
					{label}
				</span>
				<span className="mt-0.5 block truncate text-[10.5px] leading-tight text-[#98a0b3] dark:text-white/35">
					{deskripsi}
				</span>
			</span>

			<span
				className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
					aktif ? "border-[#00a7ff] bg-[#00a7ff]" : "border-[#d7d3c9] bg-transparent dark:border-white/15"
				}`}
			>
				{aktif && (
					<svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
						<path d="M5 12.5L9.5 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				)}
			</span>
		</button>
	)
}

export function PengaturanTampilanForm() {
	const { theme, setTheme } = useTheme()
	const mounted = useSudahDiClient()

	if (!mounted) {
		return (
			<div className="mt-3 flex flex-col gap-2">
				{[0, 1, 2].map((i) => (
					<span key={i} className="h-[54px] animate-pulse rounded-xl bg-[#f0f2f1] dark:bg-white/5" />
				))}
			</div>
		)
	}

	return (
		<div className="mt-3 flex flex-col gap-2">
			<KartuTema
				aktif={theme === "light"}
				label="Terang"
				deskripsi="Tampilan cerah klasik"
				onClick={() => setTheme("light")}
			>
				<Image src="/image/icon/terang-icon.png" alt="Mode terang" fill sizes="36px" className="object-contain p-1.5" />
			</KartuTema>

			<KartuTema
				aktif={theme === "dark"}
				label="Gelap"
				deskripsi="Nyaman di mata malam hari"
				onClick={() => setTheme("dark")}
			>
				<Image src="/image/icon/gelap-icon.png" alt="Mode gelap" fill sizes="36px" className="object-contain p-1.5" />
			</KartuTema>

			<KartuTema
				aktif={theme === "system"}
				label="Ikuti Sistem"
				deskripsi="Menyesuaikan perangkat Anda"
				onClick={() => setTheme("system")}
			>
				<span className="relative block h-full w-full overflow-hidden rounded-full">
					<Image
						src="/image/icon/terang-icon.png"
						alt=""
						fill
						sizes="36px"
						className="object-cover p-1.5 [clip-path:polygon(0_0,50%_0,50%_100%,0_100%)]"
						aria-hidden="true"
					/>
					<Image
						src="/image/icon/gelap-icon.png"
						alt=""
						fill
						sizes="36px"
						className="object-cover p-1.5 [clip-path:polygon(50%_0,100%_0,100%_100%,50%_100%)]"
						aria-hidden="true"
					/>
				</span>
			</KartuTema>
		</div>
	)
}
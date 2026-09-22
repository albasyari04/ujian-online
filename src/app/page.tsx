import Link from "next/link"
import Image from "next/image"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { authOptions } from "@/lib/auth"

export default async function HomePage() {
	const session = await getServerSession(authOptions)

	// Kalau sudah login, tidak perlu lihat landing page lagi —
	// langsung arahkan ke dashboard sesuai perannya.
	if (session?.user) {
		if (session.user.role === "ADMIN") redirect("/dashboard")
		if (session.user.role === "PESERTA") redirect("/beranda-peserta")
	}

	return (
		<main className="relative min-h-screen overflow-hidden bg-[#fbfaf7] dark:bg-[#0b1120]">
			{/* ============ DEKORASI LATAR ============ */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-[#e8a33d]/20 blur-3xl dark:bg-[#e8a33d]/10" />
				<div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-[#16233f]/10 blur-3xl dark:bg-[#00a7ff]/10" />
				<div
					className="absolute inset-0 opacity-[0.35] dark:opacity-[0.08]"
					style={{
						backgroundImage:
							"radial-gradient(circle at 1px 1px, rgba(22,35,63,0.15) 1px, transparent 0)",
						backgroundSize: "28px 28px",
					}}
				/>
			</div>

			<div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center px-6 py-10 sm:py-14">
				{/* ============ HERO ============ */}
				<div className="mt-8 flex flex-col items-center text-center sm:mt-12">
					<Image
						src="/image/topiku.png"
						alt="Ujian Online SMA Al-Istiqomah"
						width={144}
						height={144}
						priority
						className="mb-5 h-32 w-32 object-contain drop-shadow-[0_10px_18px_rgba(22,35,63,0.25)] dark:invert dark:drop-shadow-[0_10px_18px_rgba(0,167,255,0.25)]"
					/>

					<h1 className="max-w-2xl text-4xl font-semibold leading-tight text-[#16233f] sm:text-5xl dark:text-white">
						Ruang ujian yang{" "}
						<span className="inline-block bg-gradient-to-r from-[#b8863b] to-[#e8a33d] bg-clip-text pr-1 pb-1 text-transparent">
							teratur
						</span>
						.
					</h1>
					<p className="mt-4 max-w-md leading-7 text-[#5b657d] dark:text-white/60">
						Platform ujian online untuk peserta dan admin akademik — terjadwal rapi,
						terekap otomatis, dan mudah dipantau.
					</p>
				</div>

				{/* ============ CTA UTAMA ============ */}
				<Link
					href="/login"
					className="group mt-14 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#233052] to-[#16233f] px-8 py-3.5 font-medium text-white shadow-[0_12px_30px_-10px_rgba(22,35,63,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-8px_rgba(22,35,63,0.65)]"
				>
					Masuk ke akun
					<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</Link>

				<p className="mt-16 text-xs text-[#9aa2b4] dark:text-white/30">
					© {new Date().getFullYear()} SMA Al-Istiqomah — Ujian Online
				</p>
			</div>
		</main>
	)
}
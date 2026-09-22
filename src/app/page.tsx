import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import {
	GraduationCap,
	ShieldCheck,
	UserRound,
	CalendarCheck2,
	FileSpreadsheet,
	Timer,
	ArrowRight,
	Sparkles,
} from "lucide-react"

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

			<div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center px-6 py-16 sm:py-20">
				{/* ============ BRAND BADGE ============ */}
				<div className="mb-8 flex items-center gap-2 rounded-full border border-[#e4dfd2] bg-white/80 px-4 py-1.5 shadow-[0_1px_2px_rgba(22,35,63,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5">
					<Sparkles className="h-3.5 w-3.5 text-[#b8863b] dark:text-[#e8a33d]" />
					<span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b8863b] dark:text-[#e8a33d]">
						Ujian Online · SMA Al-Istiqomah
					</span>
				</div>

				{/* ============ HERO ============ */}
				<div className="flex flex-col items-center text-center">
					<div className="relative mb-6">
						<div className="absolute inset-0 rounded-2xl bg-[#16233f] blur-lg opacity-20 dark:bg-[#00a7ff]/30" />
						<div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#233052] to-[#16233f] shadow-[0_10px_25px_-8px_rgba(22,35,63,0.55)] ring-1 ring-white/10">
							<GraduationCap className="h-8 w-8 text-white" strokeWidth={1.8} />
						</div>
					</div>

					<h1 className="max-w-2xl text-4xl font-semibold leading-tight text-[#16233f] sm:text-5xl dark:text-white">
						Ruang ujian yang{" "}
						<span className="bg-gradient-to-r from-[#b8863b] to-[#e8a33d] bg-clip-text text-transparent">
							teratur
						</span>
						.
					</h1>
					<p className="mt-4 max-w-md leading-7 text-[#5b657d] dark:text-white/60">
						Platform ujian online untuk peserta dan admin akademik — terjadwal rapi,
						terekap otomatis, dan mudah dipantau.
					</p>
				</div>

				{/* ============ KARTU PERAN (3D) ============ */}
				<div className="mt-12 grid w-full gap-5 sm:grid-cols-2">
					<RoleCard
						icon={<UserRound className="h-6 w-6" strokeWidth={1.8} />}
						title="Untuk Peserta"
						description="Ikuti ujian sesuai jadwal, lihat hasil, dan pantau progres belajarmu."
						href="/login"
						accent="gold"
					/>
					<RoleCard
						icon={<ShieldCheck className="h-6 w-6" strokeWidth={1.8} />}
						title="Untuk Admin & Guru"
						description="Kelola bank soal, jadwal ujian, dan rekap nilai dalam satu tempat."
						href="/login"
						accent="navy"
					/>
				</div>

				{/* ============ FITUR UNGGULAN ============ */}
				<div className="mt-14 grid w-full gap-4 sm:grid-cols-3">
					<FeatureCard
						icon={<CalendarCheck2 className="h-5 w-5" strokeWidth={1.8} />}
						title="Jadwal Rapi"
						description="Semua sesi ujian tersusun otomatis dan mudah dipantau."
					/>
					<FeatureCard
						icon={<FileSpreadsheet className="h-5 w-5" strokeWidth={1.8} />}
						title="Bank Soal Terpusat"
						description="Import soal dari Word langsung ke sistem tanpa ribet."
					/>
					<FeatureCard
						icon={<Timer className="h-5 w-5" strokeWidth={1.8} />}
						title="Hasil Real-time"
						description="Nilai dan rekap ujian tersedia begitu sesi selesai."
					/>
				</div>

				{/* ============ CTA UTAMA ============ */}
				<Link
					href="/login"
					className="group mt-14 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#233052] to-[#16233f] px-6 py-3.5 font-medium text-white shadow-[0_12px_30px_-10px_rgba(22,35,63,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-8px_rgba(22,35,63,0.65)]"
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

/* =========================================================
   KARTU PERAN — kartu besar bergaya 3D (border gradient + elevasi)
   ========================================================= */
function RoleCard({
	icon,
	title,
	description,
	href,
	accent,
}: {
	icon: React.ReactNode
	title: string
	description: string
	href: string
	accent: "gold" | "navy"
}) {
	const iconWrapClass =
		accent === "gold"
			? "bg-gradient-to-br from-[#e8a33d]/15 to-[#b8863b]/10 text-[#b8863b] dark:text-[#e8a33d]"
			: "bg-gradient-to-br from-[#233052]/10 to-[#16233f]/5 text-[#16233f] dark:text-[#7fa7e8]"

	return (
		<Link
			href={href}
			className="group relative rounded-2xl bg-gradient-to-br from-[#e4dfd2] via-white to-white p-[1px] shadow-[0_1px_2px_rgba(22,35,63,0.05),0_20px_45px_-18px_rgba(22,35,63,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(22,35,63,0.06),0_28px_55px_-16px_rgba(22,35,63,0.4)] dark:from-white/10 dark:via-[#141c30] dark:to-[#141c30]"
		>
			<div className="flex h-full flex-col rounded-[1rem] bg-white p-6 dark:bg-[#141c30]">
				<div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconWrapClass}`}>
					{icon}
				</div>
				<h3 className="text-lg font-semibold text-[#16233f] dark:text-white">{title}</h3>
				<p className="mt-1.5 text-sm leading-6 text-[#5b657d] dark:text-white/55">{description}</p>
				<span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#16233f] dark:text-white/80">
					Masuk
					<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</span>
			</div>
		</Link>
	)
}

/* =========================================================
   KARTU FITUR — kartu kecil dengan elevasi ringan
   ========================================================= */
function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode
	title: string
	description: string
}) {
	return (
		<div className="rounded-xl border border-[#e4dfd2] bg-white/90 p-5 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_12px_28px_-16px_rgba(22,35,63,0.25)] backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(22,35,63,0.05),0_16px_32px_-14px_rgba(22,35,63,0.3)] dark:border-white/10 dark:bg-white/5">
			<div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#16233f]/5 text-[#16233f] dark:bg-white/10 dark:text-white/80">
				{icon}
			</div>
			<h4 className="text-sm font-semibold text-[#16233f] dark:text-white">{title}</h4>
			<p className="mt-1 text-xs leading-5 text-[#5b657d] dark:text-white/50">{description}</p>
		</div>
	)
}
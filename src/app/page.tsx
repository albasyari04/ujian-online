import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

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
		<main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-6 dark:bg-[#0b1120]">
			<section className="w-full max-w-lg rounded-2xl border border-[#e4dfd2] bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#141c30]">
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b8863b] dark:text-[#e8a33d]">Ujian Online</p>
				<h1 className="mt-3 text-3xl font-semibold text-[#16233f] dark:text-white">Ruang ujian yang teratur.</h1>
				<p className="mt-3 leading-7 text-[#5b657d] dark:text-white/60">Masuk untuk mengikuti ujian atau mengelola kegiatan akademik.</p>
				<Link href="/login" className="mt-7 inline-flex rounded-lg bg-[#16233f] px-5 py-3 font-medium text-white hover:bg-[#233052]">
					Masuk ke akun
				</Link>
			</section>
		</main>
	)
}

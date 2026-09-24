import { withAuth } from "next-auth/middleware"

export const middleware = withAuth({
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/login",
	},
})

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/beranda-peserta/:path*",
		"/ujian/:path*",
		"/hasil/:path*",
		"/guru/:path*",
		"/beranda-guru/:path*",
		"/ujian-guru/:path*",
		"/bank-soal-guru/:path*",
		"/hasil-guru/:path*",
		"/profil-guru/:path*",
	],
}
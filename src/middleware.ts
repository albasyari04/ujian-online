import { withAuth } from "next-auth/middleware"

export const middleware = withAuth({
	secret: process.env.NEXTAUTH_SECRET, // ← WAJIB: Edge Runtime tidak selalu auto-baca env NextAuth
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
	],
}
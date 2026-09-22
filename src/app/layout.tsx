import type { Metadata } from "next"
import "./globals.css"
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"

export const metadata: Metadata = {
	title: "Ujian Online",
	description: "Platform ujian online untuk peserta dan admin akademik.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		// suppressHydrationWarning wajib di sini karena next-themes menyuntikkan
		// class "light"/"dark" ke <html> sebelum React hydrate — kalau tidak
		// di-suppress, React akan salah mengira ada mismatch server/client.
		<html lang="id" suppressHydrationWarning>
			<body>
				<ThemeProvider defaultTheme="system">
					<AuthSessionProvider>{children}</AuthSessionProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}

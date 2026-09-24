import Image from "next/image"
import type { Metadata } from "next"
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { LoginForm } from "@/components/auth/LoginForm"
import { isSafeCallbackUrl } from "@/lib/utils"

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Masuk - Ujian Online",
  description: "Masuk ke akun untuk mengikuti atau mengelola ujian online.",
}

const features = [
  { icon: "/image/icon/aman-terpercaya.png", title: "Aman", text: "Sistem terjamin" },
  { icon: "/image/icon/sedang-mengerjakan-icon.png", title: "Mudah", text: "Akses kapan saja" },
  { icon: "/image/icon/hasil-belajar.png", title: "Profesional", text: "Hasil transparan" },
] as const

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] | undefined }>
}) {
  const session = await getServerSession(authOptions)

  if (
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "GURU" ||
    session?.user?.role === "PESERTA"
  ) {
    const resolvedSearchParams = await searchParams
    const callbackUrl = Array.isArray(resolvedSearchParams.callbackUrl)
      ? resolvedSearchParams.callbackUrl[0]
      : resolvedSearchParams.callbackUrl

    const target = isSafeCallbackUrl(callbackUrl)
      ? callbackUrl
      : session.user.role === "ADMIN"
        ? "/dashboard"
        : session.user.role === "GURU"
          ? "/beranda-guru"
          : "/beranda-peserta"

    redirect(target)
  }

  return (
    <main
      className={`${fraunces.variable} ${plusJakarta.variable} relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#eef3fb] via-[#f6f8fc] to-white font-sans antialiased lg:h-[100dvh] lg:overflow-hidden`}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-[#dbe6fb] opacity-70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[8%] top-[-30px] h-[160px] w-[160px] rounded-full bg-[#c7d9fb] opacity-60 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-[180px] -left-[180px] z-0 hidden h-[280px] w-[280px] rounded-full bg-[#0b1a3f] lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-[90px] -left-[40px] z-0 hidden h-[140px] w-[140px] rounded-full bg-[#13275c] opacity-80 lg:block"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1360px] flex-col items-center gap-6 px-5 py-6 lg:h-full lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-10 lg:py-4 xl:px-16">
        <section className="hidden h-full w-full max-w-[620px] flex-col lg:flex">
          <div className="flex shrink-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#eaf1ff]">
              <Image src="/image/topiku.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
            </span>
            <div>
              <p className="text-[18px] font-semibold leading-tight text-[#16233f]">Ujian Online</p>
              <p className="text-[13px] leading-tight text-[#6b7690]">Portal Peserta</p>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center py-2">
            <Image
              src="/image/login-gambar.png"
              alt="Ilustrasi peserta mengerjakan ujian online"
              width={460}
              height={460}
              priority
              className="h-full max-h-full w-auto max-w-full object-contain"
            />
          </div>

          <div className="shrink-0">
            <h1
              className="relative z-10 text-[clamp(24px,2.4vw,34px)] font-semibold leading-[1.15] text-[#16233f]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Selamat Datang di
              <br />
              <span className="text-[#2f5fd8]">Ujian Online</span>
            </h1>

            <p className="relative z-10 mt-2.5 max-w-[500px] text-[13.5px] leading-relaxed text-[#3d4a63]">
              Kerjakan ujian dengan tenang, jujur, dan penuh integritas. Raih masa depan yang lebih baik bersama kami.
            </p>

            <div className="relative z-10 mt-4 flex flex-wrap items-center gap-x-7 gap-y-3">
              {features.map(({ icon, title, text }) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf1ff]">
                    <Image src={icon} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-semibold leading-tight text-[#16233f]">{title}</p>
                    <p className="text-[11.5px] leading-tight text-[#5b6a86]">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex w-full flex-col items-center gap-4 pt-2 lg:hidden">
          <Image
            src="/image/login-gambar.png"
            alt="Ilustrasi peserta mengerjakan ujian online"
            width={320}
            height={320}
            priority
            className="h-auto max-h-[26vh] w-auto max-w-[240px] object-contain"
          />

          <div className="text-center">
            <h1
              className="text-[21px] font-semibold leading-tight text-[#16233f]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Selamat Datang di <span className="text-[#2f5fd8]">Ujian Online</span>
            </h1>
            <p className="mx-auto mt-1.5 max-w-[320px] text-[12.5px] leading-relaxed text-[#5b6a86]">
              Kerjakan ujian dengan tenang, jujur, dan penuh integritas.
            </p>
          </div>
        </div>

        <section className="flex w-full max-w-[440px] shrink-0 items-center justify-center py-2 lg:h-full">
          <LoginForm />
        </section>

        <div className="grid w-full max-w-[380px] grid-cols-3 gap-2.5 pb-4 lg:hidden">
          {features.map(({ icon, title, text }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#e7ecf5] bg-white/70 px-2 py-3 text-center"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf1ff]">
                <Image src={icon} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
              </span>
              <p className="text-[11.5px] font-semibold leading-tight text-[#16233f]">{title}</p>
              <p className="text-[9.5px] leading-tight text-[#5b6a86]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
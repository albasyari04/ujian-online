"use client"

import { useState, type FormEvent } from "react"

import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

import { registerSchema } from "@/lib/validations/auth.schema"

type FieldErrors = Partial<Record<"nama" | "email" | "password" | "confirmPassword", string>>

/* =========================================================
   ICON
   (persis sama dengan set icon di LoginForm.tsx + UserIcon
   dipakai untuk field "Nama lengkap")
========================================================= */

function UserFieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[17px] w-[17px]" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20C6 16.5 8.7 14.5 12 14.5C15.3 14.5 18 16.5 19 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[17px] w-[17px]" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[17px] w-[17px]" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 10V7.5C8 5.6 9.8 4 12 4C14.2 4 16 5.6 16 7.5V10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
        <path
          d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.6 10.7A2.5 2.5 0 0 0 14.1 14.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M7.4 7.5C4.9 9 3 12 3 12s3.5 7 9.5 7c1.8 0 3.4-.5 4.7-1.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.9 16.9C19.4 15.3 21 12 21 12s-1.2-2.4-3.4-4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[17px] w-[17px]" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 20C5.8 15.7 8.2 13.3 12 13.3C15.8 13.3 18.2 15.7 19 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ShieldMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 3L19 6V11C19 15.6 16.2 19.4 12 21C7.8 19.4 5 15.6 5 11V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* =========================================================
   SPINNER
========================================================= */

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12A9 9 0 0 0 12 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/* =========================================================
   ARROW
========================================================= */

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 12H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* =========================================================
   REGISTER FORM
   Struktur & class disamakan 1:1 dengan LoginForm.tsx.
   Logic submit (validasi zod, fetch /api/auth/register, signIn)
   tidak diubah dari versi sebelumnya.
========================================================= */

export function RegisterForm() {
  const router = useRouter()

  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setFormError(null)

    const result = registerSchema.safeParse({ nama, email, password, confirmPassword })

    if (!result.success) {
      const errors: FieldErrors = {}

      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors
        if (!errors[key]) {
          errors[key] = issue.message
        }
      }

      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: result.data.nama,
          email: result.data.email,
          password: result.data.password,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setFormError(payload?.message ?? "Pendaftaran gagal. Coba lagi.")
        setIsSubmitting(false)
        return
      }

      const signInResponse = await signIn("credentials", {
        email: result.data.email,
        password: result.data.password,
        redirect: false,
      })

      if (!signInResponse || signInResponse.error) {
        router.replace("/login")
        return
      }

      router.replace("/")
      router.refresh()
    } catch {
      setFormError("Terjadi masalah saat menghubungi server. Coba lagi.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative w-full max-w-[440px] rounded-[24px] border border-white bg-white p-6 shadow-[0_30px_70px_-25px_rgba(15,30,70,0.28)] sm:p-7">
      {/* =================================================
          HEADER — logo & merek (sama dengan LoginForm)
      ================================================= */}

      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#eaf1ff]">
          <Image src="/image/topiku.png" alt="" width={24} height={24} className="h-[22px] w-[22px] object-contain" />
        </span>
        <div>
          <p className="text-[14.5px] font-semibold leading-tight text-[#16233f]">Ujian Online</p>
          <p className="text-[11px] leading-tight text-[#6b7690]">Portal Peserta</p>
        </div>
      </div>

      {/* =================================================
          TITLE
      ================================================= */}

      <h1
        className="mt-4 text-[20px] leading-tight text-[#16233f] sm:text-[22px]"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
      >
        Daftar Akun Peserta
      </h1>

      <p className="mt-1 text-[12px] text-[#71809b]">Isi data di bawah untuk membuat akun peserta ujian.</p>

      {/* =================================================
          FORM
      ================================================= */}

      <form noValidate onSubmit={handleSubmit} className="mt-4">
        {formError ? (
          <div role="alert" className="mb-3 rounded-xl border border-[#E7B9AC] bg-[#FBEEEA] px-3.5 py-2 text-xs text-[#8A3A26]">
            {formError}
          </div>
        ) : null}

        {/* =================================================
            NAMA LENGKAP
        ================================================= */}

        <div>
          <label htmlFor="nama" className="sr-only">
            Nama lengkap
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b98ad]">
              <UserFieldIcon />
            </span>

            <input
              id="nama"
              name="nama"
              type="text"
              autoComplete="name"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              aria-invalid={Boolean(fieldErrors.nama)}
              aria-describedby={fieldErrors.nama ? "nama-error" : undefined}
              className="block h-[46px] w-full rounded-2xl border border-[#e1e6ef] bg-[#f9fafc] pl-12 pr-4 text-[13.5px] text-[#16233F] outline-none transition placeholder:text-[#9aa4b7] focus:border-[#2f5fd8] focus:bg-white focus:ring-4 focus:ring-[#2f5fd8]/10"
              placeholder="Nama sesuai data sekolah"
            />
          </div>

          {fieldErrors.nama ? (
            <p id="nama-error" className="mt-1 text-[11px] text-[#B3432B]">
              {fieldErrors.nama}
            </p>
          ) : null}
        </div>

        {/* =================================================
            EMAIL
        ================================================= */}

        <div className="mt-2.5">
          <label htmlFor="email" className="sr-only">
            Email
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b98ad]">
              <MailIcon />
            </span>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className="block h-[46px] w-full rounded-2xl border border-[#e1e6ef] bg-[#f9fafc] pl-12 pr-4 text-[13.5px] text-[#16233F] outline-none transition placeholder:text-[#9aa4b7] focus:border-[#2f5fd8] focus:bg-white focus:ring-4 focus:ring-[#2f5fd8]/10"
              placeholder="nama@siswa.sch.id"
            />
          </div>

          {fieldErrors.email ? (
            <p id="email-error" className="mt-1 text-[11px] text-[#B3432B]">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        {/* =================================================
            PASSWORD
        ================================================= */}

        <div className="mt-2.5">
          <label htmlFor="password" className="sr-only">
            Kata sandi
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b98ad]">
              <LockIcon />
            </span>

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              className="block h-[46px] w-full rounded-2xl border border-[#e1e6ef] bg-[#f9fafc] pl-12 pr-12 text-[13.5px] text-[#16233F] outline-none transition placeholder:text-[#9aa4b7] focus:border-[#2f5fd8] focus:bg-white focus:ring-4 focus:ring-[#2f5fd8]/10"
              placeholder="Minimal 8 karakter"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-[#8A96A9] transition hover:text-[#26314A]"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {fieldErrors.password ? (
            <p id="password-error" className="mt-1 text-[11px] text-[#B3432B]">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {/* =================================================
            KONFIRMASI PASSWORD
        ================================================= */}

        <div className="mt-2.5">
          <label htmlFor="confirmPassword" className="sr-only">
            Konfirmasi kata sandi
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b98ad]">
              <LockIcon />
            </span>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
              className="block h-[46px] w-full rounded-2xl border border-[#e1e6ef] bg-[#f9fafc] pl-12 pr-12 text-[13.5px] text-[#16233F] outline-none transition placeholder:text-[#9aa4b7] focus:border-[#2f5fd8] focus:bg-white focus:ring-4 focus:ring-[#2f5fd8]/10"
              placeholder="Ulangi kata sandi"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-[#8A96A9] transition hover:text-[#26314A]"
            >
              <EyeIcon open={showConfirmPassword} />
            </button>
          </div>

          {fieldErrors.confirmPassword ? (
            <p id="confirmPassword-error" className="mt-1 text-[11px] text-[#B3432B]">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        {/* =================================================
            SUBMIT BUTTON
        ================================================= */}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#2f5fd8] px-4 text-[14px] font-semibold text-white shadow-[0_14px_28px_-10px_rgba(47,95,216,0.55)] transition hover:bg-[#2450bb] focus:outline-none focus:ring-4 focus:ring-[#2f5fd8]/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Spinner />
              Membuat akun…
            </>
          ) : (
            <>
              <ArrowRightIcon />
              Daftar
            </>
          )}
        </button>
      </form>

      {/* =================================================
          DIVIDER
      ================================================= */}

      <div className="mt-4 flex w-full items-center gap-3 text-[11px] text-[#98a1b0]">
        <span className="h-px flex-1 bg-[#e7eaf0]" />
        <span>atau</span>
        <span className="h-px flex-1 bg-[#e7eaf0]" />
      </div>

      {/* =================================================
          MASUK KE AKUN
      ================================================= */}

      <Link
        href="/login"
        className="mt-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-[#c9d9fb] bg-white text-[13px] font-semibold text-[#2f5fd8] transition hover:bg-[#f3f7ff]"
      >
        <UserIcon />
        Masuk ke Akun
      </Link>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mt-5 flex items-center justify-center gap-2">
        <span className="text-[#8b93a6]">
          <ShieldMiniIcon />
        </span>
        <div className="text-left">
          <p className="text-[11px] font-semibold leading-tight text-[#16233f]">Sistem Ujian Online</p>
          <p className="text-[10px] leading-tight text-[#8b93a6]">Pendidikan Berkualitas untuk Masa Depan</p>
        </div>
      </div>
    </div>
  )
}
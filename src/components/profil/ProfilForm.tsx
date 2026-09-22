"use client"

import { useState, type FormEvent } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"

type ProfilUser = {
  nama: string
  email: string
  role: string
  bergabungSejak: string
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/* =========================================================
   ICONS
   Ikon lokal (SVG inline) — konsisten dengan gaya stroke
   yang dipakai di SidebarPeserta.tsx.
========================================================= */

function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="8.3" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 20C5.4 15.6 8 13.2 12 13.2C16 13.2 18.6 15.6 19.5 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7L12 13L19.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 3.5L19 6.2V11C19 15.3 16.1 18.9 12 20.5C7.9 18.9 5 15.3 5 11V6.2L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 11.3L11 13.3L15.3 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10H20.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 3.5V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10.5V7.8C7.5 5.6 9.3 3.8 12 3.8C14.7 3.8 16.5 5.6 16.5 7.8V10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.3" fill="currentColor" />
    </svg>
  )
}

function IconCheckCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.3 12.3L10.7 14.7L15.7 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 3.5L21 19.5H3L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10V14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" />
    </svg>
  )
}

/* =========================================================
   HERO: RINGKASAN PROFIL
========================================================= */

function ProfilHero({ user }: { user: ProfilUser }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#16233f] via-[#1a2a4a] to-[#1f2f52] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_5px_0_#0d1424,0_24px_44px_-22px_rgba(22,35,63,0.65)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_7px_0_#0d1424,0_30px_50px_-22px_rgba(22,35,63,0.72)] sm:p-7">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-[#e8a33d]/15 blur-2xl" aria-hidden="true" />

      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8a33d] to-[#c9791f] p-2.5 shadow-[0_12px_26px_-6px_rgba(232,163,61,0.55)] ring-4 ring-white/10">
          <Image
            src="/image/icon/user-icon.png"
            alt={user.nama}
            width={64}
            height={64}
            className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
            priority
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[19px] font-semibold leading-tight">{user.nama}</p>
          <p className="mt-1 truncate text-[13px] text-white/60">{user.email}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-medium text-white/85">
              <IconShield className="h-3.5 w-3.5" />
              {user.role === "PESERTA" ? "Peserta Ujian" : user.role}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-medium text-white/85">
              <IconCalendar className="h-3.5 w-3.5" />
              Bergabung {formatTanggal(user.bergabungSejak)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   CARD: INFORMASI AKUN (nama & email)
========================================================= */

function CardInformasiAkun({ user }: { user: ProfilUser }) {
  const { update } = useSession()

  const [nama, setNama] = useState(user.nama)
  const [email, setEmail] = useState(user.email)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sukses, setSukses] = useState(false)

  const berubah =
    nama.trim() !== user.nama || email.trim().toLowerCase() !== user.email

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!berubah || loading) return

    setLoading(true)
    setError(null)
    setSukses(false)

    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: nama.trim(), email: email.trim() }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan perubahan")
        return
      }

      // Sinkronkan sesi NextAuth supaya nama/email di Navbar ikut berubah
      // tanpa perlu login ulang. Lihat catatan trigger "update" di lib/auth.ts.
      await update({ name: data.user.nama, email: data.user.email })
      setSukses(true)
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="group relative overflow-hidden rounded-[20px] border border-[#e7e4dc] bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_0_#e3e7ee,0_22px_34px_-16px_rgba(22,35,63,0.4)] sm:p-6"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#16233f]/[0.04] blur-2xl" aria-hidden="true" />

      <div className="relative flex items-center gap-3">
        <Image
          src="/image/icon/informasi-akun-icon.png"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_4px_6px_rgba(22,35,63,0.25)] transition-transform duration-300 group-hover:-translate-y-0.5"
        />
        <div>
          <h2 className="text-[15px] font-semibold text-[#16233f]">Informasi Akun</h2>
          <p className="mt-0.5 text-[12px] text-[#8b93a6]">
            Bergabung sejak {formatTanggal(user.bergabungSejak)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nama" className="text-[12.5px] font-medium text-[#34435f]">
            Nama Lengkap
          </label>
          <div className="relative">
            <IconUser className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7ade0]" />
            <input
              id="nama"
              value={nama}
              onChange={(event) => {
                setNama(event.target.value)
                setSukses(false)
              }}
              type="text"
              required
              minLength={3}
              className="w-full rounded-[10px] border border-[#e7e4dc] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-[13.5px] text-[#16233f] outline-none transition-colors focus:border-[#e8a33d] focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[12.5px] font-medium text-[#34435f]">
            Email
          </label>
          <div className="relative">
            <IconMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7ade0]" />
            <input
              id="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setSukses(false)
              }}
              type="email"
              required
              className="w-full rounded-[10px] border border-[#e7e4dc] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-[13.5px] text-[#16233f] outline-none transition-colors focus:border-[#e8a33d] focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-medium text-[#34435f]">Peran</label>
          <div className="flex items-center gap-2.5 rounded-[10px] border border-[#e7e4dc] bg-[#f7f9f8] px-3.5 py-2.5">
            <IconShield className="h-4 w-4 shrink-0 text-[#8b93a6]" />
            <p className="text-[13.5px] text-[#8b93a6]">
              {user.role === "PESERTA" ? "Peserta Ujian" : user.role}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-[10px] bg-[#fdf1f1] px-3.5 py-2.5 text-[12.5px] text-[#d23b3b]">
          <IconAlert className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {sukses && !error && (
        <p className="mt-4 flex items-center gap-2 rounded-[10px] bg-[#ecfdf5] px-3.5 py-2.5 text-[12.5px] text-[#059669]">
          <IconCheckCircle className="h-4 w-4 shrink-0" />
          Informasi akun berhasil diperbarui.
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={!berubah || loading}
          className="rounded-[10px] bg-[#16233f] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_8px_18px_-8px_rgba(22,35,63,0.55)] transition-colors hover:bg-[#1f2f52] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  )
}

/* =========================================================
   CARD: UBAH KATA SANDI
========================================================= */

function CardUbahPassword() {
  const [passwordSaatIni, setPasswordSaatIni] = useState("")
  const [passwordBaru, setPasswordBaru] = useState("")
  const [konfirmasi, setKonfirmasi] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sukses, setSukses] = useState(false)

  const validForm =
    passwordSaatIni.length > 0 && passwordBaru.length >= 8 && konfirmasi.length > 0

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validForm || loading) return

    setLoading(true)
    setError(null)
    setSukses(false)

    try {
      const res = await fetch("/api/profil/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordSaatIni,
          passwordBaru,
          konfirmasiPasswordBaru: konfirmasi,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error ?? "Gagal mengubah kata sandi")
        return
      }

      setSukses(true)
      setPasswordSaatIni("")
      setPasswordBaru("")
      setKonfirmasi("")
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="group relative overflow-hidden rounded-[20px] border border-[#e7e4dc] bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_0_#e3e7ee,0_22px_34px_-16px_rgba(22,35,63,0.4)] sm:p-6"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#b45309]/[0.05] blur-2xl" aria-hidden="true" />

      <div className="relative flex items-center gap-3">
        <Image
          src="/image/icon/ubah-kata-sandi-icon.png"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_4px_6px_rgba(180,83,9,0.3)] transition-transform duration-300 group-hover:-translate-y-0.5"
        />
        <div>
          <h2 className="text-[15px] font-semibold text-[#16233f]">Ubah Kata Sandi</h2>
          <p className="mt-0.5 text-[12px] text-[#8b93a6]">
            Gunakan kata sandi yang kuat dan belum pernah dipakai sebelumnya.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="passwordSaatIni" className="text-[12.5px] font-medium text-[#34435f]">
            Kata Sandi Saat Ini
          </label>
          <div className="relative">
            <IconLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e0bd8d]" />
            <input
              id="passwordSaatIni"
              value={passwordSaatIni}
              onChange={(event) => {
                setPasswordSaatIni(event.target.value)
                setSukses(false)
              }}
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-[10px] border border-[#e7e4dc] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-[13.5px] text-[#16233f] outline-none transition-colors focus:border-[#e8a33d] focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="passwordBaru" className="text-[12.5px] font-medium text-[#34435f]">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <IconLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e0bd8d]" />
            <input
              id="passwordBaru"
              value={passwordBaru}
              onChange={(event) => {
                setPasswordBaru(event.target.value)
                setSukses(false)
              }}
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-[10px] border border-[#e7e4dc] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-[13.5px] text-[#16233f] outline-none transition-colors focus:border-[#e8a33d] focus:bg-white"
            />
          </div>
          <p className="text-[11.5px] text-[#8b93a6]">Minimal 8 karakter.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="konfirmasi" className="text-[12.5px] font-medium text-[#34435f]">
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <IconLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e0bd8d]" />
            <input
              id="konfirmasi"
              value={konfirmasi}
              onChange={(event) => {
                setKonfirmasi(event.target.value)
                setSukses(false)
              }}
              type="password"
              required
              autoComplete="new-password"
              className="w-full rounded-[10px] border border-[#e7e4dc] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-[13.5px] text-[#16233f] outline-none transition-colors focus:border-[#e8a33d] focus:bg-white"
            />
          </div>
          {konfirmasi.length > 0 && konfirmasi !== passwordBaru && (
            <p className="flex items-center gap-1.5 text-[11.5px] text-[#d23b3b]">
              <IconAlert className="h-3.5 w-3.5 shrink-0" />
              Kata sandi tidak cocok.
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-[10px] bg-[#fdf1f1] px-3.5 py-2.5 text-[12.5px] text-[#d23b3b]">
          <IconAlert className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {sukses && !error && (
        <p className="mt-4 flex items-center gap-2 rounded-[10px] bg-[#ecfdf5] px-3.5 py-2.5 text-[12.5px] text-[#059669]">
          <IconCheckCircle className="h-4 w-4 shrink-0" />
          Kata sandi berhasil diubah.
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={!validForm || loading}
          className="rounded-[10px] bg-[#16233f] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_8px_18px_-8px_rgba(22,35,63,0.55)] transition-colors hover:bg-[#1f2f52] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {loading ? "Menyimpan..." : "Ubah Kata Sandi"}
        </button>
      </div>
    </form>
  )
}

/* =========================================================
   WRAPPER
========================================================= */

export function ProfilForm({ user }: { user: ProfilUser }) {
  return (
    <div className="flex flex-col gap-5">
      <ProfilHero user={user} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CardInformasiAkun user={user} />
        <CardUbahPassword />
      </div>
    </div>
  )
}
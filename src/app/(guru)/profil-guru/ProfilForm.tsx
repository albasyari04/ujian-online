"use client"

import { useState } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

/* =========================================================
   ICON INPUT — SVG inline ringan, tanpa dependensi file lain
========================================================= */

function IconUser({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2.25c-4.14 0-7.5 2.35-7.5 5.25v.75a.75.75 0 0 0 .75.75h13.5a.75.75 0 0 0 .75-.75v-.75c0-2.9-3.36-5.25-7.5-5.25Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconMail({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3.75 6.75A1.5 1.5 0 0 1 5.25 5.25h13.5a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V6.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="m4.5 7 7.5 5.5L19.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconImageLink({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.75" y="4.5" width="16.5" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.75" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m5.5 17.5 4.5-4.5a1.5 1.5 0 0 1 2.12 0l1.13 1.13m0 0 2.5-2.5a1.5 1.5 0 0 1 2.12 0l1.63 1.63"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconLock({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5.25" y="10.5" width="13.5" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.25 10.5V7.5a3.75 3.75 0 1 1 7.5 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconCheckCircle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.25 12.5 2.5 2.5 5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconAlertCircle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.9" fill="currentColor" />
    </svg>
  )
}

function IconShield({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.5 5 6v5.2c0 4.5 2.98 7.9 7 9.3 4.02-1.4 7-4.8 7-9.3V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m9.25 12 1.9 1.9L14.75 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* =========================================================
   FIELD INPUT — label + icon + input, gaya konsisten
========================================================= */

function FieldInput({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string
  icon: ReactNode
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-[12.5px] font-medium text-[#34435f] dark:text-white/70">{label}</label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3abbc] dark:text-white/30">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[12px] border border-[#e7e4dc] bg-white py-2.5 pl-9 pr-3 text-[13px] text-[#16233f] shadow-[inset_0_1px_2px_rgba(22,35,63,0.04)] transition-colors focus:border-[#818cf8] focus:outline-none focus:ring-2 focus:ring-[#818cf8]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#818cf8]"
        />
      </div>
    </div>
  )
}

import type { ReactNode } from "react"

/* =========================================================
   PROFIL FORM
========================================================= */

export function ProfilForm({ user }: { user: { nama: string; email: string; fotoUrl: string | null } }) {
  const { update } = useSession()
  const [nama, setNama] = useState(user.nama)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState("")
  const [fotoUrl, setFotoUrl] = useState(user.fotoUrl ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [sukses, setSukses] = useState(false)

  async function simpan() {
    setSaving(true)
    setError("")
    setSukses(false)

    try {
      const res = await fetch("/api/guru/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password: password || undefined, fotoUrl: fotoUrl || null }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.message ?? "Gagal menyimpan profil")
        return
      }

      await update({ name: json.data.nama, email: json.data.email, fotoUrl: json.data.fotoUrl })
      setPassword("")
      setSukses(true)
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Kartu ringkasan profil — 3D */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)] lg:col-span-1">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#16233f]/[0.04] blur-2xl dark:bg-white/[0.04]"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-indigo-500/15 blur-xl" aria-hidden="true" />
            <span className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#e7e4dc] ring-4 ring-white shadow-[0_14px_28px_-12px_rgba(49,46,129,0.35)] dark:bg-white/10 dark:ring-white/10">
              <Image
                src={fotoUrl.trim() !== "" ? fotoUrl : "/image/icon/user-icon.png"}
                alt={nama}
                fill
                sizes="96px"
                className="object-cover"
              />
            </span>
          </div>

          <div>
            <p className="text-[15.5px] font-semibold text-[#16233f] dark:text-white">{nama || "—"}</p>
            <p className="mt-0.5 text-[12px] text-[#8b93a6] dark:text-white/40">{email || "—"}</p>
          </div>

          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#818cf8] to-[#4338ca] px-3 py-1 text-[11px] font-semibold text-white shadow-[0_6px_14px_-6px_rgba(67,56,202,0.55)]">
            <IconShield className="h-3.5 w-3.5" />
            Akun Guru
          </span>
        </div>

        <div className="relative mt-5 space-y-2.5 border-t border-[#edf0ef] pt-4 text-left dark:border-white/10">
          <p className="text-[11.5px] leading-relaxed text-[#8b93a6] dark:text-white/40">
            Foto profil, nama, dan email Anda akan tampil di seluruh halaman Portal Guru, termasuk saat membuat
            ujian dan berinteraksi dengan peserta.
          </p>
        </div>
      </Card>

      {/* Kartu form — 3D */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.32)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_5px_0_#0d1424,0_18px_30px_-16px_rgba(0,0,0,0.6)] sm:p-6 lg:col-span-2">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-[#16233f]/[0.04] blur-2xl dark:bg-white/[0.04]"
          aria-hidden="true"
        />

        <div className="relative">
          <h2 className="text-[14.5px] font-semibold text-[#16233f] dark:text-white">Informasi Akun</h2>
          <p className="mt-0.5 text-[11.5px] text-[#8b93a6] dark:text-white/40">
            Perbarui data diri dan kata sandi Anda di bawah ini.
          </p>

          <div className="mt-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-[12px] bg-[#fdf1f1] px-3.5 py-2.5 text-[12.5px] text-[#d23b3b] dark:bg-red-500/10">
                <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {sukses && (
              <div className="flex items-start gap-2 rounded-[12px] bg-[#ecfdf5] px-3.5 py-2.5 text-[12.5px] text-[#047857] dark:bg-emerald-400/10 dark:text-emerald-300">
                <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Profil berhasil diperbarui.</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldInput label="Nama Lengkap" icon={<IconUser className="h-4 w-4" />} value={nama} onChange={setNama} />
              <FieldInput label="Email" icon={<IconMail className="h-4 w-4" />} type="email" value={email} onChange={setEmail} />
            </div>

            <FieldInput
              label="URL Foto Profil (opsional)"
              icon={<IconImageLink className="h-4 w-4" />}
              value={fotoUrl}
              onChange={setFotoUrl}
              placeholder="https://..."
            />

            <FieldInput
              label="Kata Sandi Baru (kosongkan jika tidak diganti)"
              icon={<IconLock className="h-4 w-4" />}
              type="password"
              value={password}
              onChange={setPassword}
            />

            <div className="flex justify-end border-t border-[#edf0ef] pt-4 dark:border-white/10">
              <Button onClick={simpan} isLoading={saving}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
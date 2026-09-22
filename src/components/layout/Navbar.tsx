"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

type AdminUser = {
  nama: string
  email: string
  /** URL/path foto profil admin. Kalau tidak diisi, dipakai foto default
   *  di /image/icon/user-icon.png (lihat komponen AvatarAdmin di bawah). */
  fotoUrl?: string | null
}

/* =========================================================
   ICONS
========================================================= */

function IconMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 6.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 17.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M20 20L16.2 16.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconBell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6 10.5C6 7 8.7 4.5 12 4.5C15.3 4.5 18 7 18 10.5V14L19.5 16.5H4.5L6 14V10.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19C10.4 19.9 11.1 20.5 12 20.5C12.9 20.5 13.6 19.9 14 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconUserCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.3 18C7.3 15.7 9.4 14.3 12 14.3C14.6 14.3 16.7 15.7 17.7 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* =========================================================
   AVATAR ADMIN
   Selalu menampilkan foto (bukan inisial huruf) — memakai fotoUrl kalau
   ada, atau jatuh ke gambar default /image/icon/user-icon.png.
========================================================= */

function AvatarAdmin({ fotoUrl, nama, className = "h-7 w-7" }: { fotoUrl?: string | null; nama: string; className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-[#e7e4dc] dark:bg-white/10 ${className}`}>
      <Image src={fotoUrl && fotoUrl.trim() !== "" ? fotoUrl : "/image/icon/user-icon.png"} alt={nama} fill sizes="40px" className="object-cover" />
    </span>
  )
}

/* =========================================================
   NAVBAR
========================================================= */

export function Navbar({
  user,
  onMenuClick,
}: {
  user: AdminUser
  onMenuClick: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    // Diarahkan ke halaman Kelola Ujian dengan query pencarian.
    // Sesuaikan target/param ini jika fitur pencarian Anda berbeda.
    router.push(`/ujian?cari=${encodeURIComponent(trimmed)}`)
  }

  const namaDepan = user.nama.trim().split(" ")[0] || "Admin"

  return (
    <header className="relative z-20 flex h-[64px] shrink-0 items-center gap-3 border-b border-[#edf0ef] bg-white px-4 dark:border-white/10 dark:bg-[#0b1120] sm:px-6 lg:px-7">
      {/* Tombol menu — hanya di mobile/tablet */}
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[#007fc4] hover:bg-[#e5f5fc] dark:text-[#00a7ff] dark:hover:bg-white/10 lg:hidden"
        aria-label="Buka menu"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden max-w-[340px] flex-1 items-center gap-2 rounded-[11px] border border-[#edf0ef] bg-[#f7f9f8] px-3.5 py-2 transition-colors focus-within:border-[#6ee7b7] focus-within:bg-white dark:border-white/10 dark:bg-white/5 dark:focus-within:border-[#00a7ff] dark:focus-within:bg-white/10 sm:flex"
      >
        <IconSearch className="h-4 w-4 shrink-0 text-[#94a3b8] dark:text-white/40" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
          placeholder="Cari ujian atau peserta..."
          aria-label="Cari ujian atau peserta"
          className="w-full bg-transparent text-[12.5px] text-[#34435f] placeholder:text-[#94a3b8] focus:outline-none dark:text-white/80 dark:placeholder:text-white/30"
        />
      </form>

      <div className="flex flex-1 items-center justify-end gap-3">
        <Link
          href="/notifikasi"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#007fc4] hover:bg-[#e5f5fc] dark:text-[#00a7ff] dark:hover:bg-white/10"
          aria-label="Notifikasi"
        >
          <IconBell className="h-5 w-5" />
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-2 rounded-full border border-[#e7e4dc] py-1 pl-1 pr-2.5 shadow-[0_2px_6px_rgba(6,78,59,0.05)] hover:bg-[#f6f4ec] dark:border-white/10 dark:hover:bg-white/10"
          >
            <AvatarAdmin fotoUrl={user.fotoUrl} nama={user.nama} className="h-7 w-7 ring-1 ring-[#e7e4dc] dark:ring-white/10" />
            <span className="hidden text-[12.5px] font-medium text-[#34435f] dark:text-white/80 sm:inline">
              {namaDepan}
            </span>
            <IconChevronDown className="h-4 w-4 text-[#8b93a6] dark:text-white/40" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] rounded-[14px] border border-[#e7e4dc] bg-white p-2 shadow-[0_16px_36px_rgba(6,78,59,0.16)] dark:border-white/10 dark:bg-[#0f1b30] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-2.5 border-b border-[#efece4] px-2.5 pb-2.5 pt-1 dark:border-white/10">
                <AvatarAdmin fotoUrl={user.fotoUrl} nama={user.nama} className="h-9 w-9" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#16233f] dark:text-white">{user.nama}</p>
                  <p className="truncate text-[11.5px] text-[#8b93a6] dark:text-white/40">{user.email}</p>
                </div>
              </div>

              <Link
                href="/profil-admin"
                onClick={() => setMenuOpen(false)}
                className="mt-1.5 flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-[13px] font-medium text-[#34435f] hover:bg-[#f6f4ec] dark:text-white/80 dark:hover:bg-white/10"
              >
                <IconUserCircle className="h-4 w-4 text-[#8b93a6] dark:text-white/40" />
                Profil Saya
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-1 flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium text-[#d23b3b] hover:bg-[#fdf1f1] dark:text-[#f87171] dark:hover:bg-red-500/10"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
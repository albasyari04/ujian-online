"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import type { ReactElement } from "react"

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 10.5L12 4L20 10.5V19C20 19.6 19.6 20 19 20H5C4.4 20 4 19.6 4 19V10.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 20V14H14.5V20" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconUjianSaya({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 3.5H14.5L18.5 7.5V20.5H7V3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14.5 3.5V7.5H18.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 12H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.5 15.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconBankSoal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 4.5H17C18.1 4.5 19 5.4 19 6.5V19.5H7C5.9 19.5 5 18.6 5 17.5V5.5C5 4.95 5.45 4.5 6 4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 19.5H18M8.5 8H15.5M8.5 11.5H15.5M8.5 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 4.5V19.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function IconHasil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4.5 20V4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.5 20H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7.5" y="13" width="3" height="7" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12.7" y="9.5" width="3" height="10.5" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="17.9" y="6" width="2.6" height="14" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconProfil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="8.3" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 20C5.4 15.6 8 13.2 12 13.2C16 13.2 18.6 15.6 19.5 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconPengaturan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 0 0 12 8.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19.2 13.5L20.5 14.5L18.5 18L16.9 17.4C16.4 17.8 15.8 18.1 15.1 18.3L14.7 20H9.3L8.9 18.3C8.2 18.1 7.6 17.8 7.1 17.4L5.5 18L3.5 14.5L4.8 13.5C4.7 13 4.7 12.5 4.7 12C4.7 11.5 4.7 11 4.8 10.5L3.5 9.5L5.5 6L7.1 6.6C7.6 6.2 8.2 5.9 8.9 5.7L9.3 4H14.7L15.1 5.7C15.8 5.9 16.4 6.2 16.9 6.6L18.5 6L20.5 9.5L19.2 10.5C19.3 11 19.3 11.5 19.3 12C19.3 12.5 19.3 13 19.2 13.5Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
    </svg>
  )
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export type NavItem = {
  href: string
  label: string
  icon: (props: { className?: string }) => ReactElement
}

export const navItems: NavItem[] = [
  { href: "/beranda-guru", label: "Dashboard", icon: IconDashboard },
  { href: "/ujian-guru", label: "Ujian Saya", icon: IconUjianSaya },
  { href: "/bank-soal-guru", label: "Bank Soal", icon: IconBankSoal },
  { href: "/hasil-guru", label: "Hasil & Nilai", icon: IconHasil },
  { href: "/profil-guru", label: "Profil Saya", icon: IconProfil },
  { href: "/pengaturan-guru", label: "Pengaturan", icon: IconPengaturan },
]

type SidebarUser = {
  nama: string
  email?: string
  fotoUrl?: string | null
}

function inisialNama(nama: string) {
  const bersih = nama.trim()
  if (!bersih) return "G"
  return bersih
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("")
}

export function SidebarGuru({
  open,
  onClose,
  user,
}: {
  open: boolean
  onClose: () => void
  user?: SidebarUser
}) {
  const pathname = usePathname()
  const namaGuru = user?.nama?.trim() || "Guru"
  const fotoGuru = user?.fotoUrl

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-[218px] shrink-0 flex-col
          bg-[radial-gradient(circle_at_50%_-10%,rgba(129,140,248,0.25),transparent_35%),linear-gradient(180deg,#312e81_0%,#3730a3_56%,#1e1b4b_100%)] px-3.5 py-6 text-white
          shadow-[10px_0_32px_rgba(30,27,75,0.24)]
          transition-transform duration-200 ease-out
          lg:static lg:z-auto lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo & judul */}
        <div className="-mt-2 flex shrink-0 flex-col items-center justify-center px-1">
          <span className="relative flex h-[76px] w-[76px] items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
            <Image
              src="/image/ujian-online.png"
              alt="Ujian Online"
              width={76}
              height={76}
              className="relative h-[76px] w-[76px] object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
            />
          </span>
          <div className="mt-1.5 text-center">
            <p className="text-[14px] font-semibold leading-tight tracking-[0.01em] text-white">Ujian Online</p>
            <p className="text-[10.5px] text-white/55">Portal Guru</p>
          </div>
        </div>

        <div className="mt-5 shrink-0 border-t border-white/10" />

        {/* Navigasi */}
        <nav className="mt-5 flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain pr-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  group flex shrink-0 items-center gap-3 rounded-[13px] px-3 py-2.5 text-[13.5px] font-medium
                  transition-all duration-200 ease-out
                  ${
                    active
                      ? "bg-white text-[#312e81] shadow-[0_8px_18px_rgba(0,0,0,0.22)]"
                      : "text-white/70 hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <span
                  className={`
                    flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-colors
                    ${
                      active
                        ? "bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_6px_12px_-4px_rgba(67,56,202,0.55)]"
                        : "bg-white/10 text-white/70 group-hover:bg-white/15 group-hover:text-white"
                    }
                  `}
                >
                  <Icon className="h-[17px] w-[17px]" />
                </span>
                <span className="flex-1 truncate">{label}</span>
                {active && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#818cf8] shadow-[0_0_8px_rgba(129,140,248,0.9)]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Kartu profil guru — nama & foto dinamis */}
        <div className="mt-4 shrink-0 border-t border-white/10 pt-4">
          <Link
            href="/profil-guru"
            onClick={onClose}
            className="group flex items-center gap-2.5 rounded-[13px] border border-white/10 bg-white/[0.08] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(0,0,0,0.14)] transition-colors hover:bg-white/[0.14]"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#a5b4fc] to-[#6366f1] text-[12.5px] font-semibold text-white shadow-[0_4px_10px_rgba(99,102,241,0.35)] ring-2 ring-white/20">
              {fotoGuru && fotoGuru.trim() !== "" ? (
                <Image src={fotoGuru} alt={namaGuru} fill sizes="36px" className="object-cover" />
              ) : (
                inisialNama(namaGuru)
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-white">{namaGuru}</p>
              <p className="truncate text-[10px] text-white/55">Pengajar</p>
            </div>
            <IconChevronRight className="h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70" />
          </Link>
        </div>
      </aside>
    </>
  )
}
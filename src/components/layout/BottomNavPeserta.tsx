"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactElement } from "react"

/* =========================================================
   ICONS
   Menggunakan ikon SVG inline yang konsisten dengan SidebarPeserta.
========================================================= */

function IconBeranda({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 11.5L12 4.5L20 11.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10V19.5H18V10" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10 19.5V14.5H14V19.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function IconJadwal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10H20.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 3.5V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8.3" cy="14" r="1" fill="currentColor" />
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      <circle cx="15.7" cy="14" r="1" fill="currentColor" />
    </svg>
  )
}

function IconUjian({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 3.5H14.5L18.5 7.5V20.5H7V3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14.5 3.5V7.5H18.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 12H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.5 15.5H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

/* =========================================================
   NAV ITEMS
========================================================= */

type NavItem = {
  href: string
  label: string
  icon: (props: { className?: string }) => ReactElement
}

const navItems: NavItem[] = [
  { href: "/beranda-peserta", label: "Dashboard", icon: IconBeranda },
  { href: "/jadwal-ujian", label: "Jadwal Ujian", icon: IconJadwal },
  { href: "/ujian-tersedia", label: "Ujian", icon: IconUjian },
  { href: "/hasil", label: "Hasil", icon: IconHasil },
  { href: "/profil", label: "Profil", icon: IconProfil },
]

const FEATURED_HREF = "/ujian-tersedia"

/* =========================================================
   BOTTOM NAV PESERTA
========================================================= */

export function BottomNavPeserta() {
  const pathname = usePathname()

  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-30 flex items-end justify-around
        border-t border-[#e7e4dc] bg-[#fbfaf7]/95 px-1 pt-1.5
        pb-[calc(env(safe-area-inset-bottom,0px)+6px)]
        shadow-[0_-10px_24px_rgba(22,35,63,0.1)] backdrop-blur
        dark:border-white/10 dark:bg-[#0b1120]/95
        lg:hidden
      "
      aria-label="Navigasi bawah peserta"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        const featured = href === FEATURED_HREF

        // ===== TOMBOL UTAMA (tengah) — lebih besar & mengambang di garis nav =====
        if (featured) {
          return (
            <Link key={href} href={href} className="relative flex flex-1 flex-col items-center">
              <span
                className={`
                  absolute -top-7 flex h-[60px] w-[60px] items-center justify-center rounded-full
                  border-[3px] transition-all duration-200
                  dark:border-[#0b1120]
                  ${
                    active
                      ? "-translate-y-1 scale-105 border-white bg-gradient-to-br from-[#e8a33d] to-[#c47f1a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_10px_20px_-6px_rgba(196,127,26,0.65)]"
                      : "border-white bg-gradient-to-b from-white to-[#f3f6f8] shadow-[0_6px_16px_-6px_rgba(22,35,63,0.3)] dark:from-white/10 dark:to-white/5"
                  }
                `}
              >
                <Icon className={`h-[26px] w-[26px] ${active ? "text-white" : "text-[#8b93a6] dark:text-white/50"}`} />
              </span>

              <span
                className={`
                  mt-[36px] max-w-[64px] truncate text-[10px] leading-none transition-colors duration-200
                  ${active ? "font-semibold text-[#c47f1a] dark:text-[#e8a33d]" : "font-medium text-[#8b93a6] dark:text-white/50"}
                `}
              >
                {label}
              </span>
            </Link>
          )
        }

        // ===== ITEM BIASA =====
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-center"
          >
            <span
              className={`
                flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-200
                ${
                  active
                    ? "-translate-y-0.5 border-white/40 bg-gradient-to-br from-[#e8a33d] to-[#c47f1a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_8px_16px_-6px_rgba(196,127,26,0.65)]"
                    : "border-[#e7e4dc] bg-gradient-to-b from-white to-[#f3f6f8] text-[#8b93a6] shadow-[0_3px_8px_-4px_rgba(22,35,63,0.25)] dark:border-white/10 dark:from-white/10 dark:to-white/5"
                }
              `}
            >
              <Icon className={`h-[22px] w-[22px] ${active ? "text-white" : "text-[#8b93a6] dark:text-white/50"}`} />
            </span>

            <span
              className={`
                max-w-[64px] truncate text-[10px] leading-none transition-colors duration-200
                ${active ? "font-semibold text-[#c47f1a] dark:text-[#e8a33d]" : "font-medium text-[#8b93a6] dark:text-white/50"}
              `}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
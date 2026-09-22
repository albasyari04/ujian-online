"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactElement } from "react"

/* =========================================================
   ICONS
   Semua ikon didefinisikan lokal (SVG inline) supaya konsisten
   dengan gaya stroke yang dipakai di SidebarAdmin.tsx.
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

function IconUjianTersedia({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 3.5H14.5L18.5 7.5V20.5H7V3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14.5 3.5V7.5H18.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 12H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.5 15.5H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconBerlangsung({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9V13.2L14.8 15.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 3.5H14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconRiwayat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4.5 12C4.5 7.9 7.9 4.5 12 4.5C16.1 4.5 19.5 7.9 19.5 12C19.5 16.1 16.1 19.5 12 19.5C9.6 19.5 7.4 18.3 6.1 16.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 17V13.5H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8.5V12.3L14.6 13.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

function IconStatistik({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M3.5 16L9 10.5L13 14.5L20.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 6.5H20.5V12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 4.5V6.3M12 17.7V19.5M19.5 12H17.7M6.3 12H4.5M17.4 6.6L16.1 7.9M7.9 16.1L6.6 17.4M17.4 17.4L16.1 16.1M7.9 7.9L6.6 6.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconBantuan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.6 9.5C9.9 8 11.1 7.3 12.3 7.5C13.5 7.7 14.4 8.7 14.2 9.9C14 11 12.9 11.3 12.3 12.1C12 12.5 11.9 12.9 11.9 13.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="16.3" r="0.9" fill="currentColor" />
    </svg>
  )
}

/* =========================================================
   NAV GROUPS
   Sesuaikan href jika struktur route Anda berbeda.
========================================================= */

type NavItem = {
  href: string
  label: string
  icon: (props: { className?: string }) => ReactElement
}

type NavGroup = {
  label: string | null
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/beranda-peserta", label: "Beranda", icon: IconBeranda },
      { href: "/jadwal-ujian", label: "Jadwal Ujian", icon: IconJadwal },
      { href: "/ujian-tersedia", label: "Ujian Tersedia", icon: IconUjianTersedia },
      { href: "/ujian-berlangsung", label: "Ujian Sedang Berlangsung", icon: IconBerlangsung },
    ],
  },
  {
    label: "Hasil",
    items: [
      { href: "/riwayat", label: "Riwayat Ujian", icon: IconRiwayat },
      { href: "/hasil", label: "Hasil & Nilai", icon: IconHasil },
      { href: "/statistik", label: "Statistik Belajar", icon: IconStatistik },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { href: "/profil", label: "Profil Saya", icon: IconProfil },
      { href: "/pengaturan-peserta", label: "Pengaturan", icon: IconPengaturan },
      { href: "/bantuan", label: "Bantuan", icon: IconBantuan },
    ],
  },
]

/* =========================================================
   SIDEBAR PESERTA
========================================================= */

export function SidebarPeserta({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay — hanya tampil saat drawer terbuka di mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-[220px] shrink-0 flex-col
          bg-gradient-to-b from-[#16233f] to-[#1f2f52] py-6 text-white
          shadow-[10px_0_32px_rgba(22,35,63,0.18)]
          transition-transform duration-200 ease-out
          lg:static lg:z-auto lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col items-center gap-2 px-5 text-center">
          {/* Logo baru — gambar 3D sudah punya warna & bentuknya sendiri,
              jadi ditampilkan polos tanpa kotak/latar solid, hanya diberi drop-shadow. */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center">
            <Image
              src="/image/ujian-online.png"
              alt="Ujian Online"
              width={72}
              height={72}
              className="h-full w-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-tight">Ujian Online</p>
            <p className="truncate text-[11px] leading-tight text-white/60">SMA Al Istiqomah</p>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10" aria-hidden="true" />

        <nav className="sidebar-scroll mt-5 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3.5 pb-2">
          {navGroups.map((group, groupIndex) => (
            <div key={group.label ?? `grup-${groupIndex}`} className="flex flex-col gap-1">
              {group.label && (
                <p className="px-3.5 pb-1 text-[11px] font-medium tracking-wide text-white/40">
                  {group.label}
                </p>
              )}

              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`)

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-[13px] font-medium leading-snug transition-colors
                      ${active ? "bg-white text-[#16233f] shadow-[0_8px_18px_rgba(0,0,0,0.18)]" : "text-white/80 hover:bg-white/10 hover:text-white"}
                    `}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1">{label}</span>
                    {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8a33d]" aria-hidden="true" />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3.5 pt-4">
          <div className="flex items-center gap-2 rounded-[12px] bg-white/10 px-2.5 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8a33d] text-[12px] font-semibold text-[#16233f]">
              P
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-semibold">Peserta</p>
              <p className="truncate text-[10px] text-white/60">Portal Ujian</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
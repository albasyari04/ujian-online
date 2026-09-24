"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import type { ReactElement } from "react"

/* =========================================================
   ICONS
========================================================= */

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 10.5L12 4L20 10.5V19C20 19.6 19.6 20 19 20H5C4.4 20 4 19.6 4 19V10.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 20V14H14.5V20" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconUjian({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 3.5H14.5L18.5 7.5V20.5H7V3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14.5 3.5V7.5H18.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 12H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.5 15.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconPeserta({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 20C4.3 15.9 6.3 13.8 9 13.8C11.7 13.8 13.7 15.9 14.5 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.3 13.5C17.7 13.6 19.2 15 19.9 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* Ikon baru untuk menu "Kelola Guru" — kepala + toga sederhana (silinder + garis buku). */
function IconGuru({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.5 20C6.4 15.7 8.9 13.5 12 13.5C15.1 13.5 17.6 15.7 18.5 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 8H15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 4.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

function IconNotifikasi({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 16.5H18L16.5 14V10C16.5 7.5 14.7 5.5 12 5.5C9.3 5.5 7.5 7.5 7.5 10V14L6 16.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 19C10.5 19.8 11.2 20.2 12 20.2C12.8 20.2 13.5 19.8 14 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconPengawasan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 20H15M12 16.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 10.5C8.5 8.5 10.2 7.5 12 7.5C13.8 7.5 15.5 8.5 17 10.5C15.5 12.5 13.8 13.5 12 13.5C10.2 13.5 8.5 12.5 7 10.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="12" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
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

function IconLaporan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 4.5H15L18.5 8V19.5H6V4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 4.5V8H18.5M8.5 15.5L10.5 13.5L12.2 15L15.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 17.5H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconNilai({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="9.5" r="5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 9.7L11.1 11.3L14.5 7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13.8L7.5 20L12 17.7L16.5 20L15 13.8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

/* Ikon baru untuk menu "Kartu Ujian" — bentuk kartu dengan foto & garis-garis data. */
function IconKartuUjian({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="11" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 10H18M13 13H17M5 16H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/* =========================================================
   NAV ITEMS
========================================================= */

export type NavItem = {
  href: string
  label: string
  icon: (props: { className?: string }) => ReactElement
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/ujian", label: "Kelola Ujian", icon: IconUjian },
  { href: "/peserta", label: "Kelola Peserta", icon: IconPeserta },
  { href: "/guru", label: "Kelola Guru", icon: IconGuru },
  { href: "/soal", label: "Bank Soal", icon: IconBankSoal },
  { href: "/pengawasan", label: "Pengawasan", icon: IconPengawasan },
  { href: "/nilai", label: "Nilai", icon: IconNilai },
  { href: "/kartu-ujian", label: "Kartu Ujian", icon: IconKartuUjian },
  { href: "/laporan", label: "Laporan", icon: IconLaporan },
  { href: "/pengaturan", label: "Pengaturan", icon: IconPengaturan },
  { href: "/notifikasi", label: "Notifikasi", icon: IconNotifikasi },
]

/* =========================================================
   SIDEBAR ADMIN
========================================================= */

export function SidebarAdmin({
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
          fixed inset-y-0 left-0 z-40 flex w-[200px] shrink-0 flex-col
          bg-[radial-gradient(circle_at_50%_-10%,rgba(0,167,255,0.22),transparent_35%),linear-gradient(180deg,#003868_0%,#002b50_56%,#001f3a_100%)] px-3.5 py-6 text-white
          shadow-[10px_0_32px_rgba(0,32,63,0.24)]
          transition-transform duration-200 ease-out
          lg:static lg:z-auto lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ===== BAGIAN ATAS: LOGO (STICKY / TIDAK IKUT SCROLL) ===== */}
        <div className="-mt-2 flex shrink-0 flex-col items-center justify-center px-1">
          <Image
            src="/image/ujian-online.png"
            alt="Ujian Online"
            width={88}
            height={88}
            className="h-[88px] w-[88px] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.3)]"
          />
          <div className="mt-1 text-center">
            <p className="text-[14px] font-semibold leading-tight tracking-[0.01em] text-white">Ujian Online</p>
          </div>
        </div>

        <div className="mt-5 shrink-0 border-t border-white/10" />

        {/* ===== BAGIAN TENGAH: MENU (AREA YANG BISA DI-SCROLL) =====
            - Pembungkus menggunakan `-mr-3.5` untuk mengkompensasi `px-3.5` dari <aside>,
              sehingga area scroll bisa memanjang sampai tepi kanan sidebar.
            - <nav> di dalamnya memiliki `pr-3` sebagai pengganti padding kanan, agar item
              menu tidak menempel ke scrollbar, tapi scrollbar sendiri bisa menempel ke tepi.
        */}
        <div className="-mr-3.5 mt-5 flex flex-1 flex-col overflow-hidden">
          <nav
            className="
              custom-scrollbar flex flex-1 flex-col gap-1 pr-3
              overflow-y-auto overscroll-contain
              [-webkit-overflow-scrolling:touch]
            "
          >
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`)

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`
                    flex shrink-0 items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-[13.5px] font-medium transition-colors
                    ${active ? "bg-white text-[#003868] shadow-[0_8px_18px_rgba(0,0,0,0.2)]" : "text-white/75 hover:bg-white/10 hover:text-white"}
                  `}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1">{label}</span>
                  {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00a7ff] shadow-[0_0_8px_rgba(0,167,255,0.8)]" aria-hidden="true" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ===== BAGIAN BAWAH: PROFIL (STICKY / TIDAK IKUT SCROLL) ===== */}
        <div className="mt-4 shrink-0 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.08] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(0,0,0,0.12)]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00b8ff] to-[#0074c8] text-[12px] font-semibold text-white shadow-[0_4px_10px_rgba(0,167,255,0.3)]">A</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-semibold">Administrator</p>
              <p className="truncate text-[10px] text-white/60">Super Admin</p>
            </div>
            <span className="text-[12px] text-white/70">⌄</span>
          </div>
        </div>
      </aside>
    </>
  )
}
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { navItems } from "./SidebarAdmin"

/* =========================================================
   BOTTOM NAV MOBILE
   Hanya tampil di layar < lg (ditutup lagi oleh sidebar & navbar
   di layar lg ke atas). Menu yang ditampilkan sengaja dibatasi 5
   item paling sering dipakai — menu lain tetap bisa diakses lewat
   sidebar (buka via tombol hamburger di Navbar).

   Item tengah ("Kelola Peserta") dibuat jadi tombol utama (FAB
   style): lebih besar dan "mengambang" tepat di garis batas atas
   bottom nav, supaya jadi fokus visual utama menu ini.
========================================================= */

const BOTTOM_NAV_HREFS = ["/dashboard", "/ujian", "/peserta", "/kartu-ujian", "/pengaturan"]
const FEATURED_HREF = "/peserta"

export function BottomNavMobile() {
  const pathname = usePathname()

  // Ambil item dari navItems sesuai urutan BOTTOM_NAV_HREFS, supaya ikon &
  // label selalu sinkron dengan yang ada di SidebarAdmin (single source of truth).
  const items = BOTTOM_NAV_HREFS.map((href) => navItems.find((item) => item.href === href)).filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  )

  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-30 flex items-end justify-around
        border-t border-[#e7e4dc] bg-white/95 px-1 pt-1.5
        pb-[calc(env(safe-area-inset-bottom,0px)+6px)]
        shadow-[0_-10px_24px_rgba(0,32,63,0.1)] backdrop-blur
        dark:border-white/10 dark:bg-[#0b1120]/95
        lg:hidden
      "
      aria-label="Navigasi bawah"
    >
      {items.map(({ href, label, icon: Icon }) => {
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
                      ? "-translate-y-1 scale-105 border-white bg-gradient-to-br from-[#00a7ff] to-[#005f96] shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_10px_20px_-6px_rgba(0,95,150,0.65)]"
                      : "border-white bg-gradient-to-b from-white to-[#f3f6f8] shadow-[0_6px_16px_-6px_rgba(0,56,104,0.3)] dark:from-white/10 dark:to-white/5"
                  }
                `}
              >
                <Icon className={`h-[26px] w-[26px] ${active ? "text-white" : "text-[#8b93a6] dark:text-white/50"}`} />
              </span>

              <span
                className={`
                  mt-[36px] max-w-[64px] truncate text-[10px] leading-none transition-colors duration-200
                  ${active ? "font-semibold text-[#007fc4] dark:text-[#00a7ff]" : "font-medium text-[#8b93a6] dark:text-white/50"}
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
                    ? "-translate-y-0.5 border-white/40 bg-gradient-to-br from-[#00a7ff] to-[#007fc4] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_8px_16px_-6px_rgba(0,127,196,0.65)]"
                    : "border-[#e7e4dc] bg-gradient-to-b from-white to-[#f3f6f8] text-[#8b93a6] shadow-[0_3px_8px_-4px_rgba(0,56,104,0.25)] dark:border-white/10 dark:from-white/10 dark:to-white/5"
                }
              `}
            >
              <Icon className={`h-[22px] w-[22px] ${active ? "text-white" : "text-[#8b93a6] dark:text-white/50"}`} />
            </span>

            <span
              className={`
                max-w-[64px] truncate text-[10px] leading-none transition-colors duration-200
                ${active ? "font-semibold text-[#007fc4] dark:text-[#00a7ff]" : "font-medium text-[#8b93a6] dark:text-white/50"}
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
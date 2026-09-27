"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { BottomNavPeserta } from "./BottomNavPeserta"
import { Footer } from "./Footer"
import { NavbarPeserta } from "./NavbarPeserta"
import { SidebarPeserta } from "./SidebarPeserta"

type PesertaUser = {
  nama: string
  email: string
}

/**
 * Cek apakah path saat ini adalah halaman "mengerjakan ujian".
 * Match: /ujian/cmxxxx atau /ujian/cmxxxx/
 * TIDAK match: /ujian-tersedia, /ujian-berlangsung, /ujian-guru
 */
function isHalamanMengerjakanUjian(pathname: string): boolean {
  return /^\/ujian\/[^/]+\/?$/.test(pathname)
}

export function PesertaShell({
  children,
  user,
  jumlahNotifikasiBelumDibaca = 0,
}: {
  children: ReactNode
  user: PesertaUser
  jumlahNotifikasiBelumDibaca?: number
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Halaman mengerjakan ujian: full-screen, tanpa sidebar, navbar, footer, dan bottom nav
  if (isHalamanMengerjakanUjian(pathname)) {
    return <>{children}</>
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#fbfaf7] dark:bg-[#0b1120]">
      <SidebarPeserta open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <NavbarPeserta
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          jumlahNotifikasiBelumDibaca={jumlahNotifikasiBelumDibaca}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
          {children}
        </main>

        <Footer label="Portal Peserta" />
        <BottomNavPeserta />
      </div>
    </div>
  )
}
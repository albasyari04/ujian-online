"use client"

import { useState } from "react"
import type { ReactNode } from "react"

import { BottomNavMobile } from "./BottomNavMobile"
import { Footer } from "./Footer"
import { Navbar } from "./Navbar"
import { SidebarAdmin } from "./SidebarAdmin"

type AdminUser = {
  nama: string
  email: string
  fotoUrl?: string | null
}

export function AdminShell({
  children,
  user,
}: {
  children: ReactNode
  user: AdminUser
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    // PENTING: "fixed inset-0" (bukan h-screen) supaya shell ini selalu
    // presis mengunci ke visual viewport browser mobile, kapan pun, tanpa
    // bergantung pada unit "100vh" yang tidak stabil saat address bar
    // Chrome/browser mobile muncul/hilang. Sebelumnya dengan h-screen,
    // seluruh halaman (termasuk Navbar) ikut ter-scroll — itu sebabnya
    // Navbar terasa "hilang" saat scroll/pindah halaman, dan scroll ke
    // konten paling bawah terasa mentok sebelum benar-benar sampai.
    <div className="fixed inset-0 flex w-full overflow-hidden bg-[#f8faf9] dark:bg-[#0b1120]">
      <SidebarAdmin open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main
          className="
            min-h-0 flex-1 overflow-y-auto overscroll-contain
            px-4 pt-5 sm:px-6 lg:px-7
            pb-[calc(7rem+env(safe-area-inset-bottom,0px))] lg:pb-5
          "
        >
          {children}
        </main>

        <Footer />
        <BottomNavMobile />
      </div>
    </div>
  )
}
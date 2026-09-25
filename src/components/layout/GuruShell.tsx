"use client"

import { useState } from "react"
import type { ReactNode } from "react"

import { BottomNavGuru } from "./BottomNavGuru"
import { Footer } from "./Footer"
import { NavbarGuru } from "./NavbarGuru"
import { SidebarGuru } from "./SidebarGuru"

type GuruUser = {
  nama: string
  email: string
  fotoUrl?: string | null
}

export function GuruShell({
  children,
  user,
}: {
  children: ReactNode
  user: GuruUser
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    // PENTING: "fixed inset-0" (bukan h-screen / h-dvh) supaya shell ini
    // selalu presis mengunci ke visual viewport browser mobile, kapan pun,
    // tanpa bergantung pada dukungan unit "dvh" di versi Tailwind manapun.
    // Ini menghindari selisih ukuran akibat address bar Chrome yang
    // muncul/hilang, yang sebelumnya bikin scroll terasa "mentok" sebelum
    // konten paling bawah benar-benar lepas dari BottomNavGuru.
    <div className="fixed inset-0 flex w-full overflow-hidden bg-[#f8faf9] dark:bg-[#0b1120]">
      <SidebarGuru open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <NavbarGuru user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main
          className="
            min-h-0 flex-1 overflow-y-auto overscroll-contain
            px-4 pt-5 sm:px-6 lg:px-7
            pb-[calc(7rem+env(safe-area-inset-bottom,0px))] lg:pb-5
          "
        >
          {children}
        </main>

        <Footer label="Portal Guru" />
        <BottomNavGuru />
      </div>
    </div>
  )
}
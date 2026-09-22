"use client"

import { useState } from "react"
import type { ReactNode } from "react"

import { BottomNavPeserta } from "./BottomNavPeserta"
import { Footer } from "./Footer"
import { NavbarPeserta } from "./NavbarPeserta"
import { SidebarPeserta } from "./SidebarPeserta"

type PesertaUser = {
  nama: string
  email: string
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#fbfaf7] dark:bg-[#0b1120]">
      <SidebarPeserta open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <NavbarPeserta
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          jumlahNotifikasiBelumDibaca={jumlahNotifikasiBelumDibaca}
        />

        {/* 
          Ditambahkan pb-28 (padding bottom) untuk memberikan ruang 
          agar konten tidak tertutup oleh BottomNavPeserta di layar mobile.
        */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-28 pt-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
          {children}
        </main>

        <Footer label="Portal Peserta" />
        <BottomNavPeserta />
      </div>
    </div>
  )
}
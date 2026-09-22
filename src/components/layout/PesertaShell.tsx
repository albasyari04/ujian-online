"use client"

import { useState } from "react"
import type { ReactNode } from "react"

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

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>

        <Footer label="Portal Peserta" />
      </div>
    </div>
  )
}
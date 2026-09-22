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
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#fbfaf7] dark:bg-[#0b1120]">
      <SidebarPeserta open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <NavbarPeserta
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          jumlahNotifikasiBelumDibaca={jumlahNotifikasiBelumDibaca}
        />

        {/* 
          pb dibuat dinamis: 8rem dasar + env(safe-area-inset-bottom) supaya 
          konten paling bawah tidak ketutup BottomNavPeserta di layar mobile, 
          termasuk tombol "Ujian" yang mengambang naik di atas garis nav dan 
          HP dengan home-indicator (notch bawah).
        */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
          {children}
        </main>

        <Footer label="Portal Peserta" />
        <BottomNavPeserta />
      </div>
    </div>
  )
}
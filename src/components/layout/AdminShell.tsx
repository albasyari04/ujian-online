"use client"

import { useState } from "react"
import type { ReactNode } from "react"

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
    <div className="flex h-screen w-full overflow-hidden bg-[#f8faf9] dark:bg-[#0b1120]">
      <SidebarAdmin open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 lg:px-7">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  )
}
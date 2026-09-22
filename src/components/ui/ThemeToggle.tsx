"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "@/components/providers/ThemeProvider"

/* =========================================================
   ICONS
========================================================= */

function IconMatahari({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 3V5M12 19V21M4.2 4.2L5.6 5.6M18.4 18.4L19.8 19.8M3 12H5M19 12H21M4.2 19.8L5.6 18.4M18.4 5.6L19.8 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconBulan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M20 14.5C18.9 15 17.7 15.3 16.4 15.3C11.7 15.3 7.9 11.5 7.9 6.8C7.9 5.5 8.2 4.3 8.7 3.2C5.4 4.5 3 7.8 3 11.6C3 16.6 7 20.6 12 20.6C15.8 20.6 19.1 18.2 20.4 14.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconLayar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 20H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 16.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const opsiTema = [
  { value: "light", label: "Terang", icon: IconMatahari },
  { value: "dark", label: "Gelap", icon: IconBulan },
  { value: "system", label: "Sistem", icon: IconLayar },
] as const

/* =========================================================
   THEME TOGGLE
========================================================= */

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // next-themes butuh render setelah mount di client supaya nilai `theme`
  // akurat (server tidak tahu preferensi/localStorage user). Sebelum mount,
  // tidak ada opsi yang ditandai aktif agar markup server & client sama
  // persis — mencegah warning hydration mismatch.
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  return (
    <div
      role="radiogroup"
      aria-label="Pilih tema tampilan"
      className="inline-flex rounded-[12px] border border-[#e7e4dc] bg-[#f7f9f8] p-1 dark:border-white/10 dark:bg-white/5"
    >
      {opsiTema.map(({ value, label, icon: Icon }) => {
        const aktif = mounted && theme === value

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={aktif}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-1.5 rounded-[9px] px-3 py-2 text-[12.5px] font-medium transition-colors ${
              aktif
                ? "bg-white text-[#16233f] shadow-[0_2px_6px_rgba(6,78,59,0.08)] dark:bg-[#16233f] dark:text-white"
                : "text-[#5b6a86] hover:text-[#16233f] dark:text-white/50 dark:hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
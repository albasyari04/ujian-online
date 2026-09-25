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
  {
    value: "light",
    label: "Terang",
    icon: IconMatahari,
    gradient: "from-[#fcd34d] to-[#f59e0b]",
    shadow: "shadow-[0_8px_16px_-6px_rgba(245,158,11,0.5)]",
  },
  {
    value: "dark",
    label: "Gelap",
    icon: IconBulan,
    gradient: "from-[#818cf8] to-[#4338ca]",
    shadow: "shadow-[0_8px_16px_-6px_rgba(67,56,202,0.55)]",
  },
  {
    value: "system",
    label: "Sistem",
    icon: IconLayar,
    gradient: "from-[#93c5fd] to-[#2563eb]",
    shadow: "shadow-[0_8px_16px_-6px_rgba(37,99,235,0.5)]",
  },
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
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
    >
      {opsiTema.map(({ value, label, icon: Icon, gradient, shadow }) => {
        const aktif = mounted && theme === value

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={aktif}
            onClick={() => setTheme(value)}
            className={`
              group relative flex items-center gap-3 overflow-hidden rounded-[14px] border px-3.5 py-3 text-left
              transition-all duration-200 ease-out
              ${
                aktif
                  ? "border-transparent bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_3px_0_#eef0f4,0_12px_20px_-12px_rgba(22,35,63,0.3)] dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_3px_0_#0d1424,0_14px_22px_-12px_rgba(0,0,0,0.6)]"
                  : "border-[#e7e4dc] bg-white hover:-translate-y-0.5 hover:border-[#d8d4c8] hover:shadow-[0_8px_16px_-10px_rgba(22,35,63,0.18)] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
              }
            `}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ring-1 ring-inset ring-black/5 transition-transform duration-200 dark:ring-white/10 ${
                aktif
                  ? `bg-gradient-to-br ${gradient} text-white ${shadow} group-hover:scale-105`
                  : "bg-[#f4f5f7] text-[#8b93a6] dark:bg-white/5 dark:text-white/40"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>

            <span className="min-w-0">
              <span
                className={`block text-[13px] font-semibold leading-tight ${
                  aktif ? "text-[#16233f] dark:text-white" : "text-[#5b6a86] dark:text-white/60"
                }`}
              >
                {label}
              </span>
              <span
                className={`mt-0.5 block text-[10.5px] leading-tight ${
                  aktif ? "text-[#8b93a6] dark:text-white/40" : "text-[#a3abbc] dark:text-white/25"
                }`}
              >
                {aktif ? "Aktif" : "Pilih"}
              </span>
            </span>

            {aktif && (
              <span
                className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#6ee7b7] to-[#047857]"
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
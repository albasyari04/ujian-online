import type { ReactNode } from "react"

type BadgeTone = "emerald" | "amber" | "red" | "slate" | "blue"

const toneClasses: Record<BadgeTone, string> = {
  emerald:
    "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0] dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/30",
  amber:
    "bg-[#fff8ec] text-[#b8863b] border-[#f0ddb0] dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/30",
  red:
    "bg-[#fdf1f1] text-[#d23b3b] border-[#f5cccc] dark:bg-red-400/10 dark:text-red-300 dark:border-red-400/30",
  slate:
    "bg-[#f4f5f7] text-[#5b657d] border-[#e2e5eb] dark:bg-white/10 dark:text-white/60 dark:border-white/20",
  blue:
    "bg-[#eef4ff] text-[#3457c9] border-[#c9d9fb] dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/30",
}

export function Badge({
  children,
  tone = "slate",
  className = "",
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
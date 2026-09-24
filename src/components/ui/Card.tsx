import type { HTMLAttributes, ReactNode } from "react"

export function Card({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[18px] border border-[#e7e4dc] bg-white shadow-[0_1px_2px_rgba(22,35,63,0.04),0_10px_24px_-12px_rgba(49,46,129,0.18)] dark:border-white/10 dark:bg-[#101a30] dark:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.55)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

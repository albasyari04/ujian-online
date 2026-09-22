import Link from "next/link"
import Image from "next/image"
import type { HTMLAttributes, ReactNode } from "react"

import { IconChevronRight } from "@/components/ui/Icons"

export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-[#e7e4dc] bg-white shadow-[0_2px_6px_rgba(6,78,59,0.05)] dark:border-white/10 dark:bg-[#141c30] dark:shadow-[0_2px_10px_rgba(0,0,0,0.35)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export type StatTone = "emerald" | "amber" | "blue" | "slate" | "violet" | "red" | "navy"

export const toneGradients: Record<StatTone, string> = {
  emerald: "from-[#007fc4] to-[#00a7ff]",
  amber: "from-[#2d6f99] to-[#4d98c2]",
  blue: "from-[#003868] to-[#1565a8]",
  slate: "from-[#5b657d] to-[#7c8598]",
  violet: "from-[#7c3aed] to-[#a78bfa]",
  red: "from-[#c53030] to-[#e0625c]",
  navy: "from-[#16233f] to-[#1f2f52]",
}

const toneGlow: Record<StatTone, string> = {
  emerald: "bg-[#00a7ff]/35",
  amber: "bg-[#4d98c2]/35",
  blue: "bg-[#1565a8]/35",
  slate: "bg-[#7c8598]/35",
  violet: "bg-[#a78bfa]/40",
  red: "bg-[#e0625c]/35",
  navy: "bg-[#1f2f52]/35",
}

export const toneIconColor: Record<StatTone, string> = {
  emerald: "text-[#059669] dark:text-[#34d399]",
  amber: "text-[#b45309] dark:text-[#f0b862]",
  blue: "text-[#1565a8] dark:text-[#7fb4e8]",
  slate: "text-[#5b657d] dark:text-[#aab2c5]",
  violet: "text-[#7c3aed] dark:text-[#c4b5fd]",
  red: "text-[#c53030] dark:text-[#f29a9a]",
  navy: "text-[#16233f] dark:text-[#cbd5f0]",
}

export const toneIconShadow: Record<StatTone, string> = {
  emerald: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_18px_-8px_rgba(0,167,255,0.45)]",
  amber: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_18px_-8px_rgba(45,111,153,0.45)]",
  blue: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_18px_-8px_rgba(0,56,104,0.5)]",
  slate: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_18px_-8px_rgba(91,101,125,0.45)]",
  violet: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_18px_-8px_rgba(124,58,237,0.45)]",
  red: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_18px_-8px_rgba(197,48,48,0.45)]",
  navy: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_18px_-8px_rgba(22,35,63,0.5)]",
}

export const toneBadgeShadow: Record<StatTone, string> = {
  emerald:
    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),inset_0_-3px_5px_rgba(17,24,39,0.05),0_4px_0_rgba(17,24,39,0.08),0_18px_26px_-10px_rgba(0,167,255,0.55)]",
  amber:
    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),inset_0_-3px_5px_rgba(17,24,39,0.05),0_4px_0_rgba(17,24,39,0.08),0_18px_26px_-10px_rgba(45,111,153,0.55)]",
  blue: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),inset_0_-3px_5px_rgba(17,24,39,0.05),0_4px_0_rgba(17,24,39,0.08),0_18px_26px_-10px_rgba(0,56,104,0.6)]",
  slate:
    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),inset_0_-3px_5px_rgba(17,24,39,0.05),0_4px_0_rgba(17,24,39,0.08),0_18px_26px_-10px_rgba(91,101,125,0.5)]",
  violet:
    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),inset_0_-3px_5px_rgba(17,24,39,0.05),0_4px_0_rgba(17,24,39,0.08),0_18px_26px_-10px_rgba(124,58,237,0.55)]",
  red: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),inset_0_-3px_5px_rgba(17,24,39,0.05),0_4px_0_rgba(17,24,39,0.08),0_18px_26px_-10px_rgba(197,48,48,0.5)]",
  navy: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),inset_0_-3px_5px_rgba(17,24,39,0.05),0_4px_0_rgba(17,24,39,0.08),0_18px_26px_-10px_rgba(22,35,63,0.6)]",
}

export const toneBadgeTint: Record<StatTone, string> = {
  emerald: "border-[#bfe8d3] bg-[#eafaf2]/90",
  amber: "border-[#f2e0b8] bg-[#fdf6e7]/90",
  blue: "border-[#c7d6f5] bg-[#eaf1ff]/90",
  slate: "border-[#dde1ea] bg-[#f4f5f8]/90",
  violet: "border-[#ddd0fb] bg-[#f4eefe]/90",
  red: "border-[#f3c8c8] bg-[#fdeeee]/90",
  navy: "border-[#c9d2e6] bg-[#eef1f8]/90",
}

export function StatCard({
  label,
  value,
  description,
  icon,
  iconImageSrc,
  tone = "emerald",
  href,
  className = "",
}: {
  label: string
  value: string | number
  description?: string
  icon?: ReactNode
  iconImageSrc?: string
  tone?: StatTone
  href?: string
  className?: string
}) {
  const isi = (
    <Card
      className={`group relative flex items-center gap-2.5 overflow-hidden border-[#e9ecf2] p-3 shadow-[0_6px_0_#eef0f4,0_16px_28px_-16px_rgba(22,35,63,0.28)] transition-all duration-300 ease-out dark:border-white/10 dark:shadow-[0_6px_0_#0f1830,0_18px_30px_-16px_rgba(0,0,0,0.55)] sm:gap-4 sm:p-5 ${
        href
          ? "hover:-translate-y-1.5 hover:shadow-[0_9px_0_#e3e7ee,0_24px_36px_-16px_rgba(22,35,63,0.34)] dark:hover:shadow-[0_9px_0_#0f1830,0_26px_40px_-16px_rgba(0,0,0,0.68)]"
          : ""
      } ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent dark:from-white/[0.06]" />

      {iconImageSrc ? (
        <span className="relative flex h-[40px] w-[40px] shrink-0 items-center justify-center sm:h-[78px] sm:w-[78px]">
          <span
            className={`absolute bottom-0 h-4 w-7 rounded-[50%] opacity-90 blur-[6px] transition-all duration-300 group-hover:-bottom-0.5 group-hover:blur-[8px] group-hover:opacity-100 sm:h-9 sm:w-14 sm:blur-[9px] sm:group-hover:-bottom-1 sm:group-hover:blur-[11px] ${toneGlow[tone]}`}
            aria-hidden="true"
          />
          <span
            className={`relative flex h-[36px] w-[36px] items-center justify-center overflow-hidden rounded-[12px] border border-white/80 bg-gradient-to-br from-white to-[#eef0f4] transition-transform duration-300 group-hover:-translate-y-1 dark:border-white/10 dark:from-white/10 dark:to-white/[0.03] sm:h-[70px] sm:w-[70px] sm:rounded-[24px] sm:group-hover:-translate-y-1.5 ${toneBadgeShadow[tone]}`}
          >
            <Image
              src={iconImageSrc}
              alt=""
              width={88}
              height={88}
              className="h-7 w-7 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)] sm:h-14 sm:w-14 sm:drop-shadow-[0_8px_10px_rgba(0,0,0,0.22)]"
            />
          </span>
        </span>
      ) : (
        <span
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-white to-[#eef1f6] transition-transform duration-300 group-hover:-translate-y-0.5 [&>svg]:h-4 [&>svg]:w-4 shadow-[4px_4px_10px_rgba(163,177,198,0.4),-4px_-4px_10px_rgba(255,255,255,0.85),inset_0_1px_0_rgba(255,255,255,0.6)] dark:from-white/[0.06] dark:to-white/[0.01] dark:shadow-[4px_4px_12px_rgba(0,0,0,0.5),-3px_-3px_8px_rgba(255,255,255,0.04)] sm:h-16 sm:w-16 sm:rounded-2xl sm:[&>svg]:h-7 sm:[&>svg]:w-7 sm:shadow-[6px_6px_14px_rgba(163,177,198,0.45),-6px_-6px_14px_rgba(255,255,255,0.85),inset_0_1px_0_rgba(255,255,255,0.6)] sm:dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.04)] ${toneIconColor[tone]}`}
        >
          {icon}
        </span>
      )}

      <div className="relative min-w-0 flex-1">
        <p className="truncate text-[10px] font-medium leading-tight text-[#8b93a6] dark:text-white/50 sm:text-[12px]">{label}</p>
        <p className="mt-0.5 truncate text-[15px] font-semibold leading-tight text-[#16233f] dark:text-white sm:text-[20px]">{value}</p>
        {description && (
          <p className="mt-0.5 hidden truncate text-[11px] text-[#8b93a6] dark:text-white/40 sm:block">{description}</p>
        )}
      </div>

      {href && (
        <IconChevronRight className="relative h-3.5 w-3.5 shrink-0 text-[#c3c9d6] transition-transform duration-300 group-hover:translate-x-0.5 dark:text-white/25 sm:h-4 sm:w-4" />
      )}
    </Card>
  )

  if (!href) return isi

  return (
    <Link href={href} className="block">
      {isi}
    </Link>
  )
}

export function RingkasanCard({
  label,
  value,
  icon,
  iconImageSrc,
  tone = "emerald",
}: {
  label: string
  value: string | number
  icon: ReactNode
  iconImageSrc?: string
  tone?: StatTone
}) {
  return (
    <Card className="group relative flex min-h-[92px] flex-col items-center overflow-hidden border-[#dfe3ea] p-2 text-center shadow-[0_5px_0_#e5e8ed,0_12px_22px_-12px_rgba(22,35,63,0.38)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_0_#d9dee7,0_18px_28px_-12px_rgba(22,35,63,0.48)] sm:min-h-[146px] sm:items-start sm:p-4 sm:text-left sm:shadow-[0_8px_0_#e5e8ed,0_16px_28px_-14px_rgba(22,35,63,0.38)] sm:hover:shadow-[0_9px_0_#d9dee7,0_22px_34px_-14px_rgba(22,35,63,0.48)] dark:border-white/10 dark:shadow-[0_5px_0_#10182b,0_14px_24px_-12px_rgba(0,0,0,0.55)] dark:hover:shadow-[0_6px_0_#10182b,0_20px_32px_-12px_rgba(0,0,0,0.7)] sm:dark:shadow-[0_8px_0_#10182b,0_18px_32px_-14px_rgba(0,0,0,0.55)] sm:dark:hover:shadow-[0_9px_0_#10182b,0_24px_38px_-14px_rgba(0,0,0,0.7)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.07]" />
      <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-12 sm:w-12 sm:rounded-2xl ${iconImageSrc ? "from-white to-[#edf1f7] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_8px_14px_-8px_rgba(22,35,63,0.35)] dark:from-white/10 dark:to-white/[0.03]" : `${toneGradients[tone]} ${toneIconShadow[tone]}`}`}>
        {iconImageSrc ? (
          <Image src={iconImageSrc} alt="" width={48} height={48} className="h-6 w-6 object-contain drop-shadow-[0_4px_5px_rgba(22,35,63,0.28)] sm:h-10 sm:w-10" />
        ) : (
          <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
        )}
      </span>
      <div className="relative min-w-0 flex-1 sm:block">
        <p className="mt-2 text-[18px] font-semibold leading-none text-[#16233f] dark:text-white sm:mt-4 sm:text-[25px]">{value}</p>
        <p className="mt-1 truncate text-[8px] font-medium text-[#8b93a6] dark:text-white/50 sm:mt-2 sm:text-[12px]">{label}</p>
        <span className={`mx-auto mt-2 block h-[3px] w-7 rounded-full bg-gradient-to-r ${toneGradients[tone]} sm:mx-0 sm:mt-3 sm:w-10`} aria-hidden="true" />
      </div>
    </Card>
  )
}

export function FiturBadge({
  iconImageSrc,
  title,
  subtitle,
  tone = "blue",
}: {
  iconImageSrc: string
  title: string
  subtitle: string
  tone?: StatTone
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 rounded-2xl border px-2.5 py-2 shadow-[0_4px_10px_-6px_rgba(22,35,63,0.25)] backdrop-blur-sm sm:flex-1 sm:gap-2.5 sm:px-3 sm:py-2.5 ${toneBadgeTint[tone]}`}
    >
      <Image
        src={iconImageSrc}
        alt=""
        width={40}
        height={40}
        className="h-7 w-7 shrink-0 object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.15)] sm:h-9 sm:w-9"
      />
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold leading-tight text-[#16233f] sm:text-[12.5px]">{title}</p>
        <p className="truncate text-[9.5px] leading-tight text-[#5b6a86] sm:text-[11px]">{subtitle}</p>
      </div>
    </div>
  )
}
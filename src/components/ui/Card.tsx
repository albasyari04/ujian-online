import type { HTMLAttributes, ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

/* =========================================================
   CARD DASAR
========================================================= */

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

/* =========================================================
   STAT CARD
   Mendukung dua gaya pemakaian yang ditemukan di codebase:
   - Admin: <StatCard icon={<span>Q</span>} label="..." value={..} tone="emerald" />
   - Peserta: <StatCard iconImageSrc="/image/icon/x.png" label="..." value={..} description="..." tone="blue" href="/x" />
========================================================= */

type StatTone = "indigo" | "blue" | "violet" | "emerald" | "amber" | "red" | "slate"

const STAT_TONE_STYLES: Record<StatTone, { icon: string; glow: string }> = {
  indigo: {
    icon: "bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_16px_-6px_rgba(67,56,202,0.55)]",
    glow: "before:bg-[radial-gradient(circle_at_15%_-10%,rgba(129,140,248,0.16),transparent_55%)]",
  },
  blue: {
    icon: "bg-gradient-to-br from-[#93c5fd] to-[#2563eb] text-white shadow-[0_8px_16px_-6px_rgba(37,99,235,0.5)]",
    glow: "before:bg-[radial-gradient(circle_at_15%_-10%,rgba(147,197,253,0.16),transparent_55%)]",
  },
  violet: {
    icon: "bg-gradient-to-br from-[#c4b5fd] to-[#6d28d9] text-white shadow-[0_8px_16px_-6px_rgba(109,40,217,0.5)]",
    glow: "before:bg-[radial-gradient(circle_at_15%_-10%,rgba(196,181,253,0.16),transparent_55%)]",
  },
  emerald: {
    icon: "bg-gradient-to-br from-[#6ee7b7] to-[#047857] text-white shadow-[0_8px_16px_-6px_rgba(4,120,87,0.5)]",
    glow: "before:bg-[radial-gradient(circle_at_15%_-10%,rgba(52,211,153,0.16),transparent_55%)]",
  },
  amber: {
    icon: "bg-gradient-to-br from-[#fcd34d] to-[#b8863b] text-white shadow-[0_8px_16px_-6px_rgba(184,134,59,0.5)]",
    glow: "before:bg-[radial-gradient(circle_at_15%_-10%,rgba(252,211,77,0.18),transparent_55%)]",
  },
  red: {
    icon: "bg-gradient-to-br from-[#fca5a5] to-[#b52f2f] text-white shadow-[0_8px_16px_-6px_rgba(181,47,47,0.5)]",
    glow: "before:bg-[radial-gradient(circle_at_15%_-10%,rgba(248,113,113,0.16),transparent_55%)]",
  },
  slate: {
    icon: "bg-gradient-to-br from-[#cbd5e1] to-[#475569] text-white shadow-[0_8px_16px_-6px_rgba(71,85,105,0.4)]",
    glow: "before:bg-[radial-gradient(circle_at_15%_-10%,rgba(148,163,184,0.14),transparent_55%)]",
  },
}

export function StatCard({
  icon,
  iconImageSrc,
  label,
  value,
  description,
  hint,
  tone = "indigo",
  href,
}: {
  /** Icon berupa elemen React siap-pakai, mis. <IconUsers className="h-5 w-5" /> atau <span>Q</span> */
  icon?: ReactNode
  /** Alternatif: path gambar icon (dipakai di halaman peserta) */
  iconImageSrc?: string | null
  label: string
  value: string | number
  /** Teks kecil di bawah value. `hint` adalah alias dari `description`. */
  description?: string
  hint?: string
  tone?: StatTone
  href?: string
}) {
  const t = STAT_TONE_STYLES[tone]
  const caption = description ?? hint

  const body = (
    <div
      className={`relative overflow-hidden rounded-[18px] border border-[#e7e4dc] bg-white p-4 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_14px_28px_-14px_rgba(49,46,129,0.25)] before:absolute before:inset-0 before:content-[''] dark:border-white/10 dark:bg-[#101a30] dark:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.6)] ${t.glow}`}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#8b93a6] dark:text-white/50">{label}</p>
          <p className="mt-1.5 truncate text-[26px] font-semibold leading-none text-[#16233f] dark:text-white">
            {value}
          </p>
          {caption && <p className="mt-2 text-[11.5px] text-[#8b93a6] dark:text-white/40">{caption}</p>}
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ring-1 ring-inset ring-black/5 dark:ring-white/10 ${t.icon}`}
        >
          {icon ? (
            icon
          ) : iconImageSrc ? (
            <Image src={iconImageSrc} alt="" width={28} height={28} className="h-6 w-6 object-contain" />
          ) : null}
        </span>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block transition-transform duration-200 hover:-translate-y-0.5">
        {body}
      </Link>
    )
  }

  return body
}

/* =========================================================
   RINGKASAN CARD
========================================================= */

type RingkasanTone = "navy" | "blue" | "violet" | "emerald" | "amber" | "red" | "slate" | "indigo"

const RINGKASAN_TONE_STYLES: Record<RingkasanTone, string> = {
  navy: "bg-gradient-to-br from-[#334876] to-[#16233f] text-white shadow-[0_8px_16px_-6px_rgba(22,35,63,0.5)]",
  blue: "bg-gradient-to-br from-[#93c5fd] to-[#2563eb] text-white shadow-[0_8px_16px_-6px_rgba(37,99,235,0.5)]",
  violet: "bg-gradient-to-br from-[#c4b5fd] to-[#6d28d9] text-white shadow-[0_8px_16px_-6px_rgba(109,40,217,0.5)]",
  emerald: "bg-gradient-to-br from-[#6ee7b7] to-[#047857] text-white shadow-[0_8px_16px_-6px_rgba(4,120,87,0.5)]",
  amber: "bg-gradient-to-br from-[#fcd34d] to-[#b8863b] text-white shadow-[0_8px_16px_-6px_rgba(184,134,59,0.5)]",
  red: "bg-gradient-to-br from-[#fca5a5] to-[#b52f2f] text-white shadow-[0_8px_16px_-6px_rgba(181,47,47,0.5)]",
  slate: "bg-gradient-to-br from-[#cbd5e1] to-[#475569] text-white shadow-[0_8px_16px_-6px_rgba(71,85,105,0.4)]",
  indigo: "bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_16px_-6px_rgba(67,56,202,0.5)]",
}

export function RingkasanCard({
  label,
  value,
  tone = "navy",
  iconImageSrc,
  icon,
}: {
  label: string
  value: string | number
  tone?: RingkasanTone
  iconImageSrc?: string | null
  icon?: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-[#e7e4dc] bg-white p-3.5 shadow-[0_1px_2px_rgba(22,35,63,0.04),0_10px_20px_-12px_rgba(49,46,129,0.18)] dark:border-white/10 dark:bg-[#101a30] sm:p-4">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${RINGKASAN_TONE_STYLES[tone]}`}
      >
        {icon ? (
          icon
        ) : iconImageSrc ? (
          <Image src={iconImageSrc} alt="" width={28} height={28} className="h-6 w-6 object-contain" />
        ) : null}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[20px] font-semibold leading-none text-[#16233f] dark:text-white sm:text-[22px]">
          {value}
        </p>
        <p className="mt-1 truncate text-[11.5px] font-medium text-[#8b93a6] dark:text-white/50">{label}</p>
      </div>
    </div>
  )
}

/* =========================================================
   FITUR BADGE
   Dipakai di hero beranda-peserta: badge kecil icon + judul + subjudul.
========================================================= */

type FiturTone = "blue" | "violet" | "emerald"

const FITUR_TONE_STYLES: Record<FiturTone, string> = {
  blue: "bg-[#eef4ff]/90 text-[#2a5cd6] dark:bg-white/10 dark:text-[#8fb1ff]",
  violet: "bg-[#f3eefe]/90 text-[#6d28d9] dark:bg-white/10 dark:text-[#c4b5fd]",
  emerald: "bg-[#eafaf3]/90 text-[#047857] dark:bg-white/10 dark:text-[#6ee7b7]",
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
  tone?: FiturTone
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-[14px] px-3 py-2 backdrop-blur-sm ${FITUR_TONE_STYLES[tone]}`}
    >
      <Image src={iconImageSrc} alt="" width={28} height={28} className="h-6 w-6 shrink-0 object-contain" />
      <div className="min-w-0">
        <p className="truncate text-[11.5px] font-semibold leading-none">{title}</p>
        <p className="mt-0.5 truncate text-[10px] opacity-80">{subtitle}</p>
      </div>
    </div>
  )
}

/* =========================================================
   TONE GRADIENTS / SHADOW
   Dipakai di hasil/[id] untuk badge skor akhir.
   Kunci sesuai fungsi toneSkor(): emerald | amber | red | slate
========================================================= */

type SkorTone = "emerald" | "amber" | "red" | "slate"

export const toneGradients: Record<SkorTone, string> = {
  emerald: "from-[#34d399] to-[#047857]",
  amber: "from-[#fbbf24] to-[#b8863b]",
  red: "from-[#f87171] to-[#b52f2f]",
  slate: "from-[#94a3b8] to-[#475569]",
}

export const toneIconShadow: Record<SkorTone, string> = {
  emerald: "shadow-[0_14px_28px_-14px_rgba(4,120,87,0.55)]",
  amber: "shadow-[0_14px_28px_-14px_rgba(184,134,59,0.55)]",
  red: "shadow-[0_14px_28px_-14px_rgba(181,47,47,0.55)]",
  slate: "shadow-[0_14px_28px_-14px_rgba(71,85,105,0.45)]",
}
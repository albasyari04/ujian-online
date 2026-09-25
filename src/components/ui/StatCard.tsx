import type { ReactElement } from "react"
import Image from "next/image"

type Tone = "indigo" | "emerald" | "amber" | "red" | "slate"

const TONE_STYLES: Record<Tone, { icon: string; glow: string }> = {
  indigo: {
    icon: "bg-gradient-to-br from-[#818cf8] to-[#4338ca] text-white shadow-[0_8px_16px_-6px_rgba(67,56,202,0.55)]",
    glow: "before:bg-[radial-gradient(circle_at_15%_-10%,rgba(129,140,248,0.16),transparent_55%)]",
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
  icon: Icon,
  iconImageSrc,
  label,
  value,
  hint,
  tone = "indigo",
}: {
  /** Icon berupa komponen React (svg), mis. IconUsers. Dipakai kalau `iconImageSrc` tidak diisi. */
  icon?: (props: { className?: string }) => ReactElement
  /** Alternatif: path gambar icon 3D siap-pakai (mis. "/image/icon/ujian-saya-icon.png").
   *  Kalau diisi, background bulat gradient TIDAK dirender — icon tampil polos dengan drop-shadow. */
  iconImageSrc?: string
  label: string
  value: string | number
  hint?: string
  tone?: Tone
}) {
  const t = TONE_STYLES[tone]

  return (
    <div
      className={`
        group relative overflow-hidden rounded-[18px] border border-[#e7e4dc] bg-white p-4
        shadow-[0_1px_2px_rgba(22,35,63,0.04),0_14px_28px_-14px_rgba(49,46,129,0.25)]
        transition-all duration-200 ease-out
        before:absolute before:inset-0 before:content-['']
        hover:-translate-y-1 hover:shadow-[0_6px_14px_rgba(22,35,63,0.07),0_26px_44px_-18px_rgba(49,46,129,0.32)]
        dark:border-white/10 dark:bg-[#101a30] dark:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.6)]
        ${t.glow}
      `}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#8b93a6] dark:text-white/50">{label}</p>
          <p className="mt-1.5 truncate text-[26px] font-semibold leading-none text-[#16233f] dark:text-white">
            {value}
          </p>
          {hint && <p className="mt-2 text-[11.5px] text-[#8b93a6] dark:text-white/40">{hint}</p>}
        </div>

        {iconImageSrc ? (
          <Image src={iconImageSrc} alt="" width={64} height={64} className="h-16 w-16 object-contain" />
        ) : Icon ? (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ring-1 ring-inset ring-black/5 dark:ring-white/10 ${t.icon}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </div>
  )
}
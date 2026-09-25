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
   *  Kalau diisi, icon tampil POLOS (tanpa background/box apa pun) — hanya drop-shadow. */
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
        group relative overflow-hidden rounded-[18px]
        bg-gradient-to-br from-white via-[#fcfbf8] to-[#f6f5f1] p-4
        shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_0_#eef0f4,0_14px_26px_-16px_rgba(22,35,63,0.3)]
        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_0_#e3e7ee,0_20px_32px_-16px_rgba(22,35,63,0.38)]
        dark:from-[#182137] dark:via-[#141c30] dark:to-[#111a2c]
        dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_0_#0d1424,0_16px_28px_-16px_rgba(0,0,0,0.6)]
        dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_0_#0d1424,0_22px_34px_-16px_rgba(0,0,0,0.68)]
      `}
    >
      {/* glare atas, dekorasi permukaan 3D — bukan card di belakang icon */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-transparent dark:from-white/[0.05]"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#8b93a6] dark:text-white/50">{label}</p>
          <p className="mt-1.5 truncate text-[26px] font-semibold leading-none text-[#16233f] dark:text-white">
            {value}
          </p>
          {hint && <p className="mt-2 text-[11.5px] text-[#8b93a6] dark:text-white/40">{hint}</p>}
        </div>

        {iconImageSrc ? (
          // Icon POLOS, tanpa background/box — sama seperti icon mata pelajaran
          <Image
            src={iconImageSrc}
            alt=""
            width={52}
            height={52}
            className="
              -mr-1 -mt-1 h-[52px] w-[52px] shrink-0 object-contain
              drop-shadow-[0_10px_16px_rgba(49,46,129,0.22)]
              transition-transform duration-300 ease-out
              group-hover:-translate-y-0.5 group-hover:-rotate-3
            "
          />
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
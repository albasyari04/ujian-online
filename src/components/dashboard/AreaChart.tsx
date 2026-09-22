"use client"

import { useId } from "react"

type AreaDatum = {
  label: string
  value: number
}

/**
 * Mengubah rangkaian titik menjadi segmen kurva Bezier yang mulus
 * (Catmull-Rom -> Cubic Bezier). Dipakai supaya garis tidak patah-patah
 * di setiap titik data, seperti pada referensi.
 */
function buildSmoothCurve(points: { x: number; y: number }[]) {
  if (points.length < 2) return ""

  let d = ""
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export function AreaChart({
  data,
  color = "#d23b3b",
  fillColor,
  unitLabel = "kejadian",
}: {
  data: AreaDatum[]
  color?: string
  /** Opsional: override warna arsiran. Default memakai warna garis (color) supaya arsiran tetap terlihat jelas. */
  fillColor?: string
  unitLabel?: string
}) {
  const gradientId = useId()
  const glowId = useId()
  const shadowId = useId()

  const resolvedFill = fillColor ?? color

  const width = 560
  const height = 220
  const paddingTop = 40
  const paddingBottom = 32
  const paddingX = 16
  const chartHeight = height - paddingTop - paddingBottom
  const baseline = paddingTop + chartHeight

  const max = Math.max(1, ...data.map((d) => d.value))

  const points = data.map((d, i) => {
    const x =
      data.length > 1
        ? paddingX + (i * (width - paddingX * 2)) / (data.length - 1)
        : width / 2
    const y = baseline - (d.value / max) * chartHeight
    return { x, y, ...d }
  })

  const linePath =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y}${buildSmoothCurve(points)}`
      : ""

  const areaPath =
    points.length > 0
      ? `M ${points[0].x} ${baseline} L ${points[0].x} ${points[0].y}${buildSmoothCurve(
          points
        )} L ${points[points.length - 1].x} ${baseline} Z`
      : ""

  // Titik puncak, untuk bubble tooltip mengambang seperti pada referensi.
  const peakIndex = points.reduce(
    (bestIdx, p, i) => (p.value > points[bestIdx].value ? i : bestIdx),
    0
  )
  const peak = points[peakIndex]
  const showPeakBubble = points.length > 0 && peak.value > 0

  const bubbleWidth = 78
  const bubbleHeight = 30
  const bubbleX = Math.min(
    Math.max(peak?.x ?? 0, paddingX) - bubbleWidth / 2,
    width - paddingX - bubbleWidth
  )
  const bubbleY = Math.max((peak?.y ?? 0) - bubbleHeight - 14, 2)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Grafik area pelanggaran"
    >
      <defs>
        {/* Gradasi isian di bawah kurva: pekat di atas, transparan di bawah */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={resolvedFill} stopOpacity={0.5} />
          <stop offset="55%" stopColor={resolvedFill} stopOpacity={0.16} />
          <stop offset="100%" stopColor={resolvedFill} stopOpacity={0.02} />
        </linearGradient>

        {/* Efek glow tipis di sekitar garis */}
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Bayangan lembut untuk bubble tooltip */}
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor={color} floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Grid horizontal tipis */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={paddingX}
          x2={width - paddingX}
          y1={paddingTop + chartHeight * (1 - f)}
          y2={paddingTop + chartHeight * (1 - f)}
          stroke="#eef2f6"
          strokeWidth={1}
        />
      ))}

      {/* Area gradasi di bawah kurva */}
      {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

      {/* Garis kurva mulus + glow */}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glowId})`}
        />
      )}

      {/* Titik-titik data */}
      {points.map((p, i) => {
        const isPeak = i === peakIndex && p.value > 0
        return (
          <g key={`${p.label}-${i}`}>
            <title>{`${p.label}: ${p.value} ${unitLabel}`}</title>
            {isPeak && <circle cx={p.x} cy={p.y} r={9} fill={color} opacity={0.14} />}
            <circle
              cx={p.x}
              cy={p.y}
              r={isPeak ? 5 : 3.5}
              fill="#ffffff"
              stroke={color}
              strokeWidth={isPeak ? 3 : 2}
            />
          </g>
        )
      })}

      {/* Bubble tooltip mengambang di titik puncak */}
      {showPeakBubble && (
        <g filter={`url(#${shadowId})`}>
          <rect
            x={bubbleX}
            y={bubbleY}
            width={bubbleWidth}
            height={bubbleHeight}
            rx={9}
            fill="#ffffff"
            stroke="#f0e3e3"
          />
          <text
            x={bubbleX + bubbleWidth / 2}
            y={bubbleY + 13}
            textAnchor="middle"
            fontSize="11.5"
            fontWeight={700}
            fill="#16233f"
          >
            {peak.value} {unitLabel}
          </text>
          <text
            x={bubbleX + bubbleWidth / 2}
            y={bubbleY + 24}
            textAnchor="middle"
            fontSize="9"
            fill="#8b93a6"
          >
            {peak.label}
          </text>
        </g>
      )}

      {/* Label sumbu-x */}
      {points.map((p, i) => (
        <text
          key={`label-${p.label}-${i}`}
          x={p.x}
          y={height - 10}
          textAnchor="middle"
          fontSize="10.5"
          fill="#8b93a6"
        >
          {p.label}
        </text>
      ))}
    </svg>
  )
}
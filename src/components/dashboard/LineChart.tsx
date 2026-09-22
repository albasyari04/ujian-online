"use client"

import { useId } from "react"

type LineDatum = {
  label: string
  value: number
}

export function LineChart({
  data,
  color = "#10b981",
}: {
  data: LineDatum[]
  color?: string
}) {
  const gradientId = useId()
  const sideGradientId = useId()

  const width = 560
  const height = 220
  const paddingTop = 24
  const paddingBottom = 32
  const paddingX = 10
  const chartHeight = height - paddingTop - paddingBottom
  const max = Math.max(1, ...data.map((d) => d.value))
  const barGap = 20
  const barDepthX = 8
  const barDepthY = 7
  const barWidth = data.length > 0 ? (width - paddingX * 2 - barGap * (data.length - 1)) / data.length : 0

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Diagram batang ujian per bulan">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#42c7f5" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor="#003868" />
        </linearGradient>
        <linearGradient id={sideGradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#003868" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#007fc4" stopOpacity={0.75} />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={paddingX}
          x2={width - paddingX}
          y1={paddingTop + chartHeight * (1 - f)}
          y2={paddingTop + chartHeight * (1 - f)}
          stroke="#efece4"
          strokeWidth={1}
        />
      ))}

      {data.map((datum, index) => {
        const barHeight = (datum.value / max) * chartHeight
        const x = paddingX + index * (barWidth + barGap)
        const y = paddingTop + chartHeight - barHeight
        const baseline = paddingTop + chartHeight
        const right = x + barWidth
        const top = y
        const bottom = baseline

        return (
          <g key={`${datum.label}-${index}`}>
            <title>{`${datum.label}: ${datum.value}`}</title>
            <rect x={x + 2} y={paddingTop + 3} width={barWidth} height={chartHeight} rx={8} fill="#d9f4ff" opacity={0.35} />
            {datum.value > 0 && (
              <>
                {/* Bidang depan: tinggi batang mengikuti nilai data. */}
                <rect x={x} y={top} width={barWidth} height={barHeight} rx={7} fill={`url(#${gradientId})`} />
                {/* Sisi kanan dan bidang atas memakai depth yang sama agar membentuk balok. */}
                <path d={`M ${right} ${top} L ${right + barDepthX} ${top - barDepthY} L ${right + barDepthX} ${bottom - barDepthY} L ${right} ${bottom} Z`} fill={`url(#${sideGradientId})`} opacity={0.92} />
                <path d={`M ${x + 7} ${top} H ${right} L ${right + barDepthX} ${top - barDepthY} H ${x + 7} Z`} fill="#8de1fb" opacity={0.85} />
              </>
            )}
            {datum.value > 0 && <text x={x + barWidth / 2} y={y - 10} textAnchor="middle" fontSize="11" fontWeight={600} fill="#003868">{datum.value}</text>}
            <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fontSize="10.5" fill="#8b93a6">
              {datum.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
type BarDatum = {
  label: string
  value: number
}

export function BarChart({
  data,
  color = "#059669",
  trackColor = "#d1fae5",
}: {
  data: BarDatum[]
  color?: string
  trackColor?: string
}) {
  const width = 560
  const height = 220
  const paddingTop = 20
  const paddingBottom = 32
  const paddingX = 8
  const chartHeight = height - paddingTop - paddingBottom
  const max = Math.max(1, ...data.map((d) => d.value))
  const barGap = 14
  const barWidth =
    data.length > 0 ? (width - paddingX * 2 - barGap * (data.length - 1)) / data.length : 0

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Grafik batang">
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

      {data.map((d, i) => {
        const barHeight = max === 0 ? 0 : (d.value / max) * chartHeight
        const x = paddingX + i * (barWidth + barGap)
        const y = paddingTop + chartHeight - barHeight

        return (
          <g key={`${d.label}-${i}`}>
            <title>{`${d.label}: ${d.value}`}</title>

            {/* Track / rel belakang batang, memberi kesan depth */}
            <rect x={x} y={paddingTop} width={barWidth} height={chartHeight} rx={8} fill={trackColor} opacity={0.5} />

            {/* Batang nilai, dengan sedikit gradasi vertikal untuk efek 3D */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 4)}
              rx={8}
              fill={color}
              opacity={0.95}
            />

            {d.value > 0 && (
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight={600} fill="#34435f">
                {d.value}
              </text>
            )}

            <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fontSize="10.5" fill="#8b93a6">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
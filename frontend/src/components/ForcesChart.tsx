import { useEffect, useRef } from 'react'

interface Props {
  forcesReport: string
}

// Parsuje wyniki Push/Pull/Anxiety/Habit z tekstu Markdown
function parseForces(text: string): { label: string; value: number; color: string }[] {
  const forces = [
    { label: 'Push', pattern: /PUSH.*?Siła:\s*(\d+)\/10/i, color: '#ef4444' },
    { label: 'Pull', pattern: /PULL.*?Siła:\s*(\d+)\/10/i, color: '#22c55e' },
    { label: 'Anxiety', pattern: /ANXIETY.*?Siła:\s*(\d+)\/10/i, color: '#f97316' },
    { label: 'Habit', pattern: /HABIT.*?Siła:\s*(\d+)\/10/i, color: '#8b5cf6' },
  ]

  return forces.map(({ label, pattern, color }) => {
    const match = text.match(pattern)
    return { label, value: match ? parseInt(match[1]) : 5, color }
  })
}

export default function ForcesChart({ forcesReport }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || !forcesReport) return

    const forces = parseForces(forcesReport)

    // Lazy import Plotly — używamy dist-min (pre-bundled, bez Node.js deps)
    import('plotly.js-dist-min').then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Plotly = (mod as any).default ?? mod

      const data = [{
        type: 'bar' as const,
        orientation: 'h' as const,
        x: forces.map(f => f.value),
        y: forces.map(f => f.label),
        marker: { color: forces.map(f => f.color) },
        text: forces.map(f => `${f.value}/10`),
        textposition: 'outside' as const,
      }]

      const layout = {
        height: 220,
        margin: { l: 80, r: 60, t: 20, b: 30 },
        xaxis: { range: [0, 11], title: 'Siła (1-10)', tickfont: { size: 11 } },
        yaxis: { tickfont: { size: 13 } },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        shapes: [{
          type: 'line' as const,
          x0: 5, x1: 5, y0: -0.5, y1: forces.length - 0.5,
          line: { color: '#94a3b8', width: 1, dash: 'dot' as const },
        }],
      }

      Plotly.newPlot(chartRef.current!, data, layout, {
        displayModeBar: false,
        responsive: true,
      })
    })
  }, [forcesReport])

  if (!forcesReport) return null

  return (
    <div>
      <div ref={chartRef} />
      <p className="text-xs text-gray-500 text-center mt-1">
        Linia przerywana = próg (5/10). Push+Pull vs Anxiety+Habit
      </p>
    </div>
  )
}

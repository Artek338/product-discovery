import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  assumptionMap: string
}

// Wyodrębnia sekcje FATAL, HIGH RISK, ACCEPTABLE RISK z Markdown
function categorize(text: string) {
  const fatal: string[] = []
  const high: string[] = []
  const acceptable: string[] = []

  const lines = text.split('\n')
  let current: string[] | null = null

  for (const line of lines) {
    const lower = line.toLowerCase()
    if (lower.includes('fatal')) { current = fatal; continue }
    if (lower.includes('high risk')) { current = high; continue }
    if (lower.includes('acceptable')) { current = acceptable; continue }
    if (line.startsWith('##') || line.startsWith('###')) { current = null; continue }
    if (current && line.trim().startsWith('|') && !line.includes('Założenie')) {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 2 && !cols[0].startsWith('-')) {
        current.push(cols[0])
      }
    }
  }

  return { fatal, high, acceptable }
}

interface BadgeProps { count: number; color: string; label: string }
function CountBadge({ count, color, label }: BadgeProps) {
  if (count === 0) return null
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {count} {label}
    </span>
  )
}

export default function AssumptionTable({ assumptionMap }: Props) {
  if (!assumptionMap) return null

  const { fatal, high, acceptable } = categorize(assumptionMap)

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <CountBadge count={fatal.length} color="bg-[#FEE2E2] text-[#DC2626]" label="FATAL" />
        <CountBadge count={high.length} color="bg-[#FFF7ED] text-[#C2410C]" label="HIGH RISK" />
        <CountBadge count={acceptable.length} color="bg-[#DCFCE7] text-[#15803D]" label="ACCEPTABLE" />
      </div>

      <div className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{assumptionMap}</ReactMarkdown>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  assumptionMap: string
  sessionId?: string
}

// Wyodrębnia wiersze tabel z sekcji FATAL / HIGH RISK / ACCEPTABLE z Markdown
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
    if (current && line.trim().startsWith('|') && !line.includes('Założenie') && !line.includes('---')) {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 2 && !cols[0].startsWith('-') && cols[0].length > 3) {
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

interface AssumptionRowsProps {
  items: string[]
  riskLevel: 'fatal' | 'high' | 'acceptable'
  ownerMap: Record<string, string>
  deadlineMap: Record<string, string>
  onOwnerChange: (key: string, value: string) => void
  onDeadlineChange: (key: string, value: string) => void
}

function AssumptionRows({ items, riskLevel, ownerMap, deadlineMap, onOwnerChange, onDeadlineChange }: AssumptionRowsProps) {
  if (items.length === 0) return null

  const colors = {
    fatal: { header: 'bg-red-50 border-red-200', border: 'border-red-100', label: 'FATAL', labelCls: 'text-red-700' },
    high: { header: 'bg-orange-50 border-orange-200', border: 'border-orange-100', label: 'HIGH RISK', labelCls: 'text-orange-700' },
    acceptable: { header: 'bg-green-50 border-green-200', border: 'border-green-100', label: 'ACCEPTABLE', labelCls: 'text-green-700' },
  }
  const c = colors[riskLevel]

  return (
    <div className="mb-4">
      <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 ${c.labelCls}`}>{c.label}</h4>
      <div className={`rounded-lg border ${c.header} overflow-hidden`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${c.border}`}>
              <th className={`text-left px-3 py-2 text-xs font-semibold ${c.labelCls} w-1/2`}>Założenie</th>
              <th className={`text-left px-3 py-2 text-xs font-semibold ${c.labelCls} w-1/4`}>Owner</th>
              <th className={`text-left px-3 py-2 text-xs font-semibold ${c.labelCls} w-1/4`}>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {items.map((assumption, i) => (
              <tr key={i} className={`border-t ${c.border} bg-white dark:bg-[#1A1A1A]`}>
                <td className="px-3 py-2 font-sans text-sm text-[#0D2535] dark:text-slate-200 leading-snug">
                  {assumption}
                </td>
                <td className="px-3 py-2">
                  <input
                    value={ownerMap[assumption] || ''}
                    onChange={e => onOwnerChange(assumption, e.target.value)}
                    placeholder="@owner"
                    className={`w-full bg-transparent border-b border-dashed ${c.border.replace('border-', 'border-b-')} outline-none text-xs py-0.5 text-[#0D2535] dark:text-slate-300 placeholder:text-slate-400`}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    value={deadlineMap[assumption] || ''}
                    onChange={e => onDeadlineChange(assumption, e.target.value)}
                    className={`bg-transparent border-b border-dashed ${c.border.replace('border-', 'border-b-')} outline-none text-xs py-0.5 text-[#0D2535] dark:text-slate-300 w-full`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AssumptionTable({ assumptionMap, sessionId }: Props) {
  if (!assumptionMap) return null

  const storageKey = `assumptions_${sessionId || assumptionMap.slice(0, 60)}`
  const [ownerMap, setOwnerMap] = useState<Record<string, string>>({})
  const [deadlineMap, setDeadlineMap] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const { owners, deadlines } = JSON.parse(saved)
        setOwnerMap(owners || {})
        setDeadlineMap(deadlines || {})
      }
    } catch { /* ignore */ }
  }, [storageKey])

  const persist = (owners: Record<string, string>, deadlines: Record<string, string>) => {
    try { localStorage.setItem(storageKey, JSON.stringify({ owners, deadlines })) } catch { /* ignore */ }
  }

  const handleOwner = (key: string, value: string) => {
    const next = { ...ownerMap, [key]: value }
    setOwnerMap(next)
    persist(next, deadlineMap)
  }

  const handleDeadline = (key: string, value: string) => {
    const next = { ...deadlineMap, [key]: value }
    setDeadlineMap(next)
    persist(ownerMap, next)
  }

  const { fatal, high, acceptable } = categorize(assumptionMap)
  const hasStructured = fatal.length > 0 || high.length > 0 || acceptable.length > 0

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <CountBadge count={fatal.length} color="bg-[#FEE2E2] text-[#DC2626]" label="FATAL" />
        <CountBadge count={high.length} color="bg-[#FFF7ED] text-[#C2410C]" label="HIGH RISK" />
        <CountBadge count={acceptable.length} color="bg-[#DCFCE7] text-[#15803D]" label="ACCEPTABLE" />
        {hasStructured && (
          <span className="text-xs text-slate-400 font-sans ml-1 self-center">
            — kliknij Owner/Deadline żeby przypisać odpowiedzialność
          </span>
        )}
      </div>

      {/* Edytowalne tabele z owner/deadline dla FATAL i HIGH */}
      {hasStructured ? (
        <>
          <AssumptionRows
            items={fatal}
            riskLevel="fatal"
            ownerMap={ownerMap}
            deadlineMap={deadlineMap}
            onOwnerChange={handleOwner}
            onDeadlineChange={handleDeadline}
          />
          <AssumptionRows
            items={high}
            riskLevel="high"
            ownerMap={ownerMap}
            deadlineMap={deadlineMap}
            onOwnerChange={handleOwner}
            onDeadlineChange={handleDeadline}
          />
          <AssumptionRows
            items={acceptable}
            riskLevel="acceptable"
            ownerMap={ownerMap}
            deadlineMap={deadlineMap}
            onOwnerChange={handleOwner}
            onDeadlineChange={handleDeadline}
          />
          {/* Pełna treść markdown collapsible */}
          <details className="group mt-2">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-[#14B8A6] font-sans flex items-center gap-1">
              <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              Pokaż pełną mapę założeń (Markdown)
            </summary>
            <div className="mt-3 prose prose-sm max-w-none font-sans bg-slate-50 dark:bg-[#111] p-4 rounded-xl border border-slate-100 dark:border-[#333]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{assumptionMap}</ReactMarkdown>
            </div>
          </details>
        </>
      ) : (
        <div className="prose prose-sm max-w-none font-sans">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{assumptionMap}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

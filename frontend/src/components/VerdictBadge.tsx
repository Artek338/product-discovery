import type { Verdict } from '../types/discovery'

interface Props {
  verdict?: Verdict | null
  size?: 'sm' | 'md' | 'lg'
}

const CONFIG: Record<Verdict, { label: string; bg: string; border: string; text: string }> = {
  'GO': {
    label: '✅  GO',
    bg: '#DCFCE7',
    border: '#86EFAC',
    text: '#15803D',
  },
  'NO-GO': {
    label: '❌  NO-GO',
    bg: '#FEE2E2',
    border: '#FCA5A5',
    text: '#DC2626',
  },
  'NEEDS_MORE_DATA': {
    label: '⚠️  WIĘCEJ DANYCH',
    bg: '#FEF3C7',
    border: '#FDE68A',
    text: '#B45309',
  },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2.5 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2 font-bold',
}

export default function VerdictBadge({ verdict, size = 'md' }: Props) {
  if (!verdict) {
    return (
      <span data-testid="verdict-badge" className={`inline-flex items-center rounded-[12px] border font-semibold font-mono ${SIZE_CLASSES[size]}`}
        style={{ background: '#F1F5F9', borderColor: '#E2E8F0', color: '#64748B' }}>
        —
      </span>
    )
  }

  const cfg = CONFIG[verdict]
  return (
    <span
      data-testid="verdict-badge"
      className={`inline-flex items-center rounded-[12px] border font-bold font-mono ${SIZE_CLASSES[size]}`}
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
    >
      {cfg.label}
    </span>
  )
}

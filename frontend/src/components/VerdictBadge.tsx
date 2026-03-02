import type { Verdict } from '../types/discovery'

interface Props {
  verdict?: Verdict | null
  size?: 'sm' | 'md' | 'lg'
}

const CONFIG: Record<Verdict, { label: string; icon: string; classes: string }> = {
  'GO': {
    label: 'GO',
    icon: '✅',
    classes: 'bg-green-100 text-green-800 border-green-300',
  },
  'NO-GO': {
    label: 'NO-GO',
    icon: '🚫',
    classes: 'bg-red-100 text-red-800 border-red-300',
  },
  'NEEDS_MORE_DATA': {
    label: 'WIĘCEJ DANYCH',
    icon: '⚠️',
    classes: 'bg-amber-100 text-amber-800 border-amber-300',
  },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5 font-bold',
}

export default function VerdictBadge({ verdict, size = 'md' }: Props) {
  if (!verdict) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${SIZE_CLASSES[size]} bg-gray-100 text-gray-500 border-gray-300`}>
        —
      </span>
    )
  }

  const cfg = CONFIG[verdict]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${SIZE_CLASSES[size]} ${cfg.classes}`}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  )
}

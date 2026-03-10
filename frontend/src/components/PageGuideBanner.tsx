/**
 * PageGuideBanner — generyczny rozwijany panel z przewodnikiem po stronie.
 *
 * Zachowanie identyczne jak OnboardingBanner:
 *  - Domyślnie rozwinięty.
 *  - Zwinięcie zapamiętywane w localStorage ({storageKey}_collapsed).
 *  - „Ukryj na zawsze" trwale chowa baner ({storageKey}_dismissed).
 *    Można go przywrócić małym linkiem „Pokaż przewodnik".
 */

import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, X, BookOpen } from 'lucide-react'

export interface GuideBannerSection {
  title: string
  content: ReactNode
}

interface Props {
  storageKey: string
  badge?: string
  title: string
  sections: GuideBannerSection[]  // 1–3 kolumny
}

export default function PageGuideBanner({ storageKey, badge = 'Wskazówka', title, sections }: Props) {
  const lsDismissed = `${storageKey}_dismissed`
  const lsCollapsed = `${storageKey}_collapsed`

  const [dismissed, setDismissed] = useState(() => localStorage.getItem(lsDismissed) === 'true')
  const [expanded, setExpanded]   = useState(() => localStorage.getItem(lsCollapsed) !== 'true')

  const handleDismiss = () => {
    localStorage.setItem(lsDismissed, 'true')
    setDismissed(true)
  }

  const handleToggle = () => {
    const next = !expanded
    localStorage.setItem(lsCollapsed, String(!next))
    setExpanded(next)
  }

  const handleRestore = () => {
    localStorage.removeItem(lsDismissed)
    localStorage.removeItem(lsCollapsed)
    setDismissed(false)
    setExpanded(true)
  }

  if (dismissed) {
    return (
      <button
        onClick={handleRestore}
        className="mb-5 flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] transition-colors"
      >
        <BookOpen size={12} />
        Pokaż przewodnik
      </button>
    )
  }

  const colClass =
    sections.length === 1 ? 'grid-cols-1' :
    sections.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                            'grid-cols-1 md:grid-cols-3'

  return (
    <div className="mb-6 rounded-2xl border border-[#14B8A6]/25 dark:border-[#14B8A6]/15 bg-gradient-to-br from-teal-50/70 to-white dark:from-[#0D2535]/30 dark:to-[#1A1A1A] shadow-sm overflow-hidden transition-colors">

      {/* ── Nagłówek ── */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-teal-50/50 dark:hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs font-semibold bg-[#14B8A6] text-white px-2.5 py-0.5 rounded-full leading-5">
            {badge}
          </span>
          <span className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-sm">
            {title}
          </span>
        </div>
        <div className="shrink-0 text-slate-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* ── Treść ── */}
      {expanded && (
        <>
          <div className={`px-6 pb-5 pt-4 border-t border-[#14B8A6]/10 dark:border-[#333333] grid ${colClass} gap-6`}>
            {sections.map((sec, i) => (
              <div key={i}>
                <h4 className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-100 mb-2">
                  {sec.title}
                </h4>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed space-y-1.5">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 pb-4 flex justify-end border-t border-[#14B8A6]/10 dark:border-[#333333] pt-3">
            <button
              onClick={handleDismiss}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={12} />
              Ukryj na zawsze
            </button>
          </div>
        </>
      )}
    </div>
  )
}

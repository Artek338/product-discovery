/**
 * OnboardingBanner — rozwijany panel powitalny widoczny na Dashboardzie.
 *
 * Zachowanie:
 *  - Domyślnie rozwinięty dla nowych użytkowników.
 *  - Zwinięcie zapamiętywane w localStorage (pd_onboarding_collapsed).
 *  - „Ukryj na zawsze" chowa baner trwale (pd_onboarding_dismissed).
 *    Można go przywrócić klikając link „Pokaż przewodnik" który pozostaje widoczny.
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, X, BookOpen } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'

const LS_DISMISSED = 'pd_onboarding_dismissed'
const LS_COLLAPSED = 'pd_onboarding_collapsed'

export default function OnboardingBanner() {
  const { language } = useAppStore()

  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(LS_DISMISSED) === 'true'
  )
  const [expanded, setExpanded] = useState(
    () => localStorage.getItem(LS_COLLAPSED) !== 'true'
  )

  const handleDismiss = () => {
    localStorage.setItem(LS_DISMISSED, 'true')
    setDismissed(true)
  }

  const handleToggle = () => {
    const next = !expanded
    localStorage.setItem(LS_COLLAPSED, String(!next))
    setExpanded(next)
  }

  const handleRestore = () => {
    localStorage.removeItem(LS_DISMISSED)
    localStorage.removeItem(LS_COLLAPSED)
    setDismissed(false)
    setExpanded(true)
  }

  // Ukryty — pokaż tylko mały link przywracający
  if (dismissed) {
    return (
      <button
        onClick={handleRestore}
        className="mb-5 flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] transition-colors"
      >
        <BookOpen size={12} />
        {t(language, 'onboard_show')}
      </button>
    )
  }

  return (
    <div className="mb-6 rounded-2xl border border-[#14B8A6]/25 dark:border-[#14B8A6]/15 bg-gradient-to-br from-teal-50/70 to-white dark:from-[#0D2535]/30 dark:to-[#1A1A1A] shadow-sm overflow-hidden transition-colors">

      {/* ── Nagłówek (zawsze widoczny) ── */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-teal-50/50 dark:hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs font-semibold bg-[#14B8A6] text-white px-2.5 py-0.5 rounded-full leading-5">
            {t(language, 'onboard_badge')}
          </span>
          <span className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-sm">
            {t(language, 'onboard_title')}
          </span>
        </div>
        <div className="shrink-0 text-slate-400">
          {expanded
            ? <ChevronUp size={16} />
            : <ChevronDown size={16} />
          }
        </div>
      </button>

      {/* ── Treść rozwijana ── */}
      {expanded && (
        <>
          <div className="px-6 pb-5 pt-4 border-t border-[#14B8A6]/10 dark:border-[#333333] grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 1 — Co to jest */}
            <div>
              <h4 className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-100 mb-2">
                {t(language, 'onboard_what_title')}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                {t(language, 'onboard_what_desc')}
              </p>
            </div>

            {/* 2 — Jak zacząć + Tryby */}
            <div className="space-y-5">
              <div>
                <h4 className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-100 mb-2">
                  {t(language, 'onboard_how_title')}
                </h4>
                <ol className="space-y-2">
                  {([
                    t(language, 'onboard_step1'),
                    t(language, 'onboard_step2'),
                    t(language, 'onboard_step3'),
                  ] as string[]).map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500 dark:text-slate-400 font-sans">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#14B8A6] text-white text-xs flex items-center justify-center font-semibold mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-100 mb-2">
                  {t(language, 'onboard_modes_title')}
                </h4>
                <ul className="space-y-1.5">
                  {([
                    t(language, 'onboard_mode_auto'),
                    t(language, 'onboard_mode_problem'),
                    t(language, 'onboard_mode_solution'),
                  ] as string[]).map((mode, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400 font-sans">
                      <span className="text-[#14B8A6] shrink-0 font-bold leading-5">·</span>
                      {mode}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3 — Kluczowe pojęcia */}
            <div>
              <h4 className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-100 mb-3">
                {t(language, 'onboard_concepts_title')}
              </h4>
              <div className="space-y-3">
                {([
                  {
                    label: t(language, 'onboard_jtbd_label'),
                    desc: t(language, 'onboard_jtbd_desc'),
                  },
                  {
                    label: t(language, 'onboard_evidence_label'),
                    desc: t(language, 'onboard_evidence_desc'),
                  },
                  {
                    label: t(language, 'onboard_sim_label'),
                    desc: t(language, 'onboard_sim_desc'),
                  },
                ] as { label: string; desc: string }[]).map(({ label, desc }) => (
                  <div key={label}>
                    <div className="text-xs font-semibold text-[#14B8A6] font-sans mb-0.5">
                      {label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                      {desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Stopka z przyciskiem "Ukryj" ── */}
          <div className="px-6 pb-4 flex justify-end border-t border-[#14B8A6]/10 dark:border-[#333333] pt-3">
            <button
              onClick={handleDismiss}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={12} />
              {t(language, 'onboard_hide')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

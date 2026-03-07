/**
 * BatchInterview — 6-step Batch Interview Runner
 *
 * Step 1: Question Builder    — presets + kategorie + ręczny dobór
 * Step 2: Hypotheses          — opcjonalne hipotezy do weryfikacji
 * Step 3: Archetype Config    — wybór archetypów (z symulatora lub nowe)
 * Step 4: Run Config          — kontekst, multi-round, concurrency
 * Step 5: Execution           — SSE streaming, macierz w real-time
 * Step 6: Results             — 4 zakładki: Matrix | Insights | Forces | Questions
 */
import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle, CheckCircle2, ChevronRight, Layers, Minus, Plus,
  RefreshCw, Settings2, Sparkles, Target, Trash2, Users, Zap,
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import {
  ALL_QUESTIONS,
  EVIDENCE_LABELS,
  FORCES_DIMS,
  PRESETS,
  UNIQUE_CATEGORIES,
  getPresetQuestions,
} from '../lib/questionBank'
import BatchMatrix from '../components/BatchMatrix'
import BatchInsightPanel from '../components/BatchInsightPanel'
import type {
  BatchCell,
  BatchInsights,
  BatchMode,
  BatchQuestion,
  Hypothesis,
  SyntheticProfile,
} from '../types/discovery'
import { api } from '../lib/api'

// ── Step indicator ─────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'Pytania',    icon: Target },
  { n: 2, label: 'Hipotezy',   icon: Sparkles },
  { n: 3, label: 'Archetypy',  icon: Users },
  { n: 4, label: 'Konfiguracja', icon: Settings2 },
  { n: 5, label: 'Wykonanie',  icon: Zap },
  { n: 6, label: 'Wyniki',     icon: CheckCircle2 },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto">
      {STEPS.map((s, i) => {
        const done    = current > s.n
        const active  = current === s.n
        const Icon = s.icon
        return (
          <div key={s.n} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
              active
                ? 'bg-[#14B8A6] text-white'
                : done
                  ? 'bg-[#14B8A6]/15 text-[#0D2535]'
                  : 'bg-white text-slate-400 border border-[#E2E8F0]'
            }`}>
              <Icon size={12} />
              <span className="whitespace-nowrap">{s.n}. {s.label}</span>
              {done && <CheckCircle2 size={10} className="text-[#14B8A6]" />}
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className="text-slate-200 mx-0.5 shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Nav buttons ────────────────────────────────────────────────────────────────

function NavButtons({
  step,
  canNext,
  onBack,
  onNext,
  nextLabel,
  nextLoading,
}: {
  step: number
  canNext: boolean
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  nextLoading?: boolean
}) {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#E2E8F0]">
      <button
        onClick={onBack}
        disabled={step === 1}
        className="text-sm px-5 py-2.5 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-sans transition-colors"
      >
        ← Wróć
      </button>
      <button
        onClick={onNext}
        disabled={!canNext || nextLoading}
        className="text-sm px-6 py-2.5 rounded-lg bg-[#14B8A6] text-white font-semibold hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed font-sans transition-colors flex items-center gap-2"
      >
        {nextLoading && (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {nextLabel ?? 'Dalej →'}
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Question Builder
// ══════════════════════════════════════════════════════════════════════════════

function Step1Questions({
  selected,
  setSelected,
  mode,
  setMode,
}: {
  selected: BatchQuestion[]
  setSelected: (qs: BatchQuestion[]) => void
  mode: BatchMode
  setMode: (m: BatchMode) => void
}) {
  const [view, setView] = useState<'presets' | 'category' | 'forces' | 'search'>('presets')
  const [categoryFilter, setCategoryFilter] = useState(UNIQUE_CATEGORIES[0])
  const [forcesFilter, setForcesFilter] = useState<string>('push')
  const [searchTerm, setSearchTerm] = useState('')

  const selectedIds = new Set(selected.map(q => q.id))

  function toggle(q: BatchQuestion) {
    if (selectedIds.has(q.id)) {
      setSelected(selected.filter(s => s.id !== q.id))
    } else {
      setSelected([...selected, q])
    }
  }

  function applyPreset(key: string) {
    const qs = getPresetQuestions(key)
    setSelected(qs)
  }

  const displayQuestions =
    view === 'category'
      ? ALL_QUESTIONS.filter(q => q.category === categoryFilter)
      : view === 'forces'
        ? ALL_QUESTIONS.filter(q => q.forces_dimension === forcesFilter)
        : view === 'search'
          ? ALL_QUESTIONS.filter(q =>
              q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
              q.id.toLowerCase().includes(searchTerm.toLowerCase()))
          : []

  const MODES: Array<{ key: BatchMode; label: string; desc: string }> = [
    { key: 'discovery',  label: 'Discovery',   desc: 'Pełna analiza JTBD + Forces' },
    { key: 'forces',     label: 'Forces',      desc: 'Skupiony na Push/Pull/Anxiety/Habit' },
    { key: 'wtp',        label: 'WTP',         desc: 'Gotowość do płacenia + ekonomia' },
    { key: 'story',      label: 'Story',       desc: 'Narrative interview — narracja' },
    { key: 'hypothesis', label: 'Hypothesis',  desc: 'Weryfikacja konkretnych hipotez' },
  ]

  return (
    <div>
      {/* Mode selector */}
      <div className="mb-6">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-2 block">
          Tryb analizy
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`text-left px-3 py-2.5 rounded-lg border text-xs font-sans transition-all ${
                mode === m.key
                  ? 'border-[#14B8A6] bg-[#14B8A6]/10 text-[#0D2535]'
                  : 'border-[#E2E8F0] bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <p className="font-semibold mb-0.5">{m.label}</p>
              <p className="text-[10px] text-slate-400">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: presets/browser */}
        <div>
          {/* View toggle */}
          <div className="flex gap-1 mb-3">
            {(['presets', 'category', 'forces', 'search'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-xs px-3 py-1.5 rounded-lg font-sans transition-all capitalize ${
                  view === v
                    ? 'bg-[#0D2535] text-white'
                    : 'bg-white text-slate-500 border border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                {v === 'presets' ? 'Szablony' : v === 'category' ? 'Kategorie' : v === 'forces' ? 'Forces' : 'Szukaj'}
              </button>
            ))}
          </div>

          {/* Presets */}
          {view === 'presets' && (
            <div className="space-y-2">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="w-full text-left p-3 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#14B8A6] hover:bg-[#14B8A6]/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{preset.icon}</span>
                      <p className="font-semibold text-sm font-sans text-[#0D2535]">{preset.label}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{preset.ids.length} pyt.</span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-0.5 ml-8">{preset.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Category browser */}
          {view === 'category' && (
            <div>
              <div className="flex flex-wrap gap-1 mb-3">
                {UNIQUE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-sans transition-all ${
                      categoryFilter === cat
                        ? 'bg-[#0D2535] text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <QuestionList
                questions={displayQuestions}
                selectedIds={selectedIds}
                onToggle={toggle}
              />
            </div>
          )}

          {/* Forces browser */}
          {view === 'forces' && (
            <div>
              <div className="flex flex-wrap gap-1 mb-3">
                {Object.entries(FORCES_DIMS).map(([dim, cfg]) => (
                  <button
                    key={dim}
                    onClick={() => setForcesFilter(dim)}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-sans transition-all ${
                      forcesFilter === dim ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    style={forcesFilter === dim ? { backgroundColor: cfg.color } : {}}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
              <QuestionList
                questions={displayQuestions}
                selectedIds={selectedIds}
                onToggle={toggle}
              />
            </div>
          )}

          {/* Search */}
          {view === 'search' && (
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Szukaj pytania..."
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg font-sans mb-3 outline-none focus:border-[#14B8A6]"
              />
              <QuestionList
                questions={displayQuestions}
                selectedIds={selectedIds}
                onToggle={toggle}
              />
            </div>
          )}
        </div>

        {/* Right: selected questions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans">
              Wybrane pytania ({selected.length})
            </p>
            {selected.length > 0 && (
              <button
                onClick={() => setSelected([])}
                className="text-[10px] text-red-500 hover:text-red-600 font-sans"
              >
                Wyczyść wszystkie
              </button>
            )}
          </div>

          {selected.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
              <Target size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-sans">
                Wybierz szablon lub pytania z listy
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {selected.map((q, qi) => (
                <div
                  key={q.id}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-[#E2E8F0] group"
                >
                  <span className="font-mono text-[10px] text-slate-400 mt-0.5 w-8 shrink-0">{q.id}</span>
                  <p className="flex-1 text-xs font-sans text-[#0D2535] leading-snug">{q.text}</p>
                  <button
                    onClick={() => setSelected(selected.filter((_, i) => i !== qi))}
                    className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Minus size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selected.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-sans text-slate-400 mb-1">Rozkład evidence level:</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(
                  selected.reduce<Record<string, number>>((acc, q) => {
                    acc[q.evidence_level_target] = (acc[q.evidence_level_target] ?? 0) + 1
                    return acc
                  }, {})
                ).map(([level, count]) => (
                  <span key={level} className="text-[10px] px-2 py-0.5 rounded font-mono bg-white border border-slate-200">
                    {EVIDENCE_LABELS[level]}: <strong>{count}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuestionList({
  questions,
  selectedIds,
  onToggle,
}: {
  questions: BatchQuestion[]
  selectedIds: Set<string>
  onToggle: (q: BatchQuestion) => void
}) {
  if (!questions.length) {
    return <p className="text-xs text-slate-400 font-sans py-4 text-center">Brak pytań.</p>
  }

  return (
    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
      {questions.map(q => {
        const sel = selectedIds.has(q.id)
        return (
          <button
            key={q.id}
            onClick={() => onToggle(q)}
            className={`w-full text-left p-2.5 rounded-lg border text-xs font-sans transition-all ${
              sel
                ? 'border-[#14B8A6] bg-[#14B8A6]/10'
                : 'border-[#E2E8F0] bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                sel ? 'bg-[#14B8A6] border-[#14B8A6]' : 'border-slate-300'
              }`}>
                {sel && <CheckCircle2 size={10} className="text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-mono text-[10px] text-slate-400">{q.id}</span>
                  {q.forces_dimension && (
                    <span className="text-[9px] px-1 rounded font-mono"
                      style={{
                        background: (FORCES_DIMS[q.forces_dimension as keyof typeof FORCES_DIMS]?.color ?? '#999') + '20',
                        color: FORCES_DIMS[q.forces_dimension as keyof typeof FORCES_DIMS]?.color ?? '#999',
                      }}>
                      {q.forces_dimension}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#0D2535] leading-snug line-clamp-2">{q.text}</p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Hypotheses
// ══════════════════════════════════════════════════════════════════════════════

function Step2Hypotheses({
  hypotheses,
  setHypotheses,
}: {
  hypotheses: Hypothesis[]
  setHypotheses: (hs: Hypothesis[]) => void
}) {
  const [text, setText] = useState('')

  function add() {
    if (!text.trim()) return
    const h: Hypothesis = {
      id: `H${Date.now()}`,
      text: text.trim(),
      status: 'pending',
      evidence_quotes: [],
      confidence: 0,
    }
    setHypotheses([...hypotheses, h])
    setText('')
  }

  function remove(id: string) {
    setHypotheses(hypotheses.filter(h => h.id !== id))
  }

  return (
    <div>
      <div className="mb-5 p-4 rounded-lg bg-blue-50 border border-blue-100">
        <p className="text-xs font-sans text-blue-700">
          <strong>Opcjonalnie:</strong> dodaj hipotezy, które chcesz zweryfikować w wywiadach.
          Agent analizujący oznaczy każdą jako <em>potwierdzoną</em>, <em>obaloną</em> lub <em>niejednoznaczną</em>.
          Możesz też pominąć ten krok — analiza nadal wykryje wzorce automatycznie.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder='np. "Użytkownicy są gotowi płacić za automatyzację procesu X"'
          className="flex-1 px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-lg font-sans outline-none focus:border-[#14B8A6]"
        />
        <button
          onClick={add}
          disabled={!text.trim()}
          className="px-4 py-2.5 rounded-lg bg-[#14B8A6] text-white text-sm font-semibold disabled:opacity-40 font-sans hover:bg-teal-600 transition-colors flex items-center gap-1"
        >
          <Plus size={14} />
          Dodaj
        </button>
      </div>

      {hypotheses.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
          <Sparkles size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-sans">Brak hipotez — analiza wykryje wzorce automatycznie</p>
        </div>
      ) : (
        <div className="space-y-2">
          {hypotheses.map((h, i) => (
            <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg border border-[#E2E8F0] bg-white">
              <span className="font-mono text-sm font-bold text-[#14B8A6] w-6 shrink-0">H{i + 1}</span>
              <p className="flex-1 text-sm font-sans text-[#0D2535]">{h.text}</p>
              <button
                onClick={() => remove(h.id)}
                className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Archetype Config
// ══════════════════════════════════════════════════════════════════════════════

function Step3Archetypes({
  archetypes,
  setArchetypes,
  simulatorArchetypes,
}: {
  archetypes: SyntheticProfile[]
  setArchetypes: (a: SyntheticProfile[]) => void
  simulatorArchetypes: SyntheticProfile[]
}) {
  const [segment, setSegment] = useState('')
  const [count, setCount] = useState(4)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!segment.trim()) return
    setGenerating(true)
    setError('')
    try {
      const profiles = await api.generateArchetypes(segment, count)
      setArchetypes(profiles)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Błąd generowania archetypów')
    } finally {
      setGenerating(false)
    }
  }

  function importFromSimulator() {
    setArchetypes(simulatorArchetypes)
  }

  function remove(i: number) {
    setArchetypes(archetypes.filter((_, ai) => ai !== i))
  }

  return (
    <div className="space-y-5">
      {/* Import from simulator */}
      {simulatorArchetypes.length > 0 && (
        <div className="p-4 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-800 font-sans">Archetypy z symulatora</p>
            <p className="text-xs text-teal-600 font-sans mt-0.5">
              {simulatorArchetypes.length} profili z aktywnej sesji symulatora
            </p>
          </div>
          <button
            onClick={importFromSimulator}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold font-sans hover:bg-teal-700 transition-colors whitespace-nowrap"
          >
            Importuj →
          </button>
        </div>
      )}

      {/* Generate new */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-2 block">
          Generuj nowe archetypy
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={segment}
            onChange={e => setSegment(e.target.value)}
            placeholder='np. "Freelancerzy UX, 5-15 klientów rocznie, Polska"'
            className="flex-1 px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-lg font-sans outline-none focus:border-[#14B8A6]"
          />
          <select
            value={count}
            onChange={e => setCount(+e.target.value)}
            className="px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-lg font-sans bg-white outline-none"
          >
            {[2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} arch.</option>
            ))}
          </select>
          <button
            onClick={generate}
            disabled={!segment.trim() || generating}
            className="px-4 py-2.5 rounded-lg bg-[#0D2535] text-white text-sm font-semibold disabled:opacity-40 font-sans hover:bg-[#1E3A5F] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {generating ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg> Generuję...</>
            ) : (
              <><Sparkles size={14} /> Generuj</>
            )}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 font-sans mt-1">{error}</p>}
        {generating && (
          <p className="text-xs text-slate-400 font-sans mt-1.5">
            ⏱ Generowanie {count} archetypów zajmuje ~{count * 8}s ({count} wywołań LLM równolegle)
          </p>
        )}
      </div>

      {/* Archetypes list */}
      {archetypes.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-3">
            Wybrane archetypy ({archetypes.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {archetypes.map((arch, i) => (
              <div key={i} className="rounded-lg border border-[#E2E8F0] bg-white p-4 relative group">
                <button
                  onClick={() => remove(i)}
                  className="absolute top-2 right-2 text-slate-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
                <p className="font-semibold text-sm font-sans text-[#0D2535] mb-1">
                  {arch.archetype_name}
                </p>
                <p className="text-[11px] text-slate-400 font-sans line-clamp-2">{arch.demographics}</p>
                {arch.jtbd_hypothesis && (
                  <p className="text-[11px] text-teal-600 font-sans mt-1.5 line-clamp-2 italic">
                    JTBD: {arch.jtbd_hypothesis}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {archetypes.length === 0 && !generating && (
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
          <Users size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-sans">
            Wygeneruj archetypy lub zaimportuj z symulatora
          </p>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 4 — Run Config
// ══════════════════════════════════════════════════════════════════════════════

function Step4Config({
  productContext,
  setProductContext,
  segment,
  setSegment,
  multiRound,
  setMultiRound,
  concurrency,
  setConcurrency,
  selectedCount,
  archetypeCount,
}: {
  productContext: string
  setProductContext: (s: string) => void
  segment: string
  setSegment: (s: string) => void
  multiRound: boolean
  setMultiRound: (v: boolean) => void
  concurrency: number
  setConcurrency: (n: number) => void
  selectedCount: number
  archetypeCount: number
}) {
  const totalCells = selectedCount * archetypeCount
  const round2Est  = Math.round(totalCells * 0.3)
  const totalEst   = totalCells + round2Est

  const timePerCell = 5  // ~5s per cell
  const parallelTime = Math.ceil(totalEst / concurrency) * timePerCell

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Segment */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-2 block">
          Segment docelowy (etykieta do raportu)
        </label>
        <input
          type="text"
          value={segment}
          onChange={e => setSegment(e.target.value)}
          placeholder='np. "Freelancerzy UX, Polska, 5-15 klientów rocznie"'
          className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-lg font-sans outline-none focus:border-[#14B8A6]"
        />
      </div>

      {/* Product context */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-1 block">
          Kontekst produktu{' '}
          <span className="text-slate-300 normal-case tracking-normal font-normal">(opcjonalne)</span>
        </label>
        <p className="text-[11px] text-slate-400 font-sans mb-2">
          Dodaj kontekst specyficzny dla Twojego produktu, który LLM uwzględni przy generowaniu odpowiedzi.
        </p>
        <textarea
          value={productContext}
          onChange={e => setProductContext(e.target.value)}
          rows={3}
          placeholder='np. "Platforma do zarządzania projektami dla freelancerów z integracją z Figma i Notion. Cena: 29 PLN/mc."'
          className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-lg font-sans outline-none focus:border-[#14B8A6] resize-none"
        />
      </div>

      {/* Multi-round */}
      <div className="p-4 rounded-lg border border-[#E2E8F0] bg-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-sm font-sans text-[#0D2535] mb-0.5">
              🔄 Runda 2 — auto follow-upy
            </p>
            <p className="text-xs text-slate-400 font-sans">
              Dla komórek z jakością <em>vague</em> lub <em>polite_lie</em> agent automatycznie
              generuje follow-up i przeprowadza drugą rozmowę. Zwiększa jakość danych o ~30%.
            </p>
            {multiRound && (
              <p className="text-[10px] text-teal-600 font-sans mt-1.5">
                Szac. +{round2Est} komórek w rundzie 2
              </p>
            )}
          </div>
          <button
            role="switch"
            aria-checked={multiRound}
            onClick={() => setMultiRound(!multiRound)}
            className={`shrink-0 w-11 h-6 rounded-full transition-colors ${multiRound ? 'bg-[#14B8A6]' : 'bg-slate-200'}`}
          >
            <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${multiRound ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Concurrency */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-2 block">
          Concurrency (równoległe wywołania LLM)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={8}
            value={concurrency}
            onChange={e => setConcurrency(+e.target.value)}
            className="flex-1 accent-[#14B8A6]"
          />
          <span className="font-mono font-bold text-[#0D2535] w-4 text-center">{concurrency}</span>
        </div>
        <p className="text-[10px] text-slate-400 font-sans mt-1">
          Wyższe wartości = szybciej, ale mogą powodować throttling API.
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-[#0D2535]/5 border border-[#0D2535]/10">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-3">
          Podsumowanie sesji
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pytania',     value: selectedCount },
            { label: 'Archetypy',   value: archetypeCount },
            { label: 'Komórek R1',  value: totalCells },
            { label: 'Est. czas',   value: `~${Math.ceil(parallelTime / 60)}m` },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-mono font-bold text-[#0D2535]">{stat.value}</p>
              <p className="text-[10px] text-slate-400 font-sans">{stat.label}</p>
            </div>
          ))}
        </div>
        {multiRound && (
          <p className="text-[10px] text-slate-400 font-sans text-center mt-2">
            + szac. {round2Est} komórek Runda 2
          </p>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 5 — Execution (SSE streaming)
// ══════════════════════════════════════════════════════════════════════════════

function Step5Execution({
  cells,
  running,
  round2Running,
  round2WeakCount,
  analyzingMessages,
  questions,
  archetypes,
  totalExpected,
}: {
  cells: BatchCell[]
  running: boolean
  round2Running: boolean
  round2WeakCount: number
  analyzingMessages: string[]
  questions: BatchQuestion[]
  archetypes: SyntheticProfile[]
  totalExpected: number
}) {
  const round1Done = cells.filter(c => c.round === 1).length
  const round2Done = cells.filter(c => c.round === 2).length
  const pct = totalExpected > 0 ? Math.round((round1Done / totalExpected) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Status bar */}
      <div className="p-4 rounded-xl bg-[#0D2535] text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {running ? (
              <>
                <svg className="w-4 h-4 animate-spin text-[#14B8A6]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm font-semibold font-sans text-[#14B8A6]">
                  {round2Running ? `Runda 2 — follow-upy (${round2WeakCount} słabych sygnałów)` : 'Runda 1 — wywiad batch'}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} className="text-[#14B8A6]" />
                <span className="text-sm font-semibold font-sans text-[#14B8A6]">Zakończono</span>
              </>
            )}
          </div>
          <span className="text-xs font-mono text-[#8BB5CC]">
            R1: {round1Done}/{totalExpected}{round2Done > 0 ? ` · R2: ${round2Done}` : ''}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#1E3A5F] rounded-full h-2 mb-1">
          <div
            className="h-2 rounded-full bg-[#14B8A6] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-[#8BB5CC] font-mono">{pct}% Runda 1</p>
      </div>

      {/* Analyzing messages */}
      {analyzingMessages.length > 0 && (
        <div className="space-y-1">
          {analyzingMessages.map((msg, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-500 font-sans">
              <CheckCircle2 size={12} className="text-[#14B8A6] shrink-0" />
              {msg}
            </div>
          ))}
        </div>
      )}

      {/* Matrix preview */}
      {cells.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-3">
            Macierz (live)
          </p>
          <BatchMatrix
            questions={questions}
            archetypes={archetypes.map(a => ({ archetype_name: a.archetype_name, demographics: a.demographics }))}
            cells={cells}
            loading={running}
          />
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 6 — Results
// ══════════════════════════════════════════════════════════════════════════════

type ResultTab = 'matrix' | 'insights' | 'forces' | 'questions'

function Step6Results({
  cells,
  insights,
  questions,
  archetypes,
  sessionId,
}: {
  cells: BatchCell[]
  insights: BatchInsights | null
  questions: BatchQuestion[]
  archetypes: SyntheticProfile[]
  sessionId: string | null
}) {
  const [tab, setTab] = useState<ResultTab>('matrix')

  const TABS: Array<{ key: ResultTab; label: string }> = [
    { key: 'matrix',   label: '📊 Macierz' },
    { key: 'insights', label: '🧠 Insights' },
    { key: 'forces',   label: '⚡ Forces' },
    { key: 'questions', label: '🎯 Pytania' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-2 rounded-lg font-sans font-medium transition-all ${
              tab === t.key
                ? 'bg-[#0D2535] text-white'
                : 'bg-white text-slate-500 border border-[#E2E8F0] hover:border-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
        {sessionId && (
          <span className="ml-auto text-[10px] text-slate-400 font-mono self-center">
            ID: {sessionId.slice(0, 8)}
          </span>
        )}
      </div>

      {/* Matrix tab */}
      {tab === 'matrix' && (
        <BatchMatrix
          questions={questions}
          archetypes={archetypes.map(a => ({ archetype_name: a.archetype_name, demographics: a.demographics }))}
          cells={cells}
        />
      )}

      {/* Insights tab */}
      {tab === 'insights' && insights && (
        <BatchInsightPanel insights={insights} />
      )}
      {tab === 'insights' && !insights && (
        <p className="text-sm text-slate-400 font-sans text-center py-8">Brak wyników analizy.</p>
      )}

      {/* Forces tab — same as insights but starts on forces tab */}
      {tab === 'forces' && insights && (
        <div>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-3">
              Forces per archetype
            </p>
          </div>
          <BatchInsightPanel insights={{ ...insights }} />
        </div>
      )}

      {/* Questions tab */}
      {tab === 'questions' && insights && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-3">
            Skuteczność pytań + rekomendacje
          </p>
          <BatchInsightPanel insights={{ ...insights }} />
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function BatchInterview() {
  const {
    batchStep, setBatchStep,
    batchMode, setBatchMode,
    batchSelectedQuestions, setBatchSelectedQuestions,
    batchHypotheses, setBatchHypotheses,
    batchArchetypes, setBatchArchetypes,
    batchProductContext, setBatchProductContext,
    batchSegment, setBatchSegment,
    batchMultiRound, setBatchMultiRound,
    batchConcurrency, setBatchConcurrency,
    batchRunning, setBatchRunning,
    batchSessionId, setBatchSessionId,
    batchCells, addBatchCell, clearBatchCells,
    batchInsights, setBatchInsights,
    batchAnalyzingMessages, addBatchAnalyzingMessage,
    batchRound2Running, setBatchRound2Running,
    batchRound2WeakCount, setBatchRound2WeakCount,
    simulatorArchetypes,
    resetBatch,
  } = useAppStore()

  const abortRef = useRef<AbortController | null>(null)

  // ── Validation per step ────────────────────────────────────────────────────

  const canNext: Record<number, boolean> = {
    1: batchSelectedQuestions.length >= 1,
    2: true,  // Hypotheses optional
    3: batchArchetypes.length >= 1,
    4: batchSegment.trim().length > 0,
    5: !batchRunning,
    6: true,
  }

  // ── Start batch run ────────────────────────────────────────────────────────

  async function startBatch() {
    setBatchRunning(true)
    clearBatchCells()
    setBatchInsights(null)
    setBatchRound2Running(false)
    setBatchRound2WeakCount(0)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const body = {
        segment: batchSegment,
        mode: batchMode,
        questions: batchSelectedQuestions,
        archetypes: batchArchetypes,
        hypotheses: batchHypotheses.length > 0 ? batchHypotheses : undefined,
        multi_round: batchMultiRound,
        concurrency: batchConcurrency,
        product_context: batchProductContext || undefined,
        language: 'pl',
      }

      const res = await fetch('/api/batch/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      const dec = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const parts = buf.split('\n\n')
        buf = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data:')) continue
          const json = line.slice(5).trim()
          if (!json) continue
          try {
            const ev = JSON.parse(json)
            handleSSEEvent(ev)
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Batch run error:', e)
      }
    } finally {
      setBatchRunning(false)
    }
  }

  function handleSSEEvent(ev: Record<string, unknown>) {
    switch (ev.type) {
      case 'start':
        setBatchSessionId(ev.session_id as string)
        break

      case 'cell_done':
        if (ev.data) addBatchCell(ev.data as BatchCell)
        if (ev.round === 2) setBatchRound2Running(true)
        break

      case 'round2_start':
        setBatchRound2Running(true)
        setBatchRound2WeakCount(ev.weak_count as number)
        break

      case 'analyzing':
        addBatchAnalyzingMessage(ev.message as string)
        break

      case 'done':
        setBatchInsights(ev.insights as BatchInsights)
        setBatchRunning(false)
        setBatchStep(6)
        break

      case 'error':
        console.error('Batch error:', ev.message)
        setBatchRunning(false)
        break
    }
  }

  function handleNext() {
    if (batchStep === 4) {
      setBatchStep(5)
      startBatch()
    } else if (batchStep < 6) {
      setBatchStep(batchStep + 1)
    }
  }

  function handleBack() {
    if (batchStep === 5 && batchRunning) {
      abortRef.current?.abort()
      setBatchRunning(false)
    }
    setBatchStep(Math.max(1, batchStep - 1))
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers size={20} className="text-[#14B8A6]" />
            <h1 className="text-xl font-bold font-sans text-[#0D2535]">
              Batch Interview Runner
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-sans">
            Masowe wywiady syntetyczne N pytań × M archetypów z analizą Forces Diagram i Evidence Levels
          </p>
        </div>
        <button
          onClick={resetBatch}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-sans transition-colors"
          title="Reset — nowa sesja"
        >
          <RefreshCw size={13} />
          Reset
        </button>
      </div>

      <StepIndicator current={batchStep} />

      {/* Step content */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        {batchStep === 1 && (
          <>
            <h2 className="text-base font-bold font-sans text-[#0D2535] mb-4">
              1. Dobierz pytania wywiadowe
            </h2>
            <Step1Questions
              selected={batchSelectedQuestions}
              setSelected={setBatchSelectedQuestions}
              mode={batchMode}
              setMode={setBatchMode}
            />
          </>
        )}

        {batchStep === 2 && (
          <>
            <h2 className="text-base font-bold font-sans text-[#0D2535] mb-4">
              2. Hipotezy do weryfikacji{' '}
              <span className="text-slate-400 font-normal text-sm">(opcjonalne)</span>
            </h2>
            <Step2Hypotheses
              hypotheses={batchHypotheses}
              setHypotheses={setBatchHypotheses}
            />
          </>
        )}

        {batchStep === 3 && (
          <>
            <h2 className="text-base font-bold font-sans text-[#0D2535] mb-4">
              3. Konfiguruj archetypy
            </h2>
            <Step3Archetypes
              archetypes={batchArchetypes}
              setArchetypes={setBatchArchetypes}
              simulatorArchetypes={simulatorArchetypes}
            />
          </>
        )}

        {batchStep === 4 && (
          <>
            <h2 className="text-base font-bold font-sans text-[#0D2535] mb-4">
              4. Konfiguracja sesji
            </h2>
            <Step4Config
              productContext={batchProductContext}
              setProductContext={setBatchProductContext}
              segment={batchSegment}
              setSegment={setBatchSegment}
              multiRound={batchMultiRound}
              setMultiRound={setBatchMultiRound}
              concurrency={batchConcurrency}
              setConcurrency={setBatchConcurrency}
              selectedCount={batchSelectedQuestions.length}
              archetypeCount={batchArchetypes.length}
            />
          </>
        )}

        {batchStep === 5 && (
          <>
            <h2 className="text-base font-bold font-sans text-[#0D2535] mb-4">
              5. Wykonanie batch
            </h2>
            <Step5Execution
              cells={batchCells}
              running={batchRunning}
              round2Running={batchRound2Running}
              round2WeakCount={batchRound2WeakCount}
              analyzingMessages={batchAnalyzingMessages}
              questions={batchSelectedQuestions}
              archetypes={batchArchetypes}
              totalExpected={batchSelectedQuestions.length * batchArchetypes.length}
            />
          </>
        )}

        {batchStep === 6 && (
          <>
            <h2 className="text-base font-bold font-sans text-[#0D2535] mb-4">
              6. Wyniki
            </h2>
            <Step6Results
              cells={batchCells}
              insights={batchInsights}
              questions={batchSelectedQuestions}
              archetypes={batchArchetypes}
              sessionId={batchSessionId}
            />
          </>
        )}

        {/* Navigation */}
        {batchStep !== 5 && (
          <NavButtons
            step={batchStep}
            canNext={canNext[batchStep] ?? true}
            onBack={handleBack}
            onNext={handleNext}
            nextLabel={batchStep === 4 ? '🚀 Uruchom batch' : undefined}
          />
        )}

        {/* Step 5: running nav */}
        {batchStep === 5 && batchRunning && (
          <div className="flex justify-between pt-6 mt-6 border-t border-[#E2E8F0]">
            <button
              onClick={() => { abortRef.current?.abort(); setBatchRunning(false) }}
              className="text-sm px-5 py-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 font-sans transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle size={14} />
              Przerwij
            </button>
            <p className="text-xs text-slate-400 font-sans self-center">
              Nie zamykaj okna — wyniki strumieniują się na bieżąco
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

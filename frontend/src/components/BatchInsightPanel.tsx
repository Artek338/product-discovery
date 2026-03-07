/**
 * BatchInsightPanel — panel z wynikami analizy batch interview.
 * 5 zakładek: Consensus | Divergence | Pain & WTP | Forces | Pytania
 */
import { useState } from 'react'
import type {
  BatchInsights,
  ConsensusSignal,
  DivergenceAlert,
  ForcesPerArchetype,
  HypothesisResult,
  PainRanking,
  QuestionEffectiveness,
  WTPSignal,
} from '../types/discovery'
import { FORCES_DIMS } from '../lib/questionBank'

// ── Verdict config ─────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  HIGH_CONFIDENCE_GO:  { label: 'HIGH CONFIDENCE GO',  color: '#059669', bg: '#D1FAE5', emoji: '🚀' },
  CAUTIOUS_GO:         { label: 'CAUTIOUS GO',          color: '#0284C7', bg: '#E0F2FE', emoji: '✅' },
  NEEDS_MORE_DATA:     { label: 'NEEDS MORE DATA',      color: '#D97706', bg: '#FEF3C7', emoji: '⚠️' },
  RESET_DISCOVERY:     { label: 'RESET DISCOVERY',      color: '#DC2626', bg: '#FEE2E2', emoji: '🔴' },
}

// ── Switch likelihood ──────────────────────────────────────────────────────────

const SWITCH_CONFIG: Record<string, { color: string; label: string }> = {
  HIGH:   { color: '#10B981', label: 'Wysokie' },
  MEDIUM: { color: '#F59E0B', label: 'Średnie' },
  LOW:    { color: '#EF4444', label: 'Niskie' },
}

// ── Score bar ──────────────────────────────────────────────────────────────────

function ScoreBar({ value, max = 100, color = '#14B8A6' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

// ── Quality score card ─────────────────────────────────────────────────────────

function QualityCard({ insights }: { insights: BatchInsights }) {
  const v = VERDICT_CONFIG[insights.quality_verdict] ?? VERDICT_CONFIG.NEEDS_MORE_DATA

  return (
    <div className="rounded-xl border overflow-hidden mb-5" style={{ borderColor: v.color + '40' }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ background: v.bg }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{v.emoji}</span>
          <div>
            <p className="font-bold text-sm font-sans" style={{ color: v.color }}>{v.label}</p>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Jakość danych: <strong>{insights.quality_score}/100</strong>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold" style={{ color: v.color }}>
            {insights.quality_score}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">/ 100</div>
        </div>
      </div>
      <div className="px-5 py-4 bg-white">
        <p className="text-sm font-sans text-[#0D2535] leading-relaxed">
          {insights.executive_summary}
        </p>
      </div>
    </div>
  )
}

// ── Consensus tab ──────────────────────────────────────────────────────────────

const AGREEMENT_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  strong:   { color: '#059669', bg: '#D1FAE5', label: 'Silny' },
  moderate: { color: '#0284C7', bg: '#DBEAFE', label: 'Umiarkowany' },
  weak:     { color: '#D97706', bg: '#FEF3C7', label: 'Słaby' },
}

function ConsensusTab({ signals }: { signals: ConsensusSignal[] }) {
  if (!signals.length) {
    return <p className="text-sm text-slate-400 font-sans text-center py-8">Brak sygnałów consensus.</p>
  }

  return (
    <div className="space-y-3">
      {signals.map((s, i) => {
        const cfg = AGREEMENT_CONFIG[s.agreement_level] ?? AGREEMENT_CONFIG.weak
        return (
          <div key={i} className="rounded-lg border border-[#E2E8F0] p-4 bg-white">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-semibold text-sm font-sans text-[#0D2535]">{s.topic}</p>
              <div className="flex items-center gap-2 shrink-0">
                {s.forces_dimension && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: (FORCES_DIMS[s.forces_dimension as keyof typeof FORCES_DIMS]?.color ?? '#999') + '20',
                      color: FORCES_DIMS[s.forces_dimension as keyof typeof FORCES_DIMS]?.color ?? '#999',
                    }}>
                    {s.forces_dimension}
                  </span>
                )}
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full font-sans"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label} ({s.archetypes_count} arch.)
                </span>
              </div>
            </div>
            {s.evidence_quotes.length > 0 && (
              <div className="space-y-1 mt-2">
                {s.evidence_quotes.map((q, qi) => (
                  <blockquote key={qi} className="text-xs font-sans text-slate-500 pl-3 border-l-2 border-slate-200 italic">
                    {q}
                  </blockquote>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Divergence tab ─────────────────────────────────────────────────────────────

function DivergenceTab({ alerts }: { alerts: DivergenceAlert[] }) {
  if (!alerts.length) {
    return (
      <div className="text-center py-8">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-sm text-slate-400 font-sans">Brak znaczących rozbieżności — segmenty są spójne.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((a, i) => (
        <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <div>
              <p className="font-semibold text-sm font-sans text-amber-900">{a.topic}</p>
              <div className="flex gap-1 flex-wrap mt-1">
                {a.segments.map((seg, si) => (
                  <span key={si} className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-sans">
                    {seg}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs font-sans text-slate-600 ml-7 mb-1">
            <span className="font-semibold text-slate-500">Pytanie: </span>
            {a.question_text}
          </p>
          <p className="text-xs font-sans text-amber-800 ml-7 italic">
            💡 {a.segmentation_implication}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Pain & WTP tab ─────────────────────────────────────────────────────────────

const EVIDENCE_COLOR: Record<string, string> = {
  '5_Cash':            '#8B5CF6',
  '4_Financial':       '#EF4444',
  '3_Time_Commitment': '#F59E0B',
  '2_Past_Behavior':   '#10B981',
  '1_Preference':      '#3B82F6',
  '0_Opinion':         '#9CA3AF',
}

function PainWTPTab({ pains, wtp }: { pains: PainRanking[]; wtp: WTPSignal[] }) {
  return (
    <div className="space-y-6">
      {/* Pain ranking */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-3">
          Ranking bólu (wg częstotliwości)
        </h4>
        <div className="space-y-2">
          {pains.map((p, i) => (
            <div key={i} className="rounded-lg border border-[#E2E8F0] bg-white p-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-[#0D2535] w-5 text-center">{i + 1}</span>
                  <p className="text-sm font-sans text-[#0D2535]">{p.pain}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: (EVIDENCE_COLOR[p.evidence_level] ?? '#999') + '20', color: EVIDENCE_COLOR[p.evidence_level] ?? '#999' }}>
                    {p.evidence_level.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{p.frequency}×</span>
                </div>
              </div>
              <ScoreBar value={p.frequency} max={10} color={EVIDENCE_COLOR[p.evidence_level] ?? '#14B8A6'} />
              <p className="text-[10px] text-slate-400 font-sans mt-1">
                {p.archetypes_affected.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* WTP signals */}
      {wtp.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-sans mb-3">
            Gotowość do płacenia (WTP)
          </h4>
          <div className="space-y-2">
            {wtp.map((w, i) => (
              <div key={i} className={`rounded-lg border p-3 ${w.willing_to_pay ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold font-sans text-[#0D2535]">{w.archetype_name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-sans ${w.willing_to_pay ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {w.willing_to_pay ? '✅ WTP' : '❌ No WTP'}
                  </span>
                </div>
                {w.price_point && (
                  <p className="text-sm font-mono font-bold text-purple-600">{w.price_point}</p>
                )}
                {w.conditions && (
                  <p className="text-xs text-slate-500 font-sans mt-1">{w.conditions}</p>
                )}
                {w.van_westendorp && Object.keys(w.van_westendorp).length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {Object.entries(w.van_westendorp).map(([k, v]) => (
                      <div key={k} className="text-[10px] font-sans">
                        <span className="text-slate-400">{k}: </span>
                        <span className="font-semibold text-slate-600">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Forces tab ─────────────────────────────────────────────────────────────────

function ForcesTab({ forces }: { forces: ForcesPerArchetype[] }) {
  const [active, setActive] = useState(0)

  if (!forces.length) {
    return <p className="text-sm text-slate-400 font-sans text-center py-8">Brak danych Forces.</p>
  }

  const arch = forces[active]
  const sw = SWITCH_CONFIG[arch.switch_likelihood] ?? SWITCH_CONFIG.LOW

  const dims: Array<{ key: keyof typeof arch; label: string; color: string }> = [
    { key: 'push',    label: 'Push',    color: '#EF4444' },
    { key: 'pull',    label: 'Pull',    color: '#10B981' },
    { key: 'anxiety', label: 'Anxiety', color: '#F59E0B' },
    { key: 'habit',   label: 'Habit',   color: '#6B7280' },
  ]

  return (
    <div>
      {/* Archetype tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {forces.map((f, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`text-xs px-3 py-1.5 rounded-full border font-sans transition-all ${
              active === i
                ? 'bg-[#0D2535] text-white border-[#0D2535]'
                : 'bg-white text-slate-600 border-[#E2E8F0] hover:border-[#0D2535]'
            }`}
          >
            {f.archetype_name.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      {/* Switch likelihood */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ background: sw.color + '15' }}>
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: sw.color }} />
        <div>
          <p className="text-xs font-semibold font-sans" style={{ color: sw.color }}>
            Switch Likelihood: {sw.label}
          </p>
          {arch.trigger_event && (
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Trigger: {arch.trigger_event}
            </p>
          )}
        </div>
      </div>

      {/* Force bars */}
      <div className="space-y-4">
        {dims.map(({ key, label, color }) => {
          const signal = arch[key] as { score: number; evidence_quotes: string[] }
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold font-sans" style={{ color }}>
                  {label}
                </span>
                <span className="text-xs font-mono font-bold" style={{ color }}>
                  {signal.score}/10
                </span>
              </div>
              <ScoreBar value={signal.score} max={10} color={color} />
              {signal.evidence_quotes.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {signal.evidence_quotes.map((q, qi) => (
                    <blockquote key={qi} className="text-[11px] text-slate-500 font-sans pl-3 border-l-2 italic"
                      style={{ borderColor: color + '60' }}>
                      {q}
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Questions effectiveness tab ────────────────────────────────────────────────

const REC_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  keep:    { label: 'Zachowaj',  color: '#059669', bg: '#D1FAE5' },
  improve: { label: 'Popraw',    color: '#D97706', bg: '#FEF3C7' },
  replace: { label: 'Zastąp',   color: '#DC2626', bg: '#FEE2E2' },
}

function QuestionsTab({ questions }: { questions: QuestionEffectiveness[] }) {
  const sorted = [...questions].sort((a, b) => b.signal_score - a.signal_score)

  return (
    <div className="space-y-3">
      {sorted.map((q, i) => {
        const rec = REC_CONFIG[q.recommendation] ?? REC_CONFIG.improve
        return (
          <div key={i} className="rounded-lg border border-[#E2E8F0] bg-white p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-slate-400 mt-0.5 shrink-0">{q.question_id}</span>
                <p className="text-xs font-sans text-[#0D2535] leading-snug">{q.question_text}</p>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 font-sans"
                style={{ background: rec.bg, color: rec.color }}
              >
                {rec.label}
              </span>
            </div>

            {/* Score + distribution */}
            <div className="flex items-center gap-3 mb-2">
              <ScoreBar value={q.signal_score} max={10} color={rec.color} />
              <span className="text-xs font-mono font-bold shrink-0" style={{ color: rec.color }}>
                {q.signal_score}/10
              </span>
            </div>

            {/* Quality distribution chips */}
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(q.quality_distribution).map(([k, v]) => {
                const colors: Record<string, string> = {
                  detailed: 'bg-blue-50 text-blue-600',
                  genuine:  'bg-green-50 text-green-600',
                  vague:    'bg-yellow-50 text-yellow-600',
                  polite_lie: 'bg-red-50 text-red-600',
                }
                return (
                  <span key={k} className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${colors[k] ?? 'bg-slate-50 text-slate-500'}`}>
                    {k}: {v}
                  </span>
                )
              })}
            </div>

            {/* Improved variant */}
            {q.improved_variant && (
              <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-100">
                <p className="text-[10px] font-semibold text-amber-600 mb-0.5 font-sans">💡 Lepsza wersja:</p>
                <p className="text-xs text-amber-800 font-sans italic">{q.improved_variant}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Hypothesis results ─────────────────────────────────────────────────────────

const HYP_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  validated:    { label: 'Potwierdzona',     color: '#059669', bg: '#D1FAE5', emoji: '✅' },
  invalidated:  { label: 'Obalona',          color: '#DC2626', bg: '#FEE2E2', emoji: '❌' },
  inconclusive: { label: 'Niejednoznaczna',  color: '#D97706', bg: '#FEF3C7', emoji: '⚠️' },
}

function HypothesisTab({ results }: { results: HypothesisResult[] }) {
  if (!results.length) {
    return <p className="text-sm text-slate-400 font-sans text-center py-8">Brak hipotez do weryfikacji.</p>
  }

  return (
    <div className="space-y-3">
      {results.map((h, i) => {
        const cfg = HYP_CONFIG[h.status] ?? HYP_CONFIG.inconclusive
        return (
          <div key={i} className="rounded-lg border p-4" style={{ borderColor: cfg.color + '40', background: cfg.bg + '40' }}>
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">{cfg.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm font-sans text-[#0D2535]">{h.hypothesis_text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-sans font-semibold" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    Pewność: {h.confidence}%
                  </span>
                </div>
              </div>
            </div>
            <ScoreBar value={h.confidence} max={100} color={cfg.color} />
            {h.evidence_quotes.length > 0 && (
              <div className="mt-2 space-y-1">
                {h.evidence_quotes.map((q, qi) => (
                  <blockquote key={qi} className="text-xs text-slate-500 font-sans pl-3 border-l-2 italic"
                    style={{ borderColor: cfg.color + '60' }}>
                    {q}
                  </blockquote>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface BatchInsightPanelProps {
  insights: BatchInsights
}

type TabKey = 'consensus' | 'divergence' | 'pain_wtp' | 'forces' | 'questions' | 'hypotheses'

export default function BatchInsightPanel({ insights }: BatchInsightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('consensus')

  const hasHypotheses = (insights.hypothesis_results?.length ?? 0) > 0

  const TABS: Array<{ key: TabKey; label: string; count?: number }> = [
    { key: 'consensus',    label: 'Consensus',   count: insights.consensus_signals.length },
    { key: 'divergence',   label: 'Divergence',  count: insights.divergence_alerts.length },
    { key: 'pain_wtp',     label: 'Pain & WTP',  count: insights.pain_ranking.length },
    { key: 'forces',       label: 'Forces',      count: insights.forces_per_archetype.length },
    { key: 'questions',    label: 'Pytania',      count: insights.question_effectiveness.length },
    ...(hasHypotheses
      ? [{ key: 'hypotheses' as TabKey, label: 'Hipotezy', count: insights.hypothesis_results?.length }]
      : []),
  ]

  return (
    <div>
      {/* Quality card */}
      <QualityCard insights={insights} />

      {/* Next questions recommended */}
      {insights.recommended_next_questions.length > 0 && (
        <div className="mb-5 p-4 rounded-lg bg-[#0D2535]/5 border border-[#0D2535]/10">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2 font-sans">
            🎯 Rekomendowane następne pytania
          </p>
          <ul className="space-y-1.5">
            {insights.recommended_next_questions.map((q, i) => (
              <li key={i} className="text-xs text-[#0D2535] font-sans flex items-start gap-1.5">
                <span className="text-teal-500 mt-0.5 shrink-0">→</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Segmentation hypothesis */}
      {insights.segmentation_hypothesis && (
        <div className="mb-5 p-4 rounded-lg bg-purple-50 border border-purple-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-400 mb-1.5 font-sans">
            🧩 Hipoteza segmentacji
          </p>
          <p className="text-sm text-purple-800 font-sans leading-relaxed">
            {insights.segmentation_hypothesis}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap border-b border-[#E2E8F0] pb-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs font-sans font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-[#14B8A6] text-[#0D2535]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-[#14B8A6]/20 text-teal-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-2">
        {activeTab === 'consensus'  && <ConsensusTab signals={insights.consensus_signals} />}
        {activeTab === 'divergence' && <DivergenceTab alerts={insights.divergence_alerts} />}
        {activeTab === 'pain_wtp'   && <PainWTPTab pains={insights.pain_ranking} wtp={insights.wtp_signals} />}
        {activeTab === 'forces'     && <ForcesTab forces={insights.forces_per_archetype} />}
        {activeTab === 'questions'  && <QuestionsTab questions={insights.question_effectiveness} />}
        {activeTab === 'hypotheses' && <HypothesisTab results={insights.hypothesis_results ?? []} />}
      </div>
    </div>
  )
}

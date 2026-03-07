/**
 * BatchMatrix — interaktywna macierz N pytań × M archetypów
 * z jakościowymi oznaczeniami komórek i panelem bocznym szczegółów.
 */
import { useState } from 'react'
import { X, ChevronRight, Brain, MessageSquare, RotateCcw } from 'lucide-react'

export type ResponseQuality = 'genuine' | 'polite_lie' | 'vague' | 'detailed'

export interface BatchQuestion {
  id: string
  text: string
  category: string
  forces_dimension?: string
  evidence_level_target: string
  hypothesis_id?: string
}

export interface BatchCell {
  q_idx: number
  a_idx: number
  question_id: string
  archetype_name: string
  response: string
  response_quality: ResponseQuality
  hidden_thought: string
  follow_up_suggested: string
  round: number
  follow_up_for?: number
}

export interface ArchetypeBasic {
  archetype_name: string
  demographics?: string
}

// ── Stałe jakości ─────────────────────────────────────────────────────────────

const QUALITY_CONFIG: Record<ResponseQuality, {
  emoji: string
  label: string
  bg: string
  border: string
  text: string
}> = {
  detailed:   { emoji: '💎', label: 'Szczegółowa', bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800' },
  genuine:    { emoji: '✅', label: 'Szczera',     bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800' },
  vague:      { emoji: '⚠️', label: 'Niejasna',   bg: 'bg-yellow-50', border: 'border-yellow-200',text: 'text-yellow-800' },
  polite_lie: { emoji: '🚩', label: 'Social Desirability', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
}

type FilterType = 'all' | 'detailed' | 'polite_lie' | 'round2'

// ── Helpers ────────────────────────────────────────────────────────────────────

function getConsensusColor(cells: BatchCell[], qIdx: number): string {
  const rowCells = cells.filter(c => c.q_idx === qIdx && c.round === 1)
  if (rowCells.length === 0) return 'bg-slate-100'
  const positives = rowCells.filter(c => c.response_quality === 'genuine' || c.response_quality === 'detailed').length
  const ratio = positives / rowCells.length
  if (ratio >= 0.75) return 'bg-green-400'
  if (ratio >= 0.5)  return 'bg-yellow-400'
  return 'bg-red-400'
}

function truncate(text: string, len = 80) {
  return text.length > len ? text.slice(0, len) + '…' : text
}

// ── Side Panel ─────────────────────────────────────────────────────────────────

interface SidePanelProps {
  cell: BatchCell
  question: BatchQuestion
  onClose: () => void
}

function CellSidePanel({ cell, question, onClose }: SidePanelProps) {
  const q = QUALITY_CONFIG[cell.response_quality]

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col bg-white shadow-2xl border-l border-[#E2E8F0]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${q.bg} ${q.text}`}>
              {q.emoji} {q.label}
            </span>
            {cell.round === 2 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                <RotateCcw size={10} /> Runda 2
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            {cell.archetype_name} · {question.id}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Zamknij panel"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Pytanie */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5 font-sans">
            Pytanie ({question.category})
          </p>
          <p className="text-sm font-sans text-[#0D2535] leading-relaxed">
            {question.text}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
              {question.evidence_level_target}
            </span>
            {question.forces_dimension && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-600 font-mono">
                {question.forces_dimension}
              </span>
            )}
          </div>
        </div>

        {/* Odpowiedź */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare size={12} className="text-slate-400" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 font-sans">
              Odpowiedź
            </p>
          </div>
          <div className={`rounded-lg p-3 border text-sm font-sans leading-relaxed ${q.bg} ${q.border}`}>
            {cell.response}
          </div>
        </div>

        {/* Ukryta myśl */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Brain size={12} className="text-purple-400" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-400 font-sans">
              Ukryta myśl
            </p>
          </div>
          <div className="rounded-lg p-3 bg-purple-50 border border-purple-100 text-sm font-sans text-purple-800 leading-relaxed italic">
            {cell.hidden_thought}
          </div>
        </div>

        {/* Follow-up */}
        {cell.follow_up_suggested && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ChevronRight size={12} className="text-teal-400" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 font-sans">
                Idealny follow-up
              </p>
            </div>
            <div className="rounded-lg p-3 bg-teal-50 border border-teal-100 text-sm font-sans text-teal-800 leading-relaxed">
              {cell.follow_up_suggested}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Loading cell ───────────────────────────────────────────────────────────────

function LoadingCell() {
  return (
    <div className="flex items-center justify-center h-14 w-full">
      <svg className="w-4 h-4 animate-spin text-slate-300" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  )
}

// ── Matrix Cell ────────────────────────────────────────────────────────────────

interface MatrixCellProps {
  cell: BatchCell | undefined
  onClick: (cell: BatchCell) => void
}

function MatrixCell({ cell, onClick }: MatrixCellProps) {
  if (!cell) return (
    <td className="border border-slate-100 p-0 w-40 min-w-[10rem] align-middle">
      <LoadingCell />
    </td>
  )

  const q = QUALITY_CONFIG[cell.response_quality]

  return (
    <td
      className={`border border-slate-100 p-0 w-40 min-w-[10rem] align-top cursor-pointer hover:opacity-90 transition-opacity ${q.bg}`}
      onClick={() => onClick(cell)}
    >
      <div className="p-2">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-sm">{q.emoji}</span>
          {cell.round === 2 && (
            <span className="text-[9px] bg-purple-100 text-purple-600 px-1 rounded font-mono">R2</span>
          )}
        </div>
        <p className="text-[11px] font-sans text-slate-600 leading-snug line-clamp-3">
          {truncate(cell.response, 90)}
        </p>
      </div>
    </td>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface BatchMatrixProps {
  questions: BatchQuestion[]
  archetypes: ArchetypeBasic[]
  cells: BatchCell[]
  loading?: boolean
}

export default function BatchMatrix({ questions, archetypes, cells, loading = false }: BatchMatrixProps) {
  const [selectedCell, setSelectedCell] = useState<BatchCell | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  // ── Filter logic ──────────────────────────────────────────────────────────────

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all',         label: 'Wszystkie' },
    { key: 'detailed',    label: '💎 Szczegółowe' },
    { key: 'polite_lie',  label: '🚩 Polite lies' },
    { key: 'round2',      label: '↩ Runda 2' },
  ]

  const visibleQuestions = filter === 'all' ? questions : questions.filter((_q, qi) => {
    const rowCells = cells.filter(c => c.q_idx === qi)
    if (filter === 'round2') return rowCells.some(c => c.round === 2)
    return rowCells.some(c => c.response_quality === filter)
  })

  // ── Cell lookup ───────────────────────────────────────────────────────────────

  const getCellForSlot = (qIdx: number, aIdx: number): BatchCell | undefined => {
    return cells.find(c => c.q_idx === qIdx && c.a_idx === aIdx && c.round === 1)
  }

  const selectedQuestion = selectedCell
    ? questions.find((_q, qi) => qi === selectedCell.q_idx)
    : null

  return (
    <div className="relative">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-full border font-sans transition-all ${
              filter === f.key
                ? 'bg-[#0D2535] text-white border-[#0D2535]'
                : 'bg-white text-slate-600 border-[#E2E8F0] hover:border-[#0D2535]'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 font-sans">
          {cells.filter(c => c.round === 1).length} / {questions.length * archetypes.length} komórek
        </span>
      </div>

      {/* Scrollable table wrapper */}
      <div className="overflow-auto rounded-lg border border-[#E2E8F0] shadow-sm">
        <table className="border-collapse text-xs font-sans" style={{ minWidth: '600px' }}>
          <thead className="sticky top-0 z-10">
            <tr>
              {/* Empty corner */}
              <th className="sticky left-0 z-20 bg-[#0D2535] text-[#8BB5CC] text-left p-3 w-48 min-w-[12rem] font-semibold border-b border-[#1E3A5F]">
                Pytanie
              </th>
              {archetypes.map((arch, ai) => (
                <th
                  key={ai}
                  className="bg-[#0D2535] text-white text-center p-2 min-w-[10rem] font-medium border-b border-[#1E3A5F]"
                >
                  <div className="font-semibold text-[#14B8A6] truncate" title={arch.archetype_name}>
                    {arch.archetype_name}
                  </div>
                  {arch.demographics && (
                    <div className="text-[#8BB5CC] text-[10px] font-normal mt-0.5 truncate" title={arch.demographics}>
                      {arch.demographics.slice(0, 40)}
                    </div>
                  )}
                </th>
              ))}
              {/* Consensus col */}
              <th className="bg-[#0D2535] text-[#8BB5CC] text-center p-2 min-w-[5rem] border-b border-[#1E3A5F] text-[10px] font-semibold uppercase tracking-wider">
                Consensus
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleQuestions.map((q, visIdx) => {
              const qi = questions.indexOf(q)
              const consensusColor = getConsensusColor(cells, qi)

              return (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                  {/* Question label */}
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 border border-slate-100 p-2 align-top transition-colors">
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400 mt-0.5 shrink-0">{q.id}</span>
                      <div>
                        <p className="text-[11px] text-[#0D2535] leading-snug line-clamp-3" title={q.text}>
                          {q.text}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {q.forces_dimension && (
                            <span className="text-[9px] px-1 bg-teal-50 text-teal-600 rounded font-mono">
                              {q.forces_dimension}
                            </span>
                          )}
                          <span className="text-[9px] px-1 bg-slate-100 text-slate-400 rounded font-mono">
                            {q.evidence_level_target.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cells per archetype */}
                  {archetypes.map((_arch, ai) => (
                    <MatrixCell
                      key={ai}
                      cell={getCellForSlot(qi, ai)}
                      onClick={setSelectedCell}
                    />
                  ))}

                  {/* Consensus bar */}
                  <td className="border border-slate-100 p-2 align-middle">
                    <div className="flex items-center justify-center">
                      <div className={`w-3 h-10 rounded-full ${consensusColor}`} title="Consensus" />
                    </div>
                  </td>
                </tr>
              )
            })}

            {/* Loading placeholder rows */}
            {loading && visibleQuestions.length === 0 && (
              Array.from({ length: 3 }).map((_, ri) => (
                <tr key={`skeleton-${ri}`}>
                  <td className="sticky left-0 z-10 bg-white border border-slate-100 p-2">
                    <div className="h-4 bg-slate-200 animate-pulse rounded w-32" />
                  </td>
                  {archetypes.map((_a, ai) => (
                    <td key={ai} className="border border-slate-100 p-2">
                      <LoadingCell />
                    </td>
                  ))}
                  <td className="border border-slate-100 p-2" />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Side Panel */}
      {selectedCell && selectedQuestion && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setSelectedCell(null)}
          />
          <CellSidePanel
            cell={selectedCell}
            question={selectedQuestion}
            onClose={() => setSelectedCell(null)}
          />
        </>
      )}
    </div>
  )
}

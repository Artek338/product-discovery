import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import type { SyntheticProfile } from '../types/discovery'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'
import ArchetypeCard from '../components/ArchetypeCard'
import SimulatorChat from '../components/SimulatorChat'
import { Check, ChevronRight } from 'lucide-react'

type Step = 'input' | 'archetypes' | 'chat'

export default function Simulator() {
  const [step, setStep] = useState<Step>('input')
  const [segment, setSegment] = useState('')
  const [archetypeCount, setArchetypeCount] = useState(4)
  const [marketType, setMarketType] = useState('Mixed')
  const [loading, setLoading] = useState(false)
  const [loaderMessage, setLoaderMessage] = useState('')
  const [loaderProgress, setLoaderProgress] = useState(0)
  const [error, setError] = useState('')

  const {
    language,
    simulatorArchetypes, setSimulatorArchetypes,
    selectedArchetype, setSelectedArchetype,
    chatHistory, addMessage, clearChat,
  } = useAppStore()

  const isPl = language === 'pl'
  const STEPS = [
    { id: 'input', label: t(language, 'sim_step1_label'), sub: isPl ? 'Segment użytkowników' : 'User segment' },
    { id: 'archetypes', label: t(language, 'sim_step2_label'), sub: isPl ? 'Wybierz archetyp' : 'Pick archetype' },
    { id: 'chat', label: t(language, 'sim_step3_label'), sub: isPl ? 'Symuluj wywiad' : 'Run interview' },
  ]

  const handleGenerateArchetypes = useCallback(async () => {
    if (!segment.trim()) return
    setLoading(true)
    setLoaderMessage(isPl ? 'Inicjalizacja...' : 'Initializing...')
    setLoaderProgress(0)
    setError('')
    setSimulatorArchetypes([])

    try {
      const res = await fetch('/api/simulator/archetypes/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment: segment.trim(), count: archetypeCount, market_type: marketType }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const collected: SyntheticProfile[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // SSE: split on double newlines
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'start') {
              setLoaderMessage(isPl
                ? `Analizuj\u0119 segment: ${event.segment}...`
                : `Analyzing segment: ${event.segment}...`)
            } else if (event.type === 'progress') {
              setLoaderMessage(event.message)
              setLoaderProgress(Math.round(((event.step - 1) / event.total) * 90))
            } else if (event.type === 'archetype') {
              const arch = event.data as SyntheticProfile
              collected.push(arch)
              setSimulatorArchetypes([...collected])
              setLoaderProgress(Math.round((event.step / event.total) * 95))
              setLoaderMessage(isPl
                ? `Archetyp ${event.step}/${event.total} gotowy: ${event.archetype_name}`
                : `Archetype ${event.step}/${event.total} ready: ${event.archetype_name}`)
            } else if (event.type === 'error') {
              console.warn('Stream error event:', event.message)
            } else if (event.type === 'done') {
              setLoaderProgress(100)
            }
          } catch {
            // malformed JSON chunk — ignore
          }
        }
      }

      if (collected.length > 0) {
        setStep('archetypes')
      } else {
        setError(isPl ? 'Nie udalo sie wygenerowac zadnego archetypu.' : 'Failed to generate any archetype.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'B\u0142\u0105d generowania archetyp\u00f3w')
    } finally {
      setLoading(false)
      setLoaderProgress(0)
      setLoaderMessage('')
    }
  }, [segment, archetypeCount, marketType, isPl, setSimulatorArchetypes])

  const handleSelectArchetype = (idx: number) => {
    setSelectedArchetype(simulatorArchetypes[idx])
    clearChat()
    setStep('chat')
  }

  const handleBackToArchetypes = () => {
    setStep('archetypes')
    setSelectedArchetype(null)
    clearChat()
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === step)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-sans font-semibold text-[#0D2535] dark:text-slate-100 mb-2">
          {t(language, 'sim_title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-sans text-sm max-w-2xl">
          {t(language, 'sim_desc')}
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-10">
        <div className="flex items-start">
          {STEPS.map((s, idx) => {
            const isCompleted = currentStepIndex > idx
            const isCurrent = currentStepIndex === idx
            const isLast = idx === STEPS.length - 1

            return (
              <div key={s.id} className="flex items-start flex-1 last:flex-none">
                {/* Step node */}
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 ${isCompleted
                      ? 'bg-[#14B8A6] border-[#14B8A6] text-white shadow-md shadow-teal-500/20'
                      : isCurrent
                        ? 'bg-white dark:bg-[#1A1A1A] border-[#14B8A6] text-[#14B8A6] shadow-md shadow-teal-500/20'
                        : 'bg-white dark:bg-[#1A1A1A] border-[#CBD5E1] dark:border-[#444] text-slate-400 dark:text-slate-500'
                      }`}
                  >
                    {isCompleted
                      ? <Check size={18} strokeWidth={3} />
                      : <span className="font-mono text-sm">{String(idx + 1).padStart(2, '0')}</span>
                    }
                  </div>

                  {/* Labels below circle */}
                  <div className="mt-3 text-center max-w-[100px]">
                    <p className={`text-xs font-semibold font-sans leading-tight ${isCurrent || isCompleted ? 'text-[#0D2535] dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                      {s.label}
                    </p>
                    <p className="text-[11px] font-sans text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                      {s.sub}
                    </p>
                  </div>
                </div>

                {/* Connector line (between steps, not after last) */}
                {!isLast && (
                  <div className="flex-1 mt-5 mx-3 relative h-0.5">
                    {/* Background track */}
                    <div className="absolute inset-0 bg-[#E2E8F0] dark:bg-[#333333] rounded-full" />
                    {/* Filled portion */}
                    <div
                      className="absolute inset-y-0 left-0 bg-[#14B8A6] rounded-full transition-all duration-300"
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Krok 1: Segment — loader lub formularz */}
      {step === 'input' && (
        loading ? (
          /* ===== LOADER KARUZELA ===== */
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-10 shadow-sm border border-[#E2E8F0] dark:border-[#333333] max-w-2xl mx-auto transition-colors">
            {/* Spinning ring */}
            <div className="flex justify-center mb-8">
              <div className="relative w-20 h-20">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full border-4 border-[#14B8A6]/20" />
                {/* Spinning arc */}
                <svg className="absolute inset-0 w-full h-full animate-spin" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="36" stroke="url(#tealGrad)" strokeWidth="4"
                    strokeLinecap="round" strokeDasharray="140 86" />
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#14B8A6" />
                      <stop offset="1" stopColor="#0D9488" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Emoji center */}
                <div className="absolute inset-0 flex items-center justify-center text-2xl select-none">
                  ⚡
                </div>
              </div>
            </div>

            {/* Title */}
            <p className="text-center font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base mb-2">
              {isPl ? 'Generowanie archetypów…' : 'Generating archetypes…'}
            </p>

            {/* Live SSE message */}
            <div className="min-h-[52px] flex items-center justify-center mb-6">
              <p
                key={loaderMessage}
                className="text-sm font-sans text-slate-500 dark:text-slate-400 text-center max-w-sm leading-relaxed"
                style={{ animation: 'fadeInUp 0.4s ease forwards' }}
              >
                {loaderMessage}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#E2E8F0] dark:bg-[#333333] rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loaderProgress}%` }}
              />
            </div>

            {/* Context pills */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-[#F0FDF4] dark:bg-teal-950/30 text-[#14B8A6] text-[11px] font-semibold font-sans px-3 py-1 rounded-full border border-[#14B8A6]/20">
                <span>🎯</span> {marketType}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-[#222222] text-slate-500 dark:text-slate-400 text-[11px] font-semibold font-sans px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#333333]">
                <span>👥</span> {archetypeCount} {isPl ? 'archetypy' : 'archetypes'}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-[#222222] text-slate-500 dark:text-slate-400 text-[11px] font-semibold font-sans px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#333333]">
                <span>⏱</span> ≈{archetypeCount * 8}s
              </span>
            </div>

            {/* Inline keyframes */}
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </div>
        ) : (
          /* ===== FORMULARZ ===== */
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 shadow-sm border border-[#E2E8F0] dark:border-[#333333] max-w-2xl mx-auto transition-colors">
            <h2 className="font-sans font-semibold text-lg text-[#0D2535] dark:text-slate-100 mb-6">
              {t(language, 'sim_step1_title')}
            </h2>
            <textarea
              value={segment}
              onChange={e => setSegment(e.target.value)}
              rows={4}
              placeholder={t(language, 'sim_step1_ph')}
              className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-xl px-4 py-3 text-[#0D2535] dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all font-sans resize-none mb-6"
            />

            {/* Market type */}
            <div className="mb-5">
              <label className="block text-xs font-semibold font-sans text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                {isPl ? 'Typ rynku' : 'Market type'}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['B2C', 'B2B', 'SaaS', 'Enterprise', 'Mixed'] as const).map(mt => (
                  <button
                    key={mt}
                    onClick={() => setMarketType(mt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all border ${marketType === mt
                      ? 'bg-[#14B8A6] border-[#14B8A6] text-white shadow-sm'
                      : 'bg-white dark:bg-[#111111] border-[#E2E8F0] dark:border-[#333333] text-slate-500 dark:text-slate-400 hover:border-[#14B8A6] hover:text-[#14B8A6]'
                      }`}
                  >
                    {mt}
                  </button>
                ))}
              </div>
            </div>

            {/* Count slider */}
            <div className="mb-6">
              <label className="block text-xs font-semibold font-sans text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                {isPl ? `Liczba archetypów: ${archetypeCount}` : `Archetypes: ${archetypeCount}`}
                <span className="ml-2 text-[10px] font-normal normal-case text-slate-400">
                  {`(≈${archetypeCount * 8}s)`}
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={8}
                value={archetypeCount}
                onChange={e => setArchetypeCount(Number(e.target.value))}
                className="w-full accent-[#14B8A6] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-sans text-slate-400 mt-1">
                <span>1</span><span>4</span><span>8</span>
              </div>
            </div>

            {error && (
              <p className="text-[#DC2626] font-sans text-sm mb-4 bg-[#FEE2E2] dark:bg-red-950/40 p-3 rounded-lg border border-[#FCA5A5] dark:border-red-900/60">
                {error}
              </p>
            )}
            <button
              onClick={handleGenerateArchetypes}
              disabled={!segment.trim()}
              className="w-full px-6 py-3 rounded-xl text-sm font-sans font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {t(language, 'sim_generate')}
            </button>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-sans text-center mt-4">
              {isPl
                ? `Generowanie ${archetypeCount} archetypów · typ: ${marketType} · ≈${archetypeCount * 8}s`
                : `Generating ${archetypeCount} archetypes · type: ${marketType} · ≈${archetypeCount * 8}s`}
            </p>
          </div>
        )
      )}

      {/* Krok 2: Wybór archetypu */}
      {step === 'archetypes' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-sans font-semibold text-lg text-[#0D2535] dark:text-slate-100">
              {t(language, 'sim_step2_title')}
            </h2>
            <button
              onClick={() => setStep('input')}
              className="px-4 py-2 rounded-lg text-sm font-sans font-medium text-slate-500 dark:text-slate-400 hover:text-[#0D2535] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors flex items-center gap-1 border border-[#E2E8F0] dark:border-[#333333]"
            >
              {t(language, 'sim_change_segment')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {simulatorArchetypes.map((arch, i) => (
              <ArchetypeCard
                key={i}
                profile={arch}
                onClick={() => handleSelectArchetype(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Krok 3: Chat */}
      {step === 'chat' && selectedArchetype && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-280px)]">
          {/* Lewa kolumna */}
          <div className="col-span-1 overflow-y-auto space-y-6 pr-2">
            <button
              onClick={handleBackToArchetypes}
              className="w-full px-4 py-2 rounded-lg text-sm font-sans font-medium text-slate-500 dark:text-slate-400 hover:text-[#0D2535] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors flex items-center gap-1 border border-[#E2E8F0] dark:border-[#333333] shadow-sm bg-white dark:bg-[#1A1A1A]"
            >
              {t(language, 'sim_back_personas')}
            </button>
            <ArchetypeCard profile={selectedArchetype} selected />

            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
              <p className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-100 flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span> {t(language, 'sim_forces')}
              </p>
              <p className="text-sm font-sans text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedArchetype.forces_hypothesis}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
              <p className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-100 flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span> {t(language, 'sim_hypotheses')}
              </p>
              <div className="space-y-2">
                {selectedArchetype.hypotheses_to_test.map((h, i) => (
                  <p key={i} className="text-sm font-sans text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-[#14B8A6] mt-0.5"><ChevronRight size={14} /></span>
                    {h}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Prawa kolumna: chat */}
          <div className="col-span-2 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#333333] overflow-hidden flex flex-col transition-colors">
            <SimulatorChat
              archetype={selectedArchetype}
              messages={chatHistory}
              onMessage={addMessage}
            />
          </div>
        </div>
      )}
    </div>
  )
}

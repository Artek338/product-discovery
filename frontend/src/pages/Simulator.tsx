import { useState } from 'react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import ArchetypeCard from '../components/ArchetypeCard'
import SimulatorChat from '../components/SimulatorChat'
import { Check, ChevronRight } from 'lucide-react'

type Step = 'input' | 'archetypes' | 'chat'

const STEPS = [
  { id: 'input', label: 'Define Segment' },
  { id: 'archetypes', label: 'Select Archetype' },
  { id: 'chat', label: 'Interview Simulator' }
]

export default function Simulator() {
  const [step, setStep] = useState<Step>('input')
  const [segment, setSegment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    simulatorArchetypes, setSimulatorArchetypes,
    selectedArchetype, setSelectedArchetype,
    chatHistory, addMessage, clearChat,
  } = useAppStore()

  const handleGenerateArchetypes = async () => {
    if (!segment.trim()) return
    setLoading(true)
    setError('')
    try {
      const archetypes = await api.generateArchetypes(segment.trim())
      setSimulatorArchetypes(archetypes)
      setStep('archetypes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd generowania archetypów')
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-2xl font-sans font-semibold text-[#0D2535] mb-2">Simulate Interviews</h1>
        <p className="text-slate-500 font-sans text-sm">
          Practice behavioral questions with synthetic users before conducting real interviews.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[#E2E8F0] -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#14B8A6] -z-10 transition-all duration-300"
            style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((s, idx) => {
            const isCompleted = currentStepIndex > idx
            const isCurrent = currentStepIndex === idx

            return (
              <div key={s.id} className="flex flex-col items-center bg-[#F8FAFC] px-4 -ml-4 first:ml-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                    ${isCompleted ? 'bg-[#14B8A6] text-white' :
                      isCurrent ? 'bg-white border-2 border-[#14B8A6] text-[#14B8A6]' :
                        'bg-white border-2 border-[#E2E8F0] text-slate-400'}`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : idx + 1}
                </div>
                <span className={`mt-2 text-xs font-sans font-medium ${isCurrent || isCompleted ? 'text-[#0D2535]' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Krok 1: Segment */}
      {step === 'input' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] max-w-2xl mx-auto">
          <h2 className="font-sans font-semibold text-lg text-[#0D2535] mb-6">Describe Target Segment</h2>
          <textarea
            value={segment}
            onChange={e => setSegment(e.target.value)}
            rows={4}
            placeholder='e.g. "UX Freelancers with 5-15 clients annually based in Europe"'
            className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0D2535] outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all font-sans resize-none mb-6"
          />
          {error && (
            <p className="text-[#DC2626] font-sans text-sm mb-4 bg-[#FEE2E2] p-3 rounded-lg border border-[#FCA5A5]">{error}</p>
          )}
          <button
            onClick={handleGenerateArchetypes}
            disabled={loading || !segment.trim()}
            className="w-full px-6 py-3 rounded-xl text-sm font-sans font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin text-white/70" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating Archetypes...
              </span>
            ) : 'Generate 4 Synthetic Profiles'}
          </button>
          <p className="text-xs text-slate-400 font-sans text-center mt-4">
            Generation takes ~30s — utilizing 4 independent LLM calls
          </p>
        </div>
      )}

      {/* Krok 2: Wybór archetypu */}
      {step === 'archetypes' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-sans font-semibold text-lg text-[#0D2535]">Select Persona for Interview</h2>
            <button
              onClick={() => setStep('input')}
              className="px-4 py-2 rounded-lg text-sm font-sans font-medium text-slate-500 hover:text-[#0D2535] hover:bg-slate-50 transition-colors flex items-center gap-1 border border-[#E2E8F0]"
            >
              Change Segment
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
          {/* Lewa kolumna: profil archetypu (pinned) */}
          <div className="col-span-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            <button
              onClick={handleBackToArchetypes}
              className="w-full px-4 py-2 rounded-lg text-sm font-sans font-medium text-slate-500 hover:text-[#0D2535] hover:bg-slate-50 transition-colors flex items-center gap-1 border border-[#E2E8F0] shadow-sm bg-white"
            >
              ← Back to Personas
            </button>
            <ArchetypeCard profile={selectedArchetype} selected />

            {/* Forces hint */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E2E8F0]">
              <p className="font-sans font-semibold text-sm text-[#0D2535] flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span> Forces Hypothesis
              </p>
              <p className="text-sm font-sans text-slate-600 leading-relaxed">{selectedArchetype.forces_hypothesis}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E2E8F0]">
              <p className="font-sans font-semibold text-sm text-[#0D2535] flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span> Hypotheses to Test
              </p>
              <div className="space-y-2">
                {selectedArchetype.hypotheses_to_test.map((h, i) => (
                  <p key={i} className="text-sm font-sans text-slate-600 flex items-start gap-2">
                    <span className="text-[#14B8A6] mt-0.5"><ChevronRight size={14} /></span>
                    {h}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Prawa kolumna: chat */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col">
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

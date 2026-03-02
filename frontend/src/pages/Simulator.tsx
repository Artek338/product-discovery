import { useState } from 'react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import ArchetypeCard from '../components/ArchetypeCard'
import SimulatorChat from '../components/SimulatorChat'

type Step = 'input' | 'archetypes' | 'chat'

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

  return (
    <div className="max-w-5xl mx-auto p-5">
      <div className="mb-5">
        <p className="text-slate-400 font-sans text-sm">
          Ćwicz pytania behawioralne na syntetycznych użytkownikach zanim przeprowadzisz prawdziwe wywiady
        </p>
      </div>

      {/* Krok 1: Segment */}
      {step === 'input' && (
        <div className="card p-8 max-w-xl">
          <h2 className="font-semibold text-lg mb-4">Krok 1: Opisz segment użytkowników</h2>
          <textarea
            value={segment}
            onChange={e => setSegment(e.target.value)}
            rows={3}
            placeholder='np. "Freelancerzy UX, 5-15 klientów rocznie, Polska"'
            className="input resize-none mb-4"
          />
          {error && (
            <p className="text-red-600 text-sm mb-3">{error}</p>
          )}
          <button
            onClick={handleGenerateArchetypes}
            disabled={loading || !segment.trim()}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Generowanie archetypów...
              </span>
            ) : '🎭 Generuj 4 archetypy'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Generowanie zajmuje ~30s — 4 niezależne wywołania AI
          </p>
        </div>
      )}

      {/* Krok 2: Wybór archetypu */}
      {step === 'archetypes' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Krok 2: Wybierz archetyp do rozmowy</h2>
            <button
              onClick={() => setStep('input')}
              className="btn-secondary text-sm"
            >
              ← Zmień segment
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Lewa kolumna: profil archetypu (pinned) */}
          <div className="col-span-1 overflow-y-auto space-y-4">
            <button
              onClick={handleBackToArchetypes}
              className="btn-secondary w-full text-sm"
            >
              ← Zmień archetyp
            </button>
            <ArchetypeCard profile={selectedArchetype} selected />

            {/* Forces hint */}
            <div className="card p-4 text-xs text-gray-600 space-y-2">
              <p className="font-semibold text-gray-700">💡 Forces tego archetypu</p>
              <p className="text-gray-500">{selectedArchetype.forces_hypothesis}</p>
            </div>

            <div className="card p-4 text-xs space-y-1">
              <p className="font-semibold text-gray-700 mb-2">🎯 Pytania do przetestowania</p>
              {selectedArchetype.hypotheses_to_test.map((h, i) => (
                <p key={i} className="text-gray-600">• {h}</p>
              ))}
            </div>
          </div>

          {/* Prawa kolumna: chat */}
          <div className="col-span-2 card overflow-hidden flex flex-col">
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

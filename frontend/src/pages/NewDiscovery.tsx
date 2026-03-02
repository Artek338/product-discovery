import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { DiscoveryMode } from '../types/discovery'

const MODES: { value: DiscoveryMode; label: string; desc: string }[] = [
  { value: 'auto', label: '🤖 Auto', desc: 'Pełna analiza — wszystkie 8 węzłów' },
  { value: 'problem', label: '❓ Problem', desc: 'Walidacja problemu i bólu użytkownika' },
  { value: 'solution', label: '💡 Solution', desc: 'CO/JAK zbudować — mając problem potwierdzony' },
]

export default function NewDiscovery() {
  const navigate = useNavigate()
  const [idea, setIdea] = useState('')
  const [projectName, setProjectName] = useState('')
  const [mode, setMode] = useState<DiscoveryMode>('auto')
  const [interviewNotes, setInterviewNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim() || !projectName.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await api.runDiscovery({
        idea: idea.trim(),
        project_name: projectName.trim(),
        mode,
        interview_notes: interviewNotes.trim() || undefined,
      })
      navigate(`/discovery/${res.session_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd uruchamiania Discovery')
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setInterviewNotes(ev.target?.result as string)
    reader.readAsText(file)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nowy projekt Discovery</h1>
        <p className="text-gray-500 text-sm mt-1">
          Opisz pomysł i uruchom analizę JTBD + Forces Diagram
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nazwa projektu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa projektu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="np. freelancer-tools, adtech-transparency"
            className="input"
            required
          />
        </div>

        {/* Opis pomysłu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis pomysłu + kontekst <span className="text-red-500">*</span>
          </label>
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            rows={6}
            placeholder="Opisz pomysł, problem który rozwiązujesz, segment klientów, zebrane obserwacje..."
            className="input resize-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Im więcej kontekstu (obserwacje, dane rynkowe, insighty), tym lepsza analiza.
          </p>
        </div>

        {/* Tryb */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tryb Discovery
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  mode === m.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="font-medium text-sm">{m.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notatki z wywiadów */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notatki z wywiadów{' '}
            <span className="text-gray-400 font-normal">(opcjonalne, wzmacnia dowody)</span>
          </label>
          <textarea
            value={interviewNotes}
            onChange={e => setInterviewNotes(e.target.value)}
            rows={4}
            placeholder="Wklej notatki z wywiadów (wzmacnia evidence level do 2_Past_Behavior)"
            className="input resize-none text-sm"
          />
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-gray-400">lub</span>
            <label className="text-xs text-indigo-600 cursor-pointer hover:underline">
              Załaduj plik .md / .txt
              <input type="file" accept=".md,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !idea.trim() || !projectName.trim()}
            className="btn-primary flex-1"
          >
            {loading ? '⏳ Uruchamianie...' : '🚀 Uruchom Discovery'}
          </button>
          <a href="/" className="btn-secondary">
            Anuluj
          </a>
        </div>
      </form>
    </div>
  )
}

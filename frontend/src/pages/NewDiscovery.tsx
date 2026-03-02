import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, X } from 'lucide-react'
import { api } from '../lib/api'
import type { DiscoveryMode } from '../types/discovery'

const MODES: { value: DiscoveryMode; label: string; desc: string; dot: string }[] = [
  {
    value: 'auto',
    label: 'Auto',
    desc: 'Pełna analiza — wszystkie 8 węzłów',
    dot: 'bg-violet',
  },
  {
    value: 'problem',
    label: 'Problem',
    desc: 'Walidacja problemu i bólu użytkownika',
    dot: 'bg-orange',
  },
  {
    value: 'solution',
    label: 'Solution',
    desc: 'CO/JAK zbudować — mając problem potwierdzony',
    dot: 'bg-teal-500',
  },
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
    <div className="max-w-2xl mx-auto p-5">
      <div className="card p-6 mb-0">

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nazwa projektu */}
        <div>
          <label className="block font-sans text-sm font-medium text-sidebar mb-1.5">
            Nazwa projektu <span className="text-danger">*</span>
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
          <label className="block font-sans text-sm font-medium text-sidebar mb-1.5">
            Opis pomysłu + kontekst <span className="text-danger">*</span>
          </label>
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            rows={6}
            placeholder="Opisz pomysł, problem który rozwiązujesz, segment klientów, zebrane obserwacje..."
            className="input resize-none"
            required
          />
          <p className="text-xs text-slate-400 font-sans mt-1">
            Im więcej kontekstu (obserwacje, dane rynkowe, insighty), tym lepsza analiza.
          </p>
        </div>

        {/* Tryb Discovery */}
        <div>
          <label className="block font-sans text-sm font-medium text-sidebar mb-2">
            Tryb Discovery
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`p-3.5 rounded-btn border-2 text-left transition-all ${
                  mode === m.value
                    ? 'border-teal-500 bg-[#F0FDFA]'
                    : 'border-border hover:border-teal-400 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                  <span className="font-mono font-semibold text-sm text-sidebar">{m.label}</span>
                </div>
                <div className="text-xs text-slate-400 font-sans leading-snug">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notatki z wywiadów */}
        <div>
          <label className="block font-sans text-sm font-medium text-sidebar mb-1.5">
            Notatki z wywiadów{' '}
            <span className="text-slate-400 font-normal">(opcjonalne, wzmacnia dowody)</span>
          </label>
          <textarea
            value={interviewNotes}
            onChange={e => setInterviewNotes(e.target.value)}
            rows={4}
            placeholder="Wklej notatki z wywiadów (wzmacnia evidence level do 2_Past_Behavior)"
            className="input resize-none text-sm"
          />
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs text-slate-400 font-sans">lub</span>
            <label className="text-xs text-teal-600 font-sans font-medium cursor-pointer hover:underline">
              Załaduj plik .md / .txt
              <input type="file" accept=".md,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        {/* Błąd */}
        {error && (
          <div className="rounded-btn border border-[#FCA5A5] bg-[#FEE2E2] p-3 text-sm text-[#DC2626] font-sans">
            {error}
          </div>
        )}

        {/* Akcje */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || !idea.trim() || !projectName.trim()}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Uruchamianie...
              </span>
            ) : (
              <>
                <Rocket size={15} />
                Uruchom Discovery
              </>
            )}
          </button>
          <a href="/" className="btn-secondary">
            <X size={15} />
            Anuluj
          </a>
        </div>
      </form>
      </div>
    </div>
  )
}

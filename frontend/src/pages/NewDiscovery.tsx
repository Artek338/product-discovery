import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, X, AlertCircle, HelpCircle, Paperclip, Lightbulb, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'
import type { DiscoveryMode } from '../types/discovery'

// ─── Ideation Scaffolding ─────────────────────────────────────────────────────

const SCAMPER = [
  { letter: 'S', label: 'Substitute', question: 'Co możesz zastąpić w obecnym rozwiązaniu? Inny materiał, proces, komponent?' },
  { letter: 'C', label: 'Combine', question: 'Co możesz połączyć? Które dwa istniejące produkty/usługi dałoby wartość jako jedno?' },
  { letter: 'A', label: 'Adapt', question: 'Co możesz zaadaptować z innej branży? Który model biznesowy działający gdzie indziej tu pasuje?' },
  { letter: 'M', label: 'Modify / Magnify', question: 'Co możesz wyolbrzymić lub zminimalizować? Co jeśli zrobisz to 10× większe lub 10× tańsze?' },
  { letter: 'P', label: 'Put to other uses', question: 'Do czego jeszcze można użyć tego produktu? Kto inny mógłby mieć ten problem?' },
  { letter: 'E', label: 'Eliminate', question: 'Co możesz usunąć? Który krok w procesie użytkownika jest zbędny?' },
  { letter: 'R', label: 'Reverse / Rearrange', question: 'Co jeśli odwrócisz kolejność? Co jeśli użytkownik dostarcza wartość zamiast jej szukać?' },
]

const REVERSE_BRAINSTORM = [
  'Jak sprawić, żeby użytkownicy nigdy nie wrócili po pierwszym użyciu?',
  'Jak maksymalnie skomplikować onboarding?',
  'Jak sprawić, żeby problem który rozwiązujesz był jeszcze gorszy?',
  'Jak sprawić, żeby nikt nie chciał za to zapłacić?',
  'Jak skopiować to rozwiązanie w 2 tygodnie bez barier?',
]

const ANALOGIES = [
  { domain: 'Airbnb / Uber', prompt: 'Co jeśli Twój produkt działa jak marketplace — łączy dwie strony które wcześniej nie mogły się znaleźć?' },
  { domain: 'Netflix', prompt: 'Co jeśli zamiast sprzedawać jednorazowo, dajesz dostęp do katalogu za stały abonament?' },
  { domain: 'Duolingo', prompt: 'Co jeśli bolesny proces (np. nauka, compliance, onboarding) zamieniasz w grę z nagrodami?' },
  { domain: 'Notion / Figma', prompt: 'Co jeśli narzędzie które zwykle jest prywatne robisz kolaboratywne i żywe (real-time)?' },
  { domain: 'Stripe', prompt: 'Co jeśli złożony, eksperski problem (API, płatności, prawnik) zamieniasz w 3 linijki kodu / 1 kliknięcie?' },
]

type IdeationTab = 'scamper' | 'reverse' | 'analogies'

function IdeationPanel({ onApply }: { onApply: (text: string) => void }) {
  const [tab, setTab] = useState<IdeationTab>('scamper')
  const [scamperIdx, setScamperIdx] = useState(0)
  const [reverseIdx, setReverseIdx] = useState(0)
  const [analogyIdx, setAnalogyIdx] = useState(0)

  const current = {
    scamper: SCAMPER[scamperIdx],
    reverse: REVERSE_BRAINSTORM[reverseIdx],
    analogies: ANALOGIES[analogyIdx],
  }

  const next = () => {
    if (tab === 'scamper') setScamperIdx(i => (i + 1) % SCAMPER.length)
    if (tab === 'reverse') setReverseIdx(i => (i + 1) % REVERSE_BRAINSTORM.length)
    if (tab === 'analogies') setAnalogyIdx(i => (i + 1) % ANALOGIES.length)
  }

  const getPromptText = () => {
    if (tab === 'scamper') return `[SCAMPER — ${current.scamper.label}]\n${current.scamper.question}\n\nMój pomysł:`
    if (tab === 'reverse') return `[Reverse Brainstorm]\nOdwrócone pytanie: ${current.reverse}\n\nMój pomysł (odwróć tę perspektywę):`
    return `[Analogia: ${current.analogies.domain}]\n${current.analogies.prompt}\n\nMój pomysł:`
  }

  const TABS: { id: IdeationTab; label: string }[] = [
    { id: 'scamper', label: 'SCAMPER' },
    { id: 'reverse', label: 'Reverse' },
    { id: 'analogies', label: 'Analogie' },
  ]

  return (
    <div className="bg-[#0D2535] rounded-xl border border-[#1E3A5F] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#1E3A5F]">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${tab === t.id
              ? 'text-[#14B8A6] border-b-2 border-[#14B8A6] -mb-px'
              : 'text-[#4A7090] hover:text-white'
              }`}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={next}
          className="px-4 py-2.5 text-xs text-[#4A7090] hover:text-white flex items-center gap-1.5 transition-colors"
          title="Następna podpowiedź"
        >
          <RefreshCw size={12} />
          Następna
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {tab === 'scamper' && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 rounded-lg bg-[#14B8A6] text-white font-bold text-sm flex items-center justify-center shrink-0">
                {current.scamper.letter}
              </span>
              <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider">{current.scamper.label}</span>
              <span className="text-[10px] text-[#4A7090]">{scamperIdx + 1}/{SCAMPER.length}</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{current.scamper.question}</p>
          </div>
        )}

        {tab === 'reverse' && (
          <div>
            <p className="text-[10px] font-bold text-[#14B8A6] uppercase tracking-wider mb-3">
              Odwróć problem — znajdź anty-wzorzec, potem zaprzecz
            </p>
            <p className="text-sm text-slate-300 leading-relaxed italic">&ldquo;{current.reverse}&rdquo;</p>
            <p className="text-xs text-[#4A7090] mt-3">{reverseIdx + 1}/{REVERSE_BRAINSTORM.length} — odwróć tę perspektywę żeby odkryć co NAPRAWDĘ tworzy wartość</p>
          </div>
        )}

        {tab === 'analogies' && (
          <div>
            <p className="text-[10px] font-bold text-[#14B8A6] uppercase tracking-wider mb-1">
              Model: {current.analogies.domain}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed mt-2">{current.analogies.prompt}</p>
            <p className="text-[10px] text-[#4A7090] mt-3">{analogyIdx + 1}/{ANALOGIES.length}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onApply(getPromptText())}
          className="w-full py-2 rounded-lg text-xs font-bold text-[#0D2535] bg-[#14B8A6] hover:bg-[#0D9488] transition-colors mt-2"
        >
          Użyj jako szablon opisu →
        </button>
      </div>
    </div>
  )
}

export default function NewDiscovery() {
  const navigate = useNavigate()
  const { language } = useAppStore()

  const MODES: { value: DiscoveryMode; label: string; desc: string; dot: string; tooltip: string }[] = [
    {
      value: 'auto',
      label: 'Auto',
      desc: t(language, 'nd_mode_auto_desc'),
      dot: 'bg-[#8B5CF6]',
      tooltip: language === 'pl' ? 'Przeprowadzi pełną ścieżkę badawczą krok po kroku.' : 'Performs a full step-by-step discovery path.'
    },
    {
      value: 'problem',
      label: 'Problem',
      desc: t(language, 'nd_mode_problem_desc'),
      dot: 'bg-[#F97316]',
      tooltip: language === 'pl' ? 'Skupia się na walidacji samego problemu bez sugerowania rozwiązań.' : 'Focuses purely on validating the problem space without solutions.'
    },
    {
      value: 'solution',
      label: 'Solution',
      desc: t(language, 'nd_mode_solution_desc'),
      dot: 'bg-[#14B8A6]',
      tooltip: language === 'pl' ? 'Zakłada, że problem jest prawdziwy i szuka najlepszego sposobu jego rozwiązania.' : 'Assumes the problem is validated and looks for the best solution formulation.'
    },
  ]

  const [idea, setIdea] = useState('')
  const [projectName, setProjectName] = useState('')
  const [mode, setMode] = useState<DiscoveryMode>('auto')
  const [interviewNotes, setInterviewNotes] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<{ name: string, content: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showIdeation, setShowIdeation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim() || !projectName.trim()) return

    setLoading(true)
    setError('')

    try {
      // Combine manual notes with all attached file contents
      const combinedNotes = [
        interviewNotes.trim(),
        ...attachedFiles.map(f => `--- Plik: ${f.name} ---\n${f.content}`)
      ].filter(Boolean).join('\n\n')

      const res = await api.runDiscovery({
        idea: idea.trim(),
        project_name: projectName.trim(),
        mode,
        interview_notes: combinedNotes || undefined,
      })
      navigate(`/discovery/${res.session_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd uruchamiania Discovery')
      setLoading(false)
    }
  }

  const handleFiles = (files: FileList | null | undefined) => {
    if (!files) return
    Array.from(files).forEach(file => {
      if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setAttachedFiles(prev => [...prev, { name: file.name, content: ev.target?.result as string }])
        }
        reader.readAsText(file)
      } else {
        setError(language === 'pl' ? 'Obsługiwane są tylko pliki .md oraz .txt' : 'Only .md and .txt files are supported')
      }
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // clear input to allow uploading the same file again if removed
    e.target.value = ''
  }

  const handleRemoveFile = (indexToRemove: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-sans font-semibold text-[#0D2535] dark:text-slate-100 mb-2">
          {t(language, 'nd_title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-sans text-sm max-w-2xl">
          {t(language, 'nd_subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 shadow-sm border border-[#E2E8F0] dark:border-[#333333] space-y-8 transition-colors">
        {/* Nazwa projektu */}
        <div>
          <label htmlFor="projectName" className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-2">
            {t(language, 'nd_project_name')} <span className="text-red-500">*</span>
          </label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder={t(language, 'nd_project_ph')}
            className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-lg px-4 py-2.5 text-[#0D2535] dark:text-slate-200 dark:placeholder:text-slate-600 text-sm outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all font-sans"
            required
          />
        </div>

        {/* Ideation Scaffolding */}
        <div>
          <button
            type="button"
            onClick={() => setShowIdeation(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-[#14B8A6]/40 bg-[#F0FDFA]/50 dark:bg-teal-900/10 hover:bg-[#F0FDFA] dark:hover:bg-teal-900/20 hover:border-[#14B8A6] transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <Lightbulb size={16} className="text-[#14B8A6] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#0D9488] font-sans">
                  {language === 'pl' ? 'Pomóż mi sformułować pomysł' : 'Help me shape the idea'}
                </p>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  {language === 'pl' ? 'SCAMPER · Reverse Brainstorm · Analogie — opcjonalne' : 'SCAMPER · Reverse Brainstorm · Analogies — optional'}
                </p>
              </div>
            </div>
            {showIdeation ? <ChevronUp size={16} className="text-[#14B8A6]" /> : <ChevronDown size={16} className="text-slate-400 group-hover:text-[#14B8A6]" />}
          </button>

          {showIdeation && (
            <div className="mt-3">
              <IdeationPanel onApply={(text) => { setIdea(prev => prev ? `${prev}\n\n${text}` : text); setShowIdeation(false) }} />
            </div>
          )}
        </div>

        {/* Opis pomysłu */}
        <div>
          <label htmlFor="idea" className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-2">
            {t(language, 'nd_idea')} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={e => setIdea(e.target.value)}
            rows={5}
            maxLength={10000}
            placeholder={t(language, 'nd_idea_ph')}
            className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-lg px-4 py-3 text-[#0D2535] dark:text-slate-200 dark:placeholder:text-slate-600 text-sm outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all font-sans resize-none"
            required
          />
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mt-2">
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {t(language, 'nd_idea_hint')}
            </p>
            <p className={`text-xs font-sans mt-0.5 text-right shrink-0 ${idea.length >= 10000 ? 'text-red-500' : 'text-slate-400'}`}>
              {idea.length}/10000
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-slate-500 font-sans mr-1">{language === 'pl' ? 'Szablony:' : 'Templates:'}</span>
            <button
              type="button"
              onClick={() => setIdea('Kontekst biznesowy:\n\nProblem do rozwiązania:\n\nSegment docelowy:\n\nKluczowe założenia (hypotheses):\n')}
              className="px-2.5 py-1 text-[11px] font-medium text-[#14B8A6] bg-[#F0FDFA] border border-[#CCFBF1] rounded hover:bg-[#CCFBF1] hover:text-[#0D9488] transition-colors"
            >
              Struktura klasyczna
            </button>
            <button
              type="button"
              onClick={() => setIdea('Zastosuj wzorzec Claude Code:\n- <purpose>...\n- <context>...\n- <format>...\n- <constraints>...')}
              className="px-2.5 py-1 text-[11px] font-medium text-[#8B5CF6] bg-[#F5F3FF] border border-[#DDD6FE] rounded hover:bg-[#DDD6FE] hover:text-[#6D28D9] transition-colors"
            >
              Claude Code
            </button>
            <button
              type="button"
              onClick={() => setIdea('Lean Canvas:\n\n1. Problem:\n2. Rozwiązanie:\n3. Unikalna wartość (UVP):\n4. Przewaga (Unfair Advantage):\n5. Segment docelowy:\n6. Kluczowe metryki:\n7. Kanały dotarcia:\n8. Struktura kosztów:\n9. Strumienie przychodów:\n')}
              className="px-2.5 py-1 text-[11px] font-medium text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] rounded hover:bg-[#FFEDD5] hover:text-[#C2410C] transition-colors"
            >
              Lean Canvas
            </button>
            <button
              type="button"
              onClick={() => setIdea('User Story:\n\nJako <kto>,\nchcę <co>,\naby <cel/powód>.\n\nKryteria akceptacji:\n- ...\n- ...')}
              className="px-2.5 py-1 text-[11px] font-medium text-[#3B82F6] bg-[#EFF6FF] border border-[#DBEAFE] rounded hover:bg-[#DBEAFE] hover:text-[#1D4ED8] transition-colors"
            >
              User Story
            </button>
          </div>
        </div>

        {/* Tryb Discovery */}
        <div>
          <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-3">
            {t(language, 'nd_mode')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODES.map(m => (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={mode === m.value}
                onClick={() => setMode(m.value)}
                className={`p-4 rounded-xl border-2 transition-all ${mode === m.value
                    ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/20'
                    : 'border-[#E2E8F0] dark:border-[#333333] hover:border-[#CCFBF1] dark:hover:border-[#14B8A6]/40 bg-white dark:bg-[#141414]'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2 relative group w-full">
                  <span className={`w-2.5 h-2.5 rounded-full ${m.dot}`} />
                  <span className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-200">{m.label}</span>
                  <HelpCircle size={14} className="text-slate-400 ml-auto" />

                  {/* Tooltip */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-lg font-sans">
                    {m.tooltip}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-snug">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notatki z wywiadów */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="interviewNotes" className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200">
              {t(language, 'nd_notes')}
            </label>
            <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
              {attachedFiles.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDFA] text-[#0D9488] text-xs font-sans font-semibold rounded-full border border-[#CCFBF1]">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button type="button" onClick={() => handleRemoveFile(idx)} className="hover:text-teal-900 p-0.5 rounded-full hover:bg-teal-100 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {attachedFiles.length === 0 && (
                <span className="text-xs text-slate-400 font-sans font-medium px-2 py-0.5 bg-slate-100 rounded">
                  {t(language, 'nd_notes_optional')}
                </span>
              )}
            </div>
          </div>

          <div
            className={`relative mb-3 rounded-lg border-2 transition-all ${isDragging ? 'border-[#14B8A6] bg-[#F0FDFA]' : 'border-transparent'}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-lg border-2 border-dashed border-[#14B8A6]">
                <div className="text-center">
                  <Paperclip size={24} className="mx-auto text-[#14B8A6] mb-2" />
                  <p className="font-sans font-semibold text-[#14B8A6]">Upuść pliki tutaj</p>
                </div>
              </div>
            )}
            <textarea
              id="interviewNotes"
              value={interviewNotes}
              onChange={e => setInterviewNotes(e.target.value)}
              rows={4}
              placeholder={t(language, 'nd_notes_ph')}
              className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-lg px-4 pt-3 pb-4 text-[#0D2535] dark:text-slate-200 dark:placeholder:text-slate-600 outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all font-sans resize-none text-sm"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="inline-flex items-center gap-2 px-4 py-2 text-xs text-[#0D2535] dark:text-slate-300 font-sans font-semibold bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333333] rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-[#2A2A2A] hover:border-slate-300 transition-colors shadow-sm">
              <Paperclip size={14} className="text-slate-500" />
              {t(language, 'nd_attach') || 'Załącz plik'}
              <input type="file" multiple accept=".md,.txt" className="hidden" onChange={handleFileUpload} />
            </label>

            <button
              type="button"
              onClick={() => alert(language === 'pl' ? 'Integracja z Google Drive wkrótce!' : 'Google Drive integration coming soon!')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs text-[#0D2535] dark:text-slate-300 font-sans font-semibold bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333333] rounded-lg hover:bg-slate-50 dark:hover:bg-[#2A2A2A] hover:border-slate-300 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 87.3 78.4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.6 66.85l15.65 27.25h52.2L58.85 66.85z" fill="#0066da" />
                <path d="M43.65 2.5L28 29.7l26.1 44.4 15.65-27.2z" fill="#00ac47" />
                <path d="M58.85 29.7H27.5L11.85 56.9l15.65 27.2L58.85 29.7z" fill="#ea4335" />
                <path d="M6.6 66.85L22.25 39.65 6.6 12.45l-15.65 27.2z" fill="#00832d" />
                <path d="M43.65 2.5H12.3L-3.35 29.7h31.3z" fill="#2684fc" />
                <path d="M58.85 29.7L43.2 2.5 11.85 56.9h31.35z" fill="#ffba00" />
              </svg>
              Google Drive
            </button>
          </div>
        </div>

        {/* Błąd */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] p-4 text-sm text-[#DC2626] font-sans">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <hr className="border-[#E2E8F0] dark:border-[#333333]" />

        {/* Akcje */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-lg text-sm font-sans font-medium text-slate-500 dark:text-slate-400 hover:text-[#0D2535] dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors"
          >
            {t(language, 'nd_cancel')}
          </button>
          <button
            type="submit"
            disabled={loading || !idea.trim() || !projectName.trim()}
            className="px-6 py-2.5 rounded-lg text-sm font-sans font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white/70" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {t(language, 'nd_launching')}
              </>
            ) : (
              t(language, 'nd_launch')
            )}
          </button>
        </div>

      </div>
    </form>
  )
}

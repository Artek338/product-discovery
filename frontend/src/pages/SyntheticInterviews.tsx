import { useState } from 'react'
import { Users, Save, RotateCcw, Check } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const STORAGE_KEY = 'synthetic_interview_config'

type Segment = 'B2C' | 'B2B' | 'SaaS' | 'Enterprise' | 'Mixed'
type Tone = 'skeptical' | 'neutral' | 'enthusiastic'
type Language = 'pl' | 'en' | 'auto'

interface InterviewConfig {
  archetypeCount: number
  segment: Segment
  tone: Tone
  language: Language
  demographicContext: string
  customQuestions: string
  profileScope: Record<string, string[]>
}

const DEFAULT_CONFIG: InterviewConfig = {
  archetypeCount: 3,
  segment: 'B2C',
  tone: 'neutral',
  language: 'pl',
  demographicContext: '',
  customQuestions: '',
  profileScope: {},
}

function loadConfig(): InterviewConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return DEFAULT_CONFIG
}

const SEGMENTS: { value: Segment; label: string; desc: string }[] = [
  { value: 'B2C', label: 'B2C', desc: 'Konsumenci indywidualni' },
  { value: 'B2B', label: 'B2B', desc: 'Firmy i organizacje' },
  { value: 'SaaS', label: 'SaaS', desc: 'Oprogramowanie jako usługa' },
  { value: 'Enterprise', label: 'Enterprise', desc: 'Duże korporacje (500+)' },
  { value: 'Mixed', label: 'Mixed', desc: 'Mieszany, wielosegmentowy' },
]

const TONES: { value: Tone; emoji: string; label: string; desc: string }[] = [
  { value: 'skeptical', emoji: '🤨', label: 'Sceptyczny', desc: 'Kwestionuje rozwiązania, ujawnia bóle i obiekcje' },
  { value: 'neutral', emoji: '😐', label: 'Neutralny', desc: 'Obiektywny, wyważony — opowiada fakty bez koloryzowania' },
  { value: 'enthusiastic', emoji: '😊', label: 'Entuzjastyczny', desc: 'Otwarty na innowacje, chętnie testuje nowe narzędzia' },
]

const LANG_OPTIONS: { value: Language; label: string; hint: string }[] = [
  { value: 'pl', label: 'Polski', hint: 'PL' },
  { value: 'en', label: 'English', hint: 'EN' },
  { value: 'auto', label: 'Auto', hint: 'wykryj z kontekstu' },
]

interface ScopeOption {
  value: string
  label: string
}

interface ScopeCategoryDef {
  id: string
  label: string
  icon: string
  options: ScopeOption[]
}

const SCOPE_CATEGORIES: ScopeCategoryDef[] = [
  {
    id: 'age',
    label: 'Przedział wiekowy',
    icon: '📅',
    options: [
      { value: '18_24', label: '18–24 lata' },
      { value: '25_34', label: '25–34 lata' },
      { value: '35_44', label: '35–44 lata' },
      { value: '45_54', label: '45–54 lata' },
      { value: '55_plus', label: '55+ lat' },
    ],
  },
  {
    id: 'org',
    label: 'Kontekst organizacyjny',
    icon: '🏢',
    options: [
      { value: 'freelancer', label: 'Solopreneur / Freelancer' },
      { value: 'startup', label: 'Startup (≤50 os.)' },
      { value: 'scaleup', label: 'Scale-up (50–500 os.)' },
      { value: 'enterprise', label: 'Enterprise (500+ os.)' },
      { value: 'public', label: 'Sektor publiczny / NGO' },
    ],
  },
  {
    id: 'role',
    label: 'Rola decyzyjna',
    icon: '🎯',
    options: [
      { value: 'end_user', label: 'Użytkownik końcowy' },
      { value: 'champion', label: 'Champion / Power User' },
      { value: 'decision_maker', label: 'Decision Maker (zakup)' },
      { value: 'blocker', label: 'Blocker (blokuje wdrożenie)' },
    ],
  },
  {
    id: 'adoption',
    label: 'Nastawienie do zmiany',
    icon: '🔄',
    options: [
      { value: 'innovator', label: 'Innowator (early adopter)' },
      { value: 'early_majority', label: 'Wczesna większość (pragmatycy)' },
      { value: 'late_majority', label: 'Późna większość (ostrożni)' },
      { value: 'laggard', label: 'Sceptyk / Maruder' },
    ],
  },
  {
    id: 'motivation',
    label: 'Motywacja zakupowa',
    icon: '💡',
    options: [
      { value: 'cost', label: 'Redukcja kosztów' },
      { value: 'revenue', label: 'Wzrost przychodów' },
      { value: 'time', label: 'Oszczędność czasu' },
      { value: 'compliance', label: 'Wymogi / compliance' },
      { value: 'prestige', label: 'Prestiż / brand image' },
    ],
  },
]

export default function SyntheticInterviews() {
  const [config, setConfig] = useState<InterviewConfig>(loadConfig)
  const [saved, setSaved] = useState(false)
  useAppStore() // keep store subscription alive

  const update = <K extends keyof InterviewConfig>(key: K, value: InterviewConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const toggleScope = (categoryId: string, value: string) => {
    setConfig(prev => {
      const current = prev.profileScope[categoryId] ?? []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, profileScope: { ...prev.profileScope, [categoryId]: updated } }
    })
    setSaved(false)
  }

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const reset = () => {
    setConfig(DEFAULT_CONFIG)
    localStorage.removeItem(STORAGE_KEY)
    setSaved(false)
  }

  const totalScopeSelected = Object.values(config.profileScope).flat().length

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users size={22} className="text-[#14B8A6]" />
          <h1 className="text-2xl font-sans font-semibold text-[#0D2535] dark:text-slate-100">
            Syntetyczne wywiady
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-sans text-sm max-w-2xl">
          Skonfiguruj profil archetypów użytkowników do syntetycznych wywiadów. Konfiguracja jest używana przy każdej sesji Discovery.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 shadow-sm border border-[#E2E8F0] dark:border-[#333333] space-y-8 transition-colors">

        {/* Liczba archetypów */}
        <div>
          <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-1">
            Liczba archetypów
          </label>
          <p className="text-xs text-slate-400 font-sans mb-4">
            Im więcej archetypów, tym bogatsze perspektywy — ale też dłuższy czas analizy.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={8}
              value={config.archetypeCount}
              onChange={e => update('archetypeCount', Number(e.target.value))}
              className="flex-1 accent-[#14B8A6]"
            />
            <div className="w-12 h-10 flex items-center justify-center bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg font-bold text-[#14B8A6] font-sans text-lg">
              {config.archetypeCount}
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-sans mt-1">
            <span>Min (1)</span>
            <span>Zalecane (3–5)</span>
            <span>Max (8)</span>
          </div>
        </div>

        {/* Segment rynku */}
        <div>
          <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-3">
            Segment rynku
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SEGMENTS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => update('segment', s.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  config.segment === s.value
                    ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/20'
                    : 'border-[#E2E8F0] dark:border-[#333333] hover:border-[#14B8A6]/40 bg-white dark:bg-[#141414]'
                }`}
              >
                <p className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-200">{s.label}</p>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Ton wywiadów */}
        <div>
          <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-3">
            Ton wywiadów
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TONES.map(tone => (
              <button
                key={tone.value}
                type="button"
                title={tone.desc}
                onClick={() => update('tone', tone.value)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                  config.tone === tone.value
                    ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/20'
                    : 'border-[#E2E8F0] dark:border-[#333333] hover:border-[#14B8A6]/40 bg-white dark:bg-[#141414]'
                }`}
              >
                <span className="text-xl">{tone.emoji}</span>
                <span className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-200">
                  {tone.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Język wywiadów */}
        <div>
          <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-3">
            Język wywiadów
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LANG_OPTIONS.map(l => (
              <button
                key={l.value}
                type="button"
                onClick={() => update('language', l.value)}
                className={`py-3 rounded-lg border-2 text-center font-sans transition-all ${
                  config.language === l.value
                    ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/20 text-[#0D9488] dark:text-teal-400'
                    : 'border-[#E2E8F0] dark:border-[#333333] text-slate-600 dark:text-slate-400 hover:border-[#14B8A6]/40 bg-white dark:bg-[#141414]'
                }`}
              >
                <span className="block text-sm font-semibold">{l.label}</span>
                <span className="block text-[10px] font-normal mt-0.5 opacity-60">{l.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Zakres profilu demograficznego */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200">
              Zakres profilu demograficznego
            </label>
            {totalScopeSelected > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#CCFBF1] dark:bg-teal-900/40 text-[#0D9488] dark:text-teal-400 text-xs font-semibold font-sans">
                <Check size={11} strokeWidth={3} />
                {totalScopeSelected} zaznaczonych
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-sans mb-5">
            Zaznacz atrybuty, które AI ma uwzględnić przy generowaniu archetypów. Puste = AI decyduje samodzielnie.
          </p>

          <div className="space-y-5">
            {SCOPE_CATEGORIES.map(cat => {
              const selected = config.profileScope[cat.id] ?? []
              return (
                <div key={cat.id}>
                  <p className="text-xs font-semibold font-sans text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    {selected.length > 0 && (
                      <span className="font-normal normal-case tracking-normal text-[#14B8A6]">
                        ({selected.length})
                      </span>
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.options.map(opt => {
                      const isChecked = selected.includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleScope(cat.id, opt.value)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-sm font-sans transition-all ${
                            isChecked
                              ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/20 text-[#0D9488] dark:text-teal-300'
                              : 'border-[#E2E8F0] dark:border-[#333333] text-slate-600 dark:text-slate-400 hover:border-[#14B8A6]/40 bg-white dark:bg-[#141414]'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                            isChecked
                              ? 'bg-[#14B8A6] border-[#14B8A6]'
                              : 'border-[#CBD5E1] dark:border-[#555]'
                          }`}>
                            {isChecked && <Check size={9} strokeWidth={3} className="text-white" />}
                          </div>
                          <span className="leading-tight">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dodatkowy kontekst */}
        <div>
          <label htmlFor="demography" className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-1">
            Dodatkowy kontekst <span className="font-normal text-slate-400">(opcjonalnie)</span>
          </label>
          <p className="text-xs text-slate-400 font-sans mb-2">
            Szczegóły spoza powyższych kategorii — branża, region, specyficzne zachowania zakupowe.
          </p>
          <textarea
            id="demography"
            value={config.demographicContext}
            onChange={e => update('demographicContext', e.target.value)}
            rows={3}
            placeholder="Np. Głównie kobiety 25–40 lat, mieszkanki miast, korzystające z aplikacji bankowych co najmniej 3× w tygodniu..."
            className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-lg px-4 py-3 text-sm text-[#0D2535] dark:text-slate-200 dark:placeholder:text-slate-600 outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all font-sans resize-none"
          />
        </div>

        {/* Pytania własne */}
        <div>
          <label htmlFor="questions" className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-1">
            Pytania własne do wywiadów <span className="font-normal text-slate-400">(opcjonalnie)</span>
          </label>
          <p className="text-xs text-slate-400 font-sans mb-2">
            AI doda te pytania do zestawu wywiadowego. Jedno pytanie na linię.
          </p>
          <textarea
            id="questions"
            value={config.customQuestions}
            onChange={e => update('customQuestions', e.target.value)}
            rows={4}
            placeholder={'Np.:\nCzy kiedykolwiek płaciłeś za podobne rozwiązanie?\nCo sprawiło, że zrezygnowałeś z poprzedniego narzędzia?'}
            className="w-full bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#333333] rounded-lg px-4 py-3 text-sm text-[#0D2535] dark:text-slate-200 dark:placeholder:text-slate-600 outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all font-sans resize-none"
          />
        </div>

        {/* Akcje */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#333333]">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-sans font-medium text-slate-500 dark:text-slate-400 hover:text-[#0D2535] dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            Przywróć domyślne
          </button>
          <button
            type="button"
            onClick={save}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-sans font-semibold rounded-lg transition-all shadow-sm ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-[#14B8A6] text-white hover:bg-[#0D9488]'
            }`}
          >
            <Save size={14} />
            {saved ? '✓ Zapisano!' : 'Zapisz konfigurację'}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#F8FAFC] dark:bg-[#141414] rounded-xl border border-[#E2E8F0] dark:border-[#333333]">
        <p className="text-xs font-sans text-slate-400">
          <strong className="text-slate-500 dark:text-slate-400">💡 Wskazówka:</strong>{' '}
          Konfiguracja jest zapisywana lokalnie w przeglądarce i wczytywana przy kolejnych sesjach Discovery.
          Zaznaczone zakresy profilu są uwzględniane przez AI przy generowaniu archetypów.
        </p>
      </div>
    </div>
  )
}

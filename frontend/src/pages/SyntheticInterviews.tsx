import { useState } from 'react'
import { Users, Save, RotateCcw } from 'lucide-react'
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
}

const DEFAULT_CONFIG: InterviewConfig = {
    archetypeCount: 3,
    segment: 'B2C',
    tone: 'neutral',
    language: 'pl',
    demographicContext: '',
    customQuestions: '',
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

const TONES: { value: Tone; label: string; desc: string; color: string }[] = [
    { value: 'skeptical', label: '🤨 Sceptyczny', desc: 'Użytkownik kwestionuje rozwiązania, pokazuje bóle', color: '#F97316' },
    { value: 'neutral', label: '😐 Neutralny', desc: 'Obiektywny, wyważony punkt widzenia', color: '#64748B' },
    { value: 'enthusiastic', label: '😊 Entuzjastyczny', desc: 'Otwarty na innowacje, wczesny adopter', color: '#14B8A6' },
]

const LANG_OPTIONS: { value: Language; label: string }[] = [
    { value: 'pl', label: '🇵🇱 Polski' },
    { value: 'en', label: '🇬🇧 English' },
    { value: 'auto', label: '🤖 Auto (wykryj z kontekstu)' },
]

export default function SyntheticInterviews() {
    const [config, setConfig] = useState<InterviewConfig>(loadConfig)
    const [saved, setSaved] = useState(false)
    const { language } = useAppStore()

    const update = <K extends keyof InterviewConfig>(key: K, value: InterviewConfig[K]) => {
        setConfig(prev => ({ ...prev, [key]: value }))
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

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Users size={22} className="text-[#14B8A6]" />
                    <h1 className="text-2xl font-sans font-semibold text-[#0D2535] dark:text-slate-100">Syntetyczne wywiady</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-sans text-sm max-w-2xl">
                    Skonfiguruj profil archetypów użytkowników do syntetycznych wywiadów. Ta konfiguracja jest używana przy uruchomieniu każdej sesji Discovery.
                </p>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 shadow-sm border border-[#E2E8F0] dark:border-[#333333] space-y-8 transition-colors">

                {/* Liczba archetypów */}
                <div>
                    <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-1">
                        Liczba archetypów
                    </label>
                    <p className="text-xs text-slate-400 font-sans mb-4">Im więcej archetypów, tym bogatsze perspektywy — ale też dłuższy czas analizy.</p>
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
                    <div className="flex justify-between text-xs text-slate-400 font-sans mt-1 px-0.5">
                        <span>Min (1)</span>
                        <span>Zalecane (3–5)</span>
                        <span>Max (8)</span>
                    </div>
                </div>

                {/* Segment */}
                <div>
                    <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-3">Segment rynku</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {SEGMENTS.map(s => (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => update('segment', s.value)}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${config.segment === s.value
                                        ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/20'
                                        : 'border-[#E2E8F0] dark:border-[#333333] hover:border-[#CCFBF1] dark:hover:border-[#14B8A6]/40 bg-white dark:bg-[#141414]'
                                    }`}
                            >
                                <p className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-200">{s.label}</p>
                                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ton */}
                <div>
                    <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-3">Ton wywiadów</label>
                    <div className="space-y-2">
                        {TONES.map(t => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => update('tone', t.value)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${config.tone === t.value
                                        ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/20'
                                        : 'border-[#E2E8F0] dark:border-[#333333] hover:border-[#CCFBF1] dark:hover:border-[#14B8A6]/40 bg-white dark:bg-[#141414]'
                                    }`}
                            >
                                <span className="text-base">{t.label.split(' ')[0]}</span>
                                <div>
                                    <p className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-200">{t.label.split(' ').slice(1).join(' ')}</p>
                                    <p className="font-sans text-xs text-slate-500 dark:text-slate-400">{t.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Język */}
                <div>
                    <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-3">Język wywiadów</label>
                    <div className="flex gap-2 flex-wrap">
                        {LANG_OPTIONS.map(l => (
                            <button
                                key={l.value}
                                type="button"
                                onClick={() => update('language', l.value)}
                                className={`px-4 py-2 rounded-lg border-2 text-sm font-sans font-medium transition-all ${config.language === l.value
                                        ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/20 text-[#0D9488]'
                                        : 'border-[#E2E8F0] dark:border-[#333333] text-slate-600 dark:text-slate-400 hover:border-[#CCFBF1] dark:hover:border-[#14B8A6]/40'
                                    }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Kontekst demograficzny */}
                <div>
                    <label htmlFor="demography" className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-1">
                        Dodatkowy kontekst demograficzny <span className="font-normal text-slate-400">(​opcjonalnie)</span>
                    </label>
                    <p className="text-xs text-slate-400 font-sans mb-2">
                        Np. wiek, region, zawód, zachowania zakupowe. AI uwzględni te dane przy generowaniu archetypów.
                    </p>
                    <textarea
                        id="demography"
                        value={config.demographicContext}
                        onChange={e => update('demographicContext', e.target.value)}
                        rows={3}
                        placeholder="Np. Głównie kobiety 25–40 lat, mieszkanki miast, korzystające z aplikacji bankowych co najmniej 3x w tygodniu..."
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
                        placeholder={`Np.:\nCzy kiedykolwiek płaciłeś za podobne rozwiązanie?\nCo sprawiło, że zrezygnowałeś z poprzedniego narzędzia?`}
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
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-sans font-semibold rounded-lg transition-all shadow-sm ${saved
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
                    <strong className="text-slate-500 dark:text-slate-400">💡 Wskazówka:</strong> Konfiguracja jest zapisywana lokalnie w przeglądarce i automatycznie wczytywana przy kolejnych sesjach Discovery. W przyszłości będzie możliwe tworzenie profili i przypisywanie ich do projektów.
                </p>
            </div>
        </div>
    )
}

import { useState } from 'react'
import { Users, Save, RotateCcw, Check } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import PageGuideBanner from '../components/PageGuideBanner'

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
  hint: string
  options: ScopeOption[]
}

const SCOPE_CATEGORIES: ScopeCategoryDef[] = [
  {
    id: 'age',
    label: 'Przedział wiekowy',
    icon: '📅',
    hint: 'Wpływa na kontekst życiowy, przyzwyczajenia technologiczne i budżet. Zostaw puste jeśli produkt jest dla wszystkich grup wiekowych.',
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
    hint: 'Determinuje złożoność procesu zakupowego — freelancer decyduje sam w 5 min, duże firmy mają dział zakupów i nawet 6-miesięczny cykl decyzyjny.',
    options: [
      { value: 'freelancer', label: 'Freelancer / samozatrudniony' },
      { value: 'startup', label: 'Startup (≤50 os.)' },
      { value: 'scaleup', label: 'Firma rozwijająca się (50–500 os.)' },
      { value: 'enterprise', label: 'Duże przedsiębiorstwo (500+ os.)' },
      { value: 'public', label: 'Sektor publiczny / NGO' },
    ],
  },
  {
    id: 'role',
    label: 'Rola decyzyjna',
    icon: '🎯',
    hint: 'Kluczowe przy B2B. Decydent kupuje ale nie używa; użytkownik końcowy używa ale nie kupuje; blokujący może zablokować wdrożenie mimo podjętej decyzji zakupowej.',
    options: [
      { value: 'end_user', label: 'Użytkownik końcowy' },
      { value: 'champion', label: 'Ambasador / zaawansowany użytkownik' },
      { value: 'decision_maker', label: 'Decydent (zakup)' },
      { value: 'blocker', label: 'Blokujący (blokuje wdrożenie)' },
    ],
  },
  {
    id: 'adoption',
    label: 'Nastawienie do zmiany',
    icon: '🔄',
    hint: 'Definiuje stosunek do ryzyka i nowych narzędzi. Innowator kupi chętnie i bez dowodów; maruder zmieni się tylko pod silną presją bólu.',
    options: [
      { value: 'innovator', label: 'Innowator (pierwsza fala)' },
      { value: 'early_majority', label: 'Wczesna większość (pragmatycy)' },
      { value: 'late_majority', label: 'Późna większość (ostrożni)' },
      { value: 'laggard', label: 'Sceptyk / Maruder' },
    ],
  },
  {
    id: 'motivation',
    label: 'Motywacja zakupowa',
    icon: '💡',
    hint: 'Główne uzasadnienie zakupu. Rozmowa o redukcji kosztów wygląda zupełnie inaczej niż o wizerunku marki — AI dopasuje retorykę archetypu.',
    options: [
      { value: 'cost', label: 'Redukcja kosztów' },
      { value: 'revenue', label: 'Wzrost przychodów' },
      { value: 'time', label: 'Oszczędność czasu' },
      { value: 'compliance', label: 'Wymogi prawne / regulacje' },
      { value: 'prestige', label: 'Prestiż / wizerunek marki' },
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

      <PageGuideBanner
        storageKey="pd_guide_synthetic"
        badge="Instrukcja obsługi"
        title="Syntetyczne wywiady — jak to skonfigurować?"
        sections={[
          {
            title: '🎯 Trzy typowe scenariusze',
            content: (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-teal-50/60 dark:bg-teal-900/10 border border-[#14B8A6]/20">
                  <p className="text-xs font-semibold text-[#0D9488] mb-1">Eksploruję nowy rynek, nie wiem kto jest moim klientem</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Segment: <strong>Wielosegmentowy</strong> · Archetypy: <strong>4–5</strong> · Zakres: <strong>zostaw puste</strong> · Ton: <strong>Neutralny</strong></p>
                  <p className="text-xs text-slate-400 mt-1">AI sam dobierze przekrój osobowości. Dowiesz się kto w ogóle może być użytkownikiem.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-teal-50/60 dark:bg-teal-900/10 border border-[#14B8A6]/20">
                  <p className="text-xs font-semibold text-[#0D9488] mb-1">Znam segment, chcę zwalidować konkretny problem lub decyzję zakupową</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Segment: <strong>B2B / SaaS</strong> · Archetypy: <strong>4–5</strong> · Zakres: <strong>wypełnij rolę i kontekst org.</strong> · Ton: <strong>Sceptyczny</strong></p>
                  <p className="text-xs text-slate-400 mt-1">Sceptyczny ton wyciągnie prawdziwe obiekcje i bariery — bezcenne przed rozmowami z klientami.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-teal-50/60 dark:bg-teal-900/10 border border-[#14B8A6]/20">
                  <p className="text-xs font-semibold text-[#0D9488] mb-1">Testuję UI / weryfikuję feature z różnymi typami użytkowników</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Segment: <strong>Wielosegmentowy</strong> · Archetypy: <strong>3</strong> · Zakres: <strong>puste lub tylko nastawienie</strong> · Ton: <strong>Neutralny</strong></p>
                  <p className="text-xs text-slate-400 mt-1">Szeroki zakres + mało filtrów = przekrój od zaawansowanego użytkownika po marudera.</p>
                </div>
              </div>
            ),
          },
          {
            title: '⚙️ Mentalna mapa ustawień',
            content: (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-[#14B8A6] mb-1">Liczba archetypów = szerokość przekroju</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">System ma 8 wbudowanych "osi różnorodności" (wczesny adopter, pragmatyk, sceptyk, maruder…). Wybierasz ile z nich chcesz zbadać. <strong>8 = pełne spektrum</strong>, 3 = tylko pierwsze 3 osie.</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#14B8A6] mb-1">Zakres profilu = KTO z tej grupy</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400"><strong>Puste</strong> → AI decyduje samodzielnie → szeroki, bardziej losowy przekrój.<br /><strong>Wypełnione</strong> → zawężasz grupę, ale różnorodność zachowań zostaje zachowana wewnątrz niej. Np. "freelancer 25–34" da ci: wczesnego adoptera-freelancera, sceptyka-freelancera, pragmatyka-freelancera itd.</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#14B8A6] mb-1">Segment rynku = logika zachowań zakupowych</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">To ważniejsza decyzja niż zakres profilu. B2B vs. B2C generuje zupełnie inną psychologię archetypów (decydent ≠ użytkownik, ambasador vs. blokujący, zwrot z inwestycji vs. emocja).</p>
                </div>
              </div>
            ),
          },
          {
            title: '⚠️ Częste błędy',
            content: (
              <div className="space-y-2.5">
                {[
                  {
                    bad: 'Entuzjastyczny ton przy discovery',
                    why: 'Archetypy potwierdzają każdy pomysł. Wyniki wyglądają świetnie, ale są bezużyteczne — nie dowiesz się co blokuje zakup.',
                  },
                  {
                    bad: 'Za dużo filtrów zakresu jednocześnie',
                    why: 'Np. "18–24 lat + Duże przedsiębiorstwo + Decydent" jest niespójne. AI zacznie dryfować. Zostaw 1–2 filtry lub żaden.',
                  },
                  {
                    bad: '1–2 archetypy to za mało',
                    why: 'Nie zobaczysz wzorców. Minimum 3, żeby zobaczyć gdzie opinie się schodzą, a gdzie rozbiegają.',
                  },
                  {
                    bad: 'Zmiana konfiguracji w trakcie projektu',
                    why: 'Ta konfiguracja jest globalna — zmiana wpłynie na wszystkie nowe sesje Discovery. Ustaw raz przed startem projektu.',
                  },
                ].map(({ bad, why }) => (
                  <div key={bad} className="text-xs">
                    <p className="font-semibold text-slate-600 dark:text-slate-300">✗ {bad}</p>
                    <p className="text-slate-400 mt-0.5">{why}</p>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 shadow-sm border border-[#E2E8F0] dark:border-[#333333] space-y-8 transition-colors">

        {/* Liczba archetypów */}
        <div>
          <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-1">
            Liczba archetypów
          </label>
          <p className="text-xs text-slate-400 font-sans mb-1">
            System ma 8 wbudowanych osi różnorodności zachowań (early adopter → pragmatyk → sceptyk → laggard…). Wybierasz ile z nich zbadać.
          </p>
          <p className="text-xs text-slate-400 font-sans mb-4">
            <span className="text-slate-500 dark:text-slate-300 font-medium">3</span> = podstawowy przekrój (entuzjasta, pragmatyk, sceptyk) &nbsp;·&nbsp;
            <span className="text-slate-500 dark:text-slate-300 font-medium">5</span> = zalecane (+ maruder, impulsywny nabywca) &nbsp;·&nbsp;
            <span className="text-slate-500 dark:text-slate-300 font-medium">8</span> = pełne spektrum, wszystkie osie
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
          <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-1">
            Segment rynku
          </label>
          <p className="text-xs text-slate-400 font-sans mb-3">
            <strong className="text-slate-500 dark:text-slate-300">Najważniejsza decyzja w tej konfiguracji.</strong> Determinuje logikę zakupową i psychologię archetypów — B2B generuje decydentów, ambasadorów i blokujących; B2C generuje pragmatyków, impulsywnych nabywców i zaawansowanych użytkowników. Jeśli nie jesteś pewny — wybierz <strong className="text-slate-500 dark:text-slate-300">Mixed</strong>.
          </p>
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
          <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-1">
            Ton wywiadów
          </label>
          <p className="text-xs text-slate-400 font-sans mb-3">
            Determinuje jak archetyp reaguje na pytania. <strong className="text-slate-500 dark:text-slate-300">Do discovery zawsze używaj Sceptycznego</strong> — tylko sceptyczny archetyp ujawni prawdziwe obiekcje i bariery zakupowe zamiast potwierdzać każdy pomysł.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TONES.map(tone => (
              <button
                key={tone.value}
                type="button"
                onClick={() => update('tone', tone.value)}
                className={`flex flex-col items-start gap-1 py-3 px-3 rounded-xl border-2 transition-all text-left ${
                  config.tone === tone.value
                    ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-900/20'
                    : 'border-[#E2E8F0] dark:border-[#333333] hover:border-[#14B8A6]/40 bg-white dark:bg-[#141414]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{tone.emoji}</span>
                  <span className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-200">
                    {tone.label}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{tone.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Język wywiadów */}
        <div>
          <label className="block font-sans text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-1">
            Język wywiadów
          </label>
          <p className="text-xs text-slate-400 font-sans mb-3">
            W jakim języku AI prowadzi wywiad. <strong className="text-slate-500 dark:text-slate-300">Auto</strong> wykrywa język z opisu segmentu — przydatne jeśli budujesz produkt globalny lub testujesz różne rynki. Pamiętaj: angielski często generuje bardziej "korporacyjne" odpowiedzi niż polski.
          </p>
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
          <p className="text-xs text-slate-400 font-sans mb-1">
            Zaznacz atrybuty, które AI ma uwzględnić przy generowaniu archetypów. <strong className="text-slate-500 dark:text-slate-300">Puste = AI decyduje samodzielnie</strong> — daje szerszy, bardziej losowy przekrój.
          </p>
          <p className="text-xs text-slate-400 font-sans mb-5">
            Zaznaczenie filtrów zawęża grupę, ale zachowuje różnorodność zachowań wewnątrz niej (np. "freelancer" da ci: sceptycznego freelancera, entuzjastycznego freelancera itd.). Unikaj łączenia zbyt wielu filtrów naraz — np. "18–24 + Duże przedsiębiorstwo + Decydent" jest niespójne i AI zacznie dryfować.
          </p>

          <div className="space-y-5">
            {SCOPE_CATEGORIES.map(cat => {
              const selected = config.profileScope[cat.id] ?? []
              return (
                <div key={cat.id}>
                  <div className="mb-2">
                    <p className="text-xs font-semibold font-sans text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      {selected.length > 0 && (
                        <span className="font-normal normal-case tracking-normal text-[#14B8A6]">
                          ({selected.length})
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">{cat.hint}</p>
                  </div>
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
            Wszystko co wpiszesz tutaj trafia do każdego wywołania AI jako dodatkowy kontekst. Przydatne do: niszowej branży, konkretnego regionu geograficznego, specyficznego problemu. <strong className="text-slate-500 dark:text-slate-300">Nie powtarzaj tego co zaznaczyłeś w scope powyżej.</strong>
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
            AI doda te pytania do zestawu wywiadowego dla każdego archetypu. Jedno pytanie na linię. <strong className="text-slate-500 dark:text-slate-300">Najlepiej działają pytania o przeszłe zachowania</strong>, nie o preferencje — np. <em>"Kiedy ostatnio zrezygnowałeś z narzędzia? Co się stało?"</em> zamiast <em>"Czy wolisz prostsze narzędzia?"</em>
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

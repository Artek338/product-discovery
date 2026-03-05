import { useState, useEffect } from 'react'
import { BookOpen, Filter, CheckSquare, Square, ChevronDown, ChevronUp, X, Bot, Zap, ZapOff, Minus, AlertTriangle, ShieldAlert } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { FRAMEWORKS, CATEGORIES, AI_LABELS, type Framework } from '../data/frameworks'

const CAT_ICONS: Record<string, string> = {
    cycle: '🔄', problem: '🎯', validation: '🧪', market: '📡', artifact: '📋',
    prioritization: '⚖️', metrics: '📊',
}
const AUTO_ICONS: Record<string, string> = { yes: '⚡', partial: '〰️', no: '🔒' }

type Severity = 'FATAL' | 'HIGH' | 'MEDIUM'
type DiscoveryType = 'new_product' | 'feature' | 'service' | 'ai_product'
interface CheckItem { text: string; severity: Severity; contexts?: DiscoveryType[] }
interface CheckCategory {
    category: string; icon: string; description: string; items: CheckItem[]; contexts?: DiscoveryType[]
}

const RISK_CHECKLIST: CheckCategory[] = [
    {
        category: 'DISCOVERY & EVIDENCE', icon: '🔍',
        description: 'Jakość dowodów rynkowych zebranych przed decyzją GO',
        items: [
            { text: 'Czy evidence_grade ≥ 2? (zachowania z przeszłości, nie deklaracje "kupiłbym")', severity: 'FATAL' },
            { text: 'Czy przeprowadziłeś ≥5 wywiadów z segmentem docelowym?', severity: 'FATAL' },
            { text: 'Czy FATAL assumptions mają przypisanego ownera i konkretny deadline walidacji?', severity: 'FATAL' },
            { text: 'Czy Forces Diagram pokazuje (Push + Pull) > (Anxiety + Habit)?', severity: 'HIGH' },
            { text: 'Czy masz ≥1 design partner gotowego na regularne sesje feedbackowe?', severity: 'HIGH' },
            { text: 'Czy klienci aktywnie szukają rozwiązania dziś (workaroundy, search behavior, Reddit)?', severity: 'HIGH' },
        ]
    },
    {
        category: 'VALUE', icon: '💎',
        description: 'Czy produkt dostarcza realną, mierzalną wartość',
        items: [
            { text: 'Czy potrafisz sformułować JTBD: "Kiedy [sytuacja]... chcę [motywacja]... żeby [rezultat]"?', severity: 'FATAL' },
            { text: 'Czy problem jest wystarczająco bolesny — ktoś stracił pieniądze lub twarz przez jego brak?', severity: 'FATAL' },
            { text: 'Czy produkt stworzy mierzalną wartość dla klientów (czas, pieniądze, status, spokój)?', severity: 'HIGH' },
            { text: 'Czy użytkownicy będą wracać i używać regularnie (jest sygnał retencji)?', severity: 'HIGH' },
            { text: 'Czy masz dowód że klienci próbują rozwiązać ten problem sami (workarounds, DIY)?', severity: 'HIGH' },
        ]
    },
    {
        category: 'USABILITY', icon: '🖱️',
        description: 'Czy użytkownicy potrafią z tego korzystać samodzielnie',
        items: [
            { text: 'Czy nowy użytkownik osiąga "Aha Moment" bez pomocy w czasie <5 minut?', severity: 'HIGH' },
            { text: 'Czy ludzie będą wiedzieć jak go używać (bez dokumentacji, bez tutoriala)?', severity: 'HIGH' },
            { text: 'Czy onboarding doprowadzi do first value szybciej niż alternatywa (Excel, konkurent)?', severity: 'HIGH' },
            { text: 'Czy nie podniesie kognitywnego obciążenia (cognitive load) w workflow klienta?', severity: 'MEDIUM' },
            { text: 'Czy znajdą produkt tam, gdzie szukają (SEO, marketplace, AppStore, polecenie)?', severity: 'MEDIUM' },
        ]
    },
    {
        category: 'VIABILITY', icon: '💰',
        description: 'Czy model biznesowy jest opłacalny i skalowalny',
        items: [
            { text: 'Czy możemy monetyzować? Klient płaci za wynik, czas, dostęp czy status?', severity: 'FATAL' },
            { text: 'Czy LTV:CAC ratio > 3:1 (lub masz realistyczny plan dojścia do tego w 12 mies.)?', severity: 'FATAL' },
            { text: 'Czy masz ≥1 klienta gotowego zapłacić z góry (presell, LOI, depozyt)?', severity: 'HIGH' },
            { text: 'Czy gross margin > 60% przy skali (SaaS) lub > 30% (marketplace)?', severity: 'HIGH' },
            { text: 'Czy możemy wspierać klientów przy skali (CS, onboarding, dokumentacja)?', severity: 'MEDIUM' },
            { text: 'Czy będzie zgodny z regulacjami (RODO/GDPR, branżowe licencje, compliance)?', severity: 'MEDIUM' },
            { text: 'Jaki byłby koszt skalowania AI (tokeny, GPU, limity API) przy 10×, 100× użytkownikach?', severity: 'MEDIUM', contexts: ['new_product', 'ai_product'] as DiscoveryType[] },
            { text: 'Czy nowa funkcja wyraźnie wpłynie na retencję, NPS lub upsell — masz mierzalne kryterium sukcesu PRZED budową?', severity: 'FATAL', contexts: ['feature'] as DiscoveryType[] },
            { text: 'Czy koszt utrzymania i złożoność techniczna funkcji są proporcjonalne do jej wpływu na KPI?', severity: 'HIGH', contexts: ['feature'] as DiscoveryType[] },
        ]
    },
    {
        category: 'FEASIBILITY', icon: '⚙️',
        description: 'Czy jesteśmy w stanie to zbudować z obecnymi zasobami',
        items: [
            { text: 'Czy możemy to zbudować z dostępną technologią, teamem i budżetem?', severity: 'FATAL' },
            { text: 'Czy zrobiłeś spike techniczny dla najryzykowniejszego założenia technicznego?', severity: 'HIGH' },
            { text: 'Czy niezbędne integracje i dostępy do API są możliwe i dostępne?', severity: 'HIGH' },
            { text: 'Czy możemy to dostarczyć efektywnie i skalować architektonicznie bez przepisywania?', severity: 'MEDIUM' },
        ]
    },
    {
        category: 'ETHICS', icon: '⚖️',
        description: 'Czy powinniśmy to budować — odpowiedzialność i ryzyko',
        items: [
            { text: 'Czy w ogóle powinniśmy to budować? (odpowiedź "nie wiem" = stop i zbadaj)', severity: 'FATAL' },
            { text: 'Czy produkt stworzy ryzyko finansowe, zdrowotne lub reputacyjne dla klientów?', severity: 'HIGH' },
            { text: 'Czy są kwestie prawne lub regulacyjne które mogą zablokować produkt po launchu?', severity: 'HIGH' },
            { text: 'Czy produkt nie powiększa istniejących nierówności (dostęp, cena, digital divide)?', severity: 'MEDIUM' },
        ]
    },
    {
        category: 'GO-TO-MARKET', icon: '🚀',
        description: 'Strategia dotarcia do klientów i pozyskania pierwszych płacących',
        contexts: ['new_product', 'service', 'ai_product'] as DiscoveryType[],
        items: [
            { text: 'Czy masz jasną odpowiedź na "Dlaczego teraz?" — co zmieniło się w rynku lub technologii?', severity: 'HIGH' },
            { text: 'Czy Twój ICP (Ideal Customer Profile) jest precyzyjny (<100 firm lub <1000 osób na start)?', severity: 'HIGH' },
            { text: 'Czy możemy dotrzeć do ICP w sposób powtarzalny i opłacalny (CAC < LTV/3)?', severity: 'HIGH' },
            { text: 'Czy messaging jasno komunikuje "dlaczego teraz" i "dlaczego my"?', severity: 'MEDIUM' },
            { text: 'Czy mamy odpowiednie kanały dystrybucji (gdzie ICP szuka rozwiązań)?', severity: 'MEDIUM' },
            { text: 'Czy możemy przekonać klientów do próby bez długiego procesu sprzedaży?', severity: 'MEDIUM' },
            { text: 'Czy timing launchu uwzględnia sezonowość, pipeline konkurencji i gotowość rynku?', severity: 'MEDIUM' },
        ]
    },
    {
        category: 'STRATEGY & OBJECTIVES', icon: '🎯',
        description: 'Dopasowanie strategiczne i defensywność pozycji',
        items: [
            { text: 'Czy wiesz czego NIE robią top 3 konkurenci dziś (whitespace / underserved segment)?', severity: 'HIGH' },
            { text: 'Czy masz DHM: co ZACHWYCI userów? Co jest trudne do skopiowania? Czy marża jest zdrowa?', severity: 'HIGH' },
            { text: 'Co musi być prawdą, żeby nasza strategia zadziałała — i jakie dowody mamy na każde z tych założeń?', severity: 'HIGH' },
            { text: 'Czy competitor może skopiować to w 6 miesięcy bez bariery (danych, relacji, regulacji)?', severity: 'HIGH' },
            { text: 'Czy to są najważniejsze problemy do rozwiązania TERAZ — a nie za 2 lata?', severity: 'MEDIUM' },
            { text: 'Czy rozważyliśmy czynniki zewnętrzne: regulacje, kurs walut, zmiany polityczne?', severity: 'MEDIUM' },
            { text: 'Co stanowi nasz AI moat? Dane własnościowe? Dystrybucja? Zaufanie? Retention loop?', severity: 'MEDIUM', contexts: ['new_product', 'service', 'ai_product'] as DiscoveryType[] },
            { text: 'Czy ta funkcja wynika ze spójnej strategii produktu, czy jest reaktywną odpowiedzią na request klienta?', severity: 'HIGH', contexts: ['feature'] as DiscoveryType[] },
            { text: 'Czy masz zdefiniowane metryki sukcesu i kryterium "launch ready" dla tej funkcji — zanim zaczniesz budować?', severity: 'HIGH', contexts: ['feature'] as DiscoveryType[] },
        ]
    },
    {
        category: 'AI & AUTONOMY', icon: '🤖',
        description: 'Specyficzne ryzyka produktów z komponentem AI',
        contexts: ['ai_product'] as DiscoveryType[],
        items: [
            { text: 'Czy AI będzie zachowywać się przewidywalnie i zgodnie z oczekiwaniami w warunkach produkcyjnych?', severity: 'FATAL' },
            { text: 'Czy możemy kontrolować, co AI robi i do jakich danych ma dostęp?', severity: 'HIGH' },
            { text: 'Co się stanie gdy zewnętrzny model (OpenAI, Anthropic) zmieni politykę lub API?', severity: 'HIGH' },
            { text: 'Co się stanie gdy zewnętrzny serwer MCP lub narzędzie zostanie skompromitowane?', severity: 'HIGH' },
            { text: 'Czy mamy procesy monitorowania wydajności AI w czasie (drift, hallucinations, degradacja)?', severity: 'HIGH' },
            { text: 'Czy mamy guardrails i human-in-the-loop dla decyzji o wysokiej stawce?', severity: 'HIGH' },
            { text: 'Czy jesteśmy w stanie wykrywać i reagować na błędy krytyczne w czasie <1h?', severity: 'HIGH' },
            { text: 'Czy użytkownicy wiedzą kiedy interagują z AI (transparency, labeling)?', severity: 'MEDIUM' },
        ]
    },
]

const SEVERITY_CONFIG = {
    FATAL: { label: 'FATAL', bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-900/50', dot: 'bg-red-500' },
    HIGH: { label: 'HIGH', bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/40', dot: 'bg-orange-400' },
    MEDIUM: { label: 'MED', bg: 'bg-slate-50 dark:bg-slate-900/40', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-100 dark:border-[#333]', dot: 'bg-slate-300' },
}

const CHECKLIST_STORAGE_KEY = 'risk_checklist_v2'
const CHECKLIST_CONTEXT_KEY = 'checklist_context'

const DISCOVERY_TYPES: { id: DiscoveryType; label: string; icon: string; description: string }[] = [
    { id: 'new_product', icon: '🆕', label: 'Nowy produkt', description: 'Zupełnie nowy produkt dla nowego segmentu lub rynku' },
    { id: 'feature', icon: '✨', label: 'Feature / usprawnienie', description: 'Nowa funkcja lub ulepszenie istniejącego produktu' },
    { id: 'service', icon: '🛠️', label: 'Usługa / serwis', description: 'Oferta usługowa, konsulting lub proces operacyjny' },
    { id: 'ai_product', icon: '🤖', label: 'Produkt AI', description: 'Produkt z kluczowym komponentem AI/ML/LLM' },
]

type Tab = 'frameworks' | 'when' | 'checklist' | 'yoda'

const WORTHLESS_SIGNALS = [
    'Opinia eksperta lub osoby z zewnątrz ("To świetny pomysł!" / "Nikt tego nie kupi")',
    'Zachęty lub zniechęcenia ("Rób to!" / "Porzuć to!")',
    'Polubienia i komentarze w mediach społecznościowych (kciuki w górę)',
    'Ankiety, sondaże i wywiady — deklaracje ("Kupiłbym na 5/5")',
    'Jednorazowe lub fałszywe dane kontaktowe (zmyślony e-mail / telefon)',
]

const YODA_SCORES = [
    { id: 'email', action: 'Zwalidowany adres e-mail', detail: 'Z wyraźną świadomością klienta, że będzie używany do informacji o produkcie', points: 1 },
    { id: 'phone', action: 'Zwalidowany numer telefonu', detail: 'Klient wie, że zadzwonisz w sprawie produktu', points: 10 },
    { id: 'time', action: 'Zobowiązanie czasowe (np. demo 30 min)', detail: 'Klient poświęca czas i stawia się na spotkanie', points: 30 },
    { id: 'deposit', action: 'Wpłacenie zaliczki / kaucji', detail: 'Np. $50 na listę oczekujących — realne ryzyko finansowe', points: 50 },
    { id: 'order', action: 'Złożenie pełnego zamówienia', detail: 'Płatność z góry za jedną z pierwszych dostępnych sztuk', points: 250 },
]

const PRETOTYPE_TECHNIQUES = [
    { name: 'Fake Door', description: 'Tworzenie punktu wejścia (reklama, przycisk) dla produktu/funkcji które jeszcze nie istnieją. Mierzy odsetek osób próbujących faktycznie dokonać zakupu.' },
    { name: 'Facade (Fasada)', description: 'Produkt wygląda w pełni funkcjonalnie, ale cała obsługa odbywa się ręcznie. Np. sprzedaż online realizowana przez pracowników w tle.' },
    { name: 'Mechanical Turk', description: 'Zastąpienie drogiej technologii żywym człowiekiem ukrytym za kulisami. IBM testował speech-to-text z maszynistką w sąsiednim pokoju.' },
    { name: 'Pinocchio', description: 'Całkowicie niefunkcjonalny fizyczny odpowiednik produktu (np. drewniany klocek zamiast palmtopa). Bada ergonomię i kontekst użycia.' },
    { name: 'Provincial', description: 'Test w bardzo małym, nieformalnym środowisku (np. parking przed sklepem). Oszczędza infrastrukturę, daje twarde dane z pierwszej ręki.' },
    { name: 'Infiltrator', description: 'Podrzucenie własnych prototypów na półki w cudzym sklepie, by sprawdzić czy klienci chwytają i płacą za nowy produkt.' },
]

const YODA_CALC_KEY = 'yoda_calculator_v1'
const YODA_EXP_KEY = 'yoda_experiments_v1'

interface Experiment {
    id: string
    name: string
    technique: string
    date: string
    opportunities: number
    actions: number
    yodaCounts: Record<string, number>
}

function calcYodaScore(counts: Record<string, number>): number {
    return YODA_SCORES.reduce((s, r) => s + (counts[r.id] ?? 0) * r.points, 0)
}

function yodaLevel(total: number): { label: string; color: string } | null {
    if (total === 0) return null
    if (total < 30) return { label: 'Słaby sygnał', color: '#94A3B8' }
    if (total < 150) return { label: 'Umiarkowany sygnał', color: '#F97316' }
    if (total < 500) return { label: 'Dobry sygnał', color: '#3B82F6' }
    return { label: 'Silny sygnał rynkowy', color: '#14B8A6' }
}

function exportCsv(experiments: Experiment[]) {
    const header = ['Nazwa', 'Technika', 'Data', 'Szanse (ILI)', 'Akcje (ILI)', 'ILI %', 'Wynik YODA', 'Poziom']
    const rows = experiments.map(e => {
        const ili = e.opportunities > 0 ? ((e.actions / e.opportunities) * 100).toFixed(1) : '—'
        const score = calcYodaScore(e.yodaCounts)
        const lvl = yodaLevel(score)?.label ?? '—'
        return [e.name, e.technique, e.date, e.opportunities, e.actions, ili, score, lvl]
    })
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `yoda-experiments-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
}

function YodaTab() {
    // Persisted calculator
    const [counts, setCounts] = useState<Record<string, number>>(() => {
        try { return JSON.parse(localStorage.getItem(YODA_CALC_KEY) ?? '{}') } catch { return {} }
    })

    useEffect(() => {
        localStorage.setItem(YODA_CALC_KEY, JSON.stringify(counts))
    }, [counts])

    const total = calcYodaScore(counts)
    const level = yodaLevel(total)

    // ILI Calculator
    const [iliOpp, setIliOpp] = useState('')
    const [iliAct, setIliAct] = useState('')
    const iliPct = iliOpp && Number(iliOpp) > 0
        ? ((Number(iliAct) / Number(iliOpp)) * 100).toFixed(1)
        : null

    // Experiments tracker
    const [experiments, setExperiments] = useState<Experiment[]>(() => {
        try { return JSON.parse(localStorage.getItem(YODA_EXP_KEY) ?? '[]') } catch { return [] }
    })
    const [showNewExp, setShowNewExp] = useState(false)
    const [newExp, setNewExp] = useState<Omit<Experiment, 'id'>>({ name: '', technique: 'Fake Door', date: new Date().toISOString().slice(0, 10), opportunities: 0, actions: 0, yodaCounts: {} })

    useEffect(() => {
        localStorage.setItem(YODA_EXP_KEY, JSON.stringify(experiments))
    }, [experiments])

    function saveExp() {
        if (!newExp.name.trim()) return
        setExperiments(prev => [{ ...newExp, id: crypto.randomUUID() }, ...prev])
        setNewExp({ name: '', technique: 'Fake Door', date: new Date().toISOString().slice(0, 10), opportunities: 0, actions: 0, yodaCounts: {} })
        setShowNewExp(false)
    }

    function deleteExp(id: string) {
        setExperiments(prev => prev.filter(e => e.id !== id))
    }

    const isDark = document.documentElement.classList.contains('dark')

    return (
        <div className="space-y-8 max-w-3xl">

            {/* Header */}
            <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0D2535 0%, #1E4060 100%)' }}>
                <h2 className="font-sans font-bold text-xl mb-1">YODA — Your Own Data</h2>
                <p className="text-slate-300 text-sm font-sans leading-relaxed">
                    Metodologia Pretotyping (Alberto Savoia): <strong className="text-white">"Data beats Opinion"</strong>.
                    Twarde dowody zbierane zanim napiszesz linijkę kodu.
                    Klucz: <strong className="text-white">Skin in the Game</strong> — tylko akcje kosztujące użytkownika (czas, pieniądze, reputacja) mają wartość.
                </p>
            </div>

            {/* Worthless signals */}
            <div>
                <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base mb-1">Sygnały bezwartościowe (0 pkt)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-3">Te dane NIE są dowodem rynkowym — nie wliczaj ich do kalkulatora YODA.</p>
                <div className="rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 divide-y divide-red-100 dark:divide-red-900/40">
                    {WORTHLESS_SIGNALS.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3">
                            <span className="text-red-400 shrink-0 font-bold text-sm mt-0.5">✕</span>
                            <p className="text-xs font-sans text-slate-700 dark:text-slate-300">{s}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scoring table */}
            <div>
                <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base mb-1">Tabela punktacji YODA — Skin in the Game</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-4">Im więcej klient ryzykuje (czas, pieniądze, reputację), tym cenniejszy dowód.</p>
                <div className="overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-[#233A4D]">
                    <table className="w-full text-sm font-sans">
                        <thead>
                            <tr className="bg-[#F8FAFC] dark:bg-[#1A1A1A]">
                                <th className="text-left p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Akcja użytkownika</th>
                                <th className="text-left p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Szczegół</th>
                                <th className="text-center p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Punkty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333333]">
                            {YODA_SCORES.map(row => (
                                <tr key={row.id} className="bg-white dark:bg-[#141414] transition-colors">
                                    <td className="p-3 text-slate-700 dark:text-slate-200 font-medium">{row.action}</td>
                                    <td className="p-3 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{row.detail}</td>
                                    <td className="p-3 text-center">
                                        <span className={`font-mono font-bold text-sm ${row.points >= 250 ? 'text-[#14B8A6] dark:text-teal-400' :
                                                row.points >= 50 ? 'text-[#3B82F6] dark:text-blue-400' :
                                                    row.points >= 30 ? 'text-[#8B5CF6] dark:text-violet-400' :
                                                        'text-slate-600 dark:text-slate-400'
                                            }`}>
                                            +{row.points} pkt
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Calculator */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E2E8F0] dark:border-[#333333] shadow-sm overflow-hidden transition-colors">
                <div className="p-4 border-b border-[#E2E8F0] dark:border-[#333333] flex items-center justify-between">
                    <div>
                        <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base">Kalkulator YODA</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Wpisz ile dowodów każdego typu zebrałeś — dane są zapamiętywane</p>
                    </div>
                    <button onClick={() => setCounts({})} className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors font-sans">Reset</button>
                </div>
                <div className="p-4 space-y-3">
                    {YODA_SCORES.map(row => (
                        <div key={row.id} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-sans font-medium text-[#0D2535] dark:text-slate-200 truncate">{row.action}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">× {row.points} pkt</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setCounts(p => ({ ...p, [row.id]: Math.max(0, (p[row.id] ?? 0) - 1) }))}
                                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333333] text-slate-600 dark:text-slate-300 font-bold text-sm transition-colors"
                                >−</button>
                                <span className="w-8 text-center font-mono font-bold text-[#0D2535] dark:text-slate-200">{counts[row.id] ?? 0}</span>
                                <button
                                    onClick={() => setCounts(p => ({ ...p, [row.id]: (p[row.id] ?? 0) + 1 }))}
                                    className="w-7 h-7 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-sm transition-colors"
                                >+</button>
                                <span className="w-16 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
                                    = {(counts[row.id] ?? 0) * row.points} pkt
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-[#E2E8F0] dark:border-[#333333]" style={{ backgroundColor: total > 0 ? undefined : (isDark ? '#111' : '#F8FAFC') }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mb-0.5">Łączny wynik YODA</p>
                            <p className="font-mono font-bold text-3xl" style={{ color: level?.color ?? '#94A3B8' }}>
                                {total} pkt
                            </p>
                            {level && <p className="text-sm font-semibold font-sans mt-1" style={{ color: level.color }}>{level.label}</p>}
                            {!level && <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-1">Zacznij zbierać twarde dane</p>}
                        </div>
                        {total > 0 && (
                            <div className="text-right text-xs font-sans text-slate-500 dark:text-slate-400 space-y-0.5">
                                <p>0–29 → Słaby sygnał</p>
                                <p>30–149 → Umiarkowany</p>
                                <p>150–499 → Dobry sygnał</p>
                                <p className="font-semibold text-[#14B8A6] dark:text-teal-400">500+ → Silny sygnał</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ILI / OLI Calculator */}
            <div>
                <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base mb-1">Kalkulator ILI — Initial Level of Interest</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-4">
                    ILI mierzy jaki procent osób, które miały szansę, faktycznie wykonało oczekiwaną akcję.
                    Np. 200 odwiedzin strony fake-door → 18 kliknięć "Kup teraz" = ILI 9%.
                </p>
                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E2E8F0] dark:border-[#333333] p-5">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 font-sans uppercase tracking-wider">Szanse (Opportunities)</label>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mb-2">Ile osób miało możliwość wykonania akcji?</p>
                            <input
                                type="number" min="0" value={iliOpp}
                                onChange={e => setIliOpp(e.target.value)}
                                placeholder="np. 200"
                                className="w-full rounded-lg border border-[#E2E8F0] dark:border-[#333333] bg-[#F8FAFC] dark:bg-[#111] text-[#0D2535] dark:text-slate-100 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 font-sans uppercase tracking-wider">Akcje (Actions)</label>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mb-2">Ile faktycznie wykonało docelową akcję?</p>
                            <input
                                type="number" min="0" value={iliAct}
                                onChange={e => setIliAct(e.target.value)}
                                placeholder="np. 18"
                                className="w-full rounded-lg border border-[#E2E8F0] dark:border-[#333333] bg-[#F8FAFC] dark:bg-[#111] text-[#0D2535] dark:text-slate-100 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40"
                            />
                        </div>
                    </div>
                    {iliPct !== null && (
                        <div className="rounded-xl bg-[#F0FDFA] dark:bg-teal-950/30 border border-[#CCFBF1] dark:border-teal-900/50 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">ILI — Initial Level of Interest</p>
                                <p className="font-mono font-bold text-3xl text-[#0D9488] dark:text-teal-400">{iliPct}%</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
                                    {Number(iliPct) >= 10 ? 'Silny sygnał zainteresowania' :
                                        Number(iliPct) >= 3 ? 'Umiarkowany sygnał' :
                                            'Słaby — sprawdź kanał lub messaging'}
                                </p>
                            </div>
                            <div className="text-right text-xs font-sans text-slate-400 dark:text-slate-500 space-y-0.5">
                                <p>&lt;3% → słaby</p>
                                <p>3–10% → umiarkowany</p>
                                <p className="text-[#0D9488] dark:text-teal-400 font-semibold">&gt;10% → silny</p>
                            </div>
                        </div>
                    )}
                    {iliPct === null && (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 font-sans py-3">Wpisz dane aby zobaczyć wynik ILI</p>
                    )}
                </div>
            </div>

            {/* Experiments tracker */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base">Tracker eksperymentów</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Rejestruj każdy test rynkowy — dane są zapamiętywane w przeglądarce</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {experiments.length > 0 && (
                            <button
                                onClick={() => exportCsv(experiments)}
                                className="text-xs font-sans px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#333333] text-slate-600 dark:text-slate-300 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
                            >Eksport CSV</button>
                        )}
                        <button
                            onClick={() => setShowNewExp(v => !v)}
                            className="text-xs font-sans px-3 py-1.5 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488] text-white transition-colors"
                        >{showNewExp ? 'Anuluj' : '+ Nowy eksperyment'}</button>
                    </div>
                </div>

                {/* New experiment form */}
                {showNewExp && (
                    <div className="mb-4 rounded-2xl border border-[#14B8A6]/40 bg-[#F0FDFA] dark:bg-teal-950/20 p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nazwa eksperymentu</label>
                                <input
                                    value={newExp.name}
                                    onChange={e => setNewExp(p => ({ ...p, name: e.target.value }))}
                                    placeholder="np. Fake Door kampania LinkedIn — B2B SaaS"
                                    className="w-full rounded-lg border border-[#E2E8F0] dark:border-[#333333] bg-white dark:bg-[#111] text-[#0D2535] dark:text-slate-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Technika pretotypingowa</label>
                                <select
                                    value={newExp.technique}
                                    onChange={e => setNewExp(p => ({ ...p, technique: e.target.value }))}
                                    className="w-full rounded-lg border border-[#E2E8F0] dark:border-[#333333] bg-white dark:bg-[#111] text-[#0D2535] dark:text-slate-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40"
                                >
                                    {PRETOTYPE_TECHNIQUES.map(t => <option key={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data</label>
                                <input
                                    type="date" value={newExp.date}
                                    onChange={e => setNewExp(p => ({ ...p, date: e.target.value }))}
                                    className="w-full rounded-lg border border-[#E2E8F0] dark:border-[#333333] bg-white dark:bg-[#111] text-[#0D2535] dark:text-slate-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Szanse (ILI)</label>
                                <input
                                    type="number" min="0" value={newExp.opportunities || ''}
                                    onChange={e => setNewExp(p => ({ ...p, opportunities: Number(e.target.value) }))}
                                    placeholder="np. 500"
                                    className="w-full rounded-lg border border-[#E2E8F0] dark:border-[#333333] bg-white dark:bg-[#111] text-[#0D2535] dark:text-slate-100 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Akcje (ILI)</label>
                                <input
                                    type="number" min="0" value={newExp.actions || ''}
                                    onChange={e => setNewExp(p => ({ ...p, actions: Number(e.target.value) }))}
                                    placeholder="np. 47"
                                    className="w-full rounded-lg border border-[#E2E8F0] dark:border-[#333333] bg-white dark:bg-[#111] text-[#0D2535] dark:text-slate-100 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dowody YODA zebrane w tym eksperymencie</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {YODA_SCORES.map(row => (
                                    <div key={row.id} className="flex items-center gap-2">
                                        <span className="text-xs font-sans text-slate-600 dark:text-slate-300 flex-1 truncate">{row.action} ({row.points} pkt)</span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setNewExp(p => ({ ...p, yodaCounts: { ...p.yodaCounts, [row.id]: Math.max(0, (p.yodaCounts[row.id] ?? 0) - 1) } }))} className="w-6 h-6 rounded bg-white dark:bg-[#222] border border-[#E2E8F0] dark:border-[#333] text-xs font-bold text-slate-600 dark:text-slate-300">−</button>
                                            <span className="w-6 text-center font-mono text-xs font-bold text-[#0D2535] dark:text-slate-200">{newExp.yodaCounts[row.id] ?? 0}</span>
                                            <button onClick={() => setNewExp(p => ({ ...p, yodaCounts: { ...p.yodaCounts, [row.id]: (p.yodaCounts[row.id] ?? 0) + 1 } }))} className="w-6 h-6 rounded bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            {newExp.opportunities > 0 && (
                                <span className="text-xs font-sans text-slate-500 self-center">
                                    ILI: {newExp.opportunities > 0 ? ((newExp.actions / newExp.opportunities) * 100).toFixed(1) : 0}% ·
                                    YODA: {calcYodaScore(newExp.yodaCounts)} pkt
                                </span>
                            )}
                            <button
                                onClick={saveExp}
                                disabled={!newExp.name.trim()}
                                className="px-4 py-1.5 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-40 text-white text-sm font-sans transition-colors"
                            >Zapisz eksperyment</button>
                        </div>
                    </div>
                )}

                {/* Experiments list */}
                {experiments.length === 0 && !showNewExp && (
                    <div className="text-center py-10 rounded-2xl border border-dashed border-[#E2E8F0] dark:border-[#333333]">
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-sans">Brak zapisanych eksperymentów</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-1">Kliknij „+ Nowy eksperyment" aby zarejestrować pierwszy test rynkowy</p>
                    </div>
                )}

                {experiments.length > 0 && (
                    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-[#333333]">
                        <table className="w-full text-xs font-sans">
                            <thead>
                                <tr className="bg-[#F8FAFC] dark:bg-[#1A1A1A]">
                                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Eksperyment</th>
                                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Technika</th>
                                    <th className="text-center p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider\">ILI %</th>
                                    <th className="text-center p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">YODA pkt</th>
                                    <th className="text-center p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Poziom</th>
                                    <th className="p-3 w-8" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333333]">
                                {experiments.map(e => {
                                    const ili = e.opportunities > 0 ? ((e.actions / e.opportunities) * 100).toFixed(1) : '—'
                                    const score = calcYodaScore(e.yodaCounts)
                                    const lvl = yodaLevel(score)
                                    return (
                                        <tr key={e.id} className="bg-white dark:bg-[#141414] transition-colors">
                                            <td className="p-3">
                                                <p className="font-medium text-[#0D2535] dark:text-slate-200">{e.name}</p>
                                                <p className="text-slate-400 dark:text-slate-500">{e.date}</p>
                                            </td>
                                            <td className="p-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{e.technique}</td>
                                            <td className="p-3 text-center">
                                                <span className={`font-mono font-bold ${ili === '—' ? 'text-slate-400' :
                                                        Number(ili) >= 10 ? 'text-[#14B8A6]' :
                                                            Number(ili) >= 3 ? 'text-[#F97316]' : 'text-slate-500'
                                                    }`}>{ili}{ili !== '—' ? '%' : ''}</span>
                                            </td>
                                            <td className="p-3 text-center font-mono font-bold" style={{ color: lvl?.color ?? '#94A3B8' }}>{score}</td>
                                            <td className="p-3 text-center">
                                                {lvl && <span className="text-xs font-sans" style={{ color: lvl.color }}>{lvl.label}</span>}
                                                {!lvl && <span className="text-slate-400 text-xs">—</span>}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => deleteExp(e.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors text-xs">✕</button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pretotype techniques */}
            <div>
                <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base mb-3">6 technik pretotypowania</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRETOTYPE_TECHNIQUES.map(t => (
                        <div key={t.name} className="p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#E2E8F0] dark:border-[#333333] hover:border-[#14B8A6] dark:hover:border-[#14B8A6] transition-colors">
                            <p className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-200 mb-1">{t.name}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{t.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/30 border border-[#FED7AA] dark:border-orange-900/50">
                <p className="text-xs font-semibold text-[#C2410C] dark:text-orange-400 font-sans mb-1">Pamiętaj</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-sans">Pretotyping NIE sprawdza ryzyka technicznego (feasibility). Odpowiada tylko na pytanie: „Czy ktokolwiek tego chce i zapłaci za to?". Feasibility weryfikuj osobno poprzez spike techniczny lub PoC.</p>
            </div>
        </div>
    )
}


// ─── Framework Detail Modal (right drawer) ──────────────────────────────────
function FrameworkModal({ fw, onClose }: { fw: Framework; onClose: () => void }) {
    const cat = CATEGORIES[fw.category]
    const ai = AI_LABELS[fw.aiAutomation]

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [onClose])

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="relative ml-auto w-full max-w-2xl h-full bg-white dark:bg-[#1A1A1A] shadow-2xl flex flex-col overflow-hidden"
                style={{ animation: 'slideIn 200ms ease-out' }}>
                <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

                {/* Drawer header */}
                <div className="flex items-start gap-4 p-6 border-b border-[#E2E8F0] dark:border-[#333333]">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: cat.color + '18', color: cat.color }}>
                                {cat.label}
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: ai.bg, color: ai.color }}>
                                {AUTO_ICONS[fw.aiAutomation]} AI: {ai.label}
                            </span>
                        </div>
                        <h2 className="font-sans font-bold text-[#0D2535] dark:text-slate-100 text-xl leading-tight">
                            {fw.name}
                            {fw.shortName && <span className="ml-2 text-slate-400 dark:text-slate-500 font-normal text-base">({fw.shortName})</span>}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{fw.author}</p>
                    </div>
                    <button onClick={onClose}
                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                    {/* Meta strip */}
                    <div className="flex items-center gap-6 px-6 py-3 bg-[#F8FAFC] dark:bg-[#141414] border-b border-[#E2E8F0] dark:border-[#333333] text-xs text-slate-500 dark:text-slate-400 font-sans">
                        <span>Złożoność: <strong className="text-[#0D2535] dark:text-slate-200">{'★'.repeat(fw.complexity)}{'☆'.repeat(5 - fw.complexity)}</strong></span>
                        <span>Czas cyklu: <strong className="text-[#0D2535] dark:text-slate-200">{fw.cycleDuration}</strong></span>
                    </div>

                    {/* Assumption */}
                    <div className="px-6 py-5 border-b border-[#F1F5F9] dark:border-[#333333]">
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-sans italic leading-relaxed">
                            „{fw.assumption}"
                        </p>
                    </div>

                    {/* Phases */}
                    <div className="px-6 py-5 border-b border-[#F1F5F9] dark:border-[#333333]">
                        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Etapy</p>
                        <div className="space-y-4">
                            {fw.imageUrl && (
                                <div className="mb-4 rounded-xl border border-[#E2E8F0] dark:border-[#333333] overflow-hidden bg-white dark:bg-[#1A1A1A] p-2">
                                    <img src={fw.imageUrl} alt={fw.name} className="w-full h-auto object-contain" />
                                </div>
                            )}
                            <div className="space-y-2">
                                {fw.phases.map((p, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 font-sans">
                                        <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                                            style={{ backgroundColor: cat.color }}>
                                            {i + 1}
                                        </span>
                                        {p}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Examples */}
                    {fw.examples && (
                        <div className="px-6 py-5 border-b border-[#F1F5F9] dark:border-[#333333] bg-[#F8FAFC] dark:bg-[#141414]">
                            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Przykłady zastosowania</p>
                            <ul className="space-y-2">
                                {fw.examples.map((ex, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 font-sans">
                                        <span className="text-[#14B8A6] mt-1">•</span>
                                        {ex}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Artifacts */}
                    <div className="px-6 py-5 border-b border-[#F1F5F9] dark:border-[#333333]">
                        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Artefakty</p>
                        <div className="flex flex-wrap gap-1.5">
                            {fw.artifacts.map(a => (
                                <span key={a} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-[#333333] rounded-lg text-slate-700 dark:text-slate-300">{a}</span>
                            ))}
                        </div>
                    </div>

                    {/* When / Limitations */}
                    <div className="grid grid-cols-2 divide-x divide-[#F1F5F9] dark:divide-[#333333] border-b border-[#F1F5F9] dark:border-[#333333]">
                        <div className="px-6 py-5">
                            <p className="text-[11px] font-semibold text-[#0D9488] dark:text-teal-400 uppercase tracking-wider mb-2">✅ Kiedy stosować</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">{fw.whenToUse}</p>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-[11px] font-semibold text-[#C2410C] dark:text-orange-400 uppercase tracking-wider mb-2">⚠️ Ograniczenia</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">{fw.limitations}</p>
                        </div>
                    </div>

                    {/* Techniques (Pretotyping) */}
                    {fw.techniques && (
                        <div className="px-6 py-5 border-b border-[#F1F5F9] dark:border-[#333333]">
                            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Techniki pretotypowania</p>
                            <div className="grid grid-cols-2 gap-3">
                                {fw.techniques.map(t => (
                                    <div key={t.name} className="flex items-start gap-3 p-3 bg-[#F8FAFC] dark:bg-[#141414] border border-[#E2E8F0] dark:border-[#333333] rounded-xl">
                                        <span className="text-xl shrink-0">{t.icon}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-[#0D2535] dark:text-slate-200 mb-1">{t.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Framework Tile Card ─────────────────────────────────────────────────────
function FrameworkCard({ fw, onOpen }: { fw: Framework; onOpen: () => void }) {
    const cat = CATEGORIES[fw.category]
    const ai = AI_LABELS[fw.aiAutomation]

    return (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#E2E8F0] dark:border-[#333333] shadow-sm flex flex-col hover:border-[#14B8A6] dark:hover:border-[#14B8A6] hover:shadow-md dark:hover:shadow-none transition-all duration-150 cursor-pointer overflow-hidden group"
            onClick={onOpen}>
            {/* Main tile body */}
            <div className="p-5 flex-1 flex flex-col gap-4 text-left">
                {/* Top: title */}
                <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-sans font-bold text-[#0D2535] dark:text-slate-200 text-lg leading-tight group-hover:text-[#14B8A6] dark:group-hover:text-white transition-colors">
                            {fw.name}
                        </h3>
                        {fw.shortName && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">{fw.shortName}</p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-2">{fw.author}</p>
                    </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                        {cat.label}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors"
                        style={{ backgroundColor: `${ai.color}20`, color: ai.color }}>
                        {AUTO_ICONS[fw.aiAutomation]} AI: {ai.label}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#F1F5F9] dark:border-[#333333] bg-[#F8FAFC]/50 dark:bg-[#141414] group-hover:bg-[#F0FDFA] dark:group-hover:bg-[#1E1E1E] transition-colors min-w-0 gap-2">
                <div className="flex items-center gap-2 sm:gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-sans min-w-0">
                    <span title="Złożoność" className="shrink-0">
                        <span className="text-[#F59E0B]">{'★'.repeat(fw.complexity)}</span>
                        <span className="text-slate-300 dark:text-slate-600">{'☆'.repeat(5 - fw.complexity)}</span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden sm:inline">|</span>
                    <span className="flex items-center gap-1 whitespace-nowrap truncate min-w-0">
                        <span className="shrink-0">⏱</span>
                        <span className="truncate">{fw.cycleDuration}</span>
                    </span>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-[#14B8A6] dark:text-[#2DD4BF] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Szczegóły →
                </span>
            </div>
        </div>
    )
}


function FrameworksTab() {
    const [filterCat, setFilterCat] = useState<string>('all')
    const [filterAI, setFilterAI] = useState<string>('all')
    const [search, setSearch] = useState('')
    const [selectedFw, setSelectedFw] = useState<Framework | null>(null)

    const filtered = FRAMEWORKS.filter(fw => {
        if (filterCat !== 'all' && fw.category !== filterCat) return false
        if (filterAI !== 'all' && fw.aiAutomation !== filterAI) return false
        if (search && !fw.name.toLowerCase().includes(search.toLowerCase()) && !fw.assumption.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    return (
        <div className="space-y-4">
            {selectedFw && <FrameworkModal fw={selectedFw} onClose={() => setSelectedFw(null)} />}
            {/* Filtry */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400 dark:text-slate-500" />
                    <select
                        value={filterCat}
                        onChange={e => setFilterCat(e.target.value)}
                        className="text-xs border border-[#E2E8F0] dark:border-white/5 rounded-lg px-3 py-1.5 bg-white dark:bg-[#1A1A1A] text-[#0D2535] dark:text-slate-200 outline-none focus:border-[#14B8A6] dark:focus:border-white/20 font-sans transition-colors"
                    >
                        <option value="all">Wszystkie kategorie</option>
                        {Object.entries(CATEGORIES).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>
                <select
                    value={filterAI}
                    onChange={e => setFilterAI(e.target.value)}
                    className="text-xs border border-[#E2E8F0] dark:border-white/5 rounded-lg px-3 py-1.5 bg-white dark:bg-[#1A1A1A] text-[#0D2535] dark:text-slate-200 outline-none focus:border-[#14B8A6] dark:focus:border-white/20 font-sans transition-colors"
                >
                    <option value="all">Automatyzacja AI: dowolna</option>
                    <option value="yes">AI: Tak</option>
                    <option value="partial">AI: Częściowo</option>
                    <option value="no">AI: Nie</option>
                </select>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Szukaj frameworku..."
                    className="text-xs border border-[#E2E8F0] dark:border-white/5 rounded-lg px-3 py-1.5 bg-white dark:bg-[#1A1A1A] text-[#0D2535] dark:text-slate-200 outline-none focus:border-[#14B8A6] dark:focus:border-white/20 font-sans flex-1 min-w-[160px] transition-colors"
                />
            </div>
            <p className="text-xs text-slate-400 font-sans">Znaleziono: {filtered.length} z {FRAMEWORKS.length}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(fw => <FrameworkCard key={fw.id} fw={fw} onOpen={() => setSelectedFw(fw)} />)}
            </div>
        </div>
    )
}

function WhenTab() {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans border-collapse">
                <thead>
                    <tr className="bg-[#0D2535] dark:bg-[#1A1A1A] text-white transition-colors">
                        <th className="text-left p-3 font-semibold">Framework</th>
                        <th className="text-center p-3 font-semibold">Złożoność</th>
                        <th className="text-left p-3 font-semibold">Czas cyklu</th>
                        <th className="text-left p-3 font-semibold">Artefakt końcowy</th>
                        <th className="text-center p-3 font-semibold">Automatyzacja AI</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-transparent dark:divide-[#333333]">
                    {FRAMEWORKS.map((fw, i) => {
                        const ai = AI_LABELS[fw.aiAutomation]
                        return (
                            <tr key={fw.id} className={`${i % 2 === 0 ? 'bg-white dark:bg-[#141414]' : 'bg-slate-50 dark:bg-[#1A1A1A]'} transition-colors`}>
                                <td className="p-3 font-semibold text-[#0D2535] dark:text-slate-200">
                                    {fw.name}
                                    {fw.shortName && <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">({fw.shortName})</span>}
                                </td>
                                <td className="p-3 text-center">
                                    <span className="text-[#F59E0B]">{'★'.repeat(fw.complexity)}</span>
                                    <span className="text-slate-300 dark:text-slate-600">{'☆'.repeat(5 - fw.complexity)}</span>
                                </td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{fw.cycleDuration}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{fw.artifacts[0]}</td>
                                <td className="p-3 text-center">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors" style={{ backgroundColor: `${ai.color}20`, color: ai.color }}>
                                        {fw.aiAutomation === 'yes' ? <Zap size={10} /> : fw.aiAutomation === 'no' ? <ZapOff size={10} /> : <Minus size={10} />}
                                        {ai.label}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

function ChecklistTab() {
    const [checked, setChecked] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY)
            return saved ? new Set(JSON.parse(saved) as string[]) : new Set()
        } catch { return new Set() }
    })
    const [discoveryType, setDiscoveryType] = useState<DiscoveryType | null>(() => {
        try { return localStorage.getItem(CHECKLIST_CONTEXT_KEY) as DiscoveryType | null } catch { return null }
    })
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
    const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all')

    const handleTypeChange = (type: DiscoveryType) => {
        const next = discoveryType === type ? null : type
        setDiscoveryType(next)
        try {
            if (next) localStorage.setItem(CHECKLIST_CONTEXT_KEY, next)
            else localStorage.removeItem(CHECKLIST_CONTEXT_KEY)
        } catch { /* ignore */ }
    }

    const toggle = (key: string) => {
        setChecked(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key); else next.add(key)
            try { localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
            return next
        })
    }

    const toggleCollapse = (cat: string) => {
        setCollapsed(prev => {
            const next = new Set(prev)
            if (next.has(cat)) next.delete(cat); else next.add(cat)
            return next
        })
    }

    const reset = () => {
        setChecked(new Set())
        try { localStorage.removeItem(CHECKLIST_STORAGE_KEY) } catch { /* ignore */ }
    }

    // Returns items for a category with stable keys, filtered by discoveryType
    const getItemsForCat = (cat: CheckCategory) =>
        cat.items
            .map((item, i) => ({ ...item, key: `${cat.category}-${i}` }))
            .filter(item => !discoveryType || !item.contexts || item.contexts.includes(discoveryType))

    // All relevant items for progress (respects discoveryType, ignores severity filter)
    const relevantItems = RISK_CHECKLIST
        .filter(cat => !discoveryType || !cat.contexts || cat.contexts.includes(discoveryType))
        .flatMap(cat => getItemsForCat(cat))

    const totalAll = RISK_CHECKLIST.flatMap(cat => cat.items).length
    const total = relevantItems.length
    const done = relevantItems.filter(item => checked.has(item.key)).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    const hiddenCount = totalAll - total

    const uncheckedFatal = relevantItems.filter(item => item.severity === 'FATAL' && !checked.has(item.key))

    const visibleCategories = RISK_CHECKLIST
        .filter(cat => !discoveryType || !cat.contexts || cat.contexts.includes(discoveryType))
        .map(cat => ({
            ...cat,
            items: getItemsForCat(cat).filter(item => filterSeverity === 'all' || item.severity === filterSeverity),
        }))
        .filter(cat => cat.items.length > 0)

    return (
        <div className="space-y-5 max-w-3xl">
            {/* Selektor kontekstu discovery */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E2E8F0] dark:border-[#333333] p-5 shadow-sm">
                <p className="text-sm font-sans font-semibold text-[#0D2535] dark:text-slate-100 mb-0.5">Co badamy?</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mb-3">
                    Wybierz typ, aby dostosować checklistę — pytania nieistotne dla kontekstu zostaną ukryte
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DISCOVERY_TYPES.map(dt => (
                        <button
                            key={dt.id}
                            onClick={() => handleTypeChange(dt.id)}
                            className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-center transition-all ${discoveryType === dt.id
                                    ? 'border-[#14B8A6] bg-[#F0FDFA] dark:bg-teal-950/30 shadow-sm'
                                    : 'border-[#E2E8F0] dark:border-[#333333] hover:border-slate-300 dark:hover:border-[#444444] hover:bg-slate-50 dark:hover:bg-[#1E1E1E]'
                                }`}
                        >
                            <span className="text-xl">{dt.icon}</span>
                            <span className={`text-xs font-sans font-semibold leading-tight ${discoveryType === dt.id ? 'text-[#0D9488] dark:text-teal-400' : 'text-[#0D2535] dark:text-slate-200'}`}>
                                {dt.label}
                            </span>
                        </button>
                    ))}
                </div>
                {discoveryType && hiddenCount > 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-3 flex items-center gap-1.5">
                        <span>ℹ️</span>
                        {hiddenCount} {hiddenCount === 1 ? 'pytanie ukryte' : 'pytań ukrytych'} — nieistotne dla wybranego kontekstu
                    </p>
                )}
            </div>

            {/* Header z postępem */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E2E8F0] dark:border-[#333333] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-sm font-sans font-semibold text-[#0D2535] dark:text-slate-100">Postęp oceny ryzyk</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                            {done} z {total} pytań ({pct}%)
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filterSeverity}
                            onChange={e => setFilterSeverity(e.target.value as Severity | 'all')}
                            className="text-xs border border-[#E2E8F0] dark:border-[#333333] rounded-lg px-2.5 py-1.5 bg-white dark:bg-[#1A1A1A] text-[#0D2535] dark:text-slate-200 outline-none focus:border-[#14B8A6] font-sans"
                        >
                            <option value="all">Wszystkie</option>
                            <option value="FATAL">FATAL</option>
                            <option value="HIGH">HIGH</option>
                            <option value="MEDIUM">MEDIUM</option>
                        </select>
                        <button onClick={reset} className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors font-sans">
                            Wyczyść
                        </button>
                    </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#333333] rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : pct > 60 ? 'bg-[#14B8A6]' : pct > 30 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {/* FATAL warning banner */}
            {uncheckedFatal.length > 0 && filterSeverity === 'all' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-sans font-semibold text-red-700 dark:text-red-400">
                            {uncheckedFatal.length} nierozwiązanych pytań FATAL
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-500 font-sans mt-0.5">
                            Te pytania są blokerami przed decyzją GO. Każde niezaznaczone FATAL = ryzyko krytyczne.
                        </p>
                    </div>
                </div>
            )}

            {/* Kategorie */}
            <div className="space-y-3">
                {visibleCategories.map(cat => {
                    const catDone = cat.items.filter(item => checked.has(item.key)).length
                    const catTotal = cat.items.length
                    const catPct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0
                    const isCollapsed = collapsed.has(cat.category)
                    const hasFatalUnchecked = cat.items.some(item => item.severity === 'FATAL' && !checked.has(item.key))

                    return (
                        <div key={cat.category} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#E2E8F0] dark:border-[#333333] shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleCollapse(cat.category)}
                                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-[#1E1E1E] transition-colors"
                            >
                                <span className="text-xl shrink-0">{cat.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-sans font-bold text-[#0D2535] dark:text-slate-100 uppercase tracking-wider">
                                            {cat.category}
                                        </p>
                                        {hasFatalUnchecked && <ShieldAlert size={13} className="text-red-500 shrink-0" />}
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-sans truncate">{cat.description}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs font-mono font-bold ${catDone === catTotal ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {catDone}/{catTotal}
                                    </span>
                                    <div className="w-16 bg-slate-100 dark:bg-[#333333] rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-1.5 rounded-full transition-all ${catDone === catTotal ? 'bg-emerald-500' : 'bg-[#14B8A6]'}`}
                                            style={{ width: `${catPct}%` }}
                                        />
                                    </div>
                                    {isCollapsed
                                        ? <ChevronDown size={14} className="text-slate-400 dark:text-slate-500" />
                                        : <ChevronUp size={14} className="text-slate-400 dark:text-slate-500" />
                                    }
                                </div>
                            </button>

                            {!isCollapsed && (
                                <div className="border-t border-[#F1F5F9] dark:border-[#333333] divide-y divide-[#F8FAFC] dark:divide-[#1E1E1E]">
                                    {cat.items.map(item => {
                                        const isChecked = checked.has(item.key)
                                        const sev = SEVERITY_CONFIG[item.severity]
                                        return (
                                            <button
                                                key={item.key}
                                                onClick={() => toggle(item.key)}
                                                className={`w-full flex items-start gap-3 text-left px-5 py-3.5 transition-colors ${isChecked ? 'bg-[#F0FDFA] dark:bg-teal-950/20' : 'hover:bg-slate-50 dark:hover:bg-[#1E1E1E]'}`}
                                            >
                                                {isChecked
                                                    ? <CheckSquare size={16} className="shrink-0 mt-0.5 text-[#14B8A6]" />
                                                    : <Square size={16} className={`shrink-0 mt-0.5 ${item.severity === 'FATAL' ? 'text-red-300' : item.severity === 'HIGH' ? 'text-orange-300' : 'text-slate-300'}`} />
                                                }
                                                <span className={`flex-1 text-sm font-sans leading-relaxed ${isChecked ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {item.text}
                                                </span>
                                                <span className={`shrink-0 ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${sev.text} ${isChecked ? 'opacity-40' : ''}`}
                                                    style={{ backgroundColor: item.severity === 'FATAL' ? '#FEE2E2' : item.severity === 'HIGH' ? '#FFEDD5' : '#F1F5F9' }}>
                                                    {sev.label}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-3 pt-2">
                {(['FATAL', 'HIGH', 'MEDIUM'] as Severity[]).map(s => {
                    const cfg = SEVERITY_CONFIG[s]
                    return (
                        <div key={s} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className={`text-xs font-mono font-semibold ${cfg.text}`}>{s}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-sans">
                                {s === 'FATAL' ? '— bloker przed GO' : s === 'HIGH' ? '— walidacja Sprint 1' : '— zarządzalne'}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default function Kompendium() {
    const [tab, setTab] = useState<Tab>('frameworks')

    const TABS: { id: Tab; label: string }[] = [
        { id: 'frameworks', label: '📚 Frameworki (25)' },
        { id: 'when', label: '📊 Kiedy co stosować' },
        { id: 'checklist', label: '✅ Risk Checklist' },
        { id: 'yoda', label: '🎯 YODA Data' },
    ]

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <BookOpen size={22} className="text-[#14B8A6]" />
                    <h1 className="text-2xl font-sans font-semibold text-[#0D2535] dark:text-slate-100">Kompendium Discovery</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-sans text-sm max-w-2xl">
                    Zestawienie 25 metod, cykli i frameworków product discovery z analizą podatności na automatyzację AI.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 bg-slate-100 dark:bg-[#1A1A1A] p-1 rounded-xl w-fit transition-colors">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 text-sm font-sans font-medium rounded-lg transition-all ${tab === t.id ? 'bg-white dark:bg-[#333333] text-[#0D2535] dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-[#0D2535] dark:hover:text-white'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div>
                {tab === 'frameworks' && <FrameworksTab />}
                {tab === 'when' && <WhenTab />}
                {tab === 'checklist' && <ChecklistTab />}
                {tab === 'yoda' && <YodaTab />}
            </div>
        </div>
    )
}

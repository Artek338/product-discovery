import { useState, useEffect } from 'react'
import { BookOpen, Filter, CheckSquare, Square, ChevronDown, ChevronUp, X, Bot, Zap, ZapOff, Minus } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { FRAMEWORKS, CATEGORIES, AI_LABELS, type Framework } from '../data/frameworks'

const CAT_ICONS: Record<string, string> = {
    cycle: '🔄', problem: '🎯', validation: '🧪', market: '📡', artifact: '📋'
}
const AUTO_ICONS: Record<string, string> = { yes: '⚡', partial: '〰️', no: '🔒' }

const RISK_CHECKLIST = [
    {
        category: 'VALUE', items: [
            'Czy produkt stworzy wartość dla klientów?',
            'Czy użytkownicy będą wracać i używać go regularnie?',
        ]
    },
    {
        category: 'USABILITY', items: [
            'Czy ludzie będą wiedzieć jak go używać?',
            'Czy znajdą produkt tam, gdzie szukają?',
            'Czy nie podniesie kognitywnego obciążenia (cognitive load)?',
            'Czy onboarding będzie wystarczająco szybki?',
        ]
    },
    {
        category: 'VIABILITY', items: [
            'Czy produkt działa dla różnych części biznesu?',
            'Czy możemy go sprzedawać? Finansować? Monetyzować?',
            'Czy jest wart potencjalnego kosztu?',
            'Czy możemy wspierać klientów i pomagać im odnieść sukces?',
            'Czy możemy go skalować? Czy będzie zgodny z regulacjami?',
            'Jaki byłby koszt skalowania AI?',
        ]
    },
    {
        category: 'FEASIBILITY', items: [
            'Czy możemy to zbudować z dostępną technologią?',
            'Czy niezbędne integracje są możliwe?',
            'Czy możemy to zrealizować efektywnie i skalować?',
        ]
    },
    {
        category: 'ETHICS', items: [
            'Czy w ogóle powinniśmy to budować?',
            'Czy są kwestie etyczne do rozważenia?',
            'Czy produkt stworzy ryzyko dla naszych klientów?',
        ]
    },
    {
        category: 'GO-TO-MARKET', items: [
            'Czy możemy to skutecznie promować?',
            'Czy mamy odpowiednie kanały dystrybucji?',
            'Czy możemy przekonać klientów, żeby spróbowali?',
            'Czy ten messaging pasuje do wybranego kanału?',
            'Czy to jest właściwy czas i sposób na launch?',
        ]
    },
    {
        category: 'STRATEGY & OBJECTIVES', items: [
            'Co musi być prawdą, żeby nasza strategia zadziałała?',
            'Czy konkurencja może łatwo skopiować nasze podejście?',
            'Czy rozważyliśmy czynniki polityczne, ekonomiczne, prawne i środowiskowe?',
            'Czy to są najważniejsze problemy do rozwiązania?',
            'Co stanowi nasz AI moat? Dane? Dystrybucja? Zaufanie?',
        ]
    },
    {
        category: 'AI & AUTONOMY', items: [
            'Czy AI będzie zachowywać się zgodnie z oczekiwaniami w realu?',
            'Czy możemy kontrolować, co robi i do jakich danych sięga?',
            'Co się stanie, gdy zewnętrzny model lub serwer MCP zostanie skompromitowany?',
            'Czy mamy procesy monitorowania wydajności AI w czasie?',
            'Jakie są guardrails i human-in-the-loop mechanizmy?',
            'Czy jesteśmy w stanie wykrywać błędy krytyczne? Jak szybko?',
        ]
    },
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
    { name: 'Fake Door', icon: '🚪', description: 'Tworzenie punktu wejścia (reklama, przycisk) dla produktu/funkcji które jeszcze nie istnieją. Mierzy odsetek osób próbujących faktycznie dokonać zakupu.' },
    { name: 'Facade (Fasada)', icon: '🎭', description: 'Produkt wygląda w pełni funkcjonalnie, ale cała obsługa odbywa się ręcznie. Np. sprzedaż online realizowana przez pracowników w tle.' },
    { name: 'Mechanical Turk', icon: '⚙️', description: 'Zastąpienie drogiej technologii żywym człowiekiem ukrytym za kulisami. IBM testował speech-to-text z maszynistką w sąsiednim pokoju.' },
    { name: 'Pinocchio', icon: '🧸', description: 'Całkowicie niefunkcjonalny fizyczny odpowiednik produktu (np. drewniany klocek zamiast palmtopa). Bada ergonomię i kontekst użycia.' },
    { name: 'Provincial', icon: '🌾', description: 'Test w bardzo małym, nieformalnym środowisku (np. parking przed sklepem). Oszczędza infrastrukturę, daje twarde dane z pierwszej ręki.' },
    { name: 'Infiltrator', icon: '🕵️', description: 'Podrzucenie własnych prototypów na półki w cudzym sklepie, by sprawdzić czy klienci chwytają i płacą za nowy produkt.' },
]

function YodaTab() {
    const [counts, setCounts] = useState<Record<string, number>>({})
    const total = YODA_SCORES.reduce((sum, row) => sum + (counts[row.id] ?? 0) * row.points, 0)

    const level = total === 0 ? null : total < 30 ? { label: 'Słaby sygnał', color: '#94A3B8', bg: '#F1F5F9' }
        : total < 150 ? { label: 'Umiarkowany sygnał', color: '#F97316', bg: '#FFF7ED' }
            : total < 500 ? { label: 'Dobry sygnał', color: '#3B82F6', bg: '#EFF6FF' }
                : { label: 'Silny sygnał rynkowy', color: '#14B8A6', bg: '#F0FDFA' }

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Hero */}
            <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0D2535 0%, #1E4060 100%)' }}>
                <div className="text-3xl mb-2">🎯</div>
                <h2 className="font-sans font-bold text-xl mb-1">YODA — Your Own Data</h2>
                <p className="text-slate-300 text-sm font-sans leading-relaxed">
                    Metodologia Pretotyping (Alberto Savoia) opiera się na zasadzie: <strong className="text-white">"Data beats Opinion"</strong>.
                    Dane YODA to twarde dowody rynkowe zbierane samodzielnie, zanim napiszesz linijkę kodu.
                    Kluczowy koncept: <strong className="text-white">"Skin in the Game"</strong> — tylko akcje, które coś kosztują użytkownika (czas, pieniądze, reputacja), mają wartość.
                </p>
            </div>

            {/* Worthless signals */}
            <div>
                <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base mb-2">🚫 Sygnały bezwartościowe (0 pkt)</h3>
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
                <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base mb-2">✅ Tabela punktacji YODA (Skin in the Game)</h3>
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
            {/* Calculator */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E2E8F0] dark:border-[#333333] shadow-sm overflow-hidden transition-colors">
                <div className="p-4 border-b border-[#E2E8F0] dark:border-[#333333] flex items-center justify-between">
                    <div>
                        <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base">🧮 Kalkulator YODA</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Wpisz ile dowodów każdego typu zebrałeś</p>
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
                                    = {((counts[row.id] ?? 0) * row.points)} pkt
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                {/* 
                  Kalkulator bottom panel uses dynamic inline styles. 
                  In dark mode we still want good contrast. We'll leave inline styles but fallback explicitly where we can 
                */}
                <div className="p-4 border-t border-[#E2E8F0] dark:border-[#333333]" style={{ backgroundColor: level?.bg ?? (document.documentElement.classList.contains('dark') ? '#111111' : '#F8FAFC') }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mb-0.5">Łączny wynik YODA</p>
                            <p className="font-mono font-bold text-3xl" style={{ color: level?.color ?? '#94A3B8' }}>
                                {total} pkt
                            </p>
                            {level && <p className="text-sm font-semibold font-sans mt-1" style={{ color: level.color }}>{level.label}</p>}
                            {!level && <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-1">Zacznij zbierać twarde dane 👆</p>}
                        </div>
                        {total > 0 && (
                            <div className="text-right text-xs font-sans text-slate-500 dark:text-slate-400 space-y-0.5">
                                <p>0–29 → Słaby sygnał</p>
                                <p>30–149 → Umiarkowany</p>
                                <p>150–499 → Dobry sygnał</p>
                                <p className="font-semibold text-[#14B8A6] dark:text-teal-400">500+ → Silny sygnał 🚀</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/30 border border-[#BFDBFE] dark:border-blue-900/50">
                    <p className="text-xs font-semibold text-[#1D4ED8] dark:text-blue-400 mb-1 font-sans">📈 ILI — Initial Level of Interest</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">Stosunek wykonanych akcji do liczby oferowanych szans. Mierzy wstępne zainteresowanie.</p>
                    <p className="mt-2 font-mono text-xs bg-white dark:bg-[#141414] rounded px-2 py-1 text-slate-600 dark:text-slate-400">ILI = Akcje / Szanse × 100%</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F0FDFA] dark:bg-teal-950/30 border border-[#CCFBF1] dark:border-teal-900/50">
                    <p className="text-xs font-semibold text-[#0D9488] dark:text-teal-400 mb-1 font-sans">📊 OLI — Ongoing Level of Interest</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">Długoterminowy poziom zainteresowania w czasie. Pokazuje czy zainteresowanie rośnie czy opada.</p>
                    <p className="mt-2 font-mono text-xs bg-white dark:bg-[#141414] rounded px-2 py-1 text-slate-600 dark:text-slate-400">OLI = f(czas) → wykres</p>
                </div>
            </div>

            {/* Techniques */}
            <div>
                <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-base mb-3">6 technik pretotypowania</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRETOTYPE_TECHNIQUES.map(t => (
                        <div key={t.name} className="flex gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#E2E8F0] dark:border-[#333333] hover:border-[#14B8A6] dark:hover:border-[#14B8A6] transition-colors">
                            <span className="text-2xl shrink-0">{t.icon}</span>
                            <div>
                                <p className="font-sans font-semibold text-sm text-[#0D2535] dark:text-slate-200 mb-1">{t.name}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{t.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/30 border border-[#FED7AA] dark:border-orange-900/50">
                <p className="text-xs font-semibold text-[#C2410C] dark:text-orange-400 font-sans mb-1">⚠️ Pamiętaj</p>
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
    const [checked, setChecked] = useState<Set<string>>(new Set())

    const toggle = (key: string) => {
        setChecked(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key); else next.add(key)
            return next
        })
    }

    const total = RISK_CHECKLIST.reduce((sum, cat) => sum + cat.items.length, 0)
    const done = checked.size
    const pct = Math.round((done / total) * 100)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-sans text-slate-500">Postęp oceny ryzyk — {done}/{total} ({pct}%)</p>
                <button onClick={() => setChecked(new Set())} className="text-xs text-slate-400 hover:text-red-500 transition-colors font-sans">Wyczyść</button>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-[#14B8A6] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="space-y-6">
                {RISK_CHECKLIST.map(cat => (
                    <div key={cat.category}>
                        <h3 className="text-xs font-semibold font-sans text-[#0D2535] uppercase tracking-wider mb-2">{cat.category}</h3>
                        <div className="space-y-2">
                            {cat.items.map((item, i) => {
                                const key = `${cat.category}-${i}`
                                const isChecked = checked.has(key)
                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggle(key)}
                                        className="w-full flex items-start gap-3 text-left p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        {isChecked
                                            ? <CheckSquare size={16} className="shrink-0 mt-0.5 text-[#14B8A6]" />
                                            : <Square size={16} className="shrink-0 mt-0.5 text-slate-300" />}
                                        <span className={`text-sm font-sans ${isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function Kompendium() {
    const [tab, setTab] = useState<Tab>('frameworks')

    const TABS: { id: Tab; label: string }[] = [
        { id: 'frameworks', label: '📚 Frameworki (15)' },
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
                    Zestawienie 15 metod, cykli i frameworków product discovery z analizą podatności na automatyzację AI.
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

import { useState, useEffect } from 'react'
import { Bot, Eye, Cpu, Power, PowerOff, X, AlertCircle, RefreshCw } from 'lucide-react'
import PageGuideBanner from '../components/PageGuideBanner'

const STORAGE_KEY = 'agent_config'

type AgentStatus = 'active' | 'coming_soon'
type AutomationLevel = 'full' | 'partial' | 'none'
type PromptSource = 'AGENT.md' | 'inline_fallback'

interface AgentConfig {
    enabled: boolean
    model: string
}

interface Agent {
    id: string
    pipeline_id: string
    step?: number
    total_steps?: number
    name: string
    name_en: string
    icon: string
    color: string
    model: string
    description: string
    automation_level: AutomationLevel
    status: AgentStatus
    prompt: string
    source: PromptSource
    path: string | null
    size_bytes: number
}

function loadAgentConfig(): Record<string, AgentConfig> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return {}
}

const AUTO_LEVEL_LABELS: Record<AutomationLevel, { label: string; color: string; bg: string; icon: string }> = {
    full: { label: 'Pełna automatyzacja', color: '#0D9488', bg: '#F0FDFA', icon: '⚡' },
    partial: { label: 'Częściowa', color: '#F97316', bg: '#FFF7ED', icon: '〰️' },
    none: { label: 'Manualna', color: '#64748B', bg: '#F1F5F9', icon: '🔒' },
}

// ─── Prompt Drawer ───────────────────────────────────────────────────────────
function AgentPromptDrawer({ agent, onClose }: { agent: Agent; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [onClose])

    const isFallback = agent.source === 'inline_fallback'

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-[#0D2535]/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div
                className="relative ml-auto w-full max-w-2xl h-full bg-white dark:bg-[#1A1A1A] shadow-2xl flex flex-col overflow-hidden transition-colors"
                style={{ animation: 'slideIn 200ms ease-out' }}
            >
                <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

                {/* Header */}
                <div className="flex items-start gap-4 p-6 border-b border-[#E2E8F0] dark:border-[#333333]">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-slate-100 dark:bg-[#2A2A2A]">
                        {agent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        {agent.step && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#2A2A2A] text-slate-500 dark:text-slate-400 mb-1 inline-block">
                                Krok {agent.step}/{agent.total_steps}
                            </span>
                        )}
                        <h2 className="font-sans font-bold text-[#0D2535] dark:text-slate-100 text-xl leading-tight">{agent.name}</h2>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase tracking-wider">{agent.name_en}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto bg-[#0D2535] dark:bg-[#111111] p-6 space-y-4">
                    {/* Source info */}
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-[#14B8A6] uppercase tracking-widest">
                            System Prompt
                        </p>
                        <div className="flex items-center gap-2">
                            {isFallback ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                                    <AlertCircle size={10} /> inline fallback
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#14B8A6]/20 text-[#14B8A6]">
                                    {agent.path}
                                </span>
                            )}
                            <span className="text-[10px] text-slate-500">
                                {agent.size_bytes > 0 ? `${(agent.size_bytes / 1024).toFixed(1)} KB` : ''}
                            </span>
                        </div>
                    </div>

                    {/* Prompt content */}
                    <div className="bg-[#162C3E] dark:bg-[#0A0A0A] rounded-xl border border-[#233A4D] dark:border-[#222222] p-5">
                        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                            {agent.prompt}
                        </pre>
                    </div>

                    {/* Model + capabilities */}
                    <div className="space-y-3 mt-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model</p>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#162C3E] dark:bg-[#1A1A1A] border border-[#233A4D] dark:border-[#333333] text-xs text-slate-300 w-fit">
                            <Cpu size={14} className="text-[#14B8A6]" />
                            {agent.model}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Agent Card ──────────────────────────────────────────────────────────────
function AgentCard({ agent, onOpenPrompt }: { agent: Agent; onOpenPrompt: () => void }) {
    const [configs, setConfigs] = useState<Record<string, AgentConfig>>(loadAgentConfig)
    const cfg = configs[agent.pipeline_id] ?? { enabled: true, model: agent.model }
    const isComingSoon = agent.status === 'coming_soon'
    const isFallback = agent.source === 'inline_fallback'
    const autoLevel = AUTO_LEVEL_LABELS[agent.automation_level]

    const updateCfg = (patch: Partial<AgentConfig>) => {
        const next = { ...configs, [agent.pipeline_id]: { ...cfg, ...patch } }
        setConfigs(next)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }

    return (
        <div className={`bg-white dark:bg-[#1A1A1A] rounded-xl border shadow-sm flex flex-col transition-all duration-150 group overflow-hidden ${isComingSoon
            ? 'border-[#E2E8F0] dark:border-[#333333] opacity-70'
            : 'border-[#E2E8F0] dark:border-[#333333] hover:border-[#14B8A6] dark:hover:border-[#14B8A6] hover:shadow-md'
            }`}>
            <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-slate-100 dark:bg-[#2A2A2A]">
                        {agent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="font-sans font-bold text-[#0D2535] dark:text-slate-100 text-base leading-tight group-hover:text-[#14B8A6] dark:group-hover:text-[#14B8A6] transition-colors">
                                {agent.name}
                            </h3>
                            {agent.step && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#2A2A2A] text-slate-500 dark:text-slate-400">
                                    {agent.step}/{agent.total_steps}
                                </span>
                            )}
                            {isFallback && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" title="Brak AGENT.md — używany jest fallback">
                                    ⚠ fallback
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{agent.name_en}</p>
                    </div>
                    {!isComingSoon && (
                        <button
                            onClick={e => { e.stopPropagation(); updateCfg({ enabled: !cfg.enabled }) }}
                            className={`shrink-0 p-1.5 rounded-lg transition-colors ${cfg.enabled ? 'bg-[#F0FDFA] dark:bg-teal-900/30 text-[#14B8A6]' : 'bg-slate-100 dark:bg-[#2A2A2A] text-slate-400'}`}
                            title={cfg.enabled ? 'Dezaktywuj' : 'Aktywuj'}
                        >
                            {cfg.enabled ? <Power size={14} /> : <PowerOff size={14} />}
                        </button>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{agent.description}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-auto pt-1">
                    <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                        style={{ backgroundColor: `${autoLevel.color}20`, color: autoLevel.color }}>
                        {autoLevel.icon} {autoLevel.label}
                    </span>
                    <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#2A2A2A] text-slate-400 flex items-center gap-1">
                        <Cpu size={10} /> {agent.model.replace('claude-', '').replace('-20251001', '')}
                    </span>
                    {isComingSoon && (
                        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-[#2A2A2A] text-slate-400 rounded-md">
                            Coming soon
                        </span>
                    )}
                </div>
            </div>

            {/* Footer */}
            {!isComingSoon && (
                <div className="border-t border-[#F1F5F9] dark:border-[#333333] bg-[#F8FAFC]/50 dark:bg-[#141414] group-hover:bg-[#F0FDFA] dark:group-hover:bg-teal-900/20 transition-colors">
                    <div className="flex items-center justify-end px-5 py-3">
                        <button
                            onClick={onOpenPrompt}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-[#14B8A6] uppercase tracking-wider hover:underline whitespace-nowrap"
                        >
                            <Eye size={14} />
                            System Prompt
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Agents() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selected, setSelected] = useState<Agent | null>(null)

    const fetchAgents = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/agents')
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data: Agent[] = await res.json()
            setAgents(data)
        } catch (e) {
            setError('Nie można załadować agentów — czy backend działa?')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAgents() }, [])

    const activeAgents = agents.filter(a => a.status === 'active')
    const comingSoonAgents = agents.filter(a => a.status === 'coming_soon')

    return (
        <div className="max-w-5xl mx-auto p-8">
            {selected && <AgentPromptDrawer agent={selected} onClose={() => setSelected(null)} />}

            {/* Page header */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] dark:bg-teal-900/30 flex items-center justify-center">
                            <Bot size={24} className="text-[#14B8A6]" />
                        </div>
                        <h1 className="text-3xl font-sans font-bold text-[#0D2535] dark:text-slate-100">Agenty Discovery</h1>
                    </div>
                    <button
                        onClick={fetchAgents}
                        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#14B8A6] transition-colors"
                        title="Odśwież prompty z backendu"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        Odśwież
                    </button>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl leading-relaxed">
                    Agenty AI wchodzące w skład pipeline'u Discovery. Prompty ładowane są na żywo z plików{' '}
                    <code className="text-xs bg-slate-100 dark:bg-[#2A2A2A] dark:text-slate-300 px-1 py-0.5 rounded font-mono">AGENT.md</code>{' '}
                    z backendu — widzisz to co faktycznie działa pod spodem.
                </p>
            </div>

            <PageGuideBanner
                storageKey="pd_guide_agents"
                badge="Jak to działa?"
                title="Agenty Discovery — przewodnik"
                sections={[
                    {
                        title: '🤖 Co to jest?',
                        content: (
                            <>
                                <p><strong>8 wyspecjalizowanych agentów AI</strong> tworzących pipeline Discovery.</p>
                                <p className="mt-1.5">Każdy wykonuje jedną konkretną rolę — razem dostarczają pełną analizę z rekomendacją GO / NO-GO.</p>
                            </>
                        ),
                    },
                    {
                        title: '⚡ Pipeline (8 kroków)',
                        content: (
                            <ol className="space-y-1">
                                {[
                                    'Syntetyczne wywiady',
                                    'Wywiady behawioralne (JTBD)',
                                    'Research konkurencji (OSINT)',
                                    'Ocena dowodów (0–5)',
                                    'Diagram sił rynkowych',
                                    'Synteza JTBD',
                                    'Mapa założeń',
                                    'Scorecard + GO/NO-GO',
                                ].map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs">
                                        <span className="shrink-0 w-4 h-4 rounded-full bg-[#14B8A6]/20 text-[#14B8A6] text-[10px] flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                                        {s}
                                    </li>
                                ))}
                            </ol>
                        ),
                    },
                    {
                        title: '💡 Wskazówki',
                        content: (
                            <div className="space-y-1.5">
                                {[
                                    { label: 'System Prompt', desc: 'Kliknij "SYSTEM PROMPT" przy agencie — zobaczysz co faktycznie robi.' },
                                    { label: 'Włącz / Wyłącz', desc: 'Ikona ⚡ dezaktywuje agenta — przydatne przy testach.' },
                                    { label: 'Pliki AGENT.md', desc: 'Prompty ładowane na żywo — edytuj plik i odśwież stronę.' },
                                ].map(({ label, desc }) => (
                                    <div key={label}>
                                        <span className="text-xs font-semibold text-[#14B8A6]">{label}:</span>{' '}
                                        <span className="text-xs">{desc}</span>
                                    </div>
                                ))}
                            </div>
                        ),
                    },
                ]}
            />

            {/* Loading */}
            {loading && (
                <div className="flex items-center gap-3 text-slate-400 py-16 justify-center">
                    <RefreshCw size={18} className="animate-spin" />
                    <span className="text-sm">Ładowanie agentów z backendu…</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-8">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                </div>
            )}

            {/* Active agents */}
            {!loading && activeAgents.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">
                        Aktywne węzły pipeline ({activeAgents.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeAgents.map(a => (
                            <AgentCard key={a.pipeline_id} agent={a} onOpenPrompt={() => setSelected(a)} />
                        ))}
                    </div>
                </div>
            )}

            {/* Coming soon */}
            {!loading && comingSoonAgents.length > 0 && (
                <div>
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">
                        Planowane agenty ({comingSoonAgents.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75">
                        {comingSoonAgents.map(a => (
                            <AgentCard key={a.pipeline_id} agent={a} onOpenPrompt={() => setSelected(a)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

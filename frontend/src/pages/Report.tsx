import { useEffect, useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import VerdictBadge from '../components/VerdictBadge'
import ProgressTracker from '../components/ProgressTracker'
import ForcesChart from '../components/ForcesChart'
import AssumptionTable from '../components/AssumptionTable'
import ArchetypeCard from '../components/ArchetypeCard'
import MiroExportModal from '../components/MiroExportModal'
import type { DiscoveryResult, SyntheticProfile } from '../types/discovery'
import { FileText, Download, Share2, Target, Users, Zap, Map, FileSearch, Slack, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

function parseArchetypes(raw: string): SyntheticProfile[] {
  if (!raw) return []
  const blocks = raw.split(/\n\n+/)
  const profiles: SyntheticProfile[] = []
  let current: Partial<SyntheticProfile> = {}

  for (const block of blocks) {
    const name = block.match(/^Archetyp \d+: (.+)$/m)?.[1]
    if (name) {
      if (current.archetype_name) profiles.push(current as SyntheticProfile)
      current = {
        archetype_name: name,
        demographics: '',
        psychology: '',
        jtbd_hypothesis: '',
        forces_hypothesis: '',
        expected_interview_behaviors: [],
        hypotheses_to_test: [],
        red_flags_expected: [],
      }
      const hypotheses = [...block.matchAll(/Hipoteza: (.+)/g)].map(m => m[1])
      const redFlags = [...block.matchAll(/Red flags.*?: (.+)/g)].map(m => m[1])
      current.hypotheses_to_test = hypotheses
      current.red_flags_expected = redFlags
      current.demographics = block.match(/Expected behaviors: (.+)/)?.[1] || ''
    }
  }
  if (current.archetype_name) profiles.push(current as SyntheticProfile)
  return profiles
}

function getConfidenceColor(confidence?: number | null): string {
  if (confidence == null) return '#64748B'
  if (confidence <= 30) return '#EF4444'
  if (confidence <= 50) return '#F97316'
  if (confidence <= 70) return '#F59E0B'
  if (confidence <= 85) return '#10B981'
  return '#0D9488'
}

const STAT_CARDS = (result: DiscoveryResult) => [
  {
    label: 'Confidence level',
    value: `${result.jtbd?.confidence ?? '—'}%`,
    sub: `Evidence level: ${result.jtbd?.evidence_level?.replace('_', ' ') ?? '—'}`,
    color: getConfidenceColor(result.jtbd?.confidence),
  },
  {
    label: 'Analysis duration',
    value: `${Math.max(1, Math.round((result.duration_hours || 0) * 60))} min`,
    sub: 'Total compute time',
    color: '#0D2535',
  },
  {
    label: 'Confidence delta',
    value: result.scorecard
      ? `${result.scorecard.confidence_before}% → ${result.scorecard.confidence_after}%`
      : '—',
    sub: 'Before vs After Discovery',
    color: '#8B5CF6',
  },
]

export default function Report() {
  const { id } = useParams<{ id: string }>()
  const {
    sessionStatus, setSessionStatus,
    discoveryResult, setDiscoveryResult,
  } = useAppStore()

  const [pollError, setPollError] = useState('')

  const poll = useCallback(async () => {
    if (!id) return
    try {
      const status = await api.getStatus(id)
      setSessionStatus(status)
      setPollError('')

      if (status.status === 'completed') {
        const result = await api.getResult(id)
        setDiscoveryResult(result)
      } else if (status.status === 'running' || status.status === 'queued') {
        setTimeout(poll, 2000)
      }
    } catch (err: unknown) {
      console.error('Poll error:', err)
      const msg = err instanceof Error ? err.message : 'API Error'
      setPollError(msg.includes('404') ? 'Session not found (404)' : msg)
    }
  }, [id, setSessionStatus, setDiscoveryResult])

  useEffect(() => {
    setDiscoveryResult(null)
    poll()
  }, [id, poll])

  const [miroOpen, setMiroOpen] = useState(false)

  // Slack export state
  const [slackSending, setSlackSending] = useState(false)
  const [slackResult, setSlackResult] = useState<{ sent: boolean; message: string } | null>(null)

  // Google Docs export state
  const [gdocsSending, setGdocsSending] = useState(false)
  const [gdocsResult, setGdocsResult] = useState<{ doc_url: string } | null>(null)
  const [gdocsError, setGdocsError] = useState('')

  const handleSlackSend = async () => {
    if (!id) return
    setSlackSending(true)
    setSlackResult(null)
    try {
      const res = await api.exportSlack(id, {
        report_url: window.location.href,
        event: 'discovery_complete',
      })
      setSlackResult({ sent: res.sent, message: res.message })
    } catch (e: unknown) {
      setSlackResult({ sent: false, message: e instanceof Error ? e.message : 'Błąd wysyłania' })
    } finally {
      setSlackSending(false)
      setTimeout(() => setSlackResult(null), 5000)
    }
  }

  const handleGdocsExport = async () => {
    if (!id) return
    setGdocsSending(true)
    setGdocsResult(null)
    setGdocsError('')
    try {
      const res = await api.exportGDocs(id, { share_with: [] })
      setGdocsResult({ doc_url: res.doc_url })
    } catch (e: unknown) {
      setGdocsError(e instanceof Error ? e.message : 'Błąd eksportu')
    } finally {
      setGdocsSending(false)
    }
  }

  const isRunning = sessionStatus?.status === 'running' || sessionStatus?.status === 'queued'
  const result = discoveryResult

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-slate-500 hover:text-[#0D2535] dark:hover:text-slate-200 text-sm font-sans font-medium transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333333] rounded-lg shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Progress view */}
      {isRunning && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 shadow-sm border border-[#E2E8F0] dark:border-[#333333] mb-8 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#F0FDFA] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#14B8A6] animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <div>
              <h2 className="font-mono font-bold text-xl text-[#0D2535]">
                Discovery in progress
              </h2>
              <p className="text-slate-500 font-sans text-sm">Synthesizing data and generating insights...</p>
            </div>
          </div>

          <ProgressTracker
            progress={sessionStatus?.progress ?? 0}
            currentNode={sessionStatus?.current_node}
            logs={sessionStatus?.logs}
          />
        </div>
      )}

      {sessionStatus?.status === 'failed' && (
        <div className="bg-[#FEE2E2] rounded-2xl p-8 border border-[#FCA5A5] mb-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div>
            <h2 className="font-sans font-bold text-lg text-[#DC2626]">Discovery Failed</h2>
            <p className="font-sans text-sm text-[#991B1B] mt-1.5 leading-relaxed max-w-2xl">
              {sessionStatus.logs?.[sessionStatus.logs.length - 1] || 'Check backend server logs for detailed traceback.'}
            </p>
          </div>
        </div>
      )}

      {pollError && (
        <div className="bg-[#FEE2E2] rounded-2xl p-8 border border-[#FCA5A5] mb-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div>
            <h2 className="font-sans font-bold text-lg text-[#DC2626]">Error</h2>
            <p className="font-sans text-sm text-[#991B1B] mt-1.5 leading-relaxed max-w-2xl">
              {pollError}
            </p>
          </div>
        </div>
      )}

      {/* Full report */}
      {result && result.jtbd && (
        <div className="space-y-8">
          {/* Header & Metrics block */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
            <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-[#0D2535] text-white flex items-center justify-center shadow-md">
                    <Target size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h1 className="font-mono font-bold text-2xl text-[#0D2535]">{result.project_name}</h1>
                    <p className="text-slate-500 font-sans text-sm flex items-center gap-2">
                      <span>ID: <span className="font-mono text-slate-700">{result.session_id.slice(0, 8)}</span></span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <VerdictBadge verdict={result.jtbd.verdict} size="lg" />
                <div className="h-10 w-px bg-[#E2E8F0] mx-2 hidden sm:block"></div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={api.exportPdfUrl(result.session_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333333] shadow-sm rounded-lg text-sm font-sans font-medium text-[#0D2535] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors flex items-center gap-2"
                  >
                    <Download size={16} className="text-slate-400" />
                    PDF
                  </a>
                  <button
                    onClick={() => setMiroOpen(true)}
                    className="px-4 py-2 bg-[#14B8A6] shadow-sm rounded-lg text-sm font-sans font-semibold text-white hover:bg-[#0D9488] transition-colors flex items-center gap-2"
                  >
                    <Share2 size={16} />
                    Miro
                  </button>
                  {/* Slack */}
                  <button
                    onClick={handleSlackSend}
                    disabled={slackSending}
                    title="Wyślij powiadomienie do Slacka"
                    className={`px-4 py-2 shadow-sm rounded-lg text-sm font-sans font-semibold transition-colors flex items-center gap-2 ${slackResult?.sent
                        ? 'bg-emerald-500 text-white'
                        : slackResult && !slackResult.sent
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333333] text-[#0D2535] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2A2A2A]'
                      }`}
                  >
                    {slackSending
                      ? <RefreshCw size={16} className="animate-spin" />
                      : slackResult?.sent
                        ? <CheckCircle2 size={16} />
                        : slackResult && !slackResult.sent
                          ? <AlertCircle size={16} />
                          : <Slack size={16} className="text-[#611f69]" />
                    }
                    {slackResult ? slackResult.sent ? 'Wysłano!' : 'Błąd' : 'Slack'}
                  </button>
                  {/* Google Docs */}
                  <button
                    onClick={handleGdocsExport}
                    disabled={gdocsSending}
                    title="Eksportuj do Google Docs"
                    className={`px-4 py-2 shadow-sm rounded-lg text-sm font-sans font-semibold transition-colors flex items-center gap-2 ${gdocsResult
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333333] text-[#0D2535] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2A2A2A]'
                      }`}
                  >
                    {gdocsSending
                      ? <RefreshCw size={16} className="animate-spin" />
                      : gdocsResult
                        ? <CheckCircle2 size={16} />
                        : <FileText size={16} className="text-[#4285F4]" />
                    }
                    {gdocsResult ? 'Otwórz Docs' : 'Google Docs'}
                  </button>
                </div>
                {/* Linki po eksporcie */}
                {gdocsResult && (
                  <div className="mt-2 flex justify-end">
                    <a
                      href={gdocsResult.doc_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline font-sans flex items-center gap-1"
                    >
                      <FileText size={12} /> Otwórz dokument Google Docs
                    </a>
                  </div>
                )}
                {gdocsError && (
                  <p className="mt-2 text-xs text-red-500 font-sans text-right">{gdocsError}</p>
                )}
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STAT_CARDS(result).map(card => (
                <div key={card.label} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5">
                  <p className="text-xs text-slate-500 font-sans font-semibold uppercase tracking-widest">{card.label}</p>
                  <p className="font-mono font-bold text-3xl mt-2 mb-1" style={{ color: card.color }}>{card.value}</p>
                  <p className="text-sm text-slate-500 font-sans">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* ROI */}
            {result.scorecard?.roi_estimate && (
              <div className="mt-6 flex items-start gap-4 rounded-xl border border-[#BFDBFE] bg-[#F0F9FF] p-5">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Zap size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-bold text-blue-900 mb-1">Estimated ROI Impact</h3>
                  <p className="text-sm text-blue-800 font-sans leading-relaxed">{result.scorecard.roi_estimate}</p>
                </div>
              </div>
            )}
          </div>

          {/* JTBD Structure */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#333333] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-[#333333] flex items-center justify-center shadow-sm">
                <Target size={16} className="text-slate-600" />
              </div>
              <h2 className="font-mono font-bold text-lg text-[#0D2535]">Jobs-to-be-Done Framework</h2>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-8">
                {[
                  { label: 'Functional Job', value: result.jtbd.functional_job },
                  { label: 'Emotional Job', value: result.jtbd.emotional_job },
                  { label: 'Social Job', value: result.jtbd.social_job },
                ].map(item => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-t-lg border border-[#E2E8F0] border-b-0 w-max">
                      {item.label}
                    </span>
                    <div className="bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333333] p-4 rounded-b-lg rounded-tr-lg flex-1 shadow-sm">
                      <p className="text-[#0D2535] font-sans leading-relaxed">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {result.jtbd.competing_solutions.length > 0 && (
                <div className="pt-6 border-t border-[#E2E8F0]">
                  <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    Current Solutions in Market
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.jtbd.competing_solutions.map((s, i) => (
                      <span key={i} className="text-sm bg-[#F8FAFC] border border-[#E2E8F0] text-slate-700 font-sans px-3 py-1.5 rounded-lg shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Forces Diagram */}
          {result.forces_report && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#333333] overflow-hidden">
              <div className="p-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-[#333333] flex items-center justify-center shadow-sm">
                  <Zap size={16} className="text-[#F59E0B]" />
                </div>
                <h2 className="font-mono font-bold text-lg text-[#0D2535]">Forces Diagram</h2>
              </div>
              <div className="p-8">
                <ForcesChart forcesReport={result.forces_report} />
                <details className="mt-8 group">
                  <summary className="text-sm font-sans font-semibold text-slate-500 cursor-pointer hover:text-[#14B8A6] transition-colors list-none flex items-center gap-2">
                    <svg className="w-4 h-4 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    View detailed force analysis text
                  </summary>
                  <div className="mt-4 prose prose-slate prose-sm max-w-none font-sans bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.forces_report}</ReactMarkdown>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Reasoning */}
          {result.jtbd.reasoning && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#333333] overflow-hidden">
              <div className="p-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-[#333333] flex items-center justify-center shadow-sm">
                  <FileSearch size={16} className="text-indigo-500" />
                </div>
                <h2 className="font-mono font-bold text-lg text-[#0D2535]">Analysis & Reasoning</h2>
              </div>
              <div className="p-8">
                <div className="prose prose-slate max-w-none font-sans">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.jtbd.reasoning}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Assumption Map */}
          {result.assumption_map && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#333333] overflow-hidden">
              <div className="p-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-[#333333] flex items-center justify-center shadow-sm">
                  <Map size={16} className="text-[#10B981]" />
                </div>
                <h2 className="font-mono font-bold text-lg text-[#0D2535]">Assumption Map</h2>
              </div>
              <div className="p-8">
                <AssumptionTable assumptionMap={result.assumption_map} />
              </div>
            </div>
          )}

          {/* Synthetic Archetypes */}
          {result.synthetic_archetypes && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#333333] overflow-hidden">
              <div className="p-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-[#333333] flex items-center justify-center shadow-sm">
                  <Users size={16} className="text-[#3B82F6]" />
                </div>
                <h2 className="font-mono font-bold text-lg text-[#0D2535]">Synthetic Personas</h2>
              </div>
              <div className="p-8 bg-[#F8FAFC]">
                {parseArchetypes(result.synthetic_archetypes).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {parseArchetypes(result.synthetic_archetypes).map((a, i) => (
                      <ArchetypeCard key={i} profile={a} />
                    ))}
                  </div>
                ) : (
                  <div className="prose prose-slate prose-sm max-w-none font-sans bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-slate-200 dark:border-[#333333]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.synthetic_archetypes}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Competitive Research */}
          {result.competitive_report && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#333333] overflow-hidden">
              <div className="p-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-[#333333] flex items-center justify-center shadow-sm">
                  <FileText size={16} className="text-slate-600" />
                </div>
                <h2 className="font-mono font-bold text-lg text-[#0D2535]">Competitive Analysis</h2>
              </div>
              <div className="p-8">
                <div className="prose prose-slate max-w-none font-sans">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.competitive_report}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {miroOpen && result && (
        <MiroExportModal
          sessionId={result.session_id}
          onClose={() => setMiroOpen(false)}
        />
      )}
    </div>
  )
}

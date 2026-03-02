import { useEffect, useCallback } from 'react'
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
import type { DiscoveryResult, SyntheticProfile } from '../types/discovery'

function parseArchetypes(raw: string): SyntheticProfile[] {
  // Syntetyczne archetypy z DiscoveryResult są zapisane jako text — tworzymy mock profiles
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

const STAT_CARDS = (result: DiscoveryResult) => [
  {
    label: 'Pewność',
    value: `${result.jtbd?.confidence ?? '—'}%`,
    sub: `poziom dowodów: ${result.jtbd?.evidence_level ?? '—'}`,
    color: 'text-indigo-600',
  },
  {
    label: 'Czas analizy',
    value: `${Math.max(1, Math.round((result.duration_hours || 0) * 60))} min`,
    sub: 'czas sesji Discovery',
    color: 'text-gray-700',
  },
  {
    label: 'Confidence delta',
    value: result.scorecard
      ? `${result.scorecard.confidence_before}% → ${result.scorecard.confidence_after}%`
      : '—',
    sub: 'przed → po Discovery',
    color: 'text-purple-600',
  },
]

export default function Report() {
  const { id } = useParams<{ id: string }>()
  const {
    sessionStatus, setSessionStatus,
    discoveryResult, setDiscoveryResult,
  } = useAppStore()

  const poll = useCallback(async () => {
    if (!id) return
    try {
      const status = await api.getStatus(id)
      setSessionStatus(status)

      if (status.status === 'completed') {
        const result = await api.getResult(id)
        setDiscoveryResult(result)
      } else if (status.status === 'running' || status.status === 'queued') {
        setTimeout(poll, 2000)
      }
    } catch (err) {
      console.error('Poll error:', err)
    }
  }, [id, setSessionStatus, setDiscoveryResult])

  useEffect(() => {
    setDiscoveryResult(null)
    poll()
  }, [id, poll])

  const isRunning = sessionStatus?.status === 'running' || sessionStatus?.status === 'queued'
  const result = discoveryResult

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
      </div>

      {/* Progress view */}
      {isRunning && (
        <div className="card p-6 mb-8">
          <h2 className="font-bold text-lg mb-4">
            🔍 Discovery w toku...
          </h2>
          <ProgressTracker
            progress={sessionStatus?.progress ?? 0}
            currentNode={sessionStatus?.current_node}
            logs={sessionStatus?.logs}
          />
        </div>
      )}

      {sessionStatus?.status === 'failed' && (
        <div className="card p-6 bg-red-50 border-red-200 mb-8">
          <h2 className="font-bold text-red-700">❌ Discovery nie powiodła się</h2>
          <p className="text-sm text-red-600 mt-1">
            {sessionStatus.logs?.[sessionStatus.logs.length - 1] || 'Sprawdź logi backendu.'}
          </p>
        </div>
      )}

      {/* Full report */}
      {result && result.jtbd && (
        <div className="space-y-8">
          {/* Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{result.project_name}</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Sesja ID: {result.session_id.slice(0, 8)}...
                </p>
              </div>
              <VerdictBadge verdict={result.jtbd.verdict} size="lg" />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {STAT_CARDS(result).map(card => (
                <div key={card.label} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</p>
                  <p className={`text-lg font-bold mt-1 ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* ROI */}
            {result.scorecard?.roi_estimate && (
              <div className="mt-4 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                {result.scorecard.roi_estimate}
              </div>
            )}
          </div>

          {/* JTBD */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">📌 Jobs-to-be-Done</h2>
            <div className="grid gap-3 text-sm">
              {[
                { label: '⚙️ Functional Job', value: result.jtbd.functional_job },
                { label: '❤️ Emotional Job', value: result.jtbd.emotional_job },
                { label: '👥 Social Job', value: result.jtbd.social_job },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase">{item.label}</span>
                  <p className="mt-1 text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>

            {result.jtbd.competing_solutions.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Obecne rozwiązania
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.jtbd.competing_solutions.map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Forces Diagram */}
          {result.forces_report && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">⚡ Forces Diagram</h2>
              <ForcesChart forcesReport={result.forces_report} />
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Pełna analiza sił
                </summary>
                <div className="mt-3 prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.forces_report}</ReactMarkdown>
                </div>
              </details>
            </div>
          )}

          {/* Reasoning */}
          {result.jtbd.reasoning && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">📊 Analiza i uzasadnienie</h2>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.jtbd.reasoning}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Assumption Map */}
          {result.assumption_map && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">🗺️ Mapa założeń</h2>
              <AssumptionTable assumptionMap={result.assumption_map} />
            </div>
          )}

          {/* Synthetic Archetypes */}
          {result.synthetic_archetypes && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">🎭 Archetypy syntetyczne</h2>
              {parseArchetypes(result.synthetic_archetypes).length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {parseArchetypes(result.synthetic_archetypes).map((a, i) => (
                    <ArchetypeCard key={i} profile={a} />
                  ))}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.synthetic_archetypes}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Competitive Research */}
          {result.competitive_report && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">🏆 Analiza konkurencji</h2>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.competitive_report}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Export */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">📥 Eksport</h2>
            <div className="flex gap-3">
              <a
                href={api.exportHtmlUrl(result.session_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                📄 Pobierz HTML
              </a>
              <a
                href={api.exportPdfUrl(result.session_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                📑 Pobierz PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

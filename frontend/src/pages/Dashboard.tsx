import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Folder } from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import VerdictBadge from '../components/VerdictBadge'

const EVIDENCE_LABELS: Record<string, string> = {
  '0_Opinion': 'Opinia',
  '1_Preference': 'Preferencja',
  '2_Past_Behavior': 'Zachowanie',
  '3_Time_Commitment': 'Zaangażowanie',
  '4_Financial': 'Finansowe',
  '5_Cash': 'Gotówka',
}

const STATUS_BADGE: Record<string, string> = {
  queued:    'badge-status-queued',
  running:   'badge-status-running',
  completed: 'badge-status-completed',
  failed:    'badge-status-failed',
}

const STATUS_LABEL: Record<string, string> = {
  queued: 'Oczekuje', running: 'W toku', completed: 'Ukończona', failed: 'Błąd sesji',
}

const MODE_BADGE: Record<string, string> = {
  auto:     'badge-mode-auto',
  problem:  'badge-mode-problem',
  solution: 'badge-mode-solution',
  simulate: 'badge-mode-simulate',
}

const RUNNING_DOT = 'inline-block w-1.5 h-1.5 rounded-full bg-[#22C55E] mr-1.5 animate-pulse'
const QUEUED_DOT  = 'inline-block w-1.5 h-1.5 rounded-full bg-[#F59E0B] mr-1.5'

export default function Dashboard() {
  const { projects, setProjects } = useAppStore()

  useEffect(() => {
    api.getProjects().then(setProjects).catch(console.error)
  }, [setProjects])

  return (
    <div className="p-5">
      {/* Pasek akcji */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-sans text-slate-500">
          {projects.length} {projects.length === 1 ? 'sesja' : 'sesji'}
        </p>
        <Link to="/discovery/new" className="btn-primary">
          <Plus size={15} />
          Nowy projekt
        </Link>
      </div>

      {/* Pusta lista */}
      {projects.length === 0 ? (
        <div className="card p-12 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#F0FDFA' }}
          >
            <Folder size={28} style={{ color: '#14B8A6' }} />
          </div>
          <h2 className="font-mono font-semibold text-lg text-[#0D2535] mb-2">Brak projektów</h2>
          <p className="text-slate-400 font-sans text-sm mb-6">
            Uruchom pierwsze discovery, aby zobaczyć wyniki tutaj.
          </p>
          <Link to="/discovery/new" className="btn-primary inline-flex">
            <Plus size={15} />
            Zacznij teraz
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((p) => (
            <Link
              key={p.session_id}
              to={`/discovery/${p.session_id}`}
              className="card p-5 hover:shadow-md transition-shadow flex items-start justify-between gap-4 group"
            >
              <div className="min-w-0 flex-1">
                {/* Tytuł + badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h3 className="font-mono font-semibold text-[#0D2535] group-hover:text-[#14B8A6] transition-colors truncate">
                    {p.project_name}
                  </h3>

                  <span className={STATUS_BADGE[p.status] || 'badge-status-queued'}>
                    <span className={p.status === 'running' ? RUNNING_DOT : QUEUED_DOT} />
                    {STATUS_LABEL[p.status] || p.status}
                  </span>

                  <span className={MODE_BADGE[p.mode] || 'badge-mode-auto'}>
                    {p.mode}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-slate-400 font-sans flex-wrap">
                  {p.evidence_level && (
                    <span>Dowody: {EVIDENCE_LABELS[p.evidence_level] || p.evidence_level}</span>
                  )}
                  {p.confidence != null && (
                    <span>
                      Pewność:{' '}
                      <span className="font-semibold" style={{ color: '#14B8A6' }}>
                        {p.confidence}%
                      </span>
                    </span>
                  )}
                  <span>{new Date(p.created_at).toLocaleDateString('pl-PL')}</span>
                </div>
              </div>

              <VerdictBadge verdict={p.verdict} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

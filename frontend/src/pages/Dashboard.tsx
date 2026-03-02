import { useEffect } from 'react'
import { Link } from 'react-router-dom'
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

const STATUS_CLASSES: Record<string, string> = {
  queued: 'bg-gray-100 text-gray-600',
  running: 'bg-blue-100 text-blue-700 animate-pulse',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const { projects, setProjects } = useAppStore()

  useEffect(() => {
    api.getProjects().then(setProjects).catch(console.error)
  }, [setProjects])

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Discovery</h1>
          <p className="text-gray-500 text-sm mt-1">
            {projects.length} {projects.length === 1 ? 'sesja' : 'sesji'}
          </p>
        </div>
        <Link to="/discovery/new" className="btn-primary">
          + Nowy projekt
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Brak projektów</h2>
          <p className="text-gray-500 mb-6">Uruchom pierwsze discovery, aby zobaczyć wyniki tutaj.</p>
          <Link to="/discovery/new" className="btn-primary inline-block">
            Zacznij teraz
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Link
              key={p.session_id}
              to={`/discovery/${p.session_id}`}
              className="card p-5 hover:shadow-md transition-shadow flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 truncate">{p.project_name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CLASSES[p.status] || ''}`}
                  >
                    {p.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {p.mode}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                  {p.evidence_level && (
                    <span>Dowody: {EVIDENCE_LABELS[p.evidence_level] || p.evidence_level}</span>
                  )}
                  {p.confidence != null && (
                    <span>Pewność: {p.confidence}%</span>
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

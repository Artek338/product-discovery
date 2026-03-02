import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MoreHorizontal, Filter, Download, Search } from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'

const STATUS_BADGE: Record<string, string> = {
  queued:    'text-[#F59E0B] bg-[#FEF3C7]',
  running:   'text-[#10B981] bg-[#D1FAE5]',
  completed: 'text-[#14B8A6] bg-[#CCFBF1]',
  failed:    'text-[#EF4444] bg-[#FEE2E2]',
}

export default function Dashboard() {
  const { projects, setProjects, language } = useAppStore()

  useEffect(() => {
    api.getProjects().then(setProjects).catch(console.error)
  }, [setProjects])

  const STATUS_LABEL: Record<string, string> = {
    queued: t(language, 'status_queued'),
    running: t(language, 'status_running'),
    completed: t(language, 'status_completed'),
    failed: t(language, 'status_failed'),
  }

  const activeCount = projects.filter(p => p.status === 'running').length
  const completedCount = projects.filter(p => p.status === 'completed').length
  const queuedCount = projects.filter(p => p.status === 'queued').length
  const failedCount = projects.filter(p => p.status === 'failed').length
  const successRate = projects.length > 0 ? Math.round((completedCount / projects.length) * 100) : 0

  // Confidence breakdown (tylko ukończone z weryfiktem)
  const withVerdict = projects.filter(p => p.verdict)
  const goCount   = withVerdict.filter(p => p.verdict === 'GO').length
  const needsCount = withVerdict.filter(p => p.verdict === 'NEEDS_MORE_DATA').length
  const nogoCount = withVerdict.filter(p => p.verdict === 'NO-GO').length
  const total = withVerdict.length || 1

  const goPct    = Math.round((goCount / total) * 100)
  const needsPct = Math.round((needsCount / total) * 100)
  const nogoPct  = Math.round((nogoCount / total) * 100)

  // SVG circle helpers (r=40, circumference ≈ 251)
  const circ = 251
  const circleOffset = (pct: number) => circ - (pct / 100) * circ

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Discovery overview */}
        <div
          className="col-span-1 rounded-2xl p-6 flex flex-col justify-between"
          style={{ backgroundColor: '#0D2535' }}
        >
          <div>
            <h2 className="text-white text-lg font-sans font-medium mb-6">
              {t(language, 'dash_overview')}
            </h2>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-5xl font-sans font-semibold" style={{ color: '#FBBF24' }}>
                {projects.length}
              </span>
              <span className="text-slate-300 text-sm mb-1">
                {language === 'pl' ? 'Łącznie' : 'Total'}<br />
                {language === 'pl' ? 'projektów' : 'Projects'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300 flex-wrap">
              <div>
                <strong className="text-white font-medium">{queuedCount}</strong>{' '}
                {t(language, 'dash_queued')}
              </div>
              <div>
                <strong className="text-white font-medium">{completedCount}</strong>{' '}
                {t(language, 'dash_done')}
              </div>
              <div>
                <strong className="text-white font-medium">{successRate}%</strong>{' '}
                {t(language, 'dash_success_rate')}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder={t(language, 'search_ph')}
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Session Statistics */}
        <div className="col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans font-semibold text-[#0D2535] text-lg">
              {t(language, 'dash_session_stats')}
            </h3>
            <button className="text-slate-400 hover:bg-slate-50 p-1 rounded">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {/* Donut chart — rzeczywiste dane */}
            {projects.length > 0 ? (
              <div
                className="relative w-28 h-28 rounded-full"
                style={{
                  background: `conic-gradient(
                    #0D2535 0% ${(completedCount / projects.length) * 100}%,
                    #FF8A65 ${(completedCount / projects.length) * 100}% ${((completedCount + failedCount) / projects.length) * 100}%,
                    #FBBF24 ${((completedCount + failedCount) / projects.length) * 100}% 100%
                  )`,
                }}
              >
                <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full" />
              </div>
            ) : (
              <div
                className="relative w-28 h-28 rounded-full"
                style={{ background: '#F1F5F9' }}
              >
                <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full" />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-[#0D2535] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#0D2535]" />
                  {t(language, 'status_completed')}
                </div>
                <div className="text-xs text-slate-400 ml-4">
                  {completedCount} {t(language, 'dash_sessions_label')}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-[#0D2535] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
                  {t(language, 'status_queued')}
                </div>
                <div className="text-xs text-slate-400 ml-4">
                  {queuedCount + activeCount} {t(language, 'dash_sessions_label')}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-[#0D2535] font-medium">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF8A65' }} />
                  {t(language, 'status_failed')}
                </div>
                <div className="text-xs text-slate-400 ml-4">
                  {failedCount} {t(language, 'dash_sessions_label')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discovery Effectiveness — realne dane werdyktów */}
        <div className="col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-sans font-semibold text-[#0D2535] text-lg">
              {t(language, 'dash_effectiveness')}
            </h3>
            <button className="text-slate-400 hover:bg-slate-50 p-1 rounded">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
              {t(language, 'dash_high_conf')} (GO)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
              {t(language, 'dash_medium_conf')}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#64748B]" />
              {t(language, 'dash_low_conf')} (NO-GO)
            </div>
          </div>

          {withVerdict.length === 0 ? (
            <p className="text-sm text-slate-400 font-sans text-center py-4">
              {language === 'pl' ? 'Brak ukończonych sesji z werydktem.' : 'No completed sessions with verdicts yet.'}
            </p>
          ) : (
            <div className="flex items-center justify-around">
              {[
                { pct: goPct, color: '#14B8A6', label: 'GO' },
                { pct: needsPct, color: '#FBBF24', label: language === 'pl' ? 'Więcej\ndanych' : 'More\ndata' },
                { pct: nogoPct, color: '#64748B', label: 'NO-GO' },
              ].map(({ pct, color, label }) => (
                <div key={label} className="relative w-20 h-20 flex flex-col items-center">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="10" fill="none" />
                    <circle
                      cx="50" cy="50" r="40"
                      stroke={color}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={circ}
                      strokeDashoffset={circleOffset(pct)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-sans font-bold text-[#0D2535] text-sm">{pct}%</span>
                  </div>
                  <span className="text-xs text-slate-400 font-sans text-center mt-1 leading-tight whitespace-pre-line">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-sans font-semibold text-[#0D2535] text-lg">
            {t(language, 'dash_table_title')}
          </h3>
          <div className="flex gap-3">
            <Link
              to="/discovery/new"
              className="flex items-center gap-2 text-sm font-sans font-semibold text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
              style={{ backgroundColor: '#14B8A6' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0D9488')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#14B8A6')}
            >
              <Plus size={15} />
              {t(language, 'dash_new_btn')}
            </Link>
            <button className="flex items-center gap-2 text-sm text-[#0D2535] border border-[#E2E8F0] px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <Filter size={14} /> {t(language, 'dash_filter')}
            </button>
            <button className="flex items-center gap-2 text-sm text-[#0D2535] border border-[#E2E8F0] px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <Download size={14} /> {t(language, 'dash_export')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-slate-300 w-4 h-4 cursor-pointer accent-[#14B8A6]" />
                    {t(language, 'dash_col_no')} ↕
                  </div>
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide">
                  {t(language, 'dash_col_name')}
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide">
                  {t(language, 'dash_col_mode')} ↕
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide">
                  {t(language, 'dash_col_status')} ↕
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide">
                  {t(language, 'dash_col_date')} ↕
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide text-right">
                  {t(language, 'dash_col_action')}
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-sm font-sans">
                    {t(language, 'dash_empty')}{' '}
                    <Link to="/discovery/new" className="text-[#14B8A6] hover:underline">
                      {t(language, 'dash_create_one')}
                    </Link>
                  </td>
                </tr>
              ) : projects.map((p, idx) => (
                <tr
                  key={p.session_id}
                  className="border-b border-[#F1F5F9] last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 cursor-pointer accent-[#14B8A6]" />
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Link
                      to={`/discovery/${p.session_id}`}
                      className="font-sans font-medium text-[#0D2535] hover:text-[#14B8A6] transition-colors"
                    >
                      {p.project_name}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500 font-sans capitalize">{p.mode}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium font-sans ${STATUS_BADGE[p.status] || STATUS_BADGE.queued}`}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500 font-sans">
                    {new Date(p.created_at).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-GB')}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-[#0D2535] transition-colors rounded hover:bg-slate-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

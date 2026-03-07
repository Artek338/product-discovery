import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Filter, Download, Search } from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'

const STATUS_BADGE: Record<string, string> = {
  queued: 'text-[#F59E0B] bg-[#FEF3C7]',
  running: 'text-[#10B981] bg-[#D1FAE5]',
  completed: 'text-[#14B8A6] bg-[#CCFBF1]',
  failed: 'text-[#EF4444] bg-[#FEE2E2]',
}

export default function Dashboard() {
  const { projects, setProjects, language, globalSearchQuery, setGlobalSearchQuery } = useAppStore()
  const navigate = useNavigate()
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterOption, setFilterOption] = useState<string>('all')

  useEffect(() => {
    api.getProjects().then((data: any) => {
      const items = Array.isArray(data) ? data : (data.items ?? [])
      setProjects(items)
    }).catch(console.error)
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

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.project_name?.toLowerCase().includes(globalSearchQuery.toLowerCase())
    if (!matchesSearch) return false

    switch (filterOption) {
      case 'mode_auto':
        return p.mode === 'auto'
      case 'mode_problem':
        return p.mode === 'problem'
      case 'mode_solution':
        return p.mode === 'solution'
      case 'status_completed':
        return p.status === 'completed'
      case 'status_running':
        return p.status === 'running'
      case 'status_failed':
        return p.status === 'failed'
      default:
        return true
    }
  })

  const handleExportCSV = () => {
    setIsExportOpen(false)
    const headers = ['Nr', 'Nazwa projektu', 'Tryb', 'Status', 'Data']
    const rows = filteredProjects.map((p, idx) => [
      idx + 1,
      p.project_name,
      p.mode,
      p.status,
      new Date(p.created_at).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-GB')
    ])

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'projekty_zestawienie.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    setIsExportOpen(false)
    window.print()
  }


  // Confidence breakdown (tylko ukończone z weryfiktem)
  const withVerdict = projects.filter(p => p.verdict)
  const goCount = withVerdict.filter(p => p.verdict === 'GO').length
  const needsCount = withVerdict.filter(p => p.verdict === 'NEEDS_MORE_DATA').length
  const nogoCount = withVerdict.filter(p => p.verdict === 'NO-GO').length
  const total = withVerdict.length || 1

  const goPct = Math.round((goCount / total) * 100)
  const needsPct = Math.round((needsCount / total) * 100)
  const nogoPct = Math.round((nogoCount / total) * 100)

  // SVG circle helpers are now directly inlined or we can leave them
  // Removed circ because we use 264 now directly in SVG

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto overflow-hidden">
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Discovery overview */}
        <div className="col-span-1 bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] flex flex-col items-center relative text-center transition-colors">
          <div className="flex justify-between items-center w-full mb-8 relative">
            <div className="flex-1 text-center">
              <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-lg inline-block">
                {t(language, 'dash_overview')}
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 mb-8 w-full">
            <span className="text-6xl font-sans font-bold leading-none text-[#0D2535] dark:text-slate-100">
              {projects.length}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm text-center leading-tight">
              {language === 'pl' ? 'Łącznie projektów' : 'Total Projects'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm flex-wrap w-full mt-auto">
            <div className="flex flex-col items-center">
              <strong className="text-[#0D2535] dark:text-slate-100 font-semibold text-xl">{queuedCount}</strong>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t(language, 'dash_queued')}</span>
            </div>
            <div className="flex flex-col items-center border-x border-[#E2E8F0] dark:border-[#333333] px-6">
              <strong className="text-[#14B8A6] font-semibold text-xl">{completedCount}</strong>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t(language, 'dash_done')}</span>
            </div>
            <div className="flex flex-col items-center">
              <strong className="text-[#0D2535] dark:text-slate-100 font-semibold text-xl">{successRate}%</strong>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t(language, 'dash_success_rate')}</span>
            </div>
          </div>
        </div>

        {/* Session Statistics */}
        <div className="col-span-1 bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] flex flex-col items-center relative text-center transition-colors">
          <div className="flex justify-between items-center w-full mb-8 relative">
            <div className="flex-1 text-center">
              <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-lg inline-block">
                {t(language, 'dash_session_stats')}
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-8 w-full h-full">
            {/* Donut chart — rzeczywiste dane */}
            {projects.length > 0 ? (
              <div
                className="relative w-36 h-36 rounded-full shrink-0"
                style={{
                  background: `conic-gradient(
                    #14B8A6 0% ${(completedCount / projects.length) * 100}%,
                    #FF8A65 ${(completedCount / projects.length) * 100}% ${((completedCount + failedCount) / projects.length) * 100}%,
                    #FBBF24 ${((completedCount + failedCount) / projects.length) * 100}% 100%
                  )`,
                }}
              >
                <div className="absolute inset-0 m-auto w-24 h-24 bg-white dark:bg-[#1A1A1A] rounded-full transition-colors" />
              </div>
            ) : (
              <div
                className="relative w-36 h-36 rounded-full shrink-0"
                style={{ background: '#F1F5F9' }}
              >
                <div className="absolute inset-0 m-auto w-24 h-24 bg-white dark:bg-[#1A1A1A] rounded-full transition-colors" />
              </div>
            )}

            <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-4 w-full mt-auto">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-sm text-[#0D2535] dark:text-slate-200 font-medium mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
                  {t(language, 'status_completed')}
                </div>
                <div className="text-xs text-slate-400">
                  {completedCount} {t(language, 'dash_sessions_label')}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-sm text-[#0D2535] dark:text-slate-200 font-medium mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                  {t(language, 'status_queued')}
                </div>
                <div className="text-xs text-slate-400">
                  {queuedCount + activeCount} {t(language, 'dash_sessions_label')}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-sm text-[#0D2535] dark:text-slate-200 font-medium mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF8A65' }} />
                  {t(language, 'status_failed')}
                </div>
                <div className="text-xs text-slate-400">
                  {failedCount} {t(language, 'dash_sessions_label')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discovery Effectiveness — realne dane werdyktów */}
        <div className="col-span-1 bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] flex flex-col relative text-center transition-colors">
          <div className="flex justify-between items-center mb-8 w-full relative">
            <div className="flex-1 text-center">
              <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-lg inline-block">
                {t(language, 'dash_effectiveness')}
              </h3>
            </div>
          </div>

          {withVerdict.length === 0 ? (
            <p className="text-sm text-slate-400 font-sans text-center py-4 my-auto">
              {language === 'pl' ? 'Brak ukończonych sesji z werydktem.' : 'No completed sessions with verdicts yet.'}
            </p>
          ) : (
            <div className="flex flex-col w-full h-full justify-between items-center">
              {/* WYKRESY KOŁOWE U GÓRY */}
              <div className="flex items-start justify-center gap-6 mb-8 w-full">
                {[
                  { pct: goPct, color: '#14B8A6', label: 'GO' },
                  { pct: needsPct, color: '#FBBF24', label: language === 'pl' ? 'Więcej\ndanych' : 'More\ndata' },
                  { pct: nogoPct, color: '#64748B', label: 'NO-GO' },
                ].map(({ pct, color, label }) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="#F1F5F9" strokeWidth="6" fill="none" />
                        <circle
                          cx="50" cy="50" r="42"
                          stroke={color}
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={264}
                          strokeDashoffset={264 - (pct / 100) * 264}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-sans font-bold text-[#0D2535] dark:text-slate-100 text-sm">{pct}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-sans text-center leading-tight whitespace-pre-line font-medium">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* OPISY POD WYKRESAMI ZOSTALY USUNIETE ZGODNIE Z PROSBA UZYTKOWNIKA */}
            </div>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-[#E2E8F0] dark:border-[#333333] transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="font-sans font-semibold text-[#0D2535] dark:text-slate-100 text-lg">
            {t(language, 'dash_table_title')}
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] dark:border-[#333333] rounded-lg bg-white dark:bg-[#111111] transition-colors">
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder={t(language, 'search_ph')}
                className="bg-transparent border-none outline-none text-sm text-[#0D2535] dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-left w-full sm:w-48"
              />
              <Search size={14} className="text-slate-400" />
            </div>
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
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 text-sm text-[#0D2535] dark:text-slate-300 border border-[#E2E8F0] dark:border-[#333333] px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors ${filterOption !== 'all' ? 'bg-slate-50 dark:bg-[#2A2A2A] font-medium' : ''}`}
              >
                <Filter size={14} />
                {filterOption === 'all' && t(language, 'dash_filter')}
                {filterOption === 'mode_auto' && 'Tryb: Auto'}
                {filterOption === 'mode_problem' && 'Tryb: Problem'}
                {filterOption === 'mode_solution' && 'Tryb: Rozwiązanie'}
                {filterOption === 'status_completed' && 'Status: Ukończone'}
                {filterOption === 'status_running' && 'Status: W trakcie'}
                {filterOption === 'status_failed' && 'Status: Błąd'}
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-lg border border-[#E2E8F0] dark:border-[#333333] py-1 z-10 max-sm:left-0 max-sm:right-auto">
                  <button onClick={() => { setFilterOption('all'); setIsFilterOpen(false) }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-[#2A2A2A] ${filterOption === 'all' ? 'text-[#14B8A6] font-medium' : 'text-[#0D2535] dark:text-slate-300'}`}>Wszystkie</button>
                  <div className="px-4 py-1 text-xs font-semibold text-slate-400 mt-1 uppercase">Tryb</div>
                  <button onClick={() => { setFilterOption('mode_auto'); setIsFilterOpen(false) }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-[#2A2A2A] ${filterOption === 'mode_auto' ? 'text-[#14B8A6] font-medium' : 'text-[#0D2535] dark:text-slate-300'}`}>Auto</button>
                  <button onClick={() => { setFilterOption('mode_problem'); setIsFilterOpen(false) }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-[#2A2A2A] ${filterOption === 'mode_problem' ? 'text-[#14B8A6] font-medium' : 'text-[#0D2535] dark:text-slate-300'}`}>Problem</button>
                  <button onClick={() => { setFilterOption('mode_solution'); setIsFilterOpen(false) }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-[#2A2A2A] ${filterOption === 'mode_solution' ? 'text-[#14B8A6] font-medium' : 'text-[#0D2535] dark:text-slate-300'}`}>Rozwiązanie</button>
                  <div className="px-4 py-1 text-xs font-semibold text-slate-400 mt-1 uppercase">Status</div>
                  <button onClick={() => { setFilterOption('status_completed'); setIsFilterOpen(false) }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-[#2A2A2A] ${filterOption === 'status_completed' ? 'text-[#14B8A6] font-medium' : 'text-[#0D2535] dark:text-slate-300'}`}>Ukończone</button>
                  <button onClick={() => { setFilterOption('status_running'); setIsFilterOpen(false) }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-[#2A2A2A] ${filterOption === 'status_running' ? 'text-[#14B8A6] font-medium' : 'text-[#0D2535] dark:text-slate-300'}`}>W trakcie</button>
                  <button onClick={() => { setFilterOption('status_failed'); setIsFilterOpen(false) }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-[#2A2A2A] ${filterOption === 'status_failed' ? 'text-[#14B8A6] font-medium' : 'text-[#0D2535] dark:text-slate-300'}`}>Błąd</button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-2 text-sm text-[#0D2535] dark:text-slate-300 border border-[#E2E8F0] dark:border-[#333333] px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors"
              >
                <Download size={14} /> {t(language, 'dash_export')}
              </button>
              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-lg border border-[#E2E8F0] dark:border-[#333333] py-1 z-10 max-sm:left-0 max-sm:right-auto">
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2 text-sm text-[#0D2535] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors"
                  >
                    CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-4 py-2 text-sm text-[#0D2535] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors"
                  >
                    PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#333333]">
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
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-sm font-sans">
                    {t(language, 'dash_empty')}{' '}
                    <Link to="/discovery/new" className="text-[#14B8A6] hover:underline">
                      {t(language, 'dash_create_one')}
                    </Link>
                  </td>
                </tr>
              ) : filteredProjects.map((p, idx) => (
                <tr
                  key={p.session_id}
                  onClick={() => navigate(`/discovery/${p.session_id}`)}
                  className="border-b border-[#F1F5F9] dark:border-[#333333]/60 last:border-0 hover:bg-slate-50 dark:hover:bg-[#222222] transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 cursor-pointer accent-[#14B8A6]" />
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Link
                      to={`/discovery/${p.session_id}`}
                      className="font-sans font-medium text-[#0D2535] dark:text-slate-100 hover:text-[#14B8A6] transition-colors"
                    >
                      {p.project_name}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 font-sans capitalize">{p.mode}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium font-sans ${STATUS_BADGE[p.status] || STATUS_BADGE.queued}`}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 font-sans">
                    {new Date(p.created_at).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-GB')}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-[#0D2535] dark:hover:text-slate-200 transition-colors rounded hover:bg-slate-100 dark:hover:bg-[#2A2A2A]">
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

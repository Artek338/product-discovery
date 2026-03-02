import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MoreHorizontal, Filter, Download, Search } from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'

const STATUS_BADGE: Record<string, string> = {
  queued: 'text-[#F59E0B] bg-[#FEF3C7]',
  running: 'text-[#10B981] bg-[#D1FAE5]',
  completed: 'text-[#14B8A6] bg-[#CCFBF1]',
  failed: 'text-[#EF4444] bg-[#FEE2E2]',
}

const STATUS_LABEL: Record<string, string> = {
  queued: 'Oczekuje', running: 'W toku', completed: 'Ukończona', failed: 'Błąd',
}

export default function Dashboard() {
  const { projects, setProjects } = useAppStore()

  useEffect(() => {
    api.getProjects().then(setProjects).catch(console.error)
  }, [setProjects])

  const activeCount = projects.filter(p => p.status === 'running').length
  const completedCount = projects.filter(p => p.status === 'completed').length
  const queuedCount = projects.filter(p => p.status === 'queued').length
  const successRate = projects.length > 0 ? Math.round((completedCount / projects.length) * 100) : 0

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Discovery overview */}
        <div className="col-span-1 rounded-2xl p-6 flex flex-col justify-between" style={{ backgroundColor: '#0D2535' }}>
          <div>
            <h2 className="text-white text-lg font-sans font-medium mb-6">Discovery overview</h2>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-5xl font-sans font-semibold" style={{ color: '#FBBF24' }}>
                {projects.length}
              </span>
              <span className="text-slate-300 text-sm mb-1">Total<br />Projects</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div><strong className="text-white font-medium">{queuedCount}</strong> Queued</div>
              <div><strong className="text-white font-medium">{completedCount}</strong> Done</div>
              <div><strong className="text-white font-medium">{successRate}%</strong> Success rate</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Search Project" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-400" />
            </div>
          </div>
        </div>

        {/* Session Statistic */}
        <div className="col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans font-semibold text-[#0D2535] text-lg">Session Statistic</h3>
            <button className="text-slate-400 hover:bg-slate-50 p-1 rounded"><MoreHorizontal size={18} /></button>
          </div>

          <div className="flex items-center justify-between">
            {/* Pie Chart */}
            <div className="relative w-28 h-28 rounded-full" style={{ background: 'conic-gradient(#0D2535 0% 64%, #FF8A65 64% 76%, #FBBF24 76% 100%)' }}>
              <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full"></div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-[#0D2535] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#0D2535]"></span> Completed
                </div>
                <div className="text-xs text-slate-400 ml-4">{completedCount} sessions</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-[#0D2535] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span> Queued
                </div>
                <div className="text-xs text-slate-400 ml-4">{queuedCount} sessions</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-[#0D2535] font-medium">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF8A65' }}></span> Failed
                </div>
                <div className="text-xs text-slate-400 ml-4">{projects.length - completedCount - queuedCount - activeCount} sessions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Discovery Effectives */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans font-semibold text-[#0D2535] text-lg">Discovery Effectives</h3>
            <button className="text-slate-400 hover:bg-slate-50 p-1 rounded"><MoreHorizontal size={18} /></button>
          </div>

          <div className="flex items-center gap-6 mb-8 text-sm text-slate-500">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#14B8A6]"></span> High Confidence</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span> Medium Confidence</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#64748B]"></span> Low Confidence</div>
          </div>

          <div className="flex items-center justify-around px-8">
            {/* Circular 1 */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#14B8A6" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="75" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-sans font-semibold text-[#0D2535] text-xl">70%</div>
            </div>

            {/* Circular 2 */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#FBBF24" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="190" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-sans font-semibold text-[#0D2535] text-xl">24%</div>
            </div>

            {/* Circular 3 */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#64748B" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="220" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-sans font-semibold text-[#0D2535] text-xl">12%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Project Mini Cards */}
        <div className="col-span-1 flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: i === 1 ? '#4285F4' : i === 2 ? '#3B5998' : '#FF0000' }}>
                    {i === 1 ? 'G' : i === 2 ? 'f' : '▶'}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Project Name</div>
                    <div className="text-sm font-semibold text-[#0D2535]">Alpha #{30 - i}</div>
                  </div>
                </div>
                <div className="text-2xl font-sans font-bold text-[#0D2535]">
                  {245 - i * 50}k
                </div>
                <div className="text-xs text-slate-400 mt-1">Hypotheses</div>
              </div>

              {/* Sparkline placeholder */}
              <div className="w-20 h-10">
                <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                  <path d="M0,40 Q10,20 20,35 T40,15 T60,30 T80,10 T100,25" fill="none" stroke={i === 1 ? "#FBBF24" : i === 2 ? "#14B8A6" : "#64748B"} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Phase Analytics */}
        <div className="col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans font-semibold text-[#0D2535] text-lg">Phase Analytics</h3>
            <div className="flex gap-3">
              <select className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-sm text-[#0D2535] outline-none cursor-pointer">
                <option>All phases</option>
              </select>
              <select className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-sm text-[#0D2535] outline-none cursor-pointer">
                <option>Monthly</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8 text-sm">
            <button className="flex items-center gap-1 text-[#14B8A6] bg-[#F0FDFA] px-3 py-1.5 rounded-lg border border-[#CCFBF1] hover:bg-[#CCFBF1] transition-colors">
              <Plus size={14} /> Add
            </button>
            <div className="flex items-center gap-2 text-slate-500"><span className="w-2 h-2 rounded-full bg-[#0D2535]"></span> Problem</div>
            <div className="flex items-center gap-2 text-slate-500"><span className="w-2 h-2 rounded-full bg-[#14B8A6]"></span> Solution</div>
            <div className="flex items-center gap-2 text-slate-500"><span className="w-2 h-2 rounded-full bg-[#E2E8F0]"></span> Market</div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-4 px-2 mt-4">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
              <div key={month} className="flex flex-col items-center gap-3 flex-1 h-48 justify-end">
                <div className="w-full max-w-[20px] h-full flex flex-col justify-end gap-1">
                  <div className="w-full bg-[#E2E8F0] rounded-sm" style={{ height: `${20 + (idx % 3) * 10}%` }}></div>
                  <div className="w-full bg-[#14B8A6] rounded-sm" style={{ height: `${30 + (idx % 4) * 15}%` }}></div>
                  <div className="w-full bg-[#0D2535] rounded-sm" style={{ height: `${10 + (idx % 2) * 20}%` }}></div>
                </div>
                <span className="text-xs text-slate-400">{month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-sans font-semibold text-[#0D2535] text-lg">Projects Schedule</h3>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-sm text-[#0D2535] border border-[#E2E8F0] px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <Filter size={14} /> Filter
            </button>
            <button className="flex items-center gap-2 text-sm text-[#0D2535] border border-[#E2E8F0] px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <Download size={14} /> Export
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
                    No ↕
                  </div>
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide">Name</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide">Mode ↕</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide">Status ↕</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide">Date & time ↕</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-400 font-sans tracking-wide text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    No projects found. <Link to="/discovery/new" className="text-[#14B8A6] hover:underline">Create one</Link>
                  </td>
                </tr>
              ) : projects.map((p, idx) => (
                <tr key={p.session_id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 cursor-pointer accent-[#14B8A6]" />
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Link to={`/discovery/${p.session_id}`} className="font-sans font-medium text-[#0D2535] hover:text-[#14B8A6] transition-colors">
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
                    {new Date(p.created_at).toLocaleDateString('pl-PL')}
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

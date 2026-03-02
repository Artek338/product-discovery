import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Plus, MessageSquare, Search, Bell,
  Settings, HelpCircle, LogOut,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import NewDiscovery from './pages/NewDiscovery'
import Report from './pages/Report'
import Simulator from './pages/Simulator'

const NAV_MAIN = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/discovery/new', icon: Plus, label: 'New Campaign', end: false },
  { to: '/simulate', icon: MessageSquare, label: 'Simulator', end: false },
]

const NAV_BOTTOM = [
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help Center' },
  { icon: LogOut, label: 'Logout' },
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'Projekty',
  '/discovery/new': 'Nowy projekt',
  '/simulate': 'Symulator wywiadów',
}

function Sidebar() {
  return (
    <aside
      className="w-64 min-h-screen flex flex-col shrink-0"
      style={{ backgroundColor: '#0D2535' }}
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-[#0D2535]" style={{ backgroundColor: '#14B8A6' }}>
            C
          </div>
          <span className="font-sans font-bold text-white text-xl tracking-wide">
            Catalog
          </span>
        </div>
      </div>

      {/* Nav główna */}
      <nav className="flex-1 px-4 space-y-1">
        {NAV_MAIN.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-sans transition-all duration-200 ${isActive
                ? 'text-white font-medium bg-[#14B8A6]/20'
                : 'font-normal hover:text-white hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive ? { borderLeft: '4px solid #14B8A6' } : { color: '#7A9BB0', borderLeft: '4px solid transparent' }}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Nav dolna */}
      <div className="px-4 pb-6 space-y-1">
        {NAV_BOTTOM.map(item => (
          <button
            key={item.label}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-sans transition-all duration-200 hover:text-white hover:bg-white/5"
            style={{ color: '#7A9BB0', borderLeft: '4px solid transparent' }}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

function TopHeader() {
  return (
    <header className="h-20 flex items-center justify-end px-8 bg-[#F8FAFC]">
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white shadow-sm border border-[#E2E8F0] min-w-[280px]">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="flex-1 text-sm bg-transparent outline-none text-[#0D2535] placeholder:text-slate-400"
          />
        </div>

        {/* Bell */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <Bell size={20} className="text-[#0D2535]" />
        </button>

        {/* Avatar */}
        <div className="flex gap-3 items-center">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="User"
            className="w-10 h-10 rounded-full bg-slate-200 object-cover"
          />
        </div>
      </div>
    </header>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC]">
        <TopHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/discovery/new" element={<NewDiscovery />} />
          <Route path="/discovery/:id" element={<Report />} />
          <Route path="/simulate" element={<Simulator />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

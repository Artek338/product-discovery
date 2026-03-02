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
  { to: '/', icon: LayoutDashboard, label: 'Projekty', end: true },
  { to: '/discovery/new', icon: Plus, label: 'Nowy projekt', end: false },
  { to: '/simulate', icon: MessageSquare, label: 'Symulator', end: false },
]

const NAV_BOTTOM = [
  { icon: Settings, label: 'Ustawienia' },
  { icon: HelpCircle, label: 'Pomoc' },
  { icon: LogOut, label: 'Wyloguj' },
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'Projekty',
  '/discovery/new': 'Nowy projekt',
  '/simulate': 'Symulator wywiadów',
}

function Sidebar() {
  return (
    <aside
      className="w-40 min-h-screen flex flex-col shrink-0"
      style={{ backgroundColor: '#0D2535' }}
    >
      {/* Logo */}
      <div className="px-3 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ backgroundColor: '#14B8A6' }} />
          <span className="font-mono font-bold text-white text-sm leading-tight">
            Product<br />
            <span style={{ color: '#14B8A6' }}>Discovery</span>
          </span>
        </div>
      </div>

      {/* Nav główna */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_MAIN.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm font-sans transition-colors ${
                isActive
                  ? 'text-white font-medium'
                  : 'font-normal hover:text-white'
              }`
            }
            style={({ isActive }) => isActive ? { backgroundColor: '#14B8A6' } : { color: '#7A9BB0' }}
          >
            <item.icon size={15} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Nav dolna */}
      <div className="px-3 pb-5 space-y-0.5">
        {NAV_BOTTOM.map(item => (
          <button
            key={item.label}
            className="w-full flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm font-sans transition-colors hover:text-white"
            style={{ color: '#7A9BB0' }}
          >
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

function TopHeader() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'Product Discovery'

  return (
    <header className="h-14 flex items-center justify-between px-5 bg-white border-b border-[#E2E8F0]">
      <h1 className="font-mono font-bold text-base text-[#0D2535]">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DDE3EE] bg-white text-sm font-sans text-slate-400 w-44">
          <Search size={13} className="shrink-0 text-slate-400" />
          Szukaj...
        </div>

        {/* Bell */}
        <Bell size={20} className="text-slate-500 cursor-pointer hover:text-[#0D2535] transition-colors" />

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-mono font-bold"
          style={{ backgroundColor: '#14B8A6' }}
        >
          PD
        </div>
      </div>
    </header>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: '#EFF2F7' }}>
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

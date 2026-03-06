import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Plus, MessageSquare, Search, Bell, Moon, Sun,
  Settings, LogOut, BookOpen, Users, Bot,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import NewDiscovery from './pages/NewDiscovery'
import Report from './pages/Report'
import Simulator from './pages/Simulator'
import SettingsPage from './pages/Settings'
import Kompendium from './pages/Kompendium'
import SyntheticInterviews from './pages/SyntheticInterviews'
import Agents from './pages/Agents'
import { useAppStore } from './store/appStore'
import { t } from './lib/i18n'

function Sidebar() {
  const { language } = useAppStore()
  const [showLogoutPopup, setShowLogoutPopup] = useState(false)

  const NAV_MAIN = [
    { to: '/', icon: LayoutDashboard, label: t(language, 'nav_dashboard'), end: true },
    { to: '/discovery/new', icon: Plus, label: t(language, 'nav_new'), end: false },
    { to: '/simulate', icon: MessageSquare, label: t(language, 'nav_simulator'), end: false },
  ]

  const NAV_KNOWLEDGE = [
    { to: '/kompendium', icon: BookOpen, label: 'Kompendium', end: false },
    { to: '/synthetic-interviews', icon: Users, label: 'Syntetyczne wywiady', end: false },
    { to: '/agents', icon: Bot, label: 'Agenty', end: false },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex w-64 h-screen flex-col shrink-0 sticky top-0 bg-[#0D2535] transition-colors"
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-6 mb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-[#0D2535] text-sm"
              style={{ backgroundColor: '#14B8A6' }}
            >
              PD
            </div>
            <span className="font-mono font-bold text-white text-base tracking-wide leading-tight">
              Product<br />
              <span style={{ color: '#14B8A6' }}>Discovery</span>
            </span>
          </div>
        </div>

        {/* Desktop Nav główna */}
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
              style={({ isActive }) =>
                isActive
                  ? { borderLeft: '3px solid #14B8A6', color: 'white' }
                  : { color: '#8BB5CC', borderLeft: '3px solid transparent' }
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {/* Knowledge section */}
          <div className="pt-4 pb-1">
            <p className="px-4 text-[10px] font-semibold uppercase tracking-widest text-[#4A7090] mb-1">Zasoby</p>
          </div>
          {NAV_KNOWLEDGE.map(item => (
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
              style={({ isActive }) =>
                isActive
                  ? { borderLeft: '3px solid #14B8A6', color: 'white' }
                  : { color: '#8BB5CC', borderLeft: '3px solid transparent' }
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Nav dolna */}
        <div className="px-4 pb-6 space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-sans transition-all duration-200 ${isActive
                ? 'text-white font-medium bg-[#14B8A6]/20'
                : 'font-normal hover:text-white hover:bg-white/5'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { borderLeft: '3px solid #14B8A6', color: 'white' }
                : { color: '#8BB5CC', borderLeft: '3px solid transparent' }
            }
          >
            <Settings size={18} />
            {t(language, 'nav_settings')}
          </NavLink>

          <button
            onClick={() => setShowLogoutPopup(true)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-sans transition-all duration-200 hover:text-white hover:bg-white/5 relative"
            style={{ color: '#8BB5CC', borderLeft: '3px solid transparent' }}
          >
            <LogOut size={18} />
            {t(language, 'nav_logout')}
          </button>
        </div>

        {/* Logout confirmation popup */}
        {showLogoutPopup && (
          <div className="absolute bottom-20 left-4 z-50 w-72 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-xl overflow-hidden border border-[#E2E8F0] dark:border-[#333333]">
            <div className="p-5">
              <h4 className="font-bold text-[#0D2535] dark:text-slate-100 mb-1 font-sans text-base">
                {language === 'pl' ? 'Wylogować się?' : 'Sign out?'}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-sans">
                {language === 'pl'
                  ? 'Sesja Google zostanie zakończona. Lokalne dane pozostaną.'
                  : 'Your Google session will be cleared. Local data stays.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch (_) { /* ignore */ }
                    setShowLogoutPopup(false)
                    window.location.href = '/'
                  }}
                  className="flex-1 bg-[#EF4444] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#DC2626] transition-colors"
                >
                  {language === 'pl' ? 'Wyloguj' : 'Sign out'}
                </button>
                <button
                  onClick={() => setShowLogoutPopup(false)}
                  className="flex-1 border border-[#E2E8F0] dark:border-[#333333] text-[#0D2535] dark:text-slate-300 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors"
                >
                  {language === 'pl' ? 'Anuluj' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3 bg-[#0D2535] border-t border-[#1E3A5F] transition-colors">
        {NAV_MAIN.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-sans transition-all duration-200 ${isActive
                ? 'text-[#14B8A6] font-medium'
                : 'text-[#8BB5CC] font-normal'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-sans transition-all duration-200 ${isActive
              ? 'text-[#14B8A6] font-medium'
              : 'text-[#8BB5CC] font-normal'
            }`
          }
        >
          <Settings size={20} />
          {t(language, 'nav_settings')}
        </NavLink>
      </nav>
    </>
  )
}

function TopHeader() {
  const { language, globalSearchQuery, setGlobalSearchQuery, theme, toggleTheme } = useAppStore()

  return (
    <header className="h-20 flex items-center justify-end px-4 md:px-8 bg-[#F8FAFC] dark:bg-[#111111] border-b border-transparent dark:border-[#333333]/50 transition-colors">
      <div className="flex items-center gap-4 md:gap-6">
        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white dark:bg-[#1A1A1A] shadow-sm border border-[#E2E8F0] dark:border-[#333333] min-w-[150px] md:min-w-[180px] transition-colors">
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder={t(language, 'search_ph')}
            className="flex-1 text-sm bg-transparent outline-none text-[#0D2535] dark:text-slate-200 placeholder:text-slate-400 text-left transition-colors"
          />
          <Search size={16} className="text-slate-400" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-[#222222] transition-colors auto-bg-glass shrink-0"
          title={theme === 'dark' ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-[#0D2535] dark:text-slate-300" />
          ) : (
            <Moon size={20} className="text-[#0D2535] dark:text-slate-300" />
          )}
        </button>

        {/* Bell */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-[#222222] transition-colors auto-bg-glass shrink-0">
          <Bell size={20} className="text-[#0D2535] dark:text-slate-300" />
        </button>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-mono font-bold shrink-0 shadow-sm"
          style={{ backgroundColor: '#14B8A6' }}
        >
          PD
        </div>
      </div>
    </header>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  const theme = useAppStore(s => s.theme)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#141414] pb-16 md:pb-0 w-full overflow-x-hidden transition-colors">
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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/discovery/new" element={<NewDiscovery />} />
          <Route path="/discovery/:id" element={<Report />} />
          <Route path="/simulate" element={<Simulator />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/kompendium" element={<Kompendium />} />
          <Route path="/synthetic-interviews" element={<SyntheticInterviews />} />
          <Route path="/agents" element={<Agents />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

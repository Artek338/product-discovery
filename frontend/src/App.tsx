import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import NewDiscovery from './pages/NewDiscovery'
import Report from './pages/Report'
import Simulator from './pages/Simulator'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">
          <NavLink to="/" className="font-bold text-gray-900 mr-4 flex items-center gap-2">
            <span>🔍</span>
            <span>Product Discovery</span>
          </NavLink>
          <NavItem to="/">Projekty</NavItem>
          <NavItem to="/discovery/new">+ Nowy</NavItem>
          <NavItem to="/simulate">Symulator</NavItem>
        </div>
      </nav>
      <main>{children}</main>
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

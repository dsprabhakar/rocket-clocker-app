import { ReactNode } from 'react'
import { useAuthStore, getRoleColor, getRoleLabel, getRoleBadge } from '@/stores/auth-store'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  label: string
  path: string
  icon: ReactNode
}

interface AppShellProps {
  children: ReactNode
  navItems: NavItem[]
  roleColor?: string
}

export function AppShell({ children, navItems, roleColor }: AppShellProps) {
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  if (!user) return null

  const color = roleColor || getRoleColor(user.role)
  const badge = getRoleBadge(user.role)
  const roleLabel = getRoleLabel(user.role)

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: color }}
            >
              {badge}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 leading-tight">Rocket Clocker</div>
              <div className="text-xs text-slate-500">{roleLabel}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-slate-600">{user.full_name}</span>
            {user.photo_url ? (
              <img src={user.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                {user.full_name.charAt(0)}
              </div>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <nav className="hidden lg:flex flex-col w-56 border-r border-slate-200 bg-white p-3 gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                style={active ? { background: color } : {}}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
          <div className="flex-1" />
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </nav>

        {/* Mobile nav overlay */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMenuOpen(false)}>
            <nav
              className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 p-3 flex flex-col gap-1 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item) => {
                const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    style={active ? { background: color } : {}}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Log out
              </button>
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-bottom z-40">
        <div className="flex justify-around px-2 py-1">
          {navItems.slice(0, 5).map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                  active ? 'font-semibold' : 'text-slate-400'
                }`}
                style={active ? { color } : {}}
              >
                {item.icon}
                <span className="truncate max-w-[60px]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

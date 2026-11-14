import { Outlet } from 'react-router-dom'
import { AppShell } from '@/components/ui/AppShell'
import { Home, MapPin, Users, CalendarDays, Volume2, Shield, FileText, HelpCircle } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', path: '/gm', icon: <Home size={18} /> },
  { label: 'Sites', path: '/gm/sites', icon: <MapPin size={18} /> },
  { label: 'Roster', path: '/gm/roster', icon: <Users size={18} /> },
  { label: 'Planner', path: '/gm/planner', icon: <CalendarDays size={18} /> },
  { label: 'Broadcasts', path: '/gm/broadcasts', icon: <Volume2 size={18} /> },
  { label: 'Discipline', path: '/gm/discipline', icon: <Shield size={18} /> },
  { label: 'Audit Log', path: '/gm/audit', icon: <FileText size={18} /> },
  { label: 'FAQ', path: '/gm/faq', icon: <HelpCircle size={18} /> },
]

export function GMLayout() {
  return (
    <AppShell navItems={navItems} roleColor="#2563eb">
      <Outlet />
    </AppShell>
  )
}

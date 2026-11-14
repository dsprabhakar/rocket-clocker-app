import { Outlet } from 'react-router-dom'
import { AppShell } from '@/components/ui/AppShell'
import { Home, MapPin, Users, CalendarDays, ListTodo, Volume2, Shield, FileText, HelpCircle } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', path: '/hq', icon: <Home size={18} /> },
  { label: 'Sites', path: '/hq/sites', icon: <MapPin size={18} /> },
  { label: 'Roster', path: '/hq/roster', icon: <Users size={18} /> },
  { label: 'Planner', path: '/hq/planner', icon: <CalendarDays size={18} /> },
  { label: 'Broadcasts', path: '/hq/broadcasts', icon: <Volume2 size={18} /> },
  { label: 'Discipline', path: '/hq/discipline', icon: <Shield size={18} /> },
  { label: 'Audit Log', path: '/hq/audit', icon: <FileText size={18} /> },
  { label: 'FAQ', path: '/hq/faq', icon: <HelpCircle size={18} /> },
]

export function HQLayout() {
  return (
    <AppShell navItems={navItems} roleColor="#1d5fa0">
      <Outlet />
    </AppShell>
  )
}

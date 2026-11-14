import { Outlet } from 'react-router-dom'
import { AppShell } from '@/components/ui/AppShell'
import { Home, MapPin, Users, ClipboardCheck, AlertTriangle } from 'lucide-react'

const navItems = [
  { label: 'Home', path: '/supervisor', icon: <Home size={18} /> },
  { label: 'Sites', path: '/supervisor/sites', icon: <MapPin size={18} /> },
  { label: 'Roster', path: '/supervisor/roster', icon: <Users size={18} /> },
  { label: 'Tasks', path: '/supervisor/tasks', icon: <ClipboardCheck size={18} /> },
  { label: 'Reports', path: '/supervisor/reports', icon: <AlertTriangle size={18} /> },
]

export function SupervisorLayout() {
  return (
    <AppShell navItems={navItems} roleColor="#0e6b54">
      <div className="pb-20 lg:pb-0">
        <Outlet />
      </div>
    </AppShell>
  )
}

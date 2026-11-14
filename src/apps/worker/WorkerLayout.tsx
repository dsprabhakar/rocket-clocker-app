import { Outlet } from 'react-router-dom'
import { AppShell } from '@/components/ui/AppShell'
import { Home, Clock, ListTodo, History, User } from 'lucide-react'

const navItems = [
  { label: 'Home', path: '/worker', icon: <Home size={18} /> },
  { label: 'Punch', path: '/worker/punch', icon: <Clock size={18} /> },
  { label: 'Tasks', path: '/worker/tasks', icon: <ListTodo size={18} /> },
  { label: 'History', path: '/worker/history', icon: <History size={18} /> },
  { label: 'Profile', path: '/worker/profile', icon: <User size={18} /> },
]

export function WorkerLayout() {
  return (
    <AppShell navItems={navItems} roleColor="#c27b0a">
      <div className="pb-20 lg:pb-0">
        <Outlet />
      </div>
    </AppShell>
  )
}

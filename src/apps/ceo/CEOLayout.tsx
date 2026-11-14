import { Outlet } from 'react-router-dom'
import { AppShell } from '@/components/ui/AppShell'
import { LayoutDashboard, Activity, FileText, Volume2, TrendingUp } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', path: '/ceo', icon: <LayoutDashboard size={18} /> },
  { label: 'Site Health', path: '/ceo/health', icon: <Activity size={18} /> },
  { label: 'Broadcasts', path: '/ceo/broadcasts', icon: <Volume2 size={18} /> },
  { label: 'Insights', path: '/ceo/insights', icon: <TrendingUp size={18} /> },
  { label: 'Audit Log', path: '/ceo/audit', icon: <FileText size={18} /> },
]

export function CEOLayout() {
  return (
    <AppShell navItems={navItems} roleColor="#5340a8">
      <Outlet />
    </AppShell>
  )
}

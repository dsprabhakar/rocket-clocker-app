import { Outlet } from 'react-router-dom'
import { AppShell } from '@/components/ui/AppShell'
import { Home, Users, FileText, Shield, Eye, Camera, AlertTriangle } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', path: '/superuser', icon: <Home size={18} /> },
  { label: 'Users', path: '/superuser/users', icon: <Users size={18} /> },
  { label: 'Act As', path: '/superuser/act-as', icon: <Eye size={18} /> },
  { label: 'Photos', path: '/superuser/photos', icon: <Camera size={18} /> },
  { label: 'Anomalies', path: '/superuser/anomalies', icon: <AlertTriangle size={18} /> },
  { label: 'Audit Log', path: '/superuser/audit', icon: <FileText size={18} /> },
  { label: 'Kill Switch', path: '/superuser/killswitch', icon: <Shield size={18} /> },
]

export function SuperuserLayout() {
  return (
    <AppShell navItems={navItems} roleColor="#7c3aed">
      <Outlet />
    </AppShell>
  )
}

import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { LoginPage } from '@/components/auth/LoginPage'
import { AuthCallback } from '@/components/auth/AuthCallback'

import { WorkerLayout } from '@/apps/worker/WorkerLayout'
import { WorkerDashboard } from '@/apps/worker/WorkerDashboard'
import { WorkerPunch } from '@/apps/worker/WorkerPunch'
import { WorkerTasks } from '@/apps/worker/WorkerTasks'
import { WorkerHistory } from '@/apps/worker/WorkerHistory'
import { WorkerProfile } from '@/apps/worker/WorkerProfile'

import { SupervisorLayout } from '@/apps/supervisor/SupervisorLayout'
import { SupervisorDashboard } from '@/apps/supervisor/SupervisorDashboard'
import { SupervisorSites } from '@/apps/supervisor/SupervisorSites'
import { SupervisorRoster } from '@/apps/supervisor/SupervisorRoster'
import { SupervisorTasks } from '@/apps/supervisor/SupervisorTasks'

import { HQLayout } from '@/apps/hq/HQLayout'
import { HQDashboard } from '@/apps/hq/HQDashboard'
import { HQSites } from '@/apps/hq/HQSites'
import { HQRoster } from '@/apps/hq/HQRoster'
import { HQPlanner } from '@/apps/hq/HQPlanner'
import { HQBroadcasts } from '@/apps/hq/HQBroadcasts'
import { HQDiscipline } from '@/apps/hq/HQDiscipline'
import { HQAuditLog } from '@/apps/hq/HQAuditLog'
import { HQFAQ } from '@/apps/hq/HQFAQ'

import { CEOLayout } from '@/apps/ceo/CEOLayout'
import { CEODashboard } from '@/apps/ceo/CEODashboard'
import { CEOSiteHealth } from '@/apps/ceo/CEOSiteHealth'
import { CEOBroadcasts } from '@/apps/ceo/CEOBroadcasts'
import { CEOInsights } from '@/apps/ceo/CEOInsights'
import { CEOAuditLog } from '@/apps/ceo/CEOAuditLog'

import { GMLayout } from '@/apps/gm/GMLayout'
import { GMDashboard, GMSites, GMRoster, GMPlanner, GMBroadcasts, GMDiscipline, GMAuditLog, GMFAQ } from '@/apps/gm'

import { SuperuserLayout } from '@/apps/superuser/SuperuserLayout'
import { SuperuserDashboard } from '@/apps/superuser/SuperuserDashboard'
import { SuperuserUsers } from '@/apps/superuser/SuperuserUsers'
import { SuperuserActAs } from '@/apps/superuser/SuperuserActAs'
import { SuperuserPhotos } from '@/apps/superuser/SuperuserPhotos'
import { SuperuserAnomalies } from '@/apps/superuser/SuperuserAnomalies'
import { SuperuserKillSwitch } from '@/apps/superuser/SuperuserKillSwitch'
import { SuperuserAuditLog } from '@/apps/superuser/SuperuserAuditLog'

const ROLE_ROUTES: Record<string, string> = {
  employee: '/worker',
  supervisor: '/supervisor',
  hq: '/hq',
  gm: '/gm',
  ceo: '/ceo',
  superuser: '/superuser',
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, session } = useAuthStore()
  if (!session) return <Navigate to="/login" replace />
  if (user && !allowedRoles.includes(user.role)) return <Navigate to={ROLE_ROUTES[user.role] || '/login'} replace />
  return <>{children}</>
}

export default function App() {
  const { user, session, fetchProfile } = useAuthStore()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        useAuthStore.setState({ session: true })
        await fetchProfile()
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, session: false })
      }
    })
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/worker" element={<ProtectedRoute allowedRoles={['employee', 'superuser']}><WorkerLayout /></ProtectedRoute>}>
          <Route index element={<WorkerDashboard />} />
          <Route path="punch" element={<WorkerPunch />} />
          <Route path="tasks" element={<WorkerTasks />} />
          <Route path="history" element={<WorkerHistory />} />
          <Route path="profile" element={<WorkerProfile />} />
        </Route>

        <Route path="/supervisor" element={<ProtectedRoute allowedRoles={['supervisor', 'superuser']}><SupervisorLayout /></ProtectedRoute>}>
          <Route index element={<SupervisorDashboard />} />
          <Route path="sites" element={<SupervisorSites />} />
          <Route path="roster" element={<SupervisorRoster />} />
          <Route path="tasks" element={<SupervisorTasks />} />
        </Route>

        <Route path="/hq" element={<ProtectedRoute allowedRoles={['hq', 'superuser']}><HQLayout /></ProtectedRoute>}>
          <Route index element={<HQDashboard />} />
          <Route path="sites" element={<HQSites />} />
          <Route path="roster" element={<HQRoster />} />
          <Route path="planner" element={<HQPlanner />} />
          <Route path="broadcasts" element={<HQBroadcasts />} />
          <Route path="discipline" element={<HQDiscipline />} />
          <Route path="audit" element={<HQAuditLog />} />
          <Route path="faq" element={<HQFAQ />} />
        </Route>

        <Route path="/gm" element={<ProtectedRoute allowedRoles={['gm', 'superuser']}><GMLayout /></ProtectedRoute>}>
          <Route index element={<GMDashboard />} />
          <Route path="sites" element={<GMSites />} />
          <Route path="roster" element={<GMRoster />} />
          <Route path="planner" element={<GMPlanner />} />
          <Route path="broadcasts" element={<GMBroadcasts />} />
          <Route path="discipline" element={<GMDiscipline />} />
          <Route path="audit" element={<GMAuditLog />} />
          <Route path="faq" element={<GMFAQ />} />
        </Route>

        <Route path="/ceo" element={<ProtectedRoute allowedRoles={['ceo', 'superuser']}><CEOLayout /></ProtectedRoute>}>
          <Route index element={<CEODashboard />} />
          <Route path="health" element={<CEOSiteHealth />} />
          <Route path="broadcasts" element={<CEOBroadcasts />} />
          <Route path="insights" element={<CEOInsights />} />
          <Route path="audit" element={<CEOAuditLog />} />
        </Route>

        <Route path="/superuser" element={<ProtectedRoute allowedRoles={['superuser']}><SuperuserLayout /></ProtectedRoute>}>
          <Route index element={<SuperuserDashboard />} />
          <Route path="users" element={<SuperuserUsers />} />
          <Route path="act-as" element={<SuperuserActAs />} />
          <Route path="photos" element={<SuperuserPhotos />} />
          <Route path="anomalies" element={<SuperuserAnomalies />} />
          <Route path="audit" element={<SuperuserAuditLog />} />
          <Route path="killswitch" element={<SuperuserKillSwitch />} />
        </Route>

        <Route path="*" element={
          session && user ? <Navigate to={ROLE_ROUTES[user.role] || '/login'} replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { Card, StatCard } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { MapPin, Users, CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import type { Site, Profile } from '@/types/database'

export function HQDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ sites: 0, workers: 0, checkedIn: 0, sitesDown: 0 })
  const [recentSites, setRecentSites] = useState<Site[]>([])
  const [pendingReports, setPendingReports] = useState(0)

  useEffect(() => {
    if (!user) return
    async function load() {
      const [sitesRes, workersRes, punchesRes, reportsRes] = await Promise.all([
        supabase.from('sites').select('*').in('status', ['requested', 'ready', 'active', 'extended']).order('updated_at', { ascending: false }).limit(10),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'employee').eq('is_active', true),
        supabase.from('punches').select('employee_id', { count: 'exact' }).eq('punch_type', 'in').gte('punched_at', format(new Date(), 'yyyy-MM-dd') + 'T00:00:00'),
        supabase.from('worker_reports').select('id', { count: 'exact' }).eq('status', 'pending'),
      ])

      const sites = sitesRes.data || []
      setRecentSites(sites.slice(0, 5) as Site[])
      setStats({
        sites: sites.length,
        workers: workersRes.count || 0,
        checkedIn: punchesRes.count || 0,
        sitesDown: sites.filter((s: any) => s.site_down_active).length,
      })
      setPendingReports(reportsRes.count || 0)
    }
    load()
  }, [user])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">HQ Dashboard</h1>
        <p className="text-sm text-slate-500">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Active Sites" value={stats.sites} icon={<MapPin size={20} />} color="#1d5fa0" onClick={() => navigate('/hq/sites')} />
        <StatCard label="Workers" value={stats.workers} icon={<Users size={20} />} color="#3b82f6" onClick={() => navigate('/hq/roster')} />
        <StatCard label="Checked In" value={stats.checkedIn} icon={<CheckCircle size={20} />} color="#10b981" />
        <StatCard label="Sites Down" value={stats.sitesDown} icon={<AlertTriangle size={20} />} color="#ef4444" />
      </div>

      {pendingReports > 0 && (
        <Card>
          <div className="flex items-center gap-3 text-amber-700 cursor-pointer" onClick={() => navigate('/hq/discipline')}>
            <AlertTriangle size={20} />
            <div>
              <div className="font-medium">{pendingReports} pending worker report{pendingReports > 1 ? 's' : ''}</div>
              <div className="text-xs text-amber-600">Tap to review</div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Recent Sites</h2>
        {recentSites.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentSites.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer" onClick={() => navigate('/hq/sites')}>
                <div>
                  <div className="text-sm font-medium text-slate-900">{site.name}</div>
                  <div className="text-xs text-slate-500">{site.street}, {site.state}</div>
                </div>
                <StatusBadge status={site.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No active sites</p>
        )}
      </Card>
    </div>
  )
}

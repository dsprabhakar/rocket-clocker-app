import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { Card, StatCard } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { MapPin, Users, CheckCircle, AlertTriangle, Clock, Phone } from 'lucide-react'
import { format } from 'date-fns'
import type { Site, Assignment, Punch } from '@/types/database'

export function SupervisorDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [sites, setSites] = useState<Site[]>([])
  const [todayStats, setTodayStats] = useState({ assigned: 0, checkedIn: 0, noShows: 0, tasksComplete: 0 })
  const [notCheckedIn, setNotCheckedIn] = useState<{ name: string; phone: string }[]>([])

  useEffect(() => {
    if (!user) return
    const today = format(new Date(), 'yyyy-MM-dd')

    async function load() {
      // My sites
      const { data: mySites } = await supabase
        .from('sites')
        .select('*')
        .eq('supervisor_id', user!.id)
        .in('status', ['requested', 'ready', 'active', 'extended'])
        .order('updated_at', { ascending: false })
      if (mySites) setSites(mySites as Site[])

      // Today's stats across my sites
      const siteIds = (mySites || []).map((s) => s.id)
      if (!siteIds.length) return

      const { data: assignments } = await supabase
        .from('assignments')
        .select('*, employee:profiles(full_name, phone)')
        .in('site_id', siteIds)
        .eq('assigned_date', today)
        .neq('status', 'cancelled')

      const { data: punchIns } = await supabase
        .from('punches')
        .select('employee_id')
        .in('site_id', siteIds)
        .eq('punch_type', 'in')
        .gte('punched_at', today + 'T00:00:00')

      const checkedInIds = new Set((punchIns || []).map((p) => p.employee_id))
      const assigned = assignments || []
      const noShowWorkers = assigned.filter((a) => !checkedInIds.has(a.employee_id))

      setTodayStats({
        assigned: assigned.length,
        checkedIn: checkedInIds.size,
        noShows: noShowWorkers.length,
        tasksComplete: 0,
      })

      setNotCheckedIn(
        noShowWorkers.map((a) => ({
          name: (a as any).employee?.full_name || 'Unknown',
          phone: (a as any).employee?.phone || '',
        }))
      )
    }
    load()
  }, [user])

  if (!user) return null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Supervisor Dashboard</h1>
        <p className="text-sm text-slate-500">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Sites" value={sites.length} icon={<MapPin size={20} />} color="#0e6b54" onClick={() => navigate('/supervisor/sites')} />
        <StatCard label="Assigned" value={todayStats.assigned} icon={<Users size={20} />} color="#3b82f6" />
        <StatCard label="Checked In" value={todayStats.checkedIn} icon={<CheckCircle size={20} />} color="#10b981" />
        <StatCard label="No-Shows" value={todayStats.noShows} icon={<AlertTriangle size={20} />} color="#ef4444" />
      </div>

      {/* My sites */}
      <Card>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">My Sites</h2>
        {sites.length > 0 ? (
          <div className="flex flex-col gap-2">
            {sites.map((site) => (
              <div
                key={site.id}
                onClick={() => navigate(`/supervisor/sites/${site.id}`)}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{site.name}</div>
                  <div className="text-xs text-slate-500">{site.street}, {site.state}</div>
                </div>
                <StatusBadge status={site.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No sites assigned</p>
        )}
      </Card>

      {/* Not checked in */}
      {notCheckedIn.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} />
            Not Yet Checked In
          </h2>
          <div className="flex flex-col gap-2">
            {notCheckedIn.map((w, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                <span className="text-sm text-slate-700">{w.name}</span>
                {w.phone && (
                  <a href={`tel:${w.phone}`} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200">
                    <Phone size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

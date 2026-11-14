import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { History, MapPin, Clock, IndianRupee } from 'lucide-react'
import { format } from 'date-fns'
import type { Punch, Site } from '@/types/database'

interface SiteHistory {
  site: Site
  presentDays: number
  absentDays: number
  totalAssigned: number
  earned: number
}

export function WorkerHistory() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<'punches' | 'sites'>('punches')
  const [punches, setPunches] = useState<(Punch & { site?: Site })[]>([])
  const [siteHistory, setSiteHistory] = useState<SiteHistory[]>([])

  useEffect(() => {
    if (!user) return

    async function load() {
      // Recent punches
      const { data: punchData } = await supabase
        .from('punches')
        .select('*, site:sites(name, street, state)')
        .eq('employee_id', user!.id)
        .order('punched_at', { ascending: false })
        .limit(50)
      if (punchData) setPunches(punchData as any)

      // Site history (completed sites)
      const { data: completedSites } = await supabase
        .from('sites')
        .select('*')
        .eq('status', 'completed')

      if (completedSites) {
        const histories: SiteHistory[] = []
        for (const site of completedSites as Site[]) {
          const { count: assignedCount } = await supabase
            .from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('site_id', site.id)
            .eq('employee_id', user!.id)

          const { count: presentCount } = await supabase
            .from('punches')
            .select('*', { count: 'exact', head: true })
            .eq('site_id', site.id)
            .eq('employee_id', user!.id)
            .eq('punch_type', 'in')

          const total = assignedCount || 0
          const present = presentCount || 0

          if (total > 0) {
            histories.push({
              site,
              presentDays: present,
              absentDays: total - present,
              totalAssigned: total,
              earned: present * (user!.daily_wage || 0),
            })
          }
        }
        setSiteHistory(histories)
      }
    }
    load()
  }, [user])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">History</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setTab('punches')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${tab === 'punches' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
        >
          Recent Punches
        </button>
        <button
          onClick={() => setTab('sites')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${tab === 'sites' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
        >
          My Sites
        </button>
      </div>

      {tab === 'punches' ? (
        punches.length > 0 ? (
          <div className="flex flex-col gap-2">
            {punches.map((p) => (
              <Card key={p.id} className="flex items-center gap-3 !p-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.punch_type === 'in' ? 'bg-green-100' : p.punch_type === 'out' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <Clock size={16} className={p.punch_type === 'in' ? 'text-green-600' : p.punch_type === 'out' ? 'text-red-600' : 'text-blue-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 capitalize">
                    {p.punch_type === 'in' ? 'Check In' : p.punch_type === 'out' ? 'Check Out' : 'Liveness Ping'}
                  </div>
                  <div className="text-xs text-slate-500">{(p.site as any)?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">{format(new Date(p.punched_at), 'h:mm a')}</div>
                  <div className="text-xs text-slate-400">{format(new Date(p.punched_at), 'MMM d')}</div>
                </div>
                {p.in_geofence !== null && (
                  <Badge color={p.in_geofence ? '#10b981' : '#f59e0b'}>
                    <MapPin size={10} />
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <History size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No punch history yet</p>
            </div>
          </Card>
        )
      ) : (
        siteHistory.length > 0 ? (
          <div className="flex flex-col gap-3">
            {siteHistory.map((sh) => (
              <Card key={sh.site.id}>
                <h3 className="font-medium text-slate-900">{sh.site.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin size={12} />
                  {sh.site.street}, {sh.site.state}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-lg font-bold text-green-600">{sh.presentDays}</div>
                    <div className="text-xs text-slate-500">Present</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-500">{sh.absentDays}</div>
                    <div className="text-xs text-slate-500">Absent</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 flex items-center gap-0.5">
                      <IndianRupee size={14} />{sh.earned.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-slate-400">Estimated earnings</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <History size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No completed sites yet</p>
            </div>
          </Card>
        )
      )}
    </div>
  )
}

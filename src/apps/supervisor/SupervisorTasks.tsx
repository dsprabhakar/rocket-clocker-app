import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { getCurrentPosition, isInGeofence } from '@/lib/geo'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { CheckCircle, MapPin, ExternalLink, AlertTriangle } from 'lucide-react'
import type { Task, Site } from '@/types/database'

export function SupervisorTasks() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<(Task & { site?: Site })[]>([])
  const [inGeofence, setInGeofence] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .eq('supervisor_id', user!.id)
        .in('status', ['active', 'extended'])

      if (!sites?.length) return

      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .in('site_id', sites.map((s) => s.id))
        .neq('status', 'completed')
        .order('created_at')

      const siteMap = new Map(sites.map((s) => [s.id, s]))
      setTasks((allTasks || []).map((t) => ({ ...t, site: siteMap.get(t.site_id) } as any)))

      // Check geofence for each site
      const pos = await getCurrentPosition()
      if (pos) {
        const gf: Record<string, boolean> = {}
        for (const s of sites as Site[]) {
          if (s.latitude && s.longitude) {
            gf[s.id] = isInGeofence(pos.latitude, pos.longitude, s.latitude, s.longitude, s.geofence_radius_meters)
          }
        }
        setInGeofence(gf)
      }
    }
    load()
  }, [user])

  const handleComplete = useCallback(async (task: Task & { site?: Site }) => {
    if (!user) return
    if (task.site && !inGeofence[task.site_id]) {
      alert('You must be at the site to confirm task completion.')
      return
    }
    await supabase.from('tasks').update({ status: 'completed', completed_by: user.id, completed_at: new Date().toISOString() }).eq('id', task.id)
    await logAction(user.id, user.role, 'complete_task', `Completed task: ${task.title} at ${task.site?.name}`, {
      taskId: task.id, siteId: task.site_id,
    })
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
  }, [user, inGeofence])

  // Group by site
  const bySite = tasks.reduce<Record<string, (Task & { site?: Site })[]>>((acc, t) => {
    const key = t.site?.name || 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Tasks To Complete</h1>

      {Object.entries(bySite).map(([siteName, siteTasks]) => (
        <Card key={siteName}>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <MapPin size={14} />
            {siteName}
            {siteTasks[0].site && inGeofence[siteTasks[0].site_id] && (
              <span className="text-xs text-green-600 font-normal">At site</span>
            )}
          </h2>
          <div className="flex flex-col gap-2">
            {siteTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <div className="text-sm font-medium text-slate-900">{task.title}</div>
                  <StatusBadge status={task.status} />
                </div>
                <Button
                  size="sm"
                  color="#0e6b54"
                  icon={<CheckCircle size={14} />}
                  onClick={() => handleComplete(task)}
                  disabled={task.site ? !inGeofence[task.site_id] : false}
                >
                  Complete
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {tasks.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <CheckCircle size={32} className="text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">All tasks complete!</p>
          </div>
        </Card>
      )}
    </div>
  )
}

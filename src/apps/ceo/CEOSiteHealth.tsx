import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { MapPin, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import type { Site } from '@/types/database'

export function CEOSiteHealth() {
  const [sites, setSites] = useState<(Site & { workerCount?: number; completionPct?: number })[]>([])

  useEffect(() => {
    async function load() {
      const { data: allSites } = await supabase.from('sites').select('*').order('status')
      if (!allSites) return

      const enriched = allSites.map((s: any) => {
        const elapsed = differenceInDays(new Date(), new Date(s.created_at))
        const pct = s.estimated_duration_days > 0 ? Math.min(100, Math.round((elapsed / s.estimated_duration_days) * 100)) : 0
        return { ...s, completionPct: pct }
      })
      setSites(enriched as any[])
    }
    load()
  }, [])

  const active = sites.filter((s) => ['requested', 'ready', 'active', 'extended'].includes(s.status))
  const atRisk = active.filter((s) => (s.completionPct || 0) > 80 && s.status !== 'completed')
  const completed = sites.filter((s) => ['completed', 'abandoned'].includes(s.status))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Site Health</h1>

      {atRisk.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle size={16} /> At Risk ({atRisk.length})
          </h2>
          {atRisk.map((site) => (
            <Card key={site.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-slate-900">{site.name}</h3>
                  <p className="text-xs text-slate-500"><MapPin size={12} className="inline" /> {site.street}, {site.state}</p>
                </div>
                <Badge color="#ef4444">{site.completionPct}% elapsed</Badge>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-red-500" style={{ width: `${Math.min(100, site.completionPct || 0)}%` }} />
              </div>
            </Card>
          ))}
        </>
      )}

      <h2 className="text-sm font-semibold text-slate-700">Active Sites ({active.length})</h2>
      {active.map((site) => (
        <Card key={site.id}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-medium text-slate-900">{site.name}</h3>
              <p className="text-xs text-slate-500"><MapPin size={12} className="inline" /> {site.state}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={site.status} />
              {site.site_down_active && <Badge color="#ef4444">Down</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span><Clock size={12} className="inline" /> {site.estimated_duration_days}d est.</span>
            <span>{site.completionPct}% timeline elapsed</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full transition-all" style={{
              width: `${Math.min(100, site.completionPct || 0)}%`,
              backgroundColor: (site.completionPct || 0) > 80 ? '#ef4444' : (site.completionPct || 0) > 50 ? '#f59e0b' : '#10b981',
            }} />
          </div>
        </Card>
      ))}

      {completed.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-slate-500 mt-2">Completed ({completed.length})</h2>
          {completed.slice(0, 5).map((site) => (
            <Card key={site.id}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{site.name}</span>
                <StatusBadge status={site.status} />
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}

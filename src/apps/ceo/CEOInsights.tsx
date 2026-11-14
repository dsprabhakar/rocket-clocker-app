import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, TrendingDown, AlertTriangle, Target, Users, Clock, DollarSign } from 'lucide-react'
import { format, differenceInDays, subDays } from 'date-fns'
import type { Site } from '@/types/database'

interface Insight {
  title: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  description: string
  severity: 'info' | 'warning' | 'danger'
}

export function CEOInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [riskSites, setRiskSites] = useState<{ name: string; risk: string; score: number }[]>([])

  useEffect(() => {
    async function load() {
      const today = format(new Date(), 'yyyy-MM-dd')
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

      const [sitesRes, workersRes, punchesToday, punchesWeek, strikesRes] = await Promise.all([
        supabase.from('sites').select('*'),
        supabase.from('profiles').select('*').eq('role', 'employee').eq('is_active', true),
        supabase.from('punches').select('id', { count: 'exact' }).eq('punch_type', 'in').gte('punched_at', today + 'T00:00:00'),
        supabase.from('punches').select('id', { count: 'exact' }).eq('punch_type', 'in').gte('punched_at', weekAgo + 'T00:00:00'),
        supabase.from('strikes').select('id', { count: 'exact' }).gte('created_at', weekAgo + 'T00:00:00'),
      ])

      const sites = (sitesRes.data || []) as Site[]
      const workers = workersRes.data || []
      const activeSites = sites.filter((s) => ['active', 'extended', 'ready'].includes(s.status))

      // Completion forecast
      const overdueSites = activeSites.filter((s) => {
        const elapsed = differenceInDays(new Date(), new Date(s.created_at))
        return elapsed > s.estimated_duration_days
      })

      // Risk scores
      const risks = activeSites.map((s) => {
        const elapsed = differenceInDays(new Date(), new Date(s.created_at))
        const timeRatio = s.estimated_duration_days > 0 ? elapsed / s.estimated_duration_days : 0
        let score = 0
        if (timeRatio > 1) score += 40
        else if (timeRatio > 0.8) score += 20
        if (s.site_down_active) score += 30
        if (s.status === 'extended') score += 20
        return { name: s.name, risk: score >= 50 ? 'High' : score >= 20 ? 'Medium' : 'Low', score }
      }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score)

      setRiskSites(risks)

      const attendanceRate = workers.length > 0 ? ((punchesToday.count || 0) / workers.length) * 100 : 0
      const weeklyAvg = workers.length > 0 ? ((punchesWeek.count || 0) / (workers.length * 7)) * 100 : 0

      setInsights([
        {
          title: 'Attendance Rate',
          value: `${Math.round(attendanceRate)}%`,
          trend: attendanceRate > 80 ? 'up' : 'down',
          description: `${punchesToday.count || 0} of ${workers.length} workers checked in today. Weekly avg: ${Math.round(weeklyAvg)}%`,
          severity: attendanceRate > 80 ? 'info' : attendanceRate > 60 ? 'warning' : 'danger',
        },
        {
          title: 'Overdue Sites',
          value: String(overdueSites.length),
          trend: overdueSites.length > 0 ? 'down' : 'up',
          description: overdueSites.length > 0 ? `${overdueSites.map((s) => s.name).join(', ')} past estimated completion` : 'All sites within timeline',
          severity: overdueSites.length > 2 ? 'danger' : overdueSites.length > 0 ? 'warning' : 'info',
        },
        {
          title: 'Weekly Strikes',
          value: String(strikesRes.count || 0),
          trend: (strikesRes.count || 0) > 5 ? 'down' : 'up',
          description: `${strikesRes.count || 0} strikes issued in the last 7 days`,
          severity: (strikesRes.count || 0) > 10 ? 'danger' : (strikesRes.count || 0) > 3 ? 'warning' : 'info',
        },
        {
          title: 'Workforce Utilization',
          value: `${activeSites.length} sites`,
          trend: 'neutral',
          description: `${workers.length} active workers across ${activeSites.length} sites`,
          severity: 'info',
        },
      ])
    }
    load()
  }, [])

  const severityColor = { info: '#3b82f6', warning: '#f59e0b', danger: '#ef4444' }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Predictive Insights</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((insight) => (
          <Card key={insight.title}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-semibold text-slate-900">{insight.title}</span>
              {insight.trend === 'up' ? <TrendingUp size={16} className="text-green-500" /> :
               insight.trend === 'down' ? <TrendingDown size={16} className="text-red-500" /> :
               <Target size={16} className="text-slate-400" />}
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: severityColor[insight.severity] }}>{insight.value}</div>
            <p className="text-xs text-slate-500">{insight.description}</p>
          </Card>
        ))}
      </div>

      {riskSites.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Site Risk Scores
          </h2>
          <div className="flex flex-col gap-2">
            {riskSites.map((site) => (
              <div key={site.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700">{site.name}</span>
                <Badge color={site.risk === 'High' ? '#ef4444' : site.risk === 'Medium' ? '#f59e0b' : '#10b981'}>
                  {site.risk} ({site.score})
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

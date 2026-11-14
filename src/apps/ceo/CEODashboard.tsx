import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { Card, StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MapPin, Users, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { format, subDays } from 'date-fns'

export function CEODashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ activeSites: 0, totalWorkers: 0, checkedInToday: 0, sitesDown: 0 })
  const [dailyDigest, setDailyDigest] = useState<{ label: string; value: string; color: string }[]>([])

  useEffect(() => {
    async function load() {
      const today = format(new Date(), 'yyyy-MM-dd')
      const [sitesRes, workersRes, punchesRes, starsRes, strikesRes] = await Promise.all([
        supabase.from('sites').select('*').in('status', ['requested', 'ready', 'active', 'extended']),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'employee').eq('is_active', true),
        supabase.from('punches').select('id', { count: 'exact' }).eq('punch_type', 'in').gte('punched_at', today + 'T00:00:00'),
        supabase.from('stars').select('id', { count: 'exact' }).gte('created_at', today + 'T00:00:00'),
        supabase.from('strikes').select('id', { count: 'exact' }).gte('created_at', today + 'T00:00:00'),
      ])

      const sites = sitesRes.data || []
      setStats({
        activeSites: sites.length,
        totalWorkers: workersRes.count || 0,
        checkedInToday: punchesRes.count || 0,
        sitesDown: sites.filter((s: any) => s.site_down_active).length,
      })

      setDailyDigest([
        { label: 'Attendance rate', value: workersRes.count ? `${Math.round(((punchesRes.count || 0) / workersRes.count) * 100)}%` : '—', color: '#10b981' },
        { label: 'Stars awarded today', value: String(starsRes.count || 0), color: '#f59e0b' },
        { label: 'Strikes today', value: String(strikesRes.count || 0), color: '#ef4444' },
        { label: 'Sites down', value: String(sites.filter((s: any) => s.site_down_active).length), color: '#ef4444' },
      ])
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">CEO Overview</h1>
        <p className="text-sm text-slate-500">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Active Sites" value={stats.activeSites} icon={<MapPin size={20} />} color="#5340a8" onClick={() => navigate('/ceo/health')} />
        <StatCard label="Workers" value={stats.totalWorkers} icon={<Users size={20} />} color="#3b82f6" />
        <StatCard label="Checked In" value={stats.checkedInToday} icon={<CheckCircle size={20} />} color="#10b981" />
        <StatCard label="Sites Down" value={stats.sitesDown} icon={<AlertTriangle size={20} />} color="#ef4444" />
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Daily Digest</h2>
        <div className="grid grid-cols-2 gap-3">
          {dailyDigest.map((item) => (
            <div key={item.label} className="p-3 rounded-lg bg-slate-50">
              <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
              <div className="text-xs text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

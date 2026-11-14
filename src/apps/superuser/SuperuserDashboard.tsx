import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, StatCard } from '@/components/ui/Card'
import { MapPin, Users, Shield, AlertTriangle, FileText, Camera, Eye } from 'lucide-react'
import { format } from 'date-fns'

export function SuperuserDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users: 0, sites: 0, audits: 0, anomalies: 0 })

  useEffect(() => {
    async function load() {
      const [usersRes, sitesRes, auditsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('sites').select('id', { count: 'exact' }),
        supabase.from('audit_log').select('id', { count: 'exact' }),
      ])
      setStats({
        users: usersRes.count || 0,
        sites: sitesRes.count || 0,
        audits: auditsRes.count || 0,
        anomalies: 0,
      })
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Superuser Panel</h1>
        <p className="text-sm text-slate-500">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={stats.users} icon={<Users size={20} />} color="#7c3aed" onClick={() => navigate('/superuser/users')} />
        <StatCard label="Total Sites" value={stats.sites} icon={<MapPin size={20} />} color="#3b82f6" />
        <StatCard label="Audit Entries" value={stats.audits} icon={<FileText size={20} />} color="#6b7280" onClick={() => navigate('/superuser/audit')} />
        <StatCard label="Anomalies" value={stats.anomalies} icon={<AlertTriangle size={20} />} color="#ef4444" onClick={() => navigate('/superuser/anomalies')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <button onClick={() => navigate('/superuser/act-as')} className="w-full flex items-center gap-3 text-left">
            <Eye size={20} className="text-purple-500" />
            <div>
              <div className="text-sm font-medium text-slate-900">Act As Employee</div>
              <div className="text-xs text-slate-500">View app as any user</div>
            </div>
          </button>
        </Card>
        <Card>
          <button onClick={() => navigate('/superuser/photos')} className="w-full flex items-center gap-3 text-left">
            <Camera size={20} className="text-blue-500" />
            <div>
              <div className="text-sm font-medium text-slate-900">Photo Management</div>
              <div className="text-xs text-slate-500">Review & manage photos</div>
            </div>
          </button>
        </Card>
        <Card>
          <button onClick={() => navigate('/superuser/killswitch')} className="w-full flex items-center gap-3 text-left">
            <Shield size={20} className="text-red-500" />
            <div>
              <div className="text-sm font-medium text-slate-900">Kill Switch</div>
              <div className="text-xs text-slate-500">Emergency system controls</div>
            </div>
          </button>
        </Card>
      </div>
    </div>
  )
}

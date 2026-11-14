import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore, getRoleColor, getRoleLabel } from '@/stores/auth-store'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Eye, Search, ArrowLeft } from 'lucide-react'
import type { Profile } from '@/types/database'

export function SuperuserActAs() {
  const { user } = useAuthStore()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [acting, setActing] = useState<Profile | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*').eq('is_active', true).order('full_name')
      if (data) setProfiles(data as Profile[])
    }
    load()
  }, [])

  const handleActAs = async (p: Profile) => {
    if (!user) return
    await logAction(user.id, user.role, 'act_as', `Acting as: ${p.full_name} (${p.role})`, { targetId: p.id })
    setActing(p)
  }

  const filtered = profiles.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) || p.role.includes(search.toLowerCase())
  )

  if (acting) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />} onClick={() => setActing(null)}>Back to Superuser</Button>
        <Card>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: getRoleColor(acting.role) }}>
              {acting.full_name.charAt(0)}
            </div>
            <h2 className="text-lg font-bold text-slate-900">{acting.full_name}</h2>
            <Badge color={getRoleColor(acting.role)}>{getRoleLabel(acting.role)}</Badge>
            <div className="mt-4 text-sm text-slate-600 space-y-1">
              <p>Email: {acting.email}</p>
              <p>Phone: {acting.phone || '—'}</p>
              <p>Skill: {acting.skill || '—'}</p>
              <p>Stars: {acting.star_count || 0} | Strikes: {acting.strike_count || 0}</p>
              <p>Daily Wage: ₹{acting.daily_wage || 0}</p>
              <p>Device: {acting.device_id || 'Not bound'}</p>
              <p>Language: {acting.language || 'en'}</p>
              <p>Active: {acting.is_active ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Act As Employee</h1>
      <p className="text-sm text-slate-500">View any user's profile and data as if you were them.</p>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search by name or role..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
      </div>

      {filtered.map((p) => (
        <Card key={p.id}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: getRoleColor(p.role) }}>
              {p.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">{p.full_name}</div>
              <Badge color={getRoleColor(p.role)}>{getRoleLabel(p.role)}</Badge>
            </div>
            <Button size="sm" color="#7c3aed" icon={<Eye size={14} />} onClick={() => handleActAs(p)}>View</Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { getRoleColor, getRoleLabel } from '@/stores/auth-store'
import { Search, UserCheck, UserX, Shield } from 'lucide-react'
import type { Profile, Role } from '@/types/database'

export function SuperuserUsers() {
  const { user } = useAuthStore()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*').order('role').order('full_name')
      if (data) setProfiles(data as Profile[])
    }
    load()
  }, [])

  const handleToggle = useCallback(async (p: Profile) => {
    if (!user) return
    await supabase.from('profiles').update({ is_active: !p.is_active }).eq('id', p.id)
    await logAction(user.id, user.role, p.is_active ? 'deactivate_user' : 'activate_user', `${p.is_active ? 'Deactivated' : 'Activated'} ${p.full_name} (${p.role})`, { targetId: p.id })
    setProfiles((prev) => prev.map((pr) => pr.id === p.id ? { ...pr, is_active: !pr.is_active } : pr))
  }, [user])

  const handleRoleChange = useCallback(async (p: Profile, newRole: Role) => {
    if (!user) return
    await supabase.from('profiles').update({ role: newRole }).eq('id', p.id)
    await logAction(user.id, user.role, 'change_role', `Changed ${p.full_name} role: ${p.role} → ${newRole}`, { targetId: p.id })
    setProfiles((prev) => prev.map((pr) => pr.id === p.id ? { ...pr, role: newRole } : pr))
  }, [user])

  const filtered = profiles.filter((p) => {
    if (roleFilter !== 'all' && p.role !== roleFilter) return false
    if (search && !p.full_name.toLowerCase().includes(search.toLowerCase()) && !p.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">All Users</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
          <option value="all">All Roles</option>
          <option value="employee">Employee</option>
          <option value="supervisor">Supervisor</option>
          <option value="hq">HQ</option>
          <option value="gm">GM</option>
          <option value="ceo">CEO</option>
          <option value="superuser">Superuser</option>
        </select>
      </div>

      <div className="text-xs text-slate-500">{filtered.length} users</div>

      {filtered.map((p) => (
        <Card key={p.id}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: getRoleColor(p.role) }}>
              {p.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">{p.full_name}</div>
              <div className="text-xs text-slate-500">{p.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge color={getRoleColor(p.role)}>{getRoleLabel(p.role)}</Badge>
                {!p.is_active && <Badge color="#ef4444">Inactive</Badge>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <select value={p.role} onChange={(e) => handleRoleChange(p, e.target.value as Role)}
                className="text-xs px-2 py-1 border rounded">
                <option value="employee">Employee</option>
                <option value="supervisor">Supervisor</option>
                <option value="hq">HQ</option>
                <option value="gm">GM</option>
                <option value="ceo">CEO</option>
                <option value="superuser">Superuser</option>
              </select>
              <button onClick={() => handleToggle(p)}
                className={`p-1 rounded text-xs ${p.is_active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {p.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

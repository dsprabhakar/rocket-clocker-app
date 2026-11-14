import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/Badge'
import { Plus, MapPin, Search, Users } from 'lucide-react'
import type { Site, Profile } from '@/types/database'

const STATES = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Telangana', label: 'Telangana' },
]

export function HQSites() {
  const { user } = useAuthStore()
  const [sites, setSites] = useState<Site[]>([])
  const [supervisors, setSupervisors] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', street: '', state: 'Andhra Pradesh', supervisor_id: '', estimated_duration_days: 90 })

  useEffect(() => {
    async function load() {
      const [sitesRes, supRes] = await Promise.all([
        supabase.from('sites').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'supervisor').eq('is_active', true),
      ])
      if (sitesRes.data) setSites(sitesRes.data as Site[])
      if (supRes.data) setSupervisors(supRes.data as Profile[])
    }
    load()
  }, [])

  const handleCreate = useCallback(async () => {
    if (!user || !form.name.trim() || !form.street.trim()) return
    const { data, error } = await supabase.from('sites').insert({
      name: form.name,
      street: form.street,
      state: form.state,
      supervisor_id: form.supervisor_id || null,
      estimated_duration_days: form.estimated_duration_days,
      status: 'requested',
    }).select().single()

    if (data) {
      await logAction(user.id, user.role, 'create_site', `Created site: ${form.name}`, { siteId: data.id })
      setSites((prev) => [data as Site, ...prev])
      setShowCreate(false)
      setForm({ name: '', street: '', state: 'Andhra Pradesh', supervisor_id: '', estimated_duration_days: 90 })
    }
  }, [user, form])

  const filtered = sites.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.street.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = {
    active: filtered.filter((s) => ['requested', 'ready', 'active', 'extended'].includes(s.status)),
    completed: filtered.filter((s) => ['completed', 'abandoned'].includes(s.status)),
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Sites</h1>
        <Button color="#1d5fa0" size="sm" icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
          Register Site
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search sites..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>

      {grouped.active.map((site) => (
        <Card key={site.id}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-medium text-slate-900">{site.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {site.street}, {site.state}</p>
            </div>
            <StatusBadge status={site.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Duration: {site.estimated_duration_days}d</span>
            {site.site_down_active && <span className="text-red-600 font-medium">Site Down</span>}
          </div>
        </Card>
      ))}

      {grouped.completed.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-500 mb-3">Completed / Abandoned</h2>
          <div className="flex flex-col gap-2">
            {grouped.completed.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">{site.name}</span>
                <StatusBadge status={site.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Register New Site" size="lg">
        <div className="flex flex-col gap-4">
          <Input label="Site Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Street Address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
          <Select label="State" options={STATES} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <Select
            label="Assign Supervisor"
            options={[{ value: '', label: '— Select —' }, ...supervisors.map((s) => ({ value: s.id, label: s.full_name }))]}
            value={form.supervisor_id}
            onChange={(e) => setForm({ ...form, supervisor_id: e.target.value })}
          />
          <Input label="Estimated Duration (days)" type="number" value={String(form.estimated_duration_days)} onChange={(e) => setForm({ ...form, estimated_duration_days: Number(e.target.value) })} />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button color="#1d5fa0" onClick={handleCreate} disabled={!form.name.trim() || !form.street.trim()}>Create Site</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

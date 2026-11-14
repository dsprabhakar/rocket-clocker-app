import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { CalendarDays, Plus, Users, MapPin, Shuffle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import type { Site, Profile, Assignment } from '@/types/database'

export function HQPlanner() {
  const { user } = useAuthStore()
  const [sites, setSites] = useState<Site[]>([])
  const [workers, setWorkers] = useState<Profile[]>([])
  const [assignments, setAssignments] = useState<(Assignment & { employee?: Profile; site?: Site })[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showAssign, setShowAssign] = useState(false)
  const [assignForm, setAssignForm] = useState({ site_id: '', employee_id: '' })
  const [idleWorkers, setIdleWorkers] = useState<Profile[]>([])

  useEffect(() => {
    async function load() {
      const [sitesRes, workersRes] = await Promise.all([
        supabase.from('sites').select('*').in('status', ['ready', 'active', 'extended']),
        supabase.from('profiles').select('*').eq('role', 'employee').eq('is_active', true),
      ])
      if (sitesRes.data) setSites(sitesRes.data as Site[])
      if (workersRes.data) setWorkers(workersRes.data as Profile[])
    }
    load()
  }, [])

  useEffect(() => {
    async function loadAssignments() {
      const { data } = await supabase
        .from('assignments')
        .select('*, employee:profiles(*), site:sites(*)')
        .eq('assigned_date', selectedDate)
        .neq('status', 'cancelled')
      if (data) {
        setAssignments(data as any[])
        const assignedIds = new Set(data.map((a: any) => a.employee_id))
        setIdleWorkers(workers.filter((w) => !assignedIds.has(w.id)))
      }
    }
    if (workers.length) loadAssignments()
  }, [selectedDate, workers])

  const handleAssign = useCallback(async () => {
    if (!user || !assignForm.site_id || !assignForm.employee_id) return
    const { data } = await supabase.from('assignments').insert({
      site_id: assignForm.site_id,
      employee_id: assignForm.employee_id,
      assigned_date: selectedDate,
      assigned_by: user.id,
      status: 'assigned',
    }).select('*, employee:profiles(*), site:sites(*)').single()

    if (data) {
      await logAction(user.id, user.role, 'assign_worker', `Assigned worker to site for ${selectedDate}`, { assignmentId: data.id })
      setAssignments((prev) => [...prev, data as any])
      setIdleWorkers((prev) => prev.filter((w) => w.id !== assignForm.employee_id))
    }
    setShowAssign(false)
    setAssignForm({ site_id: '', employee_id: '' })
  }, [user, assignForm, selectedDate])

  const bySite = assignments.reduce<Record<string, (Assignment & { employee?: Profile; site?: Site })[]>>((acc, a) => {
    const key = a.site?.name || 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Assignment Planner</h1>
        <Button color="#1d5fa0" size="sm" icon={<Plus size={14} />} onClick={() => setShowAssign(true)}>Assign</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(new Date(), i)
          const ds = format(d, 'yyyy-MM-dd')
          return (
            <button key={ds} onClick={() => setSelectedDate(ds)}
              className={`flex flex-col items-center px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                selectedDate === ds ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              <span className="font-medium">{format(d, 'EEE')}</span>
              <span>{format(d, 'd MMM')}</span>
            </button>
          )
        })}
      </div>

      {idleWorkers.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <Shuffle size={16} />
            <span className="text-sm font-semibold">{idleWorkers.length} idle workers</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {idleWorkers.slice(0, 10).map((w) => (
              <Badge key={w.id} color="#f59e0b">{w.full_name}</Badge>
            ))}
            {idleWorkers.length > 10 && <Badge color="#94a3b8">+{idleWorkers.length - 10} more</Badge>}
          </div>
        </Card>
      )}

      {Object.entries(bySite).map(([siteName, siteAssignments]) => (
        <Card key={siteName}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <MapPin size={14} /> {siteName}
            <Badge color="#3b82f6">{siteAssignments.length}</Badge>
          </h2>
          <div className="flex flex-col gap-1">
            {siteAssignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-2 rounded bg-slate-50">
                <div className="text-sm text-slate-700">{a.employee?.full_name}</div>
                <Badge color={a.status === 'confirmed' ? '#10b981' : a.status === 'checked_in' ? '#3b82f6' : '#6b7280'}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {assignments.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <CalendarDays size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No assignments for {format(new Date(selectedDate), 'd MMMM yyyy')}</p>
          </div>
        </Card>
      )}

      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Worker">
        <div className="flex flex-col gap-4">
          <Select label="Site" options={[{ value: '', label: '— Select Site —' }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
            value={assignForm.site_id} onChange={(e) => setAssignForm({ ...assignForm, site_id: e.target.value })} />
          <Select label="Worker" options={[{ value: '', label: '— Select Worker —' }, ...idleWorkers.map((w) => ({ value: w.id, label: `${w.full_name} (${w.skill || 'General'})` }))]}
            value={assignForm.employee_id} onChange={(e) => setAssignForm({ ...assignForm, employee_id: e.target.value })} />
          <p className="text-xs text-slate-500">Date: {format(new Date(selectedDate), 'd MMMM yyyy')}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Button>
            <Button color="#1d5fa0" onClick={handleAssign} disabled={!assignForm.site_id || !assignForm.employee_id}>Assign</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

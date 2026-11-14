import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { CameraCapture } from '@/components/shared/CameraCapture'
import { Plus, Search, Camera, Star, Flag, UserCheck, UserX } from 'lucide-react'
import type { Profile } from '@/types/database'

const SKILLS = ['Mason', 'Carpenter', 'Electrician', 'Plumber', 'Painter', 'Welder', 'Helper', 'Other']

export function HQRoster() {
  const { user } = useAuthStore()
  const [workers, setWorkers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showPhoto, setShowPhoto] = useState<Profile | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', skill: 'Helper', daily_wage: 800 })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'employee').order('full_name')
      if (data) setWorkers(data as Profile[])
    }
    load()
  }, [])

  const handleAdd = useCallback(async () => {
    if (!user || !form.full_name.trim() || !form.email.trim()) return
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: form.email,
      email_confirm: true,
    })
    if (authErr) {
      // Fallback: just create profile with a placeholder id
      const { data, error } = await supabase.from('profiles').insert({
        id: crypto.randomUUID(),
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        role: 'employee',
        skill: form.skill,
        daily_wage: form.daily_wage,
        is_active: true,
      }).select().single()
      if (data) {
        await logAction(user.id, user.role, 'add_worker', `Added worker: ${form.full_name}`, { workerId: data.id })
        setWorkers((prev) => [...prev, data as Profile])
      }
    }
    setShowAdd(false)
    setForm({ full_name: '', phone: '', email: '', skill: 'Helper', daily_wage: 800 })
  }, [user, form])

  const handlePhotoUpload = useCallback(async (blob: Blob) => {
    if (!user || !showPhoto) return
    const path = `civil-photos/${showPhoto.id}/${Date.now()}.jpg`
    await supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' })
    await supabase.from('civil_worker_photos').insert({
      employee_id: showPhoto.id,
      photo_url: path,
      uploaded_by: user.id,
    })
    await logAction(user.id, user.role, 'upload_photo', `Uploaded civil worker photo for: ${showPhoto.full_name}`, { employeeId: showPhoto.id })
    setCapturedPhoto(null)
    setShowPhoto(null)
  }, [user, showPhoto])

  const handleToggleActive = useCallback(async (worker: Profile) => {
    if (!user) return
    const newActive = !worker.is_active
    await supabase.from('profiles').update({ is_active: newActive }).eq('id', worker.id)
    await logAction(user.id, user.role, newActive ? 'activate_worker' : 'deactivate_worker', `${newActive ? 'Activated' : 'Deactivated'} worker: ${worker.full_name}`, { workerId: worker.id })
    setWorkers((prev) => prev.map((w) => w.id === worker.id ? { ...w, is_active: newActive } : w))
  }, [user])

  const filtered = workers.filter((w) =>
    w.full_name.toLowerCase().includes(search.toLowerCase()) || (w.skill || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Worker Roster</h1>
        <Button color="#1d5fa0" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>Add Worker</Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search workers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
      </div>

      <div className="text-xs text-slate-500">{filtered.length} workers</div>

      {filtered.map((worker) => (
        <Card key={worker.id}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
              {worker.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">{worker.full_name}</div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {worker.skill && <Badge color="#6b7280">{worker.skill}</Badge>}
                <span>₹{worker.daily_wage}/day</span>
                {!worker.is_active && <Badge color="#ef4444">Inactive</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-0.5 text-amber-500"><Star size={12} />{worker.star_count || 0}</span>
              <span className="flex items-center gap-0.5 text-red-500"><Flag size={12} />{worker.strike_count || 0}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowPhoto(worker)} className="p-1.5 rounded-full bg-blue-100 text-blue-600" title="Take photo"><Camera size={14} /></button>
              <button onClick={() => handleToggleActive(worker)} className={`p-1.5 rounded-full ${worker.is_active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`} title={worker.is_active ? 'Deactivate' : 'Activate'}>
                {worker.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
              </button>
            </div>
          </div>
        </Card>
      ))}

      {/* Add worker modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Worker" size="lg">
        <div className="flex flex-col gap-4">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email (for OTP login)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Select label="Skill" options={SKILLS.map((s) => ({ value: s, label: s }))} value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} />
          <Input label="Daily Wage (₹)" type="number" value={String(form.daily_wage)} onChange={(e) => setForm({ ...form, daily_wage: Number(e.target.value) })} />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button color="#1d5fa0" onClick={handleAdd} disabled={!form.full_name.trim() || !form.email.trim()}>Add Worker</Button>
          </div>
        </div>
      </Modal>

      {/* Photo capture */}
      {showPhoto && !capturedPhoto && (
        <CameraCapture onCapture={(blob) => handlePhotoUpload(blob)} onCancel={() => setShowPhoto(null)} />
      )}
    </div>
  )
}

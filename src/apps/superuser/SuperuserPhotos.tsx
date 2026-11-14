import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Camera, Trash2, Bell, Image } from 'lucide-react'
import { format } from 'date-fns'
import type { Profile } from '@/types/database'

export function SuperuserPhotos() {
  const { user } = useAuthStore()
  const [workers, setWorkers] = useState<(Profile & { photoCount: number })[]>([])
  const [photos, setPhotos] = useState<{ id: string; employee_id: string; photo_url: string; created_at: string }[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [workersRes, photosRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'employee').eq('is_active', true).order('full_name'),
        supabase.from('civil_worker_photos').select('*').order('created_at', { ascending: false }),
      ])

      const photosByEmployee = new Map<string, number>()
      for (const p of photosRes.data || []) {
        photosByEmployee.set(p.employee_id, (photosByEmployee.get(p.employee_id) || 0) + 1)
      }

      setWorkers((workersRes.data || []).map((w: any) => ({ ...w, photoCount: photosByEmployee.get(w.id) || 0 })))
      setPhotos((photosRes.data || []) as any[])
    }
    load()
  }, [])

  const noPhoto = workers.filter((w) => w.photoCount === 0)

  const handleBulkReminder = useCallback(async () => {
    if (!user) return
    for (const w of noPhoto) {
      await supabase.from('broadcasts').insert({
        sender_id: user.id,
        message: `Reminder: Please upload your profile photo for identification purposes.`,
        target_role: 'employee',
      })
    }
    await logAction(user.id, user.role, 'bulk_photo_reminder', `Sent photo reminder to ${noPhoto.length} workers`)
    alert(`Reminder sent to ${noPhoto.length} workers`)
  }, [user, noPhoto])

  const handleDelete = useCallback(async (photoId: string, photoUrl: string) => {
    if (!user) return
    await supabase.from('civil_worker_photos').delete().eq('id', photoId)
    await supabase.storage.from('photos').remove([photoUrl])
    await logAction(user.id, user.role, 'delete_photo', `Deleted photo ${photoId}`)
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }, [user])

  const selectedPhotos = selected ? photos.filter((p) => p.employee_id === selected) : []
  const selectedWorker = selected ? workers.find((w) => w.id === selected) : null

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Photo Management</h1>

      {noPhoto.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-amber-700">{noPhoto.length} workers without photos</div>
              <div className="text-xs text-slate-500">Send bulk reminder to upload profile photos</div>
            </div>
            <Button size="sm" color="#f59e0b" icon={<Bell size={14} />} onClick={handleBulkReminder}>Send Reminder</Button>
          </div>
        </Card>
      )}

      {selected && selectedWorker ? (
        <>
          <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>← Back to list</Button>
          <Card>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">{selectedWorker.full_name}'s Photos ({selectedPhotos.length})</h2>
            <div className="grid grid-cols-3 gap-2">
              {selectedPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                    <Image size={24} className="text-slate-300" />
                  </div>
                  <button onClick={() => handleDelete(photo.id, photo.photo_url)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={10} />
                  </button>
                  <div className="text-xs text-slate-400 mt-1">{format(new Date(photo.created_at), 'dd MMM')}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        workers.map((w) => (
          <Card key={w.id}>
            <button onClick={() => setSelected(w.id)} className="w-full flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-600">
                {w.full_name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{w.full_name}</div>
                <div className="text-xs text-slate-500">{w.skill || 'General'}</div>
              </div>
              <Badge color={w.photoCount > 0 ? '#10b981' : '#ef4444'}>
                {w.photoCount} photo{w.photoCount !== 1 ? 's' : ''}
              </Badge>
            </button>
          </Card>
        ))
      )}
    </div>
  )
}

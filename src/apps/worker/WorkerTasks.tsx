import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { CameraCapture } from '@/components/shared/CameraCapture'
import { ListTodo, Camera, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import type { Task, TaskPhoto, Assignment } from '@/types/database'

export function WorkerTasks() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [photos, setPhotos] = useState<Record<string, TaskPhoto[]>>({})
  const [showCamera, setShowCamera] = useState<{ taskId: string; type: 'before' | 'after' } | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    const today = format(new Date(), 'yyyy-MM-dd')

    async function load() {
      const { data: assignments } = await supabase
        .from('assignments')
        .select('site_id')
        .eq('employee_id', user!.id)
        .eq('assigned_date', today)
        .eq('status', 'confirmed')

      if (!assignments?.length) return

      const siteIds = assignments.map((a) => a.site_id)
      const { data: siteTasks } = await supabase
        .from('tasks')
        .select('*')
        .in('site_id', siteIds)
        .neq('status', 'completed')
        .order('created_at')

      if (siteTasks) setTasks(siteTasks as Task[])

      // Load photos for these tasks
      const { data: taskPhotos } = await supabase
        .from('task_photos')
        .select('*')
        .eq('employee_id', user!.id)
        .in('task_id', (siteTasks || []).map((t) => t.id))

      if (taskPhotos) {
        const grouped: Record<string, TaskPhoto[]> = {}
        for (const p of taskPhotos as TaskPhoto[]) {
          if (!grouped[p.task_id]) grouped[p.task_id] = []
          grouped[p.task_id].push(p)
        }
        setPhotos(grouped)
      }
    }
    load()
  }, [user])

  const handlePhotoCapture = useCallback(async (blob: Blob) => {
    if (!user || !showCamera) return
    setUploading(true)

    const fileName = `task-photos/${user.id}/${showCamera.taskId}_${showCamera.type}_${Date.now()}.jpg`
    const { data: upload } = await supabase.storage.from('task-photos').upload(fileName, blob, { contentType: 'image/jpeg' })
    const url = upload ? supabase.storage.from('task-photos').getPublicUrl(fileName).data.publicUrl : ''

    await supabase.from('task_photos').insert({
      task_id: showCamera.taskId,
      employee_id: user.id,
      photo_type: showCamera.type,
      photo_url: url,
    })

    // Reload photos
    const { data: taskPhotos } = await supabase
      .from('task_photos')
      .select('*')
      .eq('employee_id', user.id)
      .eq('task_id', showCamera.taskId)

    if (taskPhotos) {
      setPhotos((prev) => ({ ...prev, [showCamera.taskId]: taskPhotos as TaskPhoto[] }))
    }

    setShowCamera(null)
    setUploading(false)
  }, [user, showCamera])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Today's Tasks</h1>

      {tasks.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <ListTodo size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No tasks assigned for today</p>
          </div>
        </Card>
      ) : (
        tasks.map((task) => {
          const taskPhotos = photos[task.id] || []
          const hasBefore = taskPhotos.some((p) => p.photo_type === 'before')
          const hasAfter = taskPhotos.some((p) => p.photo_type === 'after')
          return (
            <Card key={task.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-slate-900">{task.title}</h3>
                  <StatusBadge status={task.status} />
                </div>
                {task.status === 'completed' && <CheckCircle size={20} className="text-green-500" />}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={hasBefore ? 'secondary' : 'primary'}
                  color="#c27b0a"
                  icon={hasBefore ? <CheckCircle size={14} /> : <Camera size={14} />}
                  onClick={() => !hasBefore && setShowCamera({ taskId: task.id, type: 'before' })}
                  disabled={hasBefore}
                >
                  {hasBefore ? 'Before ✓' : 'Before Photo'}
                </Button>
                <Button
                  size="sm"
                  variant={hasAfter ? 'secondary' : 'primary'}
                  color="#c27b0a"
                  icon={hasAfter ? <CheckCircle size={14} /> : <Camera size={14} />}
                  onClick={() => !hasAfter && setShowCamera({ taskId: task.id, type: 'after' })}
                  disabled={hasAfter || !hasBefore}
                >
                  {hasAfter ? 'After ✓' : 'After Photo'}
                </Button>
              </div>

              {/* Photo thumbnails */}
              {taskPhotos.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {taskPhotos.map((p) => (
                    <div key={p.id} className="relative">
                      <img src={p.photo_url} alt={p.photo_type} className="w-16 h-16 rounded-lg object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 rounded-b-lg">
                        {p.photo_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })
      )}

      {showCamera && (
        <CameraCapture
          title={`${showCamera.type === 'before' ? 'Before' : 'After'} Photo`}
          onCapture={handlePhotoCapture}
          onCancel={() => setShowCamera(null)}
        />
      )}
    </div>
  )
}

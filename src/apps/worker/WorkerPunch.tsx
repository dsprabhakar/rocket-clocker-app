import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { queuePunch } from '@/lib/offline-db'
import { getCurrentPosition, isInGeofence } from '@/lib/geo'
import { logAction } from '@/lib/audit'
import { CameraCapture } from '@/components/shared/CameraCapture'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Camera, MapPin, Shield, Clock, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react'
import { format } from 'date-fns'
import type { Assignment, Site, Punch } from '@/types/database'

export function WorkerPunch() {
  const { user } = useAuthStore()
  const [assignment, setAssignment] = useState<(Assignment & { site: Site }) | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [punching, setPunching] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [lastPunch, setLastPunch] = useState<Punch | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'checking' | 'inside' | 'outside' | 'error'>('checking')
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null)
  const [online, setOnline] = useState(navigator.onLine)
  const [hoursElapsed, setHoursElapsed] = useState('0:00')
  const [geofenceNudge, setGeofenceNudge] = useState(false)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const today = format(new Date(), 'yyyy-MM-dd')

    async function load() {
      const { data: a } = await supabase
        .from('assignments')
        .select('*, site:sites(*)')
        .eq('employee_id', user!.id)
        .eq('assigned_date', today)
        .eq('status', 'confirmed')
        .limit(1)
        .single()
      if (a) setAssignment(a as any)

      const { data: p } = await supabase
        .from('punches')
        .select('*')
        .eq('employee_id', user!.id)
        .gte('punched_at', today + 'T00:00:00')
        .order('punched_at', { ascending: false })
        .limit(1)
        .single()
      if (p) {
        setLastPunch(p as Punch)
        setCheckedIn(p.punch_type === 'in' || p.punch_type === 'liveness')
      }
    }
    load()
  }, [user])

  // GPS check
  useEffect(() => {
    async function checkGps() {
      const pos = await getCurrentPosition()
      if (!pos) { setGpsStatus('error'); return }
      setPosition(pos)
      if (assignment?.site?.latitude && assignment?.site?.longitude) {
        const inside = isInGeofence(
          pos.latitude, pos.longitude,
          assignment.site.latitude, assignment.site.longitude,
          assignment.site.geofence_radius_meters
        )
        setGpsStatus(inside ? 'inside' : 'outside')
        if (inside && !checkedIn) setGeofenceNudge(true)
      }
    }
    checkGps()
    const interval = setInterval(checkGps, 30000)
    return () => clearInterval(interval)
  }, [assignment, checkedIn])

  // Live hours ticker (updates every 30s)
  useEffect(() => {
    if (!checkedIn || !lastPunch) return
    function update() {
      const start = new Date(lastPunch!.punched_at).getTime()
      const diff = Date.now() - start
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setHoursElapsed(`${h}:${m.toString().padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [checkedIn, lastPunch])

  const handleCapture = useCallback(async (blob: Blob) => {
    if (!user || !assignment) return
    setShowCamera(false)
    setPunching(true)

    const punchType = checkedIn ? 'out' : 'in'
    const tempId = crypto.randomUUID()

    try {
      if (online) {
        // Upload selfie
        const fileName = `punches/${user.id}/${tempId}.jpg`
        const { data: upload } = await supabase.storage.from('selfies').upload(fileName, blob, { contentType: 'image/jpeg' })
        const selfieUrl = upload ? supabase.storage.from('selfies').getPublicUrl(fileName).data.publicUrl : null

        // Insert punch
        await supabase.from('punches').insert({
          employee_id: user.id,
          site_id: assignment.site_id,
          punch_type: punchType,
          selfie_url: selfieUrl,
          latitude: position?.latitude || null,
          longitude: position?.longitude || null,
          device_id: navigator.userAgent.slice(0, 100),
          in_geofence: gpsStatus === 'inside',
          synced: true,
        })

        await logAction(user.id, user.role, `punch_${punchType}`, `${user.full_name} punched ${punchType} at ${assignment.site?.name}`, {
          siteId: assignment.site_id,
          inGeofence: gpsStatus === 'inside',
        })
      } else {
        // Offline queue
        await queuePunch({
          tempId,
          employeeId: user.id,
          siteId: assignment.site_id,
          punchType,
          selfieBlob: blob,
          latitude: position?.latitude || null,
          longitude: position?.longitude || null,
          deviceId: navigator.userAgent.slice(0, 100),
          inGeofence: gpsStatus === 'inside',
          punchedAt: new Date().toISOString(),
          synced: false,
        })
      }

      setCheckedIn(!checkedIn)
      setGeofenceNudge(false)
    } catch (err) {
      console.error('Punch failed:', err)
    } finally {
      setPunching(false)
    }
  }, [user, assignment, checkedIn, online, position, gpsStatus])

  if (!user) return null

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Attendance</h1>

      {/* Connection status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${online ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
        {online ? <Wifi size={16} /> : <WifiOff size={16} />}
        {online ? 'Online — punches sync in real-time' : 'Offline — punches queued, will sync later'}
      </div>

      {/* Geofence nudge */}
      {geofenceNudge && !checkedIn && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
          <MapPin size={20} className="text-green-600" />
          <div>
            <div className="text-sm font-medium text-green-800">You're at the site!</div>
            <div className="text-xs text-green-600">Ready to check in?</div>
          </div>
        </div>
      )}

      {/* Assignment card */}
      {assignment ? (
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">{assignment.site?.name}</h3>
              <p className="text-sm text-slate-500">{assignment.site?.street}, {assignment.site?.state}</p>
            </div>
            <Badge color={gpsStatus === 'inside' ? '#10b981' : gpsStatus === 'outside' ? '#f59e0b' : '#6b7280'}>
              {gpsStatus === 'checking' ? 'Checking GPS...' : gpsStatus === 'inside' ? 'In geofence' : gpsStatus === 'outside' ? 'Outside geofence' : 'GPS error'}
            </Badge>
          </div>

          {/* Status display */}
          <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-slate-50">
            {checkedIn ? (
              <>
                <CheckCircle size={24} className="text-green-600" />
                <div>
                  <div className="text-sm font-medium text-green-800">Checked In</div>
                  <div className="text-2xl font-bold text-slate-900">{hoursElapsed}</div>
                  <div className="text-xs text-slate-500">hours on site</div>
                </div>
              </>
            ) : (
              <>
                <Clock size={24} className="text-slate-400" />
                <div>
                  <div className="text-sm text-slate-500">Not checked in</div>
                  {lastPunch && <div className="text-xs text-slate-400">Last: {format(new Date(lastPunch.punched_at), 'h:mm a')}</div>}
                </div>
              </>
            )}
          </div>

          {/* Punch button */}
          <Button
            onClick={() => setShowCamera(true)}
            loading={punching}
            color={checkedIn ? '#ef4444' : '#10b981'}
            size="lg"
            className="w-full"
            icon={<Camera size={20} />}
          >
            {checkedIn ? 'Check Out' : 'Check In'} with Selfie
          </Button>

          {gpsStatus === 'outside' && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertTriangle size={12} />
              You appear to be outside the site geofence
            </p>
          )}
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <Clock size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No confirmed assignment for today</p>
            <p className="text-xs text-slate-400 mt-1">Check your assignments or contact your supervisor</p>
          </div>
        </Card>
      )}

      {/* Device binding info */}
      <Card>
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-slate-400" />
          <div>
            <div className="text-sm font-medium text-slate-700">Device Bound</div>
            <div className="text-xs text-slate-400">Punches are tied to this device for security</div>
          </div>
        </div>
      </Card>

      {/* Camera overlay */}
      {showCamera && (
        <CameraCapture
          title={checkedIn ? 'Check Out Selfie' : 'Check In Selfie'}
          onCapture={handleCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  )
}

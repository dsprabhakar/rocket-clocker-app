import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { Card, StatCard } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Clock, MapPin, Star, Flag, Volume2, CheckCircle } from 'lucide-react'
import type { Assignment, Punch, Broadcast, Site } from '@/types/database'
import { format } from 'date-fns'

export function WorkerDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [todayAssignment, setTodayAssignment] = useState<(Assignment & { site: Site }) | null>(null)
  const [lastPunch, setLastPunch] = useState<Punch | null>(null)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [checkedIn, setCheckedIn] = useState(false)
  const [hoursToday, setHoursToday] = useState(0)

  useEffect(() => {
    if (!user) return
    const today = format(new Date(), 'yyyy-MM-dd')

    async function load() {
      // Today's assignment
      const { data: assignments } = await supabase
        .from('assignments')
        .select('*, site:sites(*)')
        .eq('employee_id', user!.id)
        .eq('assigned_date', today)
        .neq('status', 'cancelled')
        .limit(1)
        .single()
      if (assignments) setTodayAssignment(assignments as any)

      // Last punch
      const { data: punches } = await supabase
        .from('punches')
        .select('*')
        .eq('employee_id', user!.id)
        .order('punched_at', { ascending: false })
        .limit(1)
        .single()
      if (punches) {
        setLastPunch(punches as Punch)
        if (punches.punch_type === 'in') setCheckedIn(true)
      }

      // Calculate hours today
      const { data: todayPunches } = await supabase
        .from('punches')
        .select('*')
        .eq('employee_id', user!.id)
        .gte('punched_at', today + 'T00:00:00')
        .order('punched_at', { ascending: true })
      if (todayPunches && todayPunches.length >= 2) {
        const checkIn = new Date(todayPunches[0].punched_at).getTime()
        const lastP = new Date(todayPunches[todayPunches.length - 1].punched_at).getTime()
        setHoursToday(Math.round(((lastP - checkIn) / 3600000) * 10) / 10)
      }

      // Recent broadcasts
      const { data: bcast } = await supabase
        .from('broadcasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      if (bcast) setBroadcasts(bcast as Broadcast[])
    }

    load()
  }, [user])

  if (!user) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Hello, {user.full_name.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Status"
          value={checkedIn ? 'On Site' : 'Off Site'}
          icon={<Clock size={20} />}
          color={checkedIn ? '#10b981' : '#6b7280'}
        />
        <StatCard
          label="Hours Today"
          value={hoursToday}
          icon={<Clock size={20} />}
          color="#c27b0a"
        />
        <StatCard
          label="Stars"
          value={user.star_count}
          icon={<Star size={20} />}
          color="#f59e0b"
        />
        <StatCard
          label="Strikes"
          value={user.strike_count}
          icon={<Flag size={20} />}
          color="#ef4444"
        />
      </div>

      {/* Today's assignment */}
      <Card>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Today's Assignment</h2>
        {todayAssignment ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">{todayAssignment.site?.name}</div>
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin size={14} />
                {todayAssignment.site?.street}, {todayAssignment.site?.state}
              </div>
              <StatusBadge status={todayAssignment.status} />
            </div>
            {todayAssignment.status === 'assigned' ? (
              <button
                onClick={async () => {
                  await supabase.from('assignments').update({ status: 'confirmed' }).eq('id', todayAssignment.id)
                  setTodayAssignment({ ...todayAssignment, status: 'confirmed' })
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700"
              >
                Confirm
              </button>
            ) : (
              <button
                onClick={() => navigate('/worker/punch')}
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-medium hover:bg-amber-700"
              >
                {checkedIn ? 'Check Out' : 'Check In'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No assignment for today</p>
        )}
      </Card>

      {/* Broadcasts */}
      {broadcasts.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Volume2 size={16} />
            Messages
          </h2>
          <div className="flex flex-col gap-2">
            {broadcasts.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Volume2 size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700">Voice message</div>
                  <div className="text-xs text-slate-400">{format(new Date(b.created_at), 'MMM d, h:mm a')}</div>
                </div>
                <audio src={b.audio_url ?? undefined} controls className="h-8 max-w-[140px]" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Users, Phone, CheckCircle, Clock, AlertTriangle, Star, Flag, Camera } from 'lucide-react'
import { format } from 'date-fns'
import type { Site, Assignment, Profile, Punch } from '@/types/database'

export function SupervisorRoster() {
  const { user } = useAuthStore()
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSite, setSelectedSite] = useState<string>('')
  const [workers, setWorkers] = useState<(Assignment & { employee: Profile; punchIn?: Punch })[]>([])
  const [showReport, setShowReport] = useState<Profile | null>(null)
  const [showStar, setShowStar] = useState<Profile | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [starReason, setStarReason] = useState('')

  useEffect(() => {
    if (!user) return
    async function loadSites() {
      const { data } = await supabase
        .from('sites')
        .select('*')
        .eq('supervisor_id', user!.id)
        .in('status', ['ready', 'active', 'extended'])
      if (data && data.length > 0) {
        setSites(data as Site[])
        setSelectedSite(data[0].id)
      }
    }
    loadSites()
  }, [user])

  useEffect(() => {
    if (!selectedSite) return
    const today = format(new Date(), 'yyyy-MM-dd')

    async function loadWorkers() {
      const { data: assignments } = await supabase
        .from('assignments')
        .select('*, employee:profiles(*)')
        .eq('site_id', selectedSite)
        .eq('assigned_date', today)
        .neq('status', 'cancelled')

      if (!assignments) return

      const { data: punches } = await supabase
        .from('punches')
        .select('*')
        .eq('site_id', selectedSite)
        .eq('punch_type', 'in')
        .gte('punched_at', today + 'T00:00:00')

      const punchMap = new Map((punches || []).map((p) => [p.employee_id, p]))
      setWorkers(
        (assignments as any[]).map((a) => ({
          ...a,
          punchIn: punchMap.get(a.employee_id),
        }))
      )
    }
    loadWorkers()
  }, [selectedSite])

  async function handleReport() {
    if (!user || !showReport || !reportReason.trim()) return
    await supabase.from('worker_reports').insert({
      employee_id: showReport.id,
      reported_by: user.id,
      reason: reportReason,
    })
    await logAction(user.id, user.role, 'report_worker', `Reported worker: ${showReport.full_name} — ${reportReason}`, {
      employeeId: showReport.id,
    })
    setShowReport(null)
    setReportReason('')
  }

  async function handleAwardStar() {
    if (!user || !showStar || !starReason.trim()) return
    await supabase.from('stars').insert({
      employee_id: showStar.id,
      awarded_by: user.id,
      reason: starReason,
    })
    await supabase.from('profiles').update({ star_count: (showStar.star_count || 0) + 1 }).eq('id', showStar.id)
    await logAction(user.id, user.role, 'award_star', `Awarded star to: ${showStar.full_name} — ${starReason}`, {
      employeeId: showStar.id,
    })
    setShowStar(null)
    setStarReason('')
  }

  async function handleManualAttendance(employeeId: string, employeeName: string) {
    if (!user || !selectedSite) return
    await supabase.from('punches').insert({
      employee_id: employeeId,
      site_id: selectedSite,
      punch_type: 'in',
      synced: true,
    })
    await logAction(user.id, user.role, 'manual_attendance', `Manual check-in for: ${employeeName} (phone call fallback)`, {
      employeeId, siteId: selectedSite,
    })
    // Refresh
    setSelectedSite((s) => s)
  }

  const checkedIn = workers.filter((w) => w.punchIn)
  const notCheckedIn = workers.filter((w) => !w.punchIn)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Today's Roster</h1>

      {/* Site selector */}
      {sites.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sites.map((site) => (
            <button
              key={site.id}
              onClick={() => setSelectedSite(site.id)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedSite === site.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {site.name}
            </button>
          ))}
        </div>
      )}

      {/* Not checked in */}
      {notCheckedIn.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} />
            Not Checked In ({notCheckedIn.length})
          </h2>
          <div className="flex flex-col gap-2">
            {notCheckedIn.map((w) => (
              <div key={w.id} className="flex items-center gap-3 p-2 rounded-lg bg-red-50">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-medium text-red-600">
                  {w.employee?.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{w.employee?.full_name}</div>
                  {w.employee?.skill && <Badge color="#6b7280">{w.employee.skill}</Badge>}
                </div>
                <div className="flex gap-1">
                  {w.employee?.phone && (
                    <a href={`tel:${w.employee.phone}`} className="p-1.5 rounded-full bg-green-100 text-green-600">
                      <Phone size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => handleManualAttendance(w.employee_id, w.employee?.full_name || '')}
                    className="p-1.5 rounded-full bg-blue-100 text-blue-600"
                    title="Manual check-in"
                  >
                    <CheckCircle size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Checked in */}
      <Card>
        <h2 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
          <CheckCircle size={16} />
          Checked In ({checkedIn.length})
        </h2>
        {checkedIn.length > 0 ? (
          <div className="flex flex-col gap-2">
            {checkedIn.map((w) => (
              <div key={w.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-600">
                  {w.employee?.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{w.employee?.full_name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={10} />
                    In at {format(new Date(w.punchIn!.punched_at), 'h:mm a')}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowStar(w.employee)}
                    className="p-1.5 rounded-full bg-amber-100 text-amber-600"
                    title="Award star"
                  >
                    <Star size={14} />
                  </button>
                  <button
                    onClick={() => setShowReport(w.employee)}
                    className="p-1.5 rounded-full bg-red-100 text-red-600"
                    title="Report"
                  >
                    <Flag size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No workers checked in yet</p>
        )}
      </Card>

      {/* Emergency muster */}
      <Card>
        <h2 className="text-sm font-semibold text-slate-900 mb-2">Emergency Muster</h2>
        <div className="text-3xl font-bold text-slate-900">{checkedIn.length}</div>
        <div className="text-sm text-slate-500">workers currently on site</div>
      </Card>

      {/* Report modal */}
      <Modal open={!!showReport} onClose={() => setShowReport(null)} title="Report Worker">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">Reporting: <strong>{showReport?.full_name}</strong></p>
          <Textarea
            label="Reason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={3}
            placeholder="Describe the issue..."
            required
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowReport(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleReport} disabled={!reportReason.trim()}>Submit Report</Button>
          </div>
        </div>
      </Modal>

      {/* Star modal */}
      <Modal open={!!showStar} onClose={() => setShowStar(null)} title="Award Star ⭐">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">Award star to: <strong>{showStar?.full_name}</strong></p>
          <Textarea
            label="Reason (required)"
            value={starReason}
            onChange={(e) => setStarReason(e.target.value)}
            rows={3}
            placeholder="Why is this worker being recognized?"
            required
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowStar(null)}>Cancel</Button>
            <Button color="#f59e0b" onClick={handleAwardStar} disabled={!starReason.trim()}>Award Star</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

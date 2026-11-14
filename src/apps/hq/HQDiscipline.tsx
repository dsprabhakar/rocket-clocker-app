import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Shield, Star, Flag, AlertTriangle, CheckCircle, X, Eye } from 'lucide-react'
import { format } from 'date-fns'
import type { Profile, WorkerReport } from '@/types/database'

export function HQDiscipline() {
  const { user } = useAuthStore()
  const [reports, setReports] = useState<(WorkerReport & { employee?: Profile; reporter?: Profile })[]>([])
  const [showAction, setShowAction] = useState<(WorkerReport & { employee?: Profile }) | null>(null)
  const [actionNote, setActionNote] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('worker_reports')
        .select('*, employee:profiles!worker_reports_employee_id_fkey(*), reporter:profiles!worker_reports_reported_by_fkey(*)')
        .order('created_at', { ascending: false })
      if (data) setReports(data as any[])
    }
    load()
  }, [])

  const handleAction = useCallback(async (action: 'strike' | 'dismiss') => {
    if (!user || !showAction) return

    if (action === 'strike') {
      await supabase.from('strikes').insert({
        employee_id: showAction.employee_id,
        issued_by: user.id,
        reason: showAction.reason + (actionNote ? ` — HQ: ${actionNote}` : ''),
      })
      const emp = showAction.employee
      const newCount = (emp?.strike_count || 0) + 1
      await supabase.from('profiles').update({ strike_count: newCount, is_active: newCount < 3 }).eq('id', showAction.employee_id)

      if (newCount >= 3) {
        await logAction(user.id, user.role, '3_strike_deactivate', `3-strike rule: deactivated ${emp?.full_name}`, { employeeId: showAction.employee_id })
      }
      await logAction(user.id, user.role, 'issue_strike', `Issued strike to ${emp?.full_name}`, { reportId: showAction.id })
    }

    await supabase.from('worker_reports').update({
      status: action === 'strike' ? 'actioned' : 'dismissed',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', showAction.id)

    setReports((prev) => prev.map((r) => r.id === showAction.id ? { ...r, status: action === 'strike' ? 'actioned' : 'dismissed' } : r))
    setShowAction(null)
    setActionNote('')
  }, [user, showAction, actionNote])

  const pending = reports.filter((r) => r.status === 'pending')
  const resolved = reports.filter((r) => r.status !== 'pending')

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Discipline & Reports</h1>

      {pending.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
            <AlertTriangle size={16} /> Pending Review ({pending.length})
          </h2>
          {pending.map((report) => (
            <Card key={report.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-slate-900">{report.employee?.full_name}</div>
                  <div className="text-xs text-slate-500">Reported by {report.reporter?.full_name}</div>
                  <div className="text-xs text-slate-400">{format(new Date(report.created_at), 'dd MMM yyyy, h:mm a')}</div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Flag size={12} className="text-red-500" />
                  <span className="text-red-600">{report.employee?.strike_count || 0}/3 strikes</span>
                </div>
              </div>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 mb-3">{report.reason}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="danger" icon={<Flag size={14} />} onClick={() => setShowAction(report as any)}>Issue Strike</Button>
                <Button size="sm" variant="secondary" icon={<X size={14} />} onClick={() => { setShowAction(report as any); handleAction('dismiss') }}>Dismiss</Button>
              </div>
            </Card>
          ))}
        </>
      )}

      {resolved.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-slate-500 mt-2">Resolved</h2>
          {resolved.slice(0, 20).map((report) => (
            <Card key={report.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-700">{report.employee?.full_name}</div>
                  <div className="text-xs text-slate-500">{report.reason.slice(0, 60)}...</div>
                </div>
                <Badge color={report.status === 'actioned' ? '#ef4444' : '#94a3b8'}>
                  {report.status === 'actioned' ? 'Strike issued' : 'Dismissed'}
                </Badge>
              </div>
            </Card>
          ))}
        </>
      )}

      <Modal open={!!showAction} onClose={() => setShowAction(null)} title="Issue Strike">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">Worker: <strong>{showAction?.employee?.full_name}</strong></p>
          <p className="text-sm text-slate-600">Current strikes: <strong>{showAction?.employee?.strike_count || 0}</strong>/3</p>
          {(showAction?.employee?.strike_count || 0) >= 2 && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
              This will be their 3rd strike — automatic deactivation will apply.
            </div>
          )}
          <Textarea label="Additional notes (optional)" value={actionNote} onChange={(e) => setActionNote(e.target.value)} rows={2} />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAction(null)}>Cancel</Button>
            <Button variant="danger" icon={<Flag size={14} />} onClick={() => handleAction('strike')}>Confirm Strike</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

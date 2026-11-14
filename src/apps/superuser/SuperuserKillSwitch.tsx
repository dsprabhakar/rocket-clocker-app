import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Shield, AlertTriangle, Power, Lock } from 'lucide-react'

export function SuperuserKillSwitch() {
  const { user } = useAuthStore()
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)

  const actions = [
    {
      id: 'deactivate_all_employees',
      label: 'Deactivate All Employees',
      description: 'Immediately deactivates all employee accounts. No one can punch in.',
      icon: <Power size={20} className="text-red-500" />,
      danger: true,
    },
    {
      id: 'lock_all_sites',
      label: 'Lock All Sites',
      description: 'Sets all active sites to site-down status. No punches accepted.',
      icon: <Lock size={20} className="text-amber-500" />,
      danger: true,
    },
    {
      id: 'reset_all_strikes',
      label: 'Reset All Strikes',
      description: 'Clears all strike counts back to zero for every employee.',
      icon: <Shield size={20} className="text-blue-500" />,
      danger: false,
    },
  ]

  const handleExecute = useCallback(async () => {
    if (!user || !showConfirm) return
    setExecuting(true)

    if (showConfirm === 'deactivate_all_employees') {
      await supabase.from('profiles').update({ is_active: false }).eq('role', 'employee')
      await logAction(user.id, user.role, 'kill_switch', 'KILL SWITCH: Deactivated all employees')
    } else if (showConfirm === 'lock_all_sites') {
      await supabase.from('sites').update({ site_down_active: true, site_down_reason: 'power_failure' }).in('status', ['ready', 'active', 'extended'])
      await logAction(user.id, user.role, 'kill_switch', 'KILL SWITCH: Locked all sites')
    } else if (showConfirm === 'reset_all_strikes') {
      await supabase.from('profiles').update({ strike_count: 0 }).eq('role', 'employee')
      await logAction(user.id, user.role, 'kill_switch', 'KILL SWITCH: Reset all strikes')
    }

    setExecuting(false)
    setShowConfirm(null)
  }, [user, showConfirm])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Kill Switch</h1>
      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
        <AlertTriangle size={16} className="inline mr-2" />
        These are emergency actions. Each action is logged and cannot be easily reversed.
      </div>

      {actions.map((action) => (
        <Card key={action.id}>
          <div className="flex items-center gap-3">
            {action.icon}
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-900">{action.label}</div>
              <div className="text-xs text-slate-500">{action.description}</div>
            </div>
            <Button size="sm" variant={action.danger ? 'danger' : 'secondary'} onClick={() => setShowConfirm(action.id)}>
              Execute
            </Button>
          </div>
        </Card>
      ))}

      <Modal open={!!showConfirm} onClose={() => setShowConfirm(null)} title="Confirm Kill Switch" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-red-700 font-medium">Are you absolutely sure? This action will be logged.</p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowConfirm(null)}>Cancel</Button>
            <Button variant="danger" loading={executing} onClick={handleExecute}>Confirm Execute</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

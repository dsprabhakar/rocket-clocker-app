import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, Clock, MapPin, Users } from 'lucide-react'
import { format, differenceInHours } from 'date-fns'

interface Anomaly {
  type: string
  severity: 'high' | 'medium' | 'low'
  description: string
  timestamp: string
}

export function SuperuserAnomalies() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])

  useEffect(() => {
    async function detect() {
      const today = format(new Date(), 'yyyy-MM-dd')
      const found: Anomaly[] = []

      // Detect: Punches outside geofence
      const { data: punches } = await supabase
        .from('punches')
        .select('*, site:sites(*)')
        .gte('punched_at', today + 'T00:00:00')
        .eq('in_geofence', false)
      if (punches?.length) {
        found.push({
          type: 'Geofence Violation',
          severity: 'high',
          description: `${punches.length} punch(es) recorded outside geofence today`,
          timestamp: new Date().toISOString(),
        })
      }

      // Detect: Very long shifts (>14 hours)
      const { data: longPunches } = await supabase
        .from('punches')
        .select('*')
        .eq('punch_type', 'in')
        .gte('punched_at', today + 'T00:00:00')
      if (longPunches) {
        const longShifts = longPunches.filter((p: any) => differenceInHours(new Date(), new Date(p.punched_at)) > 14)
        if (longShifts.length > 0) {
          found.push({
            type: 'Excessive Shift Duration',
            severity: 'medium',
            description: `${longShifts.length} worker(s) clocked in for 14+ hours without punch-out`,
            timestamp: new Date().toISOString(),
          })
        }
      }

      // Detect: Workers with 2+ strikes
      const { data: atRiskWorkers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'employee')
        .eq('is_active', true)
        .gte('strike_count', 2)
      if ((atRiskWorkers as any)?.length > 0) {
        found.push({
          type: 'Attrition Risk',
          severity: 'medium',
          description: `${(atRiskWorkers as any).length} active worker(s) at 2 strikes — one more triggers deactivation`,
          timestamp: new Date().toISOString(),
        })
      }

      setAnomalies(found)
    }
    detect()
  }, [])

  const severityColor = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Anomaly Detection</h1>

      {anomalies.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <AlertTriangle size={32} className="text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No anomalies detected</p>
          </div>
        </Card>
      ) : (
        anomalies.map((a, i) => (
          <Card key={i}>
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} style={{ color: severityColor[a.severity] }} className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900">{a.type}</span>
                  <Badge color={severityColor[a.severity]}>{a.severity}</Badge>
                </div>
                <p className="text-sm text-slate-600">{a.description}</p>
                <div className="text-xs text-slate-400 mt-1">{format(new Date(a.timestamp), 'h:mm a')}</div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

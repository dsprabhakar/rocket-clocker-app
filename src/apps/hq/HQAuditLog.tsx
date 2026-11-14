import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { FileText, Search, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import type { AuditLog } from '@/types/database'

const ACTION_COLORS: Record<string, string> = {
  punch_in: '#10b981', punch_out: '#f59e0b', create_site: '#3b82f6', survey_site: '#8b5cf6',
  assign_worker: '#3b82f6', award_star: '#f59e0b', issue_strike: '#ef4444', report_worker: '#ef4444',
  broadcast: '#6366f1', site_down: '#ef4444', manual_attendance: '#f97316', '3_strike_deactivate': '#dc2626',
}

export function HQAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(50)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function load() {
      const query = supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(limit)
      if (search.trim()) {
        query.or(`action.ilike.%${search}%,description.ilike.%${search}%`)
      }
      const { data } = await query
      if (data) {
        setLogs(data as AuditLog[])
        setHasMore(data.length === limit)
      }
    }
    load()
  }, [search, limit])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Audit Log</h1>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search actions..." value={search} onChange={(e) => { setSearch(e.target.value); setLimit(50) }}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
      </div>

      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <Card key={log.id}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <FileText size={14} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge color={ACTION_COLORS[log.action] || '#6b7280'}>{log.action}</Badge>
                  <Badge color="#94a3b8">{log.actor_role}</Badge>
                </div>
                <p className="text-sm text-slate-700">{log.description}</p>
                <div className="text-xs text-slate-400 mt-1">{format(new Date(log.created_at), 'dd MMM yyyy, h:mm:ss a')}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {hasMore && (
        <button onClick={() => setLimit((l) => l + 50)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto">
          <ChevronDown size={14} /> Load more
        </button>
      )}

      {logs.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <FileText size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No audit log entries{search ? ' matching your search' : ''}</p>
          </div>
        </Card>
      )}
    </div>
  )
}

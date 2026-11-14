import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { getCurrentPosition } from '@/lib/geo'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Select, Textarea } from '@/components/ui/Input'
import { MapPin, CheckCircle, AlertTriangle, Navigation, Loader2 } from 'lucide-react'
import type { Site, SiteDownReason } from '@/types/database'

const SITE_DOWN_REASONS: { value: SiteDownReason; label: string }[] = [
  { value: 'power_failure', label: 'Power Failure' },
  { value: 'local_holiday', label: 'Local Holiday' },
  { value: 'natural_calamity', label: 'Natural Calamity' },
  { value: 'materials_unavailable', label: 'Unavailability of Materials' },
  { value: 'tool_shortage', label: 'Tool Shortage' },
  { value: 'site_clearance', label: 'Site Clearance' },
]

export function SupervisorSites() {
  const { user } = useAuthStore()
  const [sites, setSites] = useState<Site[]>([])
  const [surveying, setSurveying] = useState<string | null>(null)
  const [showSiteDown, setShowSiteDown] = useState<Site | null>(null)
  const [siteDownReason, setSiteDownReason] = useState<SiteDownReason>('power_failure')
  const [showComplete, setShowComplete] = useState<Site | null>(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('sites')
        .select('*')
        .eq('supervisor_id', user!.id)
        .order('status', { ascending: true })
      if (data) setSites(data as Site[])
    }
    load()
  }, [user])

  const handleSurvey = useCallback(async (site: Site) => {
    if (!user) return
    setSurveying(site.id)
    const pos = await getCurrentPosition()
    if (!pos) {
      alert('Could not get GPS position. Please enable GPS and try again.')
      setSurveying(null)
      return
    }

    await supabase.from('sites').update({
      latitude: pos.latitude,
      longitude: pos.longitude,
      geofence_radius_meters: 200,
      status: 'ready',
    }).eq('id', site.id)

    await logAction(user.id, user.role, 'survey_site', `Surveyed and enabled site: ${site.name}`, {
      siteId: site.id, latitude: pos.latitude, longitude: pos.longitude,
    })

    setSites((prev) => prev.map((s) => s.id === site.id ? { ...s, status: 'ready' as const, latitude: pos.latitude, longitude: pos.longitude } : s))
    setSurveying(null)
  }, [user])

  const handleSiteDown = useCallback(async () => {
    if (!user || !showSiteDown) return
    await supabase.from('sites').update({
      site_down_active: true,
      site_down_reason: siteDownReason,
    }).eq('id', showSiteDown.id)

    await supabase.from('site_closures').insert({
      site_id: showSiteDown.id,
      reason: siteDownReason,
      start_date: new Date().toISOString().split('T')[0],
      declared_by: user.id,
    })

    await logAction(user.id, user.role, 'site_down', `Reported site down: ${showSiteDown.name} — ${siteDownReason}`, {
      siteId: showSiteDown.id, reason: siteDownReason,
    })

    setSites((prev) => prev.map((s) => s.id === showSiteDown.id ? { ...s, site_down_active: true, site_down_reason: siteDownReason } : s))
    setShowSiteDown(null)
  }, [user, showSiteDown, siteDownReason])

  const handleComplete = useCallback(async () => {
    if (!user || !showComplete) return
    await supabase.from('sites').update({ status: 'completed' }).eq('id', showComplete.id)
    await logAction(user.id, user.role, 'certify_complete', `Certified site completed: ${showComplete.name}`, { siteId: showComplete.id })
    setSites((prev) => prev.map((s) => s.id === showComplete.id ? { ...s, status: 'completed' as const } : s))
    setShowComplete(null)
  }, [user, showComplete])

  const requested = sites.filter((s) => s.status === 'requested')
  const activeSites = sites.filter((s) => ['ready', 'active', 'extended'].includes(s.status))
  const completed = sites.filter((s) => ['completed', 'abandoned'].includes(s.status))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">My Sites</h1>

      {/* Pending survey — overdue first */}
      {requested.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} />
            Pending Survey ({requested.length})
          </h2>
          <div className="flex flex-col gap-2">
            {requested.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                <div>
                  <div className="text-sm font-medium text-slate-900">{site.name}</div>
                  <div className="text-xs text-slate-500">{site.street}, {site.state}</div>
                </div>
                <Button
                  size="sm"
                  color="#0e6b54"
                  loading={surveying === site.id}
                  icon={surveying === site.id ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                  onClick={() => handleSurvey(site)}
                >
                  Survey & Enable
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active sites */}
      {activeSites.map((site) => (
        <Card key={site.id}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-slate-900">{site.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={12} /> {site.street}, {site.state}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={site.status} />
              {site.site_down_active && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                  Down: {SITE_DOWN_REASONS.find((r) => r.value === site.site_down_reason)?.label}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="danger" onClick={() => setShowSiteDown(site)}>
              Report Site Down
            </Button>
            <Button size="sm" variant="secondary" icon={<CheckCircle size={14} />} onClick={() => setShowComplete(site)}>
              Certify Complete
            </Button>
          </div>
        </Card>
      ))}

      {/* Completed */}
      {completed.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-500 mb-3">Completed Sites</h2>
          <div className="flex flex-col gap-2">
            {completed.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">{site.name}</span>
                <StatusBadge status={site.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Site down modal */}
      <Modal open={!!showSiteDown} onClose={() => setShowSiteDown(null)} title="Report Site Down">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">Site: <strong>{showSiteDown?.name}</strong></p>
          <Select
            label="Reason"
            options={SITE_DOWN_REASONS}
            value={siteDownReason}
            onChange={(e) => setSiteDownReason(e.target.value as SiteDownReason)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowSiteDown(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleSiteDown}>Report Down</Button>
          </div>
        </div>
      </Modal>

      {/* Complete confirmation */}
      <Modal open={!!showComplete} onClose={() => setShowComplete(null)} title="Certify Site Complete">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">Are you sure <strong>{showComplete?.name}</strong> is complete?</p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowComplete(null)}>Cancel</Button>
            <Button color="#0e6b54" onClick={handleComplete}>Certify Complete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

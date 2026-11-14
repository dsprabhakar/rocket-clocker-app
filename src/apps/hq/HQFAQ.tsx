import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

const faqs = [
  { q: 'How do I register a new site?', a: 'Go to Sites → Register Site. Fill in the site name, address, state, assign a supervisor, and set the estimated duration. The site will appear as "Requested" until the supervisor completes the GPS survey.' },
  { q: 'How does the geofence work?', a: 'When a supervisor surveys a site, their GPS coordinates are captured with a 200m radius. Workers must be within this radius to punch in/out. The geofence prevents buddy punching from remote locations.' },
  { q: 'What is the 3-strike rule?', a: 'Workers who receive 3 strikes (flags) are automatically deactivated. Each strike requires a reason and is logged in the audit trail. Strikes can only be issued by supervisors or HQ.' },
  { q: 'How do workers punch in?', a: 'Workers open the app, go to Punch, take a selfie (camera only — no gallery uploads), and the system records their GPS location, time, and device fingerprint. If offline, the punch is queued and synced later.' },
  { q: 'What happens when a site is reported down?', a: 'Supervisors can report a site as down with one of 6 reasons: power failure, local holiday, natural calamity, materials unavailable, tool shortage, or site clearance. Workers assigned to that site are notified.' },
  { q: 'How do I reassign idle workers?', a: 'Go to the Planner tab. Idle workers (not assigned for the selected date) are shown at the top. You can assign them to any active site.' },
  { q: 'How are broadcasts delivered?', a: 'Broadcasts appear on the worker\'s dashboard. You can send text and/or voice messages. Target a specific site or broadcast to all workers.' },
  { q: 'What devices are supported?', a: 'The worker, supervisor, and CEO apps are Android APKs installed via sideloading. HQ, GM, and Superuser apps are web-based and work on any modern browser.' },
  { q: 'How does offline mode work?', a: 'Punches are queued in the device\'s local storage (IndexedDB) when offline. They sync automatically when the device regains connectivity. Offline punches are clearly marked in the history.' },
  { q: 'How do I view the audit log?', a: 'Go to Audit Log. Every action in the system is recorded with timestamp, actor, role, and description. You can search and filter entries.' },
]

export function HQFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h1>

      {faqs.map((faq, i) => (
        <Card key={i}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-start justify-between text-left gap-3">
            <div className="flex items-start gap-2">
              <HelpCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <span className="text-sm font-medium text-slate-900">{faq.q}</span>
            </div>
            {open === i ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
          </button>
          {open === i && (
            <p className="text-sm text-slate-600 mt-3 pl-6">{faq.a}</p>
          )}
        </Card>
      ))}
    </div>
  )
}

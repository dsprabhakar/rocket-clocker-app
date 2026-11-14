import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Volume2, Mic, Square, Play, Trash2, Send } from 'lucide-react'
import { format } from 'date-fns'
import type { Broadcast, Site } from '@/types/database'

export function HQBroadcasts() {
  const { user } = useAuthStore()
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [message, setMessage] = useState('')
  const [targetSite, setTargetSite] = useState('')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  useEffect(() => {
    async function load() {
      const [bcRes, sitesRes] = await Promise.all([
        supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('sites').select('id, name').in('status', ['ready', 'active', 'extended']),
      ])
      if (bcRes.data) setBroadcasts(bcRes.data as Broadcast[])
      if (sitesRes.data) setSites(sitesRes.data as Site[])
    }
    load()
  }, [])

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    chunks.current = []
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data) }
    mr.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      setAudioBlob(blob)
      setAudioUrl(URL.createObjectURL(blob))
      stream.getTracks().forEach((t) => t.stop())
    }
    mr.start()
    mediaRecorder.current = mr
    setRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop()
    setRecording(false)
  }, [])

  const handleSend = useCallback(async () => {
    if (!user || (!message.trim() && !audioBlob)) return
    let audioPath: string | null = null
    if (audioBlob) {
      const path = `broadcasts/${user.id}/${Date.now()}.webm`
      await supabase.storage.from('audio').upload(path, audioBlob, { contentType: 'audio/webm' })
      audioPath = path
    }

    const { data } = await supabase.from('broadcasts').insert({
      sender_id: user.id,
      message: message.trim() || null,
      audio_url: audioPath,
      target_site_id: targetSite || null,
      target_role: 'employee',
    }).select().single()

    if (data) {
      await logAction(user.id, user.role, 'broadcast', `Sent broadcast${targetSite ? ' to site' : ' to all'}`, { broadcastId: data.id })
      setBroadcasts((prev) => [data as Broadcast, ...prev])
    }

    setMessage('')
    setAudioBlob(null)
    setAudioUrl(null)
    setTargetSite('')
  }, [user, message, audioBlob, targetSite])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Broadcasts</h1>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">New Broadcast</h2>
        <div className="flex flex-col gap-3">
          <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Type your message..." />
          <Select label="Target Site (optional)" options={[{ value: '', label: 'All Sites' }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
            value={targetSite} onChange={(e) => setTargetSite(e.target.value)} />

          <div className="flex items-center gap-2">
            {!recording ? (
              <Button size="sm" variant="secondary" icon={<Mic size={14} />} onClick={startRecording}>Record Voice</Button>
            ) : (
              <Button size="sm" variant="danger" icon={<Square size={14} />} onClick={stopRecording}>Stop</Button>
            )}
            {audioUrl && (
              <>
                <audio src={audioUrl} controls className="h-8 flex-1" />
                <button onClick={() => { setAudioBlob(null); setAudioUrl(null) }} className="p-1 text-red-500"><Trash2 size={14} /></button>
              </>
            )}
          </div>

          <Button color="#1d5fa0" icon={<Send size={14} />} onClick={handleSend} disabled={!message.trim() && !audioBlob}>
            Send Broadcast
          </Button>
        </div>
      </Card>

      <h2 className="text-sm font-semibold text-slate-700">Recent Broadcasts</h2>
      {broadcasts.map((bc) => (
        <Card key={bc.id}>
          <div className="flex items-start justify-between mb-2">
            <div className="text-xs text-slate-500">{format(new Date(bc.created_at), 'dd MMM yyyy, h:mm a')}</div>
            {bc.target_site_id && <Badge color="#3b82f6">Site-specific</Badge>}
          </div>
          {bc.message && <p className="text-sm text-slate-700 mb-2">{bc.message}</p>}
          {bc.audio_url && (
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-blue-500" />
              <span className="text-xs text-slate-500">Voice message</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

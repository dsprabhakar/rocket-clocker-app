import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Volume2, Mic, Square, Send } from 'lucide-react'
import { format } from 'date-fns'
import type { Broadcast } from '@/types/database'

export function CEOBroadcasts() {
  const { user } = useAuthStore()
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [message, setMessage] = useState('')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(30)
      if (data) setBroadcasts(data as Broadcast[])
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

  const stopRecording = useCallback(() => { mediaRecorder.current?.stop(); setRecording(false) }, [])

  const handleSend = useCallback(async () => {
    if (!user || (!message.trim() && !audioBlob)) return
    let audioPath: string | null = null
    if (audioBlob) {
      const path = `broadcasts/${user.id}/${Date.now()}.webm`
      await supabase.storage.from('audio').upload(path, audioBlob, { contentType: 'audio/webm' })
      audioPath = path
    }
    const { data } = await supabase.from('broadcasts').insert({
      sender_id: user.id, message: message.trim() || null, audio_url: audioPath, target_role: 'all',
    }).select().single()
    if (data) {
      await logAction(user.id, user.role, 'ceo_broadcast', 'CEO broadcast sent', { broadcastId: data.id })
      setBroadcasts((prev) => [data as Broadcast, ...prev])
    }
    setMessage(''); setAudioBlob(null); setAudioUrl(null)
  }, [user, message, audioBlob])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">CEO Broadcasts</h1>
      <Card>
        <Textarea label="Message to all" value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Address your workforce..." />
        <div className="flex items-center gap-2 mt-3">
          {!recording ? (
            <Button size="sm" variant="secondary" icon={<Mic size={14} />} onClick={startRecording}>Record</Button>
          ) : (
            <Button size="sm" variant="danger" icon={<Square size={14} />} onClick={stopRecording}>Stop</Button>
          )}
          {audioUrl && <audio src={audioUrl} controls className="h-8 flex-1" />}
          <Button color="#5340a8" icon={<Send size={14} />} onClick={handleSend} disabled={!message.trim() && !audioBlob}>Send</Button>
        </div>
      </Card>
      {broadcasts.map((bc) => (
        <Card key={bc.id}>
          <div className="text-xs text-slate-500 mb-1">{format(new Date(bc.created_at), 'dd MMM yyyy, h:mm a')}</div>
          {bc.message && <p className="text-sm text-slate-700">{bc.message}</p>}
          {bc.audio_url && <div className="flex items-center gap-1 text-xs text-purple-600 mt-1"><Volume2 size={12} /> Voice</div>}
        </Card>
      ))}
    </div>
  )
}

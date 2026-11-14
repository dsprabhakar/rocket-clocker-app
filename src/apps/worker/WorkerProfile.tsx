import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CameraCapture } from '@/components/shared/CameraCapture'
import { Badge } from '@/components/ui/Badge'
import { User, Star, Flag, Camera, Globe, Shield } from 'lucide-react'
import type { Star as StarType, Strike } from '@/types/database'
import { useEffect } from 'react'
import { format } from 'date-fns'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'hi', label: 'हिंदी (Hindi)' },
  { value: 'ml', label: 'മലയാളം (Malayalam)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
]

export function WorkerProfile() {
  const { user, fetchProfile } = useAuthStore()
  const [showCamera, setShowCamera] = useState(false)
  const [stars, setStars] = useState<StarType[]>([])
  const [strikes, setStrikes] = useState<Strike[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: s } = await supabase.from('stars').select('*, awarder:profiles!awarded_by(full_name)').eq('employee_id', user!.id).order('created_at', { ascending: false })
      if (s) setStars(s as any)
      const { data: st } = await supabase.from('strikes').select('*, issuer:profiles!issued_by(full_name)').eq('employee_id', user!.id).order('created_at', { ascending: false })
      if (st) setStrikes(st as any)
    }
    load()
  }, [user])

  async function handlePhotoCapture(blob: Blob) {
    if (!user) return
    setUploading(true)
    const fileName = `profiles/${user.id}/photo_${Date.now()}.jpg`
    await supabase.storage.from('profiles').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })
    const url = supabase.storage.from('profiles').getPublicUrl(fileName).data.publicUrl
    await supabase.from('profiles').update({ profile_photo_url: url }).eq('id', user.id)
    await fetchProfile()
    setShowCamera(false)
    setUploading(false)
  }

  async function handleLanguageChange(lang: string) {
    if (!user) return
    await supabase.from('profiles').update({ language: lang }).eq('id', user.id)
    await fetchProfile()
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Profile</h1>

      {/* Profile card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.photo_url ? (
              <img src={user.photo_url} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <User size={32} className="text-amber-600" />
              </div>
            )}
            <button
              onClick={() => setShowCamera(true)}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md"
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{user.full_name}</h2>
            <p className="text-sm text-slate-500">{user.phone}</p>
            {user.skill && <Badge color="#c27b0a">{user.skill}</Badge>}
          </div>
        </div>
      </Card>

      {/* Performance */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Performance</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-amber-50">
            <Star size={24} className="text-amber-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-slate-900">{user.star_count}</div>
            <div className="text-xs text-slate-500">Stars earned</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50">
            <Flag size={24} className="text-red-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-slate-900">{user.strike_count}</div>
            <div className="text-xs text-slate-500">Strikes</div>
          </div>
        </div>

        {/* Star history */}
        {stars.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-slate-500 mb-2">Stars</h4>
            {stars.map((s) => (
              <div key={s.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                <Star size={14} className="text-amber-500" />
                <span className="text-sm text-slate-700 flex-1">{s.reason}</span>
                <span className="text-xs text-slate-400">{format(new Date(s.created_at), 'MMM d')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Strike history */}
        {strikes.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-slate-500 mb-2">Strikes</h4>
            {strikes.map((s) => (
              <div key={s.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                <Flag size={14} className="text-red-500" />
                <span className="text-sm text-slate-700 flex-1">{s.reason}</span>
                <span className="text-xs text-slate-400">{format(new Date(s.created_at), 'MMM d')}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Language */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Globe size={16} />
          Language
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value)}
              className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                user.language === lang.value ? 'bg-amber-100 text-amber-800 font-medium' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Device info */}
      <Card>
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-slate-400" />
          <div>
            <div className="text-sm font-medium text-slate-700">Device Binding</div>
            <div className="text-xs text-slate-400 truncate">{user.device_id || 'Not yet bound'}</div>
          </div>
        </div>
      </Card>

      {showCamera && (
        <CameraCapture
          title="Profile Photo"
          onCapture={handlePhotoCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  )
}

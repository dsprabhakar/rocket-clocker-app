import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { Rocket, Loader2 } from 'lucide-react'

const ROLE_ROUTES: Record<string, string> = {
  employee: '/worker',
  supervisor: '/supervisor',
  hq: '/hq',
  gm: '/gm',
  ceo: '/ceo',
  superuser: '/superuser',
}

export function AuthCallback() {
  const navigate = useNavigate()
  const { fetchProfile, setUser } = useAuthStore()
  const [error, setError] = useState('')

  useEffect(() => {
    async function handleCallback() {
      const { data, error: authError } = await supabase.auth.getSession()

      if (authError) {
        setError(authError.message)
        return
      }

      if (data.session) {
        useAuthStore.setState({ session: true })
        await fetchProfile()
        const profile = useAuthStore.getState().user
        if (profile) {
          navigate(ROLE_ROUTES[profile.role] || '/superuser', { replace: true })
        } else {
          setError('No profile found. Contact your admin.')
        }
      } else {
        setError('Sign-in link expired or invalid. Please try again.')
      }
    }

    handleCallback()
  }, [navigate, fetchProfile, setUser])

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Rocket className="text-white" size={32} />
        </div>
        {error ? (
          <>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to login
            </button>
          </>
        ) : (
          <>
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
            <p className="text-slate-600">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  )
}

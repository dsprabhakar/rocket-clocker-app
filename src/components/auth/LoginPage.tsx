import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Rocket, Mail } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { login, loading, user } = useAuthStore()
  const navigate = useNavigate()

  if (user) {
    const routes: Record<string, string> = {
      employee: '/worker',
      supervisor: '/supervisor',
      hq: '/hq',
      gm: '/gm',
      ceo: '/ceo',
      superuser: '/superuser',
    }
    navigate(routes[user.role] || '/')
    return null
  }

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = await login(email)
    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Rocket className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Rocket Clocker</h1>
          <p className="text-sm text-slate-500 mt-1">RAYAL Constructions</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {!sent ? (
            <form onSubmit={handleSendLink} className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
              <p className="text-sm text-slate-500">Enter your RAYAL email to receive a sign-in link.</p>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@rayal.com"
                required
                autoFocus
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">
                Send Sign-in Link
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="text-green-600" size={28} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
              <p className="text-sm text-slate-500 text-center">
                We sent a sign-in link to<br />
                <strong>{email}</strong>
              </p>
              <p className="text-xs text-slate-400 text-center">
                Click the link in the email to sign in. It expires in 1 hour.
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setError('') }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

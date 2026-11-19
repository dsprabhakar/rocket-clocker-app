import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Rocket, Mail, Users } from 'lucide-react'

const DEMO_USERS = [
  { email: 'rayaldemohq@gmail.com', name: 'Prem', role: 'HQ Admin', color: '#1d5fa0' },
  { email: 'rayaldemogm@gmail.com', name: 'Suresh', role: 'General Manager', color: '#2563eb' },
  { email: 'ceorayal@gmail.com', name: 'Rajendran', role: 'CEO', color: '#5340a8' },
  { email: 'demo.sup1@rocket.demo', name: 'Ravi Teja', role: 'Supervisor', color: '#0e6b54' },
  { email: 'demo.sup2@rocket.demo', name: 'Lakshmi Devi', role: 'Supervisor', color: '#0e6b54' },
  { email: 'demo.worker1@rocket.demo', name: 'Srinivas Rao', role: 'Worker — Mason', color: '#c27b0a' },
  { email: 'demo.worker2@rocket.demo', name: 'Ramesh Babu', role: 'Worker — Carpenter', color: '#c27b0a' },
  { email: 'demo.worker3@rocket.demo', name: 'Anjali Kumari', role: 'Worker — Electrician', color: '#c27b0a' },
]

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const { login, demoLogin, loading, user } = useAuthStore()
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

  async function handleDemoLogin(demoEmail: string) {
    setError('')
    const result = await demoLogin(demoEmail, 'demo123')
    if (result.error) {
      setError(result.error)
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
          {showDemo ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Demo Login</h2>
                <button
                  type="button"
                  onClick={() => { setShowDemo(false); setError('') }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Back
                </button>
              </div>
              <p className="text-sm text-slate-500">Tap your name to sign in:</p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex flex-col gap-2">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin(u.email)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 text-sm">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : !sent ? (
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
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or</span></div>
              </div>
              <button
                type="button"
                onClick={() => { setShowDemo(true); setError('') }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-orange-300 text-orange-600 font-medium text-sm hover:bg-orange-50 transition-colors"
              >
                <Users size={18} />
                Demo Login
              </button>
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

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Profile, Role } from '@/types/database'

interface AuthState {
  user: Profile | null
  session: boolean
  loading: boolean
  setUser: (user: Profile | null) => void
  login: (email: string) => Promise<{ error: string | null }>
  demoLogin: (email: string, password: string) => Promise<{ error: string | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: false,
      loading: false,

      setUser: (user) => set({ user }),

      login: async (email: string) => {
        set({ loading: true })
        const redirectTo = `${window.location.origin}/auth/callback`
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
        set({ loading: false })
        if (error) return { error: error.message }
        return { error: null }
      },

      demoLogin: async (email: string, password: string) => {
        set({ loading: true })
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          set({ loading: false })
          return { error: error.message }
        }
        set({ session: true })
        await get().fetchProfile()
        set({ loading: false })
        return { error: null }
      },

      verifyOtp: async (email: string, token: string) => {
        set({ loading: true })
        const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
        set({ loading: false })
        if (error) return { error: error.message }
        set({ session: true })
        await get().fetchProfile()
        return { error: null }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: false })
      },

      fetchProfile: async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile) set({ user: profile as Profile })
      },
    }),
    {
      name: 'rocket-clocker-auth',
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
)

export function getRoleColor(role: Role): string {
  const colors: Record<Role, string> = {
    employee: '#c27b0a',
    supervisor: '#0e6b54',
    hq: '#1d5fa0',
    gm: '#2563eb',
    ceo: '#5340a8',
    superuser: '#7c3aed',
  }
  return colors[role]
}

export function getRoleBgColor(role: Role): string {
  const colors: Record<Role, string> = {
    employee: '#faf0d8',
    supervisor: '#e2f3ec',
    hq: '#e8f0fa',
    gm: '#dbeafe',
    ceo: '#eee9fc',
    superuser: '#ede9fe',
  }
  return colors[role]
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    employee: 'Employee',
    supervisor: 'Supervisor',
    hq: 'HQ Admin',
    gm: 'General Manager',
    ceo: 'CEO',
    superuser: 'Superuser',
  }
  return labels[role]
}

export function getRoleBadge(role: Role): string {
  const badges: Record<Role, string> = {
    employee: 'E',
    supervisor: 'S',
    hq: 'H',
    gm: 'G',
    ceo: 'C',
    superuser: 'SU',
  }
  return badges[role]
}

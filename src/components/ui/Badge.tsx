import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: string
  bg?: string
  size?: 'sm' | 'md'
}

export function Badge({ children, color = '#1d5fa0', bg, size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass}`}
      style={{ color, background: bg || color + '15' }}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    requested: { color: '#f59e0b', bg: '#fef3c7', label: 'Requested' },
    ready: { color: '#3b82f6', bg: '#dbeafe', label: 'Ready' },
    active: { color: '#10b981', bg: '#d1fae5', label: 'Active' },
    extended: { color: '#f97316', bg: '#ffedd5', label: 'Extended' },
    completed: { color: '#6b7280', bg: '#f3f4f6', label: 'Completed' },
    abandoned: { color: '#ef4444', bg: '#fee2e2', label: 'Abandoned' },
    pending: { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
    confirmed: { color: '#10b981', bg: '#d1fae5', label: 'Confirmed' },
    cancelled: { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' },
    strike_issued: { color: '#ef4444', bg: '#fee2e2', label: 'Strike Issued' },
    dismissed: { color: '#6b7280', bg: '#f3f4f6', label: 'Dismissed' },
    quit: { color: '#ef4444', bg: '#fee2e2', label: 'Quit' },
    blacklisted: { color: '#7f1d1d', bg: '#fee2e2', label: 'Blacklisted' },
    reinstated: { color: '#10b981', bg: '#d1fae5', label: 'Reinstated' },
  }
  const c = config[status] || { color: '#6b7280', bg: '#f3f4f6', label: status }
  return <Badge color={c.color} bg={c.bg}>{c.label}</Badge>
}

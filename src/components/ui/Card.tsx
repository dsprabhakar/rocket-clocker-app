import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-4 ${onClick ? 'cursor-pointer hover:border-slate-300 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  color?: string
  subtitle?: string
  onClick?: () => void
}

export function StatCard({ label, value, icon, color = '#1d5fa0', subtitle, onClick }: StatCardProps) {
  return (
    <Card onClick={onClick} className="flex items-start gap-3">
      {icon && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: color + '15', color }}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
      </div>
    </Card>
  )
}

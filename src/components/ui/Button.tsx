import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
  color?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  icon,
  color,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantClasses = {
    primary: 'text-white shadow-sm hover:opacity-90',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }

  const bgStyle = variant === 'primary' && color ? { background: color } : variant === 'primary' ? { background: '#1d5fa0' } : {}

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      style={bgStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  )
}

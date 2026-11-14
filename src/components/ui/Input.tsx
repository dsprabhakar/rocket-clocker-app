import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input
      ref={ref}
      className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
      } ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
))

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  error?: string
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={`w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        className={`w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  onClick?: () => void
}

export function Button({ children, variant = 'primary', className = '', onClick }: ButtonProps) {
  const base = 'px-6 py-3 rounded-lg font-bold transition-all active:scale-95'

  const variants = {
    primary: `${base} bg-gradient-primary text-on-primary shadow-[0_0_20px_rgba(223,183,255,0.3)] hover:shadow-[0_0_25px_rgba(223,183,255,0.5)]`,
    secondary: `${base} border border-outline-variant hover:bg-surface-bright text-on-surface`,
    ghost: `${base} text-primary-fixed`,
  }

  return (
    <button className={`${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}

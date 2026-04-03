import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'red' | 'green' | 'ghost'
  size?: 'sm' | 'md'
  isLoading?: boolean
}

const variants = {
  red: 'bg-brand-red hover:bg-red-500 text-white',
  green: 'bg-brand-green hover:bg-green-400 text-dark font-semibold',
  ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white ring-1 ring-white/10',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

export function Button({
  children,
  variant = 'red',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  )
}

import logoFull from '@/assets/logo-full.svg'
import logoIcon from '@/assets/logo-icon.svg'

interface LogoProps {
  className?: string
  variant?: 'full' | 'icon'
}

export function Logo({ className = 'h-7 w-auto', variant = 'full' }: LogoProps) {
  return <img src={variant === 'icon' ? logoIcon : logoFull} alt="Pizzaria" className={className} />
}

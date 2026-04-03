import logoSvg from '@/assets/Logo.svg'

interface LogoProps {
  className?: string
}

export function Logo({ className = 'h-7 w-auto' }: LogoProps) {
  return <img src={logoSvg} alt="Sujeito Pizza" className={className} />
}

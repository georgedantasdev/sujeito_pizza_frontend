import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: boolean
  className?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Selecione…',
  error,
  className = '',
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-md bg-dark-200 px-3 py-2.5 text-left text-sm outline-none ring-1 transition ${
          error ? 'ring-red-500' : open ? 'ring-brand-red' : 'ring-white/10'
        } ${selected ? 'text-white' : 'text-white/30'}`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown
          size={14}
          className={`ml-2 shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-[70] mt-1 max-h-48 overflow-y-auto rounded-md border border-white/10 bg-dark-200 py-1 shadow-2xl">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${
                opt.value === value ? 'text-brand-green' : 'text-white'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check size={13} className="ml-2 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

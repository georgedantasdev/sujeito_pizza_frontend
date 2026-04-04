import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

export interface AlertOptions {
  title: string
  description?: string
}

interface ModalState {
  type: 'confirm' | 'success' | 'error'
  options: ConfirmOptions | AlertOptions
}

interface ModalContextData {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  success: (options: AlertOptions) => void
  error: (options: AlertOptions) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ModalContext = createContext<ModalContextData>({} as ModalContextData)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  // Animate in on mount
  useEffect(() => {
    if (modal) {
      requestAnimationFrame(() => setIsVisible(true))
    }
  }, [modal])

  // Lock body scroll
  useEffect(() => {
    if (modal) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [modal])

  // Keyboard: Escape to cancel
  useEffect(() => {
    if (!modal) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [modal])

  function handleClose(value: boolean) {
    setIsVisible(false)
    setTimeout(() => {
      setModal(null)
      resolveRef.current?.(value)
      resolveRef.current = null
    }, 200)
  }

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setModal({ type: 'confirm', options })
    })
  }, [])

  const success = useCallback((options: AlertOptions) => {
    resolveRef.current = null
    setModal({ type: 'success', options })
  }, [])

  const error = useCallback((options: AlertOptions) => {
    resolveRef.current = null
    setModal({ type: 'error', options })
  }, [])

  return (
    <ModalContext.Provider value={{ confirm, success, error }}>
      {children}
      {modal && (
        <ModalView
          modal={modal}
          isVisible={isVisible}
          onClose={handleClose}
        />
      )}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) throw new Error('useModal must be used within ModalProvider')
  return context
}

// ─── Modal UI ─────────────────────────────────────────────────────────────────

const typeConfig = {
  confirm: {
    Icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-400/10',
  },
  success: {
    Icon: CheckCircle2,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-400/10',
  },
  error: {
    Icon: XCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-400/10',
  },
}

interface ModalViewProps {
  modal: ModalState
  isVisible: boolean
  onClose: (value: boolean) => void
}

function ModalView({ modal, isVisible, onClose }: ModalViewProps) {
  const { type, options } = modal
  const { Icon, iconColor, iconBg } = typeConfig[type]
  const isConfirm = type === 'confirm'
  const confirmOpts = options as ConfirmOptions
  const variant = isConfirm ? (confirmOpts.variant ?? 'danger') : 'default'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: isVisible ? 1 : 0 }}
        onClick={() => onClose(false)}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-xl border border-white/10 bg-dark-100 p-6 shadow-2xl transition-all duration-200"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible
            ? 'scale(1) translateY(0)'
            : 'scale(0.96) translateY(12px)',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => onClose(false)}
          className="absolute right-4 top-4 rounded-md p-1 text-white/30 transition-colors hover:text-white/60"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={24} className={iconColor} />
        </div>

        {/* Title */}
        <h2 id="modal-title" className="mb-1 text-lg font-semibold text-white">
          {options.title}
        </h2>

        {/* Description */}
        {options.description && (
          <p className="mb-6 text-sm leading-relaxed text-white/50">
            {options.description}
          </p>
        )}

        <div className={options.description ? '' : 'mt-6'} />

        {/* Actions */}
        {isConfirm ? (
          <div className="flex gap-3">
            <button
              onClick={() => onClose(false)}
              className="flex-1 rounded-md bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
            >
              {confirmOpts.cancelLabel ?? 'Cancelar'}
            </button>
            <button
              onClick={() => onClose(true)}
              className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                variant === 'danger'
                  ? 'bg-brand-red text-white hover:bg-red-600'
                  : 'bg-brand-green font-semibold text-dark hover:bg-green-400'
              }`}
            >
              {confirmOpts.confirmLabel ?? 'Confirmar'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => onClose(true)}
            className={`w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              type === 'success'
                ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
            }`}
          >
            {type === 'success' ? 'Ótimo!' : 'Entendi'}
          </button>
        )}
      </div>
    </div>
  )
}

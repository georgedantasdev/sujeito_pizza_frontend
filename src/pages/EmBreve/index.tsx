import { useNavigate } from 'react-router-dom'
import { Clock, LogOut } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/Button'
import { useAuth } from '@/contexts/AuthContext'

export function EmBreve() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-10 flex justify-center">
          <Logo className="h-10 w-auto" />
        </div>

        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dark-100 ring-1 ring-white/10">
            <Clock size={36} className="text-brand-red" />
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-white">Em breve</h1>
        <p className="mb-2 text-white/50">
          O painel do administrador está em desenvolvimento.
        </p>
        <p className="text-sm text-white/30">
          Em breve você poderá gerenciar seu cardápio, pedidos e muito mais.
        </p>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="mb-4 text-sm text-white/40">
            Conectado como <span className="text-white/70">{user?.email}</span>
          </p>
          <Button variant="ghost" onClick={handleSignOut} className="mx-auto">
            <LogOut size={16} />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  )
}

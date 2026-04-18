import { Link } from 'react-router-dom'
import { Bike, Table2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function EmployeeHome() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white">
          Olá, {user?.name?.split(' ')[0] ?? 'funcionário'}!
        </h1>
        <p className="mt-2 text-white/50">O que você vai gerenciar agora?</p>
      </div>

      <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/mesas"
          className="group flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-dark-100 p-8 text-center transition-all hover:border-blue-400/30 hover:bg-dark-200"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 transition-colors group-hover:bg-blue-500/25">
            <Table2 size={32} />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Mesas</p>
            <p className="mt-1 text-sm text-white/40">Gerenciar mesas e pedidos</p>
          </div>
        </Link>

        <Link
          to="/delivery"
          className="group flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-dark-100 p-8 text-center transition-all hover:border-brand-green/30 hover:bg-dark-200"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-green/15 text-brand-green transition-colors group-hover:bg-brand-green/25">
            <Bike size={32} />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Delivery</p>
            <p className="mt-1 text-sm text-white/40">Gerenciar entregas</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

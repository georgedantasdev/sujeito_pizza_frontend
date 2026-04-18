import { Bike, Pizza, Table2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/products'
import { useTables } from '@/hooks/tables'
import { useDeliveries } from '@/hooks/delivery'
import { useUsers } from '@/hooks/users'

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ElementType
  to: string
  color: string
}

function StatCard({ label, value, icon: Icon, to, color }: StatCardProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-dark-100 p-5 transition-colors hover:border-white/20 hover:bg-dark-200"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-white/50">{label}</p>
      </div>
    </Link>
  )
}

export function AdminDashboard() {
  const { data: products = [] } = useProducts()
  const { data: tables = [] } = useTables()
  const { data: activeDeliveries = [] } = useDeliveries('PREPARING')
  const { data: users = [] } = useUsers()

  const activeProducts = products.filter((p) => p.available).length
  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length
  const employees = users.filter((u) => u.role === 'EMPLOYEE').length

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/50">Visão geral da sua pizzaria</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Produtos ativos"
          value={activeProducts}
          icon={Pizza}
          to="/admin/produtos"
          color="bg-brand-red/15 text-brand-red"
        />
        <StatCard
          label="Mesas ocupadas"
          value={occupiedTables}
          icon={Table2}
          to="/admin/mesas"
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          label="Entregas em preparo"
          value={activeDeliveries.length}
          icon={Bike}
          to="/admin/delivery"
          color="bg-yellow-500/15 text-yellow-400"
        />
        <StatCard
          label="Funcionários"
          value={employees}
          icon={Users}
          to="/admin/funcionarios"
          color="bg-brand-green/15 text-brand-green"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentDeliveries />
        <OccupiedTables />
      </div>
    </div>
  )
}

function RecentDeliveries() {
  const { data: deliveries = [], isLoading } = useDeliveries()

  const recent = deliveries.slice(0, 5)

  const statusLabel: Record<string, string> = {
    PREPARING: 'Em preparo',
    READY: 'Pronto',
    DELIVERED: 'Entregue',
    CANCELLED: 'Cancelado',
  }

  const statusColor: Record<string, string> = {
    PREPARING: 'text-yellow-400 bg-yellow-400/10',
    READY: 'text-brand-green bg-brand-green/10',
    DELIVERED: 'text-white/40 bg-white/5',
    CANCELLED: 'text-red-400 bg-red-400/10',
  }

  return (
    <div className="rounded-xl border border-white/10 bg-dark-100 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-white">Entregas recentes</h2>
        <Link to="/admin/delivery" className="text-xs text-brand-red hover:underline">
          Ver todas
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-dark-200" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/30">Nenhuma entrega ainda.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((delivery) => (
            <Link
              key={delivery.id}
              to={`/admin/delivery/${delivery.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-dark-200"
            >
              <div>
                <span className="text-sm font-medium text-white">{delivery.customerName}</span>
                <span className="ml-2 text-xs text-white/40">
                  {delivery.items.length} {delivery.items.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[delivery.status]}`}>
                {statusLabel[delivery.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function OccupiedTables() {
  const { data: tables = [], isLoading } = useTables()

  const occupied = tables.filter((t) => t.status === 'OCCUPIED')

  return (
    <div className="rounded-xl border border-white/10 bg-dark-100 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-white">Mesas ocupadas</h2>
        <Link to="/admin/mesas" className="text-xs text-brand-red hover:underline">
          Ver todas
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-dark-200" />
          ))}
        </div>
      ) : occupied.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/30">Nenhuma mesa ocupada.</p>
      ) : (
        <div className="space-y-2">
          {occupied.map((table) => (
            <Link
              key={table.id}
              to={`/admin/mesas/${table.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-dark-200"
            >
              <span className="text-sm font-medium text-white">Mesa {table.number}</span>
              <span className="rounded-full bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                Ocupada
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

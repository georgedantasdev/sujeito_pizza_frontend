import { Pizza, ShoppingBag, Table2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/products'
import { useTables } from '@/hooks/tables'
import { useOrders } from '@/hooks/orders'
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
  const { data: openOrders = [] } = useOrders('OPEN')
  const { data: inProgressOrders = [] } = useOrders('IN_PROGRESS')
  const { data: users = [] } = useUsers()

  const activeProducts = products.filter((p) => p.available).length
  const pendingOrders = openOrders.length + inProgressOrders.length
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
          label="Mesas cadastradas"
          value={tables.length}
          icon={Table2}
          to="/admin/mesas"
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          label="Pedidos em aberto"
          value={pendingOrders}
          icon={ShoppingBag}
          to="/admin/pedidos"
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
        {/* Pedidos recentes */}
        <RecentOrders />
        {/* Status dos pedidos */}
        <OrderStatusSummary />
      </div>
    </div>
  )
}

function RecentOrders() {
  const { data: orders = [], isLoading } = useOrders()

  const recent = orders.slice(0, 5)

  const statusLabel: Record<string, string> = {
    OPEN: 'Aberto',
    IN_PROGRESS: 'Em preparo',
    READY: 'Pronto',
    DELIVERED: 'Entregue',
    CANCELLED: 'Cancelado',
  }

  const statusColor: Record<string, string> = {
    OPEN: 'text-yellow-400 bg-yellow-400/10',
    IN_PROGRESS: 'text-blue-400 bg-blue-400/10',
    READY: 'text-brand-green bg-brand-green/10',
    DELIVERED: 'text-white/40 bg-white/5',
    CANCELLED: 'text-red-400 bg-red-400/10',
  }

  return (
    <div className="rounded-xl border border-white/10 bg-dark-100 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-white">Pedidos recentes</h2>
        <Link to="/admin/pedidos" className="text-xs text-brand-red hover:underline">
          Ver todos
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-dark-200" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/30">Nenhum pedido ainda.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((order) => (
            <Link
              key={order.id}
              to={`/admin/pedidos/${order.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-dark-200"
            >
              <div>
                <span className="text-sm font-medium text-white">
                  Mesa {order.table.number}
                </span>
                <span className="ml-2 text-xs text-white/40">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[order.status]}`}
              >
                {statusLabel[order.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function OrderStatusSummary() {
  const { data: open = [] } = useOrders('OPEN')
  const { data: inProgress = [] } = useOrders('IN_PROGRESS')
  const { data: ready = [] } = useOrders('READY')
  const { data: delivered = [] } = useOrders('DELIVERED')
  const { data: cancelled = [] } = useOrders('CANCELLED')

  const rows = [
    { label: 'Abertos', count: open.length, color: 'bg-yellow-400' },
    { label: 'Em preparo', count: inProgress.length, color: 'bg-blue-400' },
    { label: 'Prontos', count: ready.length, color: 'bg-brand-green' },
    { label: 'Entregues', count: delivered.length, color: 'bg-white/20' },
    { label: 'Cancelados', count: cancelled.length, color: 'bg-red-400' },
  ]

  return (
    <div className="rounded-xl border border-white/10 bg-dark-100 p-6">
      <h2 className="mb-4 font-semibold text-white">Status dos pedidos</h2>
      <div className="space-y-3">
        {rows.map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span className="flex-1 text-sm text-white/70">{label}</span>
            <span className="text-sm font-semibold text-white">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/Button'
import { useOrders } from '@/hooks/orders'
import type { OrderStatus } from '@/hooks/orders'

const statusOptions: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'OPEN', label: 'Abertos' },
  { value: 'IN_PROGRESS', label: 'Em preparo' },
  { value: 'READY', label: 'Prontos' },
  { value: 'DELIVERED', label: 'Entregues' },
  { value: 'CANCELLED', label: 'Cancelados' },
]

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

const paymentLabel: Record<string, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  PIX: 'PIX',
}

export function AdminPedidos() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  const { data: orders = [], isLoading, isError } = useOrders(selectedStatus || undefined)

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Pedidos</h1>
        <p className="mt-1 text-sm text-white/50">Acompanhe todos os pedidos da pizzaria</p>
      </div>

      {/* Status filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedStatus(opt.value as OrderStatus | '')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedStatus === opt.value
                ? 'bg-brand-red text-white'
                : 'bg-dark-100 text-white/50 hover:bg-dark-200 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isError && (
        <div className="mb-6 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Não foi possível carregar os pedidos.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-dark-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 py-20 text-center">
          <p className="text-white/40">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-dark-100">
                <th className="px-6 py-3 text-left font-medium text-white/50">Mesa</th>
                <th className="px-6 py-3 text-left font-medium text-white/50">Atendente</th>
                <th className="px-6 py-3 text-left font-medium text-white/50">Itens</th>
                <th className="px-6 py-3 text-left font-medium text-white/50">Total</th>
                <th className="px-6 py-3 text-left font-medium text-white/50">Status</th>
                <th className="px-6 py-3 text-left font-medium text-white/50">Pagamento</th>
                <th className="px-6 py-3 text-right font-medium text-white/50">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr
                  key={order.id}
                  className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                    i === orders.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-white">Mesa {order.table.number}</td>
                  <td className="px-6 py-4 text-white/50">{order.user.name}</td>
                  <td className="px-6 py-4 text-white/50">{order.items.length}</td>
                  <td className="px-6 py-4 text-white/70">
                    {Number(order.totalPrice).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[order.status]}`}
                    >
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.paid ? (
                      <span className="text-xs text-brand-green">
                        {paymentLabel[order.paymentMethod!]}
                      </span>
                    ) : (
                      <span className="text-xs text-white/30">Pendente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/admin/pedidos/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye size={14} />
                        Detalhes
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

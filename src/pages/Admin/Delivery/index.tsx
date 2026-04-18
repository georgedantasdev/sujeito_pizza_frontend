import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Eye, Plus } from 'lucide-react'
import { Button } from '@/components/Button'
import { useDeliveries } from '@/hooks/delivery'
import type { DeliveryStatus } from '@/hooks/delivery'

const statusOptions: { value: DeliveryStatus | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'PREPARING', label: 'Em preparo' },
  { value: 'READY', label: 'Prontas' },
  { value: 'DELIVERED', label: 'Entregues' },
  { value: 'CANCELLED', label: 'Canceladas' },
]

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

const paymentLabel: Record<string, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  PIX: 'PIX',
}

export function AdminDelivery() {
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus | ''>('')
  const { data: deliveries = [], isLoading, isError } = useDeliveries(selectedStatus || undefined)
  const location = useLocation()
  const base = location.pathname.startsWith('/admin') ? '/admin/delivery' : '/delivery'

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery</h1>
          <p className="mt-1 text-sm text-white/50">Gerencie as entregas da pizzaria</p>
        </div>
        <Link to={`${base}/novo`}>
          <Button variant="green">
            <Plus size={16} />
            Nova entrega
          </Button>
        </Link>
      </div>

      {/* Filtro de status */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedStatus(opt.value as DeliveryStatus | '')}
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
          Não foi possível carregar as entregas.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-dark-100" />
          ))}
        </div>
      ) : deliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-20 text-center">
          <p className="text-white/40">Nenhuma entrega encontrada.</p>
          <p className="text-xs text-white/30">Clique em "Nova entrega" para começar.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-4 sm:hidden">
            {deliveries.map((delivery) => (
              <Link key={delivery.id} to={`${base}/${delivery.id}`} className="block">
                <div className="rounded-xl border border-white/10 bg-dark-100 p-4 transition-colors hover:border-white/20 hover:bg-dark-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{delivery.customerName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[delivery.status]}`}>
                          {statusLabel[delivery.status]}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-white/40">{delivery.user.name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-white">
                        {Number(delivery.totalPrice).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                      <p className={`mt-0.5 text-xs ${delivery.paidAt ? 'text-brand-green' : 'text-white/30'}`}>
                        {delivery.paidAt ? paymentLabel[delivery.paymentMethod!] : 'Não pago'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-xs text-white/30">
                      {delivery.items.length} {delivery.items.length === 1 ? 'item' : 'itens'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Eye size={12} />
                      Ver detalhes
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden overflow-hidden rounded-xl border border-white/10 sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-dark-100">
                  <th className="px-6 py-3 text-left font-medium text-white/50">Cliente</th>
                  <th className="px-6 py-3 text-left font-medium text-white/50">Atendente</th>
                  <th className="px-6 py-3 text-left font-medium text-white/50">Itens</th>
                  <th className="px-6 py-3 text-left font-medium text-white/50">Total</th>
                  <th className="px-6 py-3 text-left font-medium text-white/50">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-white/50">Pagamento</th>
                  <th className="px-6 py-3 text-right font-medium text-white/50">Ações</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery, i) => (
                  <tr
                    key={delivery.id}
                    className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                      i === deliveries.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-white">{delivery.customerName}</td>
                    <td className="px-6 py-4 text-white/50">{delivery.user.name}</td>
                    <td className="px-6 py-4 text-white/50">{delivery.items.length}</td>
                    <td className="px-6 py-4 text-white/70">
                      {Number(delivery.totalPrice).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[delivery.status]}`}>
                        {statusLabel[delivery.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {delivery.paidAt ? (
                        <span className="text-xs text-brand-green">{paymentLabel[delivery.paymentMethod!]}</span>
                      ) : (
                        <span className="text-xs text-white/30">Não pago</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`${base}/${delivery.id}`}>
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
        </>
      )}
    </div>
  )
}

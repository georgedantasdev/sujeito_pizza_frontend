import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import { useOrder, useUpdateOrderStatus, useProcessPayment } from '@/hooks/orders'
import type { OrderStatus, PaymentMethod } from '@/hooks/orders'
import { useModal } from '@/contexts/ModalContext'

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

const statusFlow: Record<string, OrderStatus | null> = {
  OPEN: 'IN_PROGRESS',
  IN_PROGRESS: 'READY',
  READY: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null,
}

const nextStatusLabel: Record<string, string> = {
  OPEN: 'Iniciar preparo',
  IN_PROGRESS: 'Marcar como pronto',
  READY: 'Confirmar entrega',
}

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'CREDIT_CARD', label: 'Cartão de crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de débito' },
  { value: 'PIX', label: 'PIX' },
]

const paymentLabel: Record<string, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  PIX: 'PIX',
}

interface PaymentFormData {
  paymentMethod: PaymentMethod
  discount: string
}

export function DetalhesPedido() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useOrder(id!)
  const updateStatus = useUpdateOrderStatus(id!)
  const processPayment = useProcessPayment(id!)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const modal = useModal()
  const { register, handleSubmit } = useForm<PaymentFormData>({
    defaultValues: { paymentMethod: 'CASH', discount: '' },
  })

  function handleAdvanceStatus() {
    if (!order) return
    const next = statusFlow[order.status]
    if (!next) return
    updateStatus.mutate({ status: next })
  }

  async function handleCancel() {
    const ok = await modal.confirm({
      title: 'Cancelar pedido?',
      description: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Cancelar pedido',
      variant: 'danger',
    })
    if (!ok) return
    updateStatus.mutate({ status: 'CANCELLED' })
  }

  function onPaymentSubmit({ paymentMethod, discount }: PaymentFormData) {
    processPayment.mutate(
      { paymentMethod, discount: discount || undefined },
      { onSuccess: () => setShowPaymentForm(false) },
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="space-y-4 max-w-2xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-dark-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-white/50">Pedido não encontrado.</p>
      </div>
    )
  }

  const nextStatus = statusFlow[order.status]
  const canCancel = order.status === 'OPEN' || order.status === 'IN_PROGRESS'

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <Link
          to="/admin/pedidos"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ChevronLeft size={16} />
          Voltar para pedidos
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Mesa {order.table.number}</h1>
            <p className="mt-1 text-sm text-white/50">
              Atendido por {order.user.name} &middot;{' '}
              {new Date(order.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor[order.status]}`}>
            {statusLabel[order.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/10 bg-dark-100">
            <div className="border-b border-white/10 px-6 py-4">
              <h2 className="font-semibold text-white">Itens do pedido</h2>
            </div>
            {order.items.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-white/30">
                Nenhum item no pedido.
              </p>
            ) : (
              <div className="divide-y divide-white/5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-white">
                        {item.quantity}x {item.product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-white/40">
                        {[item.size?.name, item.flavor?.name].filter(Boolean).join(' · ')}
                      </p>
                      {item.note && (
                        <p className="mt-1 text-xs italic text-white/30">Obs: {item.note}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm text-white/70">
                      {(Number(item.price) * item.quantity).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {order.note && (
              <div className="border-t border-white/10 px-6 py-4">
                <p className="text-xs text-white/40">Observação do pedido:</p>
                <p className="mt-1 text-sm italic text-white/60">{order.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary + actions */}
        <div className="space-y-4 lg:col-span-1">
          {/* Totals */}
          <div className="rounded-xl border border-white/10 bg-dark-100 p-6">
            <h2 className="mb-4 font-semibold text-white">Resumo</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white/70">
                  {Number(order.totalPrice).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/50">Desconto</span>
                  <span className="text-brand-green">
                    -{Number(order.discount).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
                <span className="text-white">Total</span>
                <span className="text-white">
                  {(Number(order.totalPrice) - Number(order.discount)).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
            </div>

            {order.paid ? (
              <div className="mt-4 rounded-lg bg-brand-green/10 px-4 py-3 text-sm text-brand-green">
                Pago via {paymentLabel[order.paymentMethod!]}
                <br />
                <span className="text-xs opacity-70">
                  {new Date(order.paidAt!).toLocaleString('pt-BR')}
                </span>
              </div>
            ) : (
              !showPaymentForm && (
                <Button
                  variant="green"
                  className="mt-4 w-full"
                  onClick={() => setShowPaymentForm(true)}
                  disabled={order.status !== 'DELIVERED'}
                >
                  Registrar pagamento
                </Button>
              )
            )}
          </div>

          {/* Payment form */}
          {showPaymentForm && !order.paid && (
            <form
              onSubmit={handleSubmit(onPaymentSubmit)}
              className="rounded-xl border border-white/10 bg-dark-100 p-6 space-y-4"
            >
              <h2 className="font-semibold text-white">Registrar pagamento</h2>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white/70">Forma de pagamento</label>
                <select
                  className="w-full rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-brand-red"
                  {...register('paymentMethod')}
                >
                  {paymentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white/70">
                  Desconto <span className="text-white/30">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: 5.00"
                  className="w-full rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-brand-red"
                  {...register('discount')}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="green"
                  className="flex-1"
                  isLoading={processPayment.isPending}
                >
                  Confirmar
                </Button>
              </div>
            </form>
          )}

          {/* Status actions */}
          {(nextStatus || canCancel) && (
            <div className="rounded-xl border border-white/10 bg-dark-100 p-6 space-y-3">
              <h2 className="font-semibold text-white">Ações</h2>
              {nextStatus && (
                <Button
                  variant="red"
                  className="w-full"
                  isLoading={updateStatus.isPending}
                  onClick={handleAdvanceStatus}
                >
                  {nextStatusLabel[order.status]}
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="ghost"
                  className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  isLoading={updateStatus.isPending}
                  onClick={handleCancel}
                >
                  Cancelar pedido
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

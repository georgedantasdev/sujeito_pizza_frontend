import { Link, useParams, useLocation } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import {
  useOrder,
  useUpdateOrderStatus,
  useAddOrderItem,
  useRemoveOrderItem,
} from '@/hooks/orders'
import type { OrderStatus } from '@/hooks/orders'
import { useProducts } from '@/hooks/products'
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

interface AddItemFormData {
  productId: string
  sizeId: string
  flavorId: string
  quantity: string
  note: string
}

export function DetalhesPedido() {
  const { id, mesaId } = useParams<{ id: string; mesaId: string }>()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const base = mesaId
    ? isAdmin ? `/admin/mesas/${mesaId}` : `/mesas/${mesaId}`
    : isAdmin ? '/admin/mesas' : '/mesas'
  const { data: order, isLoading } = useOrder(id!)
  const { data: products = [] } = useProducts()
  const updateStatus = useUpdateOrderStatus(id!)
  const addItem = useAddOrderItem(id!)
  const removeItem = useRemoveOrderItem(id!)
  const modal = useModal()
  const [showAddItem, setShowAddItem] = useState(false)
  const [pendingAction, setPendingAction] = useState<'advance' | 'cancel' | null>(null)

  const {
    register: registerItem,
    handleSubmit: handleSubmitItem,
    watch: watchItem,
    reset: resetItem,
    formState: { errors: itemErrors },
  } = useForm<AddItemFormData>({
    defaultValues: { productId: '', sizeId: '', flavorId: '', quantity: '1', note: '' },
  })

  const selectedProductId = watchItem('productId')
  const selectedProduct = products.find((p) => p.id === selectedProductId)

  function handleAdvanceStatus() {
    if (!order) return
    const next = statusFlow[order.status]
    if (!next) return
    setPendingAction('advance')
    updateStatus.mutate({ status: next }, { onSettled: () => setPendingAction(null) })
  }

  async function handleCancel() {
    const ok = await modal.confirm({
      title: 'Cancelar pedido?',
      description: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Cancelar pedido',
      variant: 'danger',
    })
    if (!ok) return
    setPendingAction('cancel')
    updateStatus.mutate({ status: 'CANCELLED' }, { onSettled: () => setPendingAction(null) })
  }

  function onAddItemSubmit({ productId, sizeId, flavorId, quantity, note }: AddItemFormData) {
    addItem.mutate(
      {
        productId,
        sizeId,
        flavorId: flavorId || undefined,
        quantity: Number(quantity),
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          resetItem()
          setShowAddItem(false)
        },
      },
    )
  }

  async function handleRemoveItem(itemId: string) {
    const ok = await modal.confirm({
      title: 'Remover item?',
      description: 'O item será removido do pedido.',
      confirmLabel: 'Remover',
      variant: 'danger',
    })
    if (!ok) return
    removeItem.mutate(itemId)
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-2xl space-y-4">
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
  const canEditItems = order.status === 'OPEN' || order.status === 'IN_PROGRESS'

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <Link
          to={base}
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ChevronLeft size={16} />
          Voltar para a mesa
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
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="font-semibold text-white">Itens do pedido</h2>
              {canEditItems && !showAddItem && (
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-brand-green ring-1 ring-brand-green/30 transition-colors hover:bg-brand-green/10"
                >
                  <Plus size={13} />
                  Adicionar item
                </button>
              )}
            </div>

            {order.items.length === 0 && !showAddItem ? (
              <p className="px-6 py-8 text-center text-sm text-white/30">
                Nenhum item no pedido.
              </p>
            ) : (
              <div className="divide-y divide-white/5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between px-6 py-4">
                    <div className="flex-1">
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
                    <div className="ml-4 flex items-center gap-3">
                      <p className="shrink-0 text-sm text-white/70">
                        {(Number(item.price) * item.quantity).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                      {canEditItems && (
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeItem.isPending && removeItem.variables === item.id}
                          className="rounded p-1 text-white/20 transition-colors hover:text-red-400 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add item form */}
            {showAddItem && canEditItems && (
              <div className="border-t border-white/10 px-6 py-5">
                <p className="mb-4 text-sm font-medium text-white">Adicionar item</p>
                <form onSubmit={handleSubmitItem(onAddItemSubmit)} className="space-y-3">
                  {/* Product */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/50">Produto</label>
                    <select
                      className={`w-full rounded-md bg-dark-200 px-3 py-2 text-sm text-white outline-none ring-1 transition focus:ring-brand-red ${
                        itemErrors.productId ? 'ring-red-500' : 'ring-white/10'
                      }`}
                      {...registerItem('productId', { required: true })}
                    >
                      <option value="">Selecione um produto…</option>
                      {products
                        .filter((p) => p.available)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {selectedProduct && (
                    <>
                      {/* Size */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-white/50">Tamanho</label>
                          <select
                            className={`w-full rounded-md bg-dark-200 px-3 py-2 text-sm text-white outline-none ring-1 transition focus:ring-brand-red ${
                              itemErrors.sizeId ? 'ring-red-500' : 'ring-white/10'
                            }`}
                            {...registerItem('sizeId', { required: true })}
                          >
                            <option value="">Selecione…</option>
                            {selectedProduct.sizes.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} —{' '}
                                {Number(s.price).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-white/50">Qtd.</label>
                          <input
                            type="number"
                            min={1}
                            className="w-full rounded-md bg-dark-200 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                            {...registerItem('quantity', { required: true, min: 1 })}
                          />
                        </div>
                      </div>

                      {/* Flavor (optional) */}
                      {selectedProduct.flavors.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-white/50">
                            Sabor <span className="text-white/30">(opcional)</span>
                          </label>
                          <select
                            className="w-full rounded-md bg-dark-200 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                            {...registerItem('flavorId')}
                          >
                            <option value="">Sem sabor específico</option>
                            {selectedProduct.flavors.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Note */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-white/50">
                          Observação <span className="text-white/30">(opcional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: sem cebola"
                          className="w-full rounded-md bg-dark-200 px-3 py-2 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                          {...registerItem('note')}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => { setShowAddItem(false); resetItem() }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="green"
                      size="sm"
                      className="flex-1"
                      isLoading={addItem.isPending}
                      disabled={!selectedProduct}
                    >
                      Adicionar
                    </Button>
                  </div>
                </form>
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
              <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
                <span className="text-white">Total do pedido</span>
                <span className="text-white">
                  {Number(order.totalPrice).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/30">
              O pagamento é registrado ao fechar a mesa.
            </p>
          </div>

          {/* Status actions */}
          {(nextStatus || canCancel) && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-dark-100 p-6">
              <h2 className="font-semibold text-white">Ações</h2>
              {nextStatus && (
                <Button
                  variant="red"
                  className="w-full"
                  isLoading={pendingAction === 'advance'}
                  disabled={updateStatus.isPending}
                  onClick={handleAdvanceStatus}
                >
                  {nextStatusLabel[order.status]}
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="ghost"
                  className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  isLoading={pendingAction === 'cancel'}
                  disabled={updateStatus.isPending}
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

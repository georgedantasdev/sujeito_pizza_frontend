import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Select } from '@/components/Select'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/Button'
import { useTable, useTableOrders, useCloseTable, tableKeys } from '@/hooks/tables'
import type { PaymentMethod } from '@/hooks/tables'
import { useUpdateOrderStatus, useAddOrderItem, useRemoveOrderItem } from '@/hooks/orders'
import type { Order, OrderStatus } from '@/hooks/orders'
import { useModal } from '@/contexts/ModalContext'
import { useProducts } from '@/hooks/products'
import type { Product } from '@/hooks/products'
import { getErrorMessage } from '@/utils/getErrorMessage'
import api from '@/services/api'
import type { ApiResponse } from '@/types'

// ─── Constantes ───────────────────────────────────────────────────────
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

// ─── Tipos ────────────────────────────────────────────────────────────
interface PendingPizza {
  uid: string
  productId: string
  productName: string
  sizeId: string
  sizeName: string
  sizePrice: number
  flavorId?: string
  flavorName?: string
  quantity: number
  note?: string
}

interface AddPizzaFormData {
  productId: string
  sizeId: string
  flavorId: string
  quantity: string
  note: string
}

interface AddItemFormData {
  productId: string
  sizeId: string
  flavorId: string
  quantity: string
  note: string
}

interface CloseFormData {
  paymentMethod: PaymentMethod
  discount: string
}

// ─── OrderCard ────────────────────────────────────────────────────────
function OrderCard({ order, products }: { order: Order; products: Product[] }) {
  const modal = useModal()
  const [expanded, setExpanded] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [pendingAction, setPendingAction] = useState<'advance' | 'cancel' | null>(null)

  const updateStatus = useUpdateOrderStatus(order.id)
  const addItem = useAddOrderItem(order.id)
  const removeItem = useRemoveOrderItem(order.id)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddItemFormData>({
    defaultValues: { productId: '', sizeId: '', flavorId: '', quantity: '1', note: '' },
  })

  const selectedProductId = watch('productId')
  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const nextStatus = statusFlow[order.status]
  const canCancel = order.status === 'OPEN' || order.status === 'IN_PROGRESS'
  const canEditItems = order.status === 'OPEN' || order.status === 'IN_PROGRESS'
  const isDone = order.status === 'DELIVERED' || order.status === 'CANCELLED'

  function handleAdvanceStatus() {
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
          reset()
          setShowAddItem(false)
        },
      },
    )
  }

  return (
    <div className={`rounded-xl border bg-dark-100 transition-colors ${isDone ? 'border-white/5' : 'border-white/10'}`}>
      {/* Cabeçalho do card (sempre visível) */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-medium ${isDone ? 'text-white/40' : 'text-white'}`}>
              Pedido #{order.id.slice(-6).toUpperCase()}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[order.status]}`}>
              {statusLabel[order.status]}
            </span>
          </div>
          <p className={`mt-0.5 text-xs ${isDone ? 'text-white/25' : 'text-white/40'}`}>
            {order.user.name} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
          {!expanded && order.items.length > 0 && (
            <p className={`mt-0.5 text-xs ${isDone ? 'text-white/20' : 'text-white/30'}`}>
              {order.items.map((item) =>
                [item.product.name, item.size?.name, item.flavor?.name].filter(Boolean).join(' · ')
              ).join(' / ')}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className={`text-sm font-semibold ${isDone ? 'text-white/30' : 'text-white'}`}>
            {Number(order.totalPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-white/30" />
          ) : (
            <ChevronDown size={16} className="text-white/30" />
          )}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="border-t border-white/10">
          {/* Itens */}
          <div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Itens</span>
              {canEditItems && !showAddItem && (
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-brand-green ring-1 ring-brand-green/30 transition-colors hover:bg-brand-green/10"
                >
                  <Plus size={12} />
                  Adicionar item
                </button>
              )}
            </div>

            {order.items.length === 0 && !showAddItem ? (
              <p className="px-4 pb-4 text-sm text-white/30">Nenhum item no pedido.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {item.quantity}x {item.product.name}
                      </p>
                      <p className="text-xs text-white/40">
                        {[item.size?.name, item.flavor?.name].filter(Boolean).join(' · ')}
                      </p>
                      {item.note && (
                        <p className="mt-0.5 text-xs italic text-white/30">Obs: {item.note}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm text-white/60">
                        {(Number(item.price) * item.quantity).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                      {canEditItems && (
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeItem.isPending && removeItem.variables === item.id}
                          className="rounded p-1 text-white/20 transition-colors hover:text-red-400 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nota do pedido */}
            {order.note && (
              <div className="border-t border-white/5 px-4 py-3">
                <p className="text-xs italic text-white/30">Obs do pedido: {order.note}</p>
              </div>
            )}

            {/* Formulário adicionar item */}
            {showAddItem && canEditItems && (
              <div className="border-t border-white/10 px-4 py-4">
                <form onSubmit={handleSubmit(onAddItemSubmit)} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/50">Produto</label>
                    <select
                      className={`w-full rounded-md bg-dark-200 px-3 py-2 text-sm text-white outline-none ring-1 transition focus:ring-brand-red ${
                        errors.productId ? 'ring-red-500' : 'ring-white/10'
                      }`}
                      {...register('productId', { required: true })}
                    >
                      <option value="">Selecione um produto…</option>
                      {products.filter((p) => p.available).map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedProduct && (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-white/50">Tamanho</label>
                          <select
                            className={`w-full rounded-md bg-dark-200 px-3 py-2.5 text-sm text-white outline-none ring-1 transition focus:ring-brand-red ${
                              errors.sizeId ? 'ring-red-500' : 'ring-white/10'
                            }`}
                            {...register('sizeId', { required: true })}
                          >
                            <option value="">Selecione…</option>
                            {selectedProduct.sizes.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} — {Number(s.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-white/50">Qtd.</label>
                          <input
                            type="number"
                            min={1}
                            className="w-full rounded-md bg-dark-200 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                            {...register('quantity', { required: true, min: 1 })}
                          />
                        </div>
                      </div>

                      {selectedProduct.flavors.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-white/50">
                            Sabor <span className="text-white/30">(opcional)</span>
                          </label>
                          <select
                            className="w-full rounded-md bg-dark-200 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                            {...register('flavorId')}
                          >
                            <option value="">Sem sabor específico</option>
                            {selectedProduct.flavors.map((f) => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-white/50">
                          Observação <span className="text-white/30">(opcional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: sem cebola"
                          className="w-full rounded-md bg-dark-200 px-3 py-2 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                          {...register('note')}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => { setShowAddItem(false); reset() }}
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
          </div>

          {/* Ações de status */}
          {(nextStatus || canCancel) && (
            <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3">
              {nextStatus && (
                <Button
                  size="sm"
                  variant="red"
                  isLoading={pendingAction === 'advance'}
                  disabled={updateStatus.isPending}
                  onClick={handleAdvanceStatus}
                >
                  {nextStatusLabel[order.status]}
                </Button>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
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
      )}
    </div>
  )
}

// ─── DetalhesMesa ─────────────────────────────────────────────────────
export function DetalhesMesa() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const modal = useModal()
  const queryClient = useQueryClient()

  const isAdmin = location.pathname.startsWith('/admin')
  const basePath = isAdmin ? '/admin/mesas' : '/mesas'

  const { data: table, isLoading: loadingTable } = useTable(id!)
  const { data: orders = [], isLoading: loadingOrders } = useTableOrders(id!, table?.status)
  const { data: products = [] } = useProducts()
  const closeMutation = useCloseTable()

  // ── Modal de novo pedido ──
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [pendingPizzas, setPendingPizzas] = useState<PendingPizza[]>([])
  const [isCreatingOrders, setIsCreatingOrders] = useState(false)

  const {
    register: regPizza,
    handleSubmit: handlePizzaSubmit,
    watch: watchPizza,
    reset: resetPizza,
    control: controlPizza,
    formState: { errors: pizzaErrors },
  } = useForm<AddPizzaFormData>({
    defaultValues: { productId: '', sizeId: '', flavorId: '', quantity: '1', note: '' },
  })

  const selectedProductId = watchPizza('productId')
  const selectedProduct = products.find((p) => p.id === selectedProductId)

  function onAddPizza({ productId, sizeId, flavorId, quantity, note }: AddPizzaFormData) {
    const product = products.find((p) => p.id === productId)!
    const size = product.sizes.find((s) => s.id === sizeId)!
    const flavor = flavorId ? product.flavors.find((f) => f.id === flavorId) : undefined

    setPendingPizzas((prev) => [
      ...prev,
      {
        uid: `${Date.now()}-${Math.random()}`,
        productId,
        productName: product.name,
        sizeId,
        sizeName: size.name,
        sizePrice: Number(size.price),
        flavorId: flavorId || undefined,
        flavorName: flavor?.name,
        quantity: Number(quantity),
        note: note.trim() || undefined,
      },
    ])
    resetPizza()
  }

  async function handleCreateOrders() {
    if (pendingPizzas.length === 0) return
    setIsCreatingOrders(true)
    try {
      for (const pizza of pendingPizzas) {
        const orderRes = await api.post<ApiResponse<Order>>('/orders', { tableId: id })
        const orderId = orderRes.data.data.id
        try {
          await api.post(`/orders/${orderId}/items`, {
            productId: pizza.productId,
            sizeId: pizza.sizeId,
            flavorId: pizza.flavorId,
            quantity: pizza.quantity,
            note: pizza.note,
          })
        } catch (itemErr) {
          // Cancela o pedido vazio antes de propagar o erro
          await api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' }).catch(() => {})
          throw itemErr
        }
      }
      queryClient.invalidateQueries({ queryKey: tableKeys.all })
      setShowOrderModal(false)
      setPendingPizzas([])
    } catch (err) {
      modal.error({ title: 'Erro ao criar pedidos', description: getErrorMessage(err) })
    } finally {
      setIsCreatingOrders(false)
    }
  }

  function openModal() {
    setPendingPizzas([])
    resetPizza()
    setShowOrderModal(true)
  }

  // ── Fechar mesa ──
  const [showCloseForm, setShowCloseForm] = useState(false)
  const {
    register: regClose,
    handleSubmit: handleCloseSubmit,
    formState: { errors: closeErrors },
  } = useForm<CloseFormData>({
    defaultValues: { paymentMethod: 'CASH', discount: '' },
  })

  const activeOrders = orders.filter((o) => o.status !== 'CANCELLED')
  const allDelivered = activeOrders.every((o) => o.status === 'DELIVERED')
  const canClose = allDelivered
  const isEmpty = activeOrders.length === 0
  const tableTotal = activeOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0)

  async function handleCloseEmpty() {
    const ok = await modal.confirm({
      title: `Fechar Mesa ${table?.number}?`,
      description: 'A mesa não tem pedidos e será liberada.',
      confirmLabel: 'Fechar mesa',
      variant: 'default',
    })
    if (!ok) return
    closeMutation.mutate(
      { id: id!, paymentMethod: undefined, discount: undefined },
      { onSuccess: () => navigate(basePath) },
    )
  }

  async function onCloseSubmit({ paymentMethod, discount }: CloseFormData) {
    const ok = await modal.confirm({
      title: `Finalizar Mesa ${table?.number}?`,
      description: 'A mesa será liberada após o registro do pagamento.',
      confirmLabel: 'Confirmar e fechar',
      variant: 'default',
    })
    if (!ok) return
    closeMutation.mutate(
      { id: id!, paymentMethod, discount: discount ? Number(discount) : undefined },
      { onSuccess: () => navigate(basePath) },
    )
  }

  if (loadingTable) {
    return (
      <div className="p-4 sm:p-8">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-dark-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!table) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-white/50">Mesa não encontrada.</p>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={basePath}
            className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ChevronLeft size={16} />
            Voltar para mesas
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Mesa {table.number}</h1>
              <p className="mt-1 text-sm text-white/50">
                {activeOrders.length} pedido{activeOrders.length !== 1 ? 's' : ''} ativo{activeOrders.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="green" onClick={openModal} className="flex-1 sm:flex-none">
                <Plus size={16} />
                Novo pedido
              </Button>
              {!showCloseForm && (
                <Button
                  variant="ghost"
                  onClick={isEmpty ? handleCloseEmpty : () => setShowCloseForm(true)}
                  disabled={!canClose}
                  isLoading={isEmpty && closeMutation.isPending}
                  className={`flex-1 sm:flex-none ${canClose ? 'ring-brand-green text-brand-green hover:bg-brand-green/10' : ''}`}
                >
                  Finalizar mesa
                </Button>
              )}
            </div>
          </div>
          {!canClose && activeOrders.length > 0 && (
            <p className="mt-2 text-xs text-white/30">
              Todos os pedidos precisam estar entregues para encerrar a mesa.
            </p>
          )}
        </div>

        {/* Formulário de fechamento */}
        {showCloseForm && (
          <form
            onSubmit={handleCloseSubmit(onCloseSubmit)}
            className="mb-6 rounded-xl border border-brand-green/20 bg-dark-100 p-6"
          >
            <h2 className="mb-1 font-semibold text-white">Registrar pagamento e fechar mesa</h2>
            <p className="mb-5 text-sm text-white/40">
              Total da mesa:{' '}
              <span className="font-semibold text-white">
                {tableTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white/70">Forma de pagamento</label>
                <select
                  className="w-full rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-brand-red"
                  {...regClose('paymentMethod')}
                >
                  {paymentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white/70">
                  Desconto <span className="text-white/30">(opcional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 5.00"
                  className={`w-full rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 transition focus:ring-brand-red ${closeErrors.discount ? 'ring-red-500' : 'ring-white/10'}`}
                  {...regClose('discount', {
                    min: { value: 0, message: 'Desconto não pode ser negativo' },
                    max: { value: tableTotal, message: `Desconto não pode ser maior que o total (${tableTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})` },
                    validate: (v) => !v || !isNaN(Number(v)) || 'Informe um valor numérico válido',
                  })}
                />
                {closeErrors.discount && (
                  <p className="text-xs text-red-400">{closeErrors.discount.message}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowCloseForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="green" className="flex-1" isLoading={closeMutation.isPending}>
                Confirmar e fechar mesa
              </Button>
            </div>
          </form>
        )}

        {/* Lista de pedidos */}
        {loadingOrders ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-dark-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-16 text-center">
            <p className="text-white/40">Nenhum pedido nesta mesa.</p>
            <p className="text-xs text-white/30">Clique em "Novo pedido" para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} products={products} />
            ))}

            {activeOrders.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-dark-100 px-6 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Total da mesa</span>
                  <span className="text-lg font-bold text-white">
                    {tableTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal de novo pedido ── */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isCreatingOrders && setShowOrderModal(false)}
          />

          <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-dark-100 shadow-2xl" style={{ maxHeight: 'min(90vh, 700px)' }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="font-semibold text-white">Novo pedido — Mesa {table.number}</h2>
                <p className="text-xs text-white/40">Cada pizza vira um pedido separado</p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                disabled={isCreatingOrders}
                className="rounded-md p-1 text-white/40 transition-colors hover:text-white disabled:opacity-30"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo com scroll */}
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
              {/* Formulário para adicionar pizza */}
              <form onSubmit={handlePizzaSubmit(onAddPizza)} className="border-b border-white/10 p-6">
                <p className="mb-3 text-sm font-medium text-white/70">Adicionar pizza</p>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/50">Produto</label>
                    <Controller
                      control={controlPizza}
                      name="productId"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={(v) => { field.onChange(v); resetPizza({ productId: v, sizeId: '', flavorId: '', quantity: '1', note: '' }) }}
                          options={products.filter((p) => p.available).map((p) => ({ value: p.id, label: p.name }))}
                          placeholder="Selecione um produto…"
                          error={!!pizzaErrors.productId}
                        />
                      )}
                    />
                  </div>

                  {selectedProduct && (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-white/50">Tamanho</label>
                          <Controller
                            control={controlPizza}
                            name="sizeId"
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onChange={field.onChange}
                                options={selectedProduct.sizes.map((s) => ({
                                  value: s.id,
                                  label: `${s.name} — ${Number(s.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
                                }))}
                                placeholder="Selecione…"
                                error={!!pizzaErrors.sizeId}
                              />
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-white/50">Qtd.</label>
                          <input
                            type="number"
                            min={1}
                            className="w-full rounded-md bg-dark-200 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                            {...regPizza('quantity', { required: true, min: 1 })}
                          />
                        </div>
                      </div>

                      {selectedProduct.flavors.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-white/50">
                            Sabor <span className="text-white/30">(opcional)</span>
                          </label>
                          <Controller
                            control={controlPizza}
                            name="flavorId"
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onChange={field.onChange}
                                options={[
                                  { value: '', label: 'Sem sabor específico' },
                                  ...selectedProduct.flavors.map((f) => ({ value: f.id, label: f.name })),
                                ]}
                                placeholder="Sem sabor específico"
                              />
                            )}
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-white/50">
                          Observação <span className="text-white/30">(opcional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: sem cebola"
                          className="w-full rounded-md bg-dark-200 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                          {...regPizza('note')}
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="w-full ring-1 ring-white/10"
                    disabled={!selectedProduct}
                  >
                    <Plus size={14} />
                    Adicionar à lista
                  </Button>
                </div>
              </form>

              {/* Lista de pizzas pendentes */}
              {pendingPizzas.length > 0 && (
                <div className="p-6">
                  <p className="mb-3 text-sm font-medium text-white/70">
                    Pizzas a pedir ({pendingPizzas.length})
                  </p>
                  <div className="space-y-2">
                    {pendingPizzas.map((pizza) => (
                      <div
                        key={pizza.uid}
                        className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-dark-200 px-4 py-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            {pizza.quantity}x {pizza.productName}
                          </p>
                          <p className="text-xs text-white/40">
                            {[pizza.sizeName, pizza.flavorName].filter(Boolean).join(' · ')}
                            {' '}—{' '}
                            {(pizza.sizePrice * pizza.quantity).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </p>
                          {pizza.note && (
                            <p className="mt-0.5 text-xs italic text-white/30">Obs: {pizza.note}</p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setPendingPizzas((prev) => prev.filter((p) => p.uid !== pizza.uid))
                          }
                          className="shrink-0 rounded p-1 text-white/20 transition-colors hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingPizzas.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-white/20">
                  Nenhuma pizza adicionada ainda.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-white/10 p-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowOrderModal(false)}
                disabled={isCreatingOrders}
              >
                Cancelar
              </Button>
              <Button
                variant="green"
                className="flex-1"
                onClick={handleCreateOrders}
                isLoading={isCreatingOrders}
                disabled={pendingPizzas.length === 0}
                title={pendingPizzas.length === 0 ? 'Adicione ao menos uma pizza à lista antes de criar os pedidos' : undefined}
              >
                Criar {pendingPizzas.length > 0 ? `${pendingPizzas.length} ` : ''}pedido{pendingPizzas.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

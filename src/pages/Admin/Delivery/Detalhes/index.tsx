import { Link, useParams, useLocation } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import {
  useDelivery,
  useUpdateDeliveryStatus,
  useProcessDeliveryPayment,
  useAddDeliveryItem,
  useRemoveDeliveryItem,
} from '@/hooks/delivery'
import type { DeliveryStatus, PaymentMethod } from '@/hooks/delivery'
import { useProducts } from '@/hooks/products'
import { useModal } from '@/contexts/ModalContext'

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

const statusFlow: Record<string, DeliveryStatus | null> = {
  PREPARING: 'READY',
  READY: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null,
}

const nextStatusLabel: Record<string, string> = {
  PREPARING: 'Marcar como pronto',
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

interface AddItemFormData {
  productId: string
  sizeId: string
  flavorId: string
  quantity: string
  note: string
}

export function DetalhesEntrega() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const base = location.pathname.startsWith('/admin') ? '/admin/delivery' : '/delivery'

  const { data: delivery, isLoading } = useDelivery(id!)
  const { data: products = [] } = useProducts()
  const updateStatus = useUpdateDeliveryStatus(id!)
  const processPayment = useProcessDeliveryPayment(id!)
  const addItem = useAddDeliveryItem(id!)
  const removeItem = useRemoveDeliveryItem(id!)
  const modal = useModal()

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [pendingAction, setPendingAction] = useState<'advance' | 'cancel' | null>(null)

  const { register, handleSubmit, formState: { errors: paymentErrors } } = useForm<PaymentFormData>({
    defaultValues: { paymentMethod: 'CASH', discount: '' },
  })

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

  const advanceLabel: Record<string, string> = {
    PREPARING: 'Marcar entrega como pronta?',
    READY: 'Confirmar entrega ao cliente?',
  }

  async function handleAdvanceStatus() {
    if (!delivery) return
    const next = statusFlow[delivery.status]
    if (!next) return
    const ok = await modal.confirm({
      title: advanceLabel[delivery.status] ?? 'Avançar status?',
      description: 'Esta ação não pode ser desfeita.',
      confirmLabel: nextStatusLabel[delivery.status],
      variant: 'default',
    })
    if (!ok) return
    setPendingAction('advance')
    updateStatus.mutate({ status: next }, { onSettled: () => setPendingAction(null) })
  }

  async function handleCancel() {
    const ok = await modal.confirm({
      title: 'Cancelar entrega?',
      description: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Cancelar entrega',
      variant: 'danger',
    })
    if (!ok) return
    setPendingAction('cancel')
    updateStatus.mutate({ status: 'CANCELLED' }, { onSettled: () => setPendingAction(null) })
  }

  function onPaymentSubmit({ paymentMethod, discount }: PaymentFormData) {
    processPayment.mutate(
      { paymentMethod, discount: discount || undefined },
      { onSuccess: () => setShowPaymentForm(false) },
    )
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
      description: 'O item será removido da entrega.',
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

  if (!delivery) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-white/50">Entrega não encontrada.</p>
      </div>
    )
  }

  const nextStatus = statusFlow[delivery.status]
  const canCancel = delivery.status === 'PREPARING' || delivery.status === 'READY'
  const canEditItems = delivery.status === 'PREPARING' || delivery.status === 'READY'
  const canPay = !delivery.paidAt && delivery.status !== 'CANCELLED'

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={base}
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ChevronLeft size={16} />
          Voltar para entregas
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{delivery.customerName}</h1>
            <p className="mt-1 text-sm text-white/50">
              Atendido por {delivery.user.name} &middot;{' '}
              {new Date(delivery.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor[delivery.status]}`}>
            {statusLabel[delivery.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Sidebar: resumo + pagamento + ações — vem primeiro no mobile */}
        <div className="order-first space-y-4 lg:order-last lg:col-span-1">
          {/* Totais */}
          <div className="rounded-xl border border-white/10 bg-dark-100 p-4 sm:p-6">
            <h2 className="mb-3 font-semibold text-white">Resumo</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white/70">
                  {Number(delivery.totalPrice).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              {Number(delivery.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/50">Desconto</span>
                  <span className="text-brand-green">
                    -{Number(delivery.discount).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
                <span className="text-white">Total</span>
                <span className="text-white">
                  {(Number(delivery.totalPrice) - Number(delivery.discount)).toLocaleString(
                    'pt-BR',
                    { style: 'currency', currency: 'BRL' },
                  )}
                </span>
              </div>
            </div>

            {delivery.paidAt ? (
              <div className="mt-4 rounded-lg bg-brand-green/10 px-4 py-3 text-sm text-brand-green">
                Pago via {paymentLabel[delivery.paymentMethod!]}
                <br />
                <span className="text-xs opacity-70">
                  {new Date(delivery.paidAt).toLocaleString('pt-BR')}
                </span>
              </div>
            ) : (
              canPay &&
              !showPaymentForm && (
                <Button
                  variant="green"
                  className="mt-4 w-full"
                  onClick={() => setShowPaymentForm(true)}
                >
                  Registrar pagamento
                </Button>
              )
            )}
          </div>

          {/* Formulário de pagamento */}
          {showPaymentForm && !delivery.paidAt && (
            <form
              onSubmit={handleSubmit(onPaymentSubmit)}
              className="space-y-4 rounded-xl border border-white/10 bg-dark-100 p-4 sm:p-6"
            >
              <h2 className="font-semibold text-white">Registrar pagamento</h2>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white/70">Forma de pagamento</label>
                <select
                  className="w-full rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-brand-red"
                  {...register('paymentMethod')}
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
                  className={`w-full rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 transition focus:ring-brand-red ${paymentErrors.discount ? 'ring-red-500' : 'ring-white/10'}`}
                  {...register('discount', {
                    min: { value: 0, message: 'Desconto não pode ser negativo' },
                    max: {
                      value: Number(delivery?.totalPrice ?? 0),
                      message: `Desconto não pode ser maior que o total da entrega`,
                    },
                    validate: (v) => !v || !isNaN(Number(v)) || 'Informe um valor numérico válido',
                  })}
                />
                {paymentErrors.discount && (
                  <p className="text-xs text-red-400">{paymentErrors.discount.message}</p>
                )}
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

          {/* Ações de status */}
          {(nextStatus || canCancel) && (
            <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-dark-100 p-4 sm:block sm:space-y-3 sm:p-6">
              <p className="hidden w-full font-semibold text-white sm:block">Ações</p>
              {nextStatus && (
                <Button
                  variant="red"
                  className="flex-1 sm:w-full sm:flex-none"
                  isLoading={pendingAction === 'advance'}
                  disabled={updateStatus.isPending}
                  onClick={handleAdvanceStatus}
                >
                  {nextStatusLabel[delivery.status]}
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="ghost"
                  className="flex-1 text-red-400 hover:bg-red-500/10 hover:text-red-300 sm:w-full sm:flex-none"
                  isLoading={pendingAction === 'cancel'}
                  disabled={updateStatus.isPending}
                  onClick={handleCancel}
                >
                  Cancelar entrega
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Itens */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/10 bg-dark-100">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
              <h2 className="font-semibold text-white">Itens da entrega</h2>
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

            {delivery.items.length === 0 && !showAddItem ? (
              <p className="px-4 py-8 text-center text-sm text-white/30 sm:px-6">
                Nenhum item adicionado.
              </p>
            ) : (
              <div className="divide-y divide-white/5">
                {delivery.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between px-4 py-3 sm:px-6 sm:py-4">
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
                    <div className="ml-3 flex items-center gap-2">
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

            {/* Formulário de adicionar item */}
            {showAddItem && canEditItems && (
              <div className="border-t border-white/10 px-4 py-4 sm:px-6 sm:py-5">
                <p className="mb-4 text-sm font-medium text-white">Adicionar item</p>
                <form onSubmit={handleSubmitItem(onAddItemSubmit)} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/50">Produto</label>
                    <select
                      className={`w-full rounded-md bg-dark-200 px-3 py-2.5 text-sm text-white outline-none ring-1 transition focus:ring-brand-red ${
                        itemErrors.productId ? 'ring-red-500' : 'ring-white/10'
                      }`}
                      {...registerItem('productId', { required: true })}
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
                              itemErrors.sizeId ? 'ring-red-500' : 'ring-white/10'
                            }`}
                            {...registerItem('sizeId', { required: true })}
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
                            {...registerItem('quantity', { required: true, min: 1 })}
                          />
                        </div>
                      </div>

                      {selectedProduct.flavors.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-white/50">
                            Sabor <span className="text-white/30">(opcional)</span>
                          </label>
                          <select
                            className="w-full rounded-md bg-dark-200 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                            {...registerItem('flavorId')}
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
                          className="w-full rounded-md bg-dark-200 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
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

            {delivery.note && (
              <div className="border-t border-white/10 px-4 py-4 sm:px-6">
                <p className="text-xs text-white/40">Observação:</p>
                <p className="mt-1 text-sm italic text-white/60">{delivery.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

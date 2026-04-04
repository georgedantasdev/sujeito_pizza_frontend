import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useModal } from '@/contexts/ModalContext'
import type { ApiResponse } from '@/types'
import { orderKeys } from './types'
import type { Order, OrderStatus, ProcessPaymentData, UpdateOrderStatusData } from './types'

export * from './types'

// ─── Queries ─────────────────────────────────────────────────────────
export function useOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: orderKeys.filtered(status),
    queryFn: async () => {
      const params = status ? { status } : {}
      const { data } = await api.get<ApiResponse<Order[]>>('/orders', { params })
      return data.data
    },
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────
export function useUpdateOrderStatus(id: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: UpdateOrderStatusData) =>
      api.patch<ApiResponse<Order>>(`/orders/${id}/status`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
      modal.success({ title: 'Status do pedido atualizado!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao atualizar status', description: getErrorMessage(error) })
    },
  })
}

export function useProcessPayment(id: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: ProcessPaymentData) =>
      api.patch<ApiResponse<Order>>(`/orders/${id}/payment`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
      modal.success({ title: 'Pagamento registrado com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao registrar pagamento', description: getErrorMessage(error) })
    },
  })
}

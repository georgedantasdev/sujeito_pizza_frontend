import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useModal } from '@/contexts/ModalContext'
import type { ApiResponse } from '@/types'
import { orderKeys } from './types'
import type {
  AddOrderItemData,
  CreateOrderData,
  Order,
  OrderStatus,
  UpdateOrderStatusData,
} from './types'

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
export function useCreateOrder() {
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: CreateOrderData) =>
      api.post<ApiResponse<Order>>('/orders', dto),
    onError: (error) => {
      modal.error({ title: 'Erro ao criar pedido', description: getErrorMessage(error) })
    },
  })
}

export function useAddOrderItem(orderId: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: AddOrderItemData) =>
      api.post(`/orders/${orderId}/items`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao adicionar item', description: getErrorMessage(error) })
    },
  })
}

export function useRemoveOrderItem(orderId: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (itemId: string) =>
      api.delete(`/orders/${orderId}/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao remover item', description: getErrorMessage(error) })
    },
  })
}

export function useUpdateOrderStatus(id: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: UpdateOrderStatusData) =>
      api.patch<ApiResponse<Order>>(`/orders/${id}/status`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      modal.success({ title: 'Status do pedido atualizado!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao atualizar status', description: getErrorMessage(error) })
    },
  })
}


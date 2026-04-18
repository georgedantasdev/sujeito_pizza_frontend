import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useModal } from '@/contexts/ModalContext'
import type { ApiResponse } from '@/types'
import { deliveryKeys } from './types'
import type {
  AddDeliveryItemData,
  CreateDeliveryData,
  Delivery,
  DeliveryStatus,
  ProcessDeliveryPaymentData,
  UpdateDeliveryStatusData,
} from './types'

export * from './types'

// ─── Queries ─────────────────────────────────────────────────────────
export function useDeliveries(status?: DeliveryStatus) {
  return useQuery({
    queryKey: deliveryKeys.filtered(status),
    queryFn: async () => {
      const params = status ? { status } : {}
      const { data } = await api.get<ApiResponse<Delivery[]>>('/delivery', { params })
      return data.data
    },
  })
}

export function useDelivery(id: string) {
  return useQuery({
    queryKey: deliveryKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Delivery>>(`/delivery/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────
export function useCreateDelivery() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: CreateDeliveryData) =>
      api.post<ApiResponse<Delivery>>('/delivery', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao criar entrega', description: getErrorMessage(error) })
    },
  })
}

export function useAddDeliveryItem(deliveryId: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: AddDeliveryItemData) =>
      api.post(`/delivery/${deliveryId}/items`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(deliveryId) })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao adicionar item', description: getErrorMessage(error) })
    },
  })
}

export function useRemoveDeliveryItem(deliveryId: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (itemId: string) =>
      api.delete(`/delivery/${deliveryId}/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(deliveryId) })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao remover item', description: getErrorMessage(error) })
    },
  })
}

export function useUpdateDeliveryStatus(id: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: UpdateDeliveryStatusData) =>
      api.patch<ApiResponse<Delivery>>(`/delivery/${id}/status`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) })
      modal.success({ title: 'Status atualizado!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao atualizar status', description: getErrorMessage(error) })
    },
  })
}

export function useProcessDeliveryPayment(id: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: ProcessDeliveryPaymentData) =>
      api.patch<ApiResponse<Delivery>>(`/delivery/${id}/payment`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) })
      modal.success({ title: 'Pagamento registrado!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao registrar pagamento', description: getErrorMessage(error) })
    },
  })
}

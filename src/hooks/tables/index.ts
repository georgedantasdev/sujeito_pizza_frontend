import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useModal } from '@/contexts/ModalContext'
import type { ApiResponse } from '@/types'
import { tableKeys } from './types'
import type { CloseTableData, CreateTableData, Table } from './types'
import type { Order } from '@/hooks/orders/types'

export * from './types'

// ─── Queries ─────────────────────────────────────────────────────────
export function useTables() {
  return useQuery({
    queryKey: tableKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Table[]>>('/tables')
      return data.data
    },
  })
}

export function useTable(id: string) {
  return useQuery({
    queryKey: tableKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Table>>(`/tables/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useTableOrders(id: string, tableStatus?: string) {
  return useQuery({
    queryKey: tableKeys.orders(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Order[]>>(`/tables/${id}/orders`)
      return data.data
    },
    enabled: !!id,
    refetchInterval: tableStatus === 'OCCUPIED' ? 5000 : false,
    refetchIntervalInBackground: false,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────
export function useCreateTable() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: CreateTableData) =>
      api.post<ApiResponse<Table>>('/tables', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all })
      modal.success({ title: 'Mesa cadastrada com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao cadastrar mesa', description: getErrorMessage(error) })
    },
  })
}

export function useDeleteTable() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/tables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all })
      modal.success({ title: 'Mesa removida com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao remover mesa', description: getErrorMessage(error) })
    },
  })
}

export function useOpenTable() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (id: string) =>
      api.post<ApiResponse<Table>>(`/tables/${id}/open`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all })
      queryClient.invalidateQueries({ queryKey: tableKeys.detail(id) })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao abrir mesa', description: getErrorMessage(error) })
    },
  })
}

export function useCloseTable() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: ({ id, paymentMethod, discount }: CloseTableData) =>
      api.post<ApiResponse<Table>>(`/tables/${id}/close`, { paymentMethod, discount }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all })
      queryClient.invalidateQueries({ queryKey: tableKeys.detail(variables.id) })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao encerrar mesa', description: getErrorMessage(error) })
    },
  })
}

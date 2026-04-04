import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useModal } from '@/contexts/ModalContext'
import type { ApiResponse } from '@/types'
import { tableKeys } from './types'
import type { CreateTableData, Table } from './types'

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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useModal } from '@/contexts/ModalContext'
import type { ApiResponse } from '@/types'
import { pizzeriaKeys } from './types'
import type { CreatePizzeriaData, Pizzeria } from './types'

export * from './types'

// ─── Queries ─────────────────────────────────────────────────────────
export function usePizzerias() {
  return useQuery({
    queryKey: pizzeriaKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Pizzeria[]>>('/pizzerias')
      return data.data
    },
  })
}

export function usePizzeria(id: string) {
  return useQuery({
    queryKey: pizzeriaKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Pizzeria>>(`/pizzerias/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────
export function useCreatePizzeria() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: CreatePizzeriaData) => api.post('/pizzerias', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pizzeriaKeys.all })
      modal.success({ title: 'Pizzaria cadastrada com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao cadastrar pizzaria', description: getErrorMessage(error) })
    },
  })
}

export function useUpdatePizzeria(id: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (name: string) =>
      api.put<ApiResponse<Pizzeria>>(`/pizzerias/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pizzeriaKeys.detail(id) })
      modal.success({ title: 'Pizzaria atualizada com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao atualizar pizzaria', description: getErrorMessage(error) })
    },
  })
}

export function useDeletePizzeria() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/pizzerias/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pizzeriaKeys.all })
      modal.success({ title: 'Pizzaria desativada com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao desativar pizzaria', description: getErrorMessage(error) })
    },
  })
}

export function useActivatePizzeria() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (id: string) => api.patch(`/pizzerias/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pizzeriaKeys.all })
      modal.success({ title: 'Pizzaria ativada com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao ativar pizzaria', description: getErrorMessage(error) })
    },
  })
}

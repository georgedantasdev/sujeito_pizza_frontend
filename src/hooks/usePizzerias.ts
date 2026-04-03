import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { ApiResponse, CreatePizzeriaData, Pizzeria } from '@/types'

// ─── Query keys ──────────────────────────────────────────────────────
export const pizzeriaKeys = {
  all: ['pizzerias'] as const,
  detail: (id: string) => ['pizzerias', id] as const,
}

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

  return useMutation({
    mutationFn: (dto: CreatePizzeriaData) => api.post('/pizzerias', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pizzeriaKeys.all })
      toast.success('Pizzaria cadastrada com sucesso!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao cadastrar pizzaria.'))
    },
  })
}

export function useUpdatePizzeria(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) =>
      api.put<ApiResponse<Pizzeria>>(`/pizzerias/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pizzeriaKeys.detail(id) })
      toast.success('Pizzaria atualizada com sucesso!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar pizzaria.'))
    },
  })
}

export function useDeletePizzeria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/pizzerias/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pizzeriaKeys.all })
      toast.success('Pizzaria removida com sucesso!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao remover pizzaria.'))
    },
  })
}

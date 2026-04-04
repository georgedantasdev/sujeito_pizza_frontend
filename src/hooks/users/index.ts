import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useModal } from '@/contexts/ModalContext'
import type { ApiResponse } from '@/types'
import { userKeys } from './types'
import type { AdminUser, CreateAdminData, CreateUserData, User } from './types'

export * from './types'

// ─── Queries ─────────────────────────────────────────────────────────
export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User[]>>('/users')
      return data.data
    },
  })
}

// ─── Mutations ───────────────────────────────────────────────────────
export function useCreateAdmin() {
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: CreateAdminData) =>
      api.post<ApiResponse<AdminUser>>('/users', {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: 'ADMIN',
        pizzeriaId: dto.pizzeriaId,
      }),
    onSuccess: () => {
      modal.success({ title: 'Administrador criado com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao criar administrador', description: getErrorMessage(error) })
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: CreateUserData) =>
      api.post<ApiResponse<User>>('/users', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      modal.success({ title: 'Funcionário cadastrado com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao cadastrar funcionário', description: getErrorMessage(error) })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      modal.success({ title: 'Funcionário removido com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao remover funcionário', description: getErrorMessage(error) })
    },
  })
}

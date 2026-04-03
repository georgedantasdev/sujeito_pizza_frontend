import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { AdminUser, ApiResponse, CreateAdminData } from '@/types'

// ─── Mutations ───────────────────────────────────────────────────────
export function useCreateAdmin() {
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
      toast.success('Administrador criado com sucesso!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar administrador.'))
    },
  })
}

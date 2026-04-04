import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useModal } from '@/contexts/ModalContext'
import type { ApiResponse } from '@/types'
import { productKeys } from './types'
import type { CreateProductData, Product, UpdateProductData } from './types'

export * from './types'

// ─── Queries ─────────────────────────────────────────────────────────
export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product[]>>('/products')
      return data.data
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────
export function useCreateProduct() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: CreateProductData) =>
      api.post<ApiResponse<Product>>('/products', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      modal.success({ title: 'Produto cadastrado com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao cadastrar produto', description: getErrorMessage(error) })
    },
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (dto: UpdateProductData) =>
      api.put<ApiResponse<Product>>(`/products/${id}`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      modal.success({ title: 'Produto atualizado com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao atualizar produto', description: getErrorMessage(error) })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const modal = useModal()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      modal.success({ title: 'Produto removido com sucesso!' })
    },
    onError: (error) => {
      modal.error({ title: 'Erro ao remover produto', description: getErrorMessage(error) })
    },
  })
}

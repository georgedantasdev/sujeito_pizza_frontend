import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ChevronLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useProduct, useUpdateProduct } from '@/hooks/products'

interface FormData {
  name: string
  description: string
  imageUrl: string
  available: boolean
}

export function EditarProduto() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProduct(id!)
  const updateMutation = useUpdateProduct(id!)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description ?? '',
        imageUrl: product.imageUrl ?? '',
        available: product.available,
      })
    }
  }, [product, reset])

  function onSubmit({ name, description, imageUrl, available }: FormData) {
    updateMutation.mutate(
      {
        name,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        available,
      },
      { onSuccess: () => navigate('/admin/produtos') },
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="space-y-4 max-w-lg">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-dark-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-white/50">Produto não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <Link
          to="/admin/produtos"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ChevronLeft size={16} />
          Voltar para produtos
        </Link>
        <h1 className="text-2xl font-bold text-white">Editar produto</h1>
        <p className="mt-1 text-sm text-white/50">{product.name}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
        <Input
          id="name"
          label="Nome do produto"
          error={errors.name?.message}
          {...register('name', {
            required: 'Nome obrigatório',
            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
          })}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-white/70">
            Descrição <span className="text-white/30">(opcional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full resize-none rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
            {...register('description')}
          />
        </div>

        <Input
          id="imageUrl"
          label="URL da imagem (opcional)"
          placeholder="https://..."
          error={errors.imageUrl?.message}
          {...register('imageUrl', {
            validate: (v) => !v || /^https?:\/\/.+/.test(v) || 'URL inválida',
          })}
        />

        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-dark-100 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">Disponível no cardápio</p>
            <p className="text-xs text-white/40">Clientes podem fazer pedido deste produto</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" {...register('available')} />
            <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-brand-red peer-checked:after:translate-x-full" />
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Link to="/admin/produtos" className="flex-1">
            <Button variant="ghost" className="w-full" type="button">
              Cancelar
            </Button>
          </Link>
          <Button variant="green" type="submit" isLoading={updateMutation.isPending} className="flex-1">
            Salvar alterações
          </Button>
        </div>
      </form>

      {/* Tamanhos e sabores (somente leitura) */}
      <div className="mt-10 max-w-lg space-y-6">
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Tamanhos
          </h2>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-dark-100">
                  <th className="px-4 py-2.5 text-left font-medium text-white/50">Tamanho</th>
                  <th className="px-4 py-2.5 text-right font-medium text-white/50">Preço</th>
                </tr>
              </thead>
              <tbody>
                {product.sizes.map((size) => (
                  <tr key={size.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-4 py-2.5 text-white">{size.name}</td>
                    <td className="px-4 py-2.5 text-right text-white/70">
                      {Number(size.price).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Sabores
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.flavors.map((flavor) => (
              <span
                key={flavor.id}
                className="rounded-full bg-dark-100 px-3 py-1 text-sm text-white/60 ring-1 ring-white/10"
              >
                {flavor.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

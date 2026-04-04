import { Link, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useCreateProduct } from '@/hooks/products'
import type { CreateProductData } from '@/hooks/products'

interface FormData {
  name: string
  description: string
  imageUrl: string
  sizes: { name: string; price: string }[]
  flavors: { name: string }[]
}

export function NovoProduto() {
  const navigate = useNavigate()
  const createMutation = useCreateProduct()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      sizes: [{ name: '', price: '' }],
      flavors: [{ name: '' }],
    },
  })

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control,
    name: 'sizes',
  })

  const { fields: flavorFields, append: appendFlavor, remove: removeFlavor } = useFieldArray({
    control,
    name: 'flavors',
  })

  function onSubmit({ name, description, imageUrl, sizes, flavors }: FormData) {
    const dto: CreateProductData = {
      name,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      sizes,
      flavors,
    }

    createMutation.mutate(dto, {
      onSuccess: () => navigate('/admin/produtos'),
    })
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
        <h1 className="text-2xl font-bold text-white">Novo produto</h1>
        <p className="mt-1 text-sm text-white/50">Preencha as informações do produto</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-8">
        {/* Dados gerais */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            Dados gerais
          </h2>
          <div className="space-y-4">
            <Input
              id="name"
              label="Nome do produto"
              placeholder="Ex: Pizza Margherita"
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
                placeholder="Descreva o produto..."
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
                validate: (v) =>
                  !v ||
                  /^https?:\/\/.+/.test(v) ||
                  'URL inválida',
              })}
            />
          </div>
        </section>

        {/* Tamanhos */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Tamanhos e preços
            </h2>
            <button
              type="button"
              onClick={() => appendSize({ name: '', price: '' })}
              className="flex items-center gap-1 text-xs text-brand-red hover:underline"
            >
              <Plus size={13} />
              Adicionar tamanho
            </button>
          </div>
          <div className="space-y-3">
            {sizeFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Ex: Pequena"
                    error={errors.sizes?.[index]?.name?.message}
                    {...register(`sizes.${index}.name`, { required: 'Obrigatório' })}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Ex: 29.90"
                    error={errors.sizes?.[index]?.price?.message}
                    {...register(`sizes.${index}.price`, {
                      required: 'Obrigatório',
                      pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Formato inválido' },
                    })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  disabled={sizeFields.length === 1}
                  className="mt-2.5 p-1 text-white/30 transition-colors hover:text-red-400 disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Sabores */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Sabores
            </h2>
            <button
              type="button"
              onClick={() => appendFlavor({ name: '' })}
              className="flex items-center gap-1 text-xs text-brand-red hover:underline"
            >
              <Plus size={13} />
              Adicionar sabor
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {flavorFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Ex: Mussarela"
                    error={errors.flavors?.[index]?.name?.message}
                    {...register(`flavors.${index}.name`, { required: 'Obrigatório' })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFlavor(index)}
                  disabled={flavorFields.length === 1}
                  className="mt-0.5 p-1 text-white/30 transition-colors hover:text-red-400 disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3 pt-2">
          <Link to="/admin/produtos" className="flex-1">
            <Button variant="ghost" className="w-full" type="button">
              Cancelar
            </Button>
          </Link>
          <Button variant="green" type="submit" isLoading={createMutation.isPending} className="flex-1">
            Cadastrar produto
          </Button>
        </div>
      </form>
    </div>
  )
}

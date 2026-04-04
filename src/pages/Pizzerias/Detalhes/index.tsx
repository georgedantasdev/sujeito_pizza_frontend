import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ChevronLeft, Pencil, Check, X } from 'lucide-react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { usePizzeria, useUpdatePizzeria } from '@/hooks/pizzerias'

interface EditForm {
  name: string
}

export function DetalhesPizzeria() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: pizzeria, isLoading, isError } = usePizzeria(id)
  const updateMutation = useUpdatePizzeria(id)
  const [isEditing, setIsEditing] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditForm>()

  useEffect(() => {
    if (pizzeria) reset({ name: pizzeria.name })
  }, [pizzeria, reset])

  function onSubmit({ name }: EditForm) {
    updateMutation.mutate(name, {
      onSuccess: () => setIsEditing(false),
    })
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-lg space-y-3">
          <div className="h-6 w-32 animate-pulse rounded bg-dark-100" />
          <div className="h-40 animate-pulse rounded-xl bg-dark-100" />
        </div>
      </div>
    )
  }

  if (isError || !pizzeria) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-red-400">Pizzaria não encontrada.</p>
        <Link to="/pizzerias" className="mt-4 inline-block text-sm text-white/50 hover:text-white">
          Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <Link
        to="/pizzerias"
        className="mb-6 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
      >
        <ChevronLeft size={16} />
        Voltar para pizzarias
      </Link>

      <div className="max-w-lg rounded-xl border border-white/10 bg-dark-100 p-6">
        {/* Header do card */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Pizzaria
            </p>
            {!isEditing && (
              <h1 className="mt-1 text-xl font-bold text-white">{pizzeria.name}</h1>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-white/50 ring-1 ring-white/10 transition hover:text-white"
            >
              <Pencil size={12} />
              Editar nome
            </button>
          )}
        </div>

        {/* Formulário de edição */}
        {isEditing && (
          <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-3">
            <Input
              id="name"
              label="Nome da pizzaria"
              error={errors.name?.message}
              {...register('name', {
                required: 'Nome obrigatório',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              })}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="green" size="sm" isLoading={updateMutation.isPending}>
                <Check size={14} />
                Salvar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  reset({ name: pizzeria.name })
                }}
              >
                <X size={14} />
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Detalhes */}
        <div className="space-y-3 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">ID</span>
            <span className="font-mono text-xs text-white/70">{pizzeria.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Criada em</span>
            <span className="text-white/70">
              {new Date(pizzeria.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Última atualização</span>
            <span className="text-white/70">
              {new Date(pizzeria.updatedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

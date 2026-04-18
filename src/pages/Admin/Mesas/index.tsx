import { Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useTables, useCreateTable, useDeleteTable, useOpenTable } from '@/hooks/tables'
import { useProducts } from '@/hooks/products'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'

interface FormData {
  number: string
}

const statusLabel = { FREE: 'Livre', OCCUPIED: 'Ocupada' }
const statusStyle = {
  FREE: 'text-brand-green bg-brand-green/10',
  OCCUPIED: 'text-yellow-400 bg-yellow-400/10',
}

export function AdminMesas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: tables = [], isLoading, isError } = useTables()
  const { data: products = [] } = useProducts()
  const createMutation = useCreateTable()
  const deleteMutation = useDeleteTable()
  const openMutation = useOpenTable()
  const modal = useModal()
  const isAdmin = user?.role === 'ADMIN'
  const hasAvailableProducts = products.some((p) => p.available)
  const basePath = isAdmin ? '/admin/mesas' : '/mesas'

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  function onSubmit({ number }: FormData) {
    createMutation.mutate({ number: Number(number) }, { onSuccess: () => reset() })
  }

  async function handleDelete(id: string, number: number) {
    const ok = await modal.confirm({
      title: `Excluir Mesa ${number}?`,
      description: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      variant: 'danger',
    })
    if (!ok) return
    deleteMutation.mutate(id)
  }

  async function handleOpen(id: string, number: number) {
    const ok = await modal.confirm({
      title: `Abrir Mesa ${number}?`,
      description: hasAvailableProducts
        ? 'A mesa ficará ocupada e pronta para receber pedidos.'
        : 'Atenção: nenhum produto está disponível no momento. Você pode abrir a mesa, mas não conseguirá criar pedidos até cadastrar produtos.',
      confirmLabel: 'Abrir mesa',
      variant: 'default',
    })
    if (!ok) return
    openMutation.mutate(id, {
      onSuccess: () => navigate(`${basePath}/${id}`),
    })
  }

  const sorted = [...tables].sort((a, b) => a.number - b.number)

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mesas</h1>
        <p className="mt-1 text-sm text-white/50">
          {isAdmin ? 'Gerencie as mesas da pizzaria' : 'Selecione uma mesa para abrir'}
        </p>
      </div>

      <div className={isAdmin ? 'grid grid-cols-1 gap-6 lg:grid-cols-3' : ''}>
        {/* Formulário — só admin */}
        {isAdmin && (
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-white/10 bg-dark-100 p-6">
              <h2 className="mb-4 font-semibold text-white">Adicionar mesa</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  id="number"
                  label="Número da mesa"
                  type="number"
                  placeholder="Ex: 1"
                  error={errors.number?.message}
                  {...register('number', {
                    required: 'Número obrigatório',
                    min: { value: 1, message: 'Mínimo 1' },
                    validate: (v) => Number.isInteger(Number(v)) || 'Deve ser inteiro',
                  })}
                />
                <Button variant="green" type="submit" isLoading={createMutation.isPending} className="w-full">
                  <Plus size={16} />
                  Adicionar mesa
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Grade de mesas */}
        <div className={isAdmin ? 'lg:col-span-2' : ''}>
          {isError && (
            <div className="mb-4 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
              Não foi possível carregar as mesas.
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-dark-100" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-16 text-center">
              <p className="text-white/40">Nenhuma mesa cadastrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {sorted.map((table) => (
                <div
                  key={table.id}
                  className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-dark-100 py-6 transition-colors hover:border-white/20"
                >
                  {/* Badge status */}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[table.status]}`}>
                    {statusLabel[table.status]}
                  </span>

                  <span className="text-3xl font-bold text-white">{table.number}</span>
                  <span className="text-xs text-white/40">Mesa</span>

                  {/* Ação */}
                  {table.status === 'FREE' ? (
                    <Button
                      variant="green"
                      size="sm"
                      className="mt-1"
                      isLoading={openMutation.isPending && openMutation.variables === table.id}
                      onClick={() => handleOpen(table.id, table.number)}
                    >
                      Abrir
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() => navigate(`${basePath}/${table.id}`)}
                    >
                      Ver mesa
                    </Button>
                  )}

                  {/* Deletar — só admin, só mesas livres */}
                  {isAdmin && table.status === 'FREE' && (
                    <button
                      onClick={() => handleDelete(table.id, table.number)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === table.id}
                      className="absolute right-2 top-2 rounded p-1 text-white/0 transition-colors group-hover:text-white/30 hover:!text-red-400 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

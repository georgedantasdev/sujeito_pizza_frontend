import { useNavigate, useLocation, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/Button'
import { useTable } from '@/hooks/tables'
import { useCreateOrder } from '@/hooks/orders'

interface FormData {
  note: string
}

export function NovoPedido() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mesaId } = useParams<{ mesaId: string }>()

  const isAdmin = location.pathname.startsWith('/admin')
  const mesaBase = isAdmin ? '/admin/mesas' : '/mesas'

  const { data: table, isLoading: loadingTable } = useTable(mesaId ?? '')
  const createOrder = useCreateOrder()

  const { register, handleSubmit } = useForm<FormData>({ defaultValues: { note: '' } })

  function onSubmit({ note }: FormData) {
    if (!mesaId) return
    createOrder.mutate(
      { tableId: mesaId, note: note.trim() || undefined },
      {
        onSuccess: ({ data }) => {
          navigate(`${mesaBase}/${mesaId}/pedidos/${data.data.id}`)
        },
      },
    )
  }

  if (!mesaId) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-white/50">
          Acesse esta página a partir de uma mesa aberta.{' '}
          <Link to={mesaBase} className="text-brand-red hover:underline">
            Ver mesas
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <Link
          to={`${mesaBase}/${mesaId}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ChevronLeft size={16} />
          Voltar para mesa
        </Link>
        <h1 className="text-2xl font-bold text-white">Novo Pedido</h1>
        {loadingTable ? (
          <div className="mt-1 h-4 w-24 animate-pulse rounded bg-dark-100" />
        ) : (
          <p className="mt-1 text-sm text-white/50">Mesa {table?.number}</p>
        )}
      </div>

      <div className="max-w-md">
        <div className="rounded-xl border border-white/10 bg-dark-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="note" className="text-sm font-medium text-white/70">
                Observação <span className="text-white/30">(opcional)</span>
              </label>
              <textarea
                id="note"
                rows={3}
                placeholder="Ex: cliente com alergia a glúten"
                className="w-full resize-none rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                {...register('note')}
              />
            </div>

            <Button
              type="submit"
              variant="green"
              className="w-full"
              isLoading={createOrder.isPending}
            >
              Criar pedido
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

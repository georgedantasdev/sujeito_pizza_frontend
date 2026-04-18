import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import { useCreateDelivery } from '@/hooks/delivery'

interface FormData {
  customerName: string
  note: string
}

export function NovaEntrega() {
  const navigate = useNavigate()
  const location = useLocation()
  const base = location.pathname.startsWith('/admin') ? '/admin/delivery' : '/delivery'
  const createDelivery = useCreateDelivery()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { customerName: '', note: '' } })

  function onSubmit({ customerName, note }: FormData) {
    createDelivery.mutate(
      { customerName, note: note.trim() || undefined },
      {
        onSuccess: (res) => {
          const id = (res.data as any).data?.id
          if (id) navigate(`${base}/${id}`)
          else navigate(base)
        },
      },
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Nova entrega</h1>
        <p className="mt-1 text-sm text-white/50">Preencha os dados para abrir uma nova entrega</p>
      </div>

      <div className="max-w-md">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-xl border border-white/10 bg-dark-100 p-6"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Nome do cliente <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              className={`w-full rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 transition focus:ring-brand-red ${
                errors.customerName ? 'ring-red-500' : 'ring-white/10'
              }`}
              {...register('customerName', { required: 'Nome do cliente é obrigatório' })}
            />
            {errors.customerName && (
              <p className="text-xs text-red-400">{errors.customerName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Observação <span className="text-white/30">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Entregar no portão dos fundos"
              className="w-full resize-none rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
              {...register('note')}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => navigate(base)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="green"
              className="flex-1"
              isLoading={createDelivery.isPending}
            >
              Abrir entrega
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

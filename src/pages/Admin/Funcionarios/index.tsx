import { Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/users'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'

interface FormData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'EMPLOYEE'
}

const roleLabelMap: Record<string, string> = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Funcionário',
  SUPER_ADMIN: 'Super Admin',
}

export function AdminFuncionarios() {
  const { user: currentUser } = useAuth()
  const { data: users = [], isLoading, isError } = useUsers()
  const createMutation = useCreateUser()
  const deleteMutation = useDeleteUser()
  const modal = useModal()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { role: 'EMPLOYEE' } })

  function onSubmit(data: FormData) {
    createMutation.mutate(data, { onSuccess: () => reset({ role: 'EMPLOYEE' }) })
  }

  async function handleDelete(id: string, name: string) {
    const ok = await modal.confirm({
      title: `Remover "${name}"?`,
      description: 'O funcionário perderá o acesso ao sistema.',
      confirmLabel: 'Remover',
      variant: 'danger',
    })
    if (!ok) return
    deleteMutation.mutate(id)
  }

  const manageable = users.filter((u) => u.role !== 'SUPER_ADMIN')

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Funcionários</h1>
        <p className="mt-1 text-sm text-white/50">Gerencie os usuários da sua pizzaria</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-white/10 bg-dark-100 p-6">
            <h2 className="mb-4 font-semibold text-white">Novo funcionário</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="name"
                label="Nome completo"
                placeholder="Ex: João Silva"
                error={errors.name?.message}
                {...register('name', {
                  required: 'Nome obrigatório',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                })}
              />
              <Input
                id="email"
                type="email"
                label="E-mail"
                placeholder="joao@pizzaria.com"
                error={errors.email?.message}
                {...register('email', { required: 'E-mail obrigatório' })}
              />
              <Input
                id="password"
                type="password"
                label="Senha"
                placeholder="Mínimo 6 caracteres"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Senha obrigatória',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="role" className="text-sm font-medium text-white/70">
                  Função
                </label>
                <select
                  id="role"
                  className="w-full rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                  {...register('role')}
                >
                  <option value="EMPLOYEE">Funcionário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <Button
                variant="green"
                type="submit"
                isLoading={createMutation.isPending}
                className="w-full"
              >
                <Plus size={16} />
                Cadastrar
              </Button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          {isError && (
            <div className="mb-4 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
              Não foi possível carregar os funcionários.
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-dark-100" />
              ))}
            </div>
          ) : manageable.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 py-16 text-center">
              <p className="text-white/40">Nenhum funcionário cadastrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-dark-100">
                    <th className="px-6 py-3 text-left font-medium text-white/50">Nome</th>
                    <th className="px-6 py-3 text-left font-medium text-white/50">E-mail</th>
                    <th className="px-6 py-3 text-left font-medium text-white/50">Função</th>
                    <th className="px-6 py-3 text-right font-medium text-white/50">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {manageable.map((user, i) => (
                    <tr
                      key={user.id}
                      className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                        i === manageable.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                      <td className="px-6 py-4 text-white/50">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            user.role === 'ADMIN'
                              ? 'bg-brand-red/10 text-brand-red'
                              : 'bg-white/5 text-white/50'
                          }`}
                        >
                          {roleLabelMap[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={
                              deleteMutation.isPending && deleteMutation.variables === user.id
                            }
                            onClick={() => handleDelete(user.id, user.name)}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                            Remover
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

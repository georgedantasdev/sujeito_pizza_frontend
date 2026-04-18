import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useUsers, useCreateUser, useDeleteUser, useUpdateUser } from '@/hooks/users'
import type { User } from '@/hooks/users'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'

interface CreateFormData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'EMPLOYEE'
}

interface EditFormData {
  name: string
  email: string
  password: string
}

const roleLabelMap: Record<string, string> = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Funcionário',
  SUPER_ADMIN: 'Super Admin',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function AdminFuncionarios() {
  const { user: currentUser } = useAuth()
  const { data: users = [], isLoading, isError } = useUsers()
  const createMutation = useCreateUser()
  const deleteMutation = useDeleteUser()
  const modal = useModal()

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const updateMutation = useUpdateUser(editingUser?.id ?? '')

  const {
    register: registerCreate,
    handleSubmit: handleCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CreateFormData>({ defaultValues: { role: 'EMPLOYEE' } })

  const {
    register: registerEdit,
    handleSubmit: handleEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditFormData>()

  function onCreateSubmit(data: CreateFormData) {
    createMutation.mutate(data, {
      onSuccess: () => {
        resetCreate({ role: 'EMPLOYEE' })
        setShowCreateForm(false)
      },
    })
  }

  function onEditSubmit({ name, email, password }: EditFormData) {
    updateMutation.mutate(
      { name, email, password: password || undefined },
      {
        onSuccess: () => {
          setEditingUser(null)
          resetEdit()
        },
      },
    )
  }

  function startEdit(user: User) {
    setEditingUser(user)
    setShowCreateForm(false)
    resetEdit({ name: user.name, email: user.email, password: '' })
  }

  function cancelEdit() {
    setEditingUser(null)
    resetEdit()
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
  const formOpen = showCreateForm || !!editingUser

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Funcionários</h1>
          <p className="mt-1 text-sm text-white/50">Gerencie os usuários da sua pizzaria</p>
        </div>
        <button
          onClick={() => { setShowCreateForm(true); setEditingUser(null) }}
          className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-dark transition-opacity hover:opacity-90 sm:hidden"
        >
          <Plus size={16} />
          Novo
        </button>
      </div>

      {/* Mobile: formulário expansível */}
      {formOpen && (
        <div className="mb-4 sm:hidden">
          <div className="rounded-xl border border-white/10 bg-dark-100 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-white">
                {editingUser ? 'Editar funcionário' : 'Novo funcionário'}
              </h2>
              <button
                onClick={editingUser ? cancelEdit : () => setShowCreateForm(false)}
                className="rounded-md p-1 text-white/40 transition-colors hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {editingUser ? (
              <form onSubmit={handleEdit(onEditSubmit)} className="space-y-3">
                <Input
                  id="m-edit-name"
                  label="Nome completo"
                  placeholder="Ex: João Silva"
                  error={editErrors.name?.message}
                  {...registerEdit('name', {
                    required: 'Nome obrigatório',
                    minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  })}
                />
                <Input
                  id="m-edit-email"
                  type="email"
                  label="E-mail"
                  placeholder="joao@pizzaria.com"
                  error={editErrors.email?.message}
                  {...registerEdit('email', { required: 'E-mail obrigatório' })}
                />
                <Input
                  id="m-edit-password"
                  type="password"
                  label="Nova senha"
                  placeholder="Deixe em branco para manter"
                  error={editErrors.password?.message}
                  {...registerEdit('password', {
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })}
                />
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="ghost" className="flex-1" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                  <Button variant="green" type="submit" isLoading={updateMutation.isPending} className="flex-1">
                    Salvar
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreate(onCreateSubmit)} className="space-y-3">
                <Input
                  id="m-name"
                  label="Nome completo"
                  placeholder="Ex: João Silva"
                  error={createErrors.name?.message}
                  {...registerCreate('name', {
                    required: 'Nome obrigatório',
                    minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  })}
                />
                <Input
                  id="m-email"
                  type="email"
                  label="E-mail"
                  placeholder="joao@pizzaria.com"
                  error={createErrors.email?.message}
                  {...registerCreate('email', { required: 'E-mail obrigatório' })}
                />
                <Input
                  id="m-password"
                  type="password"
                  label="Senha"
                  placeholder="Mínimo 6 caracteres"
                  error={createErrors.password?.message}
                  {...registerCreate('password', {
                    required: 'Senha obrigatória',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-white/70">Função</label>
                  <select
                    className="w-full rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-brand-red"
                    {...registerCreate('role')}
                  >
                    <option value="EMPLOYEE">Funcionário</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <Button variant="green" type="submit" isLoading={createMutation.isPending} className="w-full">
                  <Plus size={16} />
                  Cadastrar
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Desktop: form panel */}
        <div className="hidden lg:col-span-1 lg:block">
          <div className="rounded-xl border border-white/10 bg-dark-100 p-6">
            {editingUser ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-white">Editar funcionário</h2>
                  <button
                    onClick={cancelEdit}
                    className="rounded-md p-1 text-white/40 transition-colors hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleEdit(onEditSubmit)} className="space-y-4">
                  <Input
                    id="edit-name"
                    label="Nome completo"
                    placeholder="Ex: João Silva"
                    error={editErrors.name?.message}
                    {...registerEdit('name', {
                      required: 'Nome obrigatório',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                    })}
                  />
                  <Input
                    id="edit-email"
                    type="email"
                    label="E-mail"
                    placeholder="joao@pizzaria.com"
                    error={editErrors.email?.message}
                    {...registerEdit('email', { required: 'E-mail obrigatório' })}
                  />
                  <Input
                    id="edit-password"
                    type="password"
                    label="Nova senha"
                    placeholder="Deixe em branco para manter"
                    error={editErrors.password?.message}
                    {...registerEdit('password', {
                      minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                    })}
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={cancelEdit}>
                      Cancelar
                    </Button>
                    <Button variant="green" type="submit" isLoading={updateMutation.isPending} className="flex-1">
                      Salvar
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="mb-4 font-semibold text-white">Novo funcionário</h2>
                <form onSubmit={handleCreate(onCreateSubmit)} className="space-y-4">
                  <Input
                    id="name"
                    label="Nome completo"
                    placeholder="Ex: João Silva"
                    error={createErrors.name?.message}
                    {...registerCreate('name', {
                      required: 'Nome obrigatório',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                    })}
                  />
                  <Input
                    id="email"
                    type="email"
                    label="E-mail"
                    placeholder="joao@pizzaria.com"
                    error={createErrors.email?.message}
                    {...registerCreate('email', { required: 'E-mail obrigatório' })}
                  />
                  <Input
                    id="password"
                    type="password"
                    label="Senha"
                    placeholder="Mínimo 6 caracteres"
                    error={createErrors.password?.message}
                    {...registerCreate('password', {
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
                      {...registerCreate('role')}
                    >
                      <option value="EMPLOYEE">Funcionário</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  <Button variant="green" type="submit" isLoading={createMutation.isPending} className="w-full">
                    <Plus size={16} />
                    Cadastrar
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="lg:col-span-2">
          {isError && (
            <div className="mb-4 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
              Não foi possível carregar os funcionários.
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-dark-100" />
              ))}
            </div>
          ) : manageable.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-16 text-center">
              <p className="text-white/40">Nenhum funcionário cadastrado.</p>
            </div>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="space-y-3 lg:hidden">
                {manageable.map((user) => (
                  <div
                    key={user.id}
                    className={`rounded-xl border bg-dark-100 p-4 transition-colors ${
                      editingUser?.id === user.id ? 'border-white/20' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dark-200 text-sm font-bold text-white/60">
                        {getInitials(user.name)}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-white">{user.name}</p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                              user.role === 'ADMIN'
                                ? 'bg-brand-red/10 text-brand-red'
                                : 'bg-white/5 text-white/50'
                            }`}
                          >
                            {roleLabelMap[user.role]}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-white/40">{user.email}</p>
                      </div>

                      {/* Ações */}
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => startEdit(user)}
                          className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <Pencil size={15} />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={deleteMutation.isPending && deleteMutation.variables === user.id}
                            className="rounded-lg p-2 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: tabela */}
              <div className="hidden overflow-hidden rounded-xl border border-white/10 lg:block">
                <table className="w-full text-sm">
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
                          editingUser?.id === user.id ? 'bg-white/[0.03]' : ''
                        } ${i === manageable.length - 1 ? 'border-b-0' : ''}`}
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
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => startEdit(user)}>
                              <Pencil size={14} />
                              Editar
                            </Button>
                            {user.id !== currentUser?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                isLoading={deleteMutation.isPending && deleteMutation.variables === user.id}
                                onClick={() => handleDelete(user.id, user.name)}
                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                <Trash2 size={14} />
                                Remover
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

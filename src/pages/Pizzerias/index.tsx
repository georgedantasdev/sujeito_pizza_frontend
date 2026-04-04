import { Link } from 'react-router-dom'
import { Plus, Eye, PowerOff, Power } from 'lucide-react'
import { Button } from '@/components/Button'
import { usePizzerias, useDeletePizzeria, useActivatePizzeria } from '@/hooks/pizzerias'
import { useModal } from '@/contexts/ModalContext'

export function Pizzerias() {
  const { data: pizzerias = [], isLoading, isError } = usePizzerias()
  const deactivateMutation = useDeletePizzeria()
  const activateMutation = useActivatePizzeria()
  const modal = useModal()

  async function handleDeactivate(id: string, name: string) {
    const ok = await modal.confirm({
      title: `Desativar "${name}"?`,
      description: 'Todos os usuários da pizzaria também serão desativados.',
      confirmLabel: 'Desativar',
      variant: 'danger',
    })
    if (!ok) return
    deactivateMutation.mutate(id)
  }

  async function handleActivate(id: string, name: string) {
    const ok = await modal.confirm({
      title: `Ativar "${name}"?`,
      description: 'Todos os usuários da pizzaria também serão reativados.',
      confirmLabel: 'Ativar',
      variant: 'default',
    })
    if (!ok) return
    activateMutation.mutate(id)
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pizzarias</h1>
          <p className="mt-1 text-sm text-white/50">
            Gerencie todas as pizzarias cadastradas na plataforma
          </p>
        </div>
        <Link to="/pizzerias/nova">
          <Button variant="green">
            <Plus size={16} />
            Nova pizzaria
          </Button>
        </Link>
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-6 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Não foi possível carregar as pizzarias.
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-dark-100 sm:h-14" />
          ))}
        </div>
      ) : pizzerias.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 py-20 text-center">
          <p className="text-white/40">Nenhuma pizzaria cadastrada ainda.</p>
          <Link to="/pizzerias/nova" className="text-sm text-brand-red hover:underline">
            Criar primeira pizzaria
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile — cards */}
          <div className="space-y-3 sm:hidden">
            {pizzerias.map((pizzeria) => (
              <div
                key={pizzeria.id}
                className="rounded-lg border border-white/10 bg-dark-100 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{pizzeria.name}</p>
                    <p className="mt-0.5 text-xs text-white/40">
                      {new Date(pizzeria.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      pizzeria.isActive
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {pizzeria.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  {pizzeria.isActive && (
                    <Link to={`/pizzerias/${pizzeria.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        <Eye size={14} />
                        Detalhes
                      </Button>
                    </Link>
                  )}
                  {pizzeria.isActive ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      isLoading={
                        deactivateMutation.isPending &&
                        deactivateMutation.variables === pizzeria.id
                      }
                      onClick={() => handleDeactivate(pizzeria.id, pizzeria.name)}
                      className="flex-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <PowerOff size={14} />
                      Desativar
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      isLoading={
                        activateMutation.isPending &&
                        activateMutation.variables === pizzeria.id
                      }
                      onClick={() => handleActivate(pizzeria.id, pizzeria.name)}
                      className="w-full text-green-400 hover:bg-green-500/10 hover:text-green-300"
                    >
                      <Power size={14} />
                      Ativar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop — table */}
          <div className="hidden overflow-x-auto rounded-lg border border-white/10 sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-dark-100">
                  <th className="px-6 py-3 text-left font-medium text-white/50">Nome</th>
                  <th className="px-6 py-3 text-left font-medium text-white/50">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-white/50">Criada em</th>
                  <th className="px-6 py-3 text-right font-medium text-white/50">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pizzerias.map((pizzeria, i) => (
                  <tr
                    key={pizzeria.id}
                    className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                      i === pizzerias.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-white">{pizzeria.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          pizzeria.isActive
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-white/5 text-white/40'
                        }`}
                      >
                        {pizzeria.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/50">
                      {new Date(pizzeria.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {pizzeria.isActive && (
                          <Link to={`/pizzerias/${pizzeria.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye size={14} />
                              Detalhes
                            </Button>
                          </Link>
                        )}
                        {pizzeria.isActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={
                              deactivateMutation.isPending &&
                              deactivateMutation.variables === pizzeria.id
                            }
                            onClick={() => handleDeactivate(pizzeria.id, pizzeria.name)}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <PowerOff size={14} />
                            Desativar
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={
                              activateMutation.isPending &&
                              activateMutation.variables === pizzeria.id
                            }
                            onClick={() => handleActivate(pizzeria.id, pizzeria.name)}
                            className="text-green-400 hover:bg-green-500/10 hover:text-green-300"
                          >
                            <Power size={14} />
                            Ativar
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
  )
}

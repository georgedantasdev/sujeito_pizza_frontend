import { Link } from 'react-router-dom'
import { Plus, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/Button'
import { usePizzerias, useDeletePizzeria } from '@/hooks/usePizzerias'

export function Pizzerias() {
  const { data: pizzerias = [], isLoading, isError } = usePizzerias()
  const deleteMutation = useDeletePizzeria()

  function handleDelete(id: string, name: string) {
    if (!confirm(`Deseja excluir a pizzaria "${name}"? Esta ação não pode ser desfeita.`)) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
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
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg bg-dark-100"
            />
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
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-dark-100">
                <th className="px-6 py-3 text-left font-medium text-white/50">Nome</th>
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
                  <td className="px-6 py-4 text-white/50">
                    {new Date(pizzeria.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/pizzerias/${pizzeria.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye size={14} />
                          Detalhes
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={
                          deleteMutation.isPending &&
                          deleteMutation.variables === pizzeria.id
                        }
                        onClick={() => handleDelete(pizzeria.id, pizzeria.name)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

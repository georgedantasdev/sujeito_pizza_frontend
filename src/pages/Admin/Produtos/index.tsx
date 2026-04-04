import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/Button'
import { useProducts, useDeleteProduct, useUpdateProduct } from '@/hooks/products'
import { useModal } from '@/contexts/ModalContext'

export function AdminProdutos() {
  const { data: products = [], isLoading, isError } = useProducts()
  const deleteMutation = useDeleteProduct()
  const modal = useModal()

  async function handleDelete(id: string, name: string) {
    const ok = await modal.confirm({
      title: `Excluir "${name}"?`,
      description: 'O produto será removido do cardápio permanentemente.',
      confirmLabel: 'Excluir',
      variant: 'danger',
    })
    if (!ok) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
          <p className="mt-1 text-sm text-white/50">Gerencie o cardápio da sua pizzaria</p>
        </div>
        <Link to="/admin/produtos/novo">
          <Button variant="green">
            <Plus size={16} />
            Novo produto
          </Button>
        </Link>
      </div>

      {isError && (
        <div className="mb-6 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Não foi possível carregar os produtos.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-dark-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 py-20 text-center">
          <p className="text-white/40">Nenhum produto cadastrado ainda.</p>
          <Link to="/admin/produtos/novo" className="text-sm text-brand-red hover:underline">
            Criar primeiro produto
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-dark-100">
                <th className="px-6 py-3 text-left font-medium text-white/50">Nome</th>
                <th className="px-6 py-3 text-left font-medium text-white/50">Tamanhos</th>
                <th className="px-6 py-3 text-left font-medium text-white/50">Sabores</th>
                <th className="px-6 py-3 text-center font-medium text-white/50">Disponível</th>
                <th className="px-6 py-3 text-right font-medium text-white/50">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isLast={i === products.length - 1}
                  onDelete={() => handleDelete(product.id, product.name)}
                  isDeleting={
                    deleteMutation.isPending && deleteMutation.variables === product.id
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ProductRow({
  product,
  isLast,
  onDelete,
  isDeleting,
}: {
  product: ReturnType<typeof useProducts>['data'] extends (infer T)[] | undefined ? T : never
  isLast: boolean
  onDelete: () => void
  isDeleting: boolean
}) {
  const updateMutation = useUpdateProduct(product.id)

  function toggleAvailability() {
    updateMutation.mutate({ available: !product.available })
  }

  return (
    <tr
      className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
        isLast ? 'border-b-0' : ''
      }`}
    >
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-white">{product.name}</p>
          {product.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-white/40">{product.description}</p>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-white/60">
        {product.sizes.map((s) => s.name).join(', ')}
      </td>
      <td className="px-6 py-4 text-white/60">{product.flavors.length} sabores</td>
      <td className="px-6 py-4 text-center">
        <button
          onClick={toggleAvailability}
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-1.5 text-xs transition-opacity disabled:opacity-50"
        >
          {product.available ? (
            <ToggleRight size={20} className="text-brand-green" />
          ) : (
            <ToggleLeft size={20} className="text-white/30" />
          )}
          <span className={product.available ? 'text-brand-green' : 'text-white/30'}>
            {product.available ? 'Sim' : 'Não'}
          </span>
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link to={`/admin/produtos/${product.id}`}>
            <Button variant="ghost" size="sm">
              <Pencil size={14} />
              Editar
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            isLoading={isDeleting}
            onClick={onDelete}
            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 size={14} />
            Excluir
          </Button>
        </div>
      </td>
    </tr>
  )
}

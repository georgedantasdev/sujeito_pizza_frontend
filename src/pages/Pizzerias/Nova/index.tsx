import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useCreatePizzeria } from '@/hooks/pizzerias'
import type { CreatePizzeriaData } from '@/hooks/pizzerias'

function formatCnpj(raw: string) {
  return raw
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

interface FormData {
  pizzeriaName: string
  document: string
  adminName: string
  adminEmail: string
  adminPassword: string
}

export function NovaPizzeria() {
  const navigate = useNavigate()
  const createMutation = useCreatePizzeria()
  const [cnpjDisplay, setCnpjDisplay] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>()

  function handleCnpjChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 14)
    setCnpjDisplay(formatCnpj(raw))
    setValue('document', raw, { shouldValidate: true })
  }

  function onSubmit({ pizzeriaName, document, adminName, adminEmail, adminPassword }: FormData) {
    const dto: CreatePizzeriaData = {
      name: pizzeriaName,
      document,
      admin: { name: adminName, email: adminEmail, password: adminPassword },
    }

    createMutation.mutate(dto, {
      onSuccess: () => navigate('/pizzerias'),
    })
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <Link
          to="/pizzerias"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ChevronLeft size={16} />
          Voltar para pizzarias
        </Link>
        <h1 className="text-2xl font-bold text-white">Nova pizzaria</h1>
        <p className="mt-1 text-sm text-white/50">
          Preencha os dados da pizzaria e do administrador responsável
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-8">
        {/* Pizzaria */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            Dados da pizzaria
          </h2>
          <div className="space-y-4">
            <Input
              id="pizzeriaName"
              label="Nome da pizzaria"
              placeholder="Ex: Pizzaria do João"
              error={errors.pizzeriaName?.message}
              {...register('pizzeriaName', {
                required: 'Nome obrigatório',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              })}
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="cnpj" className="text-sm font-medium text-white/70">
                CNPJ
              </label>
              <input
                id="cnpj"
                type="text"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                value={cnpjDisplay}
                onChange={handleCnpjChange}
                className={`w-full rounded-md bg-dark-200 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 transition focus:ring-brand-red ${
                  errors.document ? 'ring-red-500' : 'ring-white/10'
                }`}
              />
              <input
                type="hidden"
                {...register('document', {
                  required: 'CNPJ obrigatório',
                  validate: (v) => v.length === 14 || 'CNPJ deve ter 14 dígitos',
                })}
              />
              {errors.document && (
                <span className="text-xs text-red-400">{errors.document.message}</span>
              )}
            </div>
          </div>
        </section>

        {/* Admin */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            Administrador responsável
          </h2>
          <div className="space-y-4">
            <Input
              id="adminName"
              label="Nome completo"
              placeholder="Ex: João Silva"
              error={errors.adminName?.message}
              {...register('adminName', {
                required: 'Nome obrigatório',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              })}
            />
            <Input
              id="adminEmail"
              type="email"
              label="E-mail"
              placeholder="admin@pizzaria.com"
              error={errors.adminEmail?.message}
              {...register('adminEmail', { required: 'E-mail obrigatório' })}
            />
            <Input
              id="adminPassword"
              type="password"
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              error={errors.adminPassword?.message}
              {...register('adminPassword', {
                required: 'Senha obrigatória',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
          </div>
        </section>

        <div className="flex gap-3 pt-2">
          <Link to="/pizzerias" className="flex-1">
            <Button variant="ghost" className="w-full" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            variant="green"
            type="submit"
            isLoading={createMutation.isPending}
            className="flex-1"
          >
            Cadastrar pizzaria
          </Button>
        </div>
      </form>
    </div>
  )
}

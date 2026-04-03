import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Logo } from '@/components/Logo'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

interface LoginFormData {
  email: string
  password: string
}

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>()

  async function onSubmit({ email, password }: LoginFormData) {
    try {
      const role = await signIn(email, password)
      navigate(role === 'SUPER_ADMIN' ? '/pizzerias' : '/admin')
    } catch (err: unknown) {
      // Exibe o erro diretamente no campo raiz do formulário — persiste
      // até o usuário tentar novamente, sem desaparecer
      setError('root', {
        message: getErrorMessage(err, 'E-mail ou senha inválidos.'),
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Logo className="h-10 w-auto" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            placeholder="Digite seu e-mail"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email', { required: 'E-mail obrigatório' })}
          />

          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Senha obrigatória' })}
          />

          {errors.root && (
            <p className="rounded-md bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" variant="red" isLoading={isSubmitting} className="mt-1 w-full">
            Acessar
          </Button>
        </form>
      </div>
    </div>
  )
}

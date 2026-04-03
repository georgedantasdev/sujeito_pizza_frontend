import { AxiosError } from 'axios'

export function getErrorMessage(error: unknown, fallback = 'Algo deu errado.'): string {
  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const msg = axiosError?.response?.data?.message
  if (Array.isArray(msg)) return msg.join(', ')
  return msg ?? fallback
}

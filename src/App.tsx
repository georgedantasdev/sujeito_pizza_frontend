import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { Router } from '@/routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60, // 1 minuto
    },
    mutations: {
      retry: 0, // Nunca repetir mutations automaticamente (evita duplicações)
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{ duration: 3000 }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}

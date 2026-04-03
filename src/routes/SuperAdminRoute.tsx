import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function SuperAdminRoute() {
  const { user } = useAuth()

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

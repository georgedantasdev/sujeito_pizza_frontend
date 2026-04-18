import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function EmployeeRoute() {
  const { user } = useAuth()

  if (user?.role !== 'EMPLOYEE') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

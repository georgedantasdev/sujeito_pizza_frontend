import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { SuperAdminRoute } from './SuperAdminRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Login } from '@/pages/Login'
import { EmBreve } from '@/pages/EmBreve'
import { Pizzerias } from '@/pages/Pizzerias'
import { NovaPizzeria } from '@/pages/Pizzerias/Nova'
import { DetalhesPizzeria } from '@/pages/Pizzerias/Detalhes'

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          {/* Área do admin da pizzaria */}
          <Route path="/admin" element={<EmBreve />} />

          {/* Área exclusiva do Super Admin */}
          <Route element={<SuperAdminRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/pizzerias" element={<Pizzerias />} />
              <Route path="/pizzerias/nova" element={<NovaPizzeria />} />
              <Route path="/pizzerias/:id" element={<DetalhesPizzeria />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/pizzerias" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

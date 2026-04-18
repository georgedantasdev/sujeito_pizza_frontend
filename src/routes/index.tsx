import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { PrivateRoute } from './PrivateRoute'
import { SuperAdminRoute } from './SuperAdminRoute'
import { AdminRoute } from './AdminRoute'
import { EmployeeRoute } from './EmployeeRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Login } from '@/pages/Login'
import { Pizzerias } from '@/pages/Pizzerias'
import { NovaPizzeria } from '@/pages/Pizzerias/Nova'
import { DetalhesPizzeria } from '@/pages/Pizzerias/Detalhes'
import { AdminDashboard } from '@/pages/Admin/Dashboard'
import { AdminProdutos } from '@/pages/Admin/Produtos'
import { NovoProduto } from '@/pages/Admin/Produtos/Novo'
import { EditarProduto } from '@/pages/Admin/Produtos/Editar'
import { AdminMesas } from '@/pages/Admin/Mesas'
import { DetalhesMesa } from '@/pages/Admin/Mesas/Detalhes'
import { AdminFuncionarios } from '@/pages/Admin/Funcionarios'
import { NovoPedido } from '@/pages/Admin/Pedidos/Novo'
import { DetalhesPedido } from '@/pages/Admin/Pedidos/Detalhes'
import { AdminDelivery } from '@/pages/Admin/Delivery'
import { NovaEntrega } from '@/pages/Admin/Delivery/Nova'
import { DetalhesEntrega } from '@/pages/Admin/Delivery/Detalhes'
import { EmployeeHome } from '@/pages/Employee/Home'

function RoleRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'SUPER_ADMIN') return <Navigate to="/pizzerias" replace />
  if (user?.role === 'EMPLOYEE') return <Navigate to="/home" replace />
  return <Navigate to="/admin" replace />
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          {/* Área do admin da pizzaria */}
          <Route element={<AdminRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/produtos" element={<AdminProdutos />} />
              <Route path="/admin/produtos/novo" element={<NovoProduto />} />
              <Route path="/admin/produtos/:id" element={<EditarProduto />} />
              <Route path="/admin/mesas" element={<AdminMesas />} />
              <Route path="/admin/mesas/:id" element={<DetalhesMesa />} />
              <Route path="/admin/mesas/:mesaId/pedidos/novo" element={<NovoPedido />} />
              <Route path="/admin/mesas/:mesaId/pedidos/:id" element={<DetalhesPedido />} />
              <Route path="/admin/funcionarios" element={<AdminFuncionarios />} />
              <Route path="/admin/delivery" element={<AdminDelivery />} />
              <Route path="/admin/delivery/novo" element={<NovaEntrega />} />
              <Route path="/admin/delivery/:id" element={<DetalhesEntrega />} />
            </Route>
          </Route>

          {/* Área do funcionário */}
          <Route element={<EmployeeRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/home" element={<EmployeeHome />} />
              <Route path="/mesas" element={<AdminMesas />} />
              <Route path="/mesas/:id" element={<DetalhesMesa />} />
              <Route path="/mesas/:mesaId/pedidos/novo" element={<NovoPedido />} />
              <Route path="/mesas/:mesaId/pedidos/:id" element={<DetalhesPedido />} />
              <Route path="/delivery" element={<AdminDelivery />} />
              <Route path="/delivery/novo" element={<NovaEntrega />} />
              <Route path="/delivery/:id" element={<DetalhesEntrega />} />
            </Route>
          </Route>

          {/* Área exclusiva do Super Admin */}
          <Route element={<SuperAdminRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/pizzerias" element={<Pizzerias />} />
              <Route path="/pizzerias/nova" element={<NovaPizzeria />} />
              <Route path="/pizzerias/:id" element={<DetalhesPizzeria />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

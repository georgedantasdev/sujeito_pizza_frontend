import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { SuperAdminRoute } from './SuperAdminRoute'
import { AdminRoute } from './AdminRoute'
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
import { AdminFuncionarios } from '@/pages/Admin/Funcionarios'
import { AdminPedidos } from '@/pages/Admin/Pedidos'
import { DetalhesPedido } from '@/pages/Admin/Pedidos/Detalhes'

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
              <Route path="/admin/funcionarios" element={<AdminFuncionarios />} />
              <Route path="/admin/pedidos" element={<AdminPedidos />} />
              <Route path="/admin/pedidos/:id" element={<DetalhesPedido />} />
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

        <Route path="*" element={<Navigate to="/pizzerias" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

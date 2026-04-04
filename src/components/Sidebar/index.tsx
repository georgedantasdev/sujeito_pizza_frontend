import { LayoutDashboard, LogOut, Pizza, ShoppingBag, Store, Table2, Users, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'

const superAdminNav = [
  { to: '/pizzerias', label: 'Pizzarias', icon: Store },
]

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/produtos', label: 'Produtos', icon: Pizza },
  { to: '/admin/mesas', label: 'Mesas', icon: Table2 },
  { to: '/admin/funcionarios', label: 'Funcionários', icon: Users },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const navItems = user?.role === 'ADMIN' ? adminNav : superAdminNav

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-dark-100 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo + close button */}
      <div className="flex items-center justify-between px-6 py-6">
        <Logo className="h-6 w-auto" />
        <button
          onClick={onClose}
          className="rounded-md p-1 text-white/40 transition-colors hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-red/15 text-brand-red'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3 truncate">
          <p className="text-xs font-medium text-white/40">
            {user?.role === 'ADMIN' ? 'Administrador' : 'Super Admin'}
          </p>
          <p className="truncate text-sm text-white/70">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}

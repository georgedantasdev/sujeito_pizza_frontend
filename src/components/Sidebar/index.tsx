import { LogOut, Store } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/pizzerias', label: 'Pizzarias', icon: Store },
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-dark-100">
      {/* Logo */}
      <div className="flex items-center px-6 py-6">
        <Logo className="h-6 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
          <p className="text-xs font-medium text-white/40">Super Admin</p>
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

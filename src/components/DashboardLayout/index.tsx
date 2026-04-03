import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

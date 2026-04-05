import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '../components/AdminSidebar'
import { Icon } from '../../../components/ui/Icon'

export function AdminSection() {
  return (
    <>
      <AdminSidebar />
      <div className="ml-64 min-h-screen">
        <Outlet />
      </div>
      <div className="fixed bottom-8 right-8 z-50">
        <button
          type="button"
          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-2xl hover:scale-110 active:scale-95 transition-transform"
          aria-label="Thao tác nhanh"
        >
          <Icon name="auto_fix" className="text-3xl" />
        </button>
      </div>
    </>
  )
}

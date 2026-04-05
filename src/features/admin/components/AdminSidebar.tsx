import { NavLink } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'flex items-center gap-4 bg-gradient-to-r from-primary-container/20 to-transparent text-primary border-l-4 border-primary px-6 py-3 font-label text-xs uppercase tracking-widest'
    : 'flex items-center gap-4 text-on-surface-variant px-6 py-3 hover:bg-background transition-transform duration-200 hover:translate-x-1 font-label text-xs uppercase tracking-widest border-l-4 border-transparent'

export function AdminSidebar() {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 flex flex-col py-6 pt-24 bg-surface-container-lowest border-r border-outline-variant/10">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-primary-container/30 bg-surface-container-high shrink-0">
            <img
              alt="Hồ sơ chiến thuật gia"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfSC2vBI-MJJ2jsYjCmLAYMFqJ2qlmpJ4UHjLMR1q93-1xpSFd5DhIonrjfKwKw9eYhf8QtOObljsGxr6_M16kEfUkD8V9p7_ClVTrS4WwWTjp4c7p33o5lOqJH0GceSZtlHw7dJu-OS_fEjooQUNTwuHSWrvkquuzUmNuQ9Z4ozmqnG_PnqX1hdlRQE4Eig6g-1XL07_T6meIHH9UDwfRlVSrdvHtqO0FXJu5vZ1UV7MviPl_kgl_nTmls849h2kpzsKoZ5DOLu7E"
            />
          </div>
          <div>
            <h4 className="text-primary font-headline font-bold text-xs tracking-widest uppercase">THỦ KHO</h4>
            <p className="text-tertiary font-label text-[10px] uppercase tracking-tighter">Rank Đại cao thủ</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-headline text-outline-variant px-8 mb-2 tracking-widest uppercase">
          Quản lý
        </div>
        <NavLink to="/admin/dashboard" className={navClass}>
          <Icon name="dashboard" className="text-lg" />
          Bảng điều khiển
        </NavLink>
        <NavLink to="/admin/archive" className={navClass}>
          <Icon name="auto_stories" className="text-lg" />
          Kho lưu trữ
        </NavLink>
        <NavLink to="/admin/champions" className={navClass}>
          <Icon name="shield_person" className="text-lg" />
          Tướng
        </NavLink>
        <NavLink to="/admin/game-data" className={navClass}>
          <Icon name="category" className="text-lg" />
          Meta (tộc, đồ, lõi…)
        </NavLink>
        <NavLink to="/admin/tactics" className={navClass}>
          <Icon name="strategy" className="text-lg" />
          Chiến thuật
        </NavLink>
        <NavLink to="/admin/settings" className={navClass}>
          <Icon name="settings" className="text-lg" />
          Cài đặt
        </NavLink>
      </nav>
      <div className="px-6 mb-8">
        <NavLink
          to="/board"
          className="block w-full text-center bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 rounded text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_12px_rgba(118,0,195,0.4)] hover:shadow-[0_4px_20px_rgba(118,0,195,0.6)] transition-all"
        >
          Đội hình mới
        </NavLink>
      </div>
      <div className="mt-auto space-y-1 pb-6">
        <a
          href="https://developer.riotgames.com/docs/tft"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 text-on-surface-variant px-6 py-3 hover:bg-background transition-transform duration-200 hover:translate-x-1 font-label text-xs uppercase tracking-widest border-l-4 border-transparent"
        >
          <Icon name="help" className="text-lg" />
          Hỗ trợ
        </a>
        <button
          type="button"
          className="w-full text-left flex items-center gap-4 text-error px-6 py-3 hover:bg-background transition-transform duration-200 hover:translate-x-1 font-label text-xs uppercase tracking-widest border-l-4 border-transparent"
        >
          <Icon name="logout" className="text-lg" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}

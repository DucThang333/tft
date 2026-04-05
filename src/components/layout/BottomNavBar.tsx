import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

const navItems = [
  { to: '/champions', icon: 'groups', label: 'Tướng' },
  { to: '/items', icon: 'shield_with_heart', label: 'Đồ' },
  { to: '/board', icon: 'grid_view', label: 'Ghép đội' },
  { to: '/meta', icon: 'trophy', label: 'Meta' },
]

export function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 md:hidden bg-background/90 backdrop-blur-xl border-t border-primary/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 rounded-t-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center active:scale-90 transition-transform ${
              isActive
                ? 'text-primary bg-surface-container-high rounded-xl px-4 py-1 shadow-[0_0_10px_rgba(223,183,255,0.2)]'
                : 'text-on-surface-variant/60 hover:text-primary'
            }`
          }
        >
          <Icon name={item.icon} />
          <span className="font-label text-[10px] font-bold uppercase">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

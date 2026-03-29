import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

const navLinks = [
  { to: '/champions', label: 'Champions' },
  { to: '/items', label: 'Items' },
  { to: '/board', label: 'Board' },
  { to: '/meta', label: 'Meta' },
]

export function TopAppBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-8">
        <NavLink to="/" className="text-xl font-bold tracking-tighter text-gradient-primary font-headline uppercase">
          MYSTIC ARCHIVE
        </NavLink>
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `font-headline uppercase tracking-wider text-sm transition-colors ${
                  isActive
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-surface-container-high transition-all duration-300 active:scale-95 text-primary">
          <Icon name="settings" />
        </button>
        <button className="p-2 rounded-lg hover:bg-surface-container-high transition-all duration-300 active:scale-95 text-primary">
          <Icon name="account_circle" />
        </button>
      </div>
    </header>
  )
}

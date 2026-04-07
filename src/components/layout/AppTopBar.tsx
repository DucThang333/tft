import { useEffect, useMemo } from 'react'
import { Select, Typography } from 'antd'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { tftApi } from '../../api/tftApi'
import { usePromiseData } from '../../hooks/usePromiseData'
import { useDataVersion } from '../../state/dataVersion'
import { Icon } from '../ui/Icon'

interface AppTopBarProps {
  onOpenSearch?: () => void
}

export function AppTopBar({ onOpenSearch }: AppTopBarProps) {
  const { pathname } = useLocation()
  const sanctumActive = pathname.startsWith('/admin')
  const { data } = usePromiseData(() => tftApi.gameVersions(), [])
  const { value: selectedVersion, setValue: setSelectedVersion } = useDataVersion()
  const versions = data ?? []

  useEffect(() => {
    if (versions.length === 0) return
    if (selectedVersion) return
    const active = versions.find((v) => v.isActive)
    setSelectedVersion((active ?? versions[0]).value)
  }, [selectedVersion, setSelectedVersion, versions])

  const versionOptions = useMemo(
    () =>
      versions.map((v) => ({
        value: v.value,
        label: `${v.label}${v.isActive ? ' (active)' : ''}`,
      })),
    [versions],
  )

  return (
    <header className="w-full top-0 sticky z-50 bg-background shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="flex justify-between items-center px-6 md:px-8 h-20 w-full max-w-full">
        <div className="flex items-center gap-8 md:gap-12">
          <Link
            to="/champions"
            className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary-container font-headline tracking-tight uppercase"
          >
            Chiến thuật TFT
          </Link>
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 h-full">
            <NavLink
              to="/champions"
              className={({ isActive }) =>
                `font-headline tracking-tight uppercase text-sm font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Tướng
            </NavLink>
            <NavLink
              to="/board"
              className={({ isActive }) =>
                `font-headline tracking-tight uppercase text-sm font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Bàn cờ
            </NavLink>
            <NavLink
              to="/meta"
              className={({ isActive }) =>
                `font-headline tracking-tight uppercase text-sm font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Meta
            </NavLink>
            <Link
              to="/admin/archive"
              className={`font-headline tracking-tight uppercase text-sm font-bold transition-colors ${
                sanctumActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Bảng điều khiển
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Select
            size="small"
            value={selectedVersion || undefined}
            options={versionOptions}
            placeholder="Chọn version"
            onChange={setSelectedVersion}
          />
          <button
            type="button"
            onClick={() => onOpenSearch?.()}
            className="flex lg:hidden items-center justify-center p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95"
            aria-label="Mở tìm kiếm"
          >
            <Icon name="search" />
          </button>
          <button
            type="button"
            onClick={() => onOpenSearch?.()}
            className="hidden lg:flex items-center bg-surface-container-high/50 hover:bg-surface-container-high px-3 py-2 rounded-lg gap-3 border-b-2 border-outline-variant focus-visible:border-tertiary transition-all text-left w-56 xl:w-64"
            aria-label="Mở tìm kiếm"
          >
            <Icon name="search" className="text-on-surface-variant text-sm shrink-0" />
            <span className="text-sm text-on-surface-variant/70 truncate font-body">Tìm trong kho dữ liệu…</span>
            <kbd className="ml-auto shrink-0 rounded border border-outline-variant/40 bg-surface-container-low px-1.5 py-0.5 font-mono text-[10px] text-on-surface-variant">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all duration-300 active:scale-95"
            aria-label="Cài đặt"
          >
            <Icon name="settings" />
          </button>
          <button
            type="button"
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all duration-300 active:scale-95"
            aria-label="Tài khoản"
          >
            <Icon name="account_circle" />
          </button>
        </div>
      </div>
      <div className="bg-surface-container-high h-px w-full" />
    </header>
  )
}

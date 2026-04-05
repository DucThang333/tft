import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SearchCommandPalette } from '../search/SearchCommandPalette'
import { AppTopBar } from './AppTopBar'
import { BottomNavBar } from './BottomNavBar'

export function AppShell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const isWide = pathname === '/board'
  const [searchOpen, setSearchOpen] = useState(false)

  const openSearch = useCallback(() => setSearchOpen(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'k' && e.key !== 'K') return
      if (!(e.metaKey || e.ctrlKey)) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      e.preventDefault()
      setSearchOpen((o) => !o)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30">
      <SearchCommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <AppTopBar onOpenSearch={openSearch} />
      {isAdmin ? (
        <Outlet />
      ) : (
        <main
          className={`pt-6 pb-32 md:pb-8 px-4 md:px-8 mx-auto ${isWide ? 'max-w-[1600px]' : 'max-w-7xl'}`}
        >
          <Outlet />
        </main>
      )}
      {!isAdmin && <BottomNavBar />}
      <div className="fixed top-1/4 -right-20 w-80 h-80 bg-tertiary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />
    </div>
  )
}

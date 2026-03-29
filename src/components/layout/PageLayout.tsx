import type { ReactNode } from 'react'
import { TopAppBar } from './TopAppBar'
import { BottomNavBar } from './BottomNavBar'

interface PageLayoutProps {
  children: ReactNode
  className?: string
  wide?: boolean
}

export function PageLayout({ children, className = '', wide = false }: PageLayoutProps) {
  return (
    <>
      <TopAppBar />
      <main className={`pt-24 pb-32 md:pb-8 px-4 md:px-8 mx-auto ${wide ? 'max-w-[1600px]' : 'max-w-7xl'} ${className}`}>
        {children}
      </main>
      <BottomNavBar />
      <div className="fixed top-1/4 -right-20 w-80 h-80 bg-tertiary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />
    </>
  )
}

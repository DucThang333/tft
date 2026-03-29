import type { ReactNode } from 'react'

interface TierSectionProps {
  tier: string
  subtitle: string
  color: 'primary' | 'tertiary'
  children: ReactNode
}

const colorMap = {
  primary: {
    text: 'text-primary',
    line: 'via-primary/20',
  },
  tertiary: {
    text: 'text-tertiary',
    line: 'via-tertiary/20',
  },
}

export function TierSection({ tier, subtitle, color, children }: TierSectionProps) {
  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <span className={`h-px flex-1 bg-gradient-to-r from-transparent ${colorMap[color].line} to-transparent`} />
        <h2 className="font-headline text-3xl font-bold italic tracking-tighter">
          <span className={colorMap[color].text}>{tier}</span>
          <span className="text-on-surface-variant not-italic font-normal opacity-50 ml-2">{subtitle}</span>
        </h2>
        <span className={`h-px flex-1 bg-gradient-to-r from-transparent ${colorMap[color].line} to-transparent`} />
      </div>
      {children}
    </>
  )
}

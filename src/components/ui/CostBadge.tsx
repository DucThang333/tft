import { Icon } from './Icon'

const costStyles: Record<number, string> = {
  5: 'bg-tertiary text-on-tertiary',
  4: 'bg-primary-container text-primary',
  3: 'bg-secondary-container text-on-secondary-container',
  2: 'bg-surface-container-highest text-on-surface-variant',
  1: 'bg-surface-container text-on-surface-variant/50',
}

interface CostBadgeProps {
  cost: 1 | 2 | 3 | 4 | 5
}

export function CostBadge({ cost }: CostBadgeProps) {
  return (
    <div className={`absolute top-3 left-3 ${costStyles[cost]} flex items-center gap-1 px-2 py-0.5 rounded-full shadow-lg`}>
      <Icon name="monetization_on" filled className="text-[14px] font-bold" />
      <span className="text-xs font-extrabold">{cost}</span>
    </div>
  )
}

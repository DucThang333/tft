import type { Trait } from '../../../types'
import { Icon } from '../../../components/ui/Icon'

interface SynergySidebarProps {
  synergies: Trait[]
}

const borderColors: Record<string, string> = {
  tertiary: 'border-tertiary',
  primary: 'border-primary',
  default: 'border-transparent',
}

const iconColors: Record<string, string> = {
  tertiary: 'text-tertiary',
  primary: 'text-primary',
  default: 'text-on-surface-variant',
}

const barColors: Record<string, string> = {
  tertiary: 'bg-tertiary',
  primary: 'bg-primary',
  default: 'bg-on-surface-variant',
}

const textColors: Record<string, string> = {
  tertiary: 'text-tertiary',
  primary: 'text-primary',
  default: 'text-on-surface-variant',
}

export function SynergySidebar({ synergies }: SynergySidebarProps) {
  return (
    <aside className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-lg font-bold tracking-tight uppercase text-on-surface">Hệ đồng minh</h2>
        <span className="bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold text-tertiary">Cấp 8</span>
      </div>
      <div className="space-y-4">
        {synergies.map((trait) => (
          <div
            key={trait.name}
            className={`rounded-xl p-4 flex items-center gap-4 shadow-lg border-l-4 ${
              trait.active
                ? `bg-surface-container-high ${borderColors[trait.color]}`
                : 'bg-surface-container-low border-transparent opacity-60'
            }`}
          >
            <div className={`w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center ${
              trait.active ? `border ${borderColors[trait.color]}/30` : ''
            }`}>
              <Icon
                name={trait.icon}
                filled={trait.active}
                className={iconColors[trait.color]}
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-headline font-bold text-sm tracking-wide uppercase">{trait.name}</span>
                <span className={`font-bold text-xs ${textColors[trait.color]}`}>
                  {trait.current}/{trait.max}
                </span>
              </div>
              <div className="w-full bg-surface-container-lowest h-1.5 rounded-full mt-2">
                <div
                  className={`h-full rounded-full ${barColors[trait.color]}`}
                  style={{ width: `${(trait.current / trait.max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

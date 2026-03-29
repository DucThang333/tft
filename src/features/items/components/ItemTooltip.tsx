import type { BaseItem } from '../../../types'
import { GlassPanel } from '../../../components/ui/GlassPanel'

interface ItemTooltipProps {
  item: BaseItem | null
}

export function ItemTooltip({ item }: ItemTooltipProps) {
  if (!item) return null

  return (
    <GlassPanel className="p-6 transition-all duration-500">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-lg bg-primary-container p-1 shadow-[0_0_15px_rgba(118,0,195,0.4)]">
          <img src={item.imageUrl} alt={item.imageAlt} className="w-full h-full object-cover rounded" />
        </div>
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface">{item.name}</h3>
          <p className="text-tertiary font-bold">{item.stat}</p>
        </div>
      </div>
      <p className="text-on-surface-variant text-sm italic mb-4 leading-relaxed">
        "The heavier the blade, the deeper the silence it leaves behind."
      </p>
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-bold uppercase text-outline">
          <span>Utility</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span key={i} className={`w-3 h-3 rounded-full ${i <= item.utility ? 'bg-tertiary' : 'bg-outline-variant'}`} />
            ))}
          </div>
        </div>
        <div className="flex justify-between text-xs font-bold uppercase text-outline">
          <span>Offense</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span key={i} className={`w-3 h-3 rounded-full ${i <= item.offense ? 'bg-primary' : 'bg-outline-variant'}`} />
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}

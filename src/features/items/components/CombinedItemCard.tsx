import type { CombinedItem } from '../../../types'

interface CombinedItemCardProps {
  item: CombinedItem
  variant?: 'featured' | 'compact' | 'wide'
  highlighted?: boolean
  id?: string
}

const highlightRing = 'ring-2 ring-primary ring-offset-2 ring-offset-background'

export function CombinedItemCard({
  item,
  variant = 'compact',
  highlighted = false,
  id,
}: CombinedItemCardProps) {
  if (variant === 'featured') {
    return (
      <div
        id={id}
        className={`md:row-span-2 group relative overflow-hidden bg-surface-container-high rounded-xl p-6 border-t border-outline-variant/10 hover:shadow-[0_0_30px_rgba(233,196,0,0.1)] transition-all ${highlighted ? highlightRing : ''}`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-tertiary to-tertiary-container p-0.5 shadow-[0_0_15px_rgba(233,196,0,0.2)]">
              <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded-[0.65rem]" loading="lazy" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-headline font-bold text-on-surface">{item.name}</h3>
            <div className="flex gap-2 mt-1">
              {item.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-bold px-2 py-0.5 bg-tertiary text-on-tertiary rounded uppercase">{tag}</span>
              ))}
              {item.tier && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-container text-on-primary-container rounded uppercase">{item.tier}</span>
              )}
            </div>
          </div>
        </div>
        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">{item.description}</p>
        <div className="grid grid-cols-2 gap-4">
          {item.stats.map((stat) => (
            <div key={stat.label} className="bg-surface-container rounded-lg p-3">
              <span className="text-[10px] font-bold text-tertiary uppercase block mb-1">{stat.label}</span>
              <span className="text-xl font-bold text-on-surface">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'wide') {
    return (
      <div
        id={id}
        className={`md:col-span-2 group relative bg-surface-container-high rounded-xl p-5 border-t border-outline-variant/10 hover:shadow-lg transition-all flex items-center justify-between gap-6 ${highlighted ? highlightRing : ''}`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden border border-primary/20">
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-surface text-lg">{item.name}</h4>
            <p className="text-xs text-on-surface-variant">{item.componentNames} &bull; {item.description}</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4">
          {item.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="block text-[10px] text-tertiary font-bold uppercase">{stat.label}</span>
              <span className="text-lg font-bold text-on-surface">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      id={id}
      className={`group relative bg-surface-container-high rounded-xl p-5 border-t border-outline-variant/10 hover:shadow-lg transition-all ${highlighted ? highlightRing : ''}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-lg bg-surface-container-highest overflow-hidden border border-primary/20">
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div>
          <h4 className="font-headline font-bold text-on-surface">{item.name}</h4>
          <p className="text-[10px] text-primary font-bold uppercase tracking-tight">{item.componentNames}</p>
        </div>
      </div>
      <p className="text-xs text-on-surface-variant line-clamp-2">{item.description}</p>
    </div>
  )
}

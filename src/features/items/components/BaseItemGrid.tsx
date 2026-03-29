import type { BaseItem } from '../../../types'

interface BaseItemGridProps {
  items: BaseItem[]
  selectedId: string
  onSelect: (id: string) => void
}

export function BaseItemGrid({ items, selectedId, onSelect }: BaseItemGridProps) {
  return (
    <div className="bg-surface-container-high rounded-xl p-6 shadow-xl relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline text-xl font-bold text-primary">Base Components</h2>
        <span className="material-symbols-outlined text-tertiary">diamond</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => {
          const isSelected = item.id === selectedId
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group cursor-pointer p-1 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary bg-surface-container-highest shadow-[0_0_15px_rgba(223,183,255,0.2)]'
                  : 'border-transparent hover:border-outline-variant bg-surface-container-low'
              }`}
            >
              <div className="aspect-square rounded-md overflow-hidden relative mb-2">
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isSelected && <div className="absolute inset-0 bg-primary/10" />}
              </div>
              <span className={`text-[10px] font-bold uppercase text-center block ${isSelected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                {item.shortName}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

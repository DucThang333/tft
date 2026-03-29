import { PageLayout } from '../../../components/layout/PageLayout'
import { Button } from '../../../components/ui/Button'
import { BaseItemGrid } from '../components/BaseItemGrid'
import { ItemTooltip } from '../components/ItemTooltip'
import { CombinedItemCard } from '../components/CombinedItemCard'
import { useItemSelection } from '../hooks/useItemSelection'
import { baseItems, combinedItems } from '../../../data/items'

export function ItemGuide() {
  const { selectedItemId, setSelectedItemId, selectedItem, filteredCombinations } =
    useItemSelection(baseItems, combinedItems)

  return (
    <PageLayout>
      <section className="mb-12 relative overflow-hidden rounded-xl bg-surface-container-low p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <span className="text-tertiary font-label font-bold uppercase tracking-widest text-sm mb-2 block">
            Tactical Grimoire
          </span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-on-surface mb-4 leading-tight">
            Arcane Arsenal
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
            Master the flow of magic. Combine basic components to forge legendary artifacts that tip the scales of fate.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">View Synergies</Button>
            <Button variant="secondary">Reset Filters</Button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-30 pointer-events-none">
          <img
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSViXnHzhcsmiWA3lvq8LcLqkQesOUb085JTm9xBdubDN_1jEzie7m31Ph-N1pZdU-x1k4B-H84I4Hl4OsZWgn_SGHtOUE0ixrbfEFS76fcBbOaDHcBFA04slPw9u-NzGxvvjmtkNpOCpdRCInxud08BZCPL1IoZv-9FTjf16kX7Nj2JPzboPiTZ9ZTbfqNumAgztYv2jFnGUsQppk1gGChc39p9GQD9f2vPU6ZLvBc4bkUfkl-vfIA4mneTDogqo6l_11MqowvlVc"
            alt="abstract swirling purple and gold energy patterns"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <BaseItemGrid items={baseItems} selectedId={selectedItemId} onSelect={setSelectedItemId} />
          <ItemTooltip item={selectedItem} />
        </div>

        <div className="lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-2xl font-bold">Crafted Combinations</h2>
            {selectedItem && (
              <span className="px-3 py-1 rounded-full bg-surface-container-highest text-primary text-[10px] font-bold uppercase border border-primary/20">
                Filtering by {selectedItem.name}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCombinations.map((item, index) => (
              <CombinedItemCard
                key={item.id}
                item={item}
                variant={index === 0 ? 'featured' : index === filteredCombinations.length - 1 && filteredCombinations.length > 2 ? 'wide' : 'compact'}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40">
        <button className="w-14 h-14 rounded-full bg-gradient-primary text-on-primary shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_shopping_cart</span>
        </button>
      </div>
    </PageLayout>
  )
}

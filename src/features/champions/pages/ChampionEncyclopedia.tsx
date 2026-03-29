import { PageLayout } from '../../../components/layout/PageLayout'
import { ChampionCard } from '../components/ChampionCard'
import { FilterBar } from '../components/FilterBar'
import { useChampionFilter } from '../hooks/useChampionFilter'
import { champions } from '../../../data/champions'
import { Icon } from '../../../components/ui/Icon'

export function ChampionEncyclopedia() {
  const { filtered, costFilter, setCostFilter, sortBy, setSortBy } = useChampionFilter(champions)

  return (
    <PageLayout>
      <header className="mb-12 relative">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <span className="text-tertiary font-label font-bold uppercase tracking-[0.2em] text-xs mb-2 block">
          The Grand Library
        </span>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-on-surface mb-4">
          Champions Encyclopedia
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          Study the legends of the convergence. Filter through arcane lineages and combat roles to forge your perfect team composition.
        </p>
      </header>

      <FilterBar
        costFilter={costFilter}
        onCostFilterChange={setCostFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filtered.map((champion) => (
          <ChampionCard key={champion.id} champion={champion} />
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <button className="group flex items-center gap-3 bg-surface-container-high hover:bg-surface-bright text-on-surface px-8 py-3 rounded-xl border border-outline-variant/30 transition-all active:scale-95 shadow-xl">
          <span className="font-headline font-bold uppercase tracking-widest text-sm">Unlock More Records</span>
          <Icon name="expand_more" className="transition-transform group-hover:translate-y-1" />
        </button>
      </div>
    </PageLayout>
  )
}

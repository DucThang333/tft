import { PageLayout } from '../../../components/layout/PageLayout'
import { TierSection } from '../components/TierSection'
import { CompCard } from '../components/CompCard'
import { MetaInsight } from '../components/MetaInsight'
import { compositions } from '../../../data/compositions'

export function MetaCompositions() {
  const sTier = compositions.filter((c) => c.tier === 'S')
  const aTier = compositions.filter((c) => c.tier === 'A')

  return (
    <PageLayout>
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-tertiary font-label text-sm uppercase tracking-[0.2em] font-bold block mb-2">
            Live Patch Analysis
          </span>
          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-on-background">
            Meta Compositions
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-high px-4 py-2 rounded-lg border-t border-outline-variant/20">
            <span className="text-on-surface-variant text-xs uppercase font-bold tracking-widest block">Server</span>
            <span className="text-primary font-headline font-bold">NORTH AMERICA</span>
          </div>
          <div className="bg-surface-container-high px-4 py-2 rounded-lg border-t border-outline-variant/20">
            <span className="text-on-surface-variant text-xs uppercase font-bold tracking-widest block">Updated</span>
            <span className="text-tertiary font-headline font-bold">2H AGO</span>
          </div>
        </div>
      </section>

      <TierSection tier="S-Tier" subtitle="Domination" color="primary">
        <div className="grid grid-cols-1 gap-8 mb-16">
          {sTier.map((comp) => (
            <CompCard key={comp.id} comp={comp} variant="featured" />
          ))}
        </div>
      </TierSection>

      <TierSection tier="A-Tier" subtitle="Consistent" color="tertiary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aTier.map((comp) => (
            <CompCard key={comp.id} comp={comp} variant="compact" />
          ))}
        </div>
      </TierSection>

      <MetaInsight />
    </PageLayout>
  )
}

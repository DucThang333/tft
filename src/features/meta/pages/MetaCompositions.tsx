import { TierSection } from '../components/TierSection'
import { CompCard } from '../components/CompCard'
import { MetaInsight } from '../components/MetaInsight'
import { ApiStatus } from '../../../components/ui/ApiStatus'
import { tftApi } from '../../../api/tftApi'
import { usePromiseData } from '../../../hooks/usePromiseData'

export function MetaCompositions() {
  const compsState = usePromiseData(() => tftApi.compositions(), [])
  const overviewState = usePromiseData(() => tftApi.metaOverview(), [])
  const loading = compsState.loading || overviewState.loading
  const error = compsState.error ?? overviewState.error
  const compositions = compsState.data ?? []
  const overview = overviewState.data

  const sTier = compositions.filter((c) => c.tier === 'S')
  const aTier = compositions.filter((c) => c.tier === 'A')

  return (
    <>
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-tertiary font-label text-sm uppercase tracking-[0.2em] font-bold block mb-2">
            {overview?.patchLabel ?? 'Phân tích bản cập nhật'}
          </span>
          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-on-background">
            Đội hình meta
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-high px-4 py-2 rounded-lg border-t border-outline-variant/20">
            <span className="text-on-surface-variant text-xs uppercase font-bold tracking-widest block">Máy chủ</span>
            <span className="text-primary font-headline font-bold">
              {overview?.region ?? '—'}
            </span>
          </div>
          <div className="bg-surface-container-high px-4 py-2 rounded-lg border-t border-outline-variant/20">
            <span className="text-on-surface-variant text-xs uppercase font-bold tracking-widest block">Cập nhật</span>
            <span className="text-tertiary font-headline font-bold">
              {overview?.updated ?? '—'}
            </span>
          </div>
        </div>
      </section>

      <ApiStatus loading={loading} error={error}>
        <TierSection tier="Hạng S" subtitle="Thống trị" color="primary">
          <div className="grid grid-cols-1 gap-8 mb-16">
            {sTier.map((comp) => (
              <CompCard key={comp.id} comp={comp} variant="featured" />
            ))}
          </div>
        </TierSection>

        <TierSection tier="Hạng A" subtitle="Ổn định" color="tertiary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aTier.map((comp) => (
              <CompCard key={comp.id} comp={comp} variant="compact" />
            ))}
          </div>
        </TierSection>

        <MetaInsight />
      </ApiStatus>
    </>
  )
}

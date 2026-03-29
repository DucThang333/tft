import { PageLayout } from '../../../components/layout/PageLayout'
import { GlassPanel } from '../../../components/ui/GlassPanel'
import { Icon } from '../../../components/ui/Icon'
import { HexGrid } from '../components/HexGrid'
import { SynergySidebar } from '../components/SynergySidebar'
import { ChampionTray } from '../components/ChampionTray'
import { ItemsTray } from '../components/ItemsTray'
import { synergies, boardChampions, trayChampions, boardItems } from '../../../data/board'

export function BoardBuilder() {
  return (
    <PageLayout wide className="grid grid-cols-1 md:grid-cols-[280px_1fr_300px] gap-8">
      <SynergySidebar synergies={synergies} />

      <section className="flex flex-col items-center">
        <GlassPanel className="w-full p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/5 blur-[100px] pointer-events-none" />

          <div className="flex justify-between mb-8 items-end">
            <div>
              <p className="text-tertiary font-label text-xs uppercase tracking-[0.2em] font-bold mb-1">
                Strategy Map
              </p>
              <h1 className="font-headline text-3xl font-bold tracking-tighter">Tactical Grid</h1>
            </div>
            <div className="flex gap-2">
              <button className="bg-surface-container-highest hover:bg-surface-bright text-on-surface px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center gap-2">
                <Icon name="refresh" className="text-sm" />
                RESET
              </button>
              <button className="bg-gradient-primary text-on-primary px-6 py-2 rounded-lg text-sm font-bold shadow-[0_4px_15px_rgba(118,0,195,0.4)] hover:shadow-primary/40 transition-all active:scale-95 flex items-center gap-2">
                <Icon name="save" className="text-sm" />
                SAVE COMP
              </button>
            </div>
          </div>

          <HexGrid champions={boardChampions} />
          <ItemsTray items={boardItems} />
        </GlassPanel>
      </section>

      <ChampionTray champions={trayChampions} />
    </PageLayout>
  )
}

import { Icon } from '../../../components/ui/Icon'

export function MetaInsight() {
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-surface-container p-6 rounded-lg border-t border-outline-variant/15 flex flex-col justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h4 className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">Meta Insight</h4>
          <p className="text-2xl font-headline font-bold text-on-background mb-4">
            Warden Frontlines are seeing a <span className="text-primary">+12% surge</span> in high-ELO placement.
          </p>
          <p className="text-on-surface-variant text-sm max-w-md">
            Prioritize defensive itemization over pure offensive tempo in the current 14.12 patch environment.
          </p>
        </div>
        <div className="absolute right-[-10%] bottom-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>
      <div className="bg-primary-container p-6 rounded-lg flex flex-col justify-center items-center text-center">
        <Icon name="auto_awesome" className="text-4xl text-primary mb-4" />
        <h4 className="text-lg font-headline font-bold text-white mb-2">Team Builder</h4>
        <p className="text-white/70 text-sm mb-6">
          Create your own off-meta strategies and share with the community.
        </p>
        <button className="bg-white text-primary-container font-bold text-xs px-6 py-3 rounded uppercase tracking-wider hover:bg-opacity-90 transition-all">
          Start Crafting
        </button>
      </div>
    </div>
  )
}

import type { Champion } from '../../../types'
import { CHAMPION_SPLASH_ASPECT_CLASS } from '../championVisual'
import { CostBadge } from '../../../components/ui/CostBadge'

interface ChampionCardProps {
  champion: Champion
}

export function ChampionCard({ champion }: ChampionCardProps) {
  return (
    <div className="group relative bg-surface-container-low rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 border-t border-outline-variant/20 hover:shadow-[0_0_20px_rgba(223,183,255,0.15)]">
      <div className={`${CHAMPION_SPLASH_ASPECT_CLASS} relative w-full overflow-hidden`}>
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={champion.imageUrl}
          alt=""
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
        <CostBadge cost={champion.cost} />
      </div>
      <div className="p-4 relative">
        <h3 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
          {champion.name}
        </h3>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {champion.traits.map((trait) => (
            <span
              key={trait}
              className="bg-secondary-container/30 text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 border-2 border-tertiary/0 group-hover:border-tertiary/20 rounded-xl pointer-events-none transition-all duration-500" />
    </div>
  )
}

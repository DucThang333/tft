import { CHAMPION_SPLASH_ASPECT_CLASS } from '../../champions/championVisual'
import type { Composition } from '../../../types'

interface CompCardProps {
  comp: Composition
  variant: 'featured' | 'compact'
}

export function CompCard({ comp, variant }: CompCardProps) {
  if (variant === 'featured') {
    return (
      <div className="group relative overflow-hidden bg-surface-container-low rounded-lg border-t border-outline-variant/15 hover:bg-surface-container transition-all duration-500 shadow-xl">
        {comp.backgroundImageUrl && (
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
            <img className="w-full h-full object-cover grayscale" src={comp.backgroundImageUrl} alt="" />
          </div>
        )}
        <div className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary text-on-primary font-headline font-black px-3 py-1 text-xl rounded-lg italic">
                  {comp.tier}
                </span>
                <h3 className="text-3xl font-headline font-bold leading-none">{comp.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {comp.traits.map((trait) => (
                  <div key={trait.name} className="flex items-center gap-1.5 bg-secondary-container px-3 py-1 rounded-full text-on-secondary-container text-xs font-bold uppercase">
                    <span className={`w-2 h-2 rounded-full ${trait.name === comp.traits[0]?.name ? 'bg-primary' : 'bg-tertiary'} shadow-[0_0_6px_rgba(223,183,255,0.2)]`} />
                    {trait.count} {trait.name}
                  </div>
                ))}
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl mb-6">
                <div className="flex justify-between items-end h-16 gap-1 mb-2">
                  {comp.performanceCurve.map((val, i) => (
                    <div
                      key={i}
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${val}%`,
                        background: `rgba(118, 0, 195, ${0.2 + (i / (comp.performanceCurve.length - 1)) * 0.8})`,
                        boxShadow: i === comp.performanceCurve.length - 1 ? '0 0 10px #dfb7ff' : undefined,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  <span>Đầu</span>
                  <span>Giữa</span>
                  <span>Cuối</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Độ khó</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <span key={i} className={`w-2 h-2 rounded-full ${i <= comp.difficulty ? 'bg-tertiary' : 'bg-tertiary/20'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:w-2/3">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {comp.champions.map((champ, i) => (
                  <div key={champ.name} className="relative group/champ cursor-pointer">
                    <div
                      className={`w-full ${CHAMPION_SPLASH_ASPECT_CLASS} rounded-lg bg-surface-container-highest overflow-hidden border-2 transition-all duration-300 ${
                        i === 0
                          ? 'border-primary/40 group-hover/champ:border-primary'
                          : 'border-outline-variant/30 hover:border-primary/50'
                      }`}
                    >
                      <img
                        className="w-full h-full object-cover transform group-hover/champ:scale-110 transition-transform duration-500"
                        src={champ.imageUrl}
                        alt=""
                        loading="lazy"
                      />
                    </div>
                    {champ.items && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {champ.items.map((item, idx) => (
                          <div key={idx} className="w-5 h-5 bg-surface-container-highest border border-primary/30 rounded flex items-center justify-center p-0.5">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] font-bold text-center mt-3 uppercase tracking-tighter text-on-surface-variant">{champ.name}</p>
                  </div>
                ))}
              </div>
              {comp.strategy && (
                <div className="mt-8 pt-8 border-t border-outline-variant/10 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Chiến lược cốt lõi</span>
                    <p className="text-sm text-on-surface-variant/80 italic">"{comp.strategy}"</p>
                  </div>
                  <div className="ml-auto flex gap-4">
                    <button className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-4 py-2 rounded transition-all active:scale-95">XEM HƯỚNG DẪN</button>
                    <button className="bg-primary-container text-white text-xs font-bold px-4 py-2 rounded shadow-lg shadow-primary-container/20 active:scale-95">SAO CHÉP BÀN CỜ</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-low p-6 rounded-lg border-t border-outline-variant/15 hover:translate-y-[-4px] transition-transform duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-tertiary font-headline font-black text-xl italic">{comp.tier}</span>
            <h3 className="text-xl font-headline font-bold">{comp.name}</h3>
          </div>
          <div className="flex gap-2">
            {comp.traits.map((trait) => (
              <span key={trait.name} className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container-highest px-2 py-0.5 rounded">
                {trait.count} {trait.name}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Độ khó</div>
          <div className="flex gap-1 justify-end">
            {[1, 2, 3].map((i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= comp.difficulty ? 'bg-tertiary' : 'bg-tertiary/20'}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex -space-x-3">
          {comp.champions.slice(0, 2).map((champ) => (
            <img key={champ.name} className="w-12 h-12 rounded-full border-2 border-surface-container object-cover" src={champ.imageUrl} alt="" loading="lazy" />
          ))}
          {comp.champions.length > 2 && (
            <div className="w-12 h-12 rounded-full border-2 border-surface-container bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant">
              +{comp.champions.length - 2}
            </div>
          )}
        </div>
      </div>
      <div className="bg-surface-container-lowest h-1.5 w-full rounded-full overflow-hidden">
        <div className="bg-tertiary h-full" style={{ width: `${comp.winRate}%` }} />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase">Tỷ lệ thắng: {comp.winRate}%</span>
        <span className="text-[10px] font-bold text-on-surface-variant uppercase">Top 4: {comp.top4Rate}%</span>
      </div>
    </div>
  )
}

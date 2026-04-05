import type { TrayChampion } from '../../../types'
import { Icon } from '../../../components/ui/Icon'

interface ChampionTrayProps {
  champions: TrayChampion[]
}

const costBorderColors: Record<number, string> = {
  5: 'border-tertiary',
  4: 'border-primary',
  3: 'border-blue-400',
  2: 'border-green-500',
  1: 'border-gray-400',
}

const costImageBorders: Record<number, string> = {
  5: 'border-tertiary/50',
  4: 'border-primary/50',
  3: 'border-blue-400/50',
  2: 'border-green-500/50',
  1: 'border-gray-400/50',
}

export function ChampionTray({ champions }: ChampionTrayProps) {
  return (
    <aside className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-headline text-lg font-bold uppercase tracking-tight">Khay tướng</h2>
        <div className="relative">
          <input
            className="w-full bg-surface-container-highest/50 border-none rounded-t-lg text-sm py-2 px-10 focus:ring-0 focus:ring-tertiary transition-all placeholder-on-surface-variant/50"
            placeholder="Tìm tướng..."
            type="text"
          />
          <Icon name="search" className="absolute left-3 top-2 text-on-surface-variant text-lg" />
        </div>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
        {champions.map((champ) => (
          <div
            key={champ.id}
            className={`p-3 bg-surface-container rounded-lg flex items-center gap-3 border-r-4 ${costBorderColors[champ.cost]} hover:bg-surface-container-high cursor-grab active:scale-95 transition-all`}
          >
            <div
              className={`w-12 h-12 rounded-lg bg-cover bg-center border ${costImageBorders[champ.cost]} overflow-hidden`}
              style={{ backgroundImage: `url('${champ.imageUrl}')` }}
            />
            <div>
              <p className={`font-headline font-bold text-sm ${champ.tierColor}`}>{champ.name}</p>
              <div className="flex gap-1 mt-1">
                {champ.traits.map((trait) => (
                  <span key={trait} className="px-1.5 py-0.5 bg-surface-container-lowest text-[8px] font-bold rounded uppercase">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl">
        <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          Đội hình trên bàn
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Giá trung bình</span>
            <span className="text-tertiary font-bold">3.8</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Sức mạnh tuyến trước</span>
            <span className="text-primary font-bold">XUẤT SẮC</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Sát thương phép</span>
            <span className="text-on-surface font-bold">65%</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

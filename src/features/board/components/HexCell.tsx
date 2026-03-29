import type { BoardChampion } from '../../../types'
import { Icon } from '../../../components/ui/Icon'

interface HexCellProps {
  champion?: BoardChampion
}

export function HexCell({ champion }: HexCellProps) {
  return (
    <div
      className="w-[80px] h-[92px] flex items-center justify-center relative transition-all duration-200 hover:brightness-125"
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: champion
          ? undefined
          : 'rgba(44, 41, 47, 0.4)',
      }}
    >
      {champion ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url('${champion.imageUrl}')` }}
          />
          <div
            className={`absolute bottom-1 w-full text-center text-[10px] font-bold py-0.5 uppercase ${
              champion.highlighted
                ? 'bg-tertiary text-on-tertiary'
                : 'bg-black/60 text-white'
            }`}
          >
            {champion.name}
          </div>
          {champion.highlighted && (
            <div
              className="absolute inset-0 border-2 border-tertiary"
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            />
          )}
        </>
      ) : (
        <Icon name="add" className="opacity-20" />
      )}
    </div>
  )
}

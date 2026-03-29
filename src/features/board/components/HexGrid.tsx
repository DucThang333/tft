import type { BoardChampion } from '../../../types'
import { HexCell } from './HexCell'

interface HexGridProps {
  champions: BoardChampion[]
  rows?: number
  cols?: number
}

export function HexGrid({ champions, rows = 4, cols = 7 }: HexGridProps) {
  const getChampionAt = (row: number, col: number) =>
    champions.find((c) => c.row === row && c.col === col)

  return (
    <div className="flex flex-col gap-1 select-none">
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex justify-center gap-1"
          style={{ marginLeft: row % 2 === 1 ? '42px' : '0' }}
        >
          {Array.from({ length: cols }).map((_, col) => {
            const champion = getChampionAt(row, col)
            return (
              <HexCell key={`${row}-${col}`} champion={champion} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

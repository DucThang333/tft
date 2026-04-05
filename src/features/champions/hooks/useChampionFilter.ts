import { useState, useMemo } from 'react'
import type { Champion } from '../../../types'

type CostFilter = 'all' | 1 | 2 | 3 | 4 | 5
type SortKey = 'name' | 'cost' | 'winrate'

export function useChampionFilter(champions: Champion[], textQuery = '') {
  const [costFilter, setCostFilter] = useState<CostFilter>('all')
  const [sortBy, setSortBy] = useState<SortKey>('name')

  const filtered = useMemo(() => {
    let result = costFilter === 'all'
      ? champions
      : champions.filter((c) => c.cost === costFilter)

    const q = textQuery.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.roleType.toLowerCase().includes(q) ||
          c.traits.some((t) => t.toLowerCase().includes(q)),
      )
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'cost') return b.cost - a.cost
      return 0
    })

    return result
  }, [champions, costFilter, sortBy, textQuery])

  return { filtered, costFilter, setCostFilter, sortBy, setSortBy }
}

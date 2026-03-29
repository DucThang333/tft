import { useState, useMemo } from 'react'
import type { BaseItem, CombinedItem } from '../../../types'

export function useItemSelection(baseItems: BaseItem[], combinedItems: CombinedItem[]) {
  const [selectedItemId, setSelectedItemId] = useState<string>(baseItems[0]?.id ?? '')

  const selectedItem = useMemo(
    () => baseItems.find((i) => i.id === selectedItemId) ?? null,
    [baseItems, selectedItemId],
  )

  const filteredCombinations = useMemo(
    () => combinedItems.filter((ci) => ci.components.includes(selectedItemId)),
    [combinedItems, selectedItemId],
  )

  return { selectedItemId, setSelectedItemId, selectedItem, filteredCombinations }
}

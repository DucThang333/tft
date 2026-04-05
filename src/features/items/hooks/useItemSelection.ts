import { useMemo, useState, useCallback } from 'react'
import type { BaseItem, CombinedItem } from '../../../types'

function pickIdFromUrl(
  baseItems: BaseItem[],
  combinedItems: CombinedItem[],
  urlBaseId?: string,
  urlCombinedId?: string,
  urlQ?: string,
): string | null {
  if (baseItems.length === 0) return null

  if (urlCombinedId) {
    const ci = combinedItems.find((c) => c.id === urlCombinedId)
    const pid = ci?.components.find((comp) => baseItems.some((b) => b.id === comp))
    if (pid) return pid
  }

  if (urlBaseId && baseItems.some((b) => b.id === urlBaseId)) return urlBaseId

  if (urlQ?.trim()) {
    const ql = urlQ.trim().toLowerCase()
    const baseHit = baseItems.find(
      (b) => b.name.toLowerCase().includes(ql) || b.shortName.toLowerCase().includes(ql),
    )
    if (baseHit) return baseHit.id
    const combHit = combinedItems.find((c) => c.name.toLowerCase().includes(ql))
    if (combHit) {
      const pid = combHit.components.find((comp) => baseItems.some((b) => b.id === comp))
      if (pid) return pid
    }
  }

  return null
}

export function useItemSelection(
  baseItems: BaseItem[],
  combinedItems: CombinedItem[],
  urlBaseId?: string,
  urlCombinedId?: string,
  urlQ?: string,
) {
  const urlKey = `${urlBaseId ?? ''}|${urlCombinedId ?? ''}|${urlQ ?? ''}`

  const [manualPick, setManualPick] = useState<{ id: string; atUrlKey: string } | null>(null)

  const selectedItemId = useMemo(() => {
    const fromManual =
      manualPick &&
      manualPick.atUrlKey === urlKey &&
      baseItems.some((b) => b.id === manualPick.id)
        ? manualPick.id
        : null

    const fromUrl = pickIdFromUrl(baseItems, combinedItems, urlBaseId, urlCombinedId, urlQ)
    const fallback = baseItems[0]?.id ?? ''

    if (fromManual) return fromManual
    if (fromUrl) return fromUrl
    if (fallback && baseItems.some((b) => b.id === fallback)) return fallback
    return ''
  }, [
    manualPick,
    urlKey,
    baseItems,
    combinedItems,
    urlBaseId,
    urlCombinedId,
    urlQ,
  ])

  const selectedItem = useMemo(
    () => baseItems.find((i) => i.id === selectedItemId) ?? null,
    [baseItems, selectedItemId],
  )

  const filteredCombinations = useMemo(
    () => combinedItems.filter((ci) => ci.components.includes(selectedItemId)),
    [combinedItems, selectedItemId],
  )

  const setSelectedItemId = useCallback(
    (id: string) => {
      setManualPick({ id, atUrlKey: urlKey })
    },
    [urlKey],
  )

  return { selectedItemId, setSelectedItemId, selectedItem, filteredCombinations }
}

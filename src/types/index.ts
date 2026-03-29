export interface Champion {
  id: string
  name: string
  cost: 1 | 2 | 3 | 4 | 5
  traits: string[]
  imageUrl: string
  imageAlt: string
}

export interface BaseItem {
  id: string
  name: string
  shortName: string
  stat: string
  imageUrl: string
  imageAlt: string
  utility: number
  offense: number
}

export interface CombinedItem {
  id: string
  name: string
  description: string
  components: [string, string]
  componentNames: string
  tier?: string
  tags: string[]
  imageUrl: string
  imageAlt: string
  stats: { label: string; value: string }[]
}

export interface Trait {
  name: string
  icon: string
  current: number
  max: number
  active: boolean
  color: 'tertiary' | 'primary' | 'default'
}

export interface BoardChampion {
  id: string
  name: string
  imageUrl: string
  imageAlt: string
  row: number
  col: number
  highlighted?: boolean
}

export interface TrayChampion {
  id: string
  name: string
  cost: 1 | 2 | 3 | 4 | 5
  traits: string[]
  imageUrl: string
  imageAlt: string
  tierColor: string
}

export interface Composition {
  id: string
  name: string
  tier: 'S' | 'A' | 'B'
  traits: { name: string; count: number }[]
  champions: { name: string; imageUrl: string; imageAlt: string; items?: string[] }[]
  winRate: number
  top4Rate: number
  difficulty: number
  strategy?: string
  performanceCurve: number[]
  backgroundImageUrl?: string
  backgroundImageAlt?: string
}

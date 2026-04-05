export interface BaseItem {
  id: string
  name: string
  shortName: string
  stat: string
  imageUrl: string
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
  tierColor: string
}

export interface Composition {
  id: string
  name: string
  tier: 'S' | 'A' | 'B'
  traits: { name: string; count: number }[]
  champions: { name: string; imageUrl: string; items?: string[] }[]
  winRate: number
  top4Rate: number
  difficulty: number
  strategy?: string
  performanceCurve: number[]
  backgroundImageUrl?: string
}

/** Định nghĩa tộc/hệ trong bách khoa (khác `Trait` trạng thái đồng minh trên bàn cờ). */
export interface GameTraitDef {
  id: string
  name: string
  kind: 'origin' | 'class'
  description: string
  iconUrl: string
}

/** Lõi nâng cấp (Silver / Gold / Prismatic). */
export interface GameAugment {
  id: string
  name: string
  tier: 'silver' | 'gold' | 'prismatic'
  description: string
  imageUrl: string
}

/** Kỳ ngộ / portal / sự kiện phiên (mô tả meta kiểu Double Up). */
export interface GameEncounter {
  id: string
  name: string
  description: string
  imageUrl: string
}

/** Trạng thái lõi: augment gắn với tướng + ghi chú (Silver / Gold / Prismatic). */
export interface ChampionAugmentState {
  linked: Pick<GameAugment, 'id' | 'tier' | 'name' | 'description' | 'imageUrl'>[]
  notes?: string | null
}

/** Một mức sao — khớp `ChampionStarStat` / JSON `starStats` từ API. */
export interface ChampionStarStatRow {
  stars: 1 | 2 | 3 | 4
  hp: number
  manaInitial: number
  manaMax: number
  attackDamage: number
  abilityPower: number
  armor: number
  magicResist: number
  attackSpeed: number
  critChance: number
  critDamage: number
  attackRange: number
}

/** Tham số placeholder trong `skill.descriptionTemplate` — khớp `ChampionSkillParam`. */
export interface ChampionSkillParamRow {
  paramKey: string
  displayLabel: string
  /** Độ dài 3 hoặc 4 (theo sao), khớp validation backend. */
  starValues: number[]
  scalesWith?: string
  sortOrder?: number
}

export interface ChampionSkillBlock {
  name: string
  descriptionTemplate: string
  params: ChampionSkillParamRow[]
}

export interface Champion {
  id: string
  name: string
  cost: 1 | 2 | 3 | 4 | 5
  /** Vai trò / class hiển thị (vd. Đấu Sĩ Vật Lý) — `role_type` BE. */
  roleType: string
  contentVersion?: number
  /** Tên tộc/hệ (thứ tự giữ nguyên khi gửi API). */
  traits: string[]
  imageUrl: string
  skill: ChampionSkillBlock
  starStats: ChampionStarStatRow[]
  /** Lõi nâng cấp / ưu tiên augment cho tướng */
  augmentState?: ChampionAugmentState
  /** Kỳ ngộ, portal hoặc sự kiện phiên liên quan */
  encounters?: GameEncounter[]
}

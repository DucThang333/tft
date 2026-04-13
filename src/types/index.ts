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
  descriptionParams: MetaDescriptionParamRow[]
  versionId?: string
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

/** Cách hiển thị số theo bậc sao / mẫu cho scalesWith (meta). */
export type ScalesWithValueFormat = 'flat' | 'percent'

/** Tùy chọn scalesWith (meta) — id khớp `ChampionSkillParamRow.scalesWith`. */
export interface ScalesWithOption {
  id: string
  label: string
  iconUrl: string
  /** Màu chữ cho giá trị số trong mô tả (#RGB / #RRGGBB). */
  textColor?: string
  /**
   * `flat` = số thường (vd. 100/150/225).
   * `percent` = thêm % ở cuối (vd. 100/150/225%).
   */
  valueFormat?: ScalesWithValueFormat
}

/** Tham số `{{key}}` trong mô tả meta (tộc/hệ, vai trò) — API `descriptionParams`. */
export interface MetaDescriptionParamRow {
  paramKey: string
  displayLabel: string
  sampleValue: string
  scalesWith?: string
  sortOrder?: number
}

/** Định nghĩa tộc/hệ trong bách khoa (khác `Trait` trạng thái đồng minh trên bàn cờ). */
export interface GameTraitDef {
  id: string
  name: string
  kind: 'origin' | 'class'
  description: string
  iconUrl: string
  descriptionParams: MetaDescriptionParamRow[]
}

/** Vai trò tướng (meta) — `champions.role_type` lưu `id`. */
export interface GameRoleType {
  id: string
  name: string
  /** Màu hiển thị (hex, vd. #C8AA6E). */
  color: string
  description: string
  descriptionParams: MetaDescriptionParamRow[]
}

/** Lõi nâng cấp (Silver / Gold / Prismatic). */
export interface GameAugment {
  id: string
  name: string
  tier: 'silver' | 'gold' | 'prismatic'
  description: string
  imageUrl: string
  descriptionParams: MetaDescriptionParamRow[]
  versionId?: string
}

/** Kỳ ngộ / portal / sự kiện phiên (mô tả meta kiểu Double Up). */
export interface GameEncounter {
  id: string
  name: string
  description: string
  imageUrl: string
  descriptionParams: MetaDescriptionParamRow[]
  versionId?: string
}

/** Option dùng cho Select phiên bản ở admin/game-data. */
export interface DataVersionOption {
  value: string
  label: string
  isActive?: boolean
  notes?: string
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
  /** Độ dài 1–4 (theo sao), khớp validation backend. */
  starValues: number[]
  /** Chỉ dùng preview admin meta: một chuỗi mẫu thay cho `starValues`. */
  sampleValue?: string
  scalesWith?: string
  sortOrder?: number
}

export interface ChampionSkillBlock {
  /** UUID server (optional — mỗi lần PUT full `skills` có thể tạo id mới). */
  id?: string
  /** Nhãn tab (vd. Mặc định, Anh Hùng). */
  tabLabel: string
  sortOrder?: number
  name: string
  descriptionTemplate: string
  params: ChampionSkillParamRow[]
}

export interface Champion {
  id: string
  name: string
  cost: 1 | 2 | 3 | 4 | 5
  /** Id vai trò — khớp `GameRoleType.id` / cột `role_type` BE. */
  roleType: string
  /** Tên hiển thị (từ join meta) — optional nếu API không gửi. */
  roleTypeName?: string
  /** Màu meta — optional. */
  roleTypeColor?: string
  contentVersion?: number
  /** Tên tộc/hệ (thứ tự giữ nguyên khi gửi API). */
  traits: string[]
  imageUrl: string
  /** Một hoặc nhiều kỹ năng (tab). */
  skills: ChampionSkillBlock[]
  /** Kỹ năng đầu — trùng `skills[0]` (API/legacy). */
  skill: ChampionSkillBlock
  starStats: ChampionStarStatRow[]
  /** Lõi nâng cấp / ưu tiên augment cho tướng */
  augmentState?: ChampionAugmentState
  /** Kỳ ngộ, portal hoặc sự kiện phiên liên quan */
  encounters?: GameEncounter[]
}

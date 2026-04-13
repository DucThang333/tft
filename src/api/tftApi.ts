import { apiBaseUrl } from './config'
import { getDataVersion } from '../state/dataVersion'
import type {
  BaseItem,
  BoardChampion,
  Champion,
  ChampionAugmentState,
  ChampionSkillBlock,
  ChampionSkillParamRow,
  ChampionStarStatRow,
  CombinedItem,
  Composition,
  GameAugment,
  GameEncounter,
  GameRoleType,
  GameTraitDef,
  MetaDescriptionParamRow,
  ScalesWithOption,
  DataVersionOption,
  Trait,
  TrayChampion,
} from '../types'

function withVersionQuery(path: string): string {
  const versionId = getDataVersion()
  if (!versionId) return path
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}versionId=${encodeURIComponent(versionId)}`
}

function withVersionHeaders(base?: HeadersInit): HeadersInit | undefined {
  const versionId = getDataVersion()
  if (!versionId) return base
  const headers = new Headers(base ?? {})
  headers.set('x-data-version', versionId)
  return headers
}

function withVersionInBody(body: unknown): unknown {
  const versionId = getDataVersion()
  if (!versionId || body == null || typeof body !== 'object') return body
  const raw = body as Record<string, unknown>

  if (raw.champion && typeof raw.champion === 'object') {
    return {
      ...raw,
      champion: { ...(raw.champion as Record<string, unknown>), versionId },
    }
  }
  if (raw.trait && typeof raw.trait === 'object') {
    return {
      ...raw,
      trait: { ...(raw.trait as Record<string, unknown>), versionId },
    }
  }
  if (raw.item && typeof raw.item === 'object') {
    return {
      ...raw,
      item: { ...(raw.item as Record<string, unknown>), versionId },
    }
  }
  if (raw.augment && typeof raw.augment === 'object') {
    return {
      ...raw,
      augment: { ...(raw.augment as Record<string, unknown>), versionId },
    }
  }
  if (raw.encounter && typeof raw.encounter === 'object') {
    return {
      ...raw,
      encounter: { ...(raw.encounter as Record<string, unknown>), versionId },
    }
  }
  if (raw.roleType && typeof raw.roleType === 'object') {
    return {
      ...raw,
      roleType: { ...(raw.roleType as Record<string, unknown>), versionId },
    }
  }
  return body
}

async function tftGet<T>(path: string, opts?: { includeVersion?: boolean }): Promise<T> {
  const includeVersion = opts?.includeVersion !== false
  const fullPath = includeVersion ? withVersionQuery(path) : path
  const url = `${apiBaseUrl()}${fullPath}`
  const res = await fetch(url, { headers: includeVersion ? withVersionHeaders() : undefined })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}${body ? `: ${body.slice(0, 180)}` : ''}`)
  }
  return res.json() as Promise<T>
}

async function tftWrite<T>(
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const fullPath = withVersionQuery(path)
  const payload = withVersionInBody(body)
  const url = `${apiBaseUrl()}${fullPath}`
  const res = await fetch(url, {
    method,
    headers:
      payload === undefined
        ? withVersionHeaders()
        : withVersionHeaders({ 'Content-Type': 'application/json' }),
    body: payload === undefined ? undefined : JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text.slice(0, 180)}` : ''}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function tierColor(c: string): Trait['color'] {
  return c === 'tertiary' || c === 'primary' || c === 'default' ? c : 'default'
}

function parseBaseItem(raw: Record<string, unknown>): BaseItem {
  return {
    id: String(raw.id),
    name: String(raw.name),
    shortName: String(raw.shortName),
    stat: String(raw.stat),
    imageUrl: String(raw.imageUrl),
    utility: Number(raw.utility),
    offense: Number(raw.offense),
  }
}

function parseCombinedItem(raw: Record<string, unknown>): CombinedItem {
  const components = raw.components as string[]
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: String(raw.description),
    components: [components[0], components[1]] as [string, string],
    componentNames: String(raw.componentNames),
    tier: raw.tier != null && raw.tier !== '' ? String(raw.tier) : undefined,
    tags: (raw.tags as string[]) ?? [],
    imageUrl: String(raw.imageUrl),
    stats: (raw.stats as { label: string; value: string }[]) ?? [],
    descriptionParams: parseDescriptionParamsList(raw.descriptionParams ?? raw.description_params),
    versionId:
      raw.versionId != null && String(raw.versionId) !== ''
        ? String(raw.versionId)
        : raw.version_id != null && String(raw.version_id) !== ''
          ? String(raw.version_id)
          : undefined,
  }
}

function parseComposition(raw: Record<string, unknown>): Composition {
  const champs = ((raw.champions as Record<string, unknown>[]) ?? []).map((c) => ({
    name: String(c.name),
    imageUrl: String(c.imageUrl),
    items: Array.isArray(c.items) ? (c.items as string[]) : undefined,
  }))
  return {
    id: String(raw.id),
    name: String(raw.name),
    tier: raw.tier as Composition['tier'],
    traits: (raw.traits as Composition['traits']) ?? [],
    champions: champs,
    winRate: Number(raw.winRate),
    top4Rate: Number(raw.top4Rate),
    difficulty: Number(raw.difficulty),
    strategy: raw.strategy != null ? String(raw.strategy) : undefined,
    performanceCurve: (raw.performanceCurve as number[]) ?? [],
    backgroundImageUrl:
      raw.backgroundImageUrl != null ? String(raw.backgroundImageUrl) : undefined,
  }
}

export interface MetaOverview {
  region: string
  updated: string
  patchLabel: string
}

export interface BoardBootstrap {
  synergies: Trait[]
  boardChampions: BoardChampion[]
  trayChampions: TrayChampion[]
  boardItems: { id: string; imageUrl: string }[]
}

function parseBoardBootstrap(json: Record<string, unknown>): BoardBootstrap {
  const synergies = ((json.synergies as Record<string, unknown>[]) ?? []).map((t) => ({
    name: String(t.name),
    icon: String(t.icon),
    current: Number(t.current),
    max: Number(t.max),
    active: Boolean(t.active),
    color: tierColor(String(t.color)),
  }))

  const boardChampions = ((json.boardChampions as Record<string, unknown>[]) ?? []).map(
    (c) => ({
      id: String(c.id),
      name: String(c.name),
      imageUrl: String(c.imageUrl),
      row: Number(c.row),
      col: Number(c.col),
      highlighted: c.highlighted === true,
    }),
  )

  const trayChampions = ((json.trayChampions as Record<string, unknown>[]) ?? []).map(
    (c) => ({
      id: String(c.id),
      name: String(c.name),
      cost: Number(c.cost) as TrayChampion['cost'],
      traits: (c.traits as string[]) ?? [],
      imageUrl: String(c.imageUrl),
      tierColor: String(c.tierColor),
    }),
  )

  const boardItems = ((json.boardItems as Record<string, unknown>[]) ?? []).map((i) => ({
    id: String(i.id),
    imageUrl: String(i.imageUrl),
  }))

  return { synergies, boardChampions, trayChampions, boardItems }
}

function parseMetaDescriptionParamRow(
  row: Record<string, unknown>,
  defaultOrder: number,
): MetaDescriptionParamRow {
  const sw = row.scalesWith ?? row.scales_with
  return {
    paramKey: String(row.paramKey ?? row.param_key ?? ''),
    displayLabel: String(row.displayLabel ?? row.display_label ?? ''),
    sampleValue: String(row.sampleValue ?? row.sample_value ?? ''),
    scalesWith: sw != null && String(sw) !== '' ? String(sw) : undefined,
    sortOrder:
      row.sortOrder != null
        ? Number(row.sortOrder)
        : row.sort_order != null
          ? Number(row.sort_order)
          : defaultOrder,
  }
}

function parseDescriptionParamsList(raw: unknown): MetaDescriptionParamRow[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((p, i) =>
      p != null && typeof p === 'object'
        ? parseMetaDescriptionParamRow(p as Record<string, unknown>, i)
        : null,
    )
    .filter((x): x is MetaDescriptionParamRow => x != null)
}

function parseGameRoleType(raw: Record<string, unknown>): GameRoleType {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    color: String(raw.color ?? '#64748b'),
    description: String(raw.description ?? ''),
    descriptionParams: parseDescriptionParamsList(raw.descriptionParams ?? raw.description_params),
  }
}

function parseGameTraitDef(raw: Record<string, unknown>): GameTraitDef {
  const kind = raw.kind === 'class' ? 'class' : 'origin'
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    kind,
    description: raw.description != null ? String(raw.description) : '',
    iconUrl: raw.iconUrl != null ? String(raw.iconUrl) : '',
    descriptionParams: parseDescriptionParamsList(raw.descriptionParams ?? raw.description_params),
  }
}

function parseScalesWithOption(raw: Record<string, unknown>): ScalesWithOption {
  const tc = raw.textColor ?? raw.text_color
  const vfRaw = raw.valueFormat ?? raw.value_format
  const vfStr = vfRaw != null ? String(vfRaw).trim().toLowerCase() : ''
  const valueFormat = vfStr === 'percent' ? 'percent' : 'flat'
  return {
    id: String(raw.id ?? ''),
    label: String(raw.label ?? ''),
    iconUrl: raw.iconUrl != null ? String(raw.iconUrl) : '',
    textColor: tc != null && String(tc).trim() !== '' ? String(tc).trim() : undefined,
    valueFormat,
  }
}

function parseGameAugment(raw: Record<string, unknown>): GameAugment {
  const t = raw.tier
  const tier: GameAugment['tier'] =
    t === 'gold' || t === 'prismatic' ? t : 'silver'
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    tier,
    description: raw.description != null ? String(raw.description) : '',
    imageUrl: raw.imageUrl != null ? String(raw.imageUrl) : '',
    descriptionParams: parseDescriptionParamsList(raw.descriptionParams ?? raw.description_params),
    versionId:
      raw.versionId != null && String(raw.versionId) !== ''
        ? String(raw.versionId)
        : raw.version_id != null && String(raw.version_id) !== ''
          ? String(raw.version_id)
          : undefined,
  }
}

function parseGameEncounter(raw: Record<string, unknown>): GameEncounter {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: raw.description != null ? String(raw.description) : '',
    imageUrl: raw.imageUrl != null ? String(raw.imageUrl) : '',
    descriptionParams: parseDescriptionParamsList(raw.descriptionParams ?? raw.description_params),
    versionId:
      raw.versionId != null && String(raw.versionId) !== ''
        ? String(raw.versionId)
        : raw.version_id != null && String(raw.version_id) !== ''
          ? String(raw.version_id)
          : undefined,
  }
}

function parseDataVersionOption(raw: Record<string, unknown>): DataVersionOption {
  return {
    value: String(raw.value ?? ''),
    label: String(raw.label ?? ''),
    isActive: raw.isActive != null ? Boolean(raw.isActive) : undefined,
    notes: raw.notes != null ? String(raw.notes) : undefined,
  }
}

function parseChampionAugmentState(raw: unknown): ChampionAugmentState | undefined {
  if (raw == null || typeof raw !== 'object') return undefined
  const o = raw as Record<string, unknown>
  const linkedRaw = Array.isArray(o.linked) ? o.linked : []
  const linked = linkedRaw.map((item) => {
    const x = item != null && typeof item === 'object' ? (item as Record<string, unknown>) : {}
    const t = x.tier
    const tier: GameAugment['tier'] =
      t === 'gold' || t === 'prismatic' ? t : 'silver'
    return {
      id: String(x.id ?? ''),
      name: String(x.name ?? ''),
      tier,
      description: x.description != null ? String(x.description) : '',
      imageUrl: x.imageUrl != null ? String(x.imageUrl) : '',
    }
  })
  return {
    linked,
    notes: o.notes === null || o.notes === undefined ? o.notes : String(o.notes),
  }
}

function parseTraitDisplayNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((t) => {
      if (typeof t === 'string') return t.trim()
      if (t != null && typeof t === 'object') {
        const o = t as Record<string, unknown>
        if (typeof o.name === 'string') return o.name.trim()
      }
      return ''
    })
    .filter(Boolean)
}

function parseStarStatRow(row: Record<string, unknown>): ChampionStarStatRow | null {
  const stars = Number(row.stars)
  if (!([1, 2, 3, 4] as const).includes(stars as 1 | 2 | 3 | 4)) return null
  return {
    stars: stars as ChampionStarStatRow['stars'],
    hp: Number(row.hp ?? 0),
    manaInitial: Number(row.manaInitial ?? row.mana_initial ?? 0),
    manaMax: Number(row.manaMax ?? row.mana_max ?? 0),
    attackDamage: Number(row.attackDamage ?? row.attack_damage ?? 0),
    abilityPower: Number(row.abilityPower ?? row.ability_power ?? 0),
    armor: Number(row.armor ?? 0),
    magicResist: Number(row.magicResist ?? row.magic_resist ?? 0),
    attackSpeed: Number(row.attackSpeed ?? row.attack_speed ?? 0),
    critChance: Number(row.critChance ?? row.crit_chance ?? 0),
    critDamage: Number(row.critDamage ?? row.crit_damage ?? 0),
    attackRange: Number(row.attackRange ?? row.attack_range ?? 0),
  }
}

function parseStarStats(raw: unknown): ChampionStarStatRow[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((r) => (r != null && typeof r === 'object' ? parseStarStatRow(r as Record<string, unknown>) : null))
    .filter((x): x is ChampionStarStatRow => x != null)
}

function parseSkillParamRow(
  row: Record<string, unknown>,
  defaultOrder: number,
): ChampionSkillParamRow {
  const valsRaw = row.starValues ?? row.star_values
  const vals = Array.isArray(valsRaw) ? valsRaw.map((v) => Number(v)) : []
  const sw = row.scalesWith ?? row.scales_with
  return {
    paramKey: String(row.paramKey ?? row.param_key ?? ''),
    displayLabel: String(row.displayLabel ?? row.display_label ?? ''),
    starValues: vals,
    scalesWith: sw != null && String(sw) !== '' ? String(sw) : undefined,
    sortOrder:
      row.sortOrder != null
        ? Number(row.sortOrder)
        : row.sort_order != null
          ? Number(row.sort_order)
          : defaultOrder,
  }
}

function parseSkillBlock(raw: Record<string, unknown>): ChampionSkillBlock {
  const skillObj = raw.skill as Record<string, unknown> | undefined
  const paramsRaw = (skillObj?.params as unknown[]) ?? []
  const params = paramsRaw
    .map((p, i) =>
      p != null && typeof p === 'object' ? parseSkillParamRow(p as Record<string, unknown>, i) : null,
    )
    .filter((x): x is ChampionSkillParamRow => x != null)

  const name =
    skillObj?.name != null
      ? String(skillObj.name)
      : String(raw.skillName ?? raw.skill_name ?? '')
  const descriptionTemplate =
    skillObj?.descriptionTemplate != null
      ? String(skillObj.descriptionTemplate)
      : String(raw.skillDescriptionTemplate ?? raw.skill_description_template ?? '')

  return {
    tabLabel: 'Mặc định',
    sortOrder: 0,
    name,
    descriptionTemplate,
    params,
  }
}

function parseOneSkillBlock(obj: Record<string, unknown>, index: number): ChampionSkillBlock {
  const paramsRaw = (obj.params as unknown[]) ?? []
  const params = paramsRaw
    .map((p, i) =>
      p != null && typeof p === 'object' ? parseSkillParamRow(p as Record<string, unknown>, i) : null,
    )
    .filter((x): x is ChampionSkillParamRow => x != null)

  const so = obj.sortOrder ?? obj.sort_order
  return {
    id: obj.id != null && String(obj.id).length > 0 ? String(obj.id) : undefined,
    tabLabel: String(
      obj.tabLabel ?? obj.tab_label ?? (index === 0 ? 'Mặc định' : `Kỹ năng ${index + 1}`),
    ),
    sortOrder: so != null && so !== '' ? Number(so) : index,
    name: String(obj.name ?? ''),
    descriptionTemplate: String(obj.descriptionTemplate ?? obj.description_template ?? ''),
    params,
  }
}

function parseChampionSkills(raw: Record<string, unknown>): ChampionSkillBlock[] {
  const skillsRaw = raw.skills
  if (Array.isArray(skillsRaw) && skillsRaw.length > 0) {
    return skillsRaw.map((el, i) =>
      el != null && typeof el === 'object'
        ? parseOneSkillBlock(el as Record<string, unknown>, i)
        : {
            tabLabel: i === 0 ? 'Mặc định' : `Kỹ năng ${i + 1}`,
            sortOrder: i,
            name: '',
            descriptionTemplate: '',
            params: [],
          },
    )
  }
  return [parseSkillBlock(raw)]
}

function skillBlockToAdminJson(s: ChampionSkillBlock, index: number): Record<string, unknown> {
  const tab = s.tabLabel?.trim() || (index === 0 ? 'Mặc định' : `Kỹ năng ${index + 1}`)
  return {
    tabLabel: tab,
    sortOrder: s.sortOrder ?? index,
    name: s.name,
    descriptionTemplate: s.descriptionTemplate,
    params: s.params.map(skillParamToAdminJson),
  }
}

function starStatToAdminJson(s: ChampionStarStatRow): Record<string, unknown> {
  return {
    stars: s.stars,
    hp: s.hp,
    manaInitial: s.manaInitial,
    manaMax: s.manaMax,
    attackDamage: s.attackDamage,
    abilityPower: s.abilityPower,
    armor: s.armor,
    magicResist: s.magicResist,
    attackSpeed: s.attackSpeed,
    critChance: s.critChance,
    critDamage: s.critDamage,
    attackRange: s.attackRange,
  }
}

function skillParamToAdminJson(p: ChampionSkillParamRow, i: number): Record<string, unknown> {
  const base: Record<string, unknown> = {
    paramKey: p.paramKey,
    displayLabel: p.displayLabel,
    starValues: p.starValues,
    sortOrder: p.sortOrder ?? i,
  }
  if (p.scalesWith != null && p.scalesWith !== '') base.scalesWith = p.scalesWith
  return base
}

/** Payload JSON admin (camelCase) khớp `ChampionController` — dùng cho POST/PUT đầy đủ. */
export function championToAdminPayload(c: Champion): Record<string, unknown> {
  const skills = c.skills?.length ? c.skills : [c.skill]
  const first = skills[0]
  const base: Record<string, unknown> = {
    name: c.name,
    cost: c.cost,
    roleType: c.roleType,
    imageUrl: c.imageUrl,
    traits: c.traits,
    skills: skills.map((s, i) => skillBlockToAdminJson(s, i)),
    skillName: first?.name ?? '',
    skillDescriptionTemplate: first?.descriptionTemplate ?? '',
    skillParams: (first?.params ?? []).map(skillParamToAdminJson),
    starStats: c.starStats.map(starStatToAdminJson),
  }
  if (c.contentVersion != null) base.contentVersion = c.contentVersion
  if (c.augmentState !== undefined) base.augmentState = c.augmentState
  if (c.encounters !== undefined) base.encounters = c.encounters
  return base
}

function championToAdminUpdateBody(c: ChampionAdminPatch): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (c.name !== undefined) out.name = c.name
  if (c.cost !== undefined) out.cost = c.cost
  if (c.roleType !== undefined) out.roleType = c.roleType
  if (c.imageUrl !== undefined) out.imageUrl = c.imageUrl
  if (c.traits !== undefined) out.traits = c.traits
  if (c.contentVersion !== undefined) out.contentVersion = c.contentVersion
  if (c.skills !== undefined) {
    out.skills = c.skills.map((s, i) => skillBlockToAdminJson(s, i))
    const f = c.skills[0]
    if (f) {
      out.skillName = f.name
      out.skillDescriptionTemplate = f.descriptionTemplate
      out.skillParams = f.params.map(skillParamToAdminJson)
    }
  } else if (c.skill !== undefined) {
    out.skillName = c.skill.name
    out.skillDescriptionTemplate = c.skill.descriptionTemplate
    out.skillParams = c.skill.params.map(skillParamToAdminJson)
  }
  if (c.starStats !== undefined) out.starStats = c.starStats.map(starStatToAdminJson)
  if (c.augmentState !== undefined) out.augmentState = c.augmentState
  if (c.encounters !== undefined) out.encounters = c.encounters
  return out
}

function parseChampion(raw: Record<string, unknown>): Champion {
  const cost = Number(raw.cost)
  const safeCost = ([1, 2, 3, 4, 5] as const).includes(cost as 1 | 2 | 3 | 4 | 5)
    ? (cost as Champion['cost'])
    : (1 as Champion['cost'])

  const traits = parseTraitDisplayNames(raw.traits)
  const starStats = parseStarStats(raw.starStats)
  const skills = parseChampionSkills(raw)
  const skill = skills[0] ?? {
    tabLabel: 'Mặc định',
    sortOrder: 0,
    name: '',
    descriptionTemplate: '',
    params: [],
  }
  const cv = raw.contentVersion ?? raw.content_version

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    cost: safeCost,
    roleType: String(raw.roleType ?? raw.role_type ?? ''),
    roleTypeName:
      raw.roleTypeName != null && raw.roleTypeName !== ''
        ? String(raw.roleTypeName)
        : undefined,
    roleTypeColor:
      raw.roleTypeColor != null && raw.roleTypeColor !== ''
        ? String(raw.roleTypeColor)
        : undefined,
    contentVersion: cv != null && cv !== '' ? Number(cv) : undefined,
    skills,
    traits,
    imageUrl: String(raw.imageUrl ?? raw.image_url ?? ''),
    skill,
    starStats,
    augmentState: parseChampionAugmentState(raw.augmentState),
    encounters:
      raw.encounters != null && Array.isArray(raw.encounters)
        ? (raw.encounters as Record<string, unknown>[]).map(parseGameEncounter)
        : undefined,
  }
}

/** PATCH admin: chỉ gửi các field cần đổi (vd. `augmentState`, `encounters`). */
export type ChampionAdminPatch = Partial<Omit<Champion, 'id'>> & Pick<Champion, 'id'>

export const tftApi = {
  async champions(): Promise<Champion[]> {
    const r = await tftGet<{ champions: Record<string, unknown>[] }>('/api/v1/champions')
    return (r.champions ?? []).map(parseChampion)
  },

  /**
   * POST `{ champion }` — tạo tướng; `augmentState` (trạng thái lõi) và `encounters` (kỳ ngộ) tùy chọn.
   */
  async createChampion(champion: Champion): Promise<Champion> {
    const r = await tftWrite<{ champion: Record<string, unknown> }>(
      'POST',
      '/api/v1/admin/champions',
      { champion: { id: champion.id, ...championToAdminPayload(champion) } },
    )
    return parseChampion(r.champion)
  },

  /**
   * PUT `/admin/champions/:id` + `{ champion }` — chỉ các key có trong body được cập nhật.
   */
  async updateChampion(champion: ChampionAdminPatch): Promise<Champion> {
    const id = encodeURIComponent(champion.id)
    const r = await tftWrite<{ champion: Record<string, unknown> }>(
      'PUT',
      `/api/v1/admin/champions/${id}`,
      { champion: championToAdminUpdateBody(champion) },
    )
    return parseChampion(r.champion)
  },

  async gameTraitDefs(): Promise<GameTraitDef[]> {
    const r = await tftGet<{ traits: Record<string, unknown>[] }>('/api/v1/meta/traits')
    return (r.traits ?? []).map(parseGameTraitDef)
  },

  async scalesWithOptions(): Promise<ScalesWithOption[]> {
    const r = await tftGet<{ scalesWithOptions: Record<string, unknown>[] }>(
      '/api/v1/meta/scales-with',
      { includeVersion: false },
    )
    return (r.scalesWithOptions ?? []).map(parseScalesWithOption)
  },

  async gameRoleTypes(): Promise<GameRoleType[]> {
    const r = await tftGet<{ roleTypes: Record<string, unknown>[] }>('/api/v1/meta/role-types', {
      includeVersion: false,
    })
    return (r.roleTypes ?? []).map(parseGameRoleType)
  },

  async createGameRoleType(row: GameRoleType): Promise<GameRoleType> {
    const res = await tftWrite<{ roleType: Record<string, unknown> }>(
      'POST',
      '/api/v1/admin/meta/role-types',
      {
        roleType: {
          id: row.id,
          name: row.name,
          color: row.color,
          description: row.description,
          descriptionParams: row.descriptionParams,
        },
      },
    )
    return parseGameRoleType(res.roleType)
  },

  async updateGameRoleType(row: GameRoleType): Promise<GameRoleType> {
    const id = encodeURIComponent(row.id)
    const res = await tftWrite<{ roleType: Record<string, unknown> }>(
      'PUT',
      `/api/v1/admin/meta/role-types/${id}`,
      {
        roleType: {
          name: row.name,
          color: row.color,
          description: row.description,
          descriptionParams: row.descriptionParams,
        },
      },
    )
    return parseGameRoleType(res.roleType)
  },

  async removeGameRoleType(id: string): Promise<void> {
    const sid = encodeURIComponent(id)
    await tftWrite<void>('DELETE', `/api/v1/admin/meta/role-types/${sid}`)
  },

  async createScalesWithOption(opt: ScalesWithOption): Promise<ScalesWithOption> {
    const body: Record<string, unknown> = {
      id: opt.id,
      label: opt.label,
      iconUrl: opt.iconUrl,
      valueFormat: opt.valueFormat === 'percent' ? 'percent' : 'flat',
    }
    if (opt.textColor != null && opt.textColor.trim() !== '') body.textColor = opt.textColor.trim()
    const res = await tftWrite<{ scalesWithOption: Record<string, unknown> }>(
      'POST',
      '/api/v1/admin/meta/scales-with',
      { scalesWithOption: body },
    )
    return parseScalesWithOption(res.scalesWithOption)
  },

  async updateScalesWithOption(opt: ScalesWithOption): Promise<ScalesWithOption> {
    const id = encodeURIComponent(opt.id)
    const body: Record<string, unknown> = {
      label: opt.label,
      iconUrl: opt.iconUrl,
      valueFormat: opt.valueFormat === 'percent' ? 'percent' : 'flat',
    }
    if (opt.textColor != null && opt.textColor.trim() !== '') {
      body.textColor = opt.textColor.trim()
    } else {
      body.textColor = ''
    }
    const res = await tftWrite<{ scalesWithOption: Record<string, unknown> }>(
      'PUT',
      `/api/v1/admin/meta/scales-with/${id}`,
      { scalesWithOption: body },
    )
    return parseScalesWithOption(res.scalesWithOption)
  },

  async removeScalesWithOption(id: string): Promise<void> {
    const sid = encodeURIComponent(id)
    await tftWrite<void>('DELETE', `/api/v1/admin/meta/scales-with/${sid}`)
  },

  async gameVersions(): Promise<DataVersionOption[]> {
    const r = await tftGet<{ versions: Record<string, unknown>[] }>('/api/v1/meta/versions', {
      includeVersion: false,
    })
    return (r.versions ?? []).map(parseDataVersionOption).filter((v) => v.value.length > 0)
  },

  /**
   * Chuyển `version_id` theo từng nhóm (`entities`) từ phiên bản nguồn sang đích.
   * Khóa hợp lệ: champions, traits, baseItems, combinedItems, augments, encounters
   */
  async migrateVersionData(
    fromVersionId: string,
    toVersionId: string,
    entities: string[],
  ): Promise<{
    champions: number
    traits: number
    baseItems: number
    combinedItems: number
    augments: number
    encounters: number
  }> {
    const res = await tftWrite<{
      ok?: boolean
      migrated?: {
        champions: number
        traits: number
        baseItems: number
        combinedItems: number
        augments: number
        encounters: number
      }
    }>('POST', '/api/v1/admin/meta/migrate-version', { fromVersionId, toVersionId, entities })
    const m = res?.migrated
    if (!m) throw new Error('Đồng bộ: phản hồi không hợp lệ.')
    return m
  },

  async createGameTraitDef(trait: GameTraitDef): Promise<GameTraitDef> {
    const res = await tftWrite<{ trait: Record<string, unknown> }>(
      'POST',
      '/api/v1/admin/meta/traits',
      { trait },
    )
    return parseGameTraitDef(res.trait)
  },

  async updateGameTraitDef(trait: GameTraitDef): Promise<GameTraitDef> {
    const id = encodeURIComponent(trait.id)
    const res = await tftWrite<{ trait: Record<string, unknown> }>(
      'PUT',
      `/api/v1/admin/meta/traits/${id}`,
      { trait },
    )
    return parseGameTraitDef(res.trait)
  },

  async removeGameTraitDef(id: string): Promise<void> {
    const traitId = encodeURIComponent(id)
    await tftWrite<void>('DELETE', `/api/v1/admin/meta/traits/${traitId}`)
  },

  async gameAugments(): Promise<GameAugment[]> {
    const r = await tftGet<{ augments: Record<string, unknown>[] }>('/api/v1/meta/augments')
    return (r.augments ?? []).map(parseGameAugment)
  },

  async createGameAugment(augment: GameAugment): Promise<GameAugment> {
    const res = await tftWrite<{ augment: Record<string, unknown> }>(
      'POST',
      '/api/v1/admin/meta/augments',
      { augment },
    )
    return parseGameAugment(res.augment)
  },

  async updateGameAugment(augment: GameAugment): Promise<GameAugment> {
    const id = encodeURIComponent(augment.id)
    const res = await tftWrite<{ augment: Record<string, unknown> }>(
      'PUT',
      `/api/v1/admin/meta/augments/${id}`,
      { augment },
    )
    return parseGameAugment(res.augment)
  },

  async gameEncounters(): Promise<GameEncounter[]> {
    const r = await tftGet<{ encounters: Record<string, unknown>[] }>(
      '/api/v1/meta/encounters',
    )
    return (r.encounters ?? []).map(parseGameEncounter)
  },

  async createGameEncounter(encounter: GameEncounter): Promise<GameEncounter> {
    const res = await tftWrite<{ encounter: Record<string, unknown> }>(
      'POST',
      '/api/v1/admin/meta/encounters',
      { encounter },
    )
    return parseGameEncounter(res.encounter)
  },

  async updateGameEncounter(encounter: GameEncounter): Promise<GameEncounter> {
    const id = encodeURIComponent(encounter.id)
    const res = await tftWrite<{ encounter: Record<string, unknown> }>(
      'PUT',
      `/api/v1/admin/meta/encounters/${id}`,
      { encounter },
    )
    return parseGameEncounter(res.encounter)
  },

  async createCombinedItemAdmin(item: CombinedItem): Promise<CombinedItem> {
    const res = await tftWrite<{ item: Record<string, unknown> }>(
      'POST',
      '/api/v1/admin/items/combined',
      { item },
    )
    return parseCombinedItem(res.item as Record<string, unknown>)
  },

  async updateCombinedItemAdmin(item: CombinedItem): Promise<CombinedItem> {
    const id = encodeURIComponent(item.id)
    const res = await tftWrite<{ item: Record<string, unknown> }>(
      'PUT',
      `/api/v1/admin/items/combined/${id}`,
      { item },
    )
    return parseCombinedItem(res.item as Record<string, unknown>)
  },

  async baseItems(): Promise<BaseItem[]> {
    const r = await tftGet<{ baseItems: Record<string, unknown>[] }>('/api/v1/items/base')
    return (r.baseItems ?? []).map(parseBaseItem)
  },

  async combinedItems(): Promise<CombinedItem[]> {
    const r = await tftGet<{ combinedItems: Record<string, unknown>[] }>(
      '/api/v1/items/combined',
    )
    return r.combinedItems.map(parseCombinedItem)
  },

  async compositions(): Promise<Composition[]> {
    const r = await tftGet<{ compositions: Record<string, unknown>[] }>(
      '/api/v1/meta/compositions',
    )
    return r.compositions.map(parseComposition)
  },

  async metaOverview(): Promise<MetaOverview> {
    return tftGet<MetaOverview>('/api/v1/meta/overview')
  },

  async boardBootstrap(): Promise<BoardBootstrap> {
    const r = await tftGet<Record<string, unknown>>('/api/v1/board/bootstrap')
    return parseBoardBootstrap(r)
  },
}

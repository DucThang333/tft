import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Collapse, Select } from 'antd'
import { Icon } from '../../../components/ui/Icon'
import { ImageUrlUpload } from '../../../components/forms/ImageUrlUpload'
import { tftApi } from '../../../api/tftApi'
import { usePromiseData } from '../../../hooks/usePromiseData'
import { SkillDescriptionEditor } from '../../../components/editor/SkillDescriptionEditor'
import { skillDescriptionTextIsEmpty } from '../../../components/editor/skillDescriptionHtml'
import { CHAMPION_SPLASH_ASPECT_CLASS } from '../../champions/championVisual'
import { SkillDescriptionPanel } from '../../../features/champions/components/skill/SkillDescriptionPanel'
import {
  AdminFormCardProgress,
  AdminFormCollapseLabel,
  ADMIN_FORM_COLLAPSE_CLASS,
} from '../components/AdminFormCollapseLabel'
import { fieldFilled, mergeStats } from '../components/adminFormFieldStats'
import { buildScalesWithVisualMaps } from '../utils/scalesWithVisualMaps'
import type {
  Champion,
  ChampionSkillBlock,
  ChampionSkillParamRow,
  ChampionStarStatRow,
} from '../../../types'

const COSTS: Champion['cost'][] = [1, 2, 3, 4, 5]

function defaultStarRow(stars: ChampionStarStatRow['stars']): ChampionStarStatRow {
  return {
    stars,
    hp: 500,
    manaInitial: 0,
    manaMax: 60,
    attackDamage: 50,
    abilityPower: 100,
    armor: 35,
    magicResist: 35,
    attackSpeed: 0.65,
    critChance: 0.25,
    critDamage: 1.4,
    attackRange: 1,
  }
}

function withSyncedPrimarySkill(skills: ChampionSkillBlock[]): {
  skills: ChampionSkillBlock[]
  skill: ChampionSkillBlock
} {
  const skill =
    skills[0] ??
    ({
      tabLabel: 'Mặc định',
      sortOrder: 0,
      name: '',
      descriptionTemplate: '',
      params: [],
    } satisfies ChampionSkillBlock)
  return { skills, skill }
}

function emptyForm(): Champion {
  const skills: ChampionSkillBlock[] = [
    { tabLabel: 'Mặc định', sortOrder: 0, name: '', descriptionTemplate: '', params: [] },
  ]
  return {
    id: '',
    name: '',
    cost: 1,
    roleType: '',
    contentVersion: 1,
    traits: [],
    imageUrl: '',
    ...withSyncedPrimarySkill(skills),
    starStats: [defaultStarRow(1)],
  }
}

function parseStarValuesCsv(raw: string): number[] {
  return raw
    .split(/[,;]/)
    .map((s) => Number(String(s).trim()))
    .filter((n) => !Number.isNaN(n))
}

export function AdminChampionsPage() {
  const [listTick, setListTick] = useState(0)
  const { data: champions, loading, error } = usePromiseData(() => tftApi.champions(), [listTick])
  const { data: traitDefs } = usePromiseData(() => tftApi.gameTraitDefs(), [listTick])
  const { data: scalesWithOpts } = usePromiseData(() => tftApi.scalesWithOptions(), [listTick])
  const { data: roleTypes } = usePromiseData(() => tftApi.gameRoleTypes(), [listTick])

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<Champion>(emptyForm)
  const [skillParamStarInputs, setSkillParamStarInputs] = useState<string[][]>([])
  const [activeSkillIndex, setActiveSkillIndex] = useState(0)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [skillEditorNonce, setSkillEditorNonce] = useState(0)

  const traitSelectOptions = useMemo(() => {
    const defs = traitDefs ?? []
    const origins = defs.filter((t) => t.kind === 'origin')
    const classes = defs.filter((t) => t.kind === 'class')
    return [
      {
        label: 'Tộc',
        options: origins.map((t) => ({ label: t.name, value: t.name })),
      },
      {
        label: 'Hệ',
        options: classes.map((t) => ({ label: t.name, value: t.name })),
      },
    ]
  }, [traitDefs])

  const roleById = useMemo(() => {
    const m = new Map<string, { name: string; color: string }>()
    for (const r of roleTypes ?? []) {
      m.set(r.id, { name: r.name, color: r.color })
    }
    return m
  }, [roleTypes])

  const roleSelectOptions = useMemo(() => {
    const defs = roleTypes ?? []
    const swatch = (color: string, text: string) => (
      <span className="flex items-center gap-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-sm border border-outline-variant/40 shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <span>{text}</span>
      </span>
    )
    const fromApi = defs.map((r) => ({
      value: r.id,
      label: swatch(r.color, `${r.name} (${r.id})`),
    }))
    const ids = new Set(fromApi.map((x) => x.value))
    const orphan: { value: string; label: ReactNode }[] = []
    const orphanId = draft.roleType?.trim()
    if (orphanId && !ids.has(orphanId)) {
      orphan.push({
        value: orphanId,
        label: swatch(draft.roleTypeColor ?? '#888888', `${orphanId} (không có trong meta)`),
      })
    }
    return [...orphan, ...fromApi].sort((a, b) => a.value.localeCompare(b.value))
  }, [roleTypes, draft.roleType, draft.roleTypeColor])

  const { scalesWithIconById, scalesWithTextColorById, scalesWithValueFormatById } = useMemo(
    () => buildScalesWithVisualMaps(scalesWithOpts),
    [scalesWithOpts],
  )

  const scalesWithSelectOptions = useMemo(() => {
    const defs = scalesWithOpts ?? []
    const fromApi = defs.map((o) => ({
      value: o.id,
      label: `${o.label} (${o.id})`,
    }))
    const ids = new Set(fromApi.map((x) => x.value))
    const orphan: { value: string; label: string }[] = []
    for (const sk of draft.skills) {
      for (const row of sk.params) {
        const sw = row.scalesWith?.trim()
        if (sw && !ids.has(sw)) {
          orphan.push({ value: sw, label: `${sw} (không có trong meta)` })
          ids.add(sw)
        }
      }
    }
    return [...orphan, ...fromApi].sort((a, b) => a.value.localeCompare(b.value))
  }, [scalesWithOpts, draft.skills])

  const identityStats = useMemo(() => {
    const filled =
      (fieldFilled(draft.id) ? 1 : 0) +
      (fieldFilled(draft.name) ? 1 : 0) +
      1 +
      (fieldFilled(draft.roleType) ? 1 : 0) +
      (draft.traits.length > 0 ? 1 : 0) +
      (fieldFilled(draft.imageUrl) ? 1 : 0)
    return { filled, total: 6 }
  }, [draft.id, draft.name, draft.cost, draft.roleType, draft.traits, draft.imageUrl])

  const skillBlockStats = useMemo(() => {
    let filled = 0
    const total = Math.max(1, draft.skills.length) * 2
    for (const sk of draft.skills) {
      if (fieldFilled(sk.name)) filled += 1
      if (!skillDescriptionTextIsEmpty(sk.descriptionTemplate)) filled += 1
    }
    return { filled, total }
  }, [draft.skills])

  const skillParamStats = useMemo(() => {
    const rows = draft.skills.flatMap((s) => s.params)
    if (rows.length === 0) return { filled: 0, total: 1 }
    const filled = rows.filter(
      (r) =>
        fieldFilled(r.paramKey) ||
        fieldFilled(r.displayLabel) ||
        (r.starValues?.length ?? 0) > 0 ||
        fieldFilled(r.scalesWith),
    ).length
    return { filled, total: rows.length }
  }, [draft.skills])

  const championFormProgress = useMemo(
    () => mergeStats(identityStats, skillBlockStats, skillParamStats),
    [identityStats, skillBlockStats, skillParamStats],
  )

  const filtered = useMemo(() => {
    const list = champions ?? []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.roleType.toLowerCase().includes(q) ||
        (c.roleTypeName?.toLowerCase().includes(q) ?? false) ||
        c.traits.some((t) => t.toLowerCase().includes(q)),
    )
  }, [champions, query])

  const previewSkill = useMemo((): ChampionSkillBlock => {
    const sk = draft.skills[activeSkillIndex] ?? draft.skills[0]
    if (!sk) {
      return {
        tabLabel: 'Mặc định',
        sortOrder: 0,
        name: '',
        descriptionTemplate: '',
        params: [],
      }
    }
    const rowInputs = skillParamStarInputs[activeSkillIndex] ?? []
    const params = sk.params.map((p, i) => {
      const fromInput = parseStarValuesCsv(rowInputs[i] ?? '')
      const vals = fromInput.length >= 1 ? fromInput : p.starValues
      return { ...p, starValues: vals }
    })
    return { ...sk, params }
  }, [draft.skills, activeSkillIndex, skillParamStarInputs])

  const refreshList = useCallback(() => setListTick((t) => t + 1), [])

  const bumpSkillEditor = useCallback(() => setSkillEditorNonce((n) => n + 1), [])

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyForm())
    setSkillParamStarInputs([[]])
    setActiveSkillIndex(0)
    setSaveMessage(null)
    bumpSkillEditor()
  }, [bumpSkillEditor])

  const selectChampion = useCallback(
    (c: Champion) => {
      setIsNew(false)
      const skills = (c.skills?.length ? c.skills : [c.skill]).map((s) => ({
        ...s,
        params: s.params.map((p) => ({ ...p })),
      }))
      setDraft({ ...c, ...withSyncedPrimarySkill(skills) })
      setSkillParamStarInputs(skills.map((s) => s.params.map((p) => p.starValues.join(', '))))
      setActiveSkillIndex(0)
      setSaveMessage(null)
      bumpSkillEditor()
    },
    [bumpSkillEditor],
  )

  const setField = useCallback(<K extends keyof Champion>(key: K, value: Champion[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
  }, [])

  const setStarRow = useCallback((index: number, patch: Partial<ChampionStarStatRow>) => {
    setDraft((d) => ({
      ...d,
      starStats: d.starStats.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }))
  }, [])

  const addStarRow = useCallback(() => {
    setDraft((d) => {
      const used = new Set(d.starStats.map((s) => s.stars))
      const next = ([1, 2, 3, 4] as const).find((s) => !used.has(s))
      if (!next) return d
      const prev = d.starStats[d.starStats.length - 1]
      const base = prev ?? defaultStarRow(1)
      const row: ChampionStarStatRow = { ...base, stars: next }
      return { ...d, starStats: [...d.starStats, row] }
    })
  }, [])

  const removeStarRow = useCallback((index: number) => {
    setDraft((d) => {
      if (d.starStats.length <= 1) return d
      return { ...d, starStats: d.starStats.filter((_, i) => i !== index) }
    })
  }, [])

  const patchActiveSkill = useCallback(
    (patch: Partial<ChampionSkillBlock>) => {
      const si = activeSkillIndex
      setDraft((d) => {
        const next = d.skills.map((s, i) => (i === si ? { ...s, ...patch } : s))
        return { ...d, ...withSyncedPrimarySkill(next) }
      })
    },
    [activeSkillIndex],
  )

  const addChampionSkill = useCallback(() => {
    let newIndex = 0
    setDraft((d) => {
      const n = d.skills.length
      const tabLabel = n === 0 ? 'Mặc định' : n === 1 ? 'Anh Hùng' : `Kỹ năng ${n + 1}`
      const newSk: ChampionSkillBlock = {
        tabLabel,
        sortOrder: n,
        name: '',
        descriptionTemplate: '',
        params: [],
      }
      const next = [...d.skills, newSk]
      newIndex = next.length - 1
      return { ...d, ...withSyncedPrimarySkill(next) }
    })
    setSkillParamStarInputs((prev) => [...prev, []])
    setActiveSkillIndex(newIndex)
    bumpSkillEditor()
  }, [bumpSkillEditor])

  const removeChampionSkill = useCallback(
    (si: number) => {
      setDraft((d) => {
        if (d.skills.length <= 1) return d
        const next = d.skills.filter((_, i) => i !== si)
        return { ...d, ...withSyncedPrimarySkill(next) }
      })
      setSkillParamStarInputs((prev) => prev.filter((_, i) => i !== si))
      setActiveSkillIndex((ai) => {
        if (si < ai) return ai - 1
        if (si === ai) return Math.max(0, si - 1)
        return ai
      })
      bumpSkillEditor()
    },
    [bumpSkillEditor],
  )

  const addSkillParamRow = useCallback(() => {
    const si = activeSkillIndex
    setDraft((d) => {
      const next = d.skills.map((s, i) =>
        i === si
          ? {
              ...s,
              params: [
                ...s.params,
                { paramKey: '', displayLabel: '', starValues: [], sortOrder: s.params.length },
              ],
            }
          : s,
      )
      return { ...d, ...withSyncedPrimarySkill(next) }
    })
    setSkillParamStarInputs((prev) => {
      const copy = [...prev]
      while (copy.length <= si) copy.push([])
      copy[si] = [...(copy[si] ?? []), '']
      return copy
    })
  }, [activeSkillIndex])

  const removeSkillParamRow = useCallback(
    (paramIndex: number) => {
      const si = activeSkillIndex
      setDraft((d) => {
        const next = d.skills.map((s, i) =>
          i === si ? { ...s, params: s.params.filter((_, j) => j !== paramIndex) } : s,
        )
        return { ...d, ...withSyncedPrimarySkill(next) }
      })
      setSkillParamStarInputs((prev) => {
        const copy = prev.map((r) => [...r])
        if (copy[si]) copy[si] = copy[si].filter((_, j) => j !== paramIndex)
        return copy
      })
    },
    [activeSkillIndex],
  )

  const setSkillParamField = useCallback(
    (paramIndex: number, patch: Partial<ChampionSkillParamRow>) => {
      const si = activeSkillIndex
      setDraft((d) => ({
        ...d,
        ...withSyncedPrimarySkill(
          d.skills.map((s, i) =>
            i === si
              ? {
                  ...s,
                  params: s.params.map((p, j) => (j === paramIndex ? { ...p, ...patch } : p)),
                }
              : s,
          ),
        ),
      }))
    },
    [activeSkillIndex],
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaveMessage(null)

    const mergedSkills: ChampionSkillBlock[] = draft.skills.map((sk, si) => {
      const rowInputs = skillParamStarInputs[si] ?? []
      const mergedParams = sk.params.map((p, pi) => {
        const fromInput = parseStarValuesCsv(rowInputs[pi] ?? '')
        const vals = fromInput.length >= 1 ? fromInput : p.starValues
        return {
          ...p,
          paramKey: p.paramKey.trim(),
          displayLabel: p.displayLabel.trim(),
          starValues: vals,
        }
      })
      const nonEmptyParams = mergedParams.filter(
        (r) =>
          r.paramKey !== '' ||
          r.displayLabel !== '' ||
          (Array.isArray(r.starValues) && r.starValues.length > 0) ||
          (r.scalesWith != null && String(r.scalesWith).trim() !== ''),
      )
      return {
        ...sk,
        tabLabel: sk.tabLabel?.trim() || `Kỹ năng ${si + 1}`,
        sortOrder: sk.sortOrder ?? si,
        params: nonEmptyParams,
      }
    })

    const champion: Champion = {
      ...draft,
      cost: Number(draft.cost) as Champion['cost'],
      skills: mergedSkills,
      skill: mergedSkills[0] ?? draft.skill,
    }

    if (champion.skills.length === 0) {
      setSaveMessage({ type: 'err', text: 'Cần ít nhất một kỹ năng.' })
      return
    }

    if (!champion.id.trim()) {
      setSaveMessage({ type: 'err', text: 'Mã tướng (id) là bắt buộc.' })
      return
    }
    if (!champion.name.trim()) {
      setSaveMessage({ type: 'err', text: 'Tên hiển thị là bắt buộc.' })
      return
    }
    if (!COSTS.includes(champion.cost)) {
      setSaveMessage({ type: 'err', text: 'Giá vàng phải từ 1 đến 5.' })
      return
    }
    if (!champion.roleType.trim()) {
      setSaveMessage({ type: 'err', text: 'Chọn vai trò.' })
      return
    }
    for (let si = 0; si < champion.skills.length; si++) {
      const sk = champion.skills[si]
      if (!sk.name.trim() || skillDescriptionTextIsEmpty(sk.descriptionTemplate)) {
        setSaveMessage({
          type: 'err',
          text: `Kỹ năng "${sk.tabLabel || `#${si + 1}`}": cần tên và mô tả (template).`,
        })
        return
      }
    }
    if (!champion.imageUrl.trim()) {
      setSaveMessage({ type: 'err', text: 'Ảnh tướng là bắt buộc (tải ảnh lên).' })
      return
    }
    if (champion.traits.length === 0) {
      setSaveMessage({ type: 'err', text: 'Chọn ít nhất một tộc hoặc hệ.' })
      return
    }
    if (champion.starStats.length === 0) {
      setSaveMessage({ type: 'err', text: 'Cần ít nhất một dòng chỉ số theo sao (backend).' })
      return
    }

    const dupStars = champion.starStats.map((s) => s.stars)
    if (new Set(dupStars).size !== dupStars.length) {
      setSaveMessage({ type: 'err', text: 'Mỗi mức sao (1–4) chỉ được xuất hiện một lần.' })
      return
    }

    for (let si = 0; si < champion.skills.length; si++) {
      const sk = champion.skills[si]
      for (let pi = 0; pi < sk.params.length; pi++) {
        const p = sk.params[pi]
        const vals = p.starValues
        const hasAny =
          p.paramKey.trim() ||
          p.displayLabel.trim() ||
          vals.length > 0 ||
          (p.scalesWith != null && String(p.scalesWith).trim() !== '')
        if (!hasAny) continue
        if (!p.paramKey.trim() || !p.displayLabel.trim()) {
          setSaveMessage({
            type: 'err',
            text: `Kỹ năng "${sk.tabLabel}": tham số dòng ${pi + 1} cần paramKey và displayLabel.`,
          })
          return
        }
        if (vals.length < 1 || vals.length > 4) {
          setSaveMessage({
            type: 'err',
            text: `Kỹ năng "${sk.tabLabel}" · "${p.paramKey || p.displayLabel || '…'}": starValues cần 1–4 số.`,
          })
          return
        }
      }
    }

    setSaving(true)
    try {
      if (isNew) {
        await tftApi.createChampion(champion)
        setSaveMessage({ type: 'ok', text: 'Đã tạo tướng mới.' })
        startNew()
      } else {
        const updated = await tftApi.updateChampion(champion)
        setSaveMessage({ type: 'ok', text: 'Đã cập nhật tướng.' })
        setDraft(updated)
        setSkillParamStarInputs(
          (updated.skills?.length ? updated.skills : [updated.skill]).map((s) =>
            s.params.map((p) => p.starValues.join(', ')),
          ),
        )
        setActiveSkillIndex(0)
        bumpSkillEditor()
      }
      refreshList()
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err)
      setSaveMessage({
        type: 'err',
        text: text || 'Lưu thất bại.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex-1 p-8 min-h-screen bg-background pb-28">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-tertiary font-label text-[10px] uppercase tracking-[0.2em]">Thánh địa</span>
          <Icon name="chevron_right" className="text-xs text-outline-variant" />
          <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em]">
            Tướng
          </span>
        </div>
        <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight uppercase mb-2">
          Tạo &amp; cập nhật tướng
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <section className="xl:col-span-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={startNew}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-on-primary px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_12px_rgba(118,0,195,0.35)] hover:opacity-95 transition-opacity"
            >
              <Icon name="add" className="text-base" />
              Tạo mới
            </button>
            <label className="flex-1 min-w-[160px]">
              <span className="sr-only">Tìm tướng</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên, id, vai trò, hệ…"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>

          <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low/40 overflow-hidden">
            {loading && (
              <p className="p-6 text-on-surface-variant font-label text-xs uppercase tracking-widest">
                Đang tải danh sách…
              </p>
            )}
            {error && !loading && (
              <div className="p-6 border-b border-outline-variant/10">
                <p className="text-error text-sm font-headline font-bold mb-1">Không tải được danh sách</p>
                <p className="text-on-surface-variant text-xs">{error.message}</p>
              </div>
            )}
            <ul className="max-h-[min(60vh,520px)] overflow-y-auto custom-scrollbar divide-y divide-outline-variant/10">
              {!loading &&
                filtered.map((c) => {
                  const active = !isNew && draft.id === c.id
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selectChampion(c)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          active
                            ? 'bg-primary-container/25 border-l-4 border-primary'
                            : 'border-l-4 border-transparent hover:bg-surface-container-high/80'
                        }`}
                      >
                        <div
                          className={`h-11 w-auto ${CHAMPION_SPLASH_ASPECT_CLASS} rounded-md border border-outline-variant/20 shrink-0 overflow-hidden`}
                        >
                          <img
                            src={c.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-headline font-bold text-on-surface text-sm truncate">{c.name}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider truncate">
                            {c.id} · {c.cost} vàng
                          </p>
                        </div>
                        <Icon name="chevron_right" className="text-on-surface-variant shrink-0 text-lg" />
                      </button>
                    </li>
                  )
                })}
            </ul>
            {!loading && !error && filtered.length === 0 && (
              <p className="p-6 text-on-surface-variant text-sm">Không có tướng khớp bộ lọc.</p>
            )}
          </div>
        </section>

        <section className="xl:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-outline-variant/15 bg-surface-container-high/50 p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-lg font-headline font-bold text-on-surface uppercase tracking-tight">
                {isNew ? 'Hồ sơ mới' : 'Chỉnh sửa hồ sơ'}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <AdminFormCardProgress filled={championFormProgress.filled} total={championFormProgress.total} />
                <span className="text-[10px] font-label uppercase tracking-widest text-tertiary">
                  {isNew ? 'Chế độ tạo' : 'Chế độ cập nhật'}
                </span>
              </div>
            </div>

            <Collapse
              bordered={false}
              className={ADMIN_FORM_COLLAPSE_CLASS}
              defaultActiveKey={['identity', 'skill']}
              items={[
                {
                  key: 'identity',
                  label: (
                    <AdminFormCollapseLabel
                      title="Thông tin tướng & ảnh"
                      filled={identityStats.filled}
                      total={identityStats.total}
                    />
                  ),
                  children: (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Mã tướng (id)
                </span>
                <input
                  required
                  disabled={!isNew}
                  value={draft.id}
                  onChange={(e) => setField('id', e.target.value)}
                  placeholder="vd. tft15_aatrox"
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm disabled:opacity-60"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Tên hiển thị
                </span>
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Giá (vàng)
                </span>
                <select
                  value={draft.cost}
                  onChange={(e) => setField('cost', Number(e.target.value) as Champion['cost'])}
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm"
                >
                  {COSTS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <div className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Vai trò (meta)
                </span>
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn vai trò (meta)…"
                  className="w-full min-h-[42px]"
                  value={draft.roleType.trim() ? draft.roleType : undefined}
                  onChange={(id: string | null) => {
                    if (id == null || id === '') {
                      setDraft((d) => ({
                        ...d,
                        roleType: '',
                        roleTypeName: undefined,
                        roleTypeColor: undefined,
                      }))
                      return
                    }
                    const meta = roleById.get(id)
                    setDraft((d) => ({
                      ...d,
                      roleType: id,
                      roleTypeName: meta?.name,
                      roleTypeColor: meta?.color,
                    }))
                  }}
                  options={roleSelectOptions}
                  filterOption={(input, option) => {
                    const v = String(option?.value ?? '').toLowerCase()
                    const hay = `${v} ${roleById.get(v)?.name ?? ''}`.toLowerCase()
                    return hay.includes(input.toLowerCase())
                  }}
                  disabled={Array.isArray(roleTypes) && roleTypes.length === 0}
                />
                {Array.isArray(roleTypes) && roleTypes.length === 0 ? (
                  <p className="text-[10px] text-on-surface-variant mt-1">Chưa tải danh sách vai trò.</p>
                ) : null}
              </div>
              <div className="block space-y-1.5 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">
                  Tộc / hệ (meta)
                </span>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Chọn từ danh sách meta traits…"
                  className="w-full min-h-[42px]"
                  value={draft.traits}
                  onChange={(names: string[]) => setField('traits', names)}
                  options={traitSelectOptions}
                  optionFilterProp="label"
                  disabled={!traitDefs?.length}
                />
                {!traitDefs?.length ? (
                  <p className="text-[10px] text-on-surface-variant mt-1">Chưa tải danh sách tộc/hệ.</p>
                ) : null}
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">
                  Ảnh tướng
                </span>
                <ImageUrlUpload value={draft.imageUrl} onChange={(url) => setField('imageUrl', url)} />
              </div>
            </div>
                  ),
                },
                {
                  key: 'skill',
                  label: (
                    <AdminFormCollapseLabel
                      title="Kỹ năng (skill)"
                      filled={skillBlockStats.filled}
                      total={skillBlockStats.total}
                    />
                  ),
                  children: (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant shrink-0">
                  Kỹ năng:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {draft.skills.map((s, idx) => {
                    const active = idx === activeSkillIndex
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveSkillIndex(idx)
                          bumpSkillEditor()
                        }}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold border transition-colors ${
                          active
                            ? 'bg-[#C8AA6E] text-[#1a1d24] border-[#C8AA6E]'
                            : 'bg-surface-container-lowest text-on-surface border-outline-variant/35 hover:border-outline-variant/60'
                        }`}
                      >
                        {s.tabLabel?.trim() || `Kỹ năng ${idx + 1}`}
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={addChampionSkill}
                  className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline ml-1"
                >
                  + Thêm kỹ năng
                </button>
                {draft.skills.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeChampionSkill(activeSkillIndex)}
                    className="text-[10px] font-bold uppercase tracking-widest text-error hover:underline"
                  >
                    Xóa tab này
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div className="grid grid-cols-1 gap-3 min-w-0">
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Nhãn tab
                    </span>
                    <input
                      value={draft.skills[activeSkillIndex]?.tabLabel ?? ''}
                      onChange={(e) => patchActiveSkill({ tabLabel: e.target.value })}
                      placeholder="vd. Mặc định, Anh Hùng"
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm"
                    />
                  </label>
                  <input
                    value={draft.skills[activeSkillIndex]?.name ?? ''}
                    onChange={(e) => patchActiveSkill({ name: e.target.value })}
                    placeholder="Tên kỹ năng (skill_name)"
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm"
                  />
                  <SkillDescriptionEditor
                    key={`${skillEditorNonce}-${activeSkillIndex}`}
                    value={draft.skills[activeSkillIndex]?.descriptionTemplate ?? ''}
                    onChange={(html) => patchActiveSkill({ descriptionTemplate: html })}
                  />
                </div>
                <SkillDescriptionPanel
                  key={`${draft.id || '__new__'}-${activeSkillIndex}`}
                  skill={previewSkill}
                  starStats={draft.starStats}
                  imageUrl={draft.imageUrl}
                  className="min-w-0"
                  scalesWithIconById={scalesWithIconById}
                  scalesWithTextColorById={scalesWithTextColorById}
                  scalesWithValueFormatById={scalesWithValueFormatById}
                />
              </div>
            </div>
                  ),
                },
              ]}
            />

            <Collapse
              bordered={false}
              className={ADMIN_FORM_COLLAPSE_CLASS}
              defaultActiveKey={['params']}
              items={[
                {
                  key: 'params',
                  label: (
                    <AdminFormCollapseLabel
                      title="Tham số kỹ năng (skillParams)"
                      filled={skillParamStats.filled}
                      total={skillParamStats.total}
                    />
                  ),
                  children: (
                    <div className="space-y-4 pt-1">
                      <p className="text-[11px] text-on-surface-variant">
                        Đang sửa tham số cho tab:{' '}
                        <span className="font-semibold text-on-surface">
                          {draft.skills[activeSkillIndex]?.tabLabel?.trim() ||
                            `Kỹ năng ${activeSkillIndex + 1}`}
                        </span>
                      </p>
                      {(draft.skills[activeSkillIndex]?.params ?? []).map((row, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end border-b border-outline-variant/10 pb-4 last:border-0"
                        >
                          <label className="sm:col-span-3 space-y-1">
                            <span className="text-[10px] text-on-surface-variant">paramKey</span>
                            <input
                              value={row.paramKey}
                              onChange={(e) => setSkillParamField(i, { paramKey: e.target.value })}
                              className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest px-2 py-2 text-xs"
                            />
                          </label>
                          <label className="sm:col-span-3 space-y-1">
                            <span className="text-[10px] text-on-surface-variant">displayLabel</span>
                            <input
                              value={row.displayLabel}
                              onChange={(e) => setSkillParamField(i, { displayLabel: e.target.value })}
                              className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest px-2 py-2 text-xs"
                            />
                          </label>
                          <label className="sm:col-span-4 space-y-1">
                            <span className="text-[10px] text-on-surface-variant">
                              starValues (1–4 số, phẩy)
                            </span>
                            <input
                              value={
                                skillParamStarInputs[activeSkillIndex]?.[i] ?? row.starValues.join(', ')
                              }
                              onChange={(e) => {
                                const v = e.target.value
                                const si = activeSkillIndex
                                setSkillParamStarInputs((prev) => {
                                  const copy = prev.map((r) => [...r])
                                  while (copy.length <= si) copy.push([])
                                  const rowIn = [...(copy[si] ?? [])]
                                  while (rowIn.length <= i) rowIn.push('')
                                  rowIn[i] = v
                                  copy[si] = rowIn
                                  return copy
                                })
                                setSkillParamField(i, { starValues: parseStarValuesCsv(v) })
                              }}
                              placeholder="180, 270, 1200"
                              className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest px-2 py-2 text-xs font-mono"
                            />
                          </label>
                          <label className="sm:col-span-2 space-y-1">
                            <span className="text-[10px] text-on-surface-variant">scalesWith</span>
                            <Select
                              showSearch
                              allowClear
                              placeholder="Chọn loại chỉ số"
                              className="w-full"
                              optionFilterProp="label"
                              value={row.scalesWith ?? undefined}
                              onChange={(v) =>
                                setSkillParamField(i, {
                                  scalesWith: typeof v === 'string' && v.trim() ? v.trim() : undefined,
                                })
                              }
                              options={scalesWithSelectOptions}
                              notFoundContent={scalesWithOpts == null ? 'Đang tải…' : 'Không có mục phù hợp.'}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeSkillParamRow(i)}
                            className="sm:col-span-12 text-[10px] font-bold uppercase text-error hover:underline text-left"
                          >
                            Xóa dòng
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addSkillParamRow}
                        className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                      >
                        + Thêm tham số
                      </button>
                    </div>
                  ),
                },
                {
                  key: 'stars',
                  label: (
                    <AdminFormCollapseLabel
                      title="Chỉ số theo sao (starStats)"
                      detail={`${draft.starStats.length} mức · 11 chỉ số/mức`}
                    />
                  ),
                  children: (
                    <div className="space-y-6 pt-1 overflow-x-auto">
                      {draft.starStats.map((row, i) => (
                        <div key={i} className="border border-outline-variant/15 rounded-lg p-3 space-y-2">
                          <div className="flex flex-wrap items-center gap-2 justify-between">
                            <span className="text-xs font-bold text-on-surface">Mức sao</span>
                            <div className="flex gap-2">
                              <select
                                value={row.stars}
                                onChange={(e) =>
                                  setStarRow(i, {
                                    stars: Number(e.target.value) as ChampionStarStatRow['stars'],
                                  })
                                }
                                className="rounded border border-outline-variant/30 bg-surface-container-lowest px-2 py-1 text-xs"
                              >
                                {([1, 2, 3, 4] as const).map((s) => (
                                  <option key={s} value={s}>
                                    {s} sao
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => removeStarRow(i)}
                                className="text-[10px] uppercase text-error font-bold"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[10px]">
                            {(
                              [
                                ['hp', 'HP'],
                                ['manaInitial', 'Mana đầu'],
                                ['manaMax', 'Mana max'],
                                ['attackDamage', 'AD'],
                                ['abilityPower', 'AP'],
                                ['armor', 'Giáp'],
                                ['magicResist', 'Kháng phép'],
                                ['attackSpeed', 'Tốc đánh'],
                                ['critChance', 'Tỷ lệ CM'],
                                ['critDamage', 'Crit DMG'],
                                ['attackRange', 'Tầm'],
                              ] as const
                            ).map(([key, label]) => {
                              const pctCrit = key === 'critChance' || key === 'critDamage'
                              const step =
                                key === 'attackSpeed'
                                  ? '0.01'
                                  : pctCrit
                                    ? '0.1'
                                    : '1'
                              const raw = row[key]
                              /** Tránh nhiễu float (1.4 → 140, 0.25 → 25). */
                              const displayVal = pctCrit
                                ? Number.isFinite(raw)
                                  ? Math.round(raw * 10000) / 100
                                  : ''
                                : raw
                              return (
                                <label key={key} className="space-y-0.5">
                                  <span className="text-on-surface-variant block truncate" title={pctCrit ? 'Nhập số %: 25 = 25%' : undefined}>
                                    {label}
                                    {pctCrit ? (
                                      <span className="text-on-surface-variant/60 font-normal"> (%)</span>
                                    ) : null}
                                  </span>
                                  <input
                                    type="number"
                                    step={step}
                                    value={displayVal}
                                    placeholder={key === 'critChance' ? '25' : key === 'critDamage' ? '140' : undefined}
                                    onChange={(e) => {
                                      const v = e.target.value
                                      const n = v === '' ? 0 : Number(v)
                                      if (pctCrit) {
                                        setStarRow(i, { [key]: n / 100 } as Partial<ChampionStarStatRow>)
                                      } else {
                                        setStarRow(i, { [key]: n } as Partial<ChampionStarStatRow>)
                                      }
                                    }}
                                    className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest px-1.5 py-1 text-xs"
                                  />
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addStarRow}
                        className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                      >
                        + Thêm mức sao
                      </button>
                    </div>
                  ),
                },
              ]}
            />

            {saveMessage && (
              <p
                className={`text-sm ${saveMessage.type === 'ok' ? 'text-tertiary' : 'text-error'}`}
                role="status"
              >
                {saveMessage.text}
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
              >
                <Icon name="save" className="text-base" />
                {saving ? 'Đang lưu…' : isNew ? 'Tạo tướng' : 'Cập nhật'}
              </button>
              {!isNew && (
                <button
                  type="button"
                  onClick={startNew}
                  className="rounded-lg border border-outline-variant/40 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  Bỏ chọn — tạo mới
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

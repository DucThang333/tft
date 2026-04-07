import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Collapse, Select } from 'antd'
import { Icon } from '../../../components/ui/Icon'
import { ImageUrlUpload } from '../../../components/forms/ImageUrlUpload'
import { tftApi } from '../../../api/tftApi'
import { usePromiseData } from '../../../hooks/usePromiseData'
import type { Champion, ChampionSkillParamRow, ChampionStarStatRow } from '../../../types'

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

function emptyForm(): Champion {
  return {
    id: '',
    name: '',
    cost: 1,
    roleType: '',
    contentVersion: 1,
    traits: [],
    imageUrl: '',
    skill: { name: '', descriptionTemplate: '', params: [] },
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

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<Champion>(emptyForm)
  const [skillParamStarInputs, setSkillParamStarInputs] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

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

  const filtered = useMemo(() => {
    const list = champions ?? []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.roleType.toLowerCase().includes(q) ||
        c.traits.some((t) => t.toLowerCase().includes(q)),
    )
  }, [champions, query])

  const refreshList = useCallback(() => setListTick((t) => t + 1), [])

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyForm())
    setSkillParamStarInputs([])
    setSaveMessage(null)
  }, [])

  const selectChampion = useCallback((c: Champion) => {
    setIsNew(false)
    setDraft({ ...c, skill: { ...c.skill, params: c.skill.params.map((p) => ({ ...p })) } })
    setSkillParamStarInputs(c.skill.params.map((p) => p.starValues.join(', ')))
    setSaveMessage(null)
  }, [])

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
      return { ...d, starStats: [...d.starStats, defaultStarRow(next)] }
    })
  }, [])

  const removeStarRow = useCallback((index: number) => {
    setDraft((d) => {
      if (d.starStats.length <= 1) return d
      return { ...d, starStats: d.starStats.filter((_, i) => i !== index) }
    })
  }, [])

  const addSkillParamRow = useCallback(() => {
    setDraft((d) => ({
      ...d,
      skill: {
        ...d.skill,
        params: [
          ...d.skill.params,
          { paramKey: '', displayLabel: '', starValues: [], sortOrder: d.skill.params.length },
        ],
      },
    }))
    setSkillParamStarInputs((prev) => [...prev, ''])
  }, [])

  const removeSkillParamRow = useCallback((index: number) => {
    setDraft((d) => ({
      ...d,
      skill: { ...d.skill, params: d.skill.params.filter((_, i) => i !== index) },
    }))
    setSkillParamStarInputs((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const setSkillParamField = useCallback(
    (index: number, patch: Partial<ChampionSkillParamRow>) => {
      setDraft((d) => ({
        ...d,
        skill: {
          ...d.skill,
          params: d.skill.params.map((p, i) => (i === index ? { ...p, ...patch } : p)),
        },
      }))
    },
    [],
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaveMessage(null)

    const mergedParams: ChampionSkillParamRow[] = draft.skill.params.map((p, i) => {
      const fromInput = parseStarValuesCsv(skillParamStarInputs[i] ?? '')
      const vals = fromInput.length >= 3 ? fromInput : p.starValues
      return {
        ...p,
        paramKey: p.paramKey.trim(),
        displayLabel: p.displayLabel.trim(),
        starValues: vals,
      }
    })

    const nonEmptySkillParams = mergedParams.filter(
      (r) =>
        r.paramKey !== '' ||
        r.displayLabel !== '' ||
        (Array.isArray(r.starValues) && r.starValues.length > 0) ||
        (r.scalesWith != null && String(r.scalesWith).trim() !== ''),
    )

    const champion: Champion = {
      ...draft,
      cost: Number(draft.cost) as Champion['cost'],
      skill: {
        ...draft.skill,
        params: nonEmptySkillParams,
      },
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
      setSaveMessage({ type: 'err', text: 'Vai trò (roleType) là bắt buộc khi tạo / cập nhật đầy đủ.' })
      return
    }
    if (!champion.skill.name.trim() || !champion.skill.descriptionTemplate.trim()) {
      setSaveMessage({ type: 'err', text: 'Tên kỹ năng và mô tả (template) là bắt buộc.' })
      return
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

    for (let pi = 0; pi < nonEmptySkillParams.length; pi++) {
      const p = nonEmptySkillParams[pi]
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
          text: `Tham số dòng ${pi + 1}: cần nhập đủ paramKey và displayLabel.`,
        })
        return
      }
      if (vals.length < 3 || vals.length > 4) {
        setSaveMessage({
          type: 'err',
          text: `Tham số "${p.paramKey || p.displayLabel || '…'}": starValues cần 3 hoặc 4 số (phân tách bằng dấu phẩy).`,
        })
        return
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
        setSkillParamStarInputs(updated.skill.params.map((p) => p.starValues.join(', ')))
      }
      refreshList()
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err)
      setSaveMessage({
        type: 'err',
        text:
          text ||
          'Lưu thất bại. Kiểm tra API có route POST/PUT /api/v1/admin/champions hay chưa.',
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
        <p className="text-on-surface-variant max-w-2xl text-sm leading-relaxed">
          Form khớp model backend: vai trò, kỹ năng + template, chỉ số theo sao, tộc/hệ từ meta. Ảnh dùng tải file
          (data URL). Tạo tướng cần ít nhất một dòng starStats và một tộc/hệ.
        </p>
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
                        <img
                          src={c.imageUrl}
                          alt=""
                          className="w-11 h-11 rounded-md object-cover border border-outline-variant/20 shrink-0"
                        />
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
              <span className="text-[10px] font-label uppercase tracking-widest text-tertiary">
                {isNew ? 'Chế độ tạo' : 'Chế độ cập nhật'}
              </span>
            </div>

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
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Vai trò (roleType)
                </span>
                <input
                  value={draft.roleType}
                  onChange={(e) => setField('roleType', e.target.value)}
                  placeholder="vd. Đấu Sĩ Vật Lý"
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm"
                />
              </label>
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
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Chưa tải được meta traits — kiểm tra GET /api/v1/meta/traits.
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">
                  Ảnh tướng
                </span>
                <ImageUrlUpload value={draft.imageUrl} onChange={(url) => setField('imageUrl', url)} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">
                Kỹ năng (skill)
              </span>
              <div className="grid grid-cols-1 gap-3">
                <input
                  value={draft.skill.name}
                  onChange={(e) =>
                    setField('skill', { ...draft.skill, name: e.target.value })
                  }
                  placeholder="Tên kỹ năng (skill_name)"
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm"
                />
                <textarea
                  rows={3}
                  value={draft.skill.descriptionTemplate}
                  onChange={(e) =>
                    setField('skill', { ...draft.skill, descriptionTemplate: e.target.value })
                  }
                  placeholder="Mô tả template — dùng {{param_key}} khớp tham số bên dưới"
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm resize-y min-h-[80px]"
                />
              </div>
            </div>

            <Collapse
              bordered={false}
              className="bg-surface-container-low/40 rounded-lg"
              items={[
                {
                  key: 'params',
                  label: (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Tham số kỹ năng (skillParams, tuỳ chọn)
                    </span>
                  ),
                  children: (
                    <div className="space-y-4 pt-1">
                      {draft.skill.params.map((row, i) => (
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
                              starValues (3–4 số, phẩy)
                            </span>
                            <input
                              value={skillParamStarInputs[i] ?? row.starValues.join(', ')}
                              onChange={(e) => {
                                const v = e.target.value
                                setSkillParamStarInputs((prev) => {
                                  const next = [...prev]
                                  next[i] = v
                                  return next
                                })
                                setSkillParamField(i, { starValues: parseStarValuesCsv(v) })
                              }}
                              placeholder="180, 270, 1200"
                              className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest px-2 py-2 text-xs font-mono"
                            />
                          </label>
                          <label className="sm:col-span-2 space-y-1">
                            <span className="text-[10px] text-on-surface-variant">scalesWith</span>
                            <input
                              value={row.scalesWith ?? ''}
                              onChange={(e) =>
                                setSkillParamField(i, {
                                  scalesWith: e.target.value.trim() || undefined,
                                })
                              }
                              placeholder="ability_power"
                              className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest px-2 py-2 text-xs"
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
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Chỉ số theo sao (starStats)
                    </span>
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
                                ['critChance', 'Crit %'],
                                ['critDamage', 'Crit DMG'],
                                ['attackRange', 'Tầm'],
                              ] as const
                            ).map(([key, label]) => (
                              <label key={key} className="space-y-0.5">
                                <span className="text-on-surface-variant block truncate">{label}</span>
                                <input
                                  type="number"
                                  step={key === 'attackSpeed' || key === 'critChance' || key === 'critDamage' ? '0.01' : '1'}
                                  value={row[key]}
                                  onChange={(e) =>
                                    setStarRow(i, { [key]: Number(e.target.value) } as Partial<ChampionStarStatRow>)
                                  }
                                  className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest px-1.5 py-1 text-xs"
                                />
                              </label>
                            ))}
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

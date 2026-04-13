import { useCallback, useMemo, useState } from 'react'
import { App, Button, Card, Col, Collapse, Input, List, Row, Space, Typography } from 'antd'
import { ImageUrlUpload } from '../../../../components/forms/ImageUrlUpload'
import { tftApi } from '../../../../api/tftApi'
import { AdminMetaDescriptionParamsEditor } from '../../components/AdminMetaDescriptionParamsEditor'
import {
  AdminFormCardProgress,
  AdminFormCollapseLabel,
  ADMIN_FORM_COLLAPSE_CLASS,
} from '../../components/AdminFormCollapseLabel'
import { AdminRichDescriptionSection } from '../../components/AdminRichDescriptionSection'
import { fieldFilled, mergeStats } from '../../components/adminFormFieldStats'
import { buildScalesWithVisualMaps } from '../../utils/scalesWithVisualMaps'
import { usePromiseData } from '../../../../hooks/usePromiseData'
import type { CombinedItem } from '../../../../types'

function emptyItem(): CombinedItem {
  return {
    id: '',
    name: '',
    description: '',
    components: ['', ''],
    componentNames: '',
    tags: [],
    imageUrl: '',
    stats: [],
    descriptionParams: [],
  }
}

function tagsToInput(tags: string[]): string {
  return tags.join(', ')
}

function inputToTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function statsToText(stats: { label: string; value: string }[]): string {
  return stats.map((s) => `${s.label}: ${s.value}`).join('\n')
}

function textToStats(raw: string): { label: string; value: string }[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':')
      if (idx === -1) return { label: line, value: '' }
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() }
    })
}

export function CombinedItemTabPanel() {
  const { message } = App.useApp()
  const [tick, setTick] = useState(0)
  const { data, loading, error } = usePromiseData(() => tftApi.combinedItems(), [tick])
  const { data: scalesWithOpts } = usePromiseData(() => tftApi.scalesWithOptions(), [tick])
  const list = data ?? []

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<CombinedItem>(emptyItem)
  const [tagsInput, setTagsInput] = useState('')
  const [statsInput, setStatsInput] = useState('')
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)
  const [descKey, setDescKey] = useState(0)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter(
      (it) =>
        it.name.toLowerCase().includes(s) ||
        it.id.toLowerCase().includes(s) ||
        it.description.toLowerCase().includes(s) ||
        it.tags.some((t) => t.toLowerCase().includes(s)),
    )
  }, [list, q])

  const refresh = useCallback(() => setTick((x) => x + 1), [])

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
    for (const row of draft.descriptionParams ?? []) {
      const sw = row.scalesWith?.trim()
      if (sw && !ids.has(sw)) {
        orphan.push({ value: sw, label: `${sw} (không có trong meta)` })
        ids.add(sw)
      }
    }
    return [...orphan, ...fromApi].sort((a, b) => a.value.localeCompare(b.value))
  }, [scalesWithOpts, draft.descriptionParams])

  const basicStats = useMemo(() => {
    const filled = [draft.id, draft.name, draft.tier ?? ''].filter((x) => fieldFilled(x)).length
    return { filled, total: 3 }
  }, [draft.id, draft.name, draft.tier])

  const descStats = useMemo(
    () => ({ filled: fieldFilled(draft.description) ? 1 : 0, total: 1 }),
    [draft.description],
  )

  const descParamsStats = useMemo(() => {
    const rows = draft.descriptionParams ?? []
    if (rows.length === 0) return { filled: 0, total: 1 }
    const filled = rows.filter((r) =>
      fieldFilled(r.paramKey) ||
      fieldFilled(r.displayLabel) ||
      fieldFilled(r.sampleValue) ||
      fieldFilled(r.scalesWith),
    ).length
    return { filled, total: rows.length }
  }, [draft.descriptionParams])

  const componentStats = useMemo(() => {
    const c0 = draft.components[0]?.trim() ?? ''
    const c1 = draft.components[1]?.trim() ?? ''
    const hasTags = inputToTags(tagsInput).length > 0
    const filled =
      (c0 ? 1 : 0) + (c1 ? 1 : 0) + (fieldFilled(draft.componentNames) ? 1 : 0) + (hasTags ? 1 : 0)
    return { filled, total: 4 }
  }, [draft.components, draft.componentNames, tagsInput])

  const mediaStats = useMemo(() => {
    const hasStats = textToStats(statsInput).some((s) => fieldFilled(s.label) || fieldFilled(s.value))
    const filled = (fieldFilled(draft.imageUrl) ? 1 : 0) + (hasStats ? 1 : 0)
    return { filled, total: 2 }
  }, [draft.imageUrl, statsInput])

  const formProgress = useMemo(
    () => mergeStats(basicStats, descStats, descParamsStats, componentStats, mediaStats),
    [basicStats, descStats, descParamsStats, componentStats, mediaStats],
  )

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyItem())
    setTagsInput('')
    setStatsInput('')
    setDescKey((k) => k + 1)
  }, [])

  const select = useCallback((it: CombinedItem) => {
    setIsNew(false)
    setDraft({
      ...it,
      components: [...it.components] as [string, string],
      descriptionParams: it.descriptionParams ?? [],
    })
    setTagsInput(tagsToInput(it.tags))
    setStatsInput(statsToText(it.stats))
    setDescKey((k) => k + 1)
  }, [])

  const save = async () => {
    if (!draft.id.trim()) {
      message.error('Mã (id) là bắt buộc.')
      return
    }
    if (!draft.name.trim()) {
      message.error('Tên là bắt buộc.')
      return
    }
    const c0 = draft.components[0]?.trim() ?? ''
    const c1 = draft.components[1]?.trim() ?? ''
    if (!c0 || !c1) {
      message.error('Cần đủ 2 mã trang bị cơ bản (thành phần ghép).')
      return
    }

    const item: CombinedItem = {
      ...draft,
      components: [c0, c1] as [string, string],
      tags: inputToTags(tagsInput),
      stats: textToStats(statsInput),
      tier: draft.tier?.trim() || undefined,
    }

    setSaving(true)
    try {
      if (isNew) {
        await tftApi.createCombinedItemAdmin(item)
        message.success('Đã tạo trang bị ghép.')
        startNew()
      } else {
        const u = await tftApi.updateCombinedItemAdmin(item)
        setDraft({ ...u, components: [...u.components] as [string, string] })
        setTagsInput(tagsToInput(u.tags))
        setStatsInput(statsToText(u.stats))
        message.success('Đã cập nhật.')
      }
      refresh()
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Lưu thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={9}>
        <Space direction="vertical" size="middle" className="w-full">
          <Space wrap>
            <Button type="primary" onClick={startNew}>
              Tạo mới
            </Button>
            <Input.Search allowClear placeholder="Tìm trang bị…" onChange={(e) => setQ(e.target.value)} />
          </Space>
          {error ? (
            <Typography.Text type="danger">{error.message}</Typography.Text>
          ) : null}
          <List
            size="small"
            bordered
            loading={loading}
            className="max-h-[min(60vh,520px)] overflow-y-auto custom-scrollbar bg-surface-container-low/30"
            dataSource={filtered}
            locale={{ emptyText: loading ? '…' : 'Không có trang bị ghép.' }}
            renderItem={(item) => (
              <List.Item
                className="cursor-pointer"
                style={{
                  background:
                    !isNew && draft.id === item.id ? 'rgba(118, 0, 195, 0.12)' : undefined,
                }}
                onClick={() => select(item)}
              >
                <List.Item.Meta
                  avatar={
                    item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : undefined
                  }
                  title={item.name}
                  description={
                    <span className="text-on-surface-variant">
                      {item.id}
                      {item.tier ? ` · ${item.tier}` : ''}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </Space>
      </Col>
      <Col xs={24} lg={15}>
        <Card
          size="small"
          title={isNew ? 'Thêm trang bị ghép' : 'Cập nhật trang bị ghép'}
          extra={<AdminFormCardProgress filled={formProgress.filled} total={formProgress.total} />}
        >
          <Space direction="vertical" size="middle" className="w-full">
            <Collapse
              bordered={false}
              className={ADMIN_FORM_COLLAPSE_CLASS}
              defaultActiveKey={['basic', 'rich-desc']}
              items={[
                {
                  key: 'basic',
                  label: (
                    <AdminFormCollapseLabel
                      title="Thông tin cơ bản"
                      filled={basicStats.filled}
                      total={basicStats.total}
                    />
                  ),
                  children: (
                    <Space wrap className="w-full">
                      <div className="min-w-[200px] flex-1">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Id
                        </Typography.Text>
                        <Input
                          disabled={!isNew}
                          value={draft.id}
                          onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
                        />
                      </div>
                      <div className="min-w-[200px] flex-[2]">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Tên
                        </Typography.Text>
                        <Input
                          value={draft.name}
                          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        />
                      </div>
                      <div className="min-w-[120px]">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Bậc (tuỳ chọn)
                        </Typography.Text>
                        <Input
                          value={draft.tier ?? ''}
                          onChange={(e) => setDraft((d) => ({ ...d, tier: e.target.value || undefined }))}
                          placeholder="S / A / …"
                        />
                      </div>
                    </Space>
                  ),
                },
                {
                  key: 'rich-desc',
                  label: (
                    <AdminFormCollapseLabel title="Mô tả (rich text)" filled={descStats.filled} total={descStats.total} />
                  ),
                  children: (
                    <AdminRichDescriptionSection
                      editorKey={descKey}
                      value={draft.description}
                      onChange={(description) => setDraft((d) => ({ ...d, description }))}
                      previewTitle={draft.name}
                      previewSubtitle={
                        [draft.id, draft.tier, draft.componentNames].filter(Boolean).join(' · ') || undefined
                      }
                      previewImageUrl={draft.imageUrl}
                      structuredDescriptionParams={draft.descriptionParams}
                      scalesWithIconById={scalesWithIconById}
                      scalesWithTextColorById={scalesWithTextColorById}
                      scalesWithValueFormatById={scalesWithValueFormatById}
                    />
                  ),
                },
                {
                  key: 'desc-params',
                  label: (
                    <AdminFormCollapseLabel
                      title="Tham số mô tả (descriptionParams)"
                      filled={descParamsStats.filled}
                      total={descParamsStats.total}
                    />
                  ),
                  children: (
                    <AdminMetaDescriptionParamsEditor
                      rows={draft.descriptionParams}
                      onChange={(descriptionParams) => setDraft((d) => ({ ...d, descriptionParams }))}
                      scalesWithSelectOptions={scalesWithSelectOptions}
                      scalesWithLoading={scalesWithOpts == null}
                    />
                  ),
                },
                {
                  key: 'components',
                  label: (
                    <AdminFormCollapseLabel
                      title="Thành phần ghép & tag"
                      filled={componentStats.filled}
                      total={componentStats.total}
                    />
                  ),
                  children: (
                    <Space direction="vertical" size="middle" className="w-full">
                      <Space wrap className="w-full">
                        <div className="min-w-[140px] flex-1">
                          <Typography.Text type="secondary" className="text-xs block mb-1">
                            Id thành phần 1
                          </Typography.Text>
                          <Input
                            value={draft.components[0] ?? ''}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                components: [e.target.value, d.components[1] ?? ''] as [string, string],
                              }))
                            }
                          />
                        </div>
                        <div className="min-w-[140px] flex-1">
                          <Typography.Text type="secondary" className="text-xs block mb-1">
                            Id thành phần 2
                          </Typography.Text>
                          <Input
                            value={draft.components[1] ?? ''}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                components: [d.components[0] ?? '', e.target.value] as [string, string],
                              }))
                            }
                          />
                        </div>
                        <div className="min-w-[200px] flex-[2]">
                          <Typography.Text type="secondary" className="text-xs block mb-1">
                            Tên hiển thị cặp thành phần
                          </Typography.Text>
                          <Input
                            value={draft.componentNames}
                            onChange={(e) => setDraft((d) => ({ ...d, componentNames: e.target.value }))}
                            placeholder="Găng + Kiếm"
                          />
                        </div>
                      </Space>
                      <div>
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Tag (phân tách bằng dấu phẩy)
                        </Typography.Text>
                        <Input
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          placeholder="AD, Tank, …"
                        />
                      </div>
                    </Space>
                  ),
                },
                {
                  key: 'media',
                  label: (
                    <AdminFormCollapseLabel title="Ảnh & chỉ số" filled={mediaStats.filled} total={mediaStats.total} />
                  ),
                  children: (
                    <Space direction="vertical" size="middle" className="w-full">
                      <div className="w-full">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Ảnh (tải từ máy)
                        </Typography.Text>
                        <ImageUrlUpload
                          value={draft.imageUrl}
                          onChange={(url) => setDraft((d) => ({ ...d, imageUrl: url }))}
                        />
                      </div>
                      <div>
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Chỉ số (mỗi dòng: <Typography.Text code>Nhãn: Giá trị</Typography.Text>)
                        </Typography.Text>
                        <Input.TextArea
                          rows={4}
                          value={statsInput}
                          onChange={(e) => setStatsInput(e.target.value)}
                          placeholder={'Sát thương: +20%\nTốc đánh: +15%'}
                        />
                      </div>
                    </Space>
                  ),
                },
              ]}
            />
            <Space>
              <Button type="primary" loading={saving} onClick={save}>
                {isNew ? 'Tạo' : 'Cập nhật'}
              </Button>
              {!isNew ? <Button onClick={startNew}>Tạo mới khác</Button> : null}
            </Space>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}

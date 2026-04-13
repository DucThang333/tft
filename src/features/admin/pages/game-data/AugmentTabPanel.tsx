import { useCallback, useMemo, useState } from 'react'
import { App, Button, Card, Col, Collapse, Input, List, Row, Select, Space, Typography } from 'antd'
import { tftApi } from '../../../../api/tftApi'
import { usePromiseData } from '../../../../hooks/usePromiseData'
import { AdminMetaDescriptionParamsEditor } from '../../components/AdminMetaDescriptionParamsEditor'
import {
  AdminFormCardProgress,
  AdminFormCollapseLabel,
  ADMIN_FORM_COLLAPSE_CLASS,
} from '../../components/AdminFormCollapseLabel'
import { AdminRichDescriptionSection } from '../../components/AdminRichDescriptionSection'
import { fieldFilled, mergeStats } from '../../components/adminFormFieldStats'
import { buildScalesWithVisualMaps } from '../../utils/scalesWithVisualMaps'
import type { GameAugment } from '../../../../types'

function emptyAugment(): GameAugment {
  return {
    id: '',
    name: '',
    tier: 'silver',
    description: '',
    imageUrl: '',
    descriptionParams: [],
  }
}

const tierOptions: { value: GameAugment['tier']; label: string }[] = [
  { value: 'silver', label: 'Bạc (Silver)' },
  { value: 'gold', label: 'Vàng (Gold)' },
  { value: 'prismatic', label: 'Cầu vồng (Prismatic)' },
]

export function AugmentTabPanel() {
  const { message } = App.useApp()
  const [tick, setTick] = useState(0)
  const { data, loading, error } = usePromiseData(() => tftApi.gameAugments(), [tick])
  const { data: scalesWithOpts } = usePromiseData(() => tftApi.scalesWithOptions(), [tick])
  const list = data ?? []

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<GameAugment>(emptyAugment)
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)
  const [descKey, setDescKey] = useState(0)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(s) ||
        a.id.toLowerCase().includes(s) ||
        a.description.toLowerCase().includes(s),
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
    const filled =
      (fieldFilled(draft.id) ? 1 : 0) +
      (fieldFilled(draft.name) ? 1 : 0) +
      (draft.tier ? 1 : 0)
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

  const imageStats = useMemo(
    () => ({ filled: fieldFilled(draft.imageUrl) ? 1 : 0, total: 1 }),
    [draft.imageUrl],
  )

  const formProgress = useMemo(
    () => mergeStats(basicStats, descStats, descParamsStats, imageStats),
    [basicStats, descStats, descParamsStats, imageStats],
  )

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyAugment())
    setDescKey((k) => k + 1)
  }, [])

  const select = useCallback((a: GameAugment) => {
    setIsNew(false)
    setDraft({ ...a, descriptionParams: a.descriptionParams ?? [] })
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
    setSaving(true)
    try {
      if (isNew) {
        await tftApi.createGameAugment(draft)
        message.success('Đã tạo lõi nâng cấp.')
        startNew()
      } else {
        const u = await tftApi.updateGameAugment(draft)
        setDraft(u)
        message.success('Đã cập nhật.')
      }
      refresh()
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Lưu thất bại.')
    } finally {
      setSaving(false)
    }
  }

  const tierLabel = (t: GameAugment['tier']) => tierOptions.find((o) => o.value === t)?.label ?? t

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={9}>
        <Space direction="vertical" size="middle" className="w-full">
          <Space wrap>
            <Button type="primary" onClick={startNew}>
              Tạo mới
            </Button>
            <Input.Search allowClear placeholder="Tìm augment…" onChange={(e) => setQ(e.target.value)} />
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
            locale={{
              emptyText: loading ? '…' : 'Chưa có dữ liệu.',
            }}
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
                      {item.id} · {tierLabel(item.tier)}
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
          title={isNew ? 'Thêm lõi nâng cấp' : 'Cập nhật lõi nâng cấp'}
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
                      <div className="min-w-[200px] flex-1">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Tên
                        </Typography.Text>
                        <Input
                          value={draft.name}
                          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        />
                      </div>
                      <div className="min-w-[180px]">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Bậc
                        </Typography.Text>
                        <Select
                          className="w-full"
                          value={draft.tier}
                          onChange={(tier) => setDraft((d) => ({ ...d, tier }))}
                          options={tierOptions}
                        />
                      </div>
                    </Space>
                  ),
                },
                {
                  key: 'rich-desc',
                  label: (
                    <AdminFormCollapseLabel title="Mô tả hiệu ứng" filled={descStats.filled} total={descStats.total} />
                  ),
                  children: (
                    <AdminRichDescriptionSection
                      sectionTitle="Mô tả hiệu ứng"
                      editorKey={descKey}
                      value={draft.description}
                      onChange={(description) => setDraft((d) => ({ ...d, description }))}
                      previewTitle={draft.name}
                      previewSubtitle={draft.id}
                      previewImageUrl={draft.imageUrl}
                      previewRightSlot={
                        <span className="text-[11px] font-semibold text-[#C8AA6E] whitespace-nowrap">
                          {tierLabel(draft.tier)}
                        </span>
                      }
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
                  key: 'image',
                  label: (
                    <AdminFormCollapseLabel title="Ảnh (URL)" filled={imageStats.filled} total={imageStats.total} />
                  ),
                  children: (
                    <Space direction="vertical" size="small" className="w-full">
                      <div className="w-full">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          URL ảnh
                        </Typography.Text>
                        <Input
                          value={draft.imageUrl}
                          onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                        />
                      </div>
                      {draft.imageUrl ? (
                        <img
                          src={draft.imageUrl}
                          alt=""
                          className="h-16 w-16 rounded border border-outline-variant/20 object-cover"
                        />
                      ) : null}
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

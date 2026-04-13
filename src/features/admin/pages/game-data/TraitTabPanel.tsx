import { useCallback, useMemo, useState } from 'react'
import { App, Button, Card, Col, Collapse, Input, List, Row, Select, Space, Typography } from 'antd'
import { tftApi } from '../../../../api/tftApi'
import { ImageUrlUpload } from '../../../../components/forms/ImageUrlUpload'
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
import type { GameTraitDef } from '../../../../types'

function emptyTrait(): GameTraitDef {
  return {
    id: '',
    name: '',
    kind: 'origin',
    description: '',
    iconUrl: '',
    descriptionParams: [],
  }
}

export function TraitTabPanel() {
  const { message } = App.useApp()
  const [tick, setTick] = useState(0)
  const { data, loading, error } = usePromiseData(() => tftApi.gameTraitDefs(), [tick])
  const { data: scalesWithOpts } = usePromiseData(() => tftApi.scalesWithOptions(), [tick])
  const list = data ?? []

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<GameTraitDef>(emptyTrait)
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)
  const [descKey, setDescKey] = useState(0)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        t.id.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s),
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
      (fieldFilled(draft.id) ? 1 : 0) + (fieldFilled(draft.name) ? 1 : 0) + (draft.kind ? 1 : 0)
    return { filled, total: 3 }
  }, [draft.id, draft.name, draft.kind])

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

  const iconStats = useMemo(
    () => ({ filled: fieldFilled(draft.iconUrl) ? 1 : 0, total: 1 }),
    [draft.iconUrl],
  )

  const formProgress = useMemo(
    () => mergeStats(basicStats, descStats, descParamsStats, iconStats),
    [basicStats, descStats, descParamsStats, iconStats],
  )

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyTrait())
    setDescKey((k) => k + 1)
  }, [])

  const select = useCallback((t: GameTraitDef) => {
    setIsNew(false)
    setDraft({ ...t, descriptionParams: t.descriptionParams ?? [] })
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
        await tftApi.createGameTraitDef(draft)
        message.success('Đã tạo tộc/hệ.')
        startNew()
      } else {
        const u = await tftApi.updateGameTraitDef(draft)
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

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={9}>
        <Space direction="vertical" size="middle" className="w-full">
          <Space wrap>
            <Button type="primary" onClick={startNew}>
              Tạo mới
            </Button>
            <Input.Search allowClear placeholder="Tìm id, tên, mô tả…" onChange={(e) => setQ(e.target.value)} />
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
            locale={{ emptyText: loading ? '…' : 'Chưa có dữ liệu.' }}
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
                    item.iconUrl ? (
                      <img src={item.iconUrl} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : undefined
                  }
                  title={item.name}
                  description={
                    <span className="text-on-surface-variant">
                      {item.id} · {item.kind === 'origin' ? 'Tộc' : 'Hệ'}
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
          title={isNew ? 'Thêm tộc / hệ' : 'Cập nhật tộc / hệ'}
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
                          placeholder="vd. origin_noxus"
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
                      <div className="min-w-[160px]">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Loại
                        </Typography.Text>
                        <Select
                          className="w-full"
                          value={draft.kind}
                          onChange={(kind) => setDraft((d) => ({ ...d, kind }))}
                          options={[
                            { value: 'origin', label: 'Tộc (Origin)' },
                            { value: 'class', label: 'Hệ (Class)' },
                          ]}
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
                      previewSubtitle={`${draft.id} · ${draft.kind === 'origin' ? 'Tộc' : 'Hệ'}`}
                      previewImageUrl={draft.iconUrl}
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
                  key: 'icon',
                  label: (
                    <AdminFormCollapseLabel title="Icon / ảnh" filled={iconStats.filled} total={iconStats.total} />
                  ),
                  children: (
                    <div className="w-full">
                      <Typography.Text type="secondary" className="text-xs block mb-1">
                        Icon (upload hoặc URL)
                      </Typography.Text>
                      <ImageUrlUpload
                        value={draft.iconUrl}
                        onChange={(url) => setDraft((d) => ({ ...d, iconUrl: url }))}
                      />
                    </div>
                  ),
                },
              ]}
            />
            <Space>
              <Button type="primary" loading={saving} onClick={save}>
                {isNew ? 'Tạo' : 'Cập nhật'}
              </Button>
              {!isNew ? (
                <Button onClick={startNew}>Tạo mới khác</Button>
              ) : null}
            </Space>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}

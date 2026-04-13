import { useCallback, useMemo, useState } from 'react'
import { App, Button, Card, Col, Collapse, Input, List, Popconfirm, Row, Space, Typography } from 'antd'
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
import type { GameRoleType } from '../../../../types'

function emptyRole(): GameRoleType {
  return {
    id: '',
    name: '',
    color: '#64748b',
    description: '',
    descriptionParams: [],
  }
}

export function RoleTypeTabPanel() {
  const { message } = App.useApp()
  const [tick, setTick] = useState(0)
  const { data, loading, error } = usePromiseData(() => tftApi.gameRoleTypes(), [tick])
  const { data: scalesWithOpts } = usePromiseData(() => tftApi.scalesWithOptions(), [tick])
  const list = data ?? []

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<GameRoleType>(emptyRole)
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)
  const [descKey, setDescKey] = useState(0)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter(
      (r) =>
        r.id.toLowerCase().includes(s) ||
        r.name.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.color.toLowerCase().includes(s),
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
      (fieldFilled(draft.color) ? 1 : 0)
    return { filled, total: 3 }
  }, [draft.id, draft.name, draft.color])

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

  const formProgress = useMemo(
    () => mergeStats(basicStats, descStats, descParamsStats),
    [basicStats, descStats, descParamsStats],
  )

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyRole())
    setDescKey((k) => k + 1)
  }, [])

  const select = useCallback((r: GameRoleType) => {
    setIsNew(false)
    setDraft({ ...r, descriptionParams: r.descriptionParams ?? [] })
    setDescKey((k) => k + 1)
  }, [])

  const save = async () => {
    const id = draft.id.trim().toLowerCase()
    if (!id) {
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
        await tftApi.createGameRoleType({ ...draft, id })
        message.success('Đã tạo vai trò.')
        startNew()
      } else {
        const u = await tftApi.updateGameRoleType({ ...draft, id: draft.id.trim().toLowerCase() })
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

  const remove = async () => {
    if (isNew || !draft.id.trim()) return
    try {
      await tftApi.removeGameRoleType(draft.id.trim())
      message.success('Đã xóa.')
      startNew()
      refresh()
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Xóa thất bại.')
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
            <Input.Search allowClear placeholder="Tìm id, tên, màu, mô tả…" onChange={(e) => setQ(e.target.value)} />
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
                    <span
                      className="inline-block h-9 w-9 rounded-md border border-outline-variant/30 shrink-0"
                      style={{ backgroundColor: item.color }}
                      aria-hidden
                    />
                  }
                  title={item.name}
                  description={
                    <span className="text-on-surface-variant font-mono text-[11px]">{item.id}</span>
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
          title={isNew ? 'Thêm vai trò' : 'Cập nhật vai trò'}
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
                          placeholder="vd. fighter_ad"
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
                      <div className="min-w-[140px]">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Màu
                        </Typography.Text>
                        <Space.Compact className="w-full">
                          <input
                            type="color"
                            value={draft.color.match(/^#[0-9A-Fa-f]{6}$/) ? draft.color : '#64748b'}
                            onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
                            className="h-8 w-12 cursor-pointer rounded-l border border-outline-variant/40 bg-surface-container-lowest p-0.5"
                            aria-label="Chọn màu"
                          />
                          <Input
                            value={draft.color}
                            onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
                            placeholder="#64748b"
                            className="min-w-0 flex-1"
                          />
                        </Space.Compact>
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
                      previewSubtitle={draft.id}
                      previewRightSlot={
                        <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 border border-white/10 bg-black/30">
                          <span
                            className="w-3 h-3 rounded-sm border border-white/20 shrink-0"
                            style={{ backgroundColor: draft.color }}
                            aria-hidden
                          />
                          <span className="text-[11px] font-mono text-[#e8eaed] tabular-nums">{draft.color}</span>
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
              ]}
            />
            <Space wrap>
              <Button type="primary" loading={saving} onClick={save}>
                {isNew ? 'Tạo' : 'Cập nhật'}
              </Button>
              {!isNew ? (
                <>
                  <Button onClick={startNew}>Tạo mới khác</Button>
                  <Popconfirm
                    title="Xóa vai trò này?"
                    description="Chỉ xóa được khi không còn tướng nào dùng id này."
                    onConfirm={remove}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button danger>Xóa</Button>
                  </Popconfirm>
                </>
              ) : null}
            </Space>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}

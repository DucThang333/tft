import { useCallback, useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Collapse,
  Input,
  List,
  Popconfirm,
  Row,
  Select,
  Space,
  Typography,
} from 'antd'
import { tftApi } from '../../../../api/tftApi'
import { ImageUrlUpload } from '../../../../components/forms/ImageUrlUpload'
import { usePromiseData } from '../../../../hooks/usePromiseData'
import {
  AdminFormCardProgress,
  AdminFormCollapseLabel,
  ADMIN_FORM_COLLAPSE_CLASS,
} from '../../components/AdminFormCollapseLabel'
import { fieldFilled, mergeStats } from '../../components/adminFormFieldStats'
import type { ScalesWithOption } from '../../../../types'

function emptyOption(): ScalesWithOption {
  return { id: '', label: '', iconUrl: '', textColor: '', valueFormat: 'flat' }
}

export function ScalesWithTabPanel() {
  const { message } = App.useApp()
  const [tick, setTick] = useState(0)
  const { data, loading, error } = usePromiseData(() => tftApi.scalesWithOptions(), [tick])
  const list = data ?? []

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<ScalesWithOption>(emptyOption)
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter(
      (o) =>
        o.id.toLowerCase().includes(s) ||
        o.label.toLowerCase().includes(s) ||
        o.iconUrl.toLowerCase().includes(s),
    )
  }, [list, q])

  const basicStats = useMemo(() => {
    const filled = (fieldFilled(draft.id) ? 1 : 0) + (fieldFilled(draft.label) ? 1 : 0)
    return { filled, total: 2 }
  }, [draft.id, draft.label])

  const iconStats = useMemo(
    () => ({ filled: fieldFilled(draft.iconUrl) ? 1 : 0, total: 1 }),
    [draft.iconUrl],
  )

  const formProgress = useMemo(() => mergeStats(basicStats, iconStats), [basicStats, iconStats])

  const refresh = useCallback(() => setTick((x) => x + 1), [])

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyOption())
  }, [])

  const select = useCallback((o: ScalesWithOption) => {
    setIsNew(false)
    setDraft({ ...o })
  }, [])

  const save = async () => {
    const id = draft.id.trim().toLowerCase()
    if (!id) {
      message.error('Mã (id) là bắt buộc.')
      return
    }
    if (!draft.label.trim()) {
      message.error('Nhãn (label) là bắt buộc.')
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        await tftApi.createScalesWithOption({ ...draft, id })
        message.success('Đã tạo scalesWith.')
        startNew()
      } else {
        const u = await tftApi.updateScalesWithOption({ ...draft, id: draft.id.trim().toLowerCase() })
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
      await tftApi.removeScalesWithOption(draft.id.trim())
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
            <Input.Search allowClear placeholder="Tìm id, label, URL…" onChange={(e) => setQ(e.target.value)} />
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
                    item.textColor?.trim() || item.iconUrl ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.textColor?.trim() ? (
                          <span
                            className="h-4 w-4 rounded border border-white/25 shrink-0 shadow-inner"
                            style={{ backgroundColor: item.textColor.trim() }}
                            title={`Màu số: ${item.textColor.trim()}`}
                            aria-hidden
                          />
                        ) : null}
                        {item.iconUrl ? (
                          <img
                            src={item.iconUrl}
                            alt=""
                            className="h-10 w-10 rounded object-contain bg-black/20 p-0.5"
                          />
                        ) : null}
                      </div>
                    ) : undefined
                  }
                  title={item.label}
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
          title={isNew ? 'Thêm scalesWith' : 'Cập nhật scalesWith'}
          extra={<AdminFormCardProgress filled={formProgress.filled} total={formProgress.total} />}
        >
          <Space direction="vertical" size="middle" className="w-full">
            <Collapse
              bordered={false}
              className={ADMIN_FORM_COLLAPSE_CLASS}
              defaultActiveKey={['basic', 'icon']}
              items={[
                {
                  key: 'basic',
                  label: (
                    <AdminFormCollapseLabel
                      title="Id & nhãn"
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
                          placeholder="vd. ability_power"
                        />
                      </div>
                      <div className="min-w-[200px] flex-1">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Label
                        </Typography.Text>
                        <Input
                          value={draft.label}
                          onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                        />
                      </div>
                      <div className="min-w-[260px] w-full">
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Kiểu hiển thị số (theo bậc sao / mẫu)
                        </Typography.Text>
                        <Select
                          className="w-full"
                          value={draft.valueFormat ?? 'flat'}
                          onChange={(v) =>
                            setDraft((d) => ({
                              ...d,
                              valueFormat: v === 'percent' ? 'percent' : 'flat',
                            }))
                          }
                          options={[
                            {
                              value: 'flat',
                              label: 'Sát thương thực — số thường (vd. 100/150/225)',
                            },
                            {
                              value: 'percent',
                              label: 'Sát thương % — thêm % cuối (vd. 100/150/225%)',
                            },
                          ]}
                        />
                      </div>
                    </Space>
                  ),
                },
                {
                  key: 'icon',
                  label: (
                    <AdminFormCollapseLabel title="Icon" filled={iconStats.filled} total={iconStats.total} />
                  ),
                  children: (
                    <div className="w-full space-y-3">
                      <div>
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Icon (upload hoặc URL)
                        </Typography.Text>
                        <ImageUrlUpload
                          value={draft.iconUrl}
                          onChange={(url) => setDraft((d) => ({ ...d, iconUrl: url }))}
                        />
                      </div>
                      <div>
                        <Typography.Text type="secondary" className="text-xs block mb-1">
                          Màu chữ số trong mô tả (hex, vd. #E6A04D)
                        </Typography.Text>
                        <div className="flex flex-wrap items-center gap-2">
                          <Input
                            className="max-w-[200px] font-mono text-xs"
                            value={draft.textColor ?? ''}
                            onChange={(e) => setDraft((d) => ({ ...d, textColor: e.target.value }))}
                            placeholder="#E6A04D"
                          />
                          <input
                            type="color"
                            aria-label="Chọn màu"
                            value={
                              /^#([0-9A-Fa-f]{6})$/.test((draft.textColor ?? '').trim())
                                ? (draft.textColor ?? '').trim()
                                : '#888888'
                            }
                            onChange={(e) => setDraft((d) => ({ ...d, textColor: e.target.value }))}
                            className="h-9 w-12 cursor-pointer rounded border border-outline-variant/30 bg-transparent p-0.5"
                          />
                        </div>
                      </div>
                    </div>
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
                    title="Xóa option này?"
                    description="Chỉ xóa được khi không còn tham số kỹ năng nào dùng id này."
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

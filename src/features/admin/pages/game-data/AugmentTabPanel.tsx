import { useCallback, useMemo, useState } from 'react'
import { App, Button, Card, Col, Input, List, Row, Select, Space, Typography } from 'antd'
import { tftApi } from '../../../../api/tftApi'
import { DescriptionTemplateField } from '../../../../components/forms/DescriptionTemplateField'
import { usePromiseData } from '../../../../hooks/usePromiseData'
import type { GameAugment } from '../../../../types'

function emptyAugment(): GameAugment {
  return {
    id: '',
    name: '',
    tier: 'silver',
    description: '',
    imageUrl: '',
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
  const list = data ?? []

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<GameAugment>(emptyAugment)
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)

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

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyAugment())
  }, [])

  const select = useCallback((a: GameAugment) => {
    setIsNew(false)
    setDraft({ ...a })
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
              emptyText: loading ? '…' : 'Chưa có dữ liệu hoặc API /api/v1/meta/augments chưa sẵn sàng.',
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
        <Card size="small" title={isNew ? 'Thêm lõi nâng cấp' : 'Cập nhật lõi nâng cấp'}>
          <Space direction="vertical" size="middle" className="w-full">
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
            <DescriptionTemplateField
              label="Mô tả hiệu ứng"
              rows={5}
              value={draft.description}
              onChange={(description) => setDraft((d) => ({ ...d, description }))}
            />
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

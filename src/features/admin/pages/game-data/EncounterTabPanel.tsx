import { useCallback, useMemo, useState } from 'react'
import { App, Button, Card, Col, Input, List, Row, Space, Typography } from 'antd'
import { tftApi } from '../../../../api/tftApi'
import { DescriptionTemplateField } from '../../../../components/forms/DescriptionTemplateField'
import { usePromiseData } from '../../../../hooks/usePromiseData'
import type { GameEncounter } from '../../../../types'

function emptyEncounter(): GameEncounter {
  return {
    id: '',
    name: '',
    description: '',
    imageUrl: '',
  }
}

export function EncounterTabPanel() {
  const { message } = App.useApp()
  const [tick, setTick] = useState(0)
  const { data, loading, error } = usePromiseData(() => tftApi.gameEncounters(), [tick])
  const list = data ?? []

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<GameEncounter>(emptyEncounter)
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter(
      (x) =>
        x.name.toLowerCase().includes(s) ||
        x.id.toLowerCase().includes(s) ||
        x.description.toLowerCase().includes(s),
    )
  }, [list, q])

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyEncounter())
  }, [])

  const select = useCallback((x: GameEncounter) => {
    setIsNew(false)
    setDraft({ ...x })
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
        await tftApi.createGameEncounter(draft)
        message.success('Đã tạo kỳ ngộ.')
        startNew()
      } else {
        const u = await tftApi.updateGameEncounter(draft)
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
            <Input.Search allowClear placeholder="Tìm kỳ ngộ…" onChange={(e) => setQ(e.target.value)} />
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
              emptyText: loading ? '…' : 'Chưa có dữ liệu hoặc API /api/v1/meta/encounters chưa sẵn sàng.',
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
                  description={<span className="text-on-surface-variant">{item.id}</span>}
                />
              </List.Item>
            )}
          />
        </Space>
      </Col>
      <Col xs={24} lg={15}>
        <Card size="small" title={isNew ? 'Thêm kỳ ngộ' : 'Cập nhật kỳ ngộ'}>
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
                  placeholder="vd. portal_treasure"
                />
              </div>
              <div className="min-w-[200px] flex-[2]">
                <Typography.Text type="secondary" className="text-xs block mb-1">
                  Tên hiển thị
                </Typography.Text>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </div>
            </Space>
            <DescriptionTemplateField
              label="Mô tả (portal, sự kiện phiên, v.v.)"
              rows={6}
              value={draft.description}
              onChange={(description) => setDraft((d) => ({ ...d, description }))}
            />
            <div className="w-full">
              <Typography.Text type="secondary" className="text-xs block mb-1">
                URL ảnh / icon
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

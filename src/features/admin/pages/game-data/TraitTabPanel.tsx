import { useCallback, useMemo, useState } from 'react'
import { App, Button, Card, Col, Input, List, Row, Select, Space, Typography } from 'antd'
import { tftApi } from '../../../../api/tftApi'
import { DescriptionTemplateField } from '../../../../components/forms/DescriptionTemplateField'
import { ImageUrlUpload } from '../../../../components/forms/ImageUrlUpload'
import { usePromiseData } from '../../../../hooks/usePromiseData'
import type { GameTraitDef } from '../../../../types'

function emptyTrait(): GameTraitDef {
  return {
    id: '',
    name: '',
    kind: 'origin',
    description: '',
    iconUrl: '',
  }
}

export function TraitTabPanel() {
  const { message } = App.useApp()
  const [tick, setTick] = useState(0)
  const { data, loading, error } = usePromiseData(() => tftApi.gameTraitDefs(), [tick])
  const list = data ?? []

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<GameTraitDef>(emptyTrait)
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)

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

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyTrait())
  }, [])

  const select = useCallback((t: GameTraitDef) => {
    setIsNew(false)
    setDraft({ ...t })
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
            locale={{ emptyText: loading ? '…' : 'Chưa có dữ liệu hoặc API /api/v1/meta/traits chưa sẵn sàng.' }}
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
        <Card size="small" title={isNew ? 'Thêm tộc / hệ' : 'Cập nhật tộc / hệ'}>
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
            <DescriptionTemplateField
              label="Mô tả (có thể tham khảo mô tả synergy trên MetaTFT)"
              rows={4}
              value={draft.description}
              onChange={(description) => setDraft((d) => ({ ...d, description }))}
            />
            <div className="w-full">
              <Typography.Text type="secondary" className="text-xs block mb-1">
                Icon (upload hoặc URL)
              </Typography.Text>
              <ImageUrlUpload
                value={draft.iconUrl}
                onChange={(url) => setDraft((d) => ({ ...d, iconUrl: url }))}
              />
            </div>
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

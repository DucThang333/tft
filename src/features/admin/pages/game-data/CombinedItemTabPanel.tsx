import { useCallback, useMemo, useState } from 'react'
import { App, Button, Card, Col, Input, List, Row, Space, Typography } from 'antd'
import { ImageUrlUpload } from '../../../../components/forms/ImageUrlUpload'
import { tftApi } from '../../../../api/tftApi'
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
  const list = data ?? []

  const [isNew, setIsNew] = useState(true)
  const [draft, setDraft] = useState<CombinedItem>(emptyItem)
  const [tagsInput, setTagsInput] = useState('')
  const [statsInput, setStatsInput] = useState('')
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)

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

  const startNew = useCallback(() => {
    setIsNew(true)
    setDraft(emptyItem())
    setTagsInput('')
    setStatsInput('')
  }, [])

  const select = useCallback((it: CombinedItem) => {
    setIsNew(false)
    setDraft({ ...it, components: [...it.components] as [string, string] })
    setTagsInput(tagsToInput(it.tags))
    setStatsInput(statsToText(it.stats))
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
        <Card size="small" title={isNew ? 'Thêm trang bị ghép' : 'Cập nhật trang bị ghép'}>
          <Space direction="vertical" size="middle" className="w-full">
            <Typography.Paragraph type="secondary" className="!mb-0 text-xs">
              Danh sách đọc từ <Typography.Text code>/api/v1/items/combined</Typography.Text>. Lưu cần route admin
              POST/PUT tương ứng.
            </Typography.Paragraph>
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
            <div>
              <Typography.Text type="secondary" className="text-xs block mb-1">
                Mô tả
              </Typography.Text>
              <Input.TextArea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>
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

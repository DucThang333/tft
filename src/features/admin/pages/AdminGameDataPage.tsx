import { Tabs, Typography } from 'antd'
import { Icon } from '../../../components/ui/Icon'
import { AugmentTabPanel } from './game-data/AugmentTabPanel'
import { CombinedItemTabPanel } from './game-data/CombinedItemTabPanel'
import { EncounterTabPanel } from './game-data/EncounterTabPanel'
import { TraitTabPanel } from './game-data/TraitTabPanel'

const metatftDoubleUp = 'https://www.metatft.com/double-up-comps'

export function AdminGameDataPage() {
  return (
    <main className="flex-1 p-8 min-h-screen bg-background pb-28">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-tertiary font-label text-[10px] uppercase tracking-[0.2em]">Thánh địa</span>
          <Icon name="chevron_right" className="text-xs text-outline-variant" />
          <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em]">
            Dữ liệu meta
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface tracking-tight uppercase mb-3">
          Tộc, trang bị, lõi &amp; kỳ ngộ
        </h1>
        <Typography.Paragraph className="text-on-surface-variant max-w-3xl text-sm leading-relaxed !mb-2">
          Bốn tab để thêm hoặc cập nhật nội dung meta (định dạng gần với cách site thống kê TFT tổ chức đội hình, lõi
          và nhãn meta). Có thể đối chiếu nhanh với{' '}
          <Typography.Link href={metatftDoubleUp} target="_blank" rel="noreferrer">
            MetaTFT — Double Up comps
          </Typography.Link>
          .
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary" className="text-xs max-w-3xl !mb-0">
          Đọc danh sách: <Typography.Text code>/api/v1/meta/traits</Typography.Text>,{' '}
          <Typography.Text code>/api/v1/meta/augments</Typography.Text>,{' '}
          <Typography.Text code>/api/v1/meta/encounters</Typography.Text>,{' '}
          <Typography.Text code>/api/v1/items/combined</Typography.Text>. Ghi:{' '}
          <Typography.Text code>/api/v1/admin/meta/…</Typography.Text> và{' '}
          <Typography.Text code>/api/v1/admin/items/combined</Typography.Text>.
        </Typography.Paragraph>
      </div>

      <Tabs
        defaultActiveKey="traits"
        items={[
          {
            key: 'traits',
            label: 'Tộc & hệ',
            children: <TraitTabPanel />,
          },
          {
            key: 'items',
            label: 'Trang bị ghép',
            children: <CombinedItemTabPanel />,
          },
          {
            key: 'augments',
            label: 'Lõi nâng cấp',
            children: <AugmentTabPanel />,
          },
          {
            key: 'encounters',
            label: 'Kỳ ngộ',
            children: <EncounterTabPanel />,
          },
        ]}
      />
    </main>
  )
}

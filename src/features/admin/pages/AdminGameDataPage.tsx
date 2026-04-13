import { Tabs } from 'antd'
import { Icon } from '../../../components/ui/Icon'
import { AugmentTabPanel } from './game-data/AugmentTabPanel'
import { CombinedItemTabPanel } from './game-data/CombinedItemTabPanel'
import { EncounterTabPanel } from './game-data/EncounterTabPanel'
import { RoleTypeTabPanel } from './game-data/RoleTypeTabPanel'
import { ScalesWithTabPanel } from './game-data/ScalesWithTabPanel'
import { TraitTabPanel } from './game-data/TraitTabPanel'

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
            key: 'role-types',
            label: 'Vai trò',
            children: <RoleTypeTabPanel />,
          },
          {
            key: 'scales-with',
            label: 'Scales with',
            children: <ScalesWithTabPanel />,
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

import { useEffect, useMemo, useState } from 'react'
import { App, Button, Checkbox, Modal, Select, Space } from 'antd'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { tftApi } from '../../api/tftApi'
import { usePromiseData } from '../../hooks/usePromiseData'
import { useDataVersion } from '../../state/dataVersion'
import { Icon } from '../ui/Icon'

interface AppTopBarProps {
  onOpenSearch?: () => void
}

/** Khớp backend `Versioning` — từng tab / nhóm dữ liệu có `version_id`. */
const SYNC_ENTITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'champions', label: 'Tướng' },
  { value: 'traits', label: 'Tộc & hệ' },
  { value: 'baseItems', label: 'Trang bị cơ bản' },
  { value: 'combinedItems', label: 'Trang bị ghép' },
  { value: 'augments', label: 'Lõi nâng cấp' },
  { value: 'encounters', label: 'Kỳ ngộ' },
]

const SYNC_LABELS: Record<string, string> = Object.fromEntries(
  SYNC_ENTITY_OPTIONS.map((o) => [o.value, o.label]),
)

function formatMigratedSummary(m: {
  champions: number
  traits: number
  baseItems: number
  combinedItems: number
  augments: number
  encounters: number
}): string {
  const parts: string[] = []
  for (const { value: key } of SYNC_ENTITY_OPTIONS) {
    const n = m[key as keyof typeof m]
    if (n > 0) parts.push(`${SYNC_LABELS[key]}: ${n}`)
  }
  return parts.length > 0 ? parts.join(' · ') : 'Không có bản ghi nào được chuyển.'
}

export function AppTopBar({ onOpenSearch }: AppTopBarProps) {
  const { pathname } = useLocation()
  const sanctumActive = pathname.startsWith('/admin')
  const { message } = App.useApp()
  const { data } = usePromiseData(() => tftApi.gameVersions(), [], { skipVersion: true })
  const { value: selectedVersion, setValue: setSelectedVersion } = useDataVersion()
  const versions = data ?? []

  const [syncOpen, setSyncOpen] = useState(false)
  const [syncFrom, setSyncFrom] = useState<string | undefined>(undefined)
  const [syncTo, setSyncTo] = useState<string | undefined>(undefined)
  const [syncEntities, setSyncEntities] = useState<string[]>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (versions.length === 0) return
    if (selectedVersion) return
    const active = versions.find((v) => v.isActive)
    setSelectedVersion((active ?? versions[0]).value)
  }, [selectedVersion, setSelectedVersion, versions])

  const versionOptions = useMemo(
    () =>
      versions.map((v) => ({
        value: v.value,
        label: v.label,
      })),
    [versions],
  )

  const openSync = () => {
    setSyncFrom(selectedVersion || versions[0]?.value)
    setSyncTo(
      versions.find((v) => v.value !== (selectedVersion || versions[0]?.value))?.value ??
        versions[1]?.value,
    )
    if (pathname.startsWith('/admin/champions')) {
      setSyncEntities(['champions'])
    } else {
      setSyncEntities([])
    }
    setSyncOpen(true)
  }

  const runSync = async () => {
    const from = syncFrom?.trim()
    const to = syncTo?.trim()
    if (!from || !to) {
      message.warning('Chọn đủ phiên bản nguồn và đích.')
      return
    }
    if (syncEntities.length === 0) {
      message.warning('Chọn ít nhất một nhóm dữ liệu cần đồng bộ.')
      return
    }
    setSyncing(true)
    try {
      const m = await tftApi.migrateVersionData(from, to, syncEntities)
      message.success(`Đã chuyển: ${formatMigratedSummary(m)}`)
      setSyncOpen(false)
      setSelectedVersion(to)
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Đồng bộ thất bại.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <header className="w-full top-0 sticky z-50 bg-background shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="flex justify-between items-center px-6 md:px-8 h-20 w-full max-w-full">
        <div className="flex items-center gap-8 md:gap-12">
          <Link
            to="/champions"
            className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary-container font-headline tracking-tight uppercase"
          >
            Chiến thuật TFT
          </Link>
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 h-full">
            <NavLink
              to="/champions"
              className={({ isActive }) =>
                `font-headline tracking-tight uppercase text-sm font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Tướng
            </NavLink>
            <NavLink
              to="/board"
              className={({ isActive }) =>
                `font-headline tracking-tight uppercase text-sm font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Bàn cờ
            </NavLink>
            <NavLink
              to="/meta"
              className={({ isActive }) =>
                `font-headline tracking-tight uppercase text-sm font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Meta
            </NavLink>
            <Link
              to="/admin/archive"
              className={`font-headline tracking-tight uppercase text-sm font-bold transition-colors ${
                sanctumActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Bảng điều khiển
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <Select
            size="small"
            className="min-w-[120px] max-w-[200px]"
            popupMatchSelectWidth={false}
            value={selectedVersion || undefined}
            options={versionOptions}
            placeholder="Chọn version"
            onChange={setSelectedVersion}
          />
          {sanctumActive ? (
            <Button size="small" type="default" onClick={openSync} className="text-xs shrink-0">
              Đồng bộ version
            </Button>
          ) : null}
          <button
            type="button"
            onClick={() => onOpenSearch?.()}
            className="flex lg:hidden items-center justify-center p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95"
            aria-label="Mở tìm kiếm"
          >
            <Icon name="search" />
          </button>
          <button
            type="button"
            onClick={() => onOpenSearch?.()}
            className="hidden lg:flex items-center bg-surface-container-high/50 hover:bg-surface-container-high px-3 py-2 rounded-lg gap-3 border-b-2 border-outline-variant focus-visible:border-tertiary transition-all text-left w-56 xl:w-64"
            aria-label="Mở tìm kiếm"
          >
            <Icon name="search" className="text-on-surface-variant text-sm shrink-0" />
            <span className="text-sm text-on-surface-variant/70 truncate font-body">Tìm trong kho dữ liệu…</span>
            <kbd className="ml-auto shrink-0 rounded border border-outline-variant/40 bg-surface-container-low px-1.5 py-0.5 font-mono text-[10px] text-on-surface-variant">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all duration-300 active:scale-95"
            aria-label="Cài đặt"
          >
            <Icon name="settings" />
          </button>
          <button
            type="button"
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all duration-300 active:scale-95"
            aria-label="Tài khoản"
          >
            <Icon name="account_circle" />
          </button>
        </div>
      </div>
      <div className="bg-surface-container-high h-px w-full" />

      <Modal
        title="Đồng bộ dữ liệu giữa các phiên bản"
        open={syncOpen}
        onCancel={() => !syncing && setSyncOpen(false)}
        footer={null}
        destroyOnClose
      >
        <p className="text-sm text-on-surface-variant mb-4">
          Chỉ các <strong>nhóm bạn tick</strong> mới được chuyển <code className="text-xs">version_id</code>{' '}
          từ phiên bản nguồn sang đích (giống từng tab admin). Vai trò / Scales-with không gắn phiên bản
          nên không có trong danh sách. Chỉ nên dùng khi bản đích gần trống để tránh trùng id.
        </p>
        <Space direction="vertical" size="middle" className="w-full">
          <div>
            <div className="text-xs text-on-surface-variant mb-2">Nhóm dữ liệu</div>
            <Checkbox.Group
              className="flex flex-col gap-2"
              options={SYNC_ENTITY_OPTIONS}
              value={syncEntities}
              onChange={(v) => setSyncEntities(v as string[])}
            />
          </div>
          <div>
            <div className="text-xs text-on-surface-variant mb-1">Từ phiên bản</div>
            <Select
              className="w-full"
              options={versionOptions}
              value={syncFrom}
              onChange={setSyncFrom}
              placeholder="Nguồn"
            />
          </div>
          <div>
            <div className="text-xs text-on-surface-variant mb-1">Sang phiên bản</div>
            <Select
              className="w-full"
              options={versionOptions}
              value={syncTo}
              onChange={setSyncTo}
              placeholder="Đích"
            />
          </div>
          <Space>
            <Button type="primary" loading={syncing} onClick={runSync}>
              Chạy đồng bộ
            </Button>
            <Button disabled={syncing} onClick={() => setSyncOpen(false)}>
              Hủy
            </Button>
          </Space>
        </Space>
      </Modal>
    </header>
  )
}

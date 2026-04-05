import { useCallback, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { tftApi } from '../../api/tftApi'
import type { BaseItem, Champion, CombinedItem } from '../../types'
import { Icon } from '../ui/Icon'

interface SearchCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ArchiveCache = {
  champions: Champion[]
  baseItems: BaseItem[]
  combinedItems: CombinedItem[]
}

const navItems = [
  { to: '/champions', label: 'Tướng', hint: 'Bách khoa' },
  { to: '/items', label: 'Trang bị', hint: 'Kho pháp khí' },
  { to: '/board', label: 'Bàn cờ', hint: 'Lưới chiến thuật' },
  { to: '/meta', label: 'Meta', hint: 'Đội hình' },
  { to: '/admin/archive', label: 'Thánh địa', hint: 'Quản trị' },
] as const

export function SearchCommandPalette({ open, onOpenChange }: SearchCommandPaletteProps) {
  const navigate = useNavigate()
  const [cache, setCache] = useState<ArchiveCache | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || cache) return
    let cancelled = false
    Promise.all([tftApi.champions(), tftApi.baseItems(), tftApi.combinedItems()])
      .then(([champions, baseItems, combinedItems]) => {
        if (!cancelled) {
          setLoadError(null)
          setCache({ champions, baseItems, combinedItems })
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Không tải được kho dữ liệu')
      })
    return () => {
      cancelled = true
    }
  }, [open, cache])

  const go = useCallback(
    (to: string) => {
      onOpenChange(false)
      navigate(to)
    },
    [navigate, onOpenChange],
  )

  const loading = open && !cache && !loadError

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-[12%] z-[101] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border border-outline-variant/30 bg-surface-container-low shadow-2xl outline-none"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="sr-only">Tìm trong kho huyền bí</Dialog.Title>
          <Dialog.Description className="sr-only">
            Gõ để lọc điều hướng, tướng và trang bị. Nhấn Enter để mở kết quả.
          </Dialog.Description>

          <Command
            className="flex max-h-[min(70vh,520px)] flex-col overflow-hidden rounded-xl bg-surface-container-low text-on-surface [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-headline [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-outline-variant [&_[cmdk-input-wrapper]_svg]:hidden"
            shouldFilter
            loop
          >
            <div className="flex items-center gap-2 border-b border-outline-variant/20 px-3">
              <Icon name="search" className="shrink-0 text-on-surface-variant text-lg" />
              <Command.Input
                placeholder="Tìm trong kho, tướng, trang bị…"
                className="flex h-12 w-full bg-transparent py-3 text-sm font-body text-on-surface outline-none placeholder:text-outline-variant"
              />
              <kbd className="hidden shrink-0 rounded border border-outline-variant/40 bg-surface-container-high px-1.5 py-0.5 font-mono text-[10px] text-on-surface-variant sm:inline">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[min(60vh,440px)] overflow-y-auto p-2 custom-scrollbar">
              {loadError && (
                <div className="px-3 py-8 text-center text-sm text-error">{loadError}</div>
              )}
              {!loadError && loading && (
                <div className="px-3 py-8 text-center text-sm text-on-surface-variant">
                  Đang tải kho dữ liệu…
                </div>
              )}

              <Command.Empty className="py-8 text-center text-sm text-on-surface-variant">
                Không có kết quả trong kho.
              </Command.Empty>

              <Command.Group heading="Điều hướng">
                {navItems.map((item) => (
                  <Command.Item
                    key={item.to}
                    value={`${item.label} ${item.hint} ${item.to}`}
                    onSelect={() => go(item.to)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-body aria-selected:bg-surface-container-high aria-selected:text-primary"
                  >
                    <Icon name="arrow_forward" className="text-on-surface-variant text-base" />
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold">{item.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                        {item.hint}
                      </span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>

              {cache && cache.champions.length > 0 && (
                <Command.Group heading="Tướng">
                  {cache.champions.map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`${c.name} ${c.roleType} ${c.traits.join(' ')} tướng`}
                      onSelect={() => go(`/champions?q=${encodeURIComponent(c.name)}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-surface-container-high aria-selected:text-primary"
                    >
                      <img
                        src={c.imageUrl}
                        alt=""
                        className="h-9 w-9 rounded-md object-cover"
                        loading="lazy"
                      />
                      <div>
                        <div className="font-headline font-semibold">{c.name}</div>
                        <div className="text-[10px] text-on-surface-variant">
                          {c.traits.slice(0, 3).join(' · ')}
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {cache && cache.baseItems.length > 0 && (
                <Command.Group heading="Linh kiện cơ bản">
                  {cache.baseItems.map((b) => (
                    <Command.Item
                      key={b.id}
                      value={`${b.name} ${b.shortName} ${b.stat} linh kiện`}
                      onSelect={() => go(`/items?base=${encodeURIComponent(b.id)}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-surface-container-high aria-selected:text-primary"
                    >
                      <img
                        src={b.imageUrl}
                        alt=""
                        className="h-9 w-9 rounded-md object-cover bg-surface-container-highest"
                        loading="lazy"
                      />
                      <div>
                        <div className="font-headline font-semibold">{b.name}</div>
                        <div className="text-[10px] text-on-surface-variant">{b.shortName}</div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {cache && cache.combinedItems.length > 0 && (
                <Command.Group heading="Trang bị đã ghép">
                  {cache.combinedItems.map((ci) => (
                    <Command.Item
                      key={ci.id}
                      value={`${ci.name} ${ci.componentNames} ${ci.tags.join(' ')} ghép`}
                      onSelect={() => go(`/items?combined=${encodeURIComponent(ci.id)}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-surface-container-high aria-selected:text-primary"
                    >
                      <img
                        src={ci.imageUrl}
                        alt=""
                        className="h-9 w-9 rounded-md object-cover bg-surface-container-highest"
                        loading="lazy"
                      />
                      <div>
                        <div className="font-headline font-semibold">{ci.name}</div>
                        <div className="text-[10px] text-on-surface-variant">{ci.componentNames}</div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

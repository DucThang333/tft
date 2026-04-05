import { useMemo } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { ApiStatus } from '../../../components/ui/ApiStatus'
import { tftApi } from '../../../api/tftApi'
import { usePromiseData } from '../../../hooks/usePromiseData'
import type { Champion } from '../../../types'

const HERO_SPLASH =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDTQHXOrurOZfF5p3F8Ig8Add_ggq7ppbxuUBhexveMYD-5bfdBsKh_mgI70EvCMbUkBwQJFYQQKDqjK6uVJZ4wNJmVcWvQWC8kVEghtIjVaU6tzzk0d1tNboL3XgaLLMqNwloB8n_-i-dzzLcEKXOuXkEwNn6Zyg3F_fF49v8KBaN3udaQ0qqGllrfAdWPRnwRn4B1ITpA-Kg75T3a0XhHfPqLFoaz-0JGnwArhL_XfhOwdsZsiai1hOnLMi9RASTwNYwMk99YkDVO'

function tierLabel(cost: Champion['cost']): string {
  if (cost >= 5) return 'S+'
  if (cost === 4) return 'A'
  if (cost === 3) return 'B'
  if (cost === 2) return 'B'
  return 'C'
}

function powerPct(champion: Champion): number {
  let h = 0
  for (let i = 0; i < champion.id.length; i++) h = (h + champion.id.charCodeAt(i) * (i + 1)) % 97
  return 40 + (h % 55)
}

function AdminChampionTile({ champion }: { champion: Champion }) {
  const tier = tierLabel(champion.cost)
  const pct = powerPct(champion)
  const traits = champion.traits.slice(0, 2).join(' / ') || '—'

  return (
    <div className="bg-surface-container group hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-square relative overflow-hidden">
        <img
          alt=""
          className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
          src={champion.imageUrl}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
        <div className="absolute bottom-4 left-4">
          <span className="text-xs font-headline font-bold text-on-surface">{champion.name.toUpperCase()}</span>
          <p className="text-[8px] text-primary uppercase font-bold tracking-tighter">
            Giá: {champion.cost} vàng
          </p>
        </div>
        <div className="absolute top-4 right-4 flex gap-1">
          <button
            type="button"
            className="p-1.5 bg-surface-container-highest/80 backdrop-blur-md rounded hover:text-primary transition-colors"
            aria-label={`Sửa ${champion.name}`}
          >
            <Icon name="edit" className="text-sm" />
          </button>
          <button
            type="button"
            className="p-1.5 bg-surface-container-highest/80 backdrop-blur-md rounded hover:text-error transition-colors"
            aria-label={`Xóa ${champion.name}`}
          >
            <Icon name="delete" className="text-sm" />
          </button>
        </div>
      </div>
      <div className="p-4 border-t border-outline-variant/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant">{traits}</span>
          <span className="text-[10px] font-bold text-tertiary">Bậc {tier}</span>
        </div>
        <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
          <div className="bg-primary h-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

export function AdminArchiveDashboard() {
  const { data: champions, loading, error } = usePromiseData(() => tftApi.champions(), [])
  const { data: meta } = usePromiseData(() => tftApi.metaOverview(), [])

  const list = champions ?? []

  const featured = useMemo(() => {
    const bySol = list.find((c) => c.name.toLowerCase().includes('sol'))
    const byCost = [...list].sort((a, b) => b.cost - a.cost)[0]
    return bySol ?? byCost ?? null
  }, [list])

  const gridChampions = useMemo(() => list.slice(0, 4), [list])

  return (
    <main className="flex-1 p-8 min-h-screen bg-background pb-28">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-tertiary font-label text-[10px] uppercase tracking-[0.2em]">Thánh địa</span>
          <Icon name="chevron_right" className="text-xs text-outline-variant" />
          <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em]">
            Bách khoa
          </span>
        </div>
        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-8">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight uppercase mb-2">
              Bách khoa tướng
            </h1>
            <p className="text-on-surface-variant max-w-xl font-body text-sm leading-relaxed">
              Truy cập kho dữ liệu đầy đủ về các thực thể chiến thuật. Quản lý nguồn gốc, lớp và tỉ lệ sức mạnh cho
              sự hội tụ vũ trụ sắp tới.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="bg-surface-container-high p-4 rounded-lg flex flex-col min-w-[140px]">
              <span className="text-[10px] text-tertiary uppercase font-bold tracking-widest mb-1">
                Tổng hồ sơ
              </span>
              <span className="text-2xl font-headline font-bold text-on-surface">{list.length}</span>
            </div>
            <div className="bg-surface-container-high p-4 rounded-lg flex flex-col min-w-[140px]">
              <span className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Mùa đang hoạt động</span>
              <span className="text-2xl font-headline font-bold text-on-surface">
                {meta?.patchLabel ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ApiStatus loading={loading} error={error}>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-high rounded-xl overflow-hidden relative min-h-[400px] flex items-end">
            <div className="absolute inset-0 z-0">
              <img
                alt=""
                className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
                src={featured?.imageUrl ?? HERO_SPLASH}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
            </div>
            <div className="relative z-10 p-8 w-full">
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-primary-container/40 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20 rounded">
                  Huyền thoại
                </span>
                <span className="px-3 py-1 bg-tertiary-container/40 backdrop-blur-md text-tertiary text-[10px] font-bold uppercase tracking-widest border border-tertiary/20 rounded">
                  Nổi bật
                </span>
              </div>
              <h2 className="text-5xl font-headline font-black text-on-surface uppercase mb-4 tracking-tighter">
                {(featured?.name ?? 'AURELION SOL').toUpperCase()}
              </h2>
              <div className="flex flex-wrap items-center gap-8 lg:gap-12 border-t border-outline-variant/20 pt-6">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Tỷ lệ thắng</p>
                  <p className="text-xl font-headline font-bold text-tertiary">54.2%</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Tỷ lệ chọn</p>
                  <p className="text-xl font-headline font-bold text-on-surface">12.8%</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Bậc</p>
                  <p className="text-xl font-headline font-bold text-primary">
                    {featured ? tierLabel(featured.cost) : 'S+'}
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-auto bg-surface-bright/80 hover:bg-surface-bright backdrop-blur-sm px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Xem chỉ số đầy đủ
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6">
            <div className="bg-surface-container-highest/40 border border-outline-variant/10 p-6 rounded-xl relative group cursor-pointer hover:bg-surface-container-highest/60 transition-all">
              <Icon name="add_circle" filled className="text-4xl text-primary mb-4" />
              <h3 className="text-lg font-headline font-bold text-on-surface uppercase tracking-tight">
                Tạo hồ sơ
              </h3>
              <p className="text-on-surface-variant text-sm font-body mt-2">
                Thêm một thực thể chiến thuật mới vào cơ sở dữ liệu Kho huyền bí.
              </p>
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="arrow_forward" className="text-primary" />
              </div>
            </div>
            <div className="bg-surface-container-highest/40 border border-outline-variant/10 p-6 rounded-xl relative group cursor-pointer hover:bg-surface-container-highest/60 transition-all">
              <Icon name="auto_fix_high" filled className="text-4xl text-tertiary mb-4" />
              <h3 className="text-lg font-headline font-bold text-on-surface uppercase tracking-tight">
                Cập nhật hàng loạt
              </h3>
              <p className="text-on-surface-variant text-sm font-body mt-2">
                Chỉnh chỉ số và hệ đồng minh trên nhiều hồ sơ cùng lúc.
              </p>
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="arrow_forward" className="text-tertiary" />
              </div>
            </div>
          </div>

          <div className="col-span-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-headline font-bold text-on-surface uppercase tracking-tight">
                Hệ đồng minh trội
              </h3>
              <button
                type="button"
                className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-2"
              >
                Xem tất cả hệ <Icon name="open_in_new" className="text-sm" />
              </button>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-4 bg-surface-container-low p-3 rounded-full pr-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-[0_0_15px_rgba(118,0,195,0.4)]">
                  <Icon name="magic_button" className="text-on-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-primary uppercase font-black tracking-widest">Pháp sư</p>
                  <p className="text-sm font-headline text-on-surface">Sổ grimoire của Archon</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-3 rounded-full pr-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tertiary-container to-tertiary flex items-center justify-center shadow-[0_0_15px_rgba(233,196,0,0.4)]">
                  <Icon name="swords" className="text-on-tertiary" />
                </div>
                <div>
                  <p className="text-[10px] text-tertiary uppercase font-black tracking-widest">Sát thủ</p>
                  <p className="text-sm font-headline text-on-surface">Đòn tàn nhẫn</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-3 rounded-full pr-8 opacity-50">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center">
                  <Icon name="shield" className="text-on-surface-variant" />
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Hộ vệ</p>
                  <p className="text-sm font-headline text-on-surface">Tường thép</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gridChampions.map((c) => (
                <AdminChampionTile key={c.id} champion={c} />
              ))}
            </div>
            {gridChampions.length === 0 && !loading && (
              <p className="text-on-surface-variant text-sm mt-4">Chưa tải được tướng nào.</p>
            )}
          </div>
        </div>
      </ApiStatus>
    </main>
  )
}

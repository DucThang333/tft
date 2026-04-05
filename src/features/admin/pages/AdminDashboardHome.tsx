import { Icon } from '../../../components/ui/Icon'
import { tftApi } from '../../../api/tftApi'
import { usePromiseData } from '../../../hooks/usePromiseData'
import { ApiStatus } from '../../../components/ui/ApiStatus'

export function AdminDashboardHome() {
  const { data: champions, loading, error } = usePromiseData(() => tftApi.champions(), [])
  const { data: meta } = usePromiseData(() => tftApi.metaOverview(), [])
  const count = champions?.length ?? 0

  return (
    <main className="flex-1 p-8 min-h-screen bg-background pb-28">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-tertiary font-label text-[10px] uppercase tracking-[0.2em]">Thánh địa</span>
          <Icon name="chevron_right" className="text-xs text-outline-variant" />
          <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em]">Bảng điều khiển</span>
        </div>
        <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight uppercase mb-2">
          Trung tâm chỉ huy
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-sm leading-relaxed">
          Tín hiệu tổng quan cho kho dữ liệu: quy mô danh sách tướng, ngữ cảnh bản cập nhật và lối tắt tới công cụ chi tiết.
        </p>
      </div>

      <ApiStatus loading={loading} error={error}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant/10">
            <Icon name="groups" className="text-3xl text-primary mb-4" />
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Tướng đã lập chỉ mục</p>
            <p className="text-3xl font-headline font-bold text-on-surface">{count}</p>
          </div>
          <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant/10">
            <Icon name="update" className="text-3xl text-tertiary mb-4" />
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Bản vá</p>
            <p className="text-3xl font-headline font-bold text-on-surface">{meta?.patchLabel ?? '—'}</p>
          </div>
          <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant/10 sm:col-span-2 lg:col-span-1">
            <Icon name="public" className="text-3xl text-on-surface-variant mb-4" />
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Khu vực</p>
            <p className="text-3xl font-headline font-bold text-on-surface">{meta?.region ?? '—'}</p>
          </div>
        </div>
      </ApiStatus>
    </main>
  )
}

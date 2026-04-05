import { Icon } from '../../../components/ui/Icon'

interface AdminPlaceholderPageProps {
  title: string
  subtitle?: string
}

export function AdminPlaceholderPage({ title, subtitle }: AdminPlaceholderPageProps) {
  return (
    <main className="flex-1 p-8 min-h-screen bg-background pb-28">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-tertiary font-label text-[10px] uppercase tracking-[0.2em]">Thánh địa</span>
          <Icon name="chevron_right" className="text-xs text-outline-variant" />
          <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em]">{title}</span>
        </div>
        <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight uppercase mb-2">
          {title}
        </h1>
        <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed">
          {subtitle ?? 'Khu vực thánh địa này dành cho bảng điều khiển và phân tích sắp tới.'}
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-low/50 p-12 text-center">
        <Icon name="construction" className="text-5xl text-on-surface-variant/50 mb-4 inline-block" />
        <p className="text-on-surface-variant text-sm">Đang xây dựng</p>
      </div>
    </main>
  )
}

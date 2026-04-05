import type { ReactNode } from 'react'

interface ApiStatusProps {
  loading: boolean
  error: Error | null
  children: ReactNode
}

export function ApiStatus({ loading, error, children }: ApiStatusProps) {
  if (loading) {
    return (
      <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">
        Đang tải…
      </p>
    )
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-on-surface">
        <p className="font-headline font-bold text-red-300 mb-2">Không tải được dữ liệu</p>
        <p className="text-sm text-on-surface-variant">{error.message}</p>
        <p className="text-xs text-on-surface-variant mt-4">
          Hãy khởi động Postgres và API (ví dụ <code className="text-tertiary">docker compose up</code> trong{' '}
          <code className="text-tertiary">tft_server/</code>), sau đó chạy{' '}
          <code className="text-tertiary">mix phx.server</code> hoặc <code className="text-tertiary">make app</code>.
        </p>
      </div>
    )
  }
  return <>{children}</>
}

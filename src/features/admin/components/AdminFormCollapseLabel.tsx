import type { ReactNode } from 'react'

export const ADMIN_FORM_COLLAPSE_CLASS = 'bg-surface-container-low/40 rounded-lg'

type Props = {
  title: string
  /** Hiển thị ngắn `filled/total`, đỏ nếu chưa đủ */
  filled?: number
  total?: number
  /** Khi không dùng filled/total (vd. starStats) */
  detail?: string
}

export function AdminFormCollapseLabel({ title, filled, total, detail }: Props): ReactNode {
  return (
    <span className="flex items-center w-full min-w-0 gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant truncate min-w-0 flex-1">
        {title}
      </span>
      {filled !== undefined && total !== undefined ? (
        <span
          className={`ml-auto text-xs tabular-nums font-semibold shrink-0 text-right min-w-[2.75rem] ${
            filled >= total ? 'text-tertiary' : 'text-error'
          }`}
        >
          {filled}/{total}
        </span>
      ) : detail ? (
        <span className="ml-auto text-xs tabular-nums shrink-0 text-right text-on-surface-variant/80 max-w-[45%] truncate">
          {detail}
        </span>
      ) : null}
    </span>
  )
}

export function AdminFormCardProgress({ filled, total }: { filled: number; total: number }) {
  const ok = filled >= total
  return (
    <span
      className={`text-xs tabular-nums font-semibold shrink-0 text-right min-w-[2.75rem] ${ok ? 'text-tertiary' : 'text-error'}`}
    >
      {filled}/{total}
    </span>
  )
}

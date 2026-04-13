import { Select } from 'antd'
import type { MetaDescriptionParamRow } from '../../../types'

export interface AdminMetaDescriptionParamsEditorProps {
  rows: MetaDescriptionParamRow[]
  onChange: (rows: MetaDescriptionParamRow[]) => void
  scalesWithSelectOptions: { value: string; label: string }[]
  scalesWithLoading?: boolean
}

function emptyRow(index: number): MetaDescriptionParamRow {
  return {
    paramKey: '',
    displayLabel: '',
    sampleValue: '',
    sortOrder: index,
  }
}

export function AdminMetaDescriptionParamsEditor({
  rows,
  onChange,
  scalesWithSelectOptions,
  scalesWithLoading = false,
}: AdminMetaDescriptionParamsEditorProps) {
  const setRow = (i: number, patch: Partial<MetaDescriptionParamRow>) => {
    onChange(
      rows.map((r, j) =>
        j === i
          ? {
              ...r,
              ...patch,
              sortOrder: patch.sortOrder ?? r.sortOrder ?? j,
            }
          : r,
      ),
    )
  }

  const add = () => onChange([...rows, emptyRow(rows.length)])

  const remove = (i: number) =>
    onChange(rows.filter((_, j) => j !== i).map((r, j) => ({ ...r, sortOrder: j })))

  return (
    <div className="space-y-4 pt-1">
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end border-b border-outline-variant/10 pb-4 last:border-0"
        >
          <label className="sm:col-span-3 space-y-1">
            <span className="text-[10px] text-on-surface-variant">paramKey</span>
            <input
              value={row.paramKey}
              onChange={(e) => setRow(i, { paramKey: e.target.value })}
              className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest px-2 py-2 text-xs font-mono"
            />
          </label>
          <label className="sm:col-span-3 space-y-1">
            <span className="text-[10px] text-on-surface-variant">displayLabel</span>
            <input
              value={row.displayLabel}
              onChange={(e) => setRow(i, { displayLabel: e.target.value })}
              className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest px-2 py-2 text-xs"
            />
          </label>
          <label className="sm:col-span-4 space-y-1">
            <span className="text-[10px] text-on-surface-variant">sampleValue</span>
            <input
              value={row.sampleValue}
              onChange={(e) => setRow(i, { sampleValue: e.target.value })}
              placeholder="vd. 180 hoặc 10%"
              className="w-full rounded border border-outline-variant/30 bg-surface-container-lowest px-2 py-2 text-xs font-mono"
            />
          </label>
          <label className="sm:col-span-2 space-y-1">
            <span className="text-[10px] text-on-surface-variant">scalesWith</span>
            <Select
              showSearch
              allowClear
              placeholder="Loại chỉ số"
              className="w-full"
              optionFilterProp="label"
              value={row.scalesWith ?? undefined}
              onChange={(v) =>
                setRow(i, {
                  scalesWith: typeof v === 'string' && v.trim() ? v.trim() : undefined,
                })
              }
              options={scalesWithSelectOptions}
              notFoundContent={scalesWithLoading ? 'Đang tải…' : 'Không có mục phù hợp.'}
            />
          </label>
          <button
            type="button"
            onClick={() => remove(i)}
            className="sm:col-span-12 text-[10px] font-bold uppercase text-error hover:underline text-left"
          >
            Xóa dòng
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
      >
        + Thêm tham số
      </button>
    </div>
  )
}

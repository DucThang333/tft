import { useId, useRef, type ChangeEvent } from 'react'

export interface ImageUrlUploadProps {
  value: string
  onChange: (dataUrlOrUrl: string) => void
  className?: string
  disabled?: boolean
}

/**
 * Chọn file ảnh → đọc thành data URL để gán `imageUrl` (backend vẫn nhận chuỗi URL).
 */
export function ImageUrlUpload({ value, onChange, className = '', disabled }: ImageUrlUploadProps) {
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const r = reader.result
      if (typeof r === 'string') onChange(r)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={disabled}
          onChange={onPickFile}
        />
        <label
          htmlFor={inputId}
          className={`inline-flex cursor-pointer items-center rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-high ${
            disabled ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          Chọn ảnh
        </label>
        {value ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange('')}
            className="text-[10px] font-bold uppercase tracking-widest text-error hover:underline disabled:opacity-50"
          >
            Xóa ảnh
          </button>
        ) : null}
      </div>
      <div>
        <input
          type="url"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Dán URL ảnh (https://...)"
          className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/60 disabled:opacity-50"
        />
      </div>
      {value ? (
        <img
          src={value}
          alt=""
          className="h-24 w-24 rounded-lg border border-outline-variant/20 object-cover"
        />
      ) : (
        <p className="text-xs text-on-surface-variant">Chưa có ảnh — chọn file từ máy.</p>
      )}
    </div>
  )
}

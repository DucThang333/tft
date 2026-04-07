import { useEffect, useMemo, useState } from 'react'
import { Input, Space, Typography } from 'antd'

export interface DescriptionTemplateFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  rows?: number
}

function extractTemplateKeys(text: string): string[] {
  const keys = new Set<string>()
  const re = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m[1]) keys.add(m[1])
  }
  return Array.from(keys)
}

export function DescriptionTemplateField({
  value,
  onChange,
  label = 'Mô tả',
  placeholder,
  rows = 5,
}: DescriptionTemplateFieldProps) {
  const keys = useMemo(() => extractTemplateKeys(value), [value])
  const [samples, setSamples] = useState<Record<string, string>>({})

  useEffect(() => {
    setSamples((prev) => {
      if (keys.length === 0) return {}
      const next: Record<string, string> = {}
      keys.forEach((k) => {
        next[k] = prev[k] ?? ''
      })
      return next
    })
  }, [keys])

  const preview = useMemo(() => {
    if (!value) return ''
    return value.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key: string) => {
      const sample = samples[key]
      return sample && sample.trim() ? sample : `{{${key}}}`
    })
  }, [samples, value])

  return (
    <Space direction="vertical" size="small" className="w-full">
      <div>
        <Typography.Text type="secondary" className="text-xs block mb-1">
          {label}
        </Typography.Text>
        <Input.TextArea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>

      <Typography.Text type="secondary" className="text-[11px]">
        Hỗ trợ template theo dạng <Typography.Text code>{'{{key}}'}</Typography.Text> (ví dụ:{' '}
        <Typography.Text code>{'{{damage}}'}</Typography.Text>,{' '}
        <Typography.Text code>{'{{duration}}'}</Typography.Text>).
      </Typography.Text>

      {keys.length > 0 ? (
        <div className="space-y-2 rounded-md border border-outline-variant/20 p-3 bg-surface-container-low/30">
          <Typography.Text className="text-xs font-semibold block">Tham số trong mô tả</Typography.Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {keys.map((k) => (
              <div key={k}>
                <Typography.Text type="secondary" className="text-[11px] block mb-1">
                  {k}
                </Typography.Text>
                <Input
                  value={samples[k] ?? ''}
                  onChange={(e) =>
                    setSamples((prev) => ({
                      ...prev,
                      [k]: e.target.value,
                    }))
                  }
                  placeholder={`Giá trị mẫu cho ${k}`}
                />
              </div>
            ))}
          </div>
          <div>
            <Typography.Text type="secondary" className="text-[11px] block mb-1">
              Preview
            </Typography.Text>
            <div className="rounded border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-xs whitespace-pre-wrap">
              {preview || '—'}
            </div>
          </div>
        </div>
      ) : null}
    </Space>
  )
}

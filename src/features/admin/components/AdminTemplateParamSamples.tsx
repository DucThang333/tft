import { Input, Typography } from 'antd'
import { useMemo } from 'react'
import { extractDescriptionTemplateKeys } from '../../../utils/descriptionTemplateKeys'

export interface AdminTemplateParamSamplesProps {
  /** HTML mô tả hiện tại — quét `{{key}}`. */
  sourceHtml: string
  samples: Record<string, string>
  onSamplesChange: (next: Record<string, string>) => void
  /** Key đã khai báo trong bảng tham số có cấu trúc — ẩn khỏi lưới mẫu. */
  excludeStructuredKeys?: Set<string>
  className?: string
}

/**
 * Ô nhập giá trị mẫu cho từng `{{key}}` xuất hiện trong mô tả (dùng cho xem trước; không gửi lên API).
 */
export function AdminTemplateParamSamples({
  sourceHtml,
  samples,
  onSamplesChange,
  excludeStructuredKeys,
  className = '',
}: AdminTemplateParamSamplesProps) {
  const keys = useMemo(() => {
    let all = extractDescriptionTemplateKeys(sourceHtml)
    if (excludeStructuredKeys?.size) {
      all = all.filter((k) => !excludeStructuredKeys.has(k))
    }
    return all
  }, [sourceHtml, excludeStructuredKeys])
  if (keys.length === 0) return null

  return (
    <div
      className={`space-y-2 rounded-md border border-outline-variant/20 p-3 bg-surface-container-low/30 ${className}`}
    >
      <Typography.Text className="text-xs font-semibold block text-on-surface">
        Tham số <Typography.Text code>{'{{key}}'}</Typography.Text> trong mô tả
      </Typography.Text>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {keys.map((k) => (
          <div key={k}>
            <Typography.Text type="secondary" className="text-[11px] block mb-1 font-mono">
              {`{{${k}}}`}
            </Typography.Text>
            <Input
              size="small"
              value={samples[k] ?? ''}
              onChange={(e) =>
                onSamplesChange({
                  ...samples,
                  [k]: e.target.value,
                })
              }
              placeholder={`Mẫu cho ${k}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

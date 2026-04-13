import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type {
  ChampionSkillParamRow,
  MetaDescriptionParamRow,
  ScalesWithValueFormat,
} from '../../../types'
import { SkillDescriptionEditor } from '../../../components/editor/SkillDescriptionEditor'
import {
  applyDescriptionTemplateSamples,
  extractDescriptionTemplateKeys,
} from '../../../utils/descriptionTemplateKeys'
import { renderSkillDescriptionContent } from '../../champions/utils/skillTemplate'
import { AdminDescriptionPreviewCard } from './AdminDescriptionPreviewCard'
import { AdminTemplateParamSamples } from './AdminTemplateParamSamples'

function metaRowToSkillRow(r: MetaDescriptionParamRow): ChampionSkillParamRow {
  return {
    paramKey: r.paramKey,
    displayLabel: r.displayLabel,
    starValues: [],
    scalesWith: r.scalesWith,
    sortOrder: r.sortOrder,
    sampleValue: r.sampleValue,
  }
}

export interface AdminRichDescriptionSectionProps {
  /** Nhãn block (uppercase nhỏ, giống “Kỹ năng (skill)” trên form tướng). */
  sectionTitle?: string
  value: string
  onChange: (html: string) => void
  /** Đổi khi chọn entity khác để TipTap remount đúng nội dung. */
  editorKey?: string | number
  disabled?: boolean
  previewTabLabel?: string
  previewTitle: string
  previewSubtitle?: string
  previewImageUrl?: string
  previewRightSlot?: ReactNode
  className?: string
  /**
   * Khi truyền (kể cả `[]`): preview dùng render kiểu kỹ năng + chân danh sách tham số;
   * ô mẫu `{{key}}` chỉ cho key chưa khai báo trong bảng.
   */
  structuredDescriptionParams?: MetaDescriptionParamRow[]
  scalesWithIconById?: Record<string, string>
  scalesWithTextColorById?: Record<string, string>
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>
}

/**
 * Editor TipTap + panel xem trước 2 cột (layout giống khối mô tả kỹ năng ở Admin tướng).
 * Dùng cho mô tả HTML trên các tab Dữ liệu meta (tộc/hệ, vai trò, trang bị, lõi, kỳ ngộ, …).
 */
export function AdminRichDescriptionSection({
  sectionTitle = 'Mô tả',
  value,
  onChange,
  editorKey,
  disabled = false,
  previewTabLabel,
  previewTitle,
  previewSubtitle,
  previewImageUrl,
  previewRightSlot,
  className = '',
  structuredDescriptionParams,
  scalesWithIconById,
  scalesWithTextColorById,
  scalesWithValueFormatById,
}: AdminRichDescriptionSectionProps) {
  const [templateSamples, setTemplateSamples] = useState<Record<string, string>>({})

  const structuredRowKeys = useMemo(() => {
    if (structuredDescriptionParams === undefined) return undefined
    return new Set(structuredDescriptionParams.map((p) => p.paramKey.trim()).filter(Boolean))
  }, [structuredDescriptionParams])

  const orphanTemplateKeys = useMemo(() => {
    let keys = extractDescriptionTemplateKeys(value)
    if (structuredRowKeys) {
      keys = keys.filter((k) => !structuredRowKeys.has(k))
    }
    return keys.sort()
  }, [value, structuredRowKeys])

  const orphanKeysSig = orphanTemplateKeys.join('\0')

  useEffect(() => {
    setTemplateSamples((prev) => {
      if (orphanTemplateKeys.length === 0) return {}
      const next: Record<string, string> = {}
      orphanTemplateKeys.forEach((k) => {
        next[k] = prev[k] ?? ''
      })
      return next
    })
  }, [orphanKeysSig])

  const previewProcessedHtml = useMemo(
    () => applyDescriptionTemplateSamples(value, templateSamples),
    [value, templateSamples],
  )

  const mappedSkillParams = useMemo(() => {
    if (structuredDescriptionParams === undefined) return undefined
    return structuredDescriptionParams.map(metaRowToSkillRow)
  }, [structuredDescriptionParams])

  const richBody =
    mappedSkillParams !== undefined
      ? renderSkillDescriptionContent(previewProcessedHtml, mappedSkillParams, {
          scalesWithIconById,
          scalesWithTextColorById,
          scalesWithValueFormatById,
        })
      : undefined

  const showOrphanSamples =
    structuredDescriptionParams !== undefined
      ? orphanTemplateKeys.length > 0
      : extractDescriptionTemplateKeys(value).length > 0

  return (
    <div className={`space-y-2 ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">
        {sectionTitle}
      </span>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div className="min-w-0 space-y-0">
          <SkillDescriptionEditor
            key={editorKey ?? 'rich-desc'}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
          {showOrphanSamples ? (
            <AdminTemplateParamSamples
              sourceHtml={value}
              samples={templateSamples}
              onSamplesChange={setTemplateSamples}
              excludeStructuredKeys={structuredRowKeys}
              className="mt-3"
            />
          ) : null}
        </div>
        <AdminDescriptionPreviewCard
          tabLabel={previewTabLabel}
          title={previewTitle}
          subtitle={previewSubtitle}
          imageUrl={previewImageUrl}
          rightSlot={previewRightSlot}
          html={previewProcessedHtml}
          richBody={richBody}
          footerParams={mappedSkillParams}
          scalesWithIconById={scalesWithIconById}
          scalesWithTextColorById={scalesWithTextColorById}
          scalesWithValueFormatById={scalesWithValueFormatById}
        />
      </div>
    </div>
  )
}

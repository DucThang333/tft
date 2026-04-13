import DOMPurify from 'dompurify'
import parse from 'html-react-parser'
import type { ReactNode } from 'react'
import type { ChampionSkillParamRow, ScalesWithValueFormat } from '../../../types'
import { ensureSkillDescriptionHtml } from '../../../components/editor/skillDescriptionHtml'
import {
  MagicDamageIcon,
  PhysicalDamageIcon,
  ShieldStatIcon,
  SparkleCountIcon,
} from '../../champions/components/skill/DamageTypeIcons'
import {
  damageVisualKind,
  formatSkillParamDisplayValue,
  paramValueTextStyle,
  statIconClass,
} from '../../champions/utils/skillTemplate'

function sanitizeRichHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      's',
      'strike',
      'del',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  })
}

function sortedFooterParams(params: ChampionSkillParamRow[]) {
  return [...params].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

function footerValueText(
  p: ChampionSkillParamRow,
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>,
): string {
  return formatSkillParamDisplayValue(p, scalesWithValueFormatById)
}

function iconForFooterRow(
  kind: ReturnType<typeof damageVisualKind>,
  customUrl?: string,
): ReactNode {
  const u = customUrl?.trim()
  if (u) {
    return <img src={u} alt="" className="h-4 w-4 object-contain shrink-0" />
  }
  const cls = `shrink-0 ${statIconClass(kind)}`
  switch (kind) {
    case 'magic':
      return <MagicDamageIcon className={cls} />
    case 'physical':
      return <PhysicalDamageIcon className={cls} />
    case 'shield':
      return <ShieldStatIcon className={cls} />
    case 'count':
      return <SparkleCountIcon className={cls} />
    default:
      return <MagicDamageIcon className={cls} />
  }
}

export interface AdminDescriptionPreviewCardProps {
  /** Nhãn thanh trên (mặc định giống vibe tab “Kỹ Năng”). */
  tabLabel?: string
  /** Tiêu đề trong khung xem trước (vd. tên entity). */
  title: string
  subtitle?: string
  imageUrl?: string
  rightSlot?: ReactNode
  /** HTML đã xử lý placeholder (khi không dùng `richBody`). */
  html: string
  /** Nếu có: nội dung mô tả render kiểu kỹ năng (màu + icon theo tham số). */
  richBody?: ReactNode
  /** Danh sách chân preview (nhãn + giá trị mẫu), giống tab kỹ năng. */
  footerParams?: ChampionSkillParamRow[]
  scalesWithIconById?: Record<string, string>
  scalesWithTextColorById?: Record<string, string>
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>
  className?: string
}

/**
 * Khung xem trước HTML (màu nền / viền giống `SkillDescriptionPanel` — tab mô tả).
 */
export function AdminDescriptionPreviewCard({
  tabLabel = 'Xem trước',
  title,
  subtitle,
  imageUrl,
  rightSlot,
  html,
  richBody,
  footerParams,
  scalesWithIconById,
  scalesWithTextColorById,
  scalesWithValueFormatById,
  className = '',
}: AdminDescriptionPreviewCardProps) {
  const safe = sanitizeRichHtml(ensureSkillDescriptionHtml(html))
  const showHeader = Boolean(imageUrl || title.trim() || subtitle?.trim() || rightSlot)
  const footerOrdered = footerParams?.length ? sortedFooterParams(footerParams) : []

  return (
    <div
      className={`rounded-lg border border-white/10 bg-[#1a1d24] text-[#c8cdd0] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden min-w-0 ${className}`}
    >
      <div className="flex border-b border-white/10">
        <div
          className={
            'flex-1 py-2.5 text-[13px] font-semibold tracking-wide text-on-surface ' +
            'border-b-2 border-[#C8AA6E] -mb-px bg-black/20 text-center sm:text-left sm:pl-3.5'
          }
        >
          {tabLabel}
        </div>
      </div>

      <div className="p-3.5 space-y-3">
        {showHeader ? (
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-md border border-white/15 bg-black/35 overflow-hidden shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/5" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-on-surface leading-snug pr-2">
                  {title.trim() || '—'}
                </h3>
                {subtitle?.trim() ? (
                  <p className="text-[11px] text-on-surface/55 mt-0.5">{subtitle}</p>
                ) : null}
              </div>
              {rightSlot ? <div className="shrink-0 flex items-center gap-1">{rightSlot}</div> : null}
            </div>
          </div>
        ) : null}

        {richBody != null ? (
          <div className="text-[13px] leading-relaxed text-[#b8bec4] [&_.inline-flex]:align-middle [&_a]:text-[#6BB3E0] [&_a]:underline [&_a]:underline-offset-2">
            {richBody}
          </div>
        ) : (
          <div className="text-[13px] leading-relaxed text-[#b8bec4] [&_.inline-flex]:align-middle [&_a]:text-[#6BB3E0] [&_a]:underline [&_a]:underline-offset-2">
            {parse(safe)}
          </div>
        )}

        {footerOrdered.length > 0 ? (
          <>
            <div className="h-px bg-white/10" />
            <ul className="space-y-2.5">
              {footerOrdered.map((p, idx) => {
                const kind = damageVisualKind(p.scalesWith)
                const sw = p.scalesWith?.trim()
                const customIcon =
                  sw && scalesWithIconById?.[sw]?.trim() ? scalesWithIconById[sw].trim() : undefined
                const valStyle = paramValueTextStyle(p.scalesWith, kind, scalesWithTextColorById)
                const label = p.displayLabel?.trim() || p.paramKey
                return (
                  <li
                    key={`${idx}-${p.paramKey || 'row'}`}
                    className="flex items-start justify-between gap-3 text-[12px]"
                  >
                    <span className="text-on-surface/75 font-medium shrink-0">{label}</span>
                    <span className="flex items-center gap-1.5 justify-end text-right min-w-0">
                      <span className={valStyle.className} style={valStyle.style}>
                        {footerValueText(p, scalesWithValueFormatById)}
                      </span>
                      {iconForFooterRow(kind, customIcon)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  )
}

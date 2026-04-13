import DOMPurify from 'dompurify'
import parse, { type HTMLReactParserOptions } from 'html-react-parser'
import type { CSSProperties, ReactNode } from 'react'
import type { ChampionSkillParamRow, ScalesWithValueFormat } from '../../../types'
import {
  MagicDamageIcon,
  PhysicalDamageIcon,
  ShieldStatIcon,
  SparkleCountIcon,
} from '../components/skill/DamageTypeIcons'

const TFT_INTERP = 'data-tft-interp'
/** Sát thương kết hợp: tổng (AD + AP) + hai icon — `{{sum:key_ad:key_ap}}` */
const TFT_SUM = 'data-tft-sum'
/** Dòng chi tiết: `số AD (icon) + số AP (icon)` — `{{sum_breakdown:key_ad:key_ap}}` */
const TFT_SUM_BREAKDOWN = 'data-tft-sum-breakdown'

/** Cho phép ngoặc ASCII hoặc ngoặc fullwidth (bàn phím / paste). */
const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}|\uFF5B\uFF5B\s*([a-zA-Z0-9_]+)\s*\uFF5D\uFF5D/g

function normalizePlaceholderKey(key: string): string {
  return key.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
}

export type DamageVisualKind = 'magic' | 'physical' | 'shield' | 'count' | 'neutral'

export function damageVisualKind(scalesWith?: string | null): DamageVisualKind {
  const s = (scalesWith ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (!s) return 'neutral'
  if (
    s === 'ability_power' ||
    s === 'ap' ||
    s === 'magic' ||
    s === 'spell' ||
    s === 'magic_resist' ||
    s === 'mr'
  ) {
    return 'magic'
  }
  if (
    s === 'attack_damage' ||
    s === 'ad' ||
    s === 'physical' ||
    s === 'bonus_ad' ||
    s === 'armor'
  ) {
    return 'physical'
  }
  if (
    s === 'health' ||
    s === 'max_health' ||
    s === 'bonus_health' ||
    s === 'shield' ||
    s === 'max_hp'
  ) {
    return 'shield'
  }
  if (s === 'count' || s === 'stacks' || s === 'units') return 'count'
  return 'neutral'
}

export function statTextClass(kind: DamageVisualKind): string {
  switch (kind) {
    case 'magic':
      return 'text-[#7EC8E3] font-semibold'
    case 'physical':
      return 'text-[#E6A04D] font-semibold'
    case 'shield':
      return 'text-[#C8AA6E] font-semibold'
    case 'count':
      return 'text-[#E0C878] font-semibold'
    default:
      return 'text-[#BCD4E6] font-medium'
  }
}

const HEX_COLOR_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

function normalizeHexColorForCss(raw: string): string | null {
  const t = raw.trim()
  if (!t || !HEX_COLOR_RE.test(t)) return null
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1]!
    const g = t[2]!
    const b = t[3]!
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return t.toLowerCase()
}

export type CombinedSumMainSide = 'first' | 'second' | null

export function pickValueFormat(
  scalesWith: string | null | undefined,
  map?: Record<string, ScalesWithValueFormat>,
): ScalesWithValueFormat {
  const sw = scalesWith?.trim()
  if (!sw || !map) return 'flat'
  return map[sw] === 'percent' ? 'percent' : 'flat'
}

export function appendPercentIfFormat(s: string, format: ScalesWithValueFormat): string {
  if (format !== 'percent') return s
  const t = s.trim()
  if (!t || t === '—') return t
  if (t.endsWith('%')) return t
  return `${t}%`
}

/** Màu số: ưu tiên `textColor` meta scales-with (hex), không thì theo loại chỉ số. */
export function paramValueTextStyle(
  scalesWith: string | null | undefined,
  kind: DamageVisualKind,
  scalesWithTextColorById?: Record<string, string>,
): { className: string; style?: CSSProperties } {
  const sw = scalesWith?.trim()
  const raw = sw && scalesWithTextColorById?.[sw]?.trim()
  const hex = raw ? normalizeHexColorForCss(raw) : null
  if (hex) {
    return { className: 'font-semibold tabular-nums', style: { color: hex } }
  }
  return { className: `${statTextClass(kind)} tabular-nums` }
}

function parseTftSumDataAttr(raw: string): {
  keyAd: string
  keyAp: string
  main: CombinedSumMainSide
} {
  const parts = raw.split('|')
  const keyAd = (parts[0] ?? '').trim()
  const keyAp = (parts[1] ?? '').trim()
  let main: CombinedSumMainSide = null
  const third = (parts[2] ?? '').trim().toLowerCase()
  if (third === '1' || third === 'first') main = 'first'
  else if (third === '2' || third === 'second') main = 'second'
  return { keyAd, keyAp, main }
}

export function statIconClass(kind: DamageVisualKind): string {
  switch (kind) {
    case 'magic':
      return 'text-[#7EC8E3]'
    case 'physical':
      return 'text-[#E6A04D]'
    case 'shield':
      return 'text-[#6BB3FF]'
    case 'count':
      return 'text-on-surface/90'
    default:
      return 'text-[#9EB8CC]'
  }
}

function StatIconForKind({ kind }: { kind: DamageVisualKind }) {
  const cls = statIconClass(kind)
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

export function formatStarValuesSlash(
  values: number[],
  format: ScalesWithValueFormat = 'flat',
): string {
  if (!values.length) return '—'
  const core = values
    .map((n) => {
      if (Number.isInteger(n)) return String(n)
      const t = n.toFixed(2)
      return t.replace(/\.?0+$/, '')
    })
    .join('/')
  return appendPercentIfFormat(core, format)
}

/** Giá trị hiển thị cho một tham số (sample hoặc starValues), kèm % nếu meta scales-with là percent. */
export function formatSkillParamDisplayValue(
  param: ChampionSkillParamRow | undefined,
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>,
): string {
  if (!param) return '—'
  const fmt = pickValueFormat(param.scalesWith, scalesWithValueFormatById)
  const sample = param.sampleValue?.trim()
  if (sample) return appendPercentIfFormat(sample, fmt)
  return formatStarValuesSlash(param.starValues ?? [], fmt)
}

function paramByKeyMap(params: ChampionSkillParamRow[]): Map<string, ChampionSkillParamRow> {
  const m = new Map<string, ChampionSkillParamRow>()
  for (const p of params) {
    const raw = p.paramKey.trim()
    if (!raw) continue
    const nk = normalizePlaceholderKey(raw)
    m.set(raw, p)
    if (nk !== raw) m.set(nk, p)
  }
  return m
}

function lookupParam(map: Map<string, ChampionSkillParamRow>, key: string): ChampionSkillParamRow | undefined {
  return map.get(key) ?? map.get(normalizePlaceholderKey(key))
}

/** Chuỗi số theo sao từ `starValues` hoặc parse `sampleValue` (vd. 460/690/1035). */
export function numericValuesFromSkillParam(param?: ChampionSkillParamRow): number[] {
  if (!param) return []
  const sample = param.sampleValue?.trim()
  if (sample) {
    const parts = sample.split(/[/,，;]/).map((s) => Number(String(s).trim()))
    return parts.filter((n) => !Number.isNaN(n))
  }
  return [...(param.starValues ?? [])]
}

function sumPerStar(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length)
  if (len === 0) return []
  return Array.from({ length: len }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0))
}

function ScalesWithIconInline({
  scalesWith,
  kind,
  scalesWithIconById,
  sizeClass = 'h-3.5 w-3.5',
}: {
  scalesWith?: string | null
  kind: DamageVisualKind
  scalesWithIconById?: Record<string, string>
  sizeClass?: string
}) {
  const sw = scalesWith?.trim()
  const custom = sw && scalesWithIconById?.[sw]?.trim() ? scalesWithIconById[sw].trim() : undefined
  if (custom) {
    return <img src={custom} alt="" className={`${sizeClass} object-contain shrink-0`} />
  }
  return <StatIconForKind kind={kind} />
}

function CombinedSumTotalSpan({
  keyAd,
  keyAp,
  map,
  main = null,
  scalesWithIconById,
  scalesWithTextColorById,
  scalesWithValueFormatById,
}: {
  keyAd: string
  keyAp: string
  map: Map<string, ChampionSkillParamRow>
  main?: CombinedSumMainSide
  scalesWithIconById?: Record<string, string>
  scalesWithTextColorById?: Record<string, string>
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>
}) {
  const pAd = lookupParam(map, keyAd)
  const pAp = lookupParam(map, keyAp)
  const vAd = numericValuesFromSkillParam(pAd)
  const vAp = numericValuesFromSkillParam(pAp)
  const sums = sumPerStar(vAd, vAp)
  const fmtTotal: ScalesWithValueFormat =
    main === 'first'
      ? pickValueFormat(pAd?.scalesWith, scalesWithValueFormatById)
      : main === 'second'
        ? pickValueFormat(pAp?.scalesWith, scalesWithValueFormatById)
        : 'flat'
  const text =
    sums.length > 0
      ? formatStarValuesSlash(sums, fmtTotal)
      : !pAd && !pAp
        ? main
          ? `{{sum:${keyAd}:${keyAp}:${main === 'first' ? '1' : '2'}}}`
          : `{{sum:${keyAd}:${keyAp}}}`
        : '—'
  const kindAd = damageVisualKind(pAd?.scalesWith)
  const kindAp = damageVisualKind(pAp?.scalesWith)

  const mainParam = main === 'first' ? pAd : main === 'second' ? pAp : undefined
  const mainKind = mainParam ? damageVisualKind(mainParam.scalesWith) : 'neutral'
  const totalFromMain =
    main && mainParam
      ? paramValueTextStyle(mainParam.scalesWith, mainKind, scalesWithTextColorById)
      : null

  return (
    <span className="inline-flex items-baseline gap-0.5 flex-wrap">
      <span
        className={totalFromMain?.className ?? 'text-[#e8eaed] font-semibold tabular-nums'}
        style={totalFromMain?.style}
      >
        {text}
      </span>
      {pAd || pAp ? (
        <span className="inline-flex items-center gap-0.5 text-on-surface/70 text-[11px] font-normal translate-y-[1px]">
          <span aria-hidden>(</span>
          <ScalesWithIconInline
            scalesWith={pAd?.scalesWith}
            kind={kindAd}
            scalesWithIconById={scalesWithIconById}
          />
          <ScalesWithIconInline
            scalesWith={pAp?.scalesWith}
            kind={kindAp}
            scalesWithIconById={scalesWithIconById}
          />
          <span aria-hidden>)</span>
        </span>
      ) : null}
    </span>
  )
}

function CombinedSumBreakdownSpan({
  keyAd,
  keyAp,
  map,
  scalesWithIconById,
  scalesWithTextColorById,
  scalesWithValueFormatById,
}: {
  keyAd: string
  keyAp: string
  map: Map<string, ChampionSkillParamRow>
  scalesWithIconById?: Record<string, string>
  scalesWithTextColorById?: Record<string, string>
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>
}) {
  const pAd = lookupParam(map, keyAd)
  const pAp = lookupParam(map, keyAp)
  const vAd = numericValuesFromSkillParam(pAd)
  const vAp = numericValuesFromSkillParam(pAp)
  const fmtAd = pickValueFormat(pAd?.scalesWith, scalesWithValueFormatById)
  const fmtAp = pickValueFormat(pAp?.scalesWith, scalesWithValueFormatById)
  const tAd = vAd.length ? formatStarValuesSlash(vAd, fmtAd) : '—'
  const tAp = vAp.length ? formatStarValuesSlash(vAp, fmtAp) : '—'
  const kindAd = damageVisualKind(pAd?.scalesWith)
  const kindAp = damageVisualKind(pAp?.scalesWith)
  const styleAd = paramValueTextStyle(pAd?.scalesWith, kindAd, scalesWithTextColorById)
  const styleAp = paramValueTextStyle(pAp?.scalesWith, kindAp, scalesWithTextColorById)

  return (
    <span className="inline-flex flex-col items-start gap-0.5 align-baseline max-w-full">
      <span className="text-[11px] leading-snug text-on-surface/65 inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
        <span className={styleAd.className} style={styleAd.style}>
          {tAd}
        </span>
        <span className="inline-flex items-center gap-0.5 shrink-0">
          <span aria-hidden>(</span>
          <ScalesWithIconInline
            scalesWith={pAd?.scalesWith}
            kind={kindAd}
            scalesWithIconById={scalesWithIconById}
          />
          <span aria-hidden>)</span>
        </span>
        <span className="text-on-surface/45 font-medium px-0.5">+</span>
        <span className={styleAp.className} style={styleAp.style}>
          {tAp}
        </span>
        <span className="inline-flex items-center gap-0.5 shrink-0">
          <span aria-hidden>(</span>
          <ScalesWithIconInline
            scalesWith={pAp?.scalesWith}
            kind={kindAp}
            scalesWithIconById={scalesWithIconById}
          />
          <span aria-hidden>)</span>
        </span>
      </span>
    </span>
  )
}

/** Thay `{{sum:…}}` / `{{sum_breakdown:…}}` bằng span marker trước khi xử lý `{{param}}`. */
function injectSpecialMarkersString(html: string): string {
  return html
    .replace(
      /\{\{\s*sum_breakdown\s*:\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*\}\}/gi,
      (_, k1: string, k2: string) => `<span ${TFT_SUM_BREAKDOWN}="${k1}|${k2}"></span>`,
    )
    .replace(
      /\{\{\s*sum\s*:\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*(?::\s*(1|2|first|second))?\s*\}\}/gi,
      (_full, k1: string, k2: string, mainRaw: string | undefined) => {
        const m = (mainRaw ?? '').trim().toLowerCase()
        const tail =
          m === '1' || m === 'first' ? '|1' : m === '2' || m === 'second' ? '|2' : ''
        return `<span ${TFT_SUM}="${k1}|${k2}${tail}"></span>`
      },
    )
}

function ParamInterpSpan({
  paramKey,
  param,
  scalesWithIconById,
  scalesWithTextColorById,
  scalesWithValueFormatById,
}: {
  paramKey: string
  param?: ChampionSkillParamRow
  scalesWithIconById?: Record<string, string>
  scalesWithTextColorById?: Record<string, string>
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>
}) {
  const kind = damageVisualKind(param?.scalesWith)
  const text = param
    ? formatSkillParamDisplayValue(param, scalesWithValueFormatById)
    : `{{${paramKey}}}`
  const sw = param?.scalesWith?.trim()
  const customIcon =
    sw && scalesWithIconById?.[sw]?.trim() ? scalesWithIconById[sw].trim() : undefined
  const valStyle = paramValueTextStyle(param?.scalesWith, kind, scalesWithTextColorById)
  return (
    <span className="inline-flex items-baseline gap-0.5 flex-wrap">
      <span className={valStyle.className} style={valStyle.style}>
        {text}
      </span>
      {param ? (
        <span className="inline-flex items-center gap-0.5 text-on-surface/70 text-[11px] font-normal translate-y-[1px]">
          <span aria-hidden>(</span>
          {customIcon ? (
            <img src={customIcon} alt="" className="h-3.5 w-3.5 object-contain shrink-0" />
          ) : (
            <StatIconForKind kind={kind} />
          )}
          <span aria-hidden>)</span>
        </span>
      ) : null}
    </span>
  )
}

function sanitizeSkillDescriptionHtml(html: string): string {
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
    ADD_ATTR: [TFT_INTERP, TFT_SUM, TFT_SUM_BREAKDOWN],
  })
}

/** Replace trên chuỗi — dùng khi không có DOM (SSR) hoặc fallback. */
function injectParamMarkersString(html: string): string {
  const withSpecial = injectSpecialMarkersString(html)
  return withSpecial.replace(PLACEHOLDER, (_, asciiKey: string | undefined, wideKey: string | undefined) => {
    const key = asciiKey ?? wideKey ?? ''
    return `<span ${TFT_INTERP}="${key}"></span>`
  })
}

/**
 * DOM trình duyệt + TreeWalker (cùng document). Lặp + normalize() để gộp text node do TipTap tách.
 */
function injectParamMarkersInLiveDom(html: string): string {
  if (typeof document === 'undefined') {
    return injectParamMarkersString(html)
  }

  const host = document.createElement('div')
  host.innerHTML = injectSpecialMarkersString(html)

  const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}|\uFF5B\uFF5B\s*([a-zA-Z0-9_]+)\s*\uFF5D\uFF5D/g

  const processRound = (): boolean => {
    host.normalize()
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT)
    const batch: Text[] = []
    let n: Node | null = walker.nextNode()
    while (n) {
      batch.push(n as Text)
      n = walker.nextNode()
    }

    let changed = false
    for (const textNode of batch) {
      if (!textNode.parentNode) continue
      const text = textNode.nodeValue ?? ''
      if (!text.includes('{') && !text.includes('\uFF5B')) continue
      re.lastIndex = 0
      if (!re.test(text)) continue
      re.lastIndex = 0
      changed = true

      const fragment = document.createDocumentFragment()
      let last = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) {
          fragment.appendChild(document.createTextNode(text.slice(last, m.index)))
        }
        const key = (m[1] ?? m[2] ?? '').trim()
        const span = document.createElement('span')
        span.setAttribute(TFT_INTERP, key)
        fragment.appendChild(span)
        last = re.lastIndex
      }
      if (last < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(last)))
      }
      textNode.parentNode.replaceChild(fragment, textNode)
    }
    return changed
  }

  for (let i = 0; i < 10 && processRound(); i += 1) {
    // cho tới khi không còn placeholder trong text node
  }

  return host.innerHTML
}

function buildHtmlParserOptions(
  params: ChampionSkillParamRow[],
  scalesWithIconById?: Record<string, string>,
  scalesWithTextColorById?: Record<string, string>,
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>,
): HTMLReactParserOptions {
  const map = paramByKeyMap(params)
  let seq = 0
  return {
    replace(domNode) {
      // Không dùng instanceof Element từ domhandler — bundler có thể nhân đôi package → replace không bao giờ chạy.
      if (typeof domNode !== 'object' || domNode === null || !('type' in domNode)) return undefined
      const node = domNode as { type?: string; name?: string; attribs?: Record<string, string> }
      if (node.type !== 'tag' || (node.name !== 'span' && node.name !== 'SPAN')) return undefined
      const attribs = node.attribs ?? {}
      const sumPair = attribs[TFT_SUM] ?? attribs['data-tft-sum']
      if (sumPair) {
        const { keyAd, keyAp, main } = parseTftSumDataAttr(sumPair)
        if (keyAd && keyAp) {
          seq += 1
          return (
            <CombinedSumTotalSpan
              key={`sum-${keyAd}-${keyAp}-${seq}`}
              keyAd={keyAd}
              keyAp={keyAp}
              main={main}
              map={map}
              scalesWithIconById={scalesWithIconById}
              scalesWithTextColorById={scalesWithTextColorById}
              scalesWithValueFormatById={scalesWithValueFormatById}
            />
          )
        }
      }
      const brPair = attribs[TFT_SUM_BREAKDOWN] ?? attribs['data-tft-sum-breakdown']
      if (brPair) {
        const [k1, k2] = brPair.split('|')
        if (k1 && k2) {
          seq += 1
          return (
            <CombinedSumBreakdownSpan
              key={`sumbr-${k1}-${k2}-${seq}`}
              keyAd={k1}
              keyAp={k2}
              map={map}
              scalesWithIconById={scalesWithIconById}
              scalesWithTextColorById={scalesWithTextColorById}
              scalesWithValueFormatById={scalesWithValueFormatById}
            />
          )
        }
      }
      const key = attribs[TFT_INTERP] ?? attribs['data-tft-interp']
      if (!key) return undefined
      seq += 1
      const param = lookupParam(map, key)
      return (
        <ParamInterpSpan
          key={`${key}-${seq}`}
          paramKey={key}
          param={param}
          scalesWithIconById={scalesWithIconById}
          scalesWithTextColorById={scalesWithTextColorById}
          scalesWithValueFormatById={scalesWithValueFormatById}
        />
      )
    },
  }
}

export type SkillDescriptionRenderOpts = {
  /** id scalesWith → URL icon (từ meta scales-with). */
  scalesWithIconById?: Record<string, string>
  /** id scalesWith → màu chữ số (#RGB / #RRGGBB) từ meta scales-with. */
  scalesWithTextColorById?: Record<string, string>
  /** id scalesWith → hiển thị số dạng phần trăm (thêm % cuối) hay số thường. */
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>
}

/**
 * Plain text hoặc HTML (TipTap): chèn {{param_key}} thành số màu + icon.
 */
export function renderSkillDescriptionContent(
  template: string,
  params: ChampionSkillParamRow[],
  opts?: SkillDescriptionRenderOpts,
): ReactNode {
  const scalesWithIconById = opts?.scalesWithIconById
  const scalesWithTextColorById = opts?.scalesWithTextColorById
  const scalesWithValueFormatById = opts?.scalesWithValueFormatById
  const raw = template ?? ''
  const trimmed = raw.trim()
  if (!trimmed) return '—'
  if (!/<[a-z][\s/>]/i.test(trimmed)) {
    return (
      <>
        {renderInterpolatedSkillDescription(
          raw,
          params,
          scalesWithIconById,
          scalesWithTextColorById,
          scalesWithValueFormatById,
        )}
      </>
    )
  }
  const safe = sanitizeSkillDescriptionHtml(raw)
  const afterDom = injectParamMarkersInLiveDom(safe)
  const marked = injectParamMarkersString(afterDom)
  return (
    <div className="skill-desc-html space-y-1 [&_a]:text-[#6BB3E0] [&_a]:underline [&_a]:underline-offset-2">
      {parse(
        marked,
        buildHtmlParserOptions(
          params,
          scalesWithIconById,
          scalesWithTextColorById,
          scalesWithValueFormatById,
        ),
      )}
    </div>
  )
}

/**
 * Chèn {{param_key}} bằng chuỗi số có màu + icon loại chỉ số (theo scalesWith) — nội dung thuần text.
 */
export function renderInterpolatedSkillDescription(
  template: string,
  params: ChampionSkillParamRow[],
  scalesWithIconById?: Record<string, string>,
  scalesWithTextColorById?: Record<string, string>,
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>,
): ReactNode[] {
  const map = paramByKeyMap(params)
  const nodes: ReactNode[] = []
  let i = 0
  let keyIndex = 0

  while (i < template.length) {
    const rest = template.slice(i)
    const mBr = /^\{\{\s*sum_breakdown\s*:\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*\}\}/i.exec(rest)
    const mSum =
      /^\{\{\s*sum\s*:\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*(?::\s*(1|2|first|second))?\s*\}\}/i.exec(
        rest,
      )
    const mWide = /^\uFF5B\uFF5B\s*([a-zA-Z0-9_]+)\s*\uFF5D\uFF5D/.exec(rest)
    const mPlain = /^\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/.exec(rest)
    if (mBr) {
      keyIndex += 1
      nodes.push(
        <CombinedSumBreakdownSpan
          key={`sumbr-${mBr[1]}-${mBr[2]}-${i}-${keyIndex}`}
          keyAd={mBr[1]}
          keyAp={mBr[2]}
          map={map}
          scalesWithIconById={scalesWithIconById}
          scalesWithTextColorById={scalesWithTextColorById}
          scalesWithValueFormatById={scalesWithValueFormatById}
        />,
      )
      i += mBr[0].length
    } else if (mSum) {
      const mainRaw = (mSum[3] ?? '').trim().toLowerCase()
      const main: CombinedSumMainSide =
        mainRaw === '1' || mainRaw === 'first'
          ? 'first'
          : mainRaw === '2' || mainRaw === 'second'
            ? 'second'
            : null
      keyIndex += 1
      nodes.push(
        <CombinedSumTotalSpan
          key={`sum-${mSum[1]}-${mSum[2]}-${i}-${keyIndex}`}
          keyAd={mSum[1]}
          keyAp={mSum[2]}
          main={main}
          map={map}
          scalesWithIconById={scalesWithIconById}
          scalesWithTextColorById={scalesWithTextColorById}
          scalesWithValueFormatById={scalesWithValueFormatById}
        />,
      )
      i += mSum[0].length
    } else if (mPlain || mWide) {
      const m = mPlain ?? mWide!
      const key = (m[1] ?? '').trim()
      const param = lookupParam(map, key)
      keyIndex += 1
      nodes.push(
        <ParamInterpSpan
          key={`${key}-${i}-${keyIndex}`}
          paramKey={key}
          param={param}
          scalesWithIconById={scalesWithIconById}
          scalesWithTextColorById={scalesWithTextColorById}
          scalesWithValueFormatById={scalesWithValueFormatById}
        />,
      )
      i += m[0].length
    } else {
      const next = rest.search(/\{\{|\uFF5B\uFF5B/)
      if (next === -1) {
        nodes.push(rest)
        break
      }
      if (next > 0) {
        nodes.push(rest.slice(0, next))
        i += next
      } else {
        nodes.push(rest[0])
        i += 1
      }
    }
  }

  return nodes
}

import { useMemo, useState, type ReactNode } from 'react'
import type {
  ChampionSkillBlock,
  ChampionSkillParamRow,
  ChampionStarStatRow,
  ScalesWithValueFormat,
} from '../../../../types'
import {
  MagicDamageIcon,
  MetatftStatIcon,
  PhysicalDamageIcon,
  ShieldStatIcon,
  SparkleCountIcon,
  StatHeartIcon,
} from './DamageTypeIcons'
import { CHAMPION_SPLASH_ASPECT_CLASS } from '../../championVisual'
import {
  damageVisualKind,
  formatSkillParamDisplayValue,
  paramValueTextStyle,
  renderSkillDescriptionContent,
  statIconClass,
} from '../../utils/skillTemplate'

type TabId = 'skill' | 'stats'

export interface SkillDescriptionPanelProps {
  skill: ChampionSkillBlock
  starStats: ChampionStarStatRow[]
  imageUrl: string
  className?: string
  /** id scalesWith → icon URL (meta); nếu có thì ưu tiên hơn icon SVG mặc định. */
  scalesWithIconById?: Record<string, string>
  /** id scalesWith → màu chữ số (#RGB / #RRGGBB) từ meta. */
  scalesWithTextColorById?: Record<string, string>
  /** id scalesWith → số thường hay thêm % cuối (meta). */
  scalesWithValueFormatById?: Record<string, ScalesWithValueFormat>
}

function iconForRow(kind: ReturnType<typeof damageVisualKind>, customUrl?: string) {
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

function sortedParams(params: ChampionSkillParamRow[]) {
  return [...params].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

function fmtInt(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const t = n.toFixed(2)
  return t.replace(/\.?0+$/, '')
}

function fmtAttackSpeed(n: number): string {
  const t = n.toFixed(2)
  return t.replace(/\.?0+$/, '')
}

function fmtCritChanceUnit(n: number): string {
  return `${Math.round(n * 100)}%`
}

function fmtCritDamageMult(n: number): string {
  return `${Math.round(n * 100)}%`
}

/** Nếu mọi bậc sao cùng giá trị (hoặc chỉ 1 bậc) → một số; không thì nối bằng /. */
function valuesAcrossStars(
  rows: ChampionStarStatRow[],
  pick: (s: ChampionStarStatRow) => number,
  format: (n: number) => string,
): string {
  if (rows.length === 0) return '—'
  const vals = rows.map(pick)
  const allSame = vals.every((v) => v === vals[0])
  if (allSame || rows.length === 1) return format(vals[0] ?? 0)
  return vals.map(format).join('/')
}

function manaDisplay(rows: ChampionStarStatRow[]): string {
  if (rows.length === 0) return '—'
  const parts = rows.map((s) => `${fmtInt(s.manaInitial)}/${fmtInt(s.manaMax)}`)
  const allSame = parts.every((p) => p === parts[0])
  if (allSame || rows.length === 1) return parts[0] ?? '—'
  return parts.join(' / ')
}

function StarKeyLegend({ count }: { count: number }) {
  if (count < 2) return null
  const goldLast = count >= 3
  const segments: ReactNode[] = []
  for (let i = 1; i <= count; i += 1) {
    if (i > 1) {
      segments.push(
        <span key={`sep-${i}`} className="text-on-surface/30 mx-0.5">
          /
        </span>,
      )
    }
    const isGold = goldLast && i === count
    const stars = '★'.repeat(i)
    segments.push(
      <span
        key={i}
        className={isGold ? 'text-[#E0C878] font-semibold' : 'text-[#5EB3E8] font-semibold'}
        aria-hidden
      >
        {stars}
      </span>,
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] text-on-surface/50 mb-3">
      <span className="text-[10px] uppercase tracking-[0.12em] text-on-surface/45 mr-1">Chìa khóa</span>
      {segments}
    </div>
  )
}

function StatTile({
  label,
  icon,
  value,
}: {
  label: string
  icon: ReactNode
  value: string
}) {
  return (
    <div className="flex flex-col items-center justify-start gap-1.5 rounded-md border border-white/[0.07] bg-black/25 px-2 py-2.5 min-h-[72px]">
      <span className="text-[10px] text-[#9aa0a8] text-center leading-snug px-0.5">{label}</span>
      <div className="flex items-center justify-center gap-1.5 mt-auto">
        <span className="shrink-0 flex items-center">{icon}</span>
        <span className="text-[13px] font-semibold text-[#e8eaed] tabular-nums leading-none">{value}</span>
      </div>
    </div>
  )
}

export function SkillDescriptionPanel({
  skill,
  starStats,
  imageUrl,
  className = '',
  scalesWithIconById,
  scalesWithTextColorById,
  scalesWithValueFormatById,
}: SkillDescriptionPanelProps) {
  const [tab, setTab] = useState<TabId>('skill')
  const starOptions = useMemo(() => [...starStats].sort((a, b) => a.stars - b.stars), [starStats])

  /** Mana ở tab kỹ năng luôn theo 1★ (hoặc bậc sao thấp nhất nếu không có dòng 1★). */
  const oneStarRow =
    starOptions.find((s) => s.stars === 1) ?? starOptions[0] ?? ({
      stars: 1,
      hp: 0,
      manaInitial: 0,
      manaMax: 0,
      attackDamage: 0,
      abilityPower: 0,
      armor: 0,
      magicResist: 0,
      attackSpeed: 0,
      critChance: 0,
      critDamage: 0,
      attackRange: 0,
    } as ChampionStarStatRow)

  const descriptionContent = useMemo(
    () =>
      renderSkillDescriptionContent(skill.descriptionTemplate ?? '', skill.params ?? [], {
        scalesWithIconById,
        scalesWithTextColorById,
        scalesWithValueFormatById,
      }),
    [
      skill.descriptionTemplate,
      skill.params,
      scalesWithIconById,
      scalesWithTextColorById,
      scalesWithValueFormatById,
    ],
  )

  const paramsOrdered = useMemo(() => sortedParams(skill.params ?? []), [skill.params])

  return (
    <div
      className={`rounded-lg border border-white/10 bg-[#1a1d24] text-[#c8cdd0] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden ${className}`}
    >
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setTab('skill')}
          className={`flex-1 py-2.5 text-[13px] font-semibold tracking-wide transition-colors ${
            tab === 'skill'
              ? 'text-on-surface border-b-2 border-[#C8AA6E] -mb-px bg-black/20'
              : 'text-on-surface/55 hover:text-on-surface/80'
          }`}
        >
          Kỹ Năng
        </button>
        <button
          type="button"
          onClick={() => setTab('stats')}
          className={`flex-1 py-2.5 text-[13px] font-semibold tracking-wide transition-colors ${
            tab === 'stats'
              ? 'text-on-surface border-b-2 border-[#C8AA6E] -mb-px bg-black/20'
              : 'text-on-surface/55 hover:text-on-surface/80'
          }`}
        >
          Số Liệu
        </button>
      </div>

      <div className="p-3.5 space-y-3">
        {tab === 'skill' ? (
          <>
            <div className="flex items-start gap-3">
              <div
                className={`h-12 w-auto ${CHAMPION_SPLASH_ASPECT_CLASS} rounded-md border border-white/15 bg-black/35 overflow-hidden shrink-0`}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-container-high/50" />
                )}
              </div>
              <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-bold text-on-surface leading-snug pr-2">
                  {skill.name?.trim() || '—'}
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  <MetatftStatIcon stat="mana" className="h-4 w-4" />
                  <span className="text-[13px] font-semibold tabular-nums whitespace-nowrap text-[#e8eaed]">
                    {oneStarRow.manaInitial} / {oneStarRow.manaMax}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {tab === 'skill' ? (
          <>
            <div className="text-[13px] leading-relaxed text-[#b8bec4] [&_.inline-flex]:align-middle">
              {descriptionContent}
            </div>

            {paramsOrdered.length > 0 ? (
              <>
                <div className="h-px bg-white/10" />
                <ul className="space-y-2.5">
                  {paramsOrdered.map((p) => {
                    const kind = damageVisualKind(p.scalesWith)
                    const sw = p.scalesWith?.trim()
                    const customIcon =
                      sw && scalesWithIconById?.[sw]?.trim() ? scalesWithIconById[sw].trim() : undefined
                    const valStyle = paramValueTextStyle(p.scalesWith, kind, scalesWithTextColorById)
                    const label = p.displayLabel?.trim() || p.paramKey
                    return (
                      <li key={p.paramKey} className="flex items-start justify-between gap-3 text-[12px]">
                        <span className="text-on-surface/75 font-medium shrink-0">{label}</span>
                        <span className="flex items-center gap-1.5 justify-end text-right min-w-0">
                          <span className={valStyle.className} style={valStyle.style}>
                            {formatSkillParamDisplayValue(p, scalesWithValueFormatById)}
                          </span>
                          {iconForRow(kind, customIcon)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : null}
          </>
        ) : (
          <div className="pt-0.5">
            <StarKeyLegend count={starOptions.length} />
            <div className="grid grid-cols-2 gap-2">
              <StatTile
                label="Máu"
                icon={<StatHeartIcon className="text-[#4CAF50]" />}
                value={valuesAcrossStars(starOptions, (s) => s.hp, fmtInt)}
              />
              <StatTile
                label="Mana"
                icon={<MetatftStatIcon stat="mana" className="h-[18px] w-[18px]" />}
                value={manaDisplay(starOptions)}
              />
              <StatTile
                label="Sát thương tấn công"
                icon={<MetatftStatIcon stat="ad" className="h-[18px] w-[18px]" />}
                value={valuesAcrossStars(starOptions, (s) => s.attackDamage, fmtInt)}
              />
              <StatTile
                label="Sát thương kỹ năng"
                icon={<MetatftStatIcon stat="ap" className="h-[18px] w-[18px]" />}
                value={valuesAcrossStars(starOptions, (s) => s.abilityPower, fmtInt)}
              />
              <StatTile
                label="Giáp"
                icon={<MetatftStatIcon stat="armor" className="h-[18px] w-[18px]" />}
                value={valuesAcrossStars(starOptions, (s) => s.armor, fmtInt)}
              />
              <StatTile
                label="Kháng phép"
                icon={<MetatftStatIcon stat="magicResist" className="h-[18px] w-[18px]" />}
                value={valuesAcrossStars(starOptions, (s) => s.magicResist, fmtInt)}
              />
              <StatTile
                label="Tốc độ tấn công"
                icon={<MetatftStatIcon stat="attackSpeed" className="h-[18px] w-[18px]" />}
                value={valuesAcrossStars(starOptions, (s) => s.attackSpeed, fmtAttackSpeed)}
              />
              <StatTile
                label="Tỷ lệ chí mạng"
                icon={<MetatftStatIcon stat="critChance" className="h-[18px] w-[18px]" />}
                value={valuesAcrossStars(starOptions, (s) => s.critChance, fmtCritChanceUnit)}
              />
              <StatTile
                label="Sát thương chí mạng"
                icon={<MetatftStatIcon stat="critDamage" className="h-[18px] w-[18px]" />}
                value={valuesAcrossStars(starOptions, (s) => s.critDamage, fmtCritDamageMult)}
              />
              <StatTile
                label="Tầm bắn"
                icon={<MetatftStatIcon stat="range" className="h-[18px] w-[18px]" />}
                value={valuesAcrossStars(starOptions, (s) => s.attackRange, fmtInt)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import type { ScalesWithOption, ScalesWithValueFormat } from '../../../types'

/** Icon URL + màu chữ số + kiểu % (meta scales-with) cho preview mô tả kỹ năng. */
export function buildScalesWithVisualMaps(opts: ScalesWithOption[] | undefined): {
  scalesWithIconById: Record<string, string>
  scalesWithTextColorById: Record<string, string>
  scalesWithValueFormatById: Record<string, ScalesWithValueFormat>
} {
  const scalesWithIconById: Record<string, string> = {}
  const scalesWithTextColorById: Record<string, string> = {}
  const scalesWithValueFormatById: Record<string, ScalesWithValueFormat> = {}
  for (const o of opts ?? []) {
    const u = o.iconUrl?.trim()
    if (u) scalesWithIconById[o.id] = u
    const c = o.textColor?.trim()
    if (c) scalesWithTextColorById[o.id] = c
    const vf = o.valueFormat === 'percent' ? 'percent' : 'flat'
    scalesWithValueFormatById[o.id] = vf
  }
  return { scalesWithIconById, scalesWithTextColorById, scalesWithValueFormatById }
}

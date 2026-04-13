/** Khớp `{{param_key}}` trong HTML/text mô tả (cùng quy ước champion skill). */
const KEY_IN_BRACES = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g

const SUM_PAIR =
  /\{\{\s*sum\s*:\s*([a-zA-Z0-9_.-]+)\s*:\s*([a-zA-Z0-9_.-]+)\s*(?::\s*(1|2|first|second))?\s*\}\}/gi
const SUM_BREAKDOWN_PAIR =
  /\{\{\s*sum_breakdown\s*:\s*([a-zA-Z0-9_.-]+)\s*:\s*([a-zA-Z0-9_.-]+)\s*\}\}/gi

export function extractDescriptionTemplateKeys(text: string): string[] {
  const keys = new Set<string>()
  let m: RegExpExecArray | null
  const re = new RegExp(KEY_IN_BRACES.source, 'g')
  while ((m = re.exec(text)) !== null) {
    if (m[1]) keys.add(m[1])
  }
  SUM_BREAKDOWN_PAIR.lastIndex = 0
  while ((m = SUM_BREAKDOWN_PAIR.exec(text)) !== null) {
    if (m[1]) keys.add(m[1])
    if (m[2]) keys.add(m[2])
  }
  SUM_PAIR.lastIndex = 0
  while ((m = SUM_PAIR.exec(text)) !== null) {
    if (m[1]) keys.add(m[1])
    if (m[2]) keys.add(m[2])
  }
  return Array.from(keys)
}

/** Thay thế placeholder bằng giá trị mẫu (chuỗi được escape để chèn an toàn vào HTML trước khi parse). */
export function applyDescriptionTemplateSamples(
  html: string,
  samples: Record<string, string>,
): string {
  return html.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (full, key: string) => {
    const v = samples[key]?.trim()
    if (v == null || v === '') return full
    return escapeForHtmlTextContent(v)
  })
}

function escapeForHtmlTextContent(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

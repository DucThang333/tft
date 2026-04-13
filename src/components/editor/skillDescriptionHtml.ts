/** Chuẩn hoá nội dung mô tả kỹ năng (plain text cũ → HTML một đoạn). */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function ensureSkillDescriptionHtml(raw: string): string {
  const t = (raw ?? '').trim()
  if (!t) return '<p></p>'
  if (/^\s*</.test(raw)) return raw
  const body = escapeHtml(raw).replace(/\r\n/g, '\n').split('\n').join('<br>')
  return `<p>${body}</p>`
}

/** Kiểm tra có nội dung chữ (bỏ qua thẻ rỗng). */
export function skillDescriptionTextIsEmpty(html: string): boolean {
  if (!html || !String(html).trim()) return true
  if (typeof document === 'undefined') {
    return !String(html).replace(/<[^>]+>/g, '').trim()
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return !(doc.body.textContent || '').trim()
}

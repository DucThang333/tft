/** Đếm chuỗi có nội dung (sau trim). */
export function fieldFilled(raw: string | undefined | null): boolean {
  return Boolean(raw?.trim())
}

export function mergeStats(...parts: { filled: number; total: number }[]): { filled: number; total: number } {
  return parts.reduce(
    (acc, p) => ({ filled: acc.filled + p.filled, total: acc.total + p.total }),
    { filled: 0, total: 0 },
  )
}

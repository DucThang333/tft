/** Empty string = same origin (use Vite dev proxy to Phoenix). */
export function apiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? ''
}

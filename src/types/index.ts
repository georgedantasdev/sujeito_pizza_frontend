// ─── Shared API wrapper ──────────────────────────────────────────────
export interface ApiResponse<T> {
  message: string
  data: T
}

export interface AppError {
  status: number
  code: string
  details?: Record<string, unknown>
}

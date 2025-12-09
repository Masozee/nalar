export interface PaginatedResponse<T> {
  count: number
  pageCount: number
  results: T[]
  next?: string | null
  previous?: string | null
}

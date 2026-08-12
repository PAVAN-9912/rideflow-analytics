export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;

/** Clamp and normalize page/limit query params so callers can't request unbounded result sets. */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const rawLimit = parseInt(String(query.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

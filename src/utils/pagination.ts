import { PaginationParams, PaginationQuery } from '../types/pagination';

export function parsePaginationParams(query: any): PaginationQuery {
  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 10;
  const MAX_LIMIT = 100;

  let page = parseInt(query.page) || DEFAULT_PAGE;
  let limit = parseInt(query.limit) || DEFAULT_LIMIT;

  // Validate page (must be >= 1)
  if (page < 1) {
    page = DEFAULT_PAGE;
  }

  // Validate limit (must be between 1 and MAX_LIMIT)
  if (limit < 1) {
    limit = DEFAULT_LIMIT;
  } else if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
}

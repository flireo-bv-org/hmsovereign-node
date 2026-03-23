import type { Pagination } from "./types";

/**
 * A paginated list result with helper methods for iteration.
 */
export class Page<T> {
  readonly data: T[];
  readonly pagination: Pagination;

  constructor(data: T[], pagination: Pagination) {
    this.data = data;
    this.pagination = pagination;
  }

  /** Whether there are more pages available */
  get hasMore(): boolean {
    return this.pagination.offset + this.data.length < this.pagination.total;
  }

  /** The offset for the next page (use in next request) */
  get nextOffset(): number {
    return this.pagination.offset + this.pagination.limit;
  }
}

/**
 * An async iterator that auto-paginates through all results.
 *
 * @example
 * ```ts
 * // Iterate through all calls automatically
 * for await (const call of client.calls.listAll({ status: 'ended' })) {
 *   console.log(call.id, call.duration_seconds);
 * }
 * ```
 */
export class AutoPaginator<T> implements AsyncIterable<T> {
  constructor(
    private readonly fetchPage: (offset: number) => Promise<{ data: T[]; pagination: Pagination }>,
    private readonly pageSize: number = 100,
  ) {}

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, pagination } = await this.fetchPage(offset);

      for (const item of data) {
        yield item;
      }

      hasMore = offset + data.length < pagination.total;
      offset += this.pageSize;
    }
  }

  /** Collect all items into an array (use with caution on large datasets) */
  async toArray(): Promise<T[]> {
    const items: T[] = [];
    for await (const item of this) {
      items.push(item);
    }
    return items;
  }
}

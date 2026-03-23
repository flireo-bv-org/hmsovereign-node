import type { HttpClient } from "../client";
import type { UsageLog, UsageSummary, UsageListParams, Pagination } from "../types";
import { AutoPaginator } from "../pagination";

export class Usage {
  constructor(private readonly client: HttpClient) {}

  /** Get usage logs with optional filtering */
  async list(params?: UsageListParams): Promise<{ logs: UsageLog[]; pagination: Pagination; summary: UsageSummary }> {
    return this.client.request({
      method: "GET",
      path: "/usage",
      query: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Auto-paginate through all usage logs.
   *
   * @example
   * ```ts
   * for await (const log of client.usage.listAll({ start_date: '2026-01-01' })) {
   *   console.log(log.id, log.duration_sec);
   * }
   * ```
   */
  listAll(params?: Omit<UsageListParams, "limit" | "offset">): AutoPaginator<UsageLog> {
    return new AutoPaginator(async (offset) => {
      const res = await this.client.request<{ logs: UsageLog[]; pagination: Pagination }>({
        method: "GET",
        path: "/usage",
        query: { ...params, limit: 100, offset } as Record<string, string | number | boolean | undefined>,
      });
      return { data: res.logs, pagination: res.pagination };
    });
  }
}

import type { HttpClient } from "../client";
import type {
  Call,
  CallListParams,
  CallControlCommand,
  CallControlResponse,
  OutboundCallParams,
  OutboundCallResponse,
  Pagination,
} from "../types";
import { Page, AutoPaginator } from "../pagination";

export class Calls {
  constructor(private readonly client: HttpClient) {}

  /** List calls with optional filtering (single page) */
  async list(params?: CallListParams): Promise<Page<Call>> {
    const res = await this.client.request<{ calls: Call[]; pagination: Pagination }>({
      method: "GET",
      path: "/calls",
      query: params as Record<string, string | number | boolean | undefined>,
    });
    return new Page(res.calls, res.pagination);
  }

  /**
   * Auto-paginate through all calls matching the filter.
   *
   * @example
   * ```ts
   * for await (const call of client.calls.listAll({ status: 'ended' })) {
   *   console.log(call.id, call.duration_seconds);
   * }
   * ```
   */
  listAll(params?: Omit<CallListParams, "limit" | "offset">): AutoPaginator<Call> {
    return new AutoPaginator(async (offset) => {
      const res = await this.client.request<{ calls: Call[]; pagination: Pagination }>({
        method: "GET",
        path: "/calls",
        query: { ...params, limit: 100, offset } as Record<string, string | number | boolean | undefined>,
      });
      return { data: res.calls, pagination: res.pagination };
    });
  }

  /** Get a specific call by ID */
  async get(id: string): Promise<Call> {
    return this.client.request({
      method: "GET",
      path: `/calls/${id}`,
    });
  }

  /** Initiate an outbound call */
  async create(params: OutboundCallParams): Promise<OutboundCallResponse> {
    return this.client.request({
      method: "POST",
      path: "/calls/outbound",
      body: params,
    });
  }

  /** Send a control command to an active call */
  async control(id: string, command: CallControlCommand): Promise<CallControlResponse> {
    return this.client.request({
      method: "POST",
      path: `/calls/${id}/control`,
      body: command,
    });
  }

  /** Convenience: inject context into an active call */
  async injectContext(
    id: string,
    content: string,
    triggerResponse: boolean = false
  ): Promise<CallControlResponse> {
    return this.control(id, { type: "inject-context", content, trigger_response: triggerResponse });
  }

  /** Convenience: make the agent say something */
  async say(id: string, content: string, endAfter: boolean = false): Promise<CallControlResponse> {
    return this.control(id, { type: "say", content, end_after: endAfter });
  }

  /** Convenience: end an active call */
  async end(id: string, message?: string): Promise<CallControlResponse> {
    return this.control(id, { type: "end-call", message });
  }

  /** Convenience: transfer an active call */
  async transfer(id: string, destination: string, message?: string): Promise<CallControlResponse> {
    return this.control(id, { type: "transfer", destination, message });
  }
}

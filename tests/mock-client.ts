import type { RequestOptions } from "../src/client";

/**
 * A mock HttpClient that records requests and returns canned responses.
 * Used to test resource classes without hitting the real API.
 */
export class MockHttpClient {
  readonly requests: Array<{ method: string; path: string; body?: unknown; query?: Record<string, unknown> }> = [];
  private responses: Map<string, unknown> = new Map();
  private defaultResponse: unknown = {};

  /** Set a canned response for a specific method+path */
  onRequest(method: string, path: string, response: unknown): this {
    this.responses.set(`${method} ${path}`, response);
    return this;
  }

  /** Set the default response for unmatched requests */
  setDefault(response: unknown): this {
    this.defaultResponse = response;
    return this;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    this.requests.push({
      method: options.method,
      path: options.path,
      body: options.body,
      query: options.query,
    });

    const key = `${options.method} ${options.path}`;
    const response = this.responses.get(key) ?? this.defaultResponse;
    return response as T;
  }

  /** Get the last recorded request */
  get lastRequest() {
    return this.requests[this.requests.length - 1];
  }

  /** Reset recorded requests */
  reset(): void {
    this.requests.length = 0;
  }
}

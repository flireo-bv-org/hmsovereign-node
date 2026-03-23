import type { ApiError } from "./types";
import {
  ApiRequestError,
  AuthenticationError,
  InsufficientCreditsError,
  NotFoundError,
  RateLimitError,
} from "./errors";

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  /** Max retries for transient failures (default: 2) */
  maxRetries?: number;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /** Enable debug logging of requests and responses (default: false) */
  debug?: boolean;
}

export type RequestOptions = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly timeout: number;
  private readonly debug: boolean;

  constructor(options: ClientOptions) {
    if (!options.apiKey) {
      throw new AuthenticationError(
        "API key is required. Get yours at https://app.hmsovereign.com/settings"
      );
    }

    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "https://api.hmsovereign.com/api/v1").replace(/\/$/, "");
    this.maxRetries = options.maxRetries ?? 2;
    this.timeout = options.timeout ?? 30_000;
    this.debug = options.debug ?? false;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = this.buildUrl(options.path, options.query);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "hmsovereign-node/0.1.0",
    };

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        if (this.debug) {
          console.debug(`[hmsovereign] retry #${attempt} after ${delay}ms`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      try {
        if (this.debug) {
          console.debug(`[hmsovereign] ${options.method} ${url}${options.body ? ` body=${JSON.stringify(options.body).slice(0, 200)}` : ""}`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: options.method,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (this.debug) {
          console.debug(`[hmsovereign] ${response.status} ${response.statusText} (${options.method} ${options.path})`);
        }

        if (response.ok) {
          if (response.status === 204) return undefined as T;
          const data = (await response.json()) as T;
          if (this.debug) {
            console.debug(`[hmsovereign] response: ${JSON.stringify(data).slice(0, 500)}`);
          }
          return data;
        }

        const errorBody = await response.json().catch(() => undefined) as ApiError | undefined;
        const errorMessage = errorBody?.error ?? errorBody?.message ?? response.statusText;

        if (this.debug) {
          console.debug(`[hmsovereign] error: ${response.status} ${errorMessage}`);
        }

        // Don't retry client errors (except 429)
        if (response.status < 500 && response.status !== 429) {
          throw this.createError(response.status, errorMessage, errorBody, response);
        }

        lastError = this.createError(response.status, errorMessage, errorBody, response);
      } catch (error) {
        if (error instanceof ApiRequestError && error.status < 500 && error.status !== 429) {
          throw error;
        }
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError ?? new Error("Request failed after retries");
  }

  private createError(
    status: number,
    message: string,
    body?: ApiError,
    response?: Response
  ): ApiRequestError {
    switch (status) {
      case 401:
        return new AuthenticationError(message);
      case 402:
        return new InsufficientCreditsError(message);
      case 404:
        return new NotFoundError(message);
      case 429: {
        const retryAfter = response?.headers.get("Retry-After");
        return new RateLimitError(message, retryAfter ? parseInt(retryAfter, 10) : undefined);
      }
      default:
        return new ApiRequestError(message, status, body);
    }
  }

  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }
}

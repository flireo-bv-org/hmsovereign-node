import type { ApiError } from "./types";
import { VERSION } from "./version";
import {
  ApiRequestError,
  AuthenticationError,
  InsufficientCreditsError,
  NotFoundError,
  RateLimitError,
} from "./errors";

/**
 * Encodes a value as a single path segment, so an id can never change which
 * endpoint a request goes to. "", "." and ".." are rejected, because a URL
 * resolves them against the surrounding path instead of keeping them.
 */
export function encodePathParam(value: string): string {
  const segment = String(value);
  if (segment === "" || segment === "." || segment === "..") {
    throw new TypeError(`Invalid path parameter: ${JSON.stringify(segment)}`);
  }
  return encodeURIComponent(segment);
}

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  /**
   * Max retries (default: 2). GET, PUT and DELETE requests are retried on 5xx
   * responses, timeouts and network errors. Every request is retried on a 429,
   * which the API returns before it processes the request.
   */
  maxRetries?: number;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /**
   * Enable debug logging of requests and responses (default: false). Values of
   * keys that look like secrets, such as `api_key` or `webhook_secret`, are masked.
   */
  debug?: boolean;
}

export type RequestOptions = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

/** Methods that are safe to send again when the first attempt may have been processed. */
const IDEMPOTENT_METHODS: ReadonlySet<RequestOptions["method"]> = new Set(["GET", "PUT", "DELETE"]);

/** The longest wait taken from a Retry-After header. */
const MAX_RETRY_AFTER_MS = 30_000;

const SENSITIVE_KEY = /api[_-]?key|secret|token|password/i;

/** Replaces the values of keys that look like secrets, at any depth. Used for debug output. */
export function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactSecrets(entry),
      ]),
    );
  }
  return value;
}

/** Seconds from a Retry-After header, which holds either a number of seconds or an HTTP date. */
function parseRetryAfter(header: string | null): number | undefined {
  if (header === null || header.trim() === "") return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds);
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, (date - Date.now()) / 1000);
}

/** Combines the API's short error and its longer explanation, when both are present. */
function errorMessage(body: ApiError | undefined): string | undefined {
  const error = typeof body?.error === "string" && body.error !== "" ? body.error : undefined;
  const message = typeof body?.message === "string" && body.message !== "" ? body.message : undefined;
  if (error !== undefined && message !== undefined && message !== error) return `${error}: ${message}`;
  return error ?? message;
}

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly timeout: number;
  private readonly debug: boolean;

  constructor(options: ClientOptions) {
    if (!options.apiKey) {
      throw new AuthenticationError(
        "API key is required. Create one in the VoiceDock dashboard: https://dashboard.voicedock.ai"
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

    for (let attempt = 0; ; attempt++) {
      try {
        return await this.send<T>(url, options);
      } catch (error) {
        const delay = attempt < this.maxRetries ? this.retryDelay(error, options.method, attempt) : undefined;
        if (delay === undefined) {
          throw error;
        }
        if (this.debug) {
          console.debug(`[hmsovereign] retry #${attempt + 1} after ${delay}ms`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private async send<T>(url: string, options: RequestOptions): Promise<T> {
    if (this.debug) {
      const body = options.body ? ` body=${this.preview(options.body, 200)}` : "";
      console.debug(`[hmsovereign] ${options.method} ${url}${body}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": `hmsovereign-node/${VERSION}`,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      if (this.debug) {
        console.debug(`[hmsovereign] ${response.status} ${response.statusText} (${options.method} ${options.path})`);
      }

      if (response.ok) {
        if (response.status === 204) return undefined as T;
        const data = (await response.json()) as T;
        if (this.debug) {
          console.debug(`[hmsovereign] response: ${this.preview(data, 500)}`);
        }
        return data;
      }

      const body: unknown = await response.json().catch(() => undefined);
      const error = this.createError(response, body);

      if (this.debug) {
        console.debug(`[hmsovereign] error: ${response.status} ${error.message}`);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Milliseconds to wait before the next attempt, or `undefined` when the
   * request must not be sent again.
   */
  private retryDelay(error: unknown, method: RequestOptions["method"], attempt: number): number | undefined {
    const backoff = Math.min(1000 * 2 ** attempt, 8000);

    // A 429 is returned before the request is processed, so any method can be sent again.
    if (error instanceof RateLimitError) {
      return error.retryAfter === undefined ? backoff : Math.min(error.retryAfter * 1000, MAX_RETRY_AFTER_MS);
    }

    // Any other failure may have happened after the API acted on the request.
    // Only repeat requests that are safe to send twice.
    if (!IDEMPOTENT_METHODS.has(method)) return undefined;

    if (error instanceof ApiRequestError) {
      return error.status >= 500 ? backoff : undefined;
    }

    // Timeouts and network errors.
    return backoff;
  }

  private createError(response: Response, body: unknown): ApiRequestError {
    const apiError =
      body !== null && typeof body === "object" && !Array.isArray(body) ? (body as ApiError) : undefined;
    const message =
      errorMessage(apiError) ?? (response.statusText || `Request failed with status ${response.status}`);

    switch (response.status) {
      case 401:
        return new AuthenticationError(message, apiError);
      case 402:
        return new InsufficientCreditsError(message, apiError);
      case 404:
        return new NotFoundError(message, apiError);
      case 429:
        return new RateLimitError(message, parseRetryAfter(response.headers.get("Retry-After")), apiError);
      default:
        return new ApiRequestError(message, response.status, apiError);
    }
  }

  private preview(value: unknown, maxLength: number): string {
    return (JSON.stringify(redactSecrets(value)) ?? "").slice(0, maxLength);
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

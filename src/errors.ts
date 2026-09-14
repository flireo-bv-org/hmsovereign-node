import type { ApiError } from "./types";

export class HmsSovereignError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HmsSovereignError";
  }
}

export class ApiRequestError extends HmsSovereignError {
  readonly status: number;
  /** The parsed error response, when the API sent one. */
  readonly body?: ApiError;
  /** One entry per problem, when the API lists them, for example for an invalid workflow definition. */
  readonly details?: string[];

  constructor(message: string, status: number, body?: ApiError) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
    const details = body?.details;
    this.details = Array.isArray(details) ? details : undefined;
  }
}

export class AuthenticationError extends ApiRequestError {
  constructor(message: string = "Invalid or missing API key", body?: ApiError) {
    super(message, 401, body);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends ApiRequestError {
  constructor(message: string = "Resource not found", body?: ApiError) {
    super(message, 404, body);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends ApiRequestError {
  /** Seconds to wait before retrying, from the Retry-After header. */
  readonly retryAfter?: number;

  constructor(message: string = "Rate limit exceeded", retryAfter?: number, body?: ApiError) {
    super(message, 429, body);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class InsufficientCreditsError extends ApiRequestError {
  constructor(message: string = "Insufficient credits", body?: ApiError) {
    super(message, 402, body);
    this.name = "InsufficientCreditsError";
  }
}

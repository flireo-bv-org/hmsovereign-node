import type { ApiError } from "./types";

export class HmsSovereignError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HmsSovereignError";
  }
}

export class ApiRequestError extends HmsSovereignError {
  readonly status: number;
  readonly code?: string;
  readonly param?: string;

  constructor(message: string, status: number, body?: ApiError) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = body?.type;
    this.param = body?.param;
  }
}

export class AuthenticationError extends ApiRequestError {
  constructor(message: string = "Invalid or missing API key") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends ApiRequestError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends ApiRequestError {
  readonly retryAfter?: number;

  constructor(message: string = "Rate limit exceeded", retryAfter?: number) {
    super(message, 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class InsufficientCreditsError extends ApiRequestError {
  constructor(message: string = "Insufficient credits") {
    super(message, 402);
    this.name = "InsufficientCreditsError";
  }
}

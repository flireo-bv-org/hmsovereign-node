import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookPayload } from "./types";

export interface WebhookVerifyOptions {
  /** Raw request body as string or Buffer */
  payload: string | Buffer;
  /** Signature from the `X-Webhook-Signature` header (format: "sha256=hexdigest") */
  signature: string;
  /** Timestamp from the `X-Webhook-Timestamp` header (Unix seconds) */
  timestamp: string;
  /** Your webhook secret (configured on the assistant) */
  secret: string;
  /** Max age in seconds to accept (default: 300 = 5 minutes) */
  maxAge?: number;
}

/**
 * Verify and parse HMS Sovereign webhook signatures.
 *
 * HMS Sovereign signs webhooks using HMAC-SHA256 with the format:
 * - Signed content: `"{timestamp}.{raw_body}"`
 * - Signature header: `"sha256={hexdigest}"`
 * - Timestamp: Unix seconds (not milliseconds)
 *
 * @example
 * ```ts
 * import { Webhooks } from 'hmsovereign';
 *
 * // Express (use raw body!)
 * app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
 *   const payload = Webhooks.verify({
 *     payload: req.body,
 *     signature: req.headers['x-webhook-signature'] as string,
 *     timestamp: req.headers['x-webhook-timestamp'] as string,
 *     secret: process.env.WEBHOOK_SECRET!,
 *   });
 *
 *   switch (payload.message.type) {
 *     case 'end-of-call-report':
 *       console.log('Call ended:', payload.message.duration_seconds);
 *       break;
 *     case 'tool-calls':
 *       // Handle tool calls...
 *       break;
 *   }
 *
 *   res.sendStatus(200);
 * });
 * ```
 */
export class Webhooks {
  /**
   * Verify a webhook signature and return the parsed payload.
   * Throws if the signature is invalid or the timestamp is too old.
   */
  static verify(options: WebhookVerifyOptions): WebhookPayload {
    const { payload, signature, timestamp, secret, maxAge = 300 } = options;

    if (!signature || !timestamp || !secret) {
      throw new WebhookVerificationError("Missing signature, timestamp, or secret");
    }

    // Parse timestamp (Unix seconds)
    const timestampSec = parseInt(timestamp, 10);
    const nowSec = Math.floor(Date.now() / 1000);
    if (isNaN(timestampSec) || Math.abs(nowSec - timestampSec) > maxAge) {
      throw new WebhookVerificationError("Webhook timestamp is too old or invalid");
    }

    // Compute expected signature: HMAC-SHA256("{timestamp}.{payload}")
    const payloadStr = typeof payload === "string" ? payload : payload.toString("utf-8");
    const signedContent = `${timestamp}.${payloadStr}`;
    const expectedHex = createHmac("sha256", secret)
      .update(signedContent)
      .digest("hex");

    // Strip "sha256=" prefix from received signature if present
    const receivedHex = signature.startsWith("sha256=") ? signature.slice(7) : signature;

    // Constant-time comparison
    const sigBuffer = Buffer.from(receivedHex, "utf-8");
    const expectedBuffer = Buffer.from(expectedHex, "utf-8");

    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      throw new WebhookVerificationError("Invalid webhook signature");
    }

    return JSON.parse(payloadStr) as WebhookPayload;
  }

  /**
   * Construct a webhook signature for testing purposes.
   * Returns signature in the same format as HMS Sovereign sends it.
   */
  static sign(payload: string, secret: string, timestamp?: number): { signature: string; timestamp: string } {
    const ts = (timestamp ?? Math.floor(Date.now() / 1000)).toString();
    const signedContent = `${ts}.${payload}`;
    const hex = createHmac("sha256", secret).update(signedContent).digest("hex");
    return { signature: `sha256=${hex}`, timestamp: ts };
  }

  /**
   * Header names used by HMS Sovereign for webhook delivery.
   */
  static readonly HEADERS = {
    /** Event type header */
    EVENT: "x-webhook-event",
    /** Signature header (format: "sha256={hex}") */
    SIGNATURE: "x-webhook-signature",
    /** Timestamp header (Unix seconds) */
    TIMESTAMP: "x-webhook-timestamp",
  } as const;
}

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

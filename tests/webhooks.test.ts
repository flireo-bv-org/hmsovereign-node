import { describe, it, expect } from "vitest";
import { Webhooks, WebhookVerificationError } from "../src/webhooks";

const SECRET = "whsec_test_secret_12345";

describe("Webhooks", () => {
  describe("sign()", () => {
    it("produces sha256= prefixed signature", () => {
      const { signature, timestamp } = Webhooks.sign('{"test":true}', SECRET, 1700000000);

      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);
      expect(timestamp).toBe("1700000000");
    });

    it("uses Unix seconds (not milliseconds) by default", () => {
      const { timestamp } = Webhooks.sign("{}", SECRET);
      const ts = parseInt(timestamp, 10);

      // Should be in seconds (< 10 billion), not milliseconds (> 1 trillion)
      expect(ts).toBeLessThan(10_000_000_000);
      expect(ts).toBeGreaterThan(1_000_000_000);
    });

    it("produces deterministic signatures", () => {
      const a = Webhooks.sign('{"a":1}', SECRET, 1700000000);
      const b = Webhooks.sign('{"a":1}', SECRET, 1700000000);

      expect(a.signature).toBe(b.signature);
    });

    it("different payloads produce different signatures", () => {
      const a = Webhooks.sign('{"a":1}', SECRET, 1700000000);
      const b = Webhooks.sign('{"a":2}', SECRET, 1700000000);

      expect(a.signature).not.toBe(b.signature);
    });
  });

  describe("verify()", () => {
    it("verifies a valid signature", () => {
      const payload = '{"message":{"type":"status-update"}}';
      const { signature, timestamp } = Webhooks.sign(payload, SECRET);

      const result = Webhooks.verify({
        payload,
        signature,
        timestamp,
        secret: SECRET,
      });

      expect(result.message.type).toBe("status-update");
    });

    it("strips sha256= prefix from signature", () => {
      const payload = '{"message":{"type":"end-of-call-report","duration_seconds":60,"summary":"test","messages":[]}}';
      const { signature, timestamp } = Webhooks.sign(payload, SECRET);

      // Verify with prefix
      expect(() =>
        Webhooks.verify({ payload, signature, timestamp, secret: SECRET })
      ).not.toThrow();

      // Also verify without prefix
      const rawHex = signature.replace("sha256=", "");
      expect(() =>
        Webhooks.verify({ payload, signature: rawHex, timestamp, secret: SECRET })
      ).not.toThrow();
    });

    it("accepts Buffer payload", () => {
      const payload = '{"message":{"type":"status-update"}}';
      const { signature, timestamp } = Webhooks.sign(payload, SECRET);

      const result = Webhooks.verify({
        payload: Buffer.from(payload),
        signature,
        timestamp,
        secret: SECRET,
      });

      expect(result.message.type).toBe("status-update");
    });

    it("rejects invalid signature", () => {
      const payload = '{"message":{"type":"status-update"}}';
      const { timestamp } = Webhooks.sign(payload, SECRET);

      expect(() =>
        Webhooks.verify({
          payload,
          signature: "sha256=0000000000000000000000000000000000000000000000000000000000000000",
          timestamp,
          secret: SECRET,
        })
      ).toThrow(WebhookVerificationError);
    });

    it("rejects tampered payload", () => {
      const original = '{"message":{"type":"status-update"}}';
      const tampered = '{"message":{"type":"tool-calls"}}';
      const { signature, timestamp } = Webhooks.sign(original, SECRET);

      expect(() =>
        Webhooks.verify({
          payload: tampered,
          signature,
          timestamp,
          secret: SECRET,
        })
      ).toThrow(WebhookVerificationError);
    });

    it("rejects old timestamps", () => {
      const payload = '{"message":{"type":"status-update"}}';
      const oldTimestamp = (Math.floor(Date.now() / 1000) - 600).toString(); // 10 minutes ago
      const { signature } = Webhooks.sign(payload, SECRET, parseInt(oldTimestamp));

      expect(() =>
        Webhooks.verify({
          payload,
          signature,
          timestamp: oldTimestamp,
          secret: SECRET,
          maxAge: 300, // 5 minutes
        })
      ).toThrow("too old");
    });

    it("accepts custom maxAge", () => {
      const payload = '{"message":{"type":"status-update"}}';
      const oldTimestamp = (Math.floor(Date.now() / 1000) - 500).toString(); // ~8 minutes ago
      const { signature } = Webhooks.sign(payload, SECRET, parseInt(oldTimestamp));

      // Should fail with 5 min maxAge
      expect(() =>
        Webhooks.verify({ payload, signature, timestamp: oldTimestamp, secret: SECRET, maxAge: 300 })
      ).toThrow();

      // Should pass with 10 min maxAge
      expect(() =>
        Webhooks.verify({ payload, signature, timestamp: oldTimestamp, secret: SECRET, maxAge: 600 })
      ).not.toThrow();
    });

    it("throws on missing params", () => {
      expect(() =>
        Webhooks.verify({ payload: "{}", signature: "", timestamp: "123", secret: SECRET })
      ).toThrow("Missing");

      expect(() =>
        Webhooks.verify({ payload: "{}", signature: "sha256=abc", timestamp: "", secret: SECRET })
      ).toThrow("Missing");

      expect(() =>
        Webhooks.verify({ payload: "{}", signature: "sha256=abc", timestamp: "123", secret: "" })
      ).toThrow("Missing");
    });
  });

  describe("HEADERS", () => {
    it("exposes correct header names", () => {
      expect(Webhooks.HEADERS.SIGNATURE).toBe("x-webhook-signature");
      expect(Webhooks.HEADERS.TIMESTAMP).toBe("x-webhook-timestamp");
      expect(Webhooks.HEADERS.EVENT).toBe("x-webhook-event");
    });
  });
});

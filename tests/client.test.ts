import { describe, it, expect } from "vitest";
import { HmsSovereign, AuthenticationError } from "../src/index";

describe("HmsSovereign", () => {
  it("throws AuthenticationError without API key", () => {
    expect(() => new HmsSovereign({ apiKey: "" })).toThrow(AuthenticationError);
  });

  it("creates client with valid API key", () => {
    const client = new HmsSovereign({ apiKey: "fl_test_123" });

    expect(client.assistants).toBeDefined();
    expect(client.calls).toBeDefined();
    expect(client.numbers).toBeDefined();
    expect(client.campaigns).toBeDefined();
    expect(client.sipTrunks).toBeDefined();
    expect(client.voices).toBeDefined();
    expect(client.usage).toBeDefined();
    expect(client.byok).toBeDefined();
    expect(client.toolTemplates).toBeDefined();
    expect(client.analysisTemplates).toBeDefined();
    expect(client.domains).toBeDefined();
    expect(client.organizations).toBeDefined();
  });
});

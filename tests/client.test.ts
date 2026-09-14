import { describe, it, expect, vi } from "vitest";
import { HMSSovereign, AuthenticationError } from "../src/index";
import { VERSION } from "../src/version";

describe("HMSSovereign", () => {
  it("throws AuthenticationError without API key", () => {
    expect(() => new HMSSovereign({ apiKey: "" })).toThrow(AuthenticationError);
  });

  it("points to the dashboard when the API key is missing", () => {
    expect(() => new HMSSovereign({ apiKey: "" })).toThrow("https://dashboard.voicedock.ai");
  });

  it("creates client with valid API key", () => {
    const client = new HMSSovereign({ apiKey: "fl_test_123" });

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
    expect(client.workflows).toBeDefined();
  });

  it("sends the package version in the User-Agent header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ assistants: [] }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    try {
      await new HMSSovereign({ apiKey: "fl_test_123" }).assistants.list();
      const init = fetchMock.mock.calls[0][1] as RequestInit;
      expect((init.headers as Record<string, string>)["User-Agent"]).toBe(`hmsovereign-node/${VERSION}`);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

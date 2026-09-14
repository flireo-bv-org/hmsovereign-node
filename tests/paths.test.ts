import { describe, it, expect, afterEach, vi } from "vitest";
import { HMSSovereign } from "../src/index";
import { encodePathParam } from "../src/client";
import { MockHttpClient } from "./mock-client";
import { Campaigns } from "../src/resources/campaigns";
import { Workflows } from "../src/resources/workflows";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("path parameters", () => {
  it("keeps an id inside its own path segment", async () => {
    // Drives the real HttpClient so the assertion covers the URL that is
    // actually requested, not only the path handed to it.
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(JSON.stringify({ assistant: { id: "x" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123" });
    await client.assistants.get("../numbers/x");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(new URL(url).pathname).toBe("/api/v1/assistants/..%2Fnumbers%2Fx");
  });

  it("encodes every parameter of a nested path", async () => {
    const mock = new MockHttpClient().setDefault({ success: true });

    await new Campaigns(mock as any).removeLead("a/b", "c?d#e");

    expect(mock.lastRequest.path).toBe("/campaigns/a%2Fb/leads/c%3Fd%23e");
  });

  it("rejects values a URL would resolve instead of keep", async () => {
    const mock = new MockHttpClient();
    const workflows = new Workflows(mock as any);

    for (const id of ["", ".", ".."]) {
      await expect(workflows.get(id)).rejects.toThrow(TypeError);
    }
    expect(mock.requests).toHaveLength(0);
  });

  it("encodes percent signs, so an encoded dot segment stays literal", () => {
    expect(encodePathParam("%2e%2e")).toBe("%252e%252e");
  });
});

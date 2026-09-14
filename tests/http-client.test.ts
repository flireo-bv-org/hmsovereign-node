import { describe, it, expect, afterEach, vi } from "vitest";
import {
  HMSSovereign,
  ApiRequestError,
  InsufficientCreditsError,
  RateLimitError,
} from "../src/index";
import { redactSecrets } from "../src/client";

type FetchMock = (url: string, init?: RequestInit) => Promise<Response>;

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

/** A fetch that only settles when the request is aborted by the client's timeout. */
function hangingFetch() {
  return vi.fn<FetchMock>(
    (_url, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("The operation was aborted.", "AbortError")),
        );
      }),
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("retries", () => {
  it("retries a GET after a 500", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const fetchMock = vi
      .fn<FetchMock>()
      .mockResolvedValueOnce(json(500, { error: "Internal server error" }))
      .mockResolvedValueOnce(json(200, { assistants: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123" });
    const result = client.assistants.list();
    await vi.runAllTimersAsync();

    await expect(result).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries a GET after a timeout and after a network error", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const timedOut = hangingFetch();
    const fetchMock = vi
      .fn<FetchMock>()
      .mockImplementationOnce((url, init) => timedOut(url, init))
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(json(200, { assistants: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123", timeout: 50 });
    const result = client.assistants.list();
    await vi.runAllTimersAsync();

    await expect(result).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not retry a POST after a 500", async () => {
    const fetchMock = vi.fn<FetchMock>(async () => json(500, { error: "Internal server error" }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123" });
    const error = await client.calls.create({ destination: "+31612345678" }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect((error as ApiRequestError).status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry a POST after a timeout", async () => {
    const fetchMock = hangingFetch();
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123", timeout: 20 });

    await expect(client.calls.create({ destination: "+31612345678" })).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry a PATCH after a 500", async () => {
    const fetchMock = vi.fn<FetchMock>(async () => json(503, { error: "Service unavailable" }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123" });

    await expect(client.assistants.update("a1", { name: "Support" })).rejects.toBeInstanceOf(ApiRequestError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries a POST after a 429 and sends the same body again", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const fetchMock = vi
      .fn<FetchMock>()
      .mockResolvedValueOnce(json(429, { error: "Rate limit exceeded" }))
      .mockResolvedValueOnce(json(200, { success: true, call_id: "c1", status: "dialing" }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123" });
    const result = client.calls.create({ destination: "+31612345678" });
    await vi.runAllTimersAsync();

    await expect(result).resolves.toMatchObject({ call_id: "c1" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1]?.body).toBe(fetchMock.mock.calls[0][1]?.body);
  });

  it("waits for the Retry-After header on a 429", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const fetchMock = vi
      .fn<FetchMock>()
      .mockResolvedValueOnce(json(429, { error: "Rate limit exceeded" }, { "Retry-After": "2" }))
      .mockResolvedValueOnce(json(200, { success: true, call_id: "c1", status: "dialing" }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123" });
    const result = client.calls.create({ destination: "+31612345678" });

    await vi.advanceTimersByTimeAsync(1999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await expect(result).resolves.toMatchObject({ call_id: "c1" });
  });

  it("waits at most 30 seconds, whatever Retry-After says", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const fetchMock = vi
      .fn<FetchMock>()
      .mockResolvedValueOnce(json(429, { error: "Rate limit exceeded" }, { "Retry-After": "120" }))
      .mockResolvedValueOnce(json(200, { assistants: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123" });
    const result = client.assistants.list();

    await vi.advanceTimersByTimeAsync(29_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await expect(result).resolves.toEqual([]);
  });

  it("throws a RateLimitError once the retries are used up", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const fetchMock = vi.fn<FetchMock>(async () =>
      json(429, { error: "Rate limit exceeded" }, { "Retry-After": "1" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123", maxRetries: 1 });
    const result = client.calls.create({ destination: "+31612345678" }).catch((e: unknown) => e);
    await vi.runAllTimersAsync();
    const error = await result;

    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).retryAfter).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("errors", () => {
  it("keeps the error body and exposes details", async () => {
    const details = ['entry_node "missing" does not reference an existing node'];
    vi.stubGlobal(
      "fetch",
      vi.fn<FetchMock>(async () => json(400, { error: "Invalid workflow definition", details })),
    );

    const client = new HMSSovereign({ apiKey: "fl_test_123" });
    const error = (await client.workflows
      .create({ name: "Reception", definition: { version: 1, entry_node: "missing", nodes: [] } })
      .catch((e: unknown) => e)) as ApiRequestError;

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.status).toBe(400);
    expect(error.message).toBe("Invalid workflow definition");
    expect(error.details).toEqual(details);
    expect(error.body).toEqual({ error: "Invalid workflow definition", details });
  });

  it("combines error and message, and keeps the extra fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<FetchMock>(async () =>
        json(402, {
          error: "Insufficient credits",
          message: "Your account has no credits remaining.",
          balance: 0,
        }),
      ),
    );

    const client = new HMSSovereign({ apiKey: "fl_test_123" });
    const error = (await client.calls
      .create({ destination: "+31612345678" })
      .catch((e: unknown) => e)) as InsufficientCreditsError;

    expect(error).toBeInstanceOf(InsufficientCreditsError);
    expect(error.message).toBe("Insufficient credits: Your account has no credits remaining.");
    expect(error.body?.balance).toBe(0);
    expect(error.details).toBeUndefined();
    expect("code" in error).toBe(false);
    expect("param" in error).toBe(false);
  });

  it("falls back to the status text when the body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<FetchMock>(async () => new Response("<html>Bad Gateway</html>", { status: 502, statusText: "Bad Gateway" })),
    );

    const client = new HMSSovereign({ apiKey: "fl_test_123" });
    const error = (await client.calls
      .create({ destination: "+31612345678" })
      .catch((e: unknown) => e)) as ApiRequestError;

    expect(error.status).toBe(502);
    expect(error.message).toBe("Bad Gateway");
    expect(error.body).toBeUndefined();
  });
});

describe("debug logging", () => {
  it("masks secrets in request and response bodies", async () => {
    const lines: string[] = [];
    vi.spyOn(console, "debug").mockImplementation((...args: unknown[]) => {
      lines.push(args.map(String).join(" "));
    });
    vi.stubGlobal(
      "fetch",
      vi.fn<FetchMock>(async () =>
        json(201, {
          id: "o2",
          name: "Child",
          parent_org_id: "o1",
          api_key: "fl_live_do_not_log",
          created_at: "2026-01-01T00:00:00Z",
        }),
      ),
    );

    const client = new HMSSovereign({ apiKey: "fl_test_123", debug: true });
    const created = await client.organizations.create({ name: "Child" });
    await client.assistants.create({ name: "Support", webhook_secret: "whsec_do_not_log" });

    const output = lines.join("\n");
    expect(output).toContain("[REDACTED]");
    expect(output).not.toContain("fl_live_do_not_log");
    expect(output).not.toContain("whsec_do_not_log");
    // Masking only affects what is logged: the caller still gets the key.
    expect(created.api_key).toBe("fl_live_do_not_log");
  });

  it("masks nested secrets and leaves other values alone", () => {
    expect(
      redactSecrets({
        name: "Support",
        byok: [{ provider: "openai", apiKey: "sk-1" }],
        llm_config: { tools: [{ server: { url: "https://example.com", secret: "s-1" } }] },
        auth_password: "p-1",
        access_token: "t-1",
      }),
    ).toEqual({
      name: "Support",
      byok: [{ provider: "openai", apiKey: "[REDACTED]" }],
      llm_config: { tools: [{ server: { url: "https://example.com", secret: "[REDACTED]" } }] },
      auth_password: "[REDACTED]",
      access_token: "[REDACTED]",
    });
  });
});

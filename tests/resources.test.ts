import { describe, it, expect, beforeEach } from "vitest";
import { MockHttpClient } from "./mock-client";
import { Assistants } from "../src/resources/assistants";
import { Calls } from "../src/resources/calls";
import { Numbers } from "../src/resources/numbers";
import { SipTrunks } from "../src/resources/sip-trunks";
import { Voices } from "../src/resources/voices";
import { Usage } from "../src/resources/usage";
import { BYOK } from "../src/resources/byok";
import { ToolTemplates } from "../src/resources/tool-templates";
import { AnalysisTemplates } from "../src/resources/analysis-templates";
import { Campaigns } from "../src/resources/campaigns";
import { Domains } from "../src/resources/domains";
import { Organizations } from "../src/resources/organizations";

let mock: MockHttpClient;

beforeEach(() => {
  mock = new MockHttpClient();
});

// ─── Assistants ──────────────────────────────────────────────────────────────

describe("Assistants", () => {
  it("list() calls GET /assistants and unwraps { assistants }", async () => {
    const data = [{ id: "a1", name: "Test" }];
    mock.onRequest("GET", "/assistants", { assistants: data });

    const assistants = new Assistants(mock as any);
    const result = await assistants.list();

    expect(result).toEqual(data);
    expect(mock.lastRequest).toMatchObject({ method: "GET", path: "/assistants" });
  });

  it("get() calls GET /assistants/:id and unwraps { assistant }", async () => {
    const data = { id: "a1", name: "Test" };
    mock.onRequest("GET", "/assistants/a1", { assistant: data });

    const assistants = new Assistants(mock as any);
    const result = await assistants.get("a1");

    expect(result).toEqual(data);
  });

  it("create() calls POST /assistants with body", async () => {
    mock.onRequest("POST", "/assistants", { assistant: { id: "a2", name: "New" } });

    const assistants = new Assistants(mock as any);
    const result = await assistants.create({ name: "New" });

    expect(result.name).toBe("New");
    expect(mock.lastRequest.body).toEqual({ name: "New" });
  });

  it("update() calls PATCH /assistants/:id", async () => {
    mock.onRequest("PATCH", "/assistants/a1", { assistant: { id: "a1", name: "Updated" } });

    const assistants = new Assistants(mock as any);
    const result = await assistants.update("a1", { name: "Updated" });

    expect(result.name).toBe("Updated");
    expect(mock.lastRequest).toMatchObject({ method: "PATCH", path: "/assistants/a1" });
  });

  it("delete() calls DELETE /assistants/:id", async () => {
    mock.onRequest("DELETE", "/assistants/a1", { success: true });

    const assistants = new Assistants(mock as any);
    await assistants.delete("a1");

    expect(mock.lastRequest).toMatchObject({ method: "DELETE", path: "/assistants/a1" });
  });
});

// ─── Calls ───────────────────────────────────────────────────────────────────

describe("Calls", () => {
  it("list() returns a Page with pagination", async () => {
    mock.onRequest("GET", "/calls", {
      calls: [{ id: "c1" }],
      pagination: { total: 50, limit: 100, offset: 0 },
    });

    const calls = new Calls(mock as any);
    const page = await calls.list();

    expect(page.data).toHaveLength(1);
    expect(page.pagination.total).toBe(50);
    expect(page.hasMore).toBe(true); // offset(0) + data.length(1) < total(50)
  });

  it("list() passes query params", async () => {
    mock.onRequest("GET", "/calls", {
      calls: [],
      pagination: { total: 0, limit: 100, offset: 0 },
    });

    const calls = new Calls(mock as any);
    await calls.list({ status: "ended", limit: 10 });

    expect(mock.lastRequest.query).toMatchObject({ status: "ended", limit: 10 });
  });

  it("get() calls GET /calls/:id", async () => {
    mock.onRequest("GET", "/calls/c1", { id: "c1", status: "ended" });

    const calls = new Calls(mock as any);
    const result = await calls.get("c1");

    expect(result.id).toBe("c1");
  });

  it("create() calls POST /calls/outbound", async () => {
    mock.onRequest("POST", "/calls/outbound", { success: true, call_id: "c2", status: "dialing" });

    const calls = new Calls(mock as any);
    const result = await calls.create({ destination: "+31612345678", assistant_id: "a1" });

    expect(result.call_id).toBe("c2");
    expect(mock.lastRequest.body).toMatchObject({ destination: "+31612345678" });
  });

  it("control() calls POST /calls/:id/control", async () => {
    mock.onRequest("POST", "/calls/c1/control", { success: true });

    const calls = new Calls(mock as any);
    await calls.control("c1", { type: "end-call" });

    expect(mock.lastRequest.body).toEqual({ type: "end-call" });
  });

  it("say() sends say command", async () => {
    mock.onRequest("POST", "/calls/c1/control", { success: true });

    const calls = new Calls(mock as any);
    await calls.say("c1", "Hello there", true);

    expect(mock.lastRequest.body).toEqual({ type: "say", content: "Hello there", end_after: true });
  });

  it("transfer() sends transfer command", async () => {
    mock.onRequest("POST", "/calls/c1/control", { success: true });

    const calls = new Calls(mock as any);
    await calls.transfer("c1", "+31201234567", "Transferring now");

    expect(mock.lastRequest.body).toEqual({
      type: "transfer",
      destination: "+31201234567",
      message: "Transferring now",
    });
  });

  it("injectContext() sends inject-context command", async () => {
    mock.onRequest("POST", "/calls/c1/control", { success: true });

    const calls = new Calls(mock as any);
    await calls.injectContext("c1", "Customer is VIP", true);

    expect(mock.lastRequest.body).toEqual({
      type: "inject-context",
      content: "Customer is VIP",
      trigger_response: true,
    });
  });
});

// ─── Numbers ─────────────────────────────────────────────────────────────────

describe("Numbers", () => {
  it("list() unwraps { numbers }", async () => {
    mock.onRequest("GET", "/numbers", { numbers: [{ id: "n1", phone_number: "+31612345678" }] });

    const numbers = new Numbers(mock as any);
    const result = await numbers.list();

    expect(result[0].phone_number).toBe("+31612345678");
  });

  it("create() sends phone_number in body", async () => {
    mock.onRequest("POST", "/numbers", { number: { id: "n2", phone_number: "+31698765432" } });

    const numbers = new Numbers(mock as any);
    await numbers.create({ phone_number: "+31698765432", agent_id: "a1" });

    expect(mock.lastRequest.body).toMatchObject({ phone_number: "+31698765432", agent_id: "a1" });
  });
});

// ─── SIP Trunks ──────────────────────────────────────────────────────────────

describe("SipTrunks", () => {
  it("list() unwraps { trunks } (not sip_trunks)", async () => {
    mock.onRequest("GET", "/sip-trunks", { trunks: [{ id: "t1", name: "Telnyx" }] });

    const trunks = new SipTrunks(mock as any);
    const result = await trunks.list();

    expect(result[0].name).toBe("Telnyx");
  });

  it("get() unwraps { trunk }", async () => {
    mock.onRequest("GET", "/sip-trunks/t1", { trunk: { id: "t1", name: "Telnyx" } });

    const trunks = new SipTrunks(mock as any);
    const result = await trunks.get("t1");

    expect(result.id).toBe("t1");
  });

  it("create() unwraps { trunk }", async () => {
    mock.onRequest("POST", "/sip-trunks", { trunk: { id: "t2", name: "Twilio" } });

    const trunks = new SipTrunks(mock as any);
    const result = await trunks.create({ name: "Twilio" });

    expect(result.name).toBe("Twilio");
  });
});

// ─── Voices ──────────────────────────────────────────────────────────────────

describe("Voices", () => {
  it("list() unwraps { voices } and returns Voice[]", async () => {
    const response = {
      voices: [
        { id: "nl_NL-pim-medium", name: "Pim", language: "nl", description: { en: "Pim (Dutch)", nl: "Pim (Nederlands)" } },
      ],
    };
    mock.onRequest("GET", "/voices", response);

    const voices = new Voices(mock as any);
    const result = await voices.list();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("nl_NL-pim-medium");
    expect(result[0].name).toBe("Pim");
  });
});

// ─── Usage ───────────────────────────────────────────────────────────────────

describe("Usage", () => {
  it("list() returns { logs, pagination, summary }", async () => {
    const response = {
      logs: [{ id: "u1", duration_sec: 120 }],
      pagination: { total: 1, limit: 100, offset: 0 },
      summary: { total_calls: 1, total_duration_seconds: 120, total_duration_minutes: 2 },
    };
    mock.onRequest("GET", "/usage", response);

    const usage = new Usage(mock as any);
    const result = await usage.list();

    expect(result.logs).toHaveLength(1);
    expect(result.summary.total_calls).toBe(1);
    expect(result.pagination.total).toBe(1);
  });
});

// ─── BYOK ────────────────────────────────────────────────────────────────────

describe("BYOK", () => {
  it("get() returns { byok_keys } with secret IDs", async () => {
    const response = {
      byok_keys: { deepgram_secret_id: "vault-123", openai_secret_id: null },
    };
    mock.onRequest("GET", "/byok", response);

    const byok = new BYOK(mock as any);
    const result = await byok.get();

    expect(result.byok_keys.deepgram_secret_id).toBe("vault-123");
    expect(result.byok_keys.openai_secret_id).toBeNull();
  });

  it("set() sends provider and api_key", async () => {
    mock.onRequest("POST", "/byok", { success: true, byok_keys: {} });

    const byok = new BYOK(mock as any);
    await byok.set({ provider: "deepgram", api_key: "dg_xxx" });

    expect(mock.lastRequest.body).toEqual({ provider: "deepgram", api_key: "dg_xxx" });
  });

  it("delete() sends provider in body", async () => {
    mock.onRequest("DELETE", "/byok", { success: true, byok_keys: {} });

    const byok = new BYOK(mock as any);
    await byok.delete({ provider: "deepgram" });

    expect(mock.lastRequest.body).toEqual({ provider: "deepgram" });
  });
});

// ─── Tool Templates ──────────────────────────────────────────────────────────

describe("ToolTemplates", () => {
  it("list() unwraps { tool_templates }", async () => {
    mock.onRequest("GET", "/tool-templates", { tool_templates: [{ id: "tt1", name: "Lookup" }] });

    const templates = new ToolTemplates(mock as any);
    const result = await templates.list();

    expect(result[0].name).toBe("Lookup");
  });

  it("get() unwraps { tool_template }", async () => {
    mock.onRequest("GET", "/tool-templates/tt1", { tool_template: { id: "tt1", name: "Lookup" } });

    const templates = new ToolTemplates(mock as any);
    const result = await templates.get("tt1");

    expect(result.id).toBe("tt1");
  });
});

// ─── Analysis Templates ─────────────────────────────────────────────────────

describe("AnalysisTemplates", () => {
  it("list() unwraps { analysis_templates }", async () => {
    mock.onRequest("GET", "/analysis-templates", {
      analysis_templates: [{ id: "at1", name: "Sentiment" }],
    });

    const templates = new AnalysisTemplates(mock as any);
    const result = await templates.list();

    expect(result[0].name).toBe("Sentiment");
  });
});

// ─── Campaigns ───────────────────────────────────────────────────────────────

describe("Campaigns", () => {
  it("list() unwraps { campaigns }", async () => {
    mock.onRequest("GET", "/campaigns", { campaigns: [{ id: "cp1", name: "Reminders" }] });

    const campaigns = new Campaigns(mock as any);
    const result = await campaigns.list();

    expect(result[0].name).toBe("Reminders");
  });

  it("create() sends agent_id in body", async () => {
    mock.onRequest("POST", "/campaigns", { campaign: { id: "cp2", name: "Survey" } });

    const campaigns = new Campaigns(mock as any);
    await campaigns.create({ name: "Survey", agent_id: "a1" });

    expect(mock.lastRequest.body).toMatchObject({ name: "Survey", agent_id: "a1" });
  });

  it("addLead() calls POST /campaigns/:id/leads", async () => {
    mock.onRequest("POST", "/campaigns/cp1/leads", {
      lead: { id: "l1", phone_number: "+31612345678" },
    });

    const campaigns = new Campaigns(mock as any);
    const result = await campaigns.addLead("cp1", { phone_number: "+31612345678" });

    expect(result.phone_number).toBe("+31612345678");
    expect(mock.lastRequest.path).toBe("/campaigns/cp1/leads");
  });
});

// ─── Domains ─────────────────────────────────────────────────────────────────

describe("Domains", () => {
  it("get() calls GET /domains", async () => {
    mock.onRequest("GET", "/domains", { id: "d1", domain: "acme.com", verified: true });

    const domains = new Domains(mock as any);
    const result = await domains.get();

    expect(result.domain).toBe("acme.com");
  });
});

// ─── Organizations ───────────────────────────────────────────────────────────

describe("Organizations", () => {
  it("get() calls GET /organizations", async () => {
    mock.onRequest("GET", "/organizations", { id: "o1", name: "Acme" });

    const orgs = new Organizations(mock as any);
    const result = await orgs.get();

    expect(result.name).toBe("Acme");
  });

  it("create() calls POST /organizations", async () => {
    mock.onRequest("POST", "/organizations", { id: "o2", name: "Child Org" });

    const orgs = new Organizations(mock as any);
    await orgs.create({ name: "Child Org" });

    expect(mock.lastRequest.body).toEqual({ name: "Child Org" });
  });
});

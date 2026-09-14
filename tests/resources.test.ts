import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MockHttpClient } from "./mock-client";
import { HMSSovereign, ApiRequestError } from "../src/index";
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
import { Workflows } from "../src/resources/workflows";
import type { ToolTemplateCreateParams, WorkflowDefinition } from "../src/types";

let mock: MockHttpClient;

beforeEach(() => {
  mock = new MockHttpClient();
});

// A few tests stub fetch to inspect what really goes over the wire; never leave
// that stub behind for the next test.
afterEach(() => {
  vi.unstubAllGlobals();
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

  it("update() attaches a workflow", async () => {
    mock.onRequest("PATCH", "/numbers/n1", { number: { id: "n1", workflow_id: "wf1" } });

    const numbers = new Numbers(mock as any);
    const result = await numbers.update("n1", { workflow_id: "wf1" });

    expect(result.workflow_id).toBe("wf1");
    expect(mock.lastRequest.body).toEqual({ workflow_id: "wf1" });
  });

  it("update() detaches a workflow with an explicit null that reaches the wire", async () => {
    // The 409 on workflows.delete() prescribes exactly this call, so the null has
    // to survive all the way into the request body: an omitted key means "leave the
    // workflow attached" and the number keeps taking calls on it. The MockHttpClient
    // cannot show that - it records the params object it was handed and never
    // serializes anything - so this one drives the real HttpClient against a stubbed
    // fetch and reads the body that actually goes out. That is the exact hole the
    // MCP server fell through.
    const fetchMock = vi.fn(
      async (_url: string, _init: RequestInit) =>
        new Response(JSON.stringify({ number: { id: "n1", workflow_id: null } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123" });
    const result = await client.numbers.update("n1", { workflow_id: null });

    expect(result.workflow_id).toBeNull();

    const [, init] = fetchMock.mock.calls[0];
    expect(typeof init.body).toBe("string");
    expect(JSON.parse(init.body as string)).toEqual({ workflow_id: null });
    // Belt and braces: an object that stringifies to "{}" would pass a loose
    // toMatchObject, and a dropped key is invisible in a diff of two objects.
    expect(init.body).toBe('{"workflow_id":null}');
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

  it("create() sends name, provider and address, and unwraps { trunk }", async () => {
    const params = {
      name: "Carrier",
      provider: "carrier",
      address: "sip.example.com",
      auth_username: "user",
      auth_password: "pass",
      transport: "tls" as const,
    };
    mock.onRequest("POST", "/sip-trunks", {
      trunk: { id: "t2", name: "Carrier", provider: "carrier", address: "sip.example.com", transport: "tls", is_active: true },
    });

    const trunks = new SipTrunks(mock as any);
    const result = await trunks.create(params);

    expect(mock.lastRequest).toMatchObject({ method: "POST", path: "/sip-trunks" });
    expect(mock.lastRequest.body).toEqual(params);
    expect(result.address).toBe("sip.example.com");
    expect(result.is_active).toBe(true);
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

  it("saveConfig() calls POST /byok/config with provider and config", async () => {
    mock.onRequest("POST", "/byok/config", { byok_config: { deepgram: { some_setting: "value" } } });

    const byok = new BYOK(mock as any);
    const result = await byok.saveConfig({ provider: "deepgram", config: { some_setting: "value" } });

    expect(mock.lastRequest).toMatchObject({ method: "POST", path: "/byok/config" });
    expect(mock.lastRequest.body).toEqual({ provider: "deepgram", config: { some_setting: "value" } });
    expect(result.byok_config.deepgram).toEqual({ some_setting: "value" });
  });

  it("has no getConfig(): settings are written, not read back, through /byok/config", () => {
    const byok = new BYOK(mock as any);
    expect("getConfig" in byok).toBe(false);
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

  it("create() sends tool_type and tool_config", async () => {
    const params: ToolTemplateCreateParams = {
      name: "Customer lookup",
      tool_type: "function",
      tool_config: {
        name: "lookup_customer",
        description: "Look up a customer by phone number",
        parameters: { type: "object", properties: { phone: { type: "string" } }, required: ["phone"] },
      },
    };
    mock.onRequest("POST", "/tool-templates", { tool_template: { id: "tt2", ...params } });

    const templates = new ToolTemplates(mock as any);
    const result = await templates.create(params);

    expect(mock.lastRequest).toMatchObject({ method: "POST", path: "/tool-templates" });
    expect(mock.lastRequest.body).toEqual(params);
    expect(result.tool_type).toBe("function");
  });

  it("update() calls PATCH /tool-templates/:id with the new tool_config", async () => {
    const tool_config = {
      destinations: [{ type: "number" as const, number: "+31201234567", description: "Sales" }],
    };
    mock.onRequest("PATCH", "/tool-templates/tt1", {
      tool_template: { id: "tt1", name: "Transfer", tool_type: "transfer_call", tool_config },
    });

    const templates = new ToolTemplates(mock as any);
    const result = await templates.update("tt1", { tool_type: "transfer_call", tool_config });

    expect(mock.lastRequest).toMatchObject({ method: "PATCH", path: "/tool-templates/tt1" });
    expect(mock.lastRequest.body).toEqual({ tool_type: "transfer_call", tool_config });
    expect(result.tool_type === "transfer_call" ? result.tool_config.destinations : []).toHaveLength(1);
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

  it("create() sends system_prompt, user_prompt and schema", async () => {
    const params = {
      name: "Sentiment",
      system_prompt: "You analyse phone calls.",
      user_prompt: "Rate the sentiment of this call: {transcript}",
      schema: { type: "object", properties: { sentiment: { type: "number" } } },
    };
    mock.onRequest("POST", "/analysis-templates", { analysis_template: { id: "at2", ...params } });

    const templates = new AnalysisTemplates(mock as any);
    const result = await templates.create(params);

    expect(mock.lastRequest).toMatchObject({ method: "POST", path: "/analysis-templates" });
    expect(mock.lastRequest.body).toEqual(params);
    expect(result.user_prompt).toBe(params.user_prompt);
  });

  it("update() calls PATCH /analysis-templates/:id", async () => {
    mock.onRequest("PATCH", "/analysis-templates/at1", {
      analysis_template: { id: "at1", system_prompt: "Be brief." },
    });

    const templates = new AnalysisTemplates(mock as any);
    const result = await templates.update("at1", { system_prompt: "Be brief." });

    expect(mock.lastRequest).toMatchObject({
      method: "PATCH",
      path: "/analysis-templates/at1",
      body: { system_prompt: "Be brief." },
    });
    expect(result.system_prompt).toBe("Be brief.");
  });
});

// ─── Campaigns ───────────────────────────────────────────────────────────────

const schedule = {
  schedule_start_time: "09:00:00",
  schedule_end_time: "17:00:00",
  timezone: "Europe/Amsterdam",
};

describe("Campaigns", () => {
  it("list() unwraps { campaigns }", async () => {
    mock.onRequest("GET", "/campaigns", { campaigns: [{ id: "cp1", name: "Reminders" }] });

    const campaigns = new Campaigns(mock as any);
    const result = await campaigns.list();

    expect(result[0].name).toBe("Reminders");
  });

  it("create() sends agent_id and the schedule", async () => {
    mock.onRequest("POST", "/campaigns", { campaign: { id: "cp2", name: "Survey", status: "draft" } });

    const campaigns = new Campaigns(mock as any);
    await campaigns.create({ name: "Survey", agent_id: "a1", ...schedule });

    expect(mock.lastRequest.body).toEqual({ name: "Survey", agent_id: "a1", ...schedule });
  });

  it("update() sends a status change", async () => {
    mock.onRequest("PATCH", "/campaigns/cp1", { campaign: { id: "cp1", status: "cancelled" } });

    const campaigns = new Campaigns(mock as any);
    const result = await campaigns.update("cp1", { status: "cancelled" });

    expect(mock.lastRequest).toMatchObject({ method: "PATCH", path: "/campaigns/cp1", body: { status: "cancelled" } });
    expect(result.status).toBe("cancelled");
  });

  it("listLeads() unwraps { leads } and sends no pagination parameters", async () => {
    mock.onRequest("GET", "/campaigns/cp1/leads", {
      leads: [
        {
          id: "l1",
          campaign_id: "cp1",
          phone_number: "+31612345678",
          variables: {},
          status: "skipped",
          call_id: null,
          attempts: 1,
          last_attempt_at: "2026-01-01T10:00:00Z",
          created_at: "2026-01-01T09:00:00Z",
        },
      ],
    });

    const campaigns = new Campaigns(mock as any);
    const result = await campaigns.listLeads("cp1");

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("skipped");
    expect(result[0].attempts).toBe(1);
    expect(mock.lastRequest).toMatchObject({ method: "GET", path: "/campaigns/cp1/leads" });
    expect(mock.lastRequest.query).toBeUndefined();
  });

  it("addLead() calls POST /campaigns/:id/leads", async () => {
    mock.onRequest("POST", "/campaigns/cp1/leads", {
      lead: { id: "l1", phone_number: "+31612345678" },
    });

    const campaigns = new Campaigns(mock as any);
    const result = await campaigns.addLead("cp1", {
      phone_number: "+31612345678",
      variables: { name: "Jane" },
    });

    expect(result.phone_number).toBe("+31612345678");
    expect(mock.lastRequest.path).toBe("/campaigns/cp1/leads");
    expect(mock.lastRequest.body).toEqual({ phone_number: "+31612345678", variables: { name: "Jane" } });
  });
});

// ─── Domains ─────────────────────────────────────────────────────────────────

const domain = {
  id: "d1",
  org_id: "o1",
  domain_name: "mail.example.com",
  resend_domain_id: "rd1",
  status: "pending",
  region: "eu-west-1",
  records: [{ record: "SPF", name: "send", type: "MX", ttl: "Auto", status: "pending", value: "feedback-smtp.example.com", priority: 10 }],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  verified_at: null,
};

describe("Domains", () => {
  it("get() calls GET /domains and unwraps { domain }", async () => {
    mock.onRequest("GET", "/domains", { domain });

    const domains = new Domains(mock as any);
    const result = await domains.get();

    expect(result?.domain_name).toBe("mail.example.com");
  });

  it("get() returns null when no domain is configured", async () => {
    mock.onRequest("GET", "/domains", { domain: null });

    const domains = new Domains(mock as any);

    expect(await domains.get()).toBeNull();
  });

  it("create() sends domain_name and unwraps { domain }", async () => {
    mock.onRequest("POST", "/domains", { domain });

    const domains = new Domains(mock as any);
    const result = await domains.create({ domain_name: "mail.example.com" });

    expect(mock.lastRequest.body).toEqual({ domain_name: "mail.example.com" });
    expect(result.records?.[0].type).toBe("MX");
  });

  it("listResendDomains() returns the domains and the selected id", async () => {
    mock.onRequest("GET", "/domains/sync", {
      domains: [{ id: "rd1", name: "mail.example.com", status: "verified", region: "eu-west-1" }],
      selected_domain_id: "rd1",
    });

    const domains = new Domains(mock as any);
    const result = await domains.listResendDomains();

    expect(result.domains[0].name).toBe("mail.example.com");
    expect(result.selected_domain_id).toBe("rd1");
  });

  it("syncResendDomain() sends resendDomainId and unwraps { domain }", async () => {
    mock.onRequest("POST", "/domains/sync", { domain, message: "Domain synced successfully from Resend" });

    const domains = new Domains(mock as any);
    const result = await domains.syncResendDomain({ resendDomainId: "rd1" });

    expect(mock.lastRequest.body).toEqual({ resendDomainId: "rd1" });
    expect(result.id).toBe("d1");
  });

  it("verify() and refresh() unwrap { domain }", async () => {
    mock.onRequest("POST", "/domains/verify", { domain: { ...domain, status: "verified" } });
    mock.onRequest("POST", "/domains/refresh", { domain });

    const domains = new Domains(mock as any);

    expect((await domains.verify()).status).toBe("verified");
    expect((await domains.refresh()).status).toBe("pending");
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

  it("update() calls PATCH /organizations and sends both periods", async () => {
    mock.onRequest("PATCH", "/organizations", {
      content_retention_days: 90,
      metadata_retention_days: 365,
    });

    const orgs = new Organizations(mock as any);
    const result = await orgs.update({
      content_retention_days: 90,
      metadata_retention_days: 365,
    });

    // Beide termijnen gaan altijd mee: de API valideert ze tegen elkaar.
    expect(mock.lastRequest.body).toEqual({
      content_retention_days: 90,
      metadata_retention_days: 365,
    });
    expect(result.metadata_retention_days).toBe(365);
  });
});

// ─── Workflows ───────────────────────────────────────────────────────────────

const definition: WorkflowDefinition = {
  version: 1,
  entry_node: "reception",
  nodes: [
    { id: "reception", type: "conversation", instructions: "You are the receptionist." },
    { id: "goodbye", type: "end", first_line: "Thanks for calling." },
  ],
  edges: [{ from: "reception", to: "goodbye", description: "The caller is done." }],
};

describe("Workflows", () => {
  it("list() calls GET /workflows and unwraps { workflows }", async () => {
    mock.onRequest("GET", "/workflows", {
      workflows: [{ id: "wf1", name: "Reception", is_active: true, entry_node: "reception", node_count: 2, edge_count: 1 }],
    });

    const workflows = new Workflows(mock as any);
    const result = await workflows.list();

    expect(result[0].name).toBe("Reception");
    expect(result[0].node_count).toBe(2);
    expect(mock.lastRequest).toMatchObject({ method: "GET", path: "/workflows" });
    // The endpoint takes no limit/offset and returns no pagination envelope,
    // so the SDK must not invent query parameters for it.
    expect(mock.lastRequest.query).toBeUndefined();
  });

  it("get() calls GET /workflows/:id and unwraps { workflow }", async () => {
    mock.onRequest("GET", "/workflows/wf1", {
      workflow: { id: "wf1", name: "Reception", is_active: true, definition },
    });

    const workflows = new Workflows(mock as any);
    const result = await workflows.get("wf1");

    expect(result.definition.entry_node).toBe("reception");
    expect(mock.lastRequest).toMatchObject({ method: "GET", path: "/workflows/wf1" });
  });

  it("create() calls POST /workflows with name and definition", async () => {
    mock.onRequest("POST", "/workflows", {
      workflow: { id: "wf2", name: "Reception", is_active: true, definition },
    });

    const workflows = new Workflows(mock as any);
    const result = await workflows.create({ name: "Reception", definition });

    expect(result.id).toBe("wf2");
    expect(mock.lastRequest).toMatchObject({ method: "POST", path: "/workflows" });
    expect(mock.lastRequest.body).toEqual({ name: "Reception", definition });
  });

  it("update() calls PATCH /workflows/:id", async () => {
    mock.onRequest("PATCH", "/workflows/wf1", {
      workflow: { id: "wf1", name: "Reception", is_active: false, definition },
    });

    const workflows = new Workflows(mock as any);
    const result = await workflows.update("wf1", { is_active: false });

    expect(result.is_active).toBe(false);
    expect(mock.lastRequest).toMatchObject({ method: "PATCH", path: "/workflows/wf1", body: { is_active: false } });
  });

  it("delete() calls DELETE /workflows/:id", async () => {
    mock.onRequest("DELETE", "/workflows/wf1", { success: true });

    const workflows = new Workflows(mock as any);
    await workflows.delete("wf1");

    expect(mock.lastRequest).toMatchObject({ method: "DELETE", path: "/workflows/wf1" });
  });

  it("narrows a node union on its type", () => {
    const node = definition.nodes[0];
    expect(node.type === "conversation" ? node.instructions : null).toBe("You are the receptionist.");
  });
});

// Deleting an attached workflow is the one workflow response that is not a
// happy path, and the mock client cannot produce it: it never throws. So this
// block drives the real HttpClient against a stubbed fetch.
describe("Workflows delete conflict", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("delete() throws ApiRequestError with status 409 while numbers are attached", async () => {
    const message =
      "Workflow is attached to 2 phone numbers. Detach it first (PATCH /numbers/{id} with workflow_id: null).";
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ error: message }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = new HMSSovereign({ apiKey: "fl_test_123" });

    const error = await client.workflows.delete("wf1").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect((error as ApiRequestError).status).toBe(409);
    expect((error as ApiRequestError).message).toBe(message);
    // Not retried: a 409 is the caller's problem, not a transient failure.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

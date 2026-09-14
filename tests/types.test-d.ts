import { describe, it, expectTypeOf } from "vitest";
import type {
  BYOKProvider,
  CampaignLeadCreateParams,
  CampaignStatus,
  CampaignUpdateParams,
  Domain,
  LeadStatus,
  SipTrunkCreateParams,
  TTSProvider,
  TextLLMProvider,
  ToolTemplate,
  ToolTemplateCreateParams,
  Workflow,
  WorkflowConversationNode,
  WorkflowNodeToolDefinition,
  WorkflowSummary,
} from "../src/types";
import type { Domains } from "../src/resources/domains";

describe("request parameters", () => {
  it("requires what the API requires to create a SIP trunk", () => {
    expectTypeOf<{ name: "Carrier"; provider: "carrier"; address: "sip.example.com" }>().toExtend<SipTrunkCreateParams>();
    expectTypeOf<{ name: "Carrier" }>().not.toExtend<SipTrunkCreateParams>();
  });

  it("ties a tool template's tool_config to its tool_type", () => {
    expectTypeOf<{ name: "Hang up"; tool_type: "end_call"; tool_config: {} }>().toExtend<ToolTemplateCreateParams>();
    expectTypeOf<{ name: "Transfer"; tool_type: "transfer_call"; tool_config: {} }>().not.toExtend<ToolTemplateCreateParams>();
    type TransferTemplate = Extract<ToolTemplate, { tool_type: "transfer_call" }>;
    expectTypeOf<TransferTemplate["tool_config"]["destinations"][number]["number"]>().toEqualTypeOf<string>();
  });

  it("cannot set a campaign to completed", () => {
    expectTypeOf<"cancelled">().toExtend<NonNullable<CampaignUpdateParams["status"]>>();
    expectTypeOf<"completed">().not.toExtend<NonNullable<CampaignUpdateParams["status"]>>();
    expectTypeOf<"cancelled">().toExtend<CampaignStatus>();
  });

  it("uses the lead statuses the API returns, and no lead name", () => {
    expectTypeOf<"skipped">().toExtend<LeadStatus>();
    expectTypeOf<"no_answer">().not.toExtend<LeadStatus>();
    expectTypeOf<CampaignLeadCreateParams>().not.toHaveProperty("name");
  });

  it("returns null from domains.get() when no domain is configured", () => {
    expectTypeOf<Domains["get"]>().returns.resolves.toEqualTypeOf<Domain | null>();
  });

  it("accepts every BYOK provider the API accepts", () => {
    expectTypeOf<"inworld">().toExtend<BYOKProvider>();
    expectTypeOf<"google_vertex">().toExtend<BYOKProvider>();
  });
});

// Type-level tests. They run under `vitest run` because vitest.config.ts enables the
// typecheck runner; a type error in this file is a failing test, not a silent pass.

/** What a conversation node actually accepts as a tool - the type under test. */
type NodeTool = NonNullable<WorkflowConversationNode["tools"]>[number];

describe("workflow node tools", () => {
  it("accepts the built-in end_call tool", () => {
    // `{ type: "end_call" }` is the documented way to let the assistant hang up,
    // and it is what the workflow builder writes. The old ToolDefinition-only type
    // rejected it: it demanded type "function" plus a nested function object.
    expectTypeOf<{ type: "end_call" }>().toExtend<NodeTool>();
  });

  it("accepts the built-in transfer_call tool with destinations", () => {
    expectTypeOf<{
      type: "transfer_call";
      destinations: [{ type: "number"; number: "+31201234567"; description: "Sales" }];
    }>().toExtend<NodeTool>();
  });

  it("accepts a webhook tool in the platform's flat format", () => {
    expectTypeOf<{
      name: "check_availability";
      description: "Look up free slots";
      parameters: { type: "object" };
      url: "https://api.example.com/availability";
    }>().toExtend<NodeTool>();
  });

  it("still accepts the nested OpenAI shape the engine normalizes", () => {
    expectTypeOf<{
      type: "function";
      function: { name: "check_availability" };
    }>().toExtend<NodeTool>();
  });

  it("puts those tools on a conversation node", () => {
    expectTypeOf<NodeTool>().toEqualTypeOf<WorkflowNodeToolDefinition>();
  });

  it("keeps a node override on a text LLM provider", () => {
    // A realtime provider per node is rejected at write time, so it must not
    // typecheck either.
    expectTypeOf<"openai">().toExtend<TextLLMProvider>();
    expectTypeOf<"google_realtime">().not.toExtend<TextLLMProvider>();
    // And the catalog's newer TTS providers must be expressible at all.
    expectTypeOf<"google">().toExtend<TTSProvider>();
    expectTypeOf<"xai">().toExtend<TTSProvider>();
  });
});

describe("workflow response optionality", () => {
  it("does not promise timestamps the spec leaves out", () => {
    // Workflow.yaml requires id, name, is_active and definition - nothing else.
    const workflow: Workflow = {
      id: "wf1",
      name: "Reception",
      is_active: true,
      definition: {
        version: 1,
        entry_node: "reception",
        nodes: [{ id: "reception", type: "conversation", instructions: "Hello." }],
      },
    };
    expectTypeOf(workflow.created_at).toEqualTypeOf<string | undefined>();
    expectTypeOf(workflow.updated_at).toEqualTypeOf<string | undefined>();
  });

  it("treats every summary field as optional, like the spec does", () => {
    // WorkflowSummary.yaml declares no required properties at all.
    const summary: WorkflowSummary = {};
    expectTypeOf(summary.node_count).toEqualTypeOf<number | undefined>();
    expectTypeOf(summary.entry_node).toEqualTypeOf<string | null | undefined>();
  });
});

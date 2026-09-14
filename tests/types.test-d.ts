import { describe, it, expectTypeOf } from "vitest";
import type {
  Assistant,
  AssistantCreateParams,
  AssistantUpdateParams,
  BYOKProvider,
  Call,
  CallMessage,
  CampaignLeadCreateParams,
  CampaignStatus,
  CampaignUpdateParams,
  Domain,
  EndOfCallReportPayload,
  LLMConfig,
  LeadStatus,
  OrganizationGetParams,
  RealtimeLLMProvider,
  STTProvider,
  SipTrunkCreateParams,
  SpeechConfig,
  StatusUpdatePayload,
  TTSConfig,
  TTSProvider,
  TextLLMProvider,
  ToolTemplate,
  ToolTemplateCreateParams,
  UsageLog,
  WebhookCallInfo,
  WebhookCustomer,
  WebhookPhoneNumber,
  Workflow,
  WorkflowConversationNode,
  WorkflowNodeToolDefinition,
  WorkflowSummary,
} from "../src/types";
import type { Domains } from "../src/resources/domains";
import type { Organizations } from "../src/resources/organizations";

describe("assistant configuration", () => {
  it("expresses every provider in the catalog", () => {
    expectTypeOf<"google">().toExtend<TextLLMProvider>();
    expectTypeOf<"openai_live">().toExtend<RealtimeLLMProvider>();
    expectTypeOf<"openai_live">().not.toExtend<TextLLMProvider>();
    expectTypeOf<"google">().toExtend<STTProvider>();
    expectTypeOf<"marin">().toExtend<NonNullable<LLMConfig["voice"]>>();
  });

  it("types the provider-specific config fields", () => {
    expectTypeOf<LLMConfig["max_completion_tokens"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<NonNullable<LLMConfig["delegation"]>["instructions"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<NonNullable<LLMConfig["turn_detection"]>["silence_duration_ms"]>().toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf<TTSConfig["speaking_rate"]>().toEqualTypeOf<number | undefined>();
  });

  it("accepts speech and analysis settings on create and update", () => {
    expectTypeOf<AssistantCreateParams["speech_config"]>().toEqualTypeOf<SpeechConfig | undefined>();
    expectTypeOf<AssistantCreateParams>().toHaveProperty("analysis_plan");
    expectTypeOf<AssistantUpdateParams>().toHaveProperty("speech_config");
    expectTypeOf<AssistantUpdateParams>().toHaveProperty("analysis_plan");
    expectTypeOf<Assistant["speech_config"]>().toEqualTypeOf<SpeechConfig | null | undefined>();
  });

  it("sets notification addresses and recording consent through update", () => {
    expectTypeOf<AssistantUpdateParams["notification_emails"]>().toEqualTypeOf<string[] | null | undefined>();
    expectTypeOf<NonNullable<AssistantUpdateParams["recording_consent"]>>().toEqualTypeOf<{
      enabled: boolean;
      message: string;
    }>();
    expectTypeOf<Assistant>().toHaveProperty("notification_emails");
    expectTypeOf<Assistant>().toHaveProperty("recording_consent");
  });
});

describe("calls, usage and organizations", () => {
  it("allows a call without a caller number", () => {
    expectTypeOf<Call["caller_phone"]>().toEqualTypeOf<string | null | undefined>();
  });

  it("returns the call type of a usage log", () => {
    expectTypeOf<UsageLog["call_type"]>().toEqualTypeOf<"phone" | "web">();
  });

  it("can request child organizations", () => {
    expectTypeOf<Organizations["get"]>().parameter(0).toEqualTypeOf<OrganizationGetParams | undefined>();
    expectTypeOf<OrganizationGetParams["include_children"]>().toEqualTypeOf<boolean | undefined>();
  });
});

describe("webhook payloads", () => {
  it("carries the end reason and the call times", () => {
    type Report = EndOfCallReportPayload["message"];
    expectTypeOf<Report["end_reason"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Report["started_at"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Report["ended_at"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<StatusUpdatePayload["message"]["end_reason"]>().toEqualTypeOf<string | undefined>();
  });

  it("describes web calls, which have no phone numbers", () => {
    expectTypeOf<"web_call">().toExtend<WebhookCallInfo["type"]>();
    expectTypeOf<WebhookPhoneNumber["id"]>().toEqualTypeOf<string | null>();
    expectTypeOf<WebhookPhoneNumber["number"]>().toEqualTypeOf<string | null>();
    expectTypeOf<WebhookCustomer["number"]>().toEqualTypeOf<string | null>();
  });

  it("allows system messages in a transcript", () => {
    expectTypeOf<"system">().toExtend<CallMessage["role"]>();
  });
});

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

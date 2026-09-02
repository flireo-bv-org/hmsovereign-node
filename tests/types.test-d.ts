import { describe, it, expectTypeOf } from "vitest";
import type {
  TTSProvider,
  TextLLMProvider,
  Workflow,
  WorkflowConversationNode,
  WorkflowNodeToolDefinition,
  WorkflowSummary,
} from "../src/types";

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

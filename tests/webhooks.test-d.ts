// A consumer written against the call webhook types as they are on main. It must keep
// compiling: adding a member to WebhookPayload, or changing what Webhooks.verify() returns by
// default, breaks code like the handler below without any change on the consumer's side.
// The consumer code sits inside a test so that a type error in it fails that test.
import { describe, it, expectTypeOf } from "vitest";
import { Webhooks } from "../src/index";
import type {
  ArenaEventPayload,
  ArenaEventType,
  AssistantRequestPayload,
  EndOfCallReportPayload,
  StatusUpdatePayload,
  ToolCallsPayload,
  WebhookPayload,
} from "../src/index";

declare const rawBody: string;
declare const signatureHeader: string;
declare const timestampHeader: string;

const options = { payload: rawBody, signature: signatureHeader, timestamp: timestampHeader, secret: "secret" };

describe("webhook payloads stay compatible", () => {
  it("compiles a handler written against the call webhooks", () => {
    // Every call webhook has a call; an exhaustive switch ends in never.
    function handle(payload: WebhookPayload): string {
      const callId: string = payload.message.call.id;
      const m = payload.message;
      switch (m.type) {
        case "assistant-request":
          return `assistant requested for ${callId}`;
        case "status-update":
          return m.end_reason ?? m.error ?? "status";
        case "tool-calls":
          return m.tool_call_list.map((t) => t.function.name).join(",");
        case "end-of-call-report":
          return m.summary;
        default: {
          const unreachable: never = m;
          return unreachable;
        }
      }
    }

    const event = Webhooks.verify(options);
    const callId: string = event.message.call.id;
    if (event.message.type === "end-of-call-report") {
      expectTypeOf(event.message.summary).toEqualTypeOf<string>();
    }
    expectTypeOf(handle(event)).toEqualTypeOf<string>();
    expectTypeOf(callId).toEqualTypeOf<string>();
  });

  it("keeps WebhookPayload to the call webhooks", () => {
    expectTypeOf<WebhookPayload>().toEqualTypeOf<
      AssistantRequestPayload | StatusUpdatePayload | ToolCallsPayload | EndOfCallReportPayload
    >();
    expectTypeOf<ArenaEventPayload>().not.toExtend<WebhookPayload>();
  });

  it("returns WebhookPayload from verify() without a type argument", () => {
    const verify = () => Webhooks.verify(options);
    expectTypeOf(verify).returns.toEqualTypeOf<WebhookPayload>();
  });

  it("types Arena events when they are asked for", () => {
    const verifyArena = () => Webhooks.verify<ArenaEventPayload>(options);
    expectTypeOf(verifyArena).returns.toEqualTypeOf<ArenaEventPayload>();
    expectTypeOf<ArenaEventPayload["message"]["id"]>().toEqualTypeOf<string>();
    expectTypeOf<ArenaEventPayload["message"]["type"]>().toEqualTypeOf<ArenaEventType>();

    const event = Webhooks.verify<WebhookPayload | ArenaEventPayload>(options);
    if (event.message.type === "arena.regression.detected") {
      expectTypeOf(event.message.arena.suite_id).toEqualTypeOf<string>();
    } else if (event.message.type === "end-of-call-report") {
      expectTypeOf(event.message.summary).toEqualTypeOf<string>();
    }
  });
});

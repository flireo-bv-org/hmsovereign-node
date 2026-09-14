import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MockHttpClient } from "./mock-client";
import type { HttpClient } from "../src/client";
import { AnalysisTemplates } from "../src/resources/analysis-templates";
import { Assistants } from "../src/resources/assistants";
import { BYOK } from "../src/resources/byok";
import { Calls } from "../src/resources/calls";
import { Campaigns } from "../src/resources/campaigns";
import { Domains } from "../src/resources/domains";
import { Numbers } from "../src/resources/numbers";
import { Organizations } from "../src/resources/organizations";
import { SipTrunks } from "../src/resources/sip-trunks";
import { ToolTemplates } from "../src/resources/tool-templates";
import { Usage } from "../src/resources/usage";
import { Voices } from "../src/resources/voices";
import { Workflows } from "../src/resources/workflows";

// Operations in the published API specification that the SDK does not wrap, with the reason.
// Refresh the specification with `npm run refresh:api-operations`.
const NOT_WRAPPED: Record<string, string> = {
  "GET /health": "health check, not part of the resource API",
  "POST /chats": "chat messages are not part of the SDK",
  "GET /chats": "chat messages are not part of the SDK",
  "DELETE /chats/{}": "chat messages are not part of the SDK",
  "GET /chats/context": "chat messages are not part of the SDK",
};

const RESOURCES = [
  AnalysisTemplates,
  Assistants,
  BYOK,
  Calls,
  Campaigns,
  Domains,
  Numbers,
  Organizations,
  SipTrunks,
  ToolTemplates,
  Usage,
  Voices,
  Workflows,
];

// Methods that only wrap another method of the same resource.
const DERIVED_METHODS = new Set(["listAll"]);

type Specification = { operations: { operation: string; deprecated: boolean }[] };

const specification = JSON.parse(
  readFileSync(new URL("./fixtures/api-operations.json", import.meta.url), "utf8"),
) as Specification;

/** Calls every public resource method with placeholder arguments and records the operations it requests. */
async function sdkOperations(): Promise<Set<string>> {
  const mock = new MockHttpClient();
  const operations = new Set<string>();

  for (const Resource of RESOURCES) {
    const resource = new Resource(mock as unknown as HttpClient) as unknown as Record<
      string,
      (...args: unknown[]) => unknown
    >;
    for (const name of Object.getOwnPropertyNames(Resource.prototype)) {
      if (name === "constructor" || DERIVED_METHODS.has(name)) continue;
      mock.reset();
      try {
        await resource[name]("x", "x", "x", "x");
      } catch {
        // A placeholder response can fail to parse; the request is recorded before that.
      }
      for (const request of mock.requests) {
        operations.add(`${request.method} ${request.path.replace(/\/x(?=\/|$)/g, "/{}")}`);
      }
    }
  }

  return operations;
}

describe("API coverage", () => {
  it("wraps every operation in the published specification", async () => {
    const sdk = await sdkOperations();
    const missing = specification.operations
      .filter(({ operation, deprecated }) => !deprecated && !sdk.has(operation) && !(operation in NOT_WRAPPED))
      .map(({ operation }) => operation);

    expect(missing).toEqual([]);
  });

  it("only requests operations that exist in the published specification", async () => {
    const known = new Set(specification.operations.map(({ operation }) => operation));
    const unknown = [...(await sdkOperations())].filter((operation) => !known.has(operation));

    expect(unknown).toEqual([]);
  });

  it("keeps the list of operations it does not wrap up to date", async () => {
    const sdk = await sdkOperations();
    const known = new Set(specification.operations.map(({ operation }) => operation));
    const stale = Object.keys(NOT_WRAPPED).filter((operation) => sdk.has(operation) || !known.has(operation));

    expect(stale).toEqual([]);
  });
});

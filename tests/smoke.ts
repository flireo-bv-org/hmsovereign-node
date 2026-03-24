#!/usr/bin/env npx tsx
/**
 * Live API smoke test — verifies basic connectivity against the real HMS Sovereign API.
 *
 * Usage:
 *   HMS_API_KEY=fl_live_... npx tsx tests/smoke.ts
 *
 * This runs read-only GET requests only (no data is created or modified).
 */

const API_KEY = process.env.HMS_API_KEY;
if (!API_KEY) {
  console.error("Set HMS_API_KEY environment variable to run smoke tests.");
  process.exit(1);
}

// We import from the built dist so this also validates the build output
import { HMSSovereign } from "../src/index";

const client = new HMSSovereign({
  apiKey: API_KEY,
  debug: true,
});

interface TestResult {
  name: string;
  ok: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  PASS  ${name}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name, ok: false, error: msg });
    console.log(`  FAIL  ${name}: ${msg}`);
  }
}

async function run() {
  console.log("\n--- HMS Sovereign SDK Smoke Test ---\n");

  await test("assistants.list()", async () => {
    const assistants = await client.assistants.list();
    if (!Array.isArray(assistants)) throw new Error("Expected array");
  });

  await test("calls.list()", async () => {
    const page = await client.calls.list({ limit: 5 });
    if (!Array.isArray(page.data)) throw new Error("Expected page.data array");
    if (typeof page.pagination.total !== "number") throw new Error("Expected pagination.total");
  });

  await test("numbers.list()", async () => {
    const numbers = await client.numbers.list();
    if (!Array.isArray(numbers)) throw new Error("Expected array");
  });

  await test("voices.list()", async () => {
    const voices = await client.voices.list();
    if (!Array.isArray(voices)) throw new Error("Expected array");
    if (voices.length === 0) throw new Error("Expected at least one voice");
  });

  await test("usage.list()", async () => {
    const result = await client.usage.list({ limit: 5 });
    if (!Array.isArray(result.logs)) throw new Error("Expected logs array");
    if (typeof result.summary.total_calls !== "number") throw new Error("Expected summary.total_calls");
  });

  await test("campaigns.list()", async () => {
    const campaigns = await client.campaigns.list();
    if (!Array.isArray(campaigns)) throw new Error("Expected array");
  });

  await test("sipTrunks.list()", async () => {
    const trunks = await client.sipTrunks.list();
    if (!Array.isArray(trunks)) throw new Error("Expected array");
  });

  await test("toolTemplates.list()", async () => {
    const templates = await client.toolTemplates.list();
    if (!Array.isArray(templates)) throw new Error("Expected array");
  });

  await test("analysisTemplates.list()", async () => {
    const templates = await client.analysisTemplates.list();
    if (!Array.isArray(templates)) throw new Error("Expected array");
  });

  await test("byok.get()", async () => {
    const result = await client.byok.get();
    if (!result.byok_keys) throw new Error("Expected byok_keys object");
  });

  await test("organizations.get()", async () => {
    const org = await client.organizations.get();
    if (!org.id) throw new Error("Expected org.id");
  });

  // Summary
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  console.log(`\n--- Results: ${passed} passed, ${failed} failed out of ${results.length} ---\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});

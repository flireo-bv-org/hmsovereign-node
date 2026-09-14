import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  GOOGLE_REALTIME_VOICES,
  LLM_PROVIDERS,
  OPENAI_LIVE_VOICES,
  REALTIME_LLM_PROVIDERS,
  STT_PROVIDERS,
  TEXT_LLM_PROVIDERS,
  TTS_PROVIDERS,
  XAI_REALTIME_VOICES,
} from "../src/types";

// The platform catalog decides which providers exist; the API validates against it
// and rejects anything else. This suite compares the SDK's unions against a vendored
// copy of that catalog, so a provider the platform knows and the SDK does not turns
// red here instead of surfacing as "that provider does not typecheck" in a user's
// editor.
//
// The fixture is a copy of the platform's config catalog with its generator metadata
// (the `_meta` key) left out. Refresh it by replacing the file with a newer copy,
// again without `_meta`; the assertion on `version` below is the reminder that a
// contract bump has to be looked at rather than copied blind.

const catalogPath = fileURLToPath(new URL("./fixtures/config-catalog.json", import.meta.url));

interface CatalogProvider {
  id: string;
  kind?: string;
  voices?: string[];
}

interface Catalog {
  version: number;
  llm: { providers: CatalogProvider[] };
  stt: { providers: CatalogProvider[] };
  tts: { providers: CatalogProvider[] };
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;

const sorted = (values: readonly string[]) => [...values].sort();
const providerIds = (section: keyof Pick<Catalog, "llm" | "stt" | "tts">, kind?: string) =>
  sorted(
    catalog[section].providers.filter((p) => (kind ? p.kind === kind : true)).map((p) => p.id),
  );
const voicesOf = (providerId: string) =>
  sorted(catalog.llm.providers.find((p) => p.id === providerId)?.voices ?? []);

describe("config catalog", () => {
  it("is the contract version this SDK was written against", () => {
    expect(catalog.version).toBe(1);
  });

  it("knows no STT provider the SDK cannot express", () => {
    expect(providerIds("stt")).toEqual(sorted(STT_PROVIDERS));
  });

  it("knows no TTS provider the SDK cannot express", () => {
    expect(providerIds("tts")).toEqual(sorted(TTS_PROVIDERS));
  });

  it("knows no LLM provider the SDK cannot express", () => {
    expect(providerIds("llm")).toEqual(sorted(LLM_PROVIDERS));
  });

  it("splits text and realtime LLM providers the way the catalog does", () => {
    // The split is not cosmetic: a workflow node may only override to a text
    // provider, so TextLLMProvider is what WorkflowNodeLLMConfig accepts.
    expect(providerIds("llm", "text")).toEqual(sorted(TEXT_LLM_PROVIDERS));
    expect(providerIds("llm", "realtime")).toEqual(sorted(REALTIME_LLM_PROVIDERS));
  });

  it("knows no realtime voice the SDK cannot express", () => {
    expect(voicesOf("google_realtime")).toEqual(sorted(GOOGLE_REALTIME_VOICES));
    expect(voicesOf("xai_realtime")).toEqual(sorted(XAI_REALTIME_VOICES));
    expect(voicesOf("openai_live")).toEqual(sorted(OPENAI_LIVE_VOICES));
  });

  it("has a realtime voice list for every realtime provider", () => {
    // A realtime provider without a voice union in the SDK would make its voices
    // unexpressible in llm_config.voice.
    const withVoices = catalog.llm.providers.filter((p) => p.kind === "realtime" && p.voices).map((p) => p.id);
    expect(sorted(withVoices)).toEqual(sorted(REALTIME_LLM_PROVIDERS));
  });
});

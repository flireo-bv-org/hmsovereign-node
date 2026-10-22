// ============================================================================
// HMS Sovereign SDK Types
// Generated from OpenAPI spec at https://api.hmsovereign.com/api/openapi.json
// ============================================================================

// --- Common ---

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

/** The error body the API returns. */
export interface ApiError {
  /** What went wrong */
  error: string;
  /** A longer explanation, sent with some errors */
  message?: string;
  /** One entry per problem, sent with some validation errors */
  details?: string[];
  /** Some errors carry more fields, such as `retry_after` on a 429 */
  [key: string]: unknown;
}

// --- Providers ---
//
// The provider ids below mirror the platform's config catalog. That catalog is the
// single source of truth: the API validates a config against it, and a provider it
// knows but this SDK does not is a provider you cannot express in TypeScript.
//
// They are runtime arrays rather than bare unions so `tests/catalog.test.ts` can
// compare them against a vendored copy of the catalog. The union is derived from the
// array, so the two can never drift from each other.

/** Speech-to-text providers (catalog section `stt`). */
export const STT_PROVIDERS = ["deepgram", "elevenlabs", "gladia", "mistral", "google"] as const;

export type STTProvider = (typeof STT_PROVIDERS)[number];

/**
 * Text (pipeline) LLM providers: the ones that transcribe, think and speak in
 * separate steps. A workflow node may only override to one of these - a realtime
 * provider per node is rejected at write time.
 */
export const TEXT_LLM_PROVIDERS = ["openai", "xai", "mistral", "google"] as const;

export type TextLLMProvider = (typeof TEXT_LLM_PROVIDERS)[number];

/** Realtime (speech-to-speech) LLM providers. */
export const REALTIME_LLM_PROVIDERS = ["google_realtime", "xai_realtime", "openai_live", "elevenlabs_realtime"] as const;

export type RealtimeLLMProvider = (typeof REALTIME_LLM_PROVIDERS)[number];

/** Every LLM provider an assistant can run on (catalog section `llm`). */
export const LLM_PROVIDERS = [...TEXT_LLM_PROVIDERS, ...REALTIME_LLM_PROVIDERS] as const;

export type LLMProvider = (typeof LLM_PROVIDERS)[number];

/** Text-to-speech providers (catalog section `tts`). */
export const TTS_PROVIDERS = ["elevenlabs", "inworld", "google", "xai", "voicedock"] as const;

export type TTSProvider = (typeof TTS_PROVIDERS)[number];

/** Speech-to-speech voices of Google Gemini Live (`llm_config.provider: "google_realtime"`). */
export const GOOGLE_REALTIME_VOICES = [
  "Puck",
  "Achernar",
  "Achird",
  "Algenib",
  "Algieba",
  "Alnilam",
  "Aoede",
  "Autonoe",
  "Callirrhoe",
  "Charon",
  "Despina",
  "Enceladus",
  "Erinome",
  "Fenrir",
  "Gacrux",
  "Iapetus",
  "Kore",
  "Laomedeia",
  "Leda",
  "Orus",
  "Pulcherrima",
  "Rasalgethi",
  "Sadachbia",
  "Sadaltager",
  "Schedar",
  "Sulafat",
  "Umbriel",
  "Vindemiatrix",
  "Zephyr",
  "Zubenelgenubi",
] as const;

export type GoogleRealtimeVoice = (typeof GOOGLE_REALTIME_VOICES)[number];

/** Speech-to-speech voices of xAI Grok Realtime (`llm_config.provider: "xai_realtime"`). */
export const XAI_REALTIME_VOICES = [
  "ara",
  "eve",
  "leo",
  "rex",
  "sal",
  "altair",
  "atlas",
  "carina",
  "castor",
  "celeste",
  "cosmo",
  "helios",
  "helix",
  "iris",
  "kepler",
  "lumen",
  "luna",
  "lux",
  "naksh",
  "orion",
  "perseus",
  "rigel",
  "sirius",
  "ursa",
  "zagan",
  "zenith",
] as const;

export type XAIRealtimeVoice = (typeof XAI_REALTIME_VOICES)[number];

/** Speech-to-speech voices of OpenAI GPT-Live (`llm_config.provider: "openai_live"`). */
export const OPENAI_LIVE_VOICES = ["marin", "beacon", "cinder", "stone", "vesper"] as const;

export type OpenAILiveVoice = (typeof OPENAI_LIVE_VOICES)[number];

/**
 * Voice of an ElevenLabs Realtime assistant (`llm_config.provider: "elevenlabs_realtime"`):
 * any voice id from your ElevenLabs voice library, or a named voice such as `"brian"` (the default).
 */
export type ElevenLabsRealtimeVoice = "brian" | (string & {});

// --- STT Config ---

export interface STTConfig {
  provider: STTProvider;
  model: string;
  language: string;
  keyterms?: string[];
  /** ElevenLabs only */
  tag_audio_events?: boolean;
  /** ElevenLabs only */
  include_timestamps?: boolean;
  /** ElevenLabs only */
  sample_rate?: 16000 | 8000;
  /** Gladia only */
  languages?: string[];
  /** Gladia only */
  code_switching?: boolean;
  /** Gladia only */
  region?: "eu-west" | "us-west";
  /** Gladia only */
  endpointing?: number;
  /** Gladia only */
  custom_vocabulary?: string[];
  /** Gladia only */
  translation_enabled?: boolean;
  /** Gladia only */
  translation_target_languages?: string[];
  /**
   * Deepgram Flux (`flux-general-multi`) only, 0.5 to 0.9 (default 0.7): how sure Flux must
   * be that the caller's turn is over.
   */
  eot_threshold?: number;
  /**
   * Deepgram Flux (`flux-general-multi`) only, 0.3 to 0.9 (off by default): lets the
   * assistant start preparing a reply when the turn is probably over.
   */
  eager_eot_threshold?: number;
}

// --- LLM Config ---

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
  /** Optional per-tool webhook URL override */
  server?: {
    url: string;
    secret?: string;
  };
  /** Whether this is an async (fire-and-forget) tool */
  async?: boolean;
}

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  /** Realtime providers only: the speech-to-speech voice of the model */
  voice?: GoogleRealtimeVoice | XAIRealtimeVoice | OpenAILiveVoice | ElevenLabsRealtimeVoice;
  temperature?: number;
  /**
   * `openai` and `google` only (1-32768): the most tokens the model may produce
   * per reply. When omitted, the provider's own limit applies.
   */
  max_completion_tokens?: number;
  /** `openai_live` only: the backend model the voice model hands reasoning and tool calls to */
  delegation?: LLMDelegation;
  /**
   * `xai_realtime` and `elevenlabs_realtime` only: turn detection. Which fields apply
   * depends on the provider; omitted fields use the provider default.
   */
  turn_detection?: XAITurnDetection & ElevenLabsRealtimeTurnDetection;
  messages?: LLMMessage[];
  tools?: Array<ToolDefinition | McpToolDefinition>;
}

/** Attaches an MCP server to the assistant, with the server's tools it may use. */
export interface McpToolDefinition {
  type: "mcp";
  /** The `id` of an MCP server in your organization */
  mcp_server_id: string;
  /** The server's tools the assistant may use, by name. At most 25. */
  allowed_tools: string[];
  /** Reject the call when the server cannot be reached. Defaults to `true`. */
  required?: boolean;
}

/** Backend model of an `openai_live` assistant. */
export interface LLMDelegation {
  /** Backend model for reasoning and tool calls, e.g. "gpt-5.6-luna" */
  model?: string;
  /**
   * Instructions for the backend model only. When omitted, it receives the same
   * system prompt as the voice model.
   */
  instructions?: string;
}

/** Turn detection of an `elevenlabs_realtime` assistant. */
export interface ElevenLabsRealtimeTurnDetection {
  /** `elevenlabs_realtime` only. How soon the model decides the caller has finished: `"low"` waits longer, `"high"` answers sooner. Defaults to `"medium"`. */
  eagerness?: "low" | "medium" | "high";
}

/** Turn detection of an `xai_realtime` assistant. Values outside the ranges are clamped. */
export interface XAITurnDetection {
  /** Speech-detection sensitivity, 0-1 (default 0.5). Higher ignores more background noise. */
  threshold?: number;
  /** Audio kept from before speech starts, 0-2000 ms (default 300) */
  prefix_padding_ms?: number;
  /** Silence that ends the caller's turn, 100-2000 ms (default 200) */
  silence_duration_ms?: number;
  /** Silence after which the assistant speaks up again, 0-30000 ms. Off when omitted; 0 turns it off. */
  idle_timeout_ms?: number;
}

// --- TTS Config ---

export interface TTSConfig {
  provider: TTSProvider;
  voice_id: string;
  /** ElevenLabs, Google and VoiceDock (`voicedock-1`) */
  model?: string;
  /** Inworld only */
  language?: string;
  /** ElevenLabs only (0-1) */
  stability?: number;
  /** ElevenLabs only (0-1). Not used by `eleven_v3`, `eleven_v4` and `eleven_v4_turbo`; the API refuses it there. */
  similarity_boost?: number;
  /** ElevenLabs only. Not used by `eleven_v3`, `eleven_v4` and `eleven_v4_turbo`; the API refuses it there. */
  use_speaker_boost?: boolean;
  /** Both providers (0.5-2). On ElevenLabs: not used by `eleven_v3`, `eleven_v4` and `eleven_v4_turbo`; the API refuses it there. */
  speed?: number;
  /** ElevenLabs only (0-1). Not used by `eleven_v3`, `eleven_v4` and `eleven_v4_turbo`; the API refuses it there. */
  style?: number;
  /** Google Chirp 3 HD only (0.25-2, default 1) */
  speaking_rate?: number;
}

// --- Analysis ---

export interface AnalysisPlan {
  /** Extract structured data from the transcript after the call */
  structured_data_plan?: {
    enabled: boolean;
    /** JSON Schema of the data to extract */
    schema?: Record<string, unknown>;
    /** Prompt for the analysis. Placeholders: `{{schema}}`, `{{transcript}}`, `{{ended_reason}}` */
    messages?: Array<{ role: "system" | "user"; content: string }>;
  };
  /** Minimum number of conversation messages before the analysis runs (default 2) */
  min_messages_threshold?: number;
}

// --- Speech ---

/** Speech behaviour of an assistant. Every part is optional; omitted parts use the platform defaults. */
export interface SpeechConfig {
  /** Pipeline assistants only: when the assistant answers, and when it lets itself be interrupted */
  turn_taking?: {
    /** Shortest pause before answering, 0.1-5 seconds (default 0.4) */
    endpointing_min_delay?: number;
    /** Longest pause before answering anyway, 0.1-5 seconds (default 2). Must not be below the minimum. */
    endpointing_max_delay?: number;
    /** How long the caller has to keep talking to interrupt, 0.05-2 seconds (default 0.3) */
    interruption_min_duration?: number;
    /** Words the caller has to say to interrupt, 0-10 (default 0, which turns the word count off) */
    interruption_min_words?: number;
    /** Seconds before resuming after an interruption that was not speech, 0.2-5 (default 1.5). `null` turns this off. */
    false_interruption_timeout?: number | null;
  };
  /** Pipeline assistants only: literal replacements applied before text is spoken, at most 50 */
  pronunciation?: Array<{ from: string; to: string }>;
  /** Ambient sound played under the call */
  background_audio?: {
    enabled?: boolean;
    clip?: "office" | "city" | "forest" | "crowded_room";
    /** 0.05-1 (default 0.3) */
    volume?: number;
  };
  /** What happens when the caller goes quiet. Used when `autonomous_silence_handling` is on. */
  silence?: {
    /** Sentences spoken on successive attempts, at most 5 */
    messages?: string[];
    /** Sentence spoken on the last attempt, before the call ends */
    final_message?: string | null;
    /** Seconds before the first check, 1-60 (default 3) */
    first_check_seconds?: number;
    /** Seconds between attempts, 3-120 (default 12) */
    interval_seconds?: number;
    /** Attempts before the call ends, 1-10 (default 3) */
    max_attempts?: number;
  };
  /** Pipeline assistants only: sentence spoken before the assistant ends the call itself */
  end_call_message?: string | null;
  /** Opening line for outbound calls. Falls back to `first_message` when empty. */
  first_message_outbound?: string | null;
  /**
   * Closing phrases: when one of the assistant's turns ends with one of these sentences, the platform
   * ends the call itself, once the sentence has been spoken. Capitals and punctuation are ignored.
   * At most 5 sentences of up to 100 characters, each with at least 2 letters or digits.
   * Works on pipeline and speech-to-speech assistants.
   */
  end_call_phrases?: string[] | null;
}

/** Ask the caller for consent before the call is processed. Inbound phone calls only. */
export interface RecordingConsent {
  enabled: boolean;
  /** Spoken to the caller, who presses 1 to agree */
  message: string;
}

// --- Assistant / Agent ---

export interface Assistant {
  id: string;
  name: string;
  business_name?: string | null;
  notification_email?: string | null;
  /** Up to five addresses that receive the end-of-call report */
  notification_emails?: string[] | null;
  recording_consent?: RecordingConsent | null;
  first_message?: string | null;
  is_active: boolean;
  max_duration_seconds?: number | null;
  autonomous_silence_handling?: boolean;
  silence_timeout_seconds?: number;
  voicemail_detection?: boolean | null;
  voicemail_message?: string | null;
  gdpr_mode?: boolean;
  webhook_url?: string | null;
  webhook_secret?: string | null;
  webhook_events?: string[] | null;
  analysis_plan?: AnalysisPlan | null;
  stt_config: STTConfig;
  llm_config: LLMConfig;
  /** `null` for a realtime assistant, which speaks by itself */
  tts_config: TTSConfig | null;
  speech_config?: SpeechConfig | null;
  created_at: string;
  updated_at: string;
}

export interface AssistantCreateParams {
  name: string;
  business_name?: string;
  notification_email?: string;
  first_message?: string;
  is_active?: boolean;
  max_duration_seconds?: number;
  autonomous_silence_handling?: boolean;
  silence_timeout_seconds?: number;
  voicemail_detection?: boolean;
  voicemail_message?: string;
  gdpr_mode?: boolean;
  webhook_url?: string;
  webhook_secret?: string;
  webhook_events?: string[];
  analysis_plan?: AnalysisPlan;
  stt_config?: STTConfig;
  llm_config?: LLMConfig;
  tts_config?: TTSConfig;
  speech_config?: SpeechConfig;
}

export interface AssistantUpdateParams {
  name?: string;
  business_name?: string | null;
  notification_email?: string | null;
  /** Up to five addresses that receive the end-of-call report */
  notification_emails?: string[] | null;
  recording_consent?: RecordingConsent | null;
  first_message?: string | null;
  is_active?: boolean;
  max_duration_seconds?: number | null;
  autonomous_silence_handling?: boolean;
  silence_timeout_seconds?: number;
  voicemail_detection?: boolean | null;
  voicemail_message?: string | null;
  gdpr_mode?: boolean;
  webhook_url?: string | null;
  webhook_secret?: string | null;
  webhook_events?: string[] | null;
  analysis_plan?: AnalysisPlan | null;
  stt_config?: STTConfig;
  llm_config?: LLMConfig;
  tts_config?: TTSConfig | null;
  speech_config?: SpeechConfig | null;
}

// --- Phone Numbers ---

export interface PhoneNumber {
  id: string;
  phone_number: string;
  agent_id?: string | null;
  agent_name?: string | null;
  business_name?: string | null;
  transfer_trunk_id?: string | null;
  transfer_trunk_name?: string | null;
  /** Workflow that drives calls to this number (null when the assistant handles the conversation directly) */
  workflow_id?: string | null;
  workflow_name?: string | null;
  source?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumberCreateParams {
  phone_number: string;
  agent_id?: string;
  transfer_trunk_id?: string;
  /** Workflow to run for calls to this number, instead of a single assistant */
  workflow_id?: string;
  is_active?: boolean;
}

export interface PhoneNumberUpdateParams {
  agent_id?: string | null;
  transfer_trunk_id?: string | null;
  /**
   * Workflow that drives calls to this number. Pass `null` to detach - that is
   * the documented way out of the 409 that `workflows.delete()` returns while
   * numbers still run the workflow.
   */
  workflow_id?: string | null;
  is_active?: boolean;
}

// --- WhatsApp calling ---

/**
 * Status of WhatsApp calling on a number.
 *
 * - `off`: not set up.
 * - `pending`: the credentials are being applied, usually within a minute.
 * - `active`: WhatsApp calls to the number reach your assistant.
 * - `refused`: the credentials were not applied; `error_code` says why.
 * - `failed`: applying the credentials failed after several attempts; `error_code` says why.
 * - `disabling`: being turned off; becomes `off` shortly.
 */
export type NumberWhatsappStatus = "off" | "pending" | "active" | "refused" | "failed" | "disabling";

/**
 * Why WhatsApp calling was refused or failed on a number, or why it is still pending.
 * `lock_busy` and `upgrade_in_progress` are temporary: the status stays `pending` and
 * the change goes through by itself. The type accepts other values the API may add.
 */
export type NumberWhatsappErrorCode =
  | "number_on_other_trunk"
  | "number_inactive"
  | "missing_credentials"
  | "apply_failed"
  | "readback_mismatch"
  | "no_addresses"
  | "lock_busy"
  | "upgrade_in_progress"
  | (string & {});

/** WhatsApp calling on a number. The SIP password is never returned. */
export interface NumberWhatsapp {
  status: NumberWhatsappStatus;
  /** `null` when there is nothing to report */
  error_code: NumberWhatsappErrorCode | null;
  /** The username Meta authenticates with. `null` when WhatsApp calling is off. */
  sip_username: string | null;
  /** When the status last changed. `null` when WhatsApp calling is off. */
  updated_at: string | null;
}

export interface NumberWhatsappUpdateParams {
  /**
   * The SIP password Meta generated for the number:
   * `calling.sip.servers[0].sip_user_password` from
   * `GET /{PHONE_NUMBER_ID}/settings?include_sip_credentials=true` on the Graph API.
   * 8 to 200 characters. Stored encrypted and never returned.
   */
  sip_password: string;
  /**
   * Defaults to the number without the `+`, which is the username Meta uses.
   * Letters, digits and `.` `_` `+` `-`, up to 64 characters.
   */
  sip_username?: string;
}

// --- Workflows ---

/** Builder canvas position. Ignored by the calling engine. */
export interface WorkflowNodeUi {
  x?: number;
  y?: number;
}

/**
 * Per-node model override. Requires a pipeline (non-realtime) assistant on the
 * number: workflows on realtime assistants reject per-node overrides before
 * pickup. The entry node's override applies to the whole session.
 */
export interface WorkflowNodeLLMConfig {
  /**
   * Text providers only. A realtime provider here is rejected at write time
   * (`realtime_provider_not_allowed_per_node`), so the union is narrower than
   * an assistant's `llm_config.provider`.
   */
  provider?: TextLLMProvider;
  model?: string;
  temperature?: number;
}

/**
 * Built-in tool: the platform supplies the name, the description and the handler.
 * `end_call` lets the assistant hang up by itself.
 */
export interface WorkflowNodeEndCallTool {
  type: "end_call" | "endCall";
}

/** A destination a call can be transferred to. */
export interface TransferDestination {
  type: "number";
  /** E.164, e.g. "+31612345678" */
  number: string;
  /** Shown to the model so it knows when to pick this destination */
  description: string;
  /** Spoken to the caller before transferring */
  message?: string;
}

/** Built-in tool: hands the caller over to one of the listed destinations. */
export interface WorkflowNodeTransferCallTool {
  type: "transfer_call" | "transferCall";
  destinations: TransferDestination[];
}

/**
 * Webhook tool in the platform's own (flat) format: the name and the parameters
 * sit at the top level, and the call lands on your tool-calls webhook.
 */
export interface WorkflowNodeWebhookTool {
  /** Unique tool name; this is what the model calls and what the webhook receives */
  name: string;
  /** Tells the model when and how to use this tool */
  description: string;
  /** JSON Schema for the tool's arguments */
  parameters?: Record<string, unknown>;
  /** Per-tool webhook URL, overriding the one resolved for the call */
  url?: string;
  /** Same override, nested (MCP/Vapi style). `url` wins when both are set. */
  server?: {
    url: string;
    secret?: string;
  };
  /** Fire-and-forget: don't wait for the webhook's response */
  async?: boolean;
  /** What the assistant says while the tool runs (async tools: instead of the result) */
  message?: string;
  /** Legacy spelling of `message`, still accepted by the engine */
  async_response?: string;
}

/**
 * A tool on a conversation node, in the same format as assistant tools.
 *
 * Three shapes reach the same factory (`tools.py:_normalize_tool_definition`):
 * the built-ins above, the flat webhook tool the API documents, and the nested
 * OpenAI shape (`{ type: "function", function: { ... } }`) that the engine
 * normalizes for compatibility. `ToolDefinition` alone would have accepted only
 * that last one, and its required `type: "function"` made the two documented
 * shapes unrepresentable.
 */
export type WorkflowNodeToolDefinition =
  | WorkflowNodeEndCallTool
  | WorkflowNodeTransferCallTool
  | WorkflowNodeWebhookTool
  | ToolDefinition;

/**
 * A talking step: the assistant converses with the caller under this node's
 * instructions until an edge applies. The entry node is always a conversation
 * node.
 */
export interface WorkflowConversationNode {
  /** Lowercase letters, digits and underscores; must start with a letter (max 41 chars) */
  id: string;
  type: "conversation";
  /** System prompt for this step. A workflow `global_prompt` is prepended automatically. */
  instructions: string;
  /** Fixed line spoken when this node becomes active. Realtime models get it as an opening hint. */
  first_line?: string;
  /** Reachable from every conversation node without drawing edges (e.g. "back to reception") */
  global?: boolean;
  /** Required when `global` is true: tells the assistant when to bring a caller here */
  global_description?: string;
  llm_config?: WorkflowNodeLLMConfig;
  /**
   * Voice swap for this step, within the provider of the assistant on the
   * number. Mutually exclusive with `tts_config`.
   */
  voice?: string;
  /**
   * Full text-to-speech override for this step; it replaces the assistant's
   * config entirely rather than merging into it, which is why `provider` and
   * `voice_id` are required here even though the spec marks every field
   * optional: a partial block leaves the step without a usable provider.
   * Pipeline assistants only.
   */
  tts_config?: TTSConfig;
  /**
   * Full speech-recognition override for this step; replaces the assistant's
   * config entirely, same reasoning as `tts_config`. Pipeline assistants only.
   */
  stt_config?: STTConfig;
  /** Tools available in this node, in the same format as assistant tools */
  tools?: WorkflowNodeToolDefinition[];
  ui?: WorkflowNodeUi;
}

/**
 * A background step: the platform calls the webhook tool itself, puts the
 * result in the conversation context and advances along the node's single
 * outgoing edge. A failed call still advances - the error lands in the context.
 */
export interface WorkflowToolNode {
  id: string;
  type: "tool";
  /** Name sent in the tool-calls webhook */
  tool_name: string;
  /** Per-node URL override. Defaults to the tool-calls webhook resolved for the call. */
  url?: string | null;
  /** Static arguments sent with the call */
  arguments?: Record<string, unknown> | null;
  /** Hold line spoken while the call runs ("One moment please...") */
  first_line?: string;
  ui?: WorkflowNodeUi;
}

/** Hands the call to a human. Terminal: no outgoing edges. */
export interface WorkflowTransferNode {
  id: string;
  type: "transfer";
  /** Transfer destination in E.164 format, e.g. "+31201234567" */
  destination: string;
  /** Announcement spoken once before dialing */
  first_line?: string;
  ui?: WorkflowNodeUi;
}

/** Ends the call politely. Terminal: no outgoing edges. */
export interface WorkflowEndNode {
  id: string;
  type: "end";
  /** Goodbye line. Defaults to a neutral thank-you-and-goodbye. */
  first_line?: string;
  ui?: WorkflowNodeUi;
}

/** Discriminated on `type`, so narrowing a node gives you its own fields. */
export type WorkflowNode =
  | WorkflowConversationNode
  | WorkflowToolNode
  | WorkflowTransferNode
  | WorkflowEndNode;

export type WorkflowNodeType = WorkflowNode["type"];

/** A transition between two nodes. Self-loops and duplicate from/to pairs are rejected. */
export interface WorkflowEdge {
  /** Source node id. Only conversation and tool nodes can have outgoing edges. */
  from: string;
  to: string;
  /** When to take this transition. Required, except on edges leaving a tool node. */
  description?: string;
  /** Line spoken during the transition. Defaults to a neutral hand-off line. */
  message?: string | null;
}

/**
 * The workflow graph (contract v1). Definitions are validated on write;
 * invalid ones are rejected with HTTP 400 and a `details` array.
 */
export interface WorkflowDefinition {
  /** Contract version. Currently always 1. */
  version: 1;
  /** Id of the node where every call starts. Must reference a conversation node. */
  entry_node: string;
  /** Instructions prepended to every conversation node */
  global_prompt?: string | null;
  nodes: WorkflowNode[];
  edges?: WorkflowEdge[];
}

/**
 * Only `id`, `name`, `is_active` and `definition` are guaranteed by the spec
 * (`Workflow.yaml`); the timestamps are documented but not required, so they are
 * optional here rather than something you can dereference blind.
 */
export interface Workflow {
  id: string;
  name: string;
  /** When false, attached numbers fall back to their assistant's normal behaviour */
  is_active: boolean;
  definition: WorkflowDefinition;
  created_at?: string;
  updated_at?: string;
}

/**
 * List item: the graph is summarized, request a single workflow for the full
 * definition. `WorkflowSummary.yaml` declares no required properties at all, so
 * every field is optional here. The list route does fill all eight in today - if
 * that is meant to be a promise, the spec is the place to say so, and this type
 * can tighten with it.
 */
export interface WorkflowSummary {
  id?: string;
  name?: string;
  is_active?: boolean;
  entry_node?: string | null;
  node_count?: number;
  edge_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowCreateParams {
  name: string;
  definition: WorkflowDefinition;
  /** Defaults to true */
  is_active?: boolean;
}

export interface WorkflowUpdateParams {
  name?: string;
  /** A new definition replaces the old one entirely */
  definition?: WorkflowDefinition;
  /** Set to false to pause without detaching */
  is_active?: boolean;
}

// --- Calls ---

/** How a call reached the platform: over the phone network, from WhatsApp, or as a web call. */
export type CallChannel = "phone" | "whatsapp" | "web";

/** Known call statuses. The API can return other values, which the type accepts as a plain string. */
export type CallStatus =
  | "connecting"
  | "ringing"
  | "in-progress"
  | "ended"
  | "ended-with-error"
  | "transferred"
  | "failed"
  | "rejected"
  | "insufficient-credits"
  | (string & {});

export interface CallMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Call {
  id: string;
  /** `null` on web calls, and once the organization's metadata retention period has passed */
  caller_phone?: string | null;
  /** `null` on web calls */
  assistant_phone: string | null;
  status: CallStatus;
  direction?: "inbound" | "outbound" | "web" | null;
  /** How the call reached the platform. `null` on calls from before October 2026. */
  channel?: CallChannel | null;
  end_reason?: string | null;
  error?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  duration_seconds?: number | null;
  summary?: string | null;
  analysis_result?: Record<string, unknown> | null;
  messages?: CallMessage[] | null;
  room_name?: string | null;
  recording_url?: string | null;
  agent_id?: string | null;
  number_id?: string | null;
  agent_name?: string | null;
  business_name?: string | null;
  phone_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallListParams {
  limit?: number;
  offset?: number;
  status?: CallStatus;
  start_date?: string;
  end_date?: string;
}

/** Transient assistant config for one-time calls */
export interface TransientAssistant {
  first_message?: string;
  stt_config?: STTConfig;
  llm_config: LLMConfig;
  tts_config?: TTSConfig;
  max_duration_seconds?: number;
  autonomous_silence_handling?: boolean;
  silence_timeout_seconds?: number;
  voicemail_detection?: boolean;
  voicemail_message?: string;
  webhook_url?: string;
  webhook_secret?: string;
  webhook_events?: string[];
  metadata?: Record<string, unknown>;
}

export interface OutboundCallParams {
  destination: string;
  number_id?: string;
  /** Reference mode: use a saved assistant */
  assistant_id?: string;
  /** Hybrid mode: override fields on a saved assistant */
  assistant_override?: Partial<TransientAssistant>;
  /** Transient mode: full one-time assistant config */
  assistant?: TransientAssistant;
  first_message?: string;
}

export interface OutboundCallResponse {
  success: boolean;
  call_id: string;
  status: "dialing";
}

// --- Call Control ---

export type ControlCommandType = "inject-context" | "say" | "end-call" | "transfer";

export interface InjectContextCommand {
  type: "inject-context";
  content: string;
  trigger_response: boolean;
}

export interface SayCommand {
  type: "say";
  content: string;
  end_after: boolean;
}

export interface EndCallCommand {
  type: "end-call";
  message?: string;
}

export interface TransferCommand {
  type: "transfer";
  destination: string;
  message?: string;
}

export type CallControlCommand =
  | InjectContextCommand
  | SayCommand
  | EndCallCommand
  | TransferCommand;

export interface CallControlResponse {
  success: boolean;
  message?: string;
}

// --- SIP Trunks ---

export type SipTrunkTransport = "udp" | "tcp" | "tls";

export interface SipTrunk {
  id: string;
  org_id: string;
  name: string;
  /** SIP provider name */
  provider: string | null;
  /** SIP server address */
  address: string;
  transport: SipTrunkTransport | null;
  auth_username: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SipTrunkCreateParams {
  name: string;
  /** SIP provider name */
  provider: string;
  /** SIP server address, e.g. "sip.example.com" */
  address: string;
  auth_username?: string;
  /** Stored encrypted and never returned by the API */
  auth_password?: string;
  /** Defaults to "udp" */
  transport?: SipTrunkTransport;
}

// --- Voices ---

export interface Voice {
  id: string;
  name: string;
  language?: string;
  description?: {
    en?: string;
    nl?: string;
  };
}

export interface XaiRealtimeVoice {
  id: "ara" | "rex" | "sal" | "eve" | "leo";
  name: string;
  style: string;
}

// --- Usage ---

export interface UsageLog {
  id: string;
  duration_sec: number;
  /** "web" for calls made from a browser, "phone" for all other calls */
  call_type: "phone" | "web";
  phone_number: string | null;
  agent_name: string | null;
  business_name: string | null;
  created_at: string;
}

export interface UsageSummary {
  total_calls: number;
  total_duration_seconds: number;
  total_duration_minutes: number;
}

export interface UsageListParams {
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
}

// --- BYOK ---

export type BYOKProvider =
  | "deepgram"
  | "openai"
  | "elevenlabs"
  | "inworld"
  | "resend"
  | "xai"
  | "gladia"
  | "mistral"
  | "google"
  | "google_vertex";

/** BYOK keys as stored — vault secret IDs per provider */
export interface BYOKKeys {
  deepgram_secret_id?: string | null;
  openai_secret_id?: string | null;
  elevenlabs_secret_id?: string | null;
  inworld_secret_id?: string | null;
  resend_secret_id?: string | null;
  xai_secret_id?: string | null;
  gladia_secret_id?: string | null;
  mistral_secret_id?: string | null;
  google_secret_id?: string | null;
  google_vertex_secret_id?: string | null;
}

export interface BYOKSetParams {
  provider: BYOKProvider;
  api_key: string;
}

export interface BYOKDeleteParams {
  provider: BYOKProvider;
}

/** Provider-specific BYOK settings of your organization, keyed by provider. */
export type BYOKConfig = Record<string, Record<string, unknown>>;

export interface BYOKConfigParams {
  /** A key for this provider must already be stored with `byok.set()`. */
  provider: BYOKProvider;
  /** Provider-specific settings, merged into the settings already stored for this provider. */
  config: Record<string, unknown>;
}

// --- MCP Servers ---

export type McpServerTransport = "streamable_http" | "sse";

export interface McpServer {
  /** Use it as `mcp_server_id` in a tool of type `mcp` */
  id: string;
  /** Display name, unique within your organization */
  name: string;
  /** The server's endpoint. Always `https://`, stored in its normalized form. */
  url: string;
  transport: McpServerTransport;
  /** The names of the headers sent with every request. The values are never returned. */
  header_names: string[];
  /** How long the platform waits for the server on each request, including a tool call */
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface McpServerCreateParams {
  name: string;
  /** Must use `https://` and resolve to a public address. Put credentials in `headers`. */
  url: string;
  /** Defaults to `streamable_http`. Use `sse` only for a server that offers nothing else. */
  transport?: McpServerTransport;
  /** Sent with every request to the server, such as an API key. At most 10. */
  headers?: Record<string, string>;
  /** 5 to 60 seconds. Defaults to 20. */
  timeout_seconds?: number;
}

export interface McpServerUpdateParams {
  name?: string;
  /** On a different host than before, send `headers` in the same call. */
  url?: string;
  transport?: McpServerTransport;
  /** Replaces all stored headers. `{}` removes them. */
  headers?: Record<string, string>;
  timeout_seconds?: number;
}

export interface McpServerTestParams {
  /** Merged over the stored headers for this test only; not stored */
  headers?: Record<string, string>;
}

export interface McpServerTool {
  name: string;
  description: string | null;
  /** The tool's parameters as JSON Schema */
  input_schema: Record<string, unknown>;
}

export type McpServerTestResult =
  | { ok: true; duration_ms: number; tools: McpServerTool[] }
  | { ok: false; duration_ms: number; error: string };

// --- Tool Templates ---

export type ToolTemplateType = "function" | "end_call" | "transfer_call";

/** `tool_config` of a `function` template: a webhook tool. */
export interface FunctionToolTemplateConfig {
  /**
   * Function name the model calls. Start with a letter or an underscore and use
   * only letters, digits, underscores and dashes, at most 64 characters. When
   * omitted, the template name is used, so it has to follow the same rule.
   */
  name?: string;
  /** Tells the model when and how to use this tool */
  description?: string;
  /** JSON Schema for the tool's arguments */
  parameters?: Record<string, unknown>;
  /** Webhook URL for this tool, overriding the assistant's webhook */
  url?: string;
  /** Fire-and-forget: don't wait for the webhook's response */
  async?: boolean;
}

/** `tool_config` of an `end_call` template: there is nothing to configure. */
export type EndCallToolTemplateConfig = Record<string, never>;

/** `tool_config` of a `transfer_call` template. */
export interface TransferCallToolTemplateConfig {
  destinations: TransferDestination[];
}

interface ToolTemplateBase {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** Discriminated on `tool_type`, so narrowing a template gives you its `tool_config`. */
export type ToolTemplate =
  | (ToolTemplateBase & { tool_type: "function"; tool_config: FunctionToolTemplateConfig })
  | (ToolTemplateBase & { tool_type: "end_call"; tool_config: EndCallToolTemplateConfig })
  | (ToolTemplateBase & { tool_type: "transfer_call"; tool_config: TransferCallToolTemplateConfig });

interface ToolTemplateCreateBase {
  /** Display name of the template */
  name: string;
  description?: string | null;
}

export type ToolTemplateCreateParams =
  | (ToolTemplateCreateBase & { tool_type: "function"; tool_config: FunctionToolTemplateConfig })
  | (ToolTemplateCreateBase & { tool_type: "end_call"; tool_config: EndCallToolTemplateConfig })
  | (ToolTemplateCreateBase & { tool_type: "transfer_call"; tool_config: TransferCallToolTemplateConfig });

export interface ToolTemplateUpdateParams {
  name?: string;
  description?: string | null;
  tool_type?: ToolTemplateType;
  /** Replaces the stored configuration. Its shape follows `tool_type`. */
  tool_config?: FunctionToolTemplateConfig | EndCallToolTemplateConfig | TransferCallToolTemplateConfig;
}

// --- Analysis Templates ---

export interface AnalysisTemplate {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  /** System message that sets the context for the analysis */
  system_prompt: string;
  /** User message. Placeholders: `{transcript}`, `{summary}`, `{duration}`, `{caller_number}` */
  user_prompt: string;
  /** JSON Schema of the data to extract */
  schema: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AnalysisTemplateCreateParams {
  name: string;
  description?: string | null;
  /** System message that sets the context for the analysis */
  system_prompt: string;
  /** User message. Placeholders: `{transcript}`, `{summary}`, `{duration}`, `{caller_number}` */
  user_prompt: string;
  /** JSON Schema of the data to extract */
  schema: Record<string, unknown>;
}

export interface AnalysisTemplateUpdateParams {
  name?: string;
  description?: string | null;
  system_prompt?: string;
  user_prompt?: string;
  schema?: Record<string, unknown>;
}

// --- Campaigns ---

export type CampaignStatus = "draft" | "scheduled" | "paused" | "completed" | "cancelled";

/**
 * The statuses you can set. `completed` is set by the platform, and a completed
 * campaign can no longer be changed.
 */
export type CampaignUpdateStatus = "draft" | "scheduled" | "paused" | "cancelled";

export type LeadStatus = "pending" | "calling" | "completed" | "failed" | "skipped";

export interface Campaign {
  id: string;
  name: string;
  agent_id: string;
  status: CampaignStatus;
  system_message_template: string | null;
  /** Daily start time, "HH:MM:SS" */
  schedule_start_time: string;
  /** Daily end time, "HH:MM:SS" */
  schedule_end_time: string;
  /** IANA timezone of the schedule */
  timezone: string;
  total_leads: number;
  completed_leads: number;
  failed_leads: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreateParams {
  name: string;
  agent_id: string;
  /** Template with `{{variables}}` filled in per lead */
  system_message_template?: string;
  /** Daily start time, "HH:MM:SS" */
  schedule_start_time: string;
  /** Daily end time, "HH:MM:SS" */
  schedule_end_time: string;
  /** IANA timezone of the schedule, e.g. "Europe/Amsterdam" */
  timezone: string;
  leads?: CampaignLeadCreateParams[];
}

export interface CampaignUpdateParams {
  name?: string;
  /** Use `scheduled` to start the campaign and `paused` to stop it */
  status?: CampaignUpdateStatus;
  system_message_template?: string;
  schedule_start_time?: string;
  schedule_end_time?: string;
  timezone?: string;
}

export interface CampaignLead {
  id: string;
  campaign_id: string;
  phone_number: string;
  variables: Record<string, string>;
  status: LeadStatus;
  call_id: string | null;
  attempts: number;
  last_attempt_at: string | null;
  created_at: string;
}

export interface CampaignLeadCreateParams {
  /** E.164, e.g. "+31612345678" */
  phone_number: string;
  /** Values for the `{{variables}}` in the campaign's system message template */
  variables?: Record<string, string>;
}

// --- Domains ---

/** A DNS record to add at your DNS provider. */
export interface DomainRecord {
  record?: string;
  name?: string;
  type?: string;
  ttl?: string;
  status?: string;
  value?: string;
  priority?: number;
}

export interface Domain {
  id: string;
  org_id: string;
  domain_name: string;
  resend_domain_id: string | null;
  /** Verification status, such as "not_started", "pending", "verified" or "failed" */
  status: string;
  region: string;
  /** DNS records to configure */
  records: DomainRecord[] | null;
  created_at: string;
  updated_at: string;
  verified_at: string | null;
}

export interface DomainCreateParams {
  /** Fully qualified domain name, e.g. "mail.example.com" */
  domain_name: string;
}

/** A domain in your Resend account. */
export interface ResendDomain {
  id: string;
  name: string;
  status: string;
  region: string;
}

export interface ResendDomainList {
  domains: ResendDomain[];
  /** Resend id of the domain currently selected for your organization */
  selected_domain_id: string | null;
}

export interface ResendDomainSyncParams {
  /** Resend id of the domain to select, from `listResendDomains()` */
  resendDomainId: string;
}

// --- Organizations ---

export interface Organization {
  id: string;
  name: string;
  /** Available minutes balance. */
  minutes_balance: number;
  monthly_usage_minutes: number;
  active_numbers: number;
  active_agents: number;
  active_calls: number;
  has_local_models_access?: boolean;
  /** Set when this is a child organization of an agency. */
  parent_org_id?: string | null;
  /** Only present when requested with `include_children`. */
  children?: OrganizationChild[];
}

export interface OrganizationGetParams {
  /** Include the child organizations in `children` */
  include_children?: boolean;
}

export interface OrganizationChild {
  id: string;
  name: string;
  created_at: string;
}

export interface OrganizationCreateParams {
  name: string;
  /** Bill the new organization to this parent (whitelabel). */
  parent_org_id?: string;
}

/** A newly created organization. The API key is returned once, here, and never again. */
export interface OrganizationCreated {
  id: string;
  name: string;
  parent_org_id?: string | null;
  api_key: string;
  created_at: string;
}

/** Retention periods in days. */
export interface OrganizationRetention {
  /** Transcript, summary, analysis result and recording. */
  content_retention_days: 30 | 90 | 180 | 365;
  /** Caller's phone number, campaign link and call events. */
  metadata_retention_days: 30 | 90 | 180 | 365 | 730;
}

/**
 * Both periods are required: they are validated against each other, and content
 * can never be kept longer than metadata, because a transcript usually repeats
 * the caller's number.
 */
export type OrganizationUpdateParams = OrganizationRetention;

// --- Webhook Payloads ---

export interface WebhookCallInfo {
  id: string;
  type: "inbound_phone_call" | "outbound_phone_call" | "web_call";
  /** How the call reached the platform. `whatsapp` for a call placed from WhatsApp. */
  channel?: CallChannel;
  status: string;
  /** Only on calls that are part of an Arena test, on the tested assistant */
  arena?: WebhookCallArena;
}

export interface WebhookPhoneNumber {
  /** `null` on web calls */
  id: string | null;
  /** `null` on web calls */
  number: string | null;
  name?: string | null;
}

export interface WebhookCustomer {
  /** `null` on web calls */
  number: string | null;
}

export interface WebhookBasePayload {
  message: {
    type: string;
    timestamp: string;
    call: WebhookCallInfo;
    phone_number: WebhookPhoneNumber;
    customer: WebhookCustomer;
    assistant?: Record<string, unknown>;
  };
}

export interface AssistantRequestPayload extends WebhookBasePayload {
  message: WebhookBasePayload["message"] & {
    type: "assistant-request";
  };
}

export interface StatusUpdatePayload extends WebhookBasePayload {
  message: WebhookBasePayload["message"] & {
    type: "status-update";
    error?: string;
    /** Why the call ended. Present once the call has ended. */
    end_reason?: string;
  };
}

export interface ToolCallsPayload extends WebhookBasePayload {
  message: WebhookBasePayload["message"] & {
    type: "tool-calls";
    tool_call_list: Array<{
      id: string;
      type: "function";
      function: {
        name: string;
        arguments: Record<string, unknown>;
      };
    }>;
  };
}

export interface EndOfCallReportPayload extends WebhookBasePayload {
  message: WebhookBasePayload["message"] & {
    type: "end-of-call-report";
    duration_seconds: number;
    /** Why the call ended, such as "user_hangup" or "max_duration" */
    end_reason?: string;
    started_at?: string;
    ended_at?: string;
    summary: string;
    messages: CallMessage[];
    analysis?: Record<string, unknown>;
    recording_url?: string;
  };
}

export type WebhookPayload =
  | AssistantRequestPayload
  | StatusUpdatePayload
  | ToolCallsPayload
  | EndOfCallReportPayload;

// ============================================================================
// Arena: test calls
// ============================================================================

export interface ArenaSuite {
  id: string;
  name: string;
  /** The assistant under test */
  assistant_id: string;
  /** Your number that routes to the assistant; the test caller calls it */
  number_id: string;
  /** Your number the test caller calls from, over your own SIP trunk */
  caller_number_id: string;
  created_at: string;
  updated_at?: string;
  /** Current test cases (only returned by getSuite) */
  cases?: ArenaCase[];
}

export interface ArenaSuiteCreateParams {
  name: string;
  assistant_id: string;
  number_id: string;
  /** Another number of yours with its own SIP trunk. A managed number cannot place calls. */
  caller_number_id: string;
}

export interface ArenaEntity {
  key: string;
  label?: string;
  value: string;
  /** How the caller says it. Default: each digit and letter spelled out. */
  spoken?: string;
}

export interface ArenaTimelineEvent {
  type: "noise" | "voice" | "barge_in" | "silence" | "dtmf" | "hangup";
  /** Seconds after the call was answered. Give either at_s or at_turn. */
  at_s?: number;
  /** The n-th turn of the assistant, from 1 */
  at_turn?: number;
  [field: string]: unknown;
}

export interface ArenaToolMode {
  mode: "live" | "mock" | "fault";
  response?: unknown;
  fault?: "error" | "timeout" | "delay";
  message?: string;
  delay_ms?: number;
  then?: "live" | "mock";
}

export type ArenaCriterionKind =
  | "must"
  | "must_not"
  | "audio_must"
  | "tool_required"
  | "tool_forbidden"
  | "transfer_expected"
  | "hangup_expected"
  | "entity_recall"
  | "latency_max";

export interface ArenaCriterion {
  id: string;
  kind: ArenaCriterionKind;
  severity?: "normal" | "critical";
  text?: string;
  tool?: string;
  arguments?: Record<string, unknown>;
  destination?: string;
  by?: "assistant" | "caller";
  entity?: string;
  stages?: ("understood" | "tool" | "repeated")[];
  metric?: string;
  max_ms?: number;
}

export interface ArenaCaseSaveParams {
  /** Saving with an existing key creates a new version */
  key: string;
  status?: "proposed" | "active";
  goal: string;
  tester_kind?: "speech_to_speech" | "scripted";
  tester_model?: "primary" | "secondary";
  persona_id?: string;
  language?: "nl" | "en";
  audio_profile_id?: string;
  channel?: "clean" | "speakerphone" | "muffled" | "packet_loss";
  channel_params?: Record<string, unknown>;
  timeline?: ArenaTimelineEvent[];
  facts?: Record<string, unknown>;
  entities?: ArenaEntity[];
  /** Every tool of the assistant needs a choice. There is no default. */
  tool_mode?: Record<string, ArenaToolMode>;
  max_duration_s?: number;
  criteria: ArenaCriterion[];
  source_call_ids?: string[];
}

export interface ArenaCase extends Omit<ArenaCaseSaveParams, "status"> {
  id: string;
  suite_id: string;
  version: number;
  status: "proposed" | "active" | "retired";
  language_plan?: { language: string };
  created_by?: "ai" | "user";
  created_at?: string;
}

export interface ArenaCaseListParams {
  /** Include retired versions */
  include_retired?: boolean;
}

export interface ArenaRunStartParams {
  /** Attempts per test case, 1 to 5 */
  repeats?: number;
  /** Only these active cases. Default: all active cases. */
  case_ids?: string[];
  /** "ci" marks a run started from your CI, so the trend can tell them apart. */
  trigger?: "manual" | "ci";
}

export interface ArenaRunEstimate {
  /** Estimated cost of the run in euros, on both legs and including the judge. An estimate, not an upper bound. */
  max_cost_eur: number;
  /** The same estimate in credits. A run only starts when your balance covers it. */
  max_credits: number;
  attempts: number;
  /** False if a price was missing and a conservative rate was used */
  complete: boolean;
}

export type ArenaVoidReason =
  | "no_answer"
  | "no_agent"
  | "not_routed_to_assistant"
  | "caller_id_mismatch"
  | "caller_trunk_rejected"
  | "credit_cap"
  | "transcript_missing"
  | "infra"
  | "tester_error"
  | "tester_unavailable"
  /** The case was retired, or replaced by a newer version, after the run started */
  | "case_retired";

export interface ArenaVerdict {
  criterion_id: string;
  outcome: "pass" | "fail" | "not_applicable";
  source: "fact" | "acoustic" | "judge" | "audio_judge";
  evidence_quote?: string | null;
  turn_index?: number | null;
  reasoning?: string | null;
  judge_prompt_version?: string | null;
  override_outcome?: string | null;
}

export interface ArenaMetric {
  metric_id: string;
  metric_version: string;
  value: number;
  unit: string;
}

export interface ArenaAttempt {
  id: string;
  case_id: string;
  attempt_no: number;
  status: "queued" | "claimed" | "dialing" | "in_call" | "awaiting_transcript" | "judging" | "scored" | "void" | "failed";
  void_reason?: ArenaVoidReason | null;
  last_error?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  latency?: Record<string, unknown> | null;
  /** The call of the test caller */
  tester_call_id?: string | null;
  /** The call on your assistant */
  target_call_id?: string | null;
  /**
   * Signed URLs of the recording per track, valid as long as the call recording.
   * Deleted with the calls under your retention period.
   */
  recordings?: ArenaAttemptRecordings | null;
  verdicts?: ArenaVerdict[];
  metrics?: ArenaMetric[];
}

export interface ArenaAttemptRecordings {
  /** The voice of the test caller */
  tester?: string;
  /** What the timeline played: noise and voices */
  events?: string;
  /** What the test caller heard from the line */
  assistant?: string;
  /** What your assistant received */
  received?: string;
}

export interface ArenaRun {
  id: string;
  suite_id: string;
  /** The assistant under test */
  assistant_id: string;
  /**
   * `cancelled` when the run was cancelled, also when an attempt that was in progress at that
   * moment finished afterwards.
   */
  status: "queued" | "running" | "done" | "cancelled";
  trigger: string;
  repeats: number;
  /** The estimated cost in euros at the start of the run. An estimate, not an upper bound. */
  estimated_max_cost_eur?: number | null;
  /** Hash of the assistant configuration at the start of the run */
  config_hash?: string | null;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  estimate?: ArenaRunEstimate;
  attempts?: ArenaAttempt[];
}

export type ArenaCatalog = Record<string, unknown>;

/** On calls that are part of an Arena test, on the tested assistant */
export interface WebhookCallArena {
  attempt_id: string;
  run_id: string;
  case_id: string;
  suite_id: string;
}

// ============================================================================
// Arena: routines, trend and events
// ============================================================================

export interface ArenaScheduleSaveParams {
  /** A routine is off until you enable it. */
  enabled?: boolean;
  cadence?: "daily" | "weekly";
  /** Required for weekly: 0 is Sunday. */
  weekday?: number | null;
  /** Start of the window, as HH:MM in `timezone`, for example "02:00". */
  window_start?: string;
  /** End of the window, as HH:MM. Each routine starts at a fixed moment within it. */
  window_end?: string;
  timezone?: string;
  repeats?: number;
  /** Required. At the budget the routine pauses and sends arena.schedule.paused. */
  monthly_budget_eur: number;
  /** Also run after the configuration of the assistant changed (after 15 quiet minutes). */
  on_config_change?: boolean;
  /** Also run after a platform release. */
  on_platform_release?: boolean;
  /**
   * Where the Arena events of this routine go: an https URL on a public hostname, on port 443.
   * Without it, they go to the webhook of your organization.
   */
  webhook_url?: string | null;
  /** Also e-mail regressions and pauses to the owners and admins of your organization (default true). */
  notify_email?: boolean;
}

export interface ArenaSchedule extends Required<Omit<ArenaScheduleSaveParams, "weekday" | "webhook_url">> {
  id: string;
  suite_id: string;
  weekday: number | null;
  /** Start of the window, as HH:MM in `timezone`, for example "02:00". */
  window_start: string;
  /** End of the window, as HH:MM. */
  window_end: string;
  webhook_url: string | null;
  /** Actual cost of its finished runs this month, plus the estimate of runs in progress. */
  spent_this_month_eur: number;
  /** Estimated cost of one run, in credits, as last estimated. An estimate, not an upper bound. */
  estimated_run_credits: number;
  paused_reason: "budget" | "insufficient_credits" | "failed_to_start" | null;
  paused_detail: string | null;
  paused_at: string | null;
  next_run_at: string | null;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArenaTrendCell {
  /** Passed */
  k: number;
  /** Judged (not_applicable does not count) */
  n: number;
  /** Lower bound of the 95% Wilson interval */
  low: number;
  /** Upper bound of the 95% Wilson interval */
  high: number;
}

export interface ArenaRegression {
  case_key: string;
  criterion_id: string;
  critical: boolean;
  detected_run_id: string | null;
  detail: {
    current?: { passed: number; judged: number };
    baseline?: { passed: number; judged: number };
    p_value?: number | null;
    config_changed?: boolean;
  };
  opened_at: string;
}

export interface ArenaTrend {
  /** Compare with config_hash of a run: different means the result is outdated. */
  current_config_hash: string;
  runs: {
    id: string;
    created_at: string;
    trigger: "manual" | "schedule" | "config_change" | "platform_release" | "ci";
    status: string;
    config_hash: string | null;
    platform_version: Record<string, unknown> | null;
  }[];
  rows: { case_key: string; criterion_id: string; per_run: Record<string, ArenaTrendCell> }[];
  open_regressions: ArenaRegression[];
}

export interface ArenaTrendParams {
  /** Number of runs, 1 to 50 (default 20). */
  limit?: number;
}

/** The arena object of an Arena event. */
export interface ArenaEventData {
  suite_id: string;
  schedule_id: string;
  run_id?: string;
  [key: string]: unknown;
}

export type ArenaEventType =
  | "arena.run.completed"
  | "arena.regression.detected"
  | "arena.regression.resolved"
  | "arena.schedule.paused";

/**
 * An event of an Arena routine. Only sent for a suite with a routine, to the `webhook_url` of the
 * routine or else to the webhook of your organization. Same envelope and signature as the call
 * webhooks, signed with the webhook secret of your organization.
 *
 * Not part of `WebhookPayload`. Verify it with `Webhooks.verify<ArenaEventPayload>()`, or with
 * `Webhooks.verify<WebhookPayload | ArenaEventPayload>()` on an endpoint that receives both.
 */
export interface ArenaEventPayload {
  message: {
    /** The id of the event. It is the same on every delivery of the event: use it to drop duplicates. */
    id: string;
    type: ArenaEventType;
    timestamp: string;
    arena: ArenaEventData;
  };
}

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
export const REALTIME_LLM_PROVIDERS = ["google_realtime", "xai_realtime", "openai_live"] as const;

export type RealtimeLLMProvider = (typeof REALTIME_LLM_PROVIDERS)[number];

/** Every LLM provider an assistant can run on (catalog section `llm`). */
export const LLM_PROVIDERS = [...TEXT_LLM_PROVIDERS, ...REALTIME_LLM_PROVIDERS] as const;

export type LLMProvider = (typeof LLM_PROVIDERS)[number];

/** Text-to-speech providers (catalog section `tts`). */
export const TTS_PROVIDERS = ["elevenlabs", "inworld", "google", "xai"] as const;

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
  voice?: GoogleRealtimeVoice | XAIRealtimeVoice | OpenAILiveVoice;
  temperature?: number;
  /**
   * `openai` and `google` only (1-32768): the most tokens the model may produce
   * per reply. When omitted, the provider's own limit applies.
   */
  max_completion_tokens?: number;
  /** `openai_live` only: the backend model the voice model hands reasoning and tool calls to */
  delegation?: LLMDelegation;
  /** `xai_realtime` only: server-side turn detection. Omitted fields use the provider default. */
  turn_detection?: XAITurnDetection;
  messages?: LLMMessage[];
  tools?: ToolDefinition[];
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
  /** ElevenLabs only */
  model?: string;
  /** Inworld only */
  language?: string;
  /** ElevenLabs only (0-1) */
  stability?: number;
  /** ElevenLabs only (0-1) */
  similarity_boost?: number;
  /** ElevenLabs only */
  use_speaker_boost?: boolean;
  /** Both providers (0.5-2) */
  speed?: number;
  /** ElevenLabs only (0-1) */
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

export type CallStatus = "connecting" | "in-progress" | "ended" | "failed";

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
  status: string;
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

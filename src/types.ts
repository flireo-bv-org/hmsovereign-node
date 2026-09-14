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

export interface ApiError {
  error: string;
  message?: string;
  param?: string;
  type?: string;
}

// --- Providers ---
//
// The provider ids below mirror the platform catalog (`catalog/config-catalog.yaml`
// in the api-spec repo, published as `catalog/config-catalog.json`). That catalog is
// the single source of truth: the API validates a config against it, and a provider
// it knows but this SDK does not is a provider you cannot express in TypeScript.
//
// They are runtime arrays rather than bare unions so `tests/catalog.test.ts` can
// compare them against a vendored copy of the catalog. The union is derived from the
// array, so the two can never drift from each other.

/** Speech-to-text providers (catalog section `stt`). */
export const STT_PROVIDERS = ["deepgram", "elevenlabs", "gladia", "mistral"] as const;

export type STTProvider = (typeof STT_PROVIDERS)[number];

/**
 * Text (pipeline) LLM providers: the ones that transcribe, think and speak in
 * separate steps. A workflow node may only override to one of these - a realtime
 * provider per node is rejected at write time.
 */
export const TEXT_LLM_PROVIDERS = ["openai", "xai", "mistral"] as const;

export type TextLLMProvider = (typeof TEXT_LLM_PROVIDERS)[number];

/** Realtime (speech-to-speech) LLM providers. */
export const REALTIME_LLM_PROVIDERS = ["google_realtime", "xai_realtime"] as const;

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
  voice?: GoogleRealtimeVoice | XAIRealtimeVoice;
  temperature?: number;
  messages?: LLMMessage[];
  tools?: ToolDefinition[];
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
}

// --- Analysis ---

export interface AnalysisPlan {
  structured_data_plan?: {
    enabled: boolean;
    template_id?: string;
  };
}

// --- Assistant / Agent ---

export interface Assistant {
  id: string;
  name: string;
  business_name?: string | null;
  notification_email?: string | null;
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
  tts_config: TTSConfig;
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
  stt_config?: STTConfig;
  llm_config?: LLMConfig;
  tts_config?: TTSConfig;
}

export interface AssistantUpdateParams {
  name?: string;
  business_name?: string | null;
  notification_email?: string | null;
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
  stt_config?: STTConfig;
  llm_config?: LLMConfig;
  tts_config?: TTSConfig;
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

/** Built-in tool: hands the caller over to one of the listed destinations. */
export interface WorkflowNodeTransferCallTool {
  type: "transfer_call" | "transferCall";
  destinations: Array<{
    type: "number";
    /** E.164, e.g. "+31612345678" */
    number: string;
    /** Shown to the model so it knows when to pick this destination */
    description: string;
    /** Spoken to the caller before transferring */
    message?: string;
  }>;
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
  role: "user" | "assistant";
  content: string;
}

export interface Call {
  id: string;
  caller_phone: string;
  assistant_phone: string;
  status: CallStatus;
  direction?: "inbound" | "outbound";
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

export interface SipTrunk {
  id: string;
  name: string;
  provider?: string;
  inbound_addresses?: string[];
  outbound_address?: string;
  outbound_number?: string;
  auth_username?: string;
  created_at: string;
  updated_at: string;
}

export interface SipTrunkCreateParams {
  name: string;
  provider?: string;
  inbound_addresses?: string[];
  outbound_address?: string;
  outbound_number?: string;
  auth_username?: string;
  auth_password?: string;
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
  duration_sec?: number;
  phone_number?: string;
  agent_name?: string;
  business_name?: string;
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

export type BYOKProvider = "deepgram" | "openai" | "elevenlabs" | "resend" | "xai" | "gladia" | "mistral";

/** BYOK keys as stored — vault secret IDs per provider */
export interface BYOKKeys {
  deepgram_secret_id?: string | null;
  openai_secret_id?: string | null;
  elevenlabs_secret_id?: string | null;
  resend_secret_id?: string | null;
  xai_secret_id?: string | null;
  gladia_secret_id?: string | null;
  mistral_secret_id?: string | null;
}

export interface BYOKSetParams {
  provider: BYOKProvider;
  api_key: string;
}

export interface BYOKDeleteParams {
  provider: BYOKProvider;
}

// --- Tool Templates ---

export interface ToolTemplate {
  id: string;
  name: string;
  description?: string;
  function_definition: ToolDefinition["function"];
  server_url?: string;
  server_secret?: string;
  async?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToolTemplateCreateParams {
  name: string;
  description?: string;
  function_definition: ToolDefinition["function"];
  server_url?: string;
  server_secret?: string;
  async?: boolean;
}

export interface ToolTemplateUpdateParams {
  name?: string;
  description?: string;
  function_definition?: ToolDefinition["function"];
  server_url?: string;
  server_secret?: string;
  async?: boolean;
}

// --- Analysis Templates ---

export interface AnalysisTemplate {
  id: string;
  name: string;
  description?: string;
  schema: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AnalysisTemplateCreateParams {
  name: string;
  description?: string;
  schema: Record<string, unknown>;
}

export interface AnalysisTemplateUpdateParams {
  name?: string;
  description?: string;
  schema?: Record<string, unknown>;
}

// --- Campaigns ---

export type CampaignStatus = "draft" | "scheduled" | "paused" | "completed";
export type LeadStatus = "pending" | "calling" | "completed" | "failed" | "no_answer";

export interface Campaign {
  id: string;
  name: string;
  agent_id: string;
  status: CampaignStatus;
  system_message_template?: string | null;
  schedule_start_time?: string | null;
  schedule_end_time?: string | null;
  timezone?: string | null;
  total_leads?: number;
  completed_leads?: number;
  failed_leads?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreateParams {
  name: string;
  agent_id: string;
  system_message_template?: string;
  schedule_start_time?: string;
  schedule_end_time?: string;
  timezone?: string;
  leads?: CampaignLeadCreateParams[];
}

export interface CampaignUpdateParams {
  name?: string;
  status?: CampaignStatus;
  system_message_template?: string;
  schedule_start_time?: string;
  schedule_end_time?: string;
  timezone?: string;
}

export interface CampaignLead {
  id: string;
  campaign_id: string;
  phone_number: string;
  name?: string;
  status: LeadStatus;
  variables?: Record<string, string>;
  call_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignLeadCreateParams {
  phone_number: string;
  name?: string;
  variables?: Record<string, string>;
}

// --- Domains ---

export interface Domain {
  id: string;
  domain: string;
  verified: boolean;
  created_at: string;
}

export interface DomainCreateParams {
  domain: string;
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
  number: string;
  name?: string;
}

export interface WebhookCustomer {
  number: string;
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

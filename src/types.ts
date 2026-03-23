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

// --- STT Config ---

export type STTProvider = "deepgram" | "elevenlabs" | "gladia" | "mistral";

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

export type LLMProvider = "openai" | "xai_realtime" | "xai" | "mistral";

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
  /** xAI Realtime only */
  voice?: "ara" | "rex" | "sal" | "eve" | "leo";
  temperature?: number;
  messages?: LLMMessage[];
  tools?: ToolDefinition[];
}

// --- TTS Config ---

export type TTSProvider = "elevenlabs" | "inworld";

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
  source?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumberCreateParams {
  phone_number: string;
  agent_id?: string;
  transfer_trunk_id?: string;
  is_active?: boolean;
}

export interface PhoneNumberUpdateParams {
  agent_id?: string | null;
  transfer_trunk_id?: string | null;
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
  email?: string;
  credits_balance?: number;
  plan?: string;
  created_at: string;
}

export interface OrganizationCreateParams {
  name: string;
  email?: string;
}

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

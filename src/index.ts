import { HttpClient } from "./client";
import type { ClientOptions } from "./client";
import { Assistants } from "./resources/assistants";
import { Calls } from "./resources/calls";
import { Numbers } from "./resources/numbers";
import { Campaigns } from "./resources/campaigns";
import { SipTrunks } from "./resources/sip-trunks";
import { Voices } from "./resources/voices";
import { Usage } from "./resources/usage";
import { BYOK } from "./resources/byok";
import { ToolTemplates } from "./resources/tool-templates";
import { AnalysisTemplates } from "./resources/analysis-templates";
import { Domains } from "./resources/domains";
import { Organizations } from "./resources/organizations";

export class HMSSovereign {
  readonly assistants: Assistants;
  readonly calls: Calls;
  readonly numbers: Numbers;
  readonly campaigns: Campaigns;
  readonly sipTrunks: SipTrunks;
  readonly voices: Voices;
  readonly usage: Usage;
  readonly byok: BYOK;
  readonly toolTemplates: ToolTemplates;
  readonly analysisTemplates: AnalysisTemplates;
  readonly domains: Domains;
  readonly organizations: Organizations;

  constructor(options: ClientOptions) {
    const client = new HttpClient(options);

    this.assistants = new Assistants(client);
    this.calls = new Calls(client);
    this.numbers = new Numbers(client);
    this.campaigns = new Campaigns(client);
    this.sipTrunks = new SipTrunks(client);
    this.voices = new Voices(client);
    this.usage = new Usage(client);
    this.byok = new BYOK(client);
    this.toolTemplates = new ToolTemplates(client);
    this.analysisTemplates = new AnalysisTemplates(client);
    this.domains = new Domains(client);
    this.organizations = new Organizations(client);
  }
}

/** @deprecated Use HMSSovereign instead */
export const HmsSovereign = HMSSovereign;

// Re-export everything
export { Page, AutoPaginator } from "./pagination";
export { Webhooks, WebhookVerificationError } from "./webhooks";
export type { WebhookVerifyOptions } from "./webhooks";
export type { ClientOptions } from "./client";
export {
  HmsSovereignError,
  ApiRequestError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  InsufficientCreditsError,
} from "./errors";

// Re-export all types
export type {
  // Common
  Pagination,
  ApiError,

  // STT
  STTProvider,
  STTConfig,

  // LLM
  LLMProvider,
  LLMMessage,
  LLMConfig,
  ToolDefinition,

  // TTS
  TTSProvider,
  TTSConfig,

  // Analysis
  AnalysisPlan,

  // Assistants
  Assistant,
  AssistantCreateParams,
  AssistantUpdateParams,

  // Phone Numbers
  PhoneNumber,
  PhoneNumberCreateParams,
  PhoneNumberUpdateParams,

  // Calls
  CallStatus,
  CallMessage,
  Call,
  CallListParams,
  TransientAssistant,
  OutboundCallParams,
  OutboundCallResponse,

  // Call Control
  ControlCommandType,
  InjectContextCommand,
  SayCommand,
  EndCallCommand,
  TransferCommand,
  CallControlCommand,
  CallControlResponse,

  // SIP Trunks
  SipTrunk,
  SipTrunkCreateParams,

  // Voices
  Voice,
  XaiRealtimeVoice,

  // Usage
  UsageLog,
  UsageSummary,
  UsageListParams,

  // BYOK
  BYOKProvider,
  BYOKKeys,
  BYOKSetParams,
  BYOKDeleteParams,

  // Tool Templates
  ToolTemplate,
  ToolTemplateCreateParams,
  ToolTemplateUpdateParams,

  // Analysis Templates
  AnalysisTemplate,
  AnalysisTemplateCreateParams,
  AnalysisTemplateUpdateParams,

  // Campaigns
  CampaignStatus,
  LeadStatus,
  Campaign,
  CampaignCreateParams,
  CampaignUpdateParams,
  CampaignLead,
  CampaignLeadCreateParams,

  // Domains
  Domain,
  DomainCreateParams,

  // Organizations
  Organization,
  OrganizationCreateParams,

  // Webhooks
  WebhookCallInfo,
  WebhookPhoneNumber,
  WebhookCustomer,
  WebhookBasePayload,
  AssistantRequestPayload,
  StatusUpdatePayload,
  ToolCallsPayload,
  EndOfCallReportPayload,
  WebhookPayload,
} from "./types";

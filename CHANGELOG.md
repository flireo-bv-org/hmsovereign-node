# Changelog

All notable changes to this package are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this package follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `client.workflows` with `list`, `create`, `get`, `update` and `delete`, and types for workflow definitions.
- `workflow_id` on the phone number create and update parameters. On update, `null` detaches a workflow.
- `client.organizations.update()` to set an organization's retention periods.
- The `google` and `xai` text-to-speech providers and the `google_realtime` LLM provider in the type definitions.
- New exported types: `OrganizationChild`, `OrganizationCreated`, `OrganizationRetention` and `OrganizationUpdateParams`.
- `byok.saveConfig()` to save provider-specific settings for a BYOK provider.
- `organizations.get()` accepts `include_children` to return the child organizations.
- `speech_config` and `analysis_plan` on the assistant create and update parameters, and `notification_emails` and `recording_consent` on the update parameters. `Assistant` includes all four.
- `max_completion_tokens`, `delegation` and `turn_detection` on `LLMConfig`, and `speaking_rate` on `TTSConfig`.
- The `google` text LLM and speech-to-text providers, and the `openai_live` realtime LLM provider with its voices.
- `call_type` on usage logs.
- `end_reason`, `started_at` and `ended_at` on webhook payloads, and `id` on the webhook phone number.
- `body` and `details` on `ApiRequestError`.
- New exported types: `BYOKConfig`, `BYOKConfigParams`, `CampaignUpdateStatus`, `DomainRecord`, `EndCallToolTemplateConfig`, `FunctionToolTemplateConfig`, `LLMDelegation`, `OpenAILiveVoice`, `OrganizationGetParams`, `RecordingConsent`, `ResendDomain`, `ResendDomainList`, `ResendDomainSyncParams`, `SipTrunkTransport`, `SpeechConfig`, `ToolTemplateType`, `TransferCallToolTemplateConfig`, `TransferDestination` and `XAITurnDetection`.

### Changed

- `Organization` matches the response of `GET /organizations`.
- `organizations.create()` returns `OrganizationCreated`, which includes the API key issued for the new organization.
- `OrganizationCreateParams` drops `email` and adds `parent_org_id`.
- The package exports separate type definitions for `import` and `require`, so ESM projects resolve the ESM types.
- The `User-Agent` header reports the installed package version.
- `sipTrunks.create()` sends `name`, `provider` and `address`, plus the optional `auth_username`, `auth_password` and `transport`. `SipTrunk` includes `address`, `transport` and `is_active`.
- Tool templates use `tool_type` and `tool_config`. `ToolTemplate` and `ToolTemplateCreateParams` are discriminated on `tool_type`.
- Creating an analysis template requires `system_prompt`, `user_prompt` and `schema`.
- `domains.create()` takes `domain_name` and `domains.syncResendDomain()` takes `resendDomainId`. `get()`, `create()`, `verify()`, `refresh()` and `syncResendDomain()` return the domain itself, and `get()` returns `null` when no domain is configured. `listResendDomains()` returns `{ domains, selected_domain_id }`.
- `campaigns.create()` requires `schedule_start_time`, `schedule_end_time` and `timezone`. `CampaignStatus` includes `cancelled`, and a campaign update cannot set `completed`.
- `campaigns.listLeads()` returns the leads as an array.
- `LeadStatus` includes `skipped` instead of `no_answer`, and `CampaignLead` includes `attempts` and `last_attempt_at`.
- `BYOKProvider` includes `inworld`, `google` and `google_vertex`.
- `Call.caller_phone` and `Call.assistant_phone` can be `null`, `Call.direction` can be `web`, and transcript messages can have the `system` role.
- `Assistant.tts_config` is `null` for realtime assistants, and `AnalysisPlan` matches the analysis options.
- `phone_number.number` and `customer.number` in webhook payloads can be `null` on web calls.
- Path parameters are percent-encoded. An empty value, `.` or `..` is rejected before a request is sent.
- GET, PUT and DELETE requests are retried on 5xx responses, timeouts and network errors. POST and PATCH requests are retried only on 429. On 429 the client waits for the `Retry-After` header, up to 30 seconds.
- When the API returns both `error` and `message`, the error message contains both.
- Debug output masks the values of keys that look like secrets.
- The error for a missing API key links to https://dashboard.voicedock.ai.
- `CallStatus` includes `ringing`, `ended-with-error`, `transferred`, `rejected` and `insufficient-credits`, and accepts other values the API returns.

### Removed

- Support for Node.js 20, which reached end of life on 30 April 2026. The package requires Node.js 22 or later.
- `byok.getConfig()`.
- The `limit` and `offset` parameters of `campaigns.listLeads()`.
- `name` on `CampaignLeadCreateParams` and `CampaignLead`, and `updated_at` on `CampaignLead`.
- `code` and `param` on `ApiRequestError`, and `type` and `param` on `ApiError`.
- `inbound_addresses`, `outbound_address` and `outbound_number` on the SIP trunk types, and `function_definition`, `server_url` and `server_secret` on the tool template types.
- `template_id` on `AnalysisPlan.structured_data_plan`.

## [1.0.1] - 2026-03-24

### Changed

- The main class is exported as `HMSSovereign`. `HmsSovereign` remains available as a deprecated alias.

## [1.0.0] - 2026-03-24

### Added

- First release, with resources for assistants, calls and call control, phone numbers, campaigns, SIP trunks, voices, usage, BYOK, tool templates, analysis templates, domains and organizations.
- Auto-pagination with `listAll()` on calls and usage.
- Automatic retries with exponential backoff on 5xx and 429 responses.
- Webhook signature verification.

[Unreleased]: https://github.com/flireo-bv-org/hmsovereign-node/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/flireo-bv-org/hmsovereign-node/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/flireo-bv-org/hmsovereign-node/releases/tag/v1.0.0

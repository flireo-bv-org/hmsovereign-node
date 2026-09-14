# Changelog

All notable changes to this package are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this package follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `client.workflows` with `list`, `create`, `get`, `update` and `delete`, and types for workflow definitions.
- `workflow_id` on the phone number create and update parameters. On update, `null` detaches a workflow.
- `client.organizations.update()` to set an organization's retention periods.
- The `google` and `xai` text-to-speech providers and the `google_realtime` LLM provider in the type definitions.
- New exported types: `OrganizationChild`, `OrganizationCreated`, `OrganizationRetention` and `OrganizationUpdateParams`.

### Changed

- `Organization` matches the response of `GET /organizations`.
- `organizations.create()` returns `OrganizationCreated`, which includes the API key issued for the new organization.
- `OrganizationCreateParams` drops `email` and adds `parent_org_id`.

### Removed

- Support for Node.js 20, which reached end of life on 30 April 2026. The package requires Node.js 22 or later.

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

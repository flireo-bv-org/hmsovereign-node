# CLAUDE.md

This repository is public. Everything you push, including branches, commits and pull request descriptions, is visible to anyone. Follow [CONTRIBUTING.md](CONTRIBUTING.md).

Before you push, check that commit messages, the pull request description, branch names, code comments, fixtures and documentation:

- are in English and written for someone who uses the SDK;
- contain no references to private repositories, local paths, internal systems or internal processes.

## Commands

- `npm run typecheck`
- `npm test`, which includes the type tests
- `npm run build`

## Layout

- `src/client.ts`: the HTTP client, retries and error mapping
- `src/resources/`: one class per API resource
- `src/types.ts`: request and response types
- `src/webhooks.ts`: webhook signature verification
- `tests/`: unit tests and type tests

# Contributing

This repository is public. Everything pushed to it, including branches, commits and pull requests, is visible to anyone.

## Writing for this repository

- Write commits, pull requests, branch names, code comments and documentation in English, for someone who uses the SDK.
- Describe what changes for users of the SDK. Leave out internal systems, internal processes and links to private repositories.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and pull request titles, for example `feat: add campaigns.pause()` or `fix: encode path parameters`.
- Add user-facing changes to the `Unreleased` section of [CHANGELOG.md](CHANGELOG.md).

## Development

Use the Node.js version from `engines` in `package.json`.

```bash
npm ci
npm run typecheck
npm test
npm run build
```

`npm test` also runs the type tests in `tests/**/*.test-d.ts`. `npm run check:readme` typechecks the examples in `README.md`.

## Keeping up with the API

`tests/coverage.test.ts` compares the operations the SDK requests with `tests/fixtures/api-operations.json`, a list taken from the published API specification. When the API changes, run `npm run refresh:api-operations`, then either wrap the new operation or add it to `NOT_WRAPPED` with a reason. A scheduled workflow fails when the published specification no longer matches the list.

## Pull requests

- Keep a pull request to one change.
- Pull requests are squash-merged into `main`.
- CI runs the typecheck, the tests and the build on every pull request.

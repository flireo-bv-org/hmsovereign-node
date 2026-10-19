# VoiceDock Node.js SDK

The official Node.js and TypeScript SDK for [VoiceDock](https://voicedock.ai), published on npm as `hmsovereign`.

[![CI](https://github.com/flireo-bv-org/hmsovereign-node/actions/workflows/ci.yml/badge.svg)](https://github.com/flireo-bv-org/hmsovereign-node/actions/workflows/ci.yml)

## Installation

```bash
npm install hmsovereign
```

Requires Node.js 22 or later. The package has no runtime dependencies.

## Quick start

```typescript
import { HMSSovereign } from 'hmsovereign';

const client = new HMSSovereign({
  apiKey: process.env.VOICEDOCK_API_KEY!,
});

// Create an assistant
const assistant = await client.assistants.create({
  name: 'Customer Support',
  first_message: 'Hello, how can I help you today?',
  llm_config: {
    provider: 'openai',
    model: 'gpt-5.4-mini',
    messages: [{ role: 'system', content: 'You are a helpful customer support agent.' }],
  },
  stt_config: { provider: 'deepgram', model: 'nova-3-general', language: 'en' },
  tts_config: { provider: 'elevenlabs', voice_id: 'ukiwGs47sHyibruHJ1vg' },
});

// Place an outbound call
const call = await client.calls.create({
  destination: '+31612345678',
  assistant_id: assistant.id,
});

console.log(call.call_id);
```

You create an API key in the [VoiceDock dashboard](https://dashboard.voicedock.ai).

## Webhooks

Verify the signature of an incoming webhook against the raw request body:

```typescript
import { Webhooks } from 'hmsovereign';

const event = Webhooks.verify({
  payload: rawBody,            // the raw request body, as a string or Buffer
  signature: signatureHeader,  // the X-Webhook-Signature header
  timestamp: timestampHeader,  // the X-Webhook-Timestamp header
  secret: process.env.WEBHOOK_SECRET!,
});

if (event.message.type === 'end-of-call-report') {
  console.log(event.message.summary);
}
```

Arena routines send their events with the same signature, signed with the webhook secret of your organization. They are not part of `WebhookPayload`, so name the payload type when an endpoint receives them:

```typescript
import { Webhooks, type ArenaEventPayload, type WebhookPayload } from 'hmsovereign';

const event = Webhooks.verify<WebhookPayload | ArenaEventPayload>({
  payload: rawBody,
  signature: signatureHeader,
  timestamp: timestampHeader,
  secret: process.env.WEBHOOK_SECRET!,
});

if (event.message.type === 'arena.regression.detected') {
  // The same id on every delivery of this event
  console.log(event.message.id, event.message.arena.suite_id);
}
```

## Documentation

The full reference, including call control, pagination, campaigns and error handling, is on [doc.voicedock.ai](https://doc.voicedock.ai/docs/sdks/node). The [API reference](https://doc.voicedock.ai/docs/api/assistants/listAssistants) documents the underlying REST API.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Security

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)

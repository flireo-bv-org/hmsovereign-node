# HMS Sovereign Node.js SDK

Official Node.js/TypeScript SDK for the [HMS Sovereign](https://hmsovereign.com) Voice AI Platform API.

[![CI](https://github.com/flireo-bv-org/hmsovereign-node/actions/workflows/ci.yml/badge.svg)](https://github.com/flireo-bv-org/hmsovereign-node/actions/workflows/ci.yml)

## Installation

```bash
npm install hmsovereign
```

## Quick Start

```typescript
import { HmsSovereign } from 'hmsovereign';

const client = new HmsSovereign({
  apiKey: 'fl_live_...',
});

// List all assistants
const assistants = await client.assistants.list();

// Create an assistant
const assistant = await client.assistants.create({
  name: 'Customer Support',
  first_message: 'Hello, how can I help you today?',
  llm_config: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: 'You are a helpful customer support agent.' }],
  },
  stt_config: {
    provider: 'deepgram',
    model: 'nova-3-general',
    language: 'nl',
  },
  tts_config: {
    provider: 'elevenlabs',
    voice_id: 'ukiwGs47sHyibruHJ1vg',
  },
});

// Make an outbound call
const call = await client.calls.create({
  destination: '+31612345678',
  assistant_id: assistant.id,
});

console.log(`Call started: ${call.call_id}`);
```

## Resources

All resources are available as properties on the client:

```typescript
client.assistants         // CRUD for AI voice assistants
client.calls              // List calls, make outbound calls, call control
client.numbers            // Phone number management
client.campaigns          // Outbound call campaigns with leads
client.sipTrunks          // SIP trunk configuration
client.voices             // List available TTS voices
client.usage              // Usage logs and billing
client.byok               // Bring Your Own Key management
client.toolTemplates      // Reusable tool/function templates
client.analysisTemplates  // Post-call analysis schemas
client.domains            // Custom domain configuration
client.organizations      // Organization management
```

## Outbound Calls

Three modes for outbound calls:

```typescript
// 1. Reference mode — use a saved assistant
await client.calls.create({
  destination: '+31612345678',
  assistant_id: 'uuid-of-saved-assistant',
});

// 2. Transient mode — one-time assistant config
await client.calls.create({
  destination: '+31612345678',
  assistant: {
    first_message: 'Hi John, this is a reminder about your appointment.',
    llm_config: { provider: 'openai', model: 'gpt-4o-mini' },
    stt_config: { provider: 'deepgram', model: 'nova-3-general', language: 'nl' },
    tts_config: { provider: 'elevenlabs', voice_id: 'ukiwGs47sHyibruHJ1vg' },
  },
});

// 3. Hybrid mode — saved assistant with overrides
await client.calls.create({
  destination: '+31612345678',
  assistant_id: 'uuid-of-saved-assistant',
  assistant_override: {
    first_message: 'Good afternoon John, calling about your order.',
  },
});
```

## Call Control

Control active calls in real-time:

```typescript
// Inject context (invisible to caller)
await client.calls.injectContext(callId, 'Customer is a VIP member', true);

// Make the agent say something
await client.calls.say(callId, 'Please hold while I look that up.');

// Transfer to a human
await client.calls.transfer(callId, '+31201234567', 'Transferring you now.');

// End the call
await client.calls.end(callId, 'Thank you for calling. Goodbye!');
```

## Pagination

Paginated endpoints return a `Page` with metadata:

```typescript
// Single page
const page = await client.calls.list({ status: 'ended', limit: 50 });
console.log(page.data);           // Call[]
console.log(page.pagination);     // { total, limit, offset }
console.log(page.hasMore);        // boolean
console.log(page.nextOffset);     // number

// Auto-paginate through ALL results
for await (const call of client.calls.listAll({ status: 'ended' })) {
  console.log(call.id, call.duration_seconds);
}

// Or collect into an array
const allCalls = await client.calls.listAll({ status: 'ended' }).toArray();
```

Auto-pagination is available on `client.calls.listAll()` and `client.usage.listAll()`.

## Campaigns

Run automated outbound call campaigns:

```typescript
// Create a campaign with leads
const campaign = await client.campaigns.create({
  name: 'Appointment Reminders',
  agent_id: assistant.id,
  system_message_template: 'Call {{name}} about their appointment on {{date}}',
  schedule_start_time: '09:00',
  schedule_end_time: '17:00',
  timezone: 'Europe/Amsterdam',
  leads: [
    {
      phone_number: '+31612345678',
      name: 'Jan de Vries',
      variables: { date: '2026-03-25', time: '14:00' },
    },
  ],
});

// Add more leads later
await client.campaigns.addLead(campaign.id, {
  phone_number: '+31698765432',
  name: 'Pieter Bakker',
  variables: { date: '2026-03-26', time: '10:00' },
});
```

## Webhook Verification

Verify webhook signatures in your endpoint:

```typescript
import { Webhooks } from 'hmsovereign';

// Express example (use raw body!)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const event = Webhooks.verify({
      payload: req.body,
      signature: req.headers['x-webhook-signature'] as string,
      timestamp: req.headers['x-webhook-timestamp'] as string,
      secret: process.env.WEBHOOK_SECRET!,
    });

    switch (event.message.type) {
      case 'assistant-request':
        // Return dynamic config before call is answered
        res.json({ assistant: { first_message: 'Hello!' } });
        break;
      case 'tool-calls':
        // Handle function calls from the AI agent
        const toolCall = event.message.tool_call_list[0];
        res.json({ result: { status: 'ok' } });
        break;
      case 'end-of-call-report':
        // Process call summary, transcript, analysis
        console.log(event.message.summary);
        res.sendStatus(200);
        break;
      default:
        res.sendStatus(200);
    }
  } catch (error) {
    res.status(400).send('Invalid signature');
  }
});
```

## Error Handling

The SDK throws typed errors you can catch with `instanceof`:

```typescript
import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  InsufficientCreditsError,
} from 'hmsovereign';

try {
  await client.assistants.get('non-existent-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Assistant not found');
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited, retry after ${error.retryAfter}s`);
  } else if (error instanceof InsufficientCreditsError) {
    console.log('Top up your credits');
  }
}
```

## Configuration

```typescript
const client = new HmsSovereign({
  apiKey: 'fl_live_...',        // Required
  baseUrl: 'https://...',       // Default: https://api.hmsovereign.com/api/v1
  maxRetries: 2,                // Default: 2 (retries on 5xx and 429)
  timeout: 30_000,              // Default: 30s
  debug: true,                  // Default: false — logs requests/responses
});
```

## Requirements

- Node.js 20+ (uses native `fetch`)
- Zero runtime dependencies

## Links

- [Documentation](https://doc.hmsovereign.com)
- [API Reference](https://api.hmsovereign.com/api/openapi.json)
- [Dashboard](https://app.hmsovereign.com)

## License

MIT

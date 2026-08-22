# event-bus

Shared Redis pub/sub layer + event contracts for the interop layer.
Nobody edits `contracts/` except the event-bus owner — everyone else imports it.

## Install

```bash
npm install
```

Requires a running Redis instance (default `redis://localhost:6379`).

## Usage

```js
const { connectRedis, publishEvent, subscribeEvent } = require('./eventBus');

await connectRedis();

// Publish — validated against contracts/registry.js automatically
await publishEvent('application.submitted', {
    applicationId: '123',
    citizenId: 'u1',
    projectType: 'factory',
    location: 'Chennai',
}, { source: 'gateway' });

// Subscribe
await subscribeEvent('application.submitted', (envelope) => {
    console.log(envelope.event, envelope.data);
});
```

Try it: run `examples/subscriber.js` in one terminal, `examples/publisher.js` in another.

## Event envelope

Every message on the bus is wrapped like this — you get this for free, you only supply `data`:

```json
{
  "event": "application.submitted",
  "version": "1.0",
  "eventId": "uuid",
  "correlationId": "uuid",
  "source": "gateway",
  "timestamp": "2026-08-22T10:00:00.000Z",
  "data": { "...": "event-specific payload" }
}
```

`correlationId` ties every event from one citizen's application journey together —
pass it through explicitly (`{ correlationId: ... }`) when one event triggers another,
otherwise a new one is generated.

## Current events

| Event | Fired by | Purpose |
|---|---|---|
| `application.submitted` | gateway | Citizen submits an application |
| `application.approved` | adapters | A department approves |
| `application.rejected` | adapters | A department rejects |
| `document.uploaded` | gateway/frontend | Citizen uploads a document |
| `document.validated` | regulatory-agent | Document checked against requirements |
| `checklist.generated` | regulatory-agent | Required approvals determined for an application |
| `consent.granted` | consent-service | Citizen approves inter-department data sharing |
| `consent.revoked` | consent-service | Citizen withdraws consent |
| `department.status_changed` | adapters | A mock department's status updates |

## Need a new event or field?

Ping the event-bus owner. Don't edit `contracts/` directly — one owner keeps every
service reading the same shape.

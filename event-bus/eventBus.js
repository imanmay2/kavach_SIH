const redis = require('redis');
const crypto = require('crypto');
const { registry } = require('./contracts/registry');

const publisher = redis.createClient();
const subscriber = redis.createClient();

publisher.on('error', (err) => console.error('❌ Redis publisher error:', err));
subscriber.on('error', (err) => console.error('❌ Redis subscriber error:', err));

async function connectRedis() {
    if (!publisher.isOpen) await publisher.connect();
    if (!subscriber.isOpen) await subscriber.connect();
    console.log('✅ Redis connected');
}

/**
 * Publish an event onto the bus.
 * Validates payload against the contract in contracts/registry.js before sending.
 *
 * @param {string} event - event name, e.g. 'application.submitted'
 * @param {object} data - payload matching that event's schema
 * @param {object} [options]
 * @param {string} [options.source] - which service is publishing (defaults to 'unknown')
 * @param {string} [options.correlationId] - ties events from one workflow together;
 *        generated automatically if omitted
 */
async function publishEvent(event, data, options = {}) {
    const contract = registry[event];
    if (!contract) {
        throw new Error(
            `Unknown event "${event}". Add it to contracts/registry.js before publishing.`
        );
    }

    // Throws a clear validation error if data doesn't match the schema
    const result = contract.schema.safeParse(data);
    if (!result.success) {
        throw new Error(
            `Invalid payload for "${event}": ${JSON.stringify(result.error.format())}`
        );
    }

    const envelope = {
        event,
        version: contract.version,
        eventId: crypto.randomUUID(),
        correlationId: options.correlationId || crypto.randomUUID(),
        source: options.source || 'unknown',
        timestamp: new Date().toISOString(),
        data: result.data,
    };

    await publisher.publish(event, JSON.stringify(envelope));
    return envelope;
}

/**
 * Subscribe to an event. Callback receives the parsed envelope
 * ({ event, version, eventId, correlationId, source, timestamp, data }).
 */
async function subscribeEvent(event, callback) {
    await subscriber.subscribe(event, (message) => {
        let envelope;
        try {
            envelope = JSON.parse(message);
        } catch (err) {
            console.error(`❌ Failed to parse message on "${event}":`, err);
            return;
        }
        try {
            callback(envelope);
        } catch (err) {
            // A subscriber's own logic failing should never crash the process
            // or block other subscribers — log and move on.
            console.error(`❌ Subscriber for "${event}" threw an error:`, err);
        }
    });
}

module.exports = { connectRedis, publishEvent, subscribeEvent };

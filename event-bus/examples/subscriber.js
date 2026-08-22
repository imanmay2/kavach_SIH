const { connectRedis, subscribeEvent } = require('../eventBus');

(async () => {
    await connectRedis();
    console.log('📡 Listening for events...');

    await subscribeEvent('application.submitted', (msg) => {
        console.log(`[${msg.event}] from ${msg.source} (correlationId: ${msg.correlationId})`);
        console.log(msg.data);
    });
})();

const { connectRedis, publishEvent } = require('../eventBus');

(async () => {
    await connectRedis();
    console.log('🚀 Sending event...');

    const envelope = await publishEvent(
        'application.submitted',
        {
            applicationId: '123',
            citizenId: 'u1',
            projectType: 'factory',
            location: 'Chennai',
        },
        { source: 'gateway' }
    );

    console.log('✅ Event sent!', envelope);
    process.exit(0);
})();

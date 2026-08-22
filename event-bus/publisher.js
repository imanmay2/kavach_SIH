function publishEvent(eventName, payload) {
    console.log(`[Event-Bus Stub] Published event: ${eventName}`, payload);
}

module.exports = {
    publishEvent
};

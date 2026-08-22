// Single source of truth for every event on the bus.
// Only Person 3 (event-bus owner) edits this file.
// Everyone else: import it, never redefine an event's shape locally.
//
// Need a new event or field? Ping the event-bus owner rather than
// changing this file directly — keeps every service reading the same contract.

const applicationSubmitted = require('./events/applicationSubmitted');
const applicationApproved = require('./events/applicationApproved');
const applicationRejected = require('./events/applicationRejected');
const documentUploaded = require('./events/documentUploaded');
const documentValidated = require('./events/documentValidated');
const checklistGenerated = require('./events/checklistGenerated');
const consentGranted = require('./events/consentGranted');
const consentRevoked = require('./events/consentRevoked');
const departmentStatusChanged = require('./events/departmentStatusChanged');

const allEvents = [
    applicationSubmitted,
    applicationApproved,
    applicationRejected,
    documentUploaded,
    documentValidated,
    checklistGenerated,
    consentGranted,
    consentRevoked,
    departmentStatusChanged,
];

const registry = Object.fromEntries(allEvents.map((e) => [e.name, e]));

module.exports = { registry };

const { z } = require('zod');

// Fired by: gateway, when a citizen submits their application.
// Consumed by: adapters (to know which departments to route to),
//              regulatory-agent (to generate the checklist).
const schema = z.object({
    applicationId: z.string(),
    citizenId: z.string(),
    projectType: z.string(),     // e.g. "factory", "residential"
    location: z.string(),
});

module.exports = { name: 'application.submitted', version: '1.0', schema };

const { z } = require('zod');

// Fired by: regulatory-agent, after checking a document against requirements.
const schema = z.object({
    applicationId: z.string(),
    documentId: z.string(),
    isValid: z.boolean(),
    missingFields: z.array(z.string()).optional(),
});

module.exports = { name: 'document.validated', version: '1.0', schema };

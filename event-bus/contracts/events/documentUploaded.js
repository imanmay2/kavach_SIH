const { z } = require('zod');

// Fired by: gateway/frontend, when a citizen uploads a document.
const schema = z.object({
    applicationId: z.string(),
    documentId: z.string(),
    documentType: z.string(),   // e.g. "land_deed", "id_proof"
    uploadedAt: z.string(),
});

module.exports = { name: 'document.uploaded', version: '1.0', schema };

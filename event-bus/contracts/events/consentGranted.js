const { z } = require('zod');

// Fired by: consent-service, when a citizen approves data sharing between departments.
const schema = z.object({
    applicationId: z.string(),
    citizenId: z.string(),
    fromDepartment: z.string(),
    toDepartment: z.string(),
    scope: z.string(),          // what data is covered, e.g. "identity_docs"
    grantedAt: z.string(),
});

module.exports = { name: 'consent.granted', version: '1.0', schema };

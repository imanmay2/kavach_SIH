const { z } = require('zod');

// Fired by: consent-service, when a citizen withdraws a previously granted consent.
const schema = z.object({
    applicationId: z.string(),
    citizenId: z.string(),
    fromDepartment: z.string(),
    toDepartment: z.string(),
    revokedAt: z.string(),
});

module.exports = { name: 'consent.revoked', version: '1.0', schema };

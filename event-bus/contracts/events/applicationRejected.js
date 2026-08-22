const { z } = require('zod');

// Fired by: adapters, when a department rejects an application.
const schema = z.object({
    applicationId: z.string(),
    departmentId: z.string(),
    rejectedAt: z.string(),
    reason: z.string(),
});

module.exports = { name: 'application.rejected', version: '1.0', schema };

const { z } = require('zod');

// Fired by: adapters, when a department approves an application.
const schema = z.object({
    applicationId: z.string(),
    departmentId: z.string(),
    approvedAt: z.string(),
    remarks: z.string().optional(),
});

module.exports = { name: 'application.approved', version: '1.0', schema };

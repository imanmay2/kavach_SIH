const { z } = require('zod');

// Fired by: adapters, whenever a mock department system's internal status changes
// for a given application (e.g. "under_review" -> "approved").
// This is the general-purpose status event; application.approved/rejected
// are the two specific terminal states adapters should also fire for clarity.
const schema = z.object({
    applicationId: z.string(),
    departmentId: z.string(),
    status: z.string(),         // e.g. "received", "under_review", "approved", "rejected"
    updatedAt: z.string(),
});

module.exports = { name: 'department.status_changed', version: '1.0', schema };

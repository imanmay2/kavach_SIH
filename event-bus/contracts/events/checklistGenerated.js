const { z } = require('zod');

// Fired by: regulatory-agent, after determining which approvals a citizen needs.
// Consumed by: frontend (citizen tracker + official dashboard).
const schema = z.object({
    applicationId: z.string(),
    requiredApprovals: z.array(
        z.object({
            department: z.string(),
            documentType: z.string(),
            regulationRef: z.string(),   // citation into the source regulation doc
        })
    ),
});

module.exports = { name: 'checklist.generated', version: '1.0', schema };

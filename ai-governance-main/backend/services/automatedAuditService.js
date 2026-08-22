import Control from "../models/ControlAssessment.js";
import axios from "axios";
import Comment from "../models/Comments.js";

class AutomatedAuditService {
  /**
   * Performs an automated audit for a project by verifying controls against indexed documents.
   * @param {string} projectId - The ID of the project to audit.
   * @param {string} userId - The ID of the user triggering the audit.
   * @returns {Promise<Object>} Summary of the audit results.
   */
  static async performAutomatedAudit(projectId, userId) {
    console.log(`Starting automated audit for project: ${projectId}`);

    // 1. Fetch all active controls for the project
    const controls = await Control.find({ projectId, isActive: true });
    if (!controls || controls.length === 0) {
      console.log(`No controls found for project: ${projectId}`);
      return { message: "No controls found for this project.", updatedCount: 0 };
    }

    const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";
    const auditResults = [];
    let updatedCount = 0;

    // 2. Iterate through controls and verify each
    for (const control of controls) {
      try {
        console.log(`Verifying control: ${control.control} (${control.code})`);

        const response = await axios.post(`${AGENT_URL}/agent/rag/verify-control`, {
          control_name: control.control,
          requirement: control.requirements,
          project_id: projectId,
        });

        const { verified, status, rationale, sources } = response.data;

        if (verified || status === "Compliant" || status === "Partial") {
          // 3. Update control status if verified or partially verified
          const oldStatus = control.status;
          control.status = status === "Compliant" ? "Compliant" : "In Progress";
          await control.save();
          updatedCount++;

          // 4. Add a comment with the audit evidence
          const evidenceText = `[Automated Audit] Status: ${status}\nRationale: ${rationale}\nSources: ${sources.join(", ")}`;
          
          await Comment.create({
            projectId,
            controlId: control._id,
            author: userId,
            text: evidenceText,
          });

          auditResults.push({
            controlId: control._id,
            code: control.code,
            oldStatus,
            newStatus: control.status,
            verified,
            rationale,
          });
        }
      } catch (error) {
        console.error(`Error verifying control ${control.code}:`, error.message);
        // Continue with other controls even if one fails
      }
    }

    // 5. Trigger governance score recalculation if any controls were updated
    if (updatedCount > 0) {
      try {
        const GovernanceAssessmentService = (await import('./governanceAssessmentService.js')).default;
        await GovernanceAssessmentService.recalculateGovernanceScores(projectId);
      } catch (scoreError) {
        console.error("Error recalculating scores after audit:", scoreError);
      }
    }

    return {
      message: "Automated audit completed.",
      totalControls: controls.length,
      updatedCount,
      results: auditResults,
    };
  }
}

export default AutomatedAuditService;

import { MOCK_CITIZENS, MOCK_DEPARTMENT_CONSENTS } from "../data/mockData";
import { Citizen, Application, DepartmentConsent } from "../data/types";

/**
 * Fetches all applications belonging to a specific citizen by their Citizen ID.
 * TODO: Replace with real fetch: fetch(`/api/interop/citizens/${citizenId}/applications`)
 */
export async function getApplicationsForCitizen(citizenId: string = "CITIZEN-001"): Promise<{ citizen: Citizen; applications: Application[] }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const citizen = MOCK_CITIZENS.find(c => c.id === citizenId) || MOCK_CITIZENS[0];
  return {
    citizen,
    applications: citizen.applications
  };
}

/**
 * Fetches all applications across all citizens for official dashboard monitoring.
 * TODO: Replace with real fetch: fetch('/api/interop/applications/all')
 */
export async function getAllApplications(): Promise<(Application & { applicant: string; citizenId: string })[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const allApps: (Application & { applicant: string; citizenId: string })[] = [];
  MOCK_CITIZENS.forEach(citizen => {
    citizen.applications.forEach(app => {
      allApps.push({
        ...app,
        applicant: `${citizen.name} (${citizen.company})`,
        citizenId: citizen.id
      });
    });
  });

  return allApps;
}

/**
 * Fetches department consent configurations for a citizen.
 * TODO: Replace with real fetch: fetch(`/api/interop/citizens/${citizenId}/consents`)
 */
export async function getDepartmentConsents(citizenId: string = "CITIZEN-001"): Promise<DepartmentConsent[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_DEPARTMENT_CONSENTS;
}

/**
 * Grants/updates granular data sharing consents for a department.
 * TODO: Replace with real fetch: fetch(`/api/interop/citizens/${citizenId}/consents/${departmentId}`, { method: 'PUT', body: JSON.stringify({ consents }) })
 */
export async function grantConsent(
  citizenId: string,
  departmentId: string,
  consents: Record<string, boolean>
): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const dept = MOCK_DEPARTMENT_CONSENTS.find(d => d.id === departmentId);
  if (dept) {
    dept.consents = { ...consents };
  }

  return {
    success: true,
    message: `Consent rules updated successfully for ${dept?.name || departmentId}`
  };
}

/**
 * Queries the PS 26129 Interop AI Assistant for grounded compliance & clearance answers.
 * TODO: Replace with real fetch: fetch('/api/interop/chat/ask', { method: 'POST', body: JSON.stringify({ question, session_id: sessionId }) })
 */
export async function askInteropAssistant(
  question: string,
  sessionId: string = "interop_session_1"
): Promise<{ answer: string; sources: string[]; grounded: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 400));

  const qLower = question.toLowerCase();

  if (qLower.includes("reuse") || qLower.includes("documents") || qLower.includes("fire noc")) {
    return {
      answer: "Verified Corporate PAN, GSTIN Registration, and Corporate Identity credentials from your Fire NOC renewal (#APP-2026-3044) are automatically reused for subsequent applications like Pollution Clearance (#APP-2026-7701). Zero redundant document uploads are required.",
      sources: ["PS 26129 Master Data Reuse Specification Sec 3.1"],
      grounded: true
    };
  }

  if (qLower.includes("sla") || qLower.includes("timeframe") || qLower.includes("duration")) {
    return {
      answer: "The standard SLA timeframe for Municipal Corporation and Fire Department clearances under the Single Window Interoperability Framework is 2 business days. Applications exceeding 2 days are flagged as SLA Breaches on the Official Dashboard.",
      sources: ["Single Window Service Level Agreement Guidelines 2026"],
      grounded: true
    };
  }

  if (qLower.includes("consent") || qLower.includes("access") || qLower.includes("pollution control board")) {
    return {
      answer: "To manage data sharing, navigate to the Consent Console (`/interop/consent`), select the department (e.g., MPCB), and toggle specific parameters (Emissions Log, GSTIN). Click 'Grant Consent' to sign access rules onto the Kavach Ledger.",
      sources: ["Kavach Consent Engine v1.2 Documentation"],
      grounded: true
    };
  }

  if (qLower.includes("breach") || qLower.includes("overdue") || qLower.includes("pending")) {
    return {
      answer: "Currently, Application APP-2026-8912 (Aditya Textiles Ltd - 4 days pending) and Application APP-2026-9022 (Aura Pharmaceuticals - 5 days pending) have exceeded the 2-day SLA limit and are highlighted in red on the Official Dashboard.",
      sources: ["Official Clearance Review Queue - Realtime Audit"],
      grounded: true
    };
  }

  return {
    answer: "Based on the PS 26129 Interoperability Framework:\nAll industrial clearances follow a federated master data model. Verified PAN, GSTIN, and Land Records are shared with consent across Municipal, Fire, and Pollution Control Board portals to minimize duplicate submissions.",
    sources: ["Interoperability Framework General Guidelines"],
    grounded: true
  };
}

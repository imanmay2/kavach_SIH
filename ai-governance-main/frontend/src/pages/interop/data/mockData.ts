import { Citizen, ConsentField, DepartmentConsent } from "./types";

export const MOCK_CITIZENS: Citizen[] = [
  {
    id: "CITIZEN-001",
    name: "Rajesh Kumar",
    company: "Aditya Textiles Ltd",
    gstin: "27AABCA1234H1Z5",
    pan: "AABCA1234H",
    verifiedFields: ["PAN Card Verification", "GSTIN Registration", "Corporate Identity", "Land Record #402"],
    applications: [
      {
        id: "APP-2026-8912",
        title: "New Unit Setup (Manufacturing License)",
        sector: "Textiles",
        submissionDate: "2026-08-10",
        lastUpdate: "2026-08-22",
        currentStatus: "In Review",
        daysPending: 4, // SLA breach (> 2 days)
        reusedFields: ["PAN Card Verification", "GSTIN Registration"],
        overallProgress: 60,
        stages: [
          { name: "Portal Submission", status: "completed", date: "2026-08-10", dept: "Single Window Portal" },
          { name: "Municipal Clearance", status: "completed", date: "2026-08-14", dept: "MCGM (Mumbai)" },
          { name: "Fire NOC Review", status: "current", date: "2026-08-18", dept: "Mumbai Fire Brigade" },
          { name: "Pollution Control Clearance", status: "pending", date: null, dept: "MPCB" }
        ]
      },
      {
        id: "APP-2026-3044",
        title: "Fire NOC Renewal",
        sector: "Textiles",
        submissionDate: "2026-08-01",
        lastUpdate: "2026-08-12",
        currentStatus: "Approved",
        daysPending: 0,
        reusedFields: ["PAN Card Verification", "Corporate Identity"],
        overallProgress: 100,
        stages: [
          { name: "Portal Submission", status: "completed", date: "2026-08-01", dept: "Single Window Portal" },
          { name: "Fire Safety Inspection", status: "completed", date: "2026-08-05", dept: "Mumbai Fire Brigade" },
          { name: "NOC Certificate Generation", status: "completed", date: "2026-08-12", dept: "Fire Services HQ" }
        ]
      },
      {
        id: "APP-2026-7701",
        title: "Pollution Clearance (Expansion Unit B)",
        sector: "Textiles",
        submissionDate: "2026-08-20",
        lastUpdate: "2026-08-21",
        currentStatus: "Pending",
        daysPending: 1,
        reusedFields: ["PAN Card Verification", "GSTIN Registration", "Land Record #402"],
        overallProgress: 35,
        stages: [
          { name: "Portal Submission", status: "completed", date: "2026-08-20", dept: "Single Window Portal" },
          { name: "Initial Data Pre-fill Check", status: "completed", date: "2026-08-21", dept: "Auto-Verification Engine" },
          { name: "State Pollution Review", status: "current", date: "2026-08-22", dept: "MPCB Technical Board" },
          { name: "Final Consent Order", status: "pending", date: null, dept: "MPCB" }
        ]
      }
    ]
  },
  {
    id: "CITIZEN-002",
    name: "Sunita Deshmukh",
    company: "Sahyadri Food Processing",
    gstin: "27BBBDE5678J1Z2",
    pan: "BBBDE5678J",
    verifiedFields: ["PAN Card Verification", "FSSAI License"],
    applications: [
      {
        id: "APP-2026-5561",
        title: "Factory Blueprint & Food Safety Permit",
        sector: "Food Processing",
        submissionDate: "2026-08-05",
        lastUpdate: "2026-08-18",
        currentStatus: "Approved",
        daysPending: 0,
        reusedFields: ["PAN Card Verification"],
        overallProgress: 100,
        stages: [
          { name: "Portal Submission", status: "completed", date: "2026-08-05", dept: "Single Window Portal" },
          { name: "FSSAI Audit", status: "completed", date: "2026-08-12", dept: "Food Safety Board" },
          { name: "Final Approval", status: "completed", date: "2026-08-18", dept: "Pune Municipal Corp" }
        ]
      }
    ]
  },
  {
    id: "CITIZEN-003",
    name: "Amit Patel",
    company: "Vanguard Manufacturing Corp",
    gstin: "24CCCFF9012K1Z9",
    pan: "CCCFF9012K",
    verifiedFields: ["PAN Card Verification", "GSTIN Registration"],
    applications: [
      {
        id: "APP-2026-4410",
        title: "Industrial Municipal Approval",
        sector: "Manufacturing",
        submissionDate: "2026-08-20",
        lastUpdate: "2026-08-21",
        currentStatus: "Pending",
        daysPending: 1,
        reusedFields: ["PAN Card Verification", "GSTIN Registration"],
        overallProgress: 25,
        stages: [
          { name: "Portal Submission", status: "completed", date: "2026-08-20", dept: "Single Window Portal" },
          { name: "GIDC Clearance", status: "current", date: "2026-08-21", dept: "GIDC Gujarat" }
        ]
      }
    ]
  },
  {
    id: "CITIZEN-004",
    name: "Vikram Malhotra",
    company: "Aura Pharmaceuticals",
    gstin: "27DDDGG3456L1Z4",
    pan: "DDDGG3456L",
    verifiedFields: ["PAN Card Verification", "Drug License"],
    applications: [
      {
        id: "APP-2026-9022",
        title: "Environmental Chemical NOC",
        sector: "Pharmaceuticals",
        submissionDate: "2026-08-15",
        lastUpdate: "2026-08-18",
        currentStatus: "Pending",
        daysPending: 5, // SLA breach (> 2 days)
        reusedFields: ["PAN Card Verification"],
        overallProgress: 40,
        stages: [
          { name: "Portal Submission", status: "completed", date: "2026-08-15", dept: "Single Window Portal" },
          { name: "Hazardous Chemical Audit", status: "current", date: "2026-08-18", dept: "State Pollution Board" }
        ]
      }
    ]
  }
];

export const MOCK_CONSENT_FIELDS: ConsentField[] = [
  { id: "pan", name: "Corporate PAN Card Verification", desc: "Permanent Account Number authentication for tax compliance checks.", category: "Identity & Legal" },
  { id: "gstin", name: "GSTIN Registry Details", desc: "GST registration status and monthly filing logs validation.", category: "Identity & Legal" },
  { id: "pollution", name: "MPCB Emissions Log & NOC", desc: "Air and water pollution discharge audit records and NOC parameters.", category: "Environmental & Health" },
  { id: "fire", name: "Fire Safety Equipment Certifications", desc: "Audit records and inspection reports of installed fire systems.", category: "Safety & Operations" },
  { id: "blueprint", name: "Structural Layout & Factory Blueprint", desc: "Floorplans, height declarations, and structural audit approvals.", category: "Safety & Operations" },
  { id: "electricity", name: "MSEDCL Electricity Load Logs", desc: "Power supply capacity, consumption rates, and billing compliance.", category: "Utility & Resources" }
];

export const MOCK_DEPARTMENT_CONSENTS: DepartmentConsent[] = [
  {
    id: "mcgm",
    name: "Municipal Corporation (MCGM)",
    desc: "Primary municipal authority reviewing zoning and local clearances.",
    consents: { pan: true, gstin: true, pollution: false, fire: false, blueprint: true, electricity: false }
  },
  {
    id: "fire_dept",
    name: "State Fire & Emergency Services",
    desc: "Verifying building fire safety and evacuation guidelines.",
    consents: { pan: true, gstin: false, pollution: false, fire: true, blueprint: true, electricity: false }
  },
  {
    id: "mpcb",
    name: "Pollution Control Board (MPCB)",
    desc: "Regulating environmental emissions, disposal protocols, and ecological compliance.",
    consents: { pan: true, gstin: true, pollution: true, fire: false, blueprint: false, electricity: true }
  }
];

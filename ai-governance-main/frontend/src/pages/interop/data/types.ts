export type StageStatus = 'completed' | 'current' | 'pending';
export type ApplicationStatus = 'Approved' | 'In Review' | 'Pending' | 'Rejected';

export interface ApprovalStage {
  name: string;
  status: StageStatus;
  date: string | null;
  dept: string;
}

export interface Application {
  id: string;
  title: string;
  sector: string;
  submissionDate: string;
  lastUpdate: string;
  currentStatus: ApplicationStatus;
  daysPending: number;
  reusedFields: string[];
  stages: ApprovalStage[];
  overallProgress: number;
}

export interface Citizen {
  id: string;
  name: string;
  company: string;
  gstin: string;
  pan: string;
  verifiedFields: string[];
  applications: Application[];
}

export interface ConsentField {
  id: string;
  name: string;
  desc: string;
  category: string;
}

export interface DepartmentConsent {
  id: string;
  name: string;
  desc: string;
  consents: Record<string, boolean>;
}

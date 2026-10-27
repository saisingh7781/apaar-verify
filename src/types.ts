/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ValidationStatus = 'Valid' | 'Warning' | 'Duplicate' | 'Needs Review';
export type AdmissionCategory = 'Regular' | 'NRI' | 'OCI' | 'Foreign National' | 'Supernumerary';
export type UserRole = 'institution_admin' | 'aicte_regulator' | 'student';

export interface Institution {
  id: string;
  aicte_id: string;
  name: string;
  state: string;
  approved_intake: number;
  programs?: string[];
}

export interface Student {
  id: string;
  apaar_id: string;
  student_id: string;
  full_name: string;
  program: string;
  admission_year: number;
  admission_category: AdmissionCategory;
  institution_id: string;
  validation_status: ValidationStatus;
  validation_notes?: string;
  created_at?: string;
  contact_masked?: string;
  is_sharing_locked?: boolean;
}

export interface AccessAuditLog {
  log_id: string;
  apaar_id: string;
  verifier_entity: string;
  access_timestamp: string;
  ip_address: string;
  alert_dispatched: boolean;
  student_name?: string;
  institution_name?: string;
}

export interface IntakeAnalysis {
  institution_id: string;
  institution_name: string;
  aicte_id: string;
  approved_intake: number;
  enrolled_count: number;
  utilization_percentage: number;
  is_exceeded: boolean;
  excess_count: number;
  program_breakdown: Record<string, number>;
}

// --- Academic Bank of Credits (ABC) Types ---
export interface CourseCredit {
  id: string;
  course_code: string;
  course_name: string;
  semester: number;
  credits: number;
  grade: string;
  issuing_university: string;
  academic_year: string;
  verified_status: 'Verified' | 'Pending Review' | 'Transferred';
  verification_hash: string;
}

export type TransferStatus = 'Pending Central Approval' | 'Approved & Synced' | 'Rejected' | 'Flagged';

export interface CreditTransferRequest {
  id: string;
  apaar_id: string;
  student_name: string;
  source_institution_id: string;
  source_institution_name: string;
  target_institution_id: string;
  target_institution_name: string;
  target_program: string;
  requested_at: string;
  total_credits: number;
  course_codes: string[];
  status: TransferStatus;
  rejection_reason?: string;
  audit_hash: string;
}

// --- Ghost Student & Dropout Risk Analytics Types ---
export type GhostRiskLevel = 'Low' | 'Moderate' | 'Critical / Ghost Admission';

export interface GhostStudentMetric {
  student_id: string;
  apaar_id: string;
  student_name: string;
  institution_id: string;
  institution_name: string;
  program: string;
  admission_year: number;
  last_lms_login_days: number;
  attendance_percentage: number;
  fee_payment_status: 'Paid' | 'Partial' | 'Unpaid (Overdue >90d)';
  biometric_verified: boolean;
  risk_score: number; // 0 - 100
  risk_level: GhostRiskLevel;
  anomaly_flags: string[];
  notice_issued: boolean;
  notice_timestamp?: string;
}

// --- Cryptographic Blockchain Ledger Types ---
export type BlockEventType =
  | 'GENESIS'
  | 'INTAKE_BREACH'
  | 'CONSENT_LOCKED'
  | 'CONSENT_UNLOCKED'
  | 'CREDIT_TRANSFER_REQUEST'
  | 'CREDIT_TRANSFER_APPROVED'
  | 'CREDIT_TRANSFER_REJECTED'
  | 'GHOST_NOTICE_ISSUED'
  | 'BATCH_UPLOADED'
  | 'DUPLICATE_FLAGGED'
  | 'CREDENTIAL_VERIFIED'
  | 'CASE_RESOLVED';

export interface AuditBlock {
  index: number;
  timestamp: string;
  event_type: BlockEventType;
  issuer: string;
  entity_id: string;
  details: string;
  previous_hash: string;
  payload_hash: string;
  block_hash: string;
  nonce: number;
}

// --- Verification Case Management (Feature A) ---
export type CaseResolution = 'Open Conflict' | 'Confirmed Duplicate' | 'Dismissed / Distinct' | 'Under College Inquiry';

export interface CaseHistoryEntry {
  timestamp: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface DuplicateCase {
  id: string;
  apaar_id: string;
  candidate_name: string;
  severity: 'Critical Cross-College Duplicate' | 'Intra-College Anomaly';
  status: CaseResolution;
  records: Student[];
  matching_fields: string[];
  conflicting_fields: string[];
  rationale: string;
  reviewer_notes?: string;
  assigned_officer: string;
  last_updated: string;
  history: CaseHistoryEntry[];
}

// --- Exception Review Queue (Feature E) ---
export type ExceptionPriority = 'High' | 'Medium' | 'Low';
export type ExceptionType =
  | 'Cross-University Duplicate'
  | 'Format / Luhn Checksum Failure'
  | 'Missing Student Roll No'
  | 'Sanctioned Intake Overflow'
  | 'Prolonged Digital Inactivity';

export interface ExceptionItem {
  id: string;
  student_id: string;
  student_name: string;
  apaar_id: string;
  institution_id: string;
  institution_name: string;
  program: string;
  issue_type: ExceptionType;
  priority: ExceptionPriority;
  priority_reason: string;
  age_days: number;
  assigned_reviewer: string;
  recommended_action: string;
  status: 'Pending Review' | 'In Progress' | 'Resolved';
}

// --- Data Provenance & Evidence Passport (Feature D) ---
export interface ProvenanceRecord {
  student_id: string;
  apaar_id: string;
  student_name: string;
  institution_name: string;
  batch_id: string;
  source_system: string;
  ingested_at: string;
  record_hash: string;
  rules_evaluated: Array<{
    rule_id: string;
    rule_name: string;
    passed: boolean;
    details: string;
  }>;
  revision_history: Array<{
    timestamp: string;
    event: string;
    modified_by: string;
  }>;
}

// --- Import & Audit Timeline (Feature F) ---
export interface TimelineEvent {
  id: string;
  timestamp: string;
  category: 'Batch Ingestion' | 'Validation Run' | 'Reviewer Action' | 'Statutory Notice' | 'Security Consent';
  institution_id?: string;
  institution_name?: string;
  summary: string;
  details: string;
  actor: string;
  storage_type: 'Session (In-Memory)' | 'LocalStorage Cached';
}



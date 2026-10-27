/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Institution,
  Student,
  AccessAuditLog,
  IntakeAnalysis,
  ValidationStatus,
  AdmissionCategory,
  UserRole,
  CourseCredit,
  CreditTransferRequest,
  GhostStudentMetric,
  AuditBlock,
  DuplicateCase,
  CaseResolution,
  ExceptionItem,
  ProvenanceRecord,
  TimelineEvent
} from '../types.ts';
import {
  INITIAL_INSTITUTIONS,
  INITIAL_STUDENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_COURSE_CREDITS,
  INITIAL_TRANSFER_REQUESTS,
  INITIAL_GHOST_METRICS,
  INITIAL_AUDIT_BLOCKS,
  INITIAL_DUPLICATE_CASES,
  INITIAL_EXCEPTION_ITEMS,
  INITIAL_TIMELINE_EVENTS
} from '../data/seedData.ts';
import { evaluateStudentRecord, calculateIntakeAnalysis, normalizeApaarId, parseCSVToStudents } from '../utils/validation.ts';
import { createAuditBlock, verifyChainIntegrity, computeDeterministicSha256 } from '../utils/security.ts';

const STORAGE_KEY_INSTITUTIONS = 'aicte_apaar_institutions_v1';
const STORAGE_KEY_STUDENTS = 'aicte_apaar_students_v1';
const STORAGE_KEY_AUDIT_LOGS = 'aicte_apaar_audit_logs_v1';
const STORAGE_KEY_AUTH = 'aicte_apaar_auth_v1';
const STORAGE_KEY_CREDITS = 'aicte_apaar_credits_v1';
const STORAGE_KEY_TRANSFERS = 'aicte_apaar_transfers_v1';
const STORAGE_KEY_GHOST = 'aicte_apaar_ghost_v1';
const STORAGE_KEY_BLOCKS = 'aicte_apaar_blocks_v1';
const STORAGE_KEY_CASES = 'aicte_apaar_cases_v1';
const STORAGE_KEY_EXCEPTIONS = 'aicte_apaar_exceptions_v1';
const STORAGE_KEY_TIMELINE = 'aicte_apaar_timeline_v1';

export interface UserSession {
  role: UserRole;
  institution_id?: string;
  student_apaar_id?: string;
  name: string;
  email: string;
  token: string;
}

export interface VerificationResult {
  verified: boolean;
  isLocked?: boolean;
  lockNotice?: string;
  student?: Student;
  institution?: Institution;
  auditLog: AccessAuditLog;
  smsMessage: string;
}

type AlertListener = (result: VerificationResult) => void;

class ApiService {
  private institutions: Institution[] = [];
  private students: Student[] = [];
  private auditLogs: AccessAuditLog[] = [];
  private courseCredits: CourseCredit[] = [];
  private transferRequests: CreditTransferRequest[] = [];
  private ghostMetrics: GhostStudentMetric[] = [];
  private auditBlocks: AuditBlock[] = [];
  private duplicateCases: DuplicateCase[] = [];
  private exceptionItems: ExceptionItem[] = [];
  private timelineEvents: TimelineEvent[] = [];
  private alertListeners: Set<AlertListener> = new Set();
  private currentUser: UserSession | null = null;

  constructor() {
    this.initData();
  }

  public initData(forceReset = false) {
    if (!forceReset && typeof window !== 'undefined') {
      try {
        const storedInst = localStorage.getItem(STORAGE_KEY_INSTITUTIONS);
        const storedStud = localStorage.getItem(STORAGE_KEY_STUDENTS);
        const storedLogs = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
        const storedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
        const storedCreds = localStorage.getItem(STORAGE_KEY_CREDITS);
        const storedTrans = localStorage.getItem(STORAGE_KEY_TRANSFERS);
        const storedGhost = localStorage.getItem(STORAGE_KEY_GHOST);
        const storedBlocks = localStorage.getItem(STORAGE_KEY_BLOCKS);
        const storedCases = localStorage.getItem(STORAGE_KEY_CASES);
        const storedExceptions = localStorage.getItem(STORAGE_KEY_EXCEPTIONS);
        const storedTimeline = localStorage.getItem(STORAGE_KEY_TIMELINE);

        if (storedInst && storedStud) {
          this.institutions = JSON.parse(storedInst);
          this.students = JSON.parse(storedStud);
          this.auditLogs = storedLogs ? JSON.parse(storedLogs) : [...INITIAL_AUDIT_LOGS];
          this.courseCredits = storedCreds ? JSON.parse(storedCreds) : [...INITIAL_COURSE_CREDITS];
          this.transferRequests = storedTrans ? JSON.parse(storedTrans) : [...INITIAL_TRANSFER_REQUESTS];
          this.ghostMetrics = storedGhost ? JSON.parse(storedGhost) : [...INITIAL_GHOST_METRICS];
          this.auditBlocks = storedBlocks ? JSON.parse(storedBlocks) : [...INITIAL_AUDIT_BLOCKS];
          this.duplicateCases = storedCases ? JSON.parse(storedCases) : JSON.parse(JSON.stringify(INITIAL_DUPLICATE_CASES));
          this.exceptionItems = storedExceptions ? JSON.parse(storedExceptions) : JSON.parse(JSON.stringify(INITIAL_EXCEPTION_ITEMS));
          this.timelineEvents = storedTimeline ? JSON.parse(storedTimeline) : JSON.parse(JSON.stringify(INITIAL_TIMELINE_EVENTS));
          this.currentUser = storedAuth ? JSON.parse(storedAuth) : null;
          return;
        }
      } catch (err) {
        console.warn('Failed to load from localStorage, initializing defaults', err);
      }
    }

    // Default initialization
    this.institutions = JSON.parse(JSON.stringify(INITIAL_INSTITUTIONS));
    this.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.courseCredits = JSON.parse(JSON.stringify(INITIAL_COURSE_CREDITS));
    this.transferRequests = JSON.parse(JSON.stringify(INITIAL_TRANSFER_REQUESTS));
    this.ghostMetrics = JSON.parse(JSON.stringify(INITIAL_GHOST_METRICS));
    this.auditBlocks = JSON.parse(JSON.stringify(INITIAL_AUDIT_BLOCKS));
    this.duplicateCases = JSON.parse(JSON.stringify(INITIAL_DUPLICATE_CASES));
    this.exceptionItems = JSON.parse(JSON.stringify(INITIAL_EXCEPTION_ITEMS));
    this.timelineEvents = JSON.parse(JSON.stringify(INITIAL_TIMELINE_EVENTS));
    this.currentUser = {
      role: 'institution_admin',
      institution_id: 'inst-1',
      name: 'Dr. R. Raman (Registrar)',
      email: 'registrar@mitindia.edu',
      token: 'jwt_mock_mit_admin_token'
    };
    this.saveData();
  }

  private saveData() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_INSTITUTIONS, JSON.stringify(this.institutions));
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(this.students));
      localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEY_CREDITS, JSON.stringify(this.courseCredits));
      localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(this.transferRequests));
      localStorage.setItem(STORAGE_KEY_GHOST, JSON.stringify(this.ghostMetrics));
      localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(this.auditBlocks));
      localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(this.duplicateCases));
      localStorage.setItem(STORAGE_KEY_EXCEPTIONS, JSON.stringify(this.exceptionItems));
      localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(this.timelineEvents));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch (err) {
      console.error('Error saving to localStorage', err);
    }
  }

  public onAlertDispatched(listener: AlertListener) {
    this.alertListeners.add(listener);
    return () => this.alertListeners.delete(listener);
  }

  // --- Auth API ---
  public login(role: UserRole, institutionId?: string, email?: string): UserSession {
    if (role === 'student') {
      const student = this.students[0];
      return this.loginAsStudent(student.apaar_id);
    }

    const institution = institutionId 
      ? this.institutions.find(i => i.id === institutionId) 
      : this.institutions[0];

    const session: UserSession = {
      role,
      institution_id: role === 'institution_admin' ? (institution?.id || 'inst-1') : undefined,
      name: role === 'institution_admin' ? `Registrar (${institution?.name.split(',')[0] || 'MIT'})` : 'Prof. A. Sahasrabudhe (AICTE Officer)',
      email: email || (role === 'institution_admin' ? 'admin@institution.edu.in' : 'regulator@aicte-india.org'),
      token: `bearer_${role}_${Date.now()}`
    };

    this.currentUser = session;
    this.saveData();
    return session;
  }

  public loginAsStudent(apaarId: string): UserSession {
    const clean = normalizeApaarId(apaarId);
    const student = this.students.find(s => normalizeApaarId(s.apaar_id) === clean) || this.students[0];
    const session: UserSession = {
      role: 'student',
      student_apaar_id: student.apaar_id,
      institution_id: student.institution_id,
      name: student.full_name,
      email: `${student.student_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.ac.in`,
      token: `bearer_student_${Date.now()}`
    };
    this.currentUser = session;
    this.saveData();
    return session;
  }

  public toggleStudentConsent(apaarId: string, isLocked: boolean): boolean {
    const clean = normalizeApaarId(apaarId);
    const student = this.students.find(s => normalizeApaarId(s.apaar_id) === clean);
    if (!student) return false;
    student.is_sharing_locked = isLocked;
    this.saveData();
    return true;
  }

  public getCurrentUser(): UserSession | null {
    return this.currentUser;
  }

  public logout() {
    this.currentUser = null;
    this.saveData();
  }

  // --- Institutions API ---
  public getInstitutions(): Institution[] {
    return [...this.institutions];
  }

  public getInstitutionById(id: string): Institution | undefined {
    return this.institutions.find(i => i.id === id);
  }

  // --- Students API ---
  public getStudents(institutionId?: string): Student[] {
    if (institutionId) {
      return this.students.filter(s => s.institution_id === institutionId);
    }
    return [...this.students];
  }

  public getStudentByApaar(apaarId: string): Student | undefined {
    const clean = normalizeApaarId(apaarId);
    return this.students.find(s => normalizeApaarId(s.apaar_id) === clean);
  }

  public updateStudent(studentId: string, updates: Partial<Student>): Student {
    const index = this.students.findIndex(s => s.id === studentId);
    if (index === -1) {
      throw new Error(`Student ${studentId} not found`);
    }

    const current = this.students[index];
    const updated: Student = { ...current, ...updates };

    // Re-evaluate validation status
    const evalResult = evaluateStudentRecord(updated, this.students, []);
    updated.validation_status = evalResult.status;
    updated.validation_notes = evalResult.notes;

    this.students[index] = updated;
    this.saveData();
    return updated;
  }

  public deleteStudent(studentId: string): boolean {
    const initialLen = this.students.length;
    this.students = this.students.filter(s => s.id !== studentId);
    if (this.students.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Batch Upload API: POST /api/v1/students/upload-batch ---
  public uploadBatch(
    institutionId: string,
    csvContent: string
  ): { total: number; valid: number; warnings: number; duplicates: number; newStudents: Student[] } {
    const parsed = parseCSVToStudents(csvContent);
    const institution = this.getInstitutionById(institutionId);
    if (!institution) throw new Error('Institution not found');

    const addedStudents: Student[] = [];
    let validCount = 0;
    let warningCount = 0;
    let dupCount = 0;

    for (let i = 0; i < parsed.records.length; i++) {
      const rec = parsed.records[i];
      const partialStudent: Partial<Student> = {
        apaar_id: rec.apaar_id,
        student_id: rec.student_id,
        full_name: rec.full_name,
        program: rec.program,
        admission_year: rec.admission_year,
        admission_category: rec.admission_category,
        institution_id: institutionId
      };

      const evalResult = evaluateStudentRecord(partialStudent, this.students, parsed.records as any);

      if (evalResult.status === 'Valid') validCount++;
      else if (evalResult.status === 'Duplicate') dupCount++;
      else warningCount++;

      const newStudent: Student = {
        id: `stud-up-${Date.now()}-${i}`,
        apaar_id: normalizeApaarId(rec.apaar_id),
        student_id: rec.student_id,
        full_name: rec.full_name,
        program: rec.program,
        admission_year: rec.admission_year,
        admission_category: rec.admission_category,
        institution_id: institutionId,
        validation_status: evalResult.status,
        validation_notes: evalResult.notes,
        created_at: new Date().toISOString(),
        contact_masked: `+91 9${Math.floor(10 + Math.random() * 89)}*** **${Math.floor(100 + Math.random() * 899)}`
      };

      addedStudents.push(newStudent);
    }

    // Append to student registry
    this.students = [...addedStudents, ...this.students];
    this.saveData();

    return {
      total: addedStudents.length,
      valid: validCount,
      warnings: warningCount,
      duplicates: dupCount,
      newStudents: addedStudents
    };
  }

  // --- Monitoring Intake Check API: GET /api/v1/monitoring/intake-check/{institution_id} ---
  public getIntakeCheck(institutionId: string): IntakeAnalysis {
    const institution = this.getInstitutionById(institutionId);
    if (!institution) {
      throw new Error(`Institution not found: ${institutionId}`);
    }
    return calculateIntakeAnalysis(institution, this.students);
  }

  public getAllIntakeAnalyses(): IntakeAnalysis[] {
    return this.institutions.map(inst => calculateIntakeAnalysis(inst, this.students));
  }

  // --- Verification API: POST /api/v1/verify/credential ---
  public verifyCredential(
    apaarId: string,
    verifierEntity: string,
    ipAddress = '14.143.190.45'
  ): VerificationResult {
    const cleanApaar = normalizeApaarId(apaarId);
    const student = this.students.find(s => normalizeApaarId(s.apaar_id) === cleanApaar);
    const institution = student ? this.getInstitutionById(student.institution_id) : undefined;
    const isLocked = Boolean(student?.is_sharing_locked);

    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

    const logEntry: AccessAuditLog = {
      log_id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      apaar_id: cleanApaar || apaarId,
      verifier_entity: verifierEntity || 'Authorized Third-Party Verifier',
      access_timestamp: timestampStr,
      ip_address: ipAddress,
      alert_dispatched: true,
      student_name: student?.full_name || 'Unregistered Candidate',
      institution_name: institution?.name || 'Unknown Institution'
    };

    // Prepend to audit logs
    this.auditLogs = [logEntry, ...this.auditLogs];
    this.saveData();

    // Required Notification Template:
    // If student locked sharing:
    // "Security Alert: An access attempt by [Verifier] was BLOCKED on [Timestamp] because your APAAR credential sharing is LOCKED by you."
    // If unlocked:
    // "Alert: Your APAAR academic record was accessed by [Verifier Name] on [Timestamp]. If this wasn't you, report it immediately to AICTE support."
    const smsMessage = isLocked
      ? `Security Alert: An access attempt by ${logEntry.verifier_entity} was BLOCKED on ${timestampStr} because your APAAR credential sharing is LOCKED by you.`
      : `Alert: Your APAAR academic record was accessed by ${logEntry.verifier_entity} on ${timestampStr}. If this wasn't you, report it immediately to AICTE support.`;

    const result: VerificationResult = {
      verified: !isLocked && !!student,
      isLocked,
      lockNotice: isLocked ? 'Access blocked: Student has locked third-party verification consent.' : undefined,
      student: isLocked ? undefined : student,
      institution: isLocked ? undefined : institution,
      auditLog: logEntry,
      smsMessage
    };

    // Asynchronously dispatch real-time student alert
    setTimeout(() => {
      this.alertListeners.forEach(listener => listener(result));
    }, 150);

    return result;
  }

  // --- Audit Logs API ---
  public getAuditLogs(): AccessAuditLog[] {
    return [...this.auditLogs];
  }

  // --- Academic Bank of Credits (ABC) API ---
  public getCourseCredits(apaarId?: string): CourseCredit[] {
    // For presentation demo, default to Aarav's verified credits if requested or student logged in
    return [...this.courseCredits];
  }

  public getTransferRequests(institutionId?: string, apaarId?: string): CreditTransferRequest[] {
    let list = [...this.transferRequests];
    if (institutionId) {
      list = list.filter(
        r => r.source_institution_id === institutionId || r.target_institution_id === institutionId
      );
    }
    if (apaarId) {
      const clean = normalizeApaarId(apaarId);
      list = list.filter(r => normalizeApaarId(r.apaar_id) === clean);
    }
    return list;
  }

  public createCreditTransferRequest(
    apaarId: string,
    targetInstitutionId: string,
    targetProgram: string,
    courseCodes: string[]
  ): CreditTransferRequest {
    const student = this.getStudentByApaar(apaarId) || this.students[0];
    const sourceInst = this.getInstitutionById(student.institution_id) || this.institutions[0];
    const targetInst = this.getInstitutionById(targetInstitutionId) || this.institutions[1];

    const selectedCredits = this.courseCredits.filter(c => courseCodes.includes(c.course_code));
    const totalCredits = selectedCredits.reduce((acc, c) => acc + c.credits, 0) || 12;

    const reqId = `trans-${Date.now().toString().slice(-4)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const auditHash = computeDeterministicSha256(`${reqId}:${student.apaar_id}:${targetInst.aicte_id}:${totalCredits}`);

    const newRequest: CreditTransferRequest = {
      id: reqId,
      apaar_id: normalizeApaarId(apaarId),
      student_name: student.full_name,
      source_institution_id: sourceInst.id,
      source_institution_name: sourceInst.name,
      target_institution_id: targetInst.id,
      target_institution_name: targetInst.name,
      target_program: targetProgram,
      requested_at: nowStr,
      total_credits: totalCredits,
      course_codes: courseCodes.length > 0 ? courseCodes : ['CS8491', 'CS8492'],
      status: 'Pending Central Approval',
      audit_hash: auditHash
    };

    this.transferRequests = [newRequest, ...this.transferRequests];

    // Append to Blockchain Audit Ledger
    const lastBlock = this.auditBlocks[this.auditBlocks.length - 1];
    const newBlock = createAuditBlock(
      this.auditBlocks.length,
      'CREDIT_TRANSFER_REQUEST',
      `Student ${student.full_name} (${student.apaar_id})`,
      reqId,
      `Credit Transfer Initiated: ${totalCredits} ABC credits from ${sourceInst.name.split(',')[0]} to ${targetInst.name.split(',')[0]}`,
      lastBlock ? lastBlock.block_hash : '0'.repeat(64),
      nowStr
    );
    this.auditBlocks.push(newBlock);

    this.saveData();
    return newRequest;
  }

  public approveTransferRequest(requestId: string): CreditTransferRequest {
    const idx = this.transferRequests.findIndex(r => r.id === requestId);
    if (idx === -1) throw new Error('Transfer request not found');

    const req = this.transferRequests[idx];
    req.status = 'Approved & Synced';
    this.transferRequests[idx] = req;

    // Append block
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const lastBlock = this.auditBlocks[this.auditBlocks.length - 1];
    const newBlock = createAuditBlock(
      this.auditBlocks.length,
      'CREDIT_TRANSFER_APPROVED',
      'AICTE Central Regulatory Validator',
      req.id,
      `Credit Transfer Approved: ${req.total_credits} credits synced to ${req.target_institution_name.split(',')[0]}`,
      lastBlock ? lastBlock.block_hash : '0'.repeat(64),
      nowStr
    );
    this.auditBlocks.push(newBlock);

    this.saveData();
    return req;
  }

  public rejectTransferRequest(requestId: string, reason: string): CreditTransferRequest {
    const idx = this.transferRequests.findIndex(r => r.id === requestId);
    if (idx === -1) throw new Error('Transfer request not found');

    const req = this.transferRequests[idx];
    req.status = 'Rejected';
    req.rejection_reason = reason;
    this.transferRequests[idx] = req;

    // Append block
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const lastBlock = this.auditBlocks[this.auditBlocks.length - 1];
    const newBlock = createAuditBlock(
      this.auditBlocks.length,
      'CREDIT_TRANSFER_REJECTED',
      'AICTE Central Regulatory Validator',
      req.id,
      `Credit Transfer Rejected: ${reason}`,
      lastBlock ? lastBlock.block_hash : '0'.repeat(64),
      nowStr
    );
    this.auditBlocks.push(newBlock);

    this.saveData();
    return req;
  }

  // --- Ghost Student & Dropout Risk Analytics API ---
  public getGhostStudentMetrics(institutionId?: string): GhostStudentMetric[] {
    if (institutionId) {
      return this.ghostMetrics.filter(m => m.institution_id === institutionId);
    }
    return [...this.ghostMetrics];
  }

  public issueShowCauseNotice(studentId: string, reason?: string): boolean {
    const idx = this.ghostMetrics.findIndex(m => m.student_id === studentId);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    if (idx !== -1) {
      this.ghostMetrics[idx].notice_issued = true;
      this.ghostMetrics[idx].notice_timestamp = nowStr;
    }

    // Append block to ledger
    const lastBlock = this.auditBlocks[this.auditBlocks.length - 1];
    const student = this.students.find(s => s.student_id === studentId);
    const newBlock = createAuditBlock(
      this.auditBlocks.length,
      'GHOST_NOTICE_ISSUED',
      'AICTE Anti-Fraud & Regulatory Enforcement Wing',
      studentId,
      reason || `Statutory Show-Cause Notice Issued for high ghost risk / zero attendance: Student ${student?.full_name || studentId}`,
      lastBlock ? lastBlock.block_hash : '0'.repeat(64),
      nowStr
    );
    this.auditBlocks.push(newBlock);

    this.saveData();
    return true;
  }

  // --- Cryptographic Blockchain Ledger API ---
  public getAuditBlocks(): AuditBlock[] {
    return [...this.auditBlocks];
  }

  public verifyBlockchainLedger(): {
    isValid: boolean;
    verifiedCount: number;
    tamperedIndex?: number;
    message: string;
  } {
    return verifyChainIntegrity(this.auditBlocks);
  }

  public exportAuditTrailProof(): string {
    const proof = {
      title: 'AICTE APAAR National Cryptographic Audit Trail',
      authority: 'All India Council for Technical Education (Ministry of Education, Govt. of India)',
      exported_at: new Date().toISOString(),
      total_blocks: this.auditBlocks.length,
      chain_status: verifyChainIntegrity(this.auditBlocks),
      root_genesis_hash: this.auditBlocks[0]?.block_hash,
      tip_block_hash: this.auditBlocks[this.auditBlocks.length - 1]?.block_hash,
      blocks: this.auditBlocks
    };
    return JSON.stringify(proof, null, 2);
  }

  // --- Feature A: Verification Case Management API ---
  public getDuplicateCases(): DuplicateCase[] {
    return [...this.duplicateCases];
  }

  public updateDuplicateCase(
    caseId: string,
    status: CaseResolution,
    reviewerNotes: string,
    actor = 'AICTE Reviewer'
  ): DuplicateCase {
    const idx = this.duplicateCases.findIndex((c) => c.id === caseId);
    if (idx === -1) {
      throw new Error(`Case ${caseId} not found`);
    }
    const current = this.duplicateCases[idx];
    const updated: DuplicateCase = {
      ...current,
      status,
      reviewer_notes: reviewerNotes,
      last_updated: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      history: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          action: `Status changed to "${status}"`,
          actor,
          notes: reviewerNotes
        },
        ...current.history
      ]
    };
    this.duplicateCases[idx] = updated;

    // Log to timeline
    this.addTimelineEvent({
      category: 'Reviewer Action',
      summary: `Verification Case ${caseId} Updated (${status})`,
      details: `Resolution action taken by ${actor}: ${reviewerNotes}`,
      actor
    });

    this.saveData();
    return updated;
  }

  // --- Feature E: Exception Review Queue API ---
  public getExceptionQueue(): ExceptionItem[] {
    return [...this.exceptionItems];
  }

  public updateExceptionStatus(
    exceptionId: string,
    status: 'Pending Review' | 'In Progress' | 'Resolved'
  ): ExceptionItem {
    const idx = this.exceptionItems.findIndex((e) => e.id === exceptionId);
    if (idx === -1) {
      throw new Error(`Exception item ${exceptionId} not found`);
    }
    this.exceptionItems[idx].status = status;
    this.saveData();
    return this.exceptionItems[idx];
  }

  // --- Feature D: Data Provenance & Evidence Passport API ---
  public getStudentProvenance(studentId: string): ProvenanceRecord | null {
    const student = this.students.find((s) => s.id === studentId || s.student_id === studentId);
    if (!student) return null;
    const inst = this.institutions.find((i) => i.id === student.institution_id);
    const cleanApaar = normalizeApaarId(student.apaar_id);

    return {
      student_id: student.student_id,
      apaar_id: student.apaar_id,
      student_name: student.full_name,
      institution_name: inst?.name || 'Authorized Institution',
      batch_id: `BATCH-2026-${inst?.aicte_id.replace(/[^A-Z0-9]/g, '') || 'TN042'}`,
      source_system: `${inst?.name.split(',')[0] || 'Institution'} SIS Registry CSV Ingestion Engine`,
      ingested_at: student.created_at || '2026-08-15T10:30:00Z',
      record_hash: computeDeterministicSha256(`${cleanApaar}:${student.student_id}:${student.full_name}`),
      rules_evaluated: [
        {
          rule_id: 'RULE-LHN-01',
          rule_name: 'National 12-Digit Numerical Format Check',
          passed: cleanApaar.length === 12 && /^\d+$/.test(cleanApaar),
          details: cleanApaar.length === 12 ? 'Passed: Sequence contains exactly 12 numerical digits.' : `Failed: Found ${cleanApaar.length} digits.`
        },
        {
          rule_id: 'RULE-DEDUP-02',
          rule_name: 'Cross-Institution Concurrent Enrollment Check',
          passed: student.validation_status !== 'Duplicate',
          details: student.validation_status === 'Duplicate'
            ? 'Alert: Multi-college concurrent admission detected across active registries.'
            : 'Passed: Unique student APAAR identifier across all accredited institutions.'
        },
        {
          rule_id: 'RULE-CAP-03',
          rule_name: 'Sanctioned Intake Batch Limit Compliance',
          passed: !student.validation_notes?.includes('CAPACITY WARNING'),
          details: student.validation_notes?.includes('CAPACITY WARNING')
            ? 'Violation: Student enrolled beyond institutional approved quota.'
            : 'Passed: Enrolled within sanctioned seat quota for academic cycle.'
        },
        {
          rule_id: 'RULE-ABC-04',
          rule_name: 'Academic Bank of Credits (ABC) Sync Ready',
          passed: Boolean(cleanApaar),
          details: 'Verified: Academic credit bank ledger connected for degree mobility.'
        }
      ],
      revision_history: [
        {
          timestamp: student.created_at || '2026-08-15 10:30 UTC',
          event: 'Initial Batch Record Ingested',
          modified_by: `${inst?.name.split(',')[0]} Registrar Portal`
        },
        {
          timestamp: '2026-09-01 09:15 UTC',
          event: 'Automated Deduplication Pipeline Executed',
          modified_by: 'Central AICTE Ingestion Engine'
        }
      ]
    };
  }

  // --- Feature F: Import & Audit Timeline API ---
  public getTimelineEvents(): TimelineEvent[] {
    return [...this.timelineEvents];
  }

  public addTimelineEvent(
    event: Omit<TimelineEvent, 'id' | 'timestamp' | 'storage_type'>
  ): TimelineEvent {
    const newEvt: TimelineEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      storage_type: 'Session (In-Memory)',
      ...event
    };
    this.timelineEvents = [newEvt, ...this.timelineEvents];
    this.saveData();
    return newEvt;
  }

  // Reset database back to original initial seed state
  public resetSeedData() {
    this.initData(true);
  }
}

export const apiService = new ApiService();

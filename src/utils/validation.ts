/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, ValidationStatus, AdmissionCategory, IntakeAnalysis, Institution } from '../types.ts';

/**
 * Normalizes APAAR ID by removing hyphens and whitespace.
 */
export function normalizeApaarId(id: string | null | undefined): string {
  if (!id) return '';
  return id.replace(/[\s-]/g, '').trim();
}

/**
 * Validates whether an APAAR / ABC ID conforms to the 12-digit Indian national standard.
 */
export function isValidApaarId(id: string | null | undefined): { valid: boolean; formatted: string; error?: string } {
  const normalized = normalizeApaarId(id);
  if (!normalized) {
    return { valid: false, formatted: '', error: 'APAAR ID is missing' };
  }
  if (!/^\d+$/.test(normalized)) {
    return { valid: false, formatted: normalized, error: 'APAAR ID must contain only numerical digits' };
  }
  if (normalized.length !== 12) {
    return {
      valid: false,
      formatted: normalized,
      error: `APAAR ID must be exactly 12 digits (found ${normalized.length} digits)`
    };
  }
  // Format as XXXX-XXXX-XXXX
  const formatted = `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8, 12)}`;
  return { valid: true, formatted };
}

/**
 * Computes the Luhn Modulo 10 check digit for a string of digits.
 */
export function computeLuhnCheckDigit(digits: string): string {
  const clean = digits.replace(/\D/g, '');
  if (!clean) return '0';
  let sum = 0;
  let double = true;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  const check = (10 - (sum % 10)) % 10;
  return check.toString();
}

/**
 * Validates the full 12-digit Luhn check digit integrity.
 */
export function verifyLuhnChecksum(digits: string): boolean {
  const clean = normalizeApaarId(digits);
  if (clean.length !== 12 || !/^\d+$/.test(clean)) return false;
  const payload = clean.slice(0, 11);
  const actualCheck = clean.slice(11);
  return computeLuhnCheckDigit(payload) === actualCheck;
}

export interface ApaarStructureAnalysis {
  isValidLength: boolean;
  isNumeric: boolean;
  normalized: string;
  formatted: string;
  routingBlock: string;
  seriesBlock: string;
  sequenceBlock: string;
  checksumDigit: string;
  expectedChecksum: string;
  isChecksumValid: boolean;
  status: 'valid' | 'invalid_format' | 'checksum_mismatch' | 'incomplete';
  statusLabel: string;
}

/**
 * Decomposes an APAAR ID into its constituent architectural segments for diagnostic review.
 */
export function analyzeApaarStructure(rawInput: string | null | undefined): ApaarStructureAnalysis {
  const normalized = normalizeApaarId(rawInput);
  const isNumeric = /^\d+$/.test(normalized);
  const isValidLength = normalized.length === 12;

  let routingBlock = '';
  let seriesBlock = '';
  let sequenceBlock = '';
  let checksumDigit = '';
  let expectedChecksum = '';

  if (normalized.length > 0) {
    routingBlock = normalized.slice(0, Math.min(4, normalized.length));
  }
  if (normalized.length > 4) {
    seriesBlock = normalized.slice(4, Math.min(8, normalized.length));
  }
  if (normalized.length > 8) {
    sequenceBlock = normalized.slice(8, Math.min(11, normalized.length));
  }
  if (normalized.length >= 12) {
    checksumDigit = normalized.slice(11, 12);
  }

  if (normalized.length >= 11 && isNumeric) {
    expectedChecksum = computeLuhnCheckDigit(normalized.slice(0, 11));
  }

  const isChecksumValid = isValidLength && isNumeric && checksumDigit === expectedChecksum;

  let status: 'valid' | 'invalid_format' | 'checksum_mismatch' | 'incomplete' = 'incomplete';
  let statusLabel = 'Incomplete ID';

  if (!normalized) {
    status = 'incomplete';
    statusLabel = 'Awaiting 12-digit input';
  } else if (!isNumeric) {
    status = 'invalid_format';
    statusLabel = 'Non-numerical characters detected';
  } else if (normalized.length < 12) {
    status = 'incomplete';
    statusLabel = `Incomplete: ${normalized.length}/12 digits entered`;
  } else if (normalized.length > 12) {
    status = 'invalid_format';
    statusLabel = `Excess length: ${normalized.length} digits (expected 12)`;
  } else if (!isChecksumValid) {
    status = 'checksum_mismatch';
    statusLabel = `Checksum mismatch (found ${checksumDigit}, calculated ${expectedChecksum})`;
  } else {
    status = 'valid';
    statusLabel = '12-Digit Structure & Checksum Valid';
  }

  const formatted = isValidApaarId(normalized).formatted || normalized;

  return {
    isValidLength,
    isNumeric,
    normalized,
    formatted,
    routingBlock,
    seriesBlock,
    sequenceBlock,
    checksumDigit,
    expectedChecksum,
    isChecksumValid,
    status,
    statusLabel
  };
}

/**
 * Validates a single student record and returns the computed status and notes.
 */
export function evaluateStudentRecord(
  student: Partial<Student>,
  existingStudents: Student[] = [],
  currentBatch: Partial<Student>[] = []
): { status: ValidationStatus; notes: string } {
  const apaarCheck = isValidApaarId(student.apaar_id);

  if (!apaarCheck.valid) {
    return {
      status: 'Warning',
      notes: apaarCheck.error || 'Invalid APAAR ID format'
    };
  }

  const cleanApaar = normalizeApaarId(student.apaar_id);

  // Check for duplicate in existing students (excluding self if editing)
  const existingMatches = existingStudents.filter(
    (s) => normalizeApaarId(s.apaar_id) === cleanApaar && s.id !== student.id
  );

  // Check for duplicate within current batch
  const batchMatches = currentBatch.filter(
    (s) => normalizeApaarId(s.apaar_id) === cleanApaar && s.student_id !== student.student_id
  );

  if (existingMatches.length > 0 || batchMatches.length > 0) {
    const conflictColleges = new Set<string>();
    existingMatches.forEach(m => conflictColleges.add(m.institution_id));
    
    return {
      status: 'Duplicate',
      notes: `Duplicate APAAR ID detected! Already registered across ${existingMatches.length + batchMatches.length} record(s).`
    };
  }

  // Check required fields
  if (!student.student_id || student.student_id.trim() === '') {
    return { status: 'Needs Review', notes: 'Missing internal college Roll / Student ID' };
  }
  if (!student.full_name || student.full_name.trim().length < 2) {
    return { status: 'Needs Review', notes: 'Student Full Name is required' };
  }
  if (!student.program || student.program.trim() === '') {
    return { status: 'Needs Review', notes: 'Degree / Program is required' };
  }

  const validCategories: AdmissionCategory[] = ['Regular', 'NRI', 'OCI', 'Foreign National', 'Supernumerary'];
  if (student.admission_category && !validCategories.includes(student.admission_category as AdmissionCategory)) {
    return { status: 'Warning', notes: `Unrecognized admission category '${student.admission_category}'` };
  }

  return { status: 'Valid', notes: 'Verified: 12-digit APAAR valid, no duplicate detected' };
}

/**
 * Calculates intake analysis comparing enrolled students against approved intake capacity.
 */
export function calculateIntakeAnalysis(
  institution: Institution,
  students: Student[]
): IntakeAnalysis {
  const institutionStudents = students.filter(s => s.institution_id === institution.id);
  const enrolledCount = institutionStudents.length;
  const approvedIntake = institution.approved_intake;
  const isExceeded = enrolledCount > approvedIntake;
  const excessCount = isExceeded ? enrolledCount - approvedIntake : 0;
  const utilizationPercentage = approvedIntake > 0 
    ? Math.round((enrolledCount / approvedIntake) * 1000) / 10 
    : 0;

  const programBreakdown: Record<string, number> = {};
  for (const s of institutionStudents) {
    const prog = s.program || 'Unknown';
    programBreakdown[prog] = (programBreakdown[prog] || 0) + 1;
  }

  return {
    institution_id: institution.id,
    institution_name: institution.name,
    aicte_id: institution.aicte_id,
    approved_intake: approvedIntake,
    enrolled_count: enrolledCount,
    utilization_percentage: utilizationPercentage,
    is_exceeded: isExceeded,
    excess_count: excessCount,
    program_breakdown: programBreakdown
  };
}

/**
 * Parses raw CSV content into student candidate records.
 */
export function parseCSVToStudents(csvContent: string): {
  records: Array<{
    apaar_id: string;
    student_id: string;
    full_name: string;
    program: string;
    admission_year: number;
    admission_category: AdmissionCategory;
  }>;
  errors: string[];
} {
  const lines = csvContent.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { records: [], errors: ['CSV file is empty or missing headers'] };
  }

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  
  const apaarIdx = headers.findIndex(h => h.includes('apaar') || h.includes('abc_id'));
  const studentIdIdx = headers.findIndex(h => h.includes('student_id') || h.includes('roll') || h.includes('reg_no'));
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('full_name'));
  const programIdx = headers.findIndex(h => h.includes('program') || h.includes('branch') || h.includes('course'));
  const yearIdx = headers.findIndex(h => h.includes('year') || h.includes('admission_year'));
  const catIdx = headers.findIndex(h => h.includes('category') || h.includes('admission_category'));

  const records: Array<{
    apaar_id: string;
    student_id: string;
    full_name: string;
    program: string;
    admission_year: number;
    admission_category: AdmissionCategory;
  }> = [];

  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split on comma ignoring commas inside quotes
    const values = rawLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^["']|["']$/g, ''));

    const apaar_id = apaarIdx >= 0 && values[apaarIdx] ? values[apaarIdx] : '';
    const student_id = studentIdIdx >= 0 && values[studentIdIdx] ? values[studentIdIdx] : `ROLL-${1000 + i}`;
    const full_name = nameIdx >= 0 && values[nameIdx] ? values[nameIdx] : `Student ${i}`;
    const program = programIdx >= 0 && values[programIdx] ? values[programIdx] : 'B.Tech Information Technology';
    const admission_year = yearIdx >= 0 && values[yearIdx] ? parseInt(values[yearIdx], 10) || 2026 : 2026;
    
    let admission_category: AdmissionCategory = 'Regular';
    if (catIdx >= 0 && values[catIdx]) {
      const val = values[catIdx];
      if (['Regular', 'NRI', 'OCI', 'Foreign National', 'Supernumerary'].includes(val)) {
        admission_category = val as AdmissionCategory;
      }
    }

    records.push({
      apaar_id,
      student_id,
      full_name,
      program,
      admission_year,
      admission_category
    });
  }

  return { records, errors };
}

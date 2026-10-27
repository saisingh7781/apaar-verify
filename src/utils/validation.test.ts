/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidApaarId,
  evaluateStudentRecord,
  calculateIntakeAnalysis,
  parseCSVToStudents,
  normalizeApaarId,
  computeLuhnCheckDigit,
  analyzeApaarStructure
} from './validation.ts';
import { Student, Institution } from '../types.ts';

test('normalizeApaarId removes hyphens and spaces', () => {
  assert.equal(normalizeApaarId('1234-5678-9012'), '123456789012');
  assert.equal(normalizeApaarId(' 1234 5678 9012 '), '123456789012');
  assert.equal(normalizeApaarId(''), '');
});

test('isValidApaarId enforces 12 numerical digits', () => {
  const validResult = isValidApaarId('123456789012');
  assert.equal(validResult.valid, true);
  assert.equal(validResult.formatted, '1234-5678-9012');

  const formattedInputResult = isValidApaarId('9876-5432-1098');
  assert.equal(formattedInputResult.valid, true);
  assert.equal(formattedInputResult.formatted, '9876-5432-1098');

  // Short 10-digit should fail
  const shortResult = isValidApaarId('1234567890');
  assert.equal(shortResult.valid, false);
  assert.match(shortResult.error || '', /must be exactly 12 digits/);

  // Non-numeric should fail
  const alphaResult = isValidApaarId('12345678901A');
  assert.equal(alphaResult.valid, false);
  assert.match(alphaResult.error || '', /only numerical digits/);

  // Missing should fail
  const emptyResult = isValidApaarId('');
  assert.equal(emptyResult.valid, false);
  assert.match(emptyResult.error || '', /missing/);
});

test('evaluateStudentRecord flags duplicate APAAR IDs across institutions', () => {
  const existingStudents: Student[] = [
    {
      id: 'stud-1',
      apaar_id: '1234-5678-9012',
      student_id: 'MIT-CSE-001',
      full_name: 'Aarav Ramanathan',
      program: 'B.Tech Computer Science and Engineering',
      admission_year: 2026,
      admission_category: 'Regular',
      institution_id: 'inst-1',
      validation_status: 'Valid'
    }
  ];

  // Identical APAAR at college 2
  const duplicateCandidate: Partial<Student> = {
    id: 'stud-2',
    apaar_id: '1234-5678-9012',
    student_id: 'CEG-IT-044',
    full_name: 'Aarav R',
    program: 'B.Tech Information Technology',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-2'
  };

  const evalResult = evaluateStudentRecord(duplicateCandidate, existingStudents);
  assert.equal(evalResult.status, 'Duplicate');
  assert.match(evalResult.notes, /Duplicate APAAR ID detected/);
});

test('calculateIntakeAnalysis detects capacity breach when intake exceeded', () => {
  const institution: Institution = {
    id: 'inst-3',
    aicte_id: 'AICTE-TN-015',
    name: 'PSG College of Technology, Coimbatore',
    state: 'Tamil Nadu',
    approved_intake: 90
  };

  // Create 95 students
  const students: Student[] = Array.from({ length: 95 }, (_, i) => ({
    id: `stud-${i}`,
    apaar_id: `99990000${(1000 + i).toString()}`,
    student_id: `PSG-MECH-${i + 1}`,
    full_name: `PSG Student ${i + 1}`,
    program: i < 50 ? 'B.Tech Mechanical Engineering' : 'B.Tech Robotics and Automation',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-3',
    validation_status: 'Valid'
  }));

  const analysis = calculateIntakeAnalysis(institution, students);
  assert.equal(analysis.enrolled_count, 95);
  assert.equal(analysis.approved_intake, 90);
  assert.equal(analysis.is_exceeded, true);
  assert.equal(analysis.excess_count, 5);
  assert.equal(analysis.utilization_percentage, 105.6);
  assert.equal(analysis.program_breakdown['B.Tech Mechanical Engineering'], 50);
  assert.equal(analysis.program_breakdown['B.Tech Robotics and Automation'], 45);
});

test('parseCSVToStudents extracts student records accurately', () => {
  const sampleCsv = `apaar_id,student_id,full_name,program,admission_year,admission_category
111122223333,MIT-CS-101,Kavya Sundaram,B.Tech Computer Science,2026,Regular
444455556666,MIT-CS-102,Deepak Sharma,B.Tech Computer Science,2026,NRI`;

  const parsed = parseCSVToStudents(sampleCsv);
  assert.equal(parsed.records.length, 2);
  assert.equal(parsed.records[0].apaar_id, '111122223333');
  assert.equal(parsed.records[0].full_name, 'Kavya Sundaram');
  assert.equal(parsed.records[1].admission_category, 'NRI');
});

test('computeLuhnCheckDigit and analyzeApaarStructure validate 12-digit segments', () => {
  const digits11 = '12345678901';
  const checkDigit = computeLuhnCheckDigit(digits11);
  assert.match(checkDigit, /^\d$/);

  const full12 = digits11 + checkDigit;
  const analysis = analyzeApaarStructure(full12);
  assert.equal(analysis.isValidLength, true);
  assert.equal(analysis.isNumeric, true);
  assert.equal(analysis.isChecksumValid, true);
  assert.equal(analysis.status, 'valid');
  assert.equal(analysis.routingBlock, '1234');
  assert.equal(analysis.seriesBlock, '5678');
  assert.equal(analysis.sequenceBlock, '901');
  assert.equal(analysis.checksumDigit, checkDigit);

  // Incomplete analysis
  const incomplete = analyzeApaarStructure('12345');
  assert.equal(incomplete.status, 'incomplete');

  // Checksum mismatch
  const wrongCheck = digits11 + ((parseInt(checkDigit, 10) + 1) % 10).toString();
  const mismatch = analyzeApaarStructure(wrongCheck);
  assert.equal(mismatch.status, 'checksum_mismatch');
});


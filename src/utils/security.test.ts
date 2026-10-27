/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDeterministicSha256,
  createAuditBlock,
  verifyChainIntegrity,
  calculateGhostStudentRisk
} from './security.ts';
import { AuditBlock } from '../types.ts';

test('computeDeterministicSha256 generates consistent 64-char hashes', () => {
  const hash1 = computeDeterministicSha256('AICTE-TN-042:INTAKE_BREACH');
  const hash2 = computeDeterministicSha256('AICTE-TN-042:INTAKE_BREACH');
  const hash3 = computeDeterministicSha256('AICTE-TN-001:VALID');

  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
  assert.equal(hash1.length, 64);
  assert.match(hash1, /^sha256_/);
});

test('createAuditBlock builds correctly linked cryptographic blocks', () => {
  const genesis = createAuditBlock(
    0,
    'GENESIS',
    'AICTE Central Security Root Authority',
    'SYS-ROOT',
    'Genesis Block Initialized',
    '0000000000000000000000000000000000000000000000000000000000000000',
    '2026-10-01 00:00:00 UTC'
  );

  const block1 = createAuditBlock(
    1,
    'INTAKE_BREACH',
    'Central Regional Inspection Cell',
    'inst-3',
    'PSG Tech Sanctioned Capacity Exceeded: 95 enrolled vs 90 approved',
    genesis.block_hash,
    '2026-10-02 10:00:00 UTC'
  );

  const blocks: AuditBlock[] = [genesis, block1];
  const result = verifyChainIntegrity(blocks);

  assert.equal(result.isValid, true);
  assert.equal(result.verifiedCount, 2);
  assert.match(result.message, /0 Tampering Detected/);
});

test('verifyChainIntegrity detects tampering in block payload or hash', () => {
  const genesis = createAuditBlock(
    0,
    'GENESIS',
    'System',
    'SYS',
    'Genesis',
    '0'.repeat(64),
    '2026-10-01 00:00:00 UTC'
  );

  const block1 = createAuditBlock(
    1,
    'CONSENT_LOCKED',
    'Student Aarav',
    '123456789012',
    'Privacy Lock Activated',
    genesis.block_hash,
    '2026-10-02 12:00:00 UTC'
  );

  const blocks: AuditBlock[] = [genesis, block1];

  // Tamper with block1 details
  const tamperedBlocks = JSON.parse(JSON.stringify(blocks));
  tamperedBlocks[1].details = 'Tampered text trying to fake consent';

  const check = verifyChainIntegrity(tamperedBlocks);
  assert.equal(check.isValid, false);
  assert.equal(check.tamperedIndex, 1);
  assert.match(check.message, /Tampering detected at Block #1/);
});

test('calculateGhostStudentRisk flags critical ghost admissions accurately', () => {
  // Scenario 1: Critical ghost student with 75 days LMS inactivity and 12% attendance
  const ghostStudent = calculateGhostStudentRisk({
    last_lms_login_days: 75,
    attendance_percentage: 12,
    fee_payment_status: 'Unpaid (Overdue >90d)',
    biometric_verified: false,
    is_duplicate: false
  });

  assert.equal(ghostStudent.level, 'Critical / Ghost Admission');
  assert.ok(ghostStudent.score >= 65);
  assert.ok(ghostStudent.flags.some(f => f.includes('Zero digital LMS footprint')));
  assert.ok(ghostStudent.flags.some(f => f.includes('Critical attendance deficit')));

  // Scenario 2: Active compliant student
  const activeStudent = calculateGhostStudentRisk({
    last_lms_login_days: 2,
    attendance_percentage: 92,
    fee_payment_status: 'Paid',
    biometric_verified: true,
    is_duplicate: false
  });

  assert.equal(activeStudent.level, 'Low');
  assert.equal(activeStudent.score, 0);
  assert.equal(activeStudent.flags.length, 0);
});

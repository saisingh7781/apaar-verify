/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuditBlock, BlockEventType, GhostRiskLevel } from '../types.ts';

/**
 * Computes a deterministic pseudo-SHA256 hexadecimal hash string for blockchain blocks and audit verification.
 */
export function computeDeterministicSha256(input: string): string {
  let h1 = 0xdeadbeef ^ 0xcafebabe;
  let h2 = 0x41c6ce57 ^ 0x6a09e667;
  let h3 = 0x9e3779b9 ^ 0xbb67ae85;
  let h4 = 0x85ebca6b ^ 0x3c6ef372;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 97429);
    h4 = Math.imul(h4 ^ ch, 2147483647);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const hex4 = (h4 >>> 0).toString(16).padStart(8, '0');

  // Generate 64-character SHA-256 style hash
  const seed = `${hex1}${hex2}${hex3}${hex4}`;
  const rev = seed.split('').reverse().join('');
  return `sha256_${seed}${rev}`.slice(0, 64);
}

/**
 * Creates a new immutable block in the audit blockchain.
 */
export function createAuditBlock(
  index: number,
  event_type: BlockEventType,
  issuer: string,
  entity_id: string,
  details: string,
  previous_hash: string,
  timestampStr?: string,
  nonce = 104729
): AuditBlock {
  const timestamp = timestampStr || new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const payloadData = `${event_type}:${issuer}:${entity_id}:${details}`;
  const payload_hash = computeDeterministicSha256(payloadData);
  const blockRaw = `${index}:${timestamp}:${previous_hash}:${payload_hash}:${nonce}`;
  const block_hash = computeDeterministicSha256(blockRaw);

  return {
    index,
    timestamp,
    event_type,
    issuer,
    entity_id,
    details,
    previous_hash,
    payload_hash,
    block_hash,
    nonce
  };
}

/**
 * Verifies the mathematical integrity of the entire cryptographic blockchain ledger.
 */
export function verifyChainIntegrity(blocks: AuditBlock[]): {
  isValid: boolean;
  verifiedCount: number;
  tamperedIndex?: number;
  message: string;
} {
  if (!blocks || blocks.length === 0) {
    return { isValid: true, verifiedCount: 0, message: 'Ledger empty (0 blocks)' };
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Check payload hash
    const expectedPayloadHash = computeDeterministicSha256(
      `${block.event_type}:${block.issuer}:${block.entity_id}:${block.details}`
    );
    if (block.payload_hash !== expectedPayloadHash) {
      return {
        isValid: false,
        verifiedCount: i,
        tamperedIndex: i,
        message: `Tampering detected at Block #${block.index}: Payload hash mismatch!`
      };
    }

    // Check previous hash link
    if (i > 0) {
      const prevBlock = blocks[i - 1];
      if (block.previous_hash !== prevBlock.block_hash) {
        return {
          isValid: false,
          verifiedCount: i,
          tamperedIndex: i,
          message: `Chain broken at Block #${block.index}: Previous hash does not match Block #${prevBlock.index}!`
        };
      }
    }

    // Check block hash calculation
    const expectedBlockHash = computeDeterministicSha256(
      `${block.index}:${block.timestamp}:${block.previous_hash}:${block.payload_hash}:${block.nonce}`
    );
    if (block.block_hash !== expectedBlockHash) {
      return {
        isValid: false,
        verifiedCount: i,
        tamperedIndex: i,
        message: `Cryptographic proof invalid at Block #${block.index}: Block signature mismatch!`
      };
    }
  }

  return {
    isValid: true,
    verifiedCount: blocks.length,
    message: `Ledger Integrity Verified: 0 Tampering Detected (${blocks.length} blocks checked)`
  };
}

/**
 * Ghost Student & Dropout Anomaly Risk Scoring Engine.
 * Evaluates digital footprint, LMS login activity, fee payments, and attendance.
 */
export function calculateGhostStudentRisk(input: {
  last_lms_login_days: number;
  attendance_percentage: number;
  fee_payment_status: 'Paid' | 'Partial' | 'Unpaid (Overdue >90d)';
  biometric_verified: boolean;
  is_duplicate?: boolean;
}): {
  score: number;
  level: GhostRiskLevel;
  flags: string[];
} {
  let score = 0;
  const flags: string[] = [];

  // LMS activity penalty
  if (input.last_lms_login_days > 60) {
    score += 45;
    flags.push(`Zero digital LMS footprint (${input.last_lms_login_days} days inactive)`);
  } else if (input.last_lms_login_days > 30) {
    score += 25;
    flags.push(`Infrequent LMS activity (${input.last_lms_login_days} days inactive)`);
  }

  // Attendance penalty
  if (input.attendance_percentage < 30) {
    score += 35;
    flags.push(`Critical attendance deficit (${input.attendance_percentage}% vs 75% required)`);
  } else if (input.attendance_percentage < 65) {
    score += 15;
    flags.push(`Sub-par attendance warning (${input.attendance_percentage}%)`);
  }

  // Fee payment penalty
  if (input.fee_payment_status === 'Unpaid (Overdue >90d)') {
    score += 15;
    flags.push('Institutional tuition fees overdue > 90 days');
  } else if (input.fee_payment_status === 'Partial') {
    score += 5;
  }

  // Biometric verification penalty
  if (!input.biometric_verified) {
    score += 10;
    flags.push('Missing Aadhaar biometric campus attendance e-KYC');
  }

  // Duplicate collision penalty
  if (input.is_duplicate) {
    score += 30;
    flags.push('Concurrent multi-college admission conflict detected');
  }

  // Normalize score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, score));

  let level: GhostRiskLevel = 'Low';
  if (normalizedScore >= 65) {
    level = 'Critical / Ghost Admission';
  } else if (normalizedScore >= 35) {
    level = 'Moderate';
  } else {
    level = 'Low';
  }

  return {
    score: normalizedScore,
    level,
    flags
  };
}

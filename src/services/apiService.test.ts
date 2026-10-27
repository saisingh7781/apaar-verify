/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from './apiService.ts';

test('apiService initializes seed institutions and students', () => {
  apiService.initData(true);
  const institutions = apiService.getInstitutions();
  assert.equal(institutions.length, 3);
  assert.equal(institutions[0].aicte_id, 'AICTE-TN-042');
  assert.equal(institutions[2].approved_intake, 90);

  const students = apiService.getStudents();
  assert.ok(students.length >= 20);
});

test('apiService detects capacity breach in PSG College (95 > 90)', () => {
  apiService.initData(true);
  const psgIntake = apiService.getIntakeCheck('inst-3');
  assert.equal(psgIntake.approved_intake, 90);
  assert.equal(psgIntake.enrolled_count, 95);
  assert.equal(psgIntake.is_exceeded, true);
  assert.equal(psgIntake.excess_count, 5);
  assert.ok(psgIntake.utilization_percentage > 100);
});

test('apiService verifyCredential inserts audit log and triggers student alert', () => {
  apiService.initData(true);
  const initialLogsCount = apiService.getAuditLogs().length;

  let alertDispatched = false;
  const unsubscribe = apiService.onAlertDispatched((res) => {
    if (res.student?.apaar_id === '123456789012') {
      alertDispatched = true;
    }
  });

  const result = apiService.verifyCredential('1234-5678-9012', 'Infosys Tech Recruitment');
  assert.equal(result.verified, true);
  assert.equal(result.student?.full_name, 'Aarav Ramanathan');
  assert.match(result.smsMessage, /Alert: Your APAAR academic record was accessed by Infosys Tech Recruitment/);

  const updatedLogs = apiService.getAuditLogs();
  assert.equal(updatedLogs.length, initialLogsCount + 1);
  assert.equal(updatedLogs[0].apaar_id, '123456789012');
  assert.equal(updatedLogs[0].alert_dispatched, true);

  unsubscribe();
});

test('apiService supports student login and consent control lock', () => {
  apiService.initData(true);
  const session = apiService.loginAsStudent('123456789012');
  assert.equal(session.role, 'student');
  assert.equal(session.student_apaar_id, '123456789012');
  assert.equal(session.name, 'Aarav Ramanathan');

  // Lock consent
  apiService.toggleStudentConsent('123456789012', true);
  const lockedVerify = apiService.verifyCredential('1234-5678-9012', 'ThirdParty Background Check Agency');
  assert.equal(lockedVerify.verified, false);
  assert.equal(lockedVerify.isLocked, true);
  assert.match(lockedVerify.smsMessage, /BLOCKED on/);

  // Unlock consent
  apiService.toggleStudentConsent('123456789012', false);
  const unlockedVerify = apiService.verifyCredential('1234-5678-9012', 'ThirdParty Background Check Agency');
  assert.equal(unlockedVerify.verified, true);
  assert.equal(unlockedVerify.isLocked, false);
});

test('apiService manages ABC credit transfer and blockchain audit logging', () => {
  apiService.initData(true);
  const credits = apiService.getCourseCredits('123456789012');
  assert.ok(credits.length >= 8);
  assert.equal(credits[0].course_code, 'CS8251');

  // Initiate transfer
  const initialTransfersCount = apiService.getTransferRequests().length;
  const initialBlockCount = apiService.getAuditBlocks().length;

  const newReq = apiService.createCreditTransferRequest(
    '123456789012',
    'inst-2',
    'B.Tech Computer Science & Engineering',
    ['CS8491', 'CS8492']
  );

  assert.equal(newReq.status, 'Pending Central Approval');
  assert.equal(newReq.total_credits, 7);
  assert.equal(apiService.getTransferRequests().length, initialTransfersCount + 1);

  // Blockchain block added
  const updatedBlocks = apiService.getAuditBlocks();
  assert.equal(updatedBlocks.length, initialBlockCount + 1);
  assert.equal(updatedBlocks[updatedBlocks.length - 1].event_type, 'CREDIT_TRANSFER_REQUEST');

  // Central Regulator approves transfer
  const approved = apiService.approveTransferRequest(newReq.id);
  assert.equal(approved.status, 'Approved & Synced');

  // Blockchain integrity check
  const integrity = apiService.verifyBlockchainLedger();
  assert.equal(integrity.isValid, true);
  assert.match(integrity.message, /0 Tampering Detected/);
});

test('apiService handles ghost student anomaly detection and statutory notices', () => {
  apiService.initData(true);
  const ghostMetrics = apiService.getGhostStudentMetrics();
  assert.ok(ghostMetrics.length >= 4);

  const criticalGhost = ghostMetrics.find(m => m.risk_level === 'Critical / Ghost Admission');
  assert.ok(criticalGhost);
  assert.ok(criticalGhost.risk_score >= 65);

  // Issue show cause notice
  const success = apiService.issueShowCauseNotice(criticalGhost.student_id, 'Urgent inquiry into 78-day zero footprint');
  assert.equal(success, true);

  const updatedGhost = apiService.getGhostStudentMetrics().find(m => m.student_id === criticalGhost.student_id);
  assert.equal(updatedGhost?.notice_issued, true);
  assert.ok(updatedGhost?.notice_timestamp);
});

test('apiService supports case management, exception queue, and provenance', () => {
  apiService.initData(true);
  // Case management
  const cases = apiService.getDuplicateCases();
  assert.ok(cases.length >= 1);
  assert.equal(cases[0].apaar_id, '548291037462');
  
  apiService.updateDuplicateCase(cases[0].id, 'Confirmed Duplicate', 'Both colleges confirmed physical admission letters', 'Regulator A. Sahasrabudhe');
  const updatedCase = apiService.getDuplicateCases().find(c => c.id === cases[0].id);
  assert.equal(updatedCase?.status, 'Confirmed Duplicate');
  assert.equal(updatedCase?.reviewer_notes, 'Both colleges confirmed physical admission letters');

  // Exception queue
  const exceptions = apiService.getExceptionQueue();
  assert.ok(exceptions.length >= 5);
  apiService.updateExceptionStatus(exceptions[0].id, 'In Progress');
  assert.equal(apiService.getExceptionQueue()[0].status, 'In Progress');

  // Student provenance
  const prov = apiService.getStudentProvenance('stud-mit-01');
  assert.ok(prov);
  assert.equal(prov?.student_name, 'Aarav Ramanathan');
  assert.equal(prov?.rules_evaluated.length, 4);

  // Timeline events
  const events = apiService.getTimelineEvents();
  assert.ok(events.length >= 5);
});




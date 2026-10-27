/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBreadcrumbs, getScreenLabel } from './breadcrumbs.ts';

test('getScreenLabel returns user-friendly screen labels for breadcrumb back button', () => {
  assert.equal(getScreenLabel('landing'), 'Home');
  assert.equal(getScreenLabel('student-portal'), 'Student Portal');
  assert.equal(getScreenLabel('validation-results'), 'Validation Engine');
  assert.equal(getScreenLabel('institution-dashboard'), 'Institute Portal');
  assert.equal(getScreenLabel('audit-ledger'), 'Cryptographic Ledger');
  assert.equal(getScreenLabel('ghost-audit'), 'Ghost Student Audit');
});

test('resolveBreadcrumbs returns root item on landing page', () => {
  const crumbs = resolveBreadcrumbs({ screen: 'landing' });
  assert.equal(crumbs.length, 1);
  assert.equal(crumbs[0].id, 'root');
  assert.equal(crumbs[0].isCurrent, true);
  assert.equal(crumbs[0].label, 'National Registry');
});

test('resolveBreadcrumbs generates 4-level hierarchy for institutional dashboard with active college', () => {
  const crumbs = resolveBreadcrumbs({
    screen: 'institution-dashboard',
    userRole: 'institution_admin',
    institution: {
      id: 'inst-1',
      aicte_id: 'AICTE-TN-042',
      name: 'Madras Institute of Technology, Chennai',
      state: 'Tamil Nadu',
      approved_intake: 120
    }
  });

  assert.equal(crumbs.length, 4);
  assert.equal(crumbs[0].id, 'root');
  assert.equal(crumbs[1].id, 'domain-institution');
  assert.equal(crumbs[1].label, 'Institutional Operations');
  assert.equal(crumbs[2].id, 'inst-dash');
  assert.equal(crumbs[2].label, 'Institute Dashboard');
  assert.equal(crumbs[3].id, 'inst-entity');
  assert.equal(crumbs[3].label, 'Madras Institute of Technology');
  assert.equal(crumbs[3].isCurrent, true);
  assert.equal(crumbs[3].badge, '120 Sanctioned');
});

test('resolveBreadcrumbs generates domain and leaf for validation results with active tab', () => {
  const crumbs = resolveBreadcrumbs({
    screen: 'validation-results',
    activeTabLabel: 'Verification Cases'
  });

  assert.equal(crumbs.length, 4);
  assert.equal(crumbs[0].id, 'root');
  assert.equal(crumbs[1].id, 'domain-engine');
  assert.equal(crumbs[1].label, 'Verification & Deduplication');
  assert.equal(crumbs[2].id, 'val-results');
  assert.equal(crumbs[3].id, 'case-tab');
  assert.equal(crumbs[3].label, 'Verification Cases');
  assert.equal(crumbs[3].isCurrent, true);
});

test('resolveBreadcrumbs provides citizen trail with student entity', () => {
  const crumbs = resolveBreadcrumbs({
    screen: 'student-portal',
    userRole: 'student',
    studentName: 'Aarav Ramanathan'
  });

  assert.equal(crumbs.length, 4);
  assert.equal(crumbs[0].id, 'root');
  assert.equal(crumbs[1].id, 'domain-citizen');
  assert.equal(crumbs[2].id, 'student-portal');
  assert.equal(crumbs[3].id, 'student-entity');
  assert.equal(crumbs[3].label, 'Aarav Ramanathan');
  assert.equal(crumbs[3].isCurrent, true);
});

test('resolveBreadcrumbs provides cryptographic ledger breadcrumbs', () => {
  const crumbs = resolveBreadcrumbs({
    screen: 'audit-ledger'
  });

  assert.equal(crumbs.length, 3);
  assert.equal(crumbs[0].id, 'root');
  assert.equal(crumbs[1].id, 'domain-crypto');
  assert.equal(crumbs[2].id, 'crypto-ledger');
  assert.equal(crumbs[2].isCurrent, true);
  assert.equal(crumbs[2].badge, 'Zero-Tamper');
});

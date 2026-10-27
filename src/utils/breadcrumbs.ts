/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScreenId } from '../components/Navbar.tsx';
import { UserRole, Institution } from '../types.ts';

export type BreadcrumbIconType =
  | 'home'
  | 'building'
  | 'shield'
  | 'user'
  | 'file-check'
  | 'gauge'
  | 'database'
  | 'upload'
  | 'file-text'
  | 'lock'
  | 'qr'
  | 'cases'
  | 'simulator';

export interface BreadcrumbItem {
  id: string;
  label: string;
  screen?: ScreenId;
  iconType?: BreadcrumbIconType;
  isCurrent?: boolean;
  subLabel?: string;
  badge?: string;
  badgeColor?: string;
  peerLinks?: Array<{ id: ScreenId; label: string }>;
}

export interface BreadcrumbContext {
  screen: ScreenId;
  userRole?: UserRole;
  institution?: Institution;
  studentName?: string;
  activeTabLabel?: string;
}

export function getScreenLabel(screen: ScreenId): string {
  switch (screen) {
    case 'landing':
      return 'Home';
    case 'login':
      return 'Portal Sign-In';
    case 'student-portal':
      return 'Student Portal';
    case 'institution-dashboard':
      return 'Institute Portal';
    case 'student-upload':
      return 'Quality Workbench';
    case 'validation-results':
      return 'Validation Engine';
    case 'intake-monitoring':
      return 'Intake & Simulator';
    case 'ghost-audit':
      return 'Ghost Student Audit';
    case 'aicte-central':
      return 'Regulator Command';
    case 'verification-audit':
      return 'Credential Verification';
    case 'reports':
      return 'Compliance Reports';
    case 'admin-security':
      return 'System Blueprint';
    case 'audit-ledger':
      return 'Cryptographic Ledger';
    default:
      return 'Previous Screen';
  }
}

/**
 * Deterministically constructs a hierarchical breadcrumb trail for any application route.
 * Follows Government of India / AICTE Information Architecture:
 * Level 1: National Registry Root / Home
 * Level 2: Functional Domain (Institutional Operations | Regulatory Oversight | Citizen Services | Verification & Trust)
 * Level 3: Active Workspace / Screen
 * Level 4: Contextual Entity or Active Sub-Scope (e.g. Institution Name, Candidate Name, or Sub-tab)
 */
export function resolveBreadcrumbs(ctx: BreadcrumbContext): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      id: 'root',
      label: 'National Registry',
      screen: 'landing',
      iconType: 'home'
    }
  ];

  if (ctx.screen === 'landing') {
    items[0].isCurrent = true;
    items[0].subLabel = 'Public Overview';
    return items;
  }

  if (ctx.screen === 'login') {
    items.push({
      id: 'auth',
      label: 'Identity & Access',
      iconType: 'lock'
    });
    items.push({
      id: 'login',
      label: 'Authorized Portal Sign-In',
      screen: 'login',
      isCurrent: true
    });
    return items;
  }

  // Domain 1: Institutional Operations
  if (
    ctx.screen === 'institution-dashboard' ||
    ctx.screen === 'student-upload' ||
    ctx.screen === 'reports'
  ) {
    items.push({
      id: 'domain-institution',
      label: 'Institutional Operations',
      iconType: 'building',
      screen: 'institution-dashboard',
      peerLinks: [
        { id: 'institution-dashboard', label: 'Institute Portal' },
        { id: 'student-upload', label: 'Quality Workbench' },
        { id: 'reports', label: 'Compliance Reports' }
      ]
    });

    if (ctx.screen === 'institution-dashboard') {
      items.push({
        id: 'inst-dash',
        label: 'Institute Dashboard',
        screen: 'institution-dashboard',
        iconType: 'building',
        isCurrent: !ctx.institution,
        subLabel: ctx.institution ? undefined : 'Headcount Oversight'
      });
      if (ctx.institution) {
        items.push({
          id: 'inst-entity',
          label: ctx.institution.name.split(',')[0],
          subLabel: ctx.institution.aicte_id,
          badge: `${ctx.institution.approved_intake} Sanctioned`,
          badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
          isCurrent: true
        });
      }
      return items;
    }

    if (ctx.screen === 'student-upload') {
      items.push({
        id: 'upload',
        label: 'Student Roster Workbench',
        screen: 'student-upload',
        iconType: 'upload',
        isCurrent: true,
        subLabel: ctx.institution ? ctx.institution.aicte_id : 'Pre-Commit Staging'
      });
      return items;
    }

    if (ctx.screen === 'reports') {
      items.push({
        id: 'reports',
        label: 'Statutory Compliance Reports',
        screen: 'reports',
        iconType: 'file-text',
        isCurrent: true,
        subLabel: 'AICTE Act 1987 Audit'
      });
      return items;
    }
  }

  // Domain 2: Regulatory Oversight
  if (
    ctx.screen === 'aicte-central' ||
    ctx.screen === 'intake-monitoring' ||
    ctx.screen === 'ghost-audit'
  ) {
    items.push({
      id: 'domain-regulatory',
      label: 'Regulatory Oversight',
      iconType: 'shield',
      screen: 'aicte-central',
      peerLinks: [
        { id: 'aicte-central', label: 'Central Command' },
        { id: 'intake-monitoring', label: 'Intake Quota & Simulator' },
        { id: 'validation-results', label: 'Validation Engine' }
      ]
    });

    if (ctx.screen === 'aicte-central') {
      items.push({
        id: 'central-cmd',
        label: 'AICTE Central Command',
        screen: 'aicte-central',
        iconType: 'shield',
        isCurrent: true,
        badge: 'Regulator HQ',
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      });
      return items;
    }

    if (ctx.screen === 'intake-monitoring') {
      items.push({
        id: 'intake-screen',
        label: 'Intake Capacity & What-If Modeler',
        screen: 'intake-monitoring',
        iconType: 'gauge',
        isCurrent: !ctx.activeTabLabel,
        subLabel: 'APH 2026-27 Rule 4.2'
      });
      if (ctx.activeTabLabel) {
        items.push({
          id: 'intake-tab',
          label: ctx.activeTabLabel,
          isCurrent: true
        });
      }
      return items;
    }

    if (ctx.screen === 'ghost-audit') {
      items.push({
        id: 'ghost-audit',
        label: 'Ghost Student & Dropout Risk Analytics',
        screen: 'ghost-audit',
        iconType: 'shield',
        isCurrent: true,
        badge: 'Risk Engine',
        badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
      });
      return items;
    }
  }

  // Domain 3: Verification & Deduplication Engine
  if (ctx.screen === 'validation-results') {
    items.push({
      id: 'domain-engine',
      label: 'Verification & Deduplication',
      iconType: 'file-check',
      screen: 'validation-results',
      peerLinks: [
        { id: 'validation-results', label: 'Validation Ledger' },
        { id: 'verification-audit', label: 'Credential Verification' },
        { id: 'audit-ledger', label: 'Blockchain Ledger' }
      ]
    });

    items.push({
      id: 'val-results',
      label: 'Validation Engine & Case Desk',
      screen: 'validation-results',
      iconType: 'file-check',
      isCurrent: !ctx.activeTabLabel,
      subLabel: '12-Digit Luhn Mod-10'
    });

    if (ctx.activeTabLabel) {
      items.push({
        id: 'case-tab',
        label: ctx.activeTabLabel,
        isCurrent: true
      });
    }

    return items;
  }

  // Domain 4: Citizen / Student Services
  if (ctx.screen === 'student-portal') {
    items.push({
      id: 'domain-citizen',
      label: 'Citizen Services',
      iconType: 'user',
      screen: 'student-portal'
    });

    items.push({
      id: 'student-portal',
      label: 'Student Credential Portal',
      screen: 'student-portal',
      iconType: 'user',
      isCurrent: !ctx.studentName,
      subLabel: 'DigiLocker & ABC'
    });

    if (ctx.studentName) {
      items.push({
        id: 'student-entity',
        label: ctx.studentName,
        badge: 'Data Owner',
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        isCurrent: true
      });
    }

    return items;
  }

  // Domain 5: Public Trust & Credential Verification
  if (ctx.screen === 'verification-audit') {
    items.push({
      id: 'domain-trust',
      label: 'Public Trust & Verification',
      iconType: 'qr',
      screen: 'verification-audit'
    });

    items.push({
      id: 'verify-audit',
      label: 'Credential Verification Desk',
      screen: 'verification-audit',
      iconType: 'qr',
      isCurrent: true,
      subLabel: 'Instant SMS Dispatch'
    });

    return items;
  }

  // Domain 6: Cryptographic Blockchain Ledger
  if (ctx.screen === 'audit-ledger') {
    items.push({
      id: 'domain-crypto',
      label: 'Immutable Audit Trail',
      iconType: 'database',
      screen: 'audit-ledger'
    });

    items.push({
      id: 'crypto-ledger',
      label: 'Blockchain Ledger (SHA-256)',
      screen: 'audit-ledger',
      iconType: 'database',
      isCurrent: true,
      badge: 'Zero-Tamper',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    });

    return items;
  }

  // Domain 7: System Architecture & Security
  if (ctx.screen === 'admin-security') {
    items.push({
      id: 'domain-system',
      label: 'Platform Architecture',
      iconType: 'lock',
      screen: 'admin-security'
    });

    items.push({
      id: 'sys-blueprint',
      label: 'System Blueprint & RBAC Security',
      screen: 'admin-security',
      iconType: 'lock',
      isCurrent: true,
      subLabel: 'PostgreSQL & FastAPI Specs'
    });

    return items;
  }

  // Fallback
  items.push({
    id: ctx.screen,
    label: ctx.screen,
    screen: ctx.screen,
    isCurrent: true
  });

  return items;
}

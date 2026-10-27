/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  UploadCloud,
  FileCheck2,
  Gauge,
  Building,
  QrCode,
  FileSpreadsheet,
  ShieldCheck,
  LogIn,
  LogOut,
  UserCheck,
  Home,
  Shield,
  Building2,
  Database,
  UserX,
  Layers,
  Sliders
} from 'lucide-react';
import { UserSession } from '../services/apiService.ts';

export type ScreenId =
  | 'landing'
  | 'login'
  | 'student-portal'
  | 'institution-dashboard'
  | 'student-upload'
  | 'validation-results'
  | 'intake-monitoring'
  | 'ghost-audit'
  | 'aicte-central'
  | 'verification-audit'
  | 'reports'
  | 'admin-security'
  | 'audit-ledger';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  currentUser: UserSession | null;
  onLogout: () => void;
  stats: {
    duplicateCount: number;
    intakeBreached: boolean;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  currentUser,
  onLogout,
  stats
}) => {
  const isRegulator = currentUser?.role === 'aicte_regulator';
  const isStudent = currentUser?.role === 'student';
  const isInstitution = currentUser?.role === 'institution_admin';

  // Navigation Items
  const navItems: Array<{
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    highlight?: boolean;
    hideForRoles?: string[];
  }> = [
    {
      id: 'landing',
      label: 'Home',
      icon: Home
    },
    {
      id: 'student-portal',
      label: 'Citizen / Student Portal',
      icon: UserCheck,
      highlight: isStudent
    },
    {
      id: 'institution-dashboard',
      label: 'Institute Portal',
      icon: LayoutDashboard,
      hideForRoles: ['student']
    },
    {
      id: 'student-upload',
      label: 'Quality Workbench',
      icon: UploadCloud,
      hideForRoles: ['student', 'aicte_regulator']
    },
    {
      id: 'validation-results',
      label: 'Validation Engine & Cases',
      icon: FileCheck2,
      badge: stats.duplicateCount > 0 ? `${stats.duplicateCount} Duplicate` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200',
      hideForRoles: ['student']
    },
    {
      id: 'intake-monitoring',
      label: 'Intake & Simulator',
      icon: Gauge,
      badge: stats.intakeBreached ? 'Breach' : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200 font-bold',
      hideForRoles: ['student']
    },
    {
      id: 'aicte-central',
      label: 'Regulator Command',
      icon: Building,
      highlight: isRegulator,
      hideForRoles: ['student']
    },
    {
      id: 'verification-audit',
      label: 'Credential Verification',
      icon: QrCode
    },
    {
      id: 'audit-ledger',
      label: 'Cryptographic Ledger',
      icon: Database,
      badge: 'SHA-256',
      badgeColor: 'bg-slate-100 text-slate-700 border border-slate-200'
    },
    {
      id: 'reports',
      label: 'Compliance Reports',
      icon: FileSpreadsheet,
      hideForRoles: ['student']
    },
    {
      id: 'admin-security',
      label: 'System Blueprint',
      icon: ShieldCheck
    }
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!currentUser && (item.id === 'student-upload' || item.id === 'reports')) return false;
    if (item.hideForRoles && currentUser && item.hideForRoles.includes(currentUser.role)) {
      return false;
    }
    return true;
  });

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Brand Bar */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <div
            onClick={() => onSelectScreen('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  AICTE <span className="text-teal-400">APAAR</span> REGISTRY
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  MoE / NAD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                National Student Verification & Real-Time Sanctioned Intake Platform
              </p>
            </div>
          </div>

          {/* User Status & Navigation Actions */}
          <div className="flex items-center gap-3 text-xs">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="font-semibold text-slate-200 text-xs">{currentUser.name}</div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-1.5 justify-end">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isRegulator
                          ? 'bg-emerald-400'
                          : isStudent
                          ? 'bg-amber-400'
                          : 'bg-teal-400'
                      }`}
                    />
                    <span>
                      {isRegulator
                        ? 'AICTE Central Authority'
                        : isStudent
                        ? 'Student Citizen'
                        : 'MIT Chennai (AICTE-TN-042)'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition cursor-pointer text-xs"
                  title="Sign out of current session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectScreen('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs transition cursor-pointer text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screen Tabs Bar */}
      <div className="bg-white border-t border-slate-200 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 py-1 min-w-max">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer relative ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 border border-teal-300/80 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-teal-700' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

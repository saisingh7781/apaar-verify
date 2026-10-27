/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Building2, UserCheck, UploadCloud, QrCode, RotateCcw, Home, Sliders } from 'lucide-react';
import { UserSession } from '../services/apiService.ts';
import { UserRole } from '../types.ts';

interface DemoModeBarProps {
  currentUser: UserSession | null;
  onRoleSwitch: (role: UserRole, targetId?: string) => void;
  onSwitchToGuest?: () => void;
  onNavigateLanding: () => void;
  onSimulateUpload: () => void;
  onSimulateVerify: () => void;
  onResetData: () => void;
}

export const DemoModeBar: React.FC<DemoModeBarProps> = ({
  currentUser,
  onRoleSwitch,
  onSwitchToGuest,
  onNavigateLanding,
  onSimulateUpload,
  onSimulateVerify,
  onResetData
}) => {
  const getPersonaLabel = () => {
    if (!currentUser) return 'Public Guest';
    if (currentUser.role === 'aicte_regulator') return 'AICTE Central Regulator';
    if (currentUser.role === 'student') return `Student (${currentUser.name.split(' ')[0]})`;
    return 'College Admin (MIT Chennai)';
  };

  return (
    <header className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs">
      {/* Tricolor Government Strip */}
      <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Persona Status */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 tracking-wider uppercase font-mono">
            Demo Control Bar
          </span>
          <span className="text-slate-400 text-[11px]">
            Active Persona: <strong className="text-white font-medium">{getPersonaLabel()}</strong>
          </span>
        </div>

        {/* Center / Right: Quick Demo Actions & Role Switchers */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Public Guest Home */}
          <button
            onClick={() => {
              if (onSwitchToGuest) onSwitchToGuest();
              else onNavigateLanding();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              !currentUser
                ? 'bg-slate-700 text-white shadow-xs border border-slate-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Switch to Public Guest Mode"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Public Home</span>
          </button>

          {/* 3 One-Click Role Switchers */}
          <button
            onClick={() => onRoleSwitch('institution_admin', 'inst-1')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              currentUser?.role === 'institution_admin'
                ? 'bg-teal-700 text-white shadow-xs font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Switch to MIT Chennai Administrator Persona"
          >
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>College Admin</span>
          </button>

          <button
            onClick={() => onRoleSwitch('aicte_regulator')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              currentUser?.role === 'aicte_regulator'
                ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Switch to AICTE Central Regulator Persona"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Regulator</span>
          </button>

          <button
            onClick={() => onRoleSwitch('student', '123456789012')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              currentUser?.role === 'student'
                ? 'bg-amber-700 text-white shadow-xs font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Switch to Student Citizen Persona (Aarav Ramanathan)"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Student (Aarav)</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Quick Simulation Triggers */}
          <button
            onClick={onSimulateUpload}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition cursor-pointer"
            title="Simulate batch upload with conflict"
          >
            <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Test Upload</span>
          </button>

          <button
            onClick={onSimulateVerify}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition cursor-pointer"
            title="Simulate TCS degree verification and student SMS alert"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Verify</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetData}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Reset database to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  Building,
  AlertTriangle,
  Users,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  AlertOctagon,
  Eye,
  Send,
  Filter,
  Check
} from 'lucide-react';
import { Institution, Student, IntakeAnalysis } from '../../types.ts';
import { calculateIntakeAnalysis } from '../../utils/validation.ts';
import { apiService } from '../../services/apiService.ts';
import { ScreenId } from '../Navbar.tsx';

interface AicteCentralDashboardProps {
  institutions: Institution[];
  students: Student[];
  onNavigate: (screen: ScreenId) => void;
  onSelectInstitution: (id: string) => void;
}

export const AicteCentralDashboard: React.FC<AicteCentralDashboardProps> = ({
  institutions,
  students,
  onNavigate,
  onSelectInstitution
}) => {
  const [selectedState, setSelectedState] = useState<string>('All');
  const [noticeSent, setNoticeSent] = useState<Record<string, boolean>>({});

  const analyses: IntakeAnalysis[] = institutions.map((inst) =>
    calculateIntakeAnalysis(inst, students)
  );

  const totalSanctioned = institutions.reduce((acc, i) => acc + i.approved_intake, 0);
  const totalEnrolled = students.length;
  const totalDuplicates = students.filter((s) => s.validation_status === 'Duplicate').length;
  const totalBreaches = analyses.filter((a) => a.is_exceeded).length;

  const handleSendNotice = (instId: string) => {
    setNoticeSent((prev) => ({ ...prev, [instId]: true }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
              AICTE NATIONAL HQ • MINISTRY OF EDUCATION
            </span>
            <span className="text-xs text-slate-500">Regulator Central Command</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            AICTE Central Student Registry & Intake Compliance Grid
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Macro-level institutional oversight, duplicate enrollment detection, and national seat cap audits
          </p>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-medium">State Jurisdiction:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer focus:outline-hidden focus:border-teal-700"
          >
            <option value="All">All Regions (National)</option>
            <option value="Tamil Nadu">Southern Region (Tamil Nadu)</option>
            <option value="Karnataka">South Western (Karnataka)</option>
            <option value="Maharashtra">Western Region (Maharashtra)</option>
          </select>
        </div>
      </div>

      {/* 4 National Macro Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Affiliated Colleges</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{institutions.length}</span>
            <span className="text-xs text-slate-500 font-medium">Institutes Active</span>
          </div>
          <div className="text-[11px] text-slate-500">
            <span>Approved Quota: {totalSanctioned} seats</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total APAAR Ingested</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{totalEnrolled}</span>
            <span className="text-xs text-slate-500 font-medium">Students</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            <span>Overall Capacity: {Math.round((totalEnrolled / totalSanctioned) * 100)}%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Capacity Breaches</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${totalBreaches > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {totalBreaches}
            </span>
            <span className="text-xs text-slate-500 font-medium">Colleges Exceeded</span>
          </div>
          <div className="text-[11px] text-rose-700 font-medium">
            <span>{totalBreaches > 0 ? 'Statutory notice issued' : 'All within cap'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">National Duplicates</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${totalDuplicates > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
              {totalDuplicates}
            </span>
            <span className="text-xs text-slate-500 font-medium">Concurrent Records</span>
          </div>
          <div className="text-[11px] text-amber-800">
            <span>Flagged by cross-college APAAR matching</span>
          </div>
        </div>
      </div>

      {/* National Excess-Intake Alert Feed */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              National Excess-Intake & Duplicate Incident Feed
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated alerts generated by backend validation workers
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            AICTE Rules Enforced: APH 2026-27
          </span>
        </div>

        <div className="space-y-3">
          {/* Incident 1: PSG College Over-intake */}
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase">
                  Capacity Breach (105.6%)
                </span>
                <strong className="text-slate-900 text-xs">PSG College of Technology, Coimbatore</strong>
                <span className="text-[11px] text-slate-500 font-mono">(AICTE-TN-015)</span>
              </div>
              <p className="text-xs text-rose-900">
                Uploaded 95 students against sanctioned capacity of 90 (Excess of +5 admissions in Mechanical & Robotics branches).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onSelectInstitution('inst-3');
                  onNavigate('intake-monitoring');
                }}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 transition cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Intake</span>
              </button>
              <button
                onClick={() => handleSendNotice('inst-3')}
                disabled={noticeSent['inst-3']}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  noticeSent['inst-3']
                    ? 'bg-slate-200 text-slate-600 cursor-not-allowed'
                    : 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{noticeSent['inst-3'] ? 'Notice Dispatched' : 'Issue Inquiry Notice'}</span>
              </button>
            </div>
          </div>

          {/* Incident 2: Dual Enrollment Conflict */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white uppercase">
                  Cross-University Duplicate
                </span>
                <strong className="text-slate-900 text-xs">Siddharth Natarajan</strong>
                <span className="text-[11px] text-amber-900 font-mono">APAAR: 5482-9103-7462</span>
              </div>
              <p className="text-xs text-amber-900">
                Simultaneously enrolled at <strong>Madras Institute of Technology</strong> (IT) AND <strong>College of Engineering Guindy</strong> (CSE).
              </p>
            </div>
            <button
              onClick={() => onNavigate('validation-results')}
              className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>Resolve in Case Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Macro Compliance Grid */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900">National Affiliation Compliance Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time synchronization across all approved engineering & technical institutions
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">AICTE ID</th>
                <th className="py-2.5 px-3">Institution Name</th>
                <th className="py-2.5 px-3">Approved Intake</th>
                <th className="py-2.5 px-3">APAAR Headcount</th>
                <th className="py-2.5 px-3">Utilization</th>
                <th className="py-2.5 px-3">Compliance Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {analyses.map((analysis) => {
                const instStudents = students.filter((s) => s.institution_id === analysis.institution_id);
                const dupCount = instStudents.filter((s) => s.validation_status === 'Duplicate').length;
                const warnCount = instStudents.filter(
                  (s) => s.validation_status === 'Warning' || s.validation_status === 'Needs Review'
                ).length;
                const isOver = analysis.is_exceeded;

                return (
                  <tr key={analysis.institution_id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-600">
                      {analysis.aicte_id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {analysis.institution_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {analysis.approved_intake} seats
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {analysis.enrolled_count}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={isOver ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                        {analysis.utilization_percentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {isOver && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                            +{analysis.excess_count} Excess
                          </span>
                        )}
                        {dupCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            {dupCount} Dup
                          </span>
                        )}
                        {!isOver && dupCount === 0 && warnCount === 0 && (
                          <span className="text-emerald-700 flex items-center gap-1 text-[11px] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Clean
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectInstitution(analysis.institution_id);
                          onNavigate('institution-dashboard');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 transition cursor-pointer text-xs"
                      >
                        Inspect Portal
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ABC Transfer Requests Queue */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                ABC Central Regulator Queue
              </span>
              <span className="text-xs text-slate-500">Statutory Inter-University Transfer Approvals</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 mt-1">
              Incoming Academic Bank of Credits (ABC) Transfer Applications
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, validate prerequisite degree compatibility, and approve cross-university credit syncs
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            NCrF Compliant
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">Student & APAAR</th>
                <th className="py-2.5 px-3">Source University</th>
                <th className="py-2.5 px-3">Target University</th>
                <th className="py-2.5 px-3">Credits</th>
                <th className="py-2.5 px-3">Courses</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Regulator Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {apiService.getTransferRequests().map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">#{req.id}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900 block">{req.student_name}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{req.apaar_id}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-[140px] truncate" title={req.source_institution_name}>
                    {req.source_institution_name.split(',')[0]}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-[140px] truncate" title={req.target_institution_name}>
                    {req.target_institution_name.split(',')[0]}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{req.total_credits} cr</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{req.course_codes.join(', ')}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'Approved & Synced'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'Pending Central Approval'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {req.status === 'Pending Central Approval' ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            apiService.approveTransferRequest(req.id);
                            setNoticeSent((prev) => ({ ...prev, [req.id]: true }));
                          }}
                          className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-xs font-semibold transition cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            apiService.rejectTransferRequest(req.id, 'Prerequisite syllabus mapping deficit');
                            setNoticeSent((prev) => ({ ...prev, [req.id]: true }));
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition cursor-pointer"
                        >
                          Flag
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

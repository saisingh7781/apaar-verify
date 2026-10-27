/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  AlertTriangle,
  FileCheck,
  Building,
  UploadCloud,
  CheckCircle2,
  Gauge,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { Institution, Student, IntakeAnalysis, CreditTransferRequest } from '../../types.ts';
import { apiService } from '../../services/apiService.ts';
import { ScreenId } from '../Navbar.tsx';

interface InstitutionDashboardProps {
  institution: Institution;
  students: Student[];
  intakeAnalysis: IntakeAnalysis;
  onNavigate: (screen: ScreenId) => void;
  institutions: Institution[];
  onSelectInstitution: (id: string) => void;
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({
  institution,
  students,
  intakeAnalysis,
  onNavigate,
  institutions,
  onSelectInstitution
}) => {
  const institutionStudents = students.filter((s) => s.institution_id === institution.id);
  const validCount = institutionStudents.filter((s) => s.validation_status === 'Valid').length;
  const duplicateCount = institutionStudents.filter((s) => s.validation_status === 'Duplicate').length;
  const warningCount = institutionStudents.filter(
    (s) => s.validation_status === 'Warning' || s.validation_status === 'Needs Review'
  ).length;

  const isBreached = intakeAnalysis.is_exceeded;
  const utilization = intakeAnalysis.utilization_percentage;

  return (
    <div className="space-y-5">
      {/* Institution Switcher & Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              {institution.aicte_id}
            </span>
            <span className="text-xs text-slate-500">{institution.state} State Jurisdiction</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">
            {institution.name}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Institutional APAAR Registry & AICTE Sanctioned Quota Oversight
          </p>
        </div>

        {/* College Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500 font-medium hidden sm:inline">Active College:</label>
          <select
            value={institution.id}
            onChange={(e) => onSelectInstitution(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-hidden focus:border-teal-700 cursor-pointer"
          >
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name.split(',')[0]} ({inst.aicte_id})
              </option>
            ))}
          </select>
          <button
            onClick={() => onNavigate('student-upload')}
            className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New Batch</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banners */}
      {isBreached && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-wrap sm:flex-nowrap items-start justify-between gap-4 text-rose-900">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-rose-900 flex items-center gap-2">
                Sanctioned Intake Capacity Exceeded
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-600 text-white font-bold">
                  +{intakeAnalysis.excess_count} Excess Students
                </span>
              </h4>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                Your institution has enrolled {intakeAnalysis.enrolled_count} students against a sanctioned batch capacity of {institution.approved_intake} ({utilization}%).
                Unsanctioned excess admissions violate AICTE Approval Process Handbook (APH) regulations.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('intake-monitoring')}
            className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-medium rounded-lg shrink-0 transition cursor-pointer"
          >
            Inspect Intake Breakdown
          </button>
        </div>
      )}

      {duplicateCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap sm:flex-nowrap items-start justify-between gap-4 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                Duplicate APAAR ID Alert ({duplicateCount} conflict{duplicateCount > 1 ? 's' : ''})
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                National deduplication engine identified students registered concurrently in other AICTE colleges or programs.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('validation-results')}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium rounded-lg shrink-0 transition cursor-pointer"
          >
            Resolve in Case Desk
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enrolled */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Enrolled</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{institutionStudents.length}</span>
            <span className="text-xs text-slate-500 font-medium">Students</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{validCount} verified with National APAAR</span>
          </div>
        </div>

        {/* Card 2: Sanctioned Capacity */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Approved Intake</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{institution.approved_intake}</span>
            <span className="text-xs text-slate-500 font-medium">Sanctioned Seats</span>
          </div>
          <div className="text-[11px] text-slate-500">
            <span>Per AICTE Approval Order 2026-27</span>
          </div>
        </div>

        {/* Card 3: Utilization Gauge */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Capacity Utilization</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isBreached ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${isBreached ? 'text-rose-700' : 'text-slate-900'}`}>
              {utilization}%
            </span>
            <span className="text-xs text-slate-500 font-medium">of Quota</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 ${
                isBreached ? 'bg-rose-600' : utilization > 85 ? 'bg-amber-500' : 'bg-teal-700'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Anomalies & Errors */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Flags</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                duplicateCount + warningCount > 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-50 text-slate-400 border border-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                duplicateCount + warningCount > 0 ? 'text-amber-800' : 'text-slate-900'
              }`}
            >
              {duplicateCount + warningCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Issues</span>
          </div>
          <div className="text-[11px] text-slate-500">
            <span>{duplicateCount} duplicates • {warningCount} format errors</span>
          </div>
        </div>
      </div>

      {/* Program Breakdown & Action Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Program Enrollment Distribution */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Program-Level Headcount Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregated headcount across active AICTE disciplines</p>
            </div>
            <button
              onClick={() => onNavigate('intake-monitoring')}
              className="text-xs text-teal-800 hover:text-teal-900 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Detailed Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(intakeAnalysis.program_breakdown).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No students registered yet.</p>
            ) : (
              Object.entries(intakeAnalysis.program_breakdown).map(([prog, count]) => {
                const progShare = Math.round((count / institutionStudents.length) * 100) || 0;
                return (
                  <div key={prog} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-800">{prog}</span>
                      <span className="text-slate-500 font-mono">
                        {count} students <span className="text-slate-400">({progShare}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-teal-700 h-full rounded-full" style={{ width: `${progShare}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Compliance Health */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Administrative Shortcuts</h3>
            <p className="text-xs text-slate-500 mb-3">Core workflows for institutional nodal officers</p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('student-upload')}
                className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-800 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Quality Workbench (Upload)</div>
                    <div className="text-[10px] text-slate-500">Ingest CSV with inline error fixing</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() => onNavigate('validation-results')}
                className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-800 flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Validation & Duplicate Ledger</div>
                    <div className="text-[10px] text-slate-500">Review flagged APAAR records</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Export Compliance Reports</div>
                    <div className="text-[10px] text-slate-500">Download AICTE intake certificate</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center justify-between font-semibold text-slate-700 mb-0.5">
              <span>National Academic Depository Link</span>
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active
              </span>
            </div>
            <span>Records sync automatically with DigiLocker student credit repositories.</span>
          </div>
        </div>
      </div>

      {/* Academic Bank of Credits (ABC) Transfer Desk */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                ABC Protocol Active
              </span>
              <span className="text-xs text-slate-500">Inter-University Credit Transfer Gateway</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 mt-1">
              Academic Bank of Credits (ABC) Institutional Mobility Desk
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Course credits transferring into and out of {institution.name.split(',')[0]} under NEP 2020
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Institution AICTE Code: <strong className="text-slate-900 font-mono">{institution.aicte_id}</strong>
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Transfer ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">APAAR ID</th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Counterpart Institution</th>
                <th className="py-2.5 px-3">Credits</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Cryptographic Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {apiService.getTransferRequests().map((req: CreditTransferRequest) => {
                const isOut = req.source_institution_id === institution.id;
                const counterpart = isOut ? req.target_institution_name : req.source_institution_name;
                return (
                  <tr key={req.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">#{req.id}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{req.student_name}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{req.apaar_id}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isOut
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isOut ? 'Outgoing Transfer' : 'Incoming Transfer'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 max-w-xs truncate" title={counterpart}>
                      {counterpart.split(',')[0]}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{req.total_credits} cr</td>
                    <td className="py-2 px-3">
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
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={req.audit_hash}>
                      {req.audit_hash.slice(0, 16)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

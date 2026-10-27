/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Building,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Info,
  UserX,
  Activity,
  Send,
  AlertOctagon,
  FileCheck2,
  Clock,
  Check,
  Sliders,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Institution, Student, IntakeAnalysis, GhostStudentMetric, GhostRiskLevel } from '../../types.ts';
import { calculateIntakeAnalysis } from '../../utils/validation.ts';
import { apiService } from '../../services/apiService.ts';

interface IntakeMonitoringScreenProps {
  institutions: Institution[];
  students: Student[];
  selectedInstitutionId: string;
  onSelectInstitution: (id: string) => void;
  initialTab?: 'headcount' | 'simulator' | 'ghost-audit';
}

export const IntakeMonitoringScreen: React.FC<IntakeMonitoringScreenProps> = ({
  institutions,
  students,
  selectedInstitutionId,
  onSelectInstitution,
  initialTab = 'headcount'
}) => {
  const [activeTab, setActiveTab] = useState<'headcount' | 'simulator' | 'ghost-audit'>(initialTab);
  const [ghostFilter, setGhostFilter] = useState<'All' | GhostRiskLevel>('All');
  const [noticeFeedback, setNoticeFeedback] = useState<string | null>(null);

  // What-If Simulator State (Feature C)
  const [simulatedAdditionalSeats, setSimulatedAdditionalSeats] = useState<number>(10);
  const [simulatedProgram, setSimulatedProgram] = useState<string>('All Disciplines (Batch Total)');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const currentInstitution =
    institutions.find((i) => i.id === selectedInstitutionId) || institutions[0];

  const currentAnalysis = calculateIntakeAnalysis(currentInstitution, students);

  // Calculate all analyses for comparative overview
  const allAnalyses = institutions.map((inst) =>
    calculateIntakeAnalysis(inst, students)
  );

  // Ghost student metrics
  const [ghostMetrics, setGhostMetrics] = useState<GhostStudentMetric[]>(
    apiService.getGhostStudentMetrics()
  );

  const handleIssueNotice = (metric: GhostStudentMetric) => {
    const reason = `Statutory Show-Cause Notice under AICTE APH 2026-27 Rule 8.4: Zero digital footprint (${metric.last_lms_login_days}d inactive) & attendance deficit (${metric.attendance_percentage}%) for candidate ${metric.student_name}.`;
    apiService.issueShowCauseNotice(metric.student_id, reason);
    setGhostMetrics(apiService.getGhostStudentMetrics());
    setNoticeFeedback(`Show-cause notice officially registered and dispatched to registrar of ${metric.institution_name}!`);
    setTimeout(() => setNoticeFeedback(null), 4000);
  };

  const filteredGhostMetrics = ghostMetrics.filter((m) => {
    if (ghostFilter === 'All') return true;
    return m.risk_level === ghostFilter;
  });

  const criticalGhostCount = ghostMetrics.filter((m) => m.risk_level === 'Critical / Ghost Admission').length;

  // Simulator Calculations
  const baselineEnrolled = currentAnalysis.enrolled_count;
  const approvedIntake = currentInstitution.approved_intake;
  const simulatedEnrolled = baselineEnrolled + simulatedAdditionalSeats;
  const simulatedUtilization = approvedIntake > 0
    ? Math.round((simulatedEnrolled / approvedIntake) * 1000) / 10
    : 0;
  const isSimulatedBreach = simulatedEnrolled > approvedIntake;
  const simulatedExcess = isSimulatedBreach ? simulatedEnrolled - approvedIntake : 0;
  const simulatedVacant = !isSimulatedBreach ? approvedIntake - simulatedEnrolled : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              AICTE SANCTIONED QUOTA OVERSIGHT
            </span>
            <span className="text-xs text-slate-500">Statutory Headcount & What-If Modeler</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Institutional Intake & Capacity Monitoring
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Audit actual admissions against AICTE sanctioned intake quotas, simulate what-if admission projections, and identify ghost student dropout risks
          </p>
        </div>

        {/* Institution Selector */}
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500 font-medium">Active College:</label>
          <select
            value={currentInstitution.id}
            onChange={(e) => onSelectInstitution(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-hidden focus:border-teal-700 cursor-pointer"
          >
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name.split(',')[0]} ({inst.aicte_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-View Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('headcount')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'headcount'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Sanctioned Quota & Headcount</span>
          {currentAnalysis.is_exceeded && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
              Breach (+{currentAnalysis.excess_count})
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>What-If Intake Simulator</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold border border-teal-200">
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ghost-audit')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer relative ${
            activeTab === 'ghost-audit'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserX className="w-3.5 h-3.5 text-rose-600" />
          <span>AI Ghost Student & Dropout Risk</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-50 text-rose-700 font-bold border border-rose-200">
            {criticalGhostCount} Critical
          </span>
        </button>
      </div>

      {/* VIEW 1: Sanctioned Quota & Headcount Monitor */}
      {activeTab === 'headcount' && (
        <div className="space-y-5">
          {/* Capacity Exceeded Warning Banner */}
          {currentAnalysis.is_exceeded && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                      Sanctioned Capacity Breach Detected
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-600 text-white font-bold">
                        +{currentAnalysis.excess_count} Excess Admissions
                      </span>
                    </h3>
                    <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                      <strong>{currentInstitution.name}</strong> has enrolled{' '}
                      <strong>{currentAnalysis.enrolled_count} students</strong> against an official sanctioned quota of{' '}
                      <strong>{currentInstitution.approved_intake} seats</strong>{' '}
                      ({currentAnalysis.utilization_percentage}% utilization). Non-compliant with AICTE Approval Process Handbook (APH) Rule 4.2.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Institution Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold font-mono text-teal-800 uppercase tracking-wider">
                  {currentInstitution.aicte_id} • {currentInstitution.state}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{currentInstitution.name}</h2>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Quota Utilization</span>
                <span
                  className={`text-2xl font-bold font-mono ${
                    currentAnalysis.is_exceeded
                      ? 'text-rose-700'
                      : currentAnalysis.utilization_percentage > 90
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {currentAnalysis.utilization_percentage}%
                </span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  Actual Headcount: <strong className="text-slate-900 font-mono">{currentAnalysis.enrolled_count}</strong> students
                </span>
                <span className="text-slate-600 font-medium">
                  Sanctioned Batch Limit: <strong className="text-slate-900 font-mono">{currentInstitution.approved_intake}</strong> seats
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    currentAnalysis.is_exceeded
                      ? 'bg-rose-600'
                      : currentAnalysis.utilization_percentage > 85
                      ? 'bg-amber-500'
                      : 'bg-teal-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      (currentAnalysis.enrolled_count / currentInstitution.approved_intake) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                <span>0 Seats</span>
                <span>Warning Threshold (85%)</span>
                <span>100% Sanctioned Cap ({currentInstitution.approved_intake})</span>
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Approved Intake</span>
                <span className="text-lg font-bold text-slate-900 font-mono">{currentInstitution.approved_intake}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Maximum statutory quota</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Verified Headcount</span>
                <span className="text-lg font-bold text-slate-900 font-mono">{currentAnalysis.enrolled_count}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Active verified students</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Seat Balance</span>
                <span
                  className={`text-lg font-bold font-mono ${
                    currentAnalysis.is_exceeded ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {currentAnalysis.is_exceeded
                    ? `-${currentAnalysis.excess_count} Excess`
                    : `${currentInstitution.approved_intake - currentAnalysis.enrolled_count} Vacant`}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {currentAnalysis.is_exceeded ? 'Unsanctioned excess' : 'Available sanctioned seats'}
                </span>
              </div>
            </div>
          </div>

          {/* Program Breakdown Cards */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Program-Wise Headcount Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of enrolled students across accredited degree programs
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(currentAnalysis.program_breakdown).map(([prog, count]) => {
                const pct = Math.round((count / currentAnalysis.enrolled_count) * 100) || 0;
                return (
                  <div key={prog} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-xs text-slate-800 line-clamp-1" title={prog}>
                        {prog}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                        {count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-700 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Share of Batch</span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparative Table across institutions */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Comparative Institutional Quota Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">Cross-college benchmark tracking sanctioned vs actual headcount</p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{allAnalyses.length} Institutions Tracked</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">AICTE ID</th>
                    <th className="py-2.5 px-3.5">Institution Name</th>
                    <th className="py-2.5 px-3.5">Approved Intake</th>
                    <th className="py-2.5 px-3.5">Enrolled</th>
                    <th className="py-2.5 px-3.5">Utilization</th>
                    <th className="py-2.5 px-3.5">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {allAnalyses.map((analysis) => {
                    const isOver = analysis.is_exceeded;
                    return (
                      <tr
                        key={analysis.institution_id}
                        onClick={() => onSelectInstitution(analysis.institution_id)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition ${
                          analysis.institution_id === currentInstitution.id ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3.5 font-mono font-medium text-slate-600">
                          {analysis.aicte_id}
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                          {analysis.institution_name}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-700">
                          {analysis.approved_intake} seats
                        </td>
                        <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                          {analysis.enrolled_count}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono">
                          <span className={isOver ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                            {analysis.utilization_percentage}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          {isOver ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              Breached (+{analysis.excess_count})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Compliant
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Feature C: What-If Intake Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-5">
          {/* Simulator Banner */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-800 text-white font-mono uppercase">
                Prototype What-If Projection Model
              </span>
              <span className="text-teal-900 font-semibold">Scenario Planning Workbench</span>
            </div>
            <p className="text-teal-900/90 leading-relaxed text-[11px]">
              This simulator models the regulatory impact of admitting additional students before official enrollment registration is submitted. Projections calculate real-time threshold breaches under AICTE Approval Process Handbook (APH) Rule 4.2.
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-700" />
              Configure Simulated Admission Intake
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Slider for Additional Students */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700">
                    Additional Hypothetical Admissions:
                  </label>
                  <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold font-mono text-sm">
                    +{simulatedAdditionalSeats} Students
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={simulatedAdditionalSeats}
                  onChange={(e) => setSimulatedAdditionalSeats(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>+0 (Baseline)</span>
                  <span>+30 Students</span>
                  <span>+60 Students</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">
                  Quick Scenario Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulatedAdditionalSeats(0)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                  >
                    Baseline (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedAdditionalSeats(5)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                  >
                    Small Buffer (+5)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedAdditionalSeats(15)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                  >
                    Branch Expansion (+15)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedAdditionalSeats(35)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                  >
                    Heavy Overflow (+35)
                  </button>
                </div>
              </div>
            </div>

            {/* Simulation Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Approved Statutory Cap</span>
                <span className="text-xl font-bold text-slate-900 font-mono">{approvedIntake}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Fixed statutory ceiling</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Current Baseline Headcount</span>
                <span className="text-xl font-bold text-slate-700 font-mono">{baselineEnrolled}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {currentAnalysis.utilization_percentage}% of quota
                </span>
              </div>

              <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-200">
                <span className="text-[11px] text-teal-800 block font-medium">Projected Enrollment</span>
                <span className="text-xl font-bold text-teal-900 font-mono">{simulatedEnrolled}</span>
                <span className="text-[10px] text-teal-700 block mt-0.5">
                  +{simulatedAdditionalSeats} simulated seats
                </span>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  isSimulatedBreach
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="text-[11px] block font-medium">
                  Projected Compliance Status
                </span>
                <span className="text-xl font-bold font-mono">
                  {isSimulatedBreach ? `+${simulatedExcess} Breach` : `${simulatedVacant} Vacant`}
                </span>
                <span className="text-[10px] block mt-0.5">
                  Projected: {simulatedUtilization}% utilization
                </span>
              </div>
            </div>

            {/* Projected Gauge Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">
                  Projected Intake: <strong className="text-slate-900 font-mono">{simulatedEnrolled}</strong> / {approvedIntake}
                </span>
                <span className="font-semibold text-slate-800">
                  Projected Utilization: {simulatedUtilization}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    isSimulatedBreach
                      ? 'bg-rose-600'
                      : simulatedUtilization > 85
                      ? 'bg-amber-500'
                      : 'bg-teal-600'
                  }`}
                  style={{ width: `${Math.min(simulatedUtilization, 100)}%` }}
                />
              </div>
            </div>

            {/* Projected Regulatory Finding */}
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                isSimulatedBreach
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {isSimulatedBreach ? (
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <strong className="block font-semibold">
                  {isSimulatedBreach
                    ? 'Regulatory Warning: Scenario Exceeds Sanctioned Capacity'
                    : 'Scenario Compliant with Sanctioned Quota'}
                </strong>
                <p className="text-[11px] leading-relaxed">
                  {isSimulatedBreach
                    ? `Admitting ${simulatedAdditionalSeats} additional students would result in ${simulatedEnrolled} total admissions, creating an illegal surplus of ${simulatedExcess} students over the approved ${approvedIntake} seats. This would trigger an immediate Show-Cause Notice under AICTE APH Section 4.2 and seat freeze for subsequent academic years.`
                    : `Admitting ${simulatedAdditionalSeats} additional students keeps the institution at ${simulatedEnrolled} admissions (${simulatedUtilization}% utilization), leaving ${simulatedVacant} seats safely within the approved cap.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: AI Ghost Student & Dropout Risk Analytics */}
      {activeTab === 'ghost-audit' && (
        <div className="space-y-5">
          {noticeFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{noticeFeedback}</span>
            </div>
          )}

          {/* Risk Level Filter Bar */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Risk Filter:</span>
              {(['All', 'Critical / Ghost Admission', 'Moderate', 'Low'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setGhostFilter(lvl)}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    ghostFilter === lvl
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <span className="text-slate-500 text-[11px]">
              Showing {filteredGhostMetrics.length} candidate records
            </span>
          </div>

          {/* Ghost Student Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-3.5">Risk Level</th>
                    <th className="py-3 px-3.5">Candidate Name</th>
                    <th className="py-3 px-3.5">APAAR ID</th>
                    <th className="py-3 px-3.5">Institution</th>
                    <th className="py-3 px-3.5">LMS Inactivity</th>
                    <th className="py-3 px-3.5">Attendance</th>
                    <th className="py-3 px-3.5">Fee Status</th>
                    <th className="py-3 px-3.5">Anomaly Reasons</th>
                    <th className="py-3 px-3.5 text-right">Regulatory Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredGhostMetrics.map((metric) => {
                    const isCritical = metric.risk_level === 'Critical / Ghost Admission';
                    const isMod = metric.risk_level === 'Moderate';

                    return (
                      <tr key={metric.student_id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCritical
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isMod
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isCritical && <UserX className="w-3 h-3 text-rose-600" />}
                            {metric.risk_level}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 font-semibold text-slate-900 whitespace-nowrap">
                          {metric.student_name}
                        </td>

                        <td className="py-3 px-3.5 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                          {metric.apaar_id}
                        </td>

                        <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-[140px] truncate" title={metric.institution_name}>
                          {metric.institution_name.split(',')[0]}
                        </td>

                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className={metric.last_lms_login_days > 45 ? 'text-rose-700 font-bold' : 'text-slate-700'}>
                            {metric.last_lms_login_days} days inactive
                          </span>
                        </td>

                        <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                          {metric.attendance_percentage}%
                        </td>

                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap text-[11px]">
                          {metric.fee_payment_status}
                        </td>

                        <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-[200px]" title={metric.anomaly_flags.join(', ')}>
                          <span className="line-clamp-2">{metric.anomaly_flags.join(', ')}</span>
                        </td>

                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          {metric.notice_issued ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-medium">
                              <Check className="w-3 h-3" /> Notice Dispatched
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleIssueNotice(metric)}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-[11px] border border-rose-200 transition cursor-pointer"
                            >
                              Issue Notice
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Send,
  HelpCircle,
  FileCheck2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DuplicateCase, CaseResolution, Student } from '../../types.ts';
import { apiService } from '../../services/apiService.ts';

interface CaseManagementViewProps {
  cases: DuplicateCase[];
  onCaseUpdated: () => void;
  onOpenProvenance?: (studentId: string) => void;
}

export const CaseManagementView: React.FC<CaseManagementViewProps> = ({
  cases,
  onCaseUpdated,
  onOpenProvenance
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const [resolutionAction, setResolutionAction] = useState<CaseResolution>(activeCase?.status || 'Open Conflict');
  const [notes, setNotes] = useState<string>(activeCase?.reviewer_notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!activeCase) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
        No active duplicate investigation cases currently queued.
      </div>
    );
  }

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    const c = cases.find((item) => item.id === id);
    if (c) {
      setResolutionAction(c.status);
      setNotes(c.reviewer_notes || '');
      setFeedback(null);
    }
  };

  const handleCommitResolution = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      apiService.updateDuplicateCase(activeCase.id, resolutionAction, notes, 'Central Regulatory Officer');
      setIsSubmitting(false);
      setFeedback(`Resolution saved: Case marked as "${resolutionAction}" with audit trail.`);
      onCaseUpdated();
      setTimeout(() => setFeedback(null), 3000);
    }, 300);
  };

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              FEATURE A: VERIFICATION CASE WORKBENCH
            </span>
            <span className="text-xs text-slate-500">Dual-Enrollment Investigation Desk</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Inter-Institutional Duplicate Case Management
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Side-by-side reconciliation of candidates registered concurrently across multiple AICTE institutions
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500 font-medium">Select Active Case:</label>
          <select
            value={activeCase.id}
            onChange={(e) => handleSelectCase(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-hidden focus:border-teal-700 cursor-pointer"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.candidate_name} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Case Inspector Layout: 2 Columns Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Side-by-side record comparison */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Metadata */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  Case ID: <span className="font-mono text-teal-800">{activeCase.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {activeCase.severity}
                  </span>
                </span>
                <p className="text-xs text-slate-600">
                  Target Candidate: <strong>{activeCase.candidate_name}</strong> (APAAR: {activeCase.apaar_id})
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Current Status: {activeCase.status}
              </span>
            </div>

            {/* Match Rationale Box */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <span className="font-semibold text-slate-700 block">Deduplication Detection Rationale:</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">{activeCase.rationale}</p>
            </div>

            {/* Field Matching Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-200/80 space-y-1">
                <span className="font-semibold text-emerald-800 block text-[11px]">
                  Matching Attributes (Exact Identity Hits):
                </span>
                <ul className="space-y-0.5 text-slate-700 text-[11px]">
                  {activeCase.matching_fields.map((field, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-200/80 space-y-1">
                <span className="font-semibold text-rose-800 block text-[11px]">
                  Conflicting Institutional Claims:
                </span>
                <ul className="space-y-0.5 text-slate-700 text-[11px]">
                  {activeCase.conflicting_fields.map((field, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCase.records.map((rec, i) => (
              <div
                key={rec.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Claimed Enrollment #{i + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {rec.institution_id === 'inst-1' ? 'MIT Chennai' : 'CEG Anna University'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Affiliated College</span>
                    <strong className="text-slate-900 block text-xs">
                      {rec.institution_id === 'inst-1'
                        ? 'Madras Institute of Technology, Chennai (AICTE-TN-042)'
                        : 'College of Engineering Guindy, Anna University (AICTE-TN-001)'}
                    </strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] block">College Roll No</span>
                      <span className="font-mono font-semibold text-slate-800">{rec.student_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Quota Category</span>
                      <span className="text-slate-700 font-medium">{rec.admission_category}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Program & Discipline</span>
                    <span className="text-slate-800 font-medium">{rec.program}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Admission Cycle</span>
                      <span className="text-slate-700">{rec.admission_year}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Ingestion Stamped</span>
                      <span className="text-slate-600 font-mono text-[10px]">{rec.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>
                </div>

                {onOpenProvenance && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onOpenProvenance(rec.id)}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-teal-800 text-xs font-medium border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Inspect Provenance Passport</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Reviewer Actions & Case History */}
        <div className="lg:col-span-4 space-y-4">
          {/* Reviewer Action Form */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-700" />
              Reviewer Decision Authority
            </h3>
            <p className="text-xs text-slate-500">
              Statutory action under AICTE Approval Process Handbook (APH)
            </p>

            <form onSubmit={handleCommitResolution} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Case Disposition *</label>
                <div className="space-y-1.5">
                  {(
                    [
                      'Open Conflict',
                      'Confirmed Duplicate',
                      'Dismissed / Distinct',
                      'Under College Inquiry'
                    ] as CaseResolution[]
                  ).map((action) => (
                    <label
                      key={action}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                        resolutionAction === action
                          ? 'bg-teal-50/70 border-teal-600 text-slate-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="caseResolution"
                        value={action}
                        checked={resolutionAction === action}
                        onChange={() => setResolutionAction(action)}
                        className="text-teal-700 focus:ring-teal-700"
                      />
                      <span>{action}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reviewer Operational Notes *</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record formal justification, correspondence dates, or legal directives..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-teal-700"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving Resolution...' : 'Commit Reviewer Decision'}</span>
              </button>
            </form>
          </div>

          {/* Case History Timeline */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-2">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Case Audit Trail History
            </h4>
            <div className="space-y-2 pt-1 border-t border-slate-100">
              {activeCase.history.map((hist, i) => (
                <div key={i} className="text-[11px] p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                  <div className="flex items-center justify-between font-medium text-slate-800">
                    <span>{hist.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{hist.timestamp}</span>
                  </div>
                  <div className="text-slate-500 text-[10px]">Actor: {hist.actor}</div>
                  {hist.notes && <p className="text-slate-600 text-[11px] mt-1">{hist.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

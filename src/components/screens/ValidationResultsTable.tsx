/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Download,
  AlertCircle,
  HelpCircle,
  Building,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Layers,
  Database,
  History,
  X,
  FileSpreadsheet,
  Clock,
  Sparkles
} from 'lucide-react';
import { Student, ValidationStatus, Institution, DuplicateCase, ExceptionItem } from '../../types.ts';
import { EditStudentModal } from '../EditStudentModal.tsx';
import { ProvenanceModal } from '../ProvenanceModal.tsx';
import { CaseManagementView } from './CaseManagementView.tsx';
import { ExceptionQueueView } from './ExceptionQueueView.tsx';
import { AuditTimelineView } from './AuditTimelineView.tsx';
import { isValidApaarId, analyzeApaarStructure } from '../../utils/validation.ts';
import { apiService } from '../../services/apiService.ts';

interface ValidationResultsTableProps {
  students: Student[];
  institutions: Institution[];
  onUpdateStudent: (studentId: string, updates: Partial<Student>) => void;
  onDeleteStudent: (studentId: string) => void;
  selectedInstitutionId?: string;
  onSelectInstitution?: (id: string) => void;
  initialTab?: 'ledger' | 'cases' | 'exceptions' | 'timeline';
}

export const ValidationResultsTable: React.FC<ValidationResultsTableProps> = ({
  students,
  institutions,
  onUpdateStudent,
  onDeleteStudent,
  selectedInstitutionId,
  onSelectInstitution,
  initialTab = 'ledger'
}) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'cases' | 'exceptions' | 'timeline'>(initialTab);
  const [statusFilter, setStatusFilter] = useState<'All' | ValidationStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Explainable Smart Verification Panel State
  const [selectedStudentForInspection, setSelectedStudentForInspection] = useState<Student | null>(
    students[0] || null
  );

  // Provenance Modal State (Feature D)
  const [provenanceTargetId, setProvenanceTargetId] = useState<string | null>(null);

  // Cases and Exceptions state
  const [cases, setCases] = useState<DuplicateCase[]>(apiService.getDuplicateCases());
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(apiService.getExceptionQueue());

  const refreshCasesAndExceptions = () => {
    setCases(apiService.getDuplicateCases());
    setExceptions(apiService.getExceptionQueue());
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedInstitutionId && selectedInstitutionId !== 'all' && s.institution_id !== selectedInstitutionId) {
      return false;
    }
    if (statusFilter !== 'All' && s.validation_status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.full_name.toLowerCase().includes(q) ||
        s.apaar_id.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.program.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countByStatus = {
    All: students.length,
    Valid: students.filter((s) => s.validation_status === 'Valid').length,
    Duplicate: students.filter((s) => s.validation_status === 'Duplicate').length,
    Warning: students.filter((s) => s.validation_status === 'Warning').length,
    'Needs Review': students.filter((s) => s.validation_status === 'Needs Review').length
  };

  const getInstitutionName = (id: string) => {
    return institutions.find((i) => i.id === id)?.name || 'Unknown College';
  };

  const activeProvenance = provenanceTargetId
    ? apiService.getStudentProvenance(provenanceTargetId)
    : null;

  // Selected Student Analysis for Smart Verification Panel
  const inspectionAnalysis = selectedStudentForInspection
    ? analyzeApaarStructure(selectedStudentForInspection.apaar_id)
    : null;

  const inspectionInst = selectedStudentForInspection
    ? institutions.find((i) => i.id === selectedStudentForInspection.institution_id)
    : null;

  const inspectionIntake = inspectionInst
    ? apiService.getIntakeCheck(inspectionInst.id)
    : null;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              NATIONAL DEDUPLICATION & VALIDATION ENGINE
            </span>
            <span className="text-xs text-slate-500">PostgreSQL Indexed Student Registry</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Student Validation & Verification Operations Workspace
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            12-digit Luhn verification, cross-institution duplicate matching, explainable verification diagnostics, and case adjudication
          </p>
        </div>

        {/* Institution Scope Filter */}
        {onSelectInstitution && (
          <div className="flex items-center gap-2 text-xs">
            <Building className="w-4 h-4 text-slate-400" />
            <select
              value={selectedInstitutionId || 'all'}
              onChange={(e) => onSelectInstitution(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer focus:outline-hidden focus:border-teal-700"
            >
              <option value="all">All Institutions ({institutions.length})</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name.split(',')[0]} ({inst.aicte_id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Workspace Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>All Records Ledger</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cases')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'cases'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Verification Cases</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {cases.length} Conflicts
          </span>
        </button>

        <button
          onClick={() => setActiveTab('exceptions')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'exceptions'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Exception Queue</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {exceptions.filter((e) => e.status !== 'Resolved').length} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Timeline</span>
        </button>
      </div>

      {/* TAB 1: ALL RECORDS LEDGER WITH EXPLAINABLE SMART VERIFICATION PANEL */}
      {activeTab === 'ledger' && (
        <div className="space-y-5">
          {/* Status Tabs and Search Controls */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Valid', 'Duplicate', 'Warning', 'Needs Review'] as const).map((status) => {
                const count = countByStatus[status];
                const isActive = statusFilter === status;
                const badgeColors = {
                  All: 'bg-slate-100 text-slate-700',
                  Valid: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                  Duplicate: 'bg-rose-50 text-rose-800 border border-rose-200',
                  Warning: 'bg-amber-50 text-amber-800 border border-amber-200',
                  'Needs Review': 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                };

                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span>{status}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : badgeColors[status]
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate, APAAR, roll..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-teal-700"
              />
            </div>
          </div>

          {/* Main Grid: Left 8 cols for table, Right 4 cols for Explainable Smart Verification Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Students Results Table */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">APAAR ID</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Roll No</th>
                      <th className="py-2.5 px-3">Program</th>
                      <th className="py-2.5 px-3">College</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                          No student records match active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => {
                        const isDup = student.validation_status === 'Duplicate';
                        const isWarn = student.validation_status === 'Warning';
                        const isReview = student.validation_status === 'Needs Review';
                        const isOk = student.validation_status === 'Valid';
                        const isSelected = selectedStudentForInspection?.id === student.id;
                        const formattedApaar = isValidApaarId(student.apaar_id).formatted || student.apaar_id;

                        return (
                          <tr
                            key={student.id}
                            onClick={() => setSelectedStudentForInspection(student)}
                            className={`transition cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50/70'
                                : isDup
                                ? 'bg-rose-50/30 hover:bg-rose-50/60'
                                : isWarn
                                ? 'bg-amber-50/30 hover:bg-amber-50/60'
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Status Tag */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isOk
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : isDup
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : isWarn
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                }`}
                              >
                                {isOk && <CheckCircle2 className="w-3 h-3" />}
                                {isDup && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                                {isWarn && <AlertCircle className="w-3 h-3 text-amber-600" />}
                                {isReview && <HelpCircle className="w-3 h-3 text-indigo-600" />}
                                {student.validation_status}
                              </span>
                            </td>

                            {/* APAAR ID */}
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                              {student.apaar_id ? (
                                <span>{formattedApaar}</span>
                              ) : (
                                <span className="text-rose-600 italic text-[11px]">Unregistered</span>
                              )}
                            </td>

                            {/* Name */}
                            <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                              {student.full_name}
                            </td>

                            {/* Roll */}
                            <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                              {student.student_id}
                            </td>

                            {/* Program */}
                            <td className="py-2.5 px-3 text-slate-600 max-w-[140px] truncate" title={student.program}>
                              {student.program}
                            </td>

                            {/* Institution */}
                            <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[120px] truncate" title={getInstitutionName(student.institution_id)}>
                              {getInstitutionName(student.institution_id).split(',')[0]}
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => setProvenanceTargetId(student.id)}
                                  className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-teal-800 border border-slate-200 transition cursor-pointer"
                                  title="Inspect Evidence Passport"
                                >
                                  <FileCheck2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStudent(student)}
                                  className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
                                  title="Edit student record"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Remove student ${student.full_name} from registry?`)) {
                                      onDeleteStudent(student.id);
                                    }
                                  }}
                                  className="p-1 rounded bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-700 border border-slate-200 transition cursor-pointer"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Explainable Smart Verification Panel */}
            <div className="lg:col-span-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-4">
              {selectedStudentForInspection ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                        EXPLAINABLE SMART VERIFICATION PANEL
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                        {selectedStudentForInspection.full_name}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedStudentForInspection.validation_status === 'Valid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedStudentForInspection.validation_status === 'Duplicate'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {selectedStudentForInspection.validation_status}
                    </span>
                  </div>

                  {/* 12-Digit Structural Breakdown */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      12-Digit APAAR Structural Anatomy:
                    </span>
                    {inspectionAnalysis && inspectionAnalysis.normalized ? (
                      <div className="space-y-1.5">
                        <div className="p-2 bg-white rounded border border-slate-200 font-mono text-xs flex justify-between">
                          <span className="text-teal-800 font-bold" title="State & Regional Routing (4 digits)">{inspectionAnalysis.routingBlock || '----'}</span>
                          <span className="text-slate-400">-</span>
                          <span className="text-slate-800 font-bold" title="Institution Series (4 digits)">{inspectionAnalysis.seriesBlock || '----'}</span>
                          <span className="text-slate-800 font-bold" title="Sequence (3 digits)">{inspectionAnalysis.sequenceBlock || '---'}</span>
                          <span className="text-amber-700 font-bold" title="Luhn Checksum Digit">{inspectionAnalysis.checksumDigit || '-'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                          <span>Routing Block: {inspectionAnalysis.routingBlock || 'N/A'}</span>
                          <span>Series Block: {inspectionAnalysis.seriesBlock || 'N/A'}</span>
                          <span>Seq: {inspectionAnalysis.sequenceBlock || 'N/A'}</span>
                          <span>Luhn Mod-10: {inspectionAnalysis.isChecksumValid ? 'Valid Checksum' : 'Checksum Warning'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-rose-600 text-[11px]">
                        Identifier format incomplete or truncated.
                      </p>
                    )}
                  </div>

                  {/* Diagnostic Explanation */}
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-slate-700 block text-[11px]">
                      Engine Diagnostic Findings:
                    </span>
                    <p className="text-slate-600 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                      {selectedStudentForInspection.validation_notes || 'Clean verified record.'}
                    </p>
                  </div>

                  {/* Institution Quota Status */}
                  {inspectionIntake && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">College Quota:</span>
                        <strong className="text-slate-800 font-mono">
                          {inspectionIntake.enrolled_count} / {inspectionIntake.approved_intake} seats
                        </strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Utilization:</span>
                        <span
                          className={`font-semibold font-mono ${
                            inspectionIntake.is_exceeded ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {inspectionIntake.utilization_percentage}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => setProvenanceTargetId(selectedStudentForInspection.id)}
                      className="w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Open Evidence Passport</span>
                    </button>
                    {selectedStudentForInspection.validation_status === 'Duplicate' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('cases')}
                        className="w-full py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium text-xs border border-rose-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Reconcile in Case Desk</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Select a student record to inspect diagnostic rules.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICATION CASE MANAGEMENT (FEATURE A) */}
      {activeTab === 'cases' && (
        <CaseManagementView
          cases={cases}
          onCaseUpdated={refreshCasesAndExceptions}
          onOpenProvenance={(id) => setProvenanceTargetId(id)}
        />
      )}

      {/* TAB 3: EXCEPTION REVIEW QUEUE (FEATURE E) */}
      {activeTab === 'exceptions' && (
        <ExceptionQueueView
          exceptions={exceptions}
          onExceptionUpdated={refreshCasesAndExceptions}
          onOpenCase={() => setActiveTab('cases')}
          onOpenProvenance={(id) => setProvenanceTargetId(id)}
        />
      )}

      {/* TAB 4: AUDIT TIMELINE (FEATURE F) */}
      {activeTab === 'timeline' && <AuditTimelineView institutions={institutions} />}

      {/* Row Edit Modal */}
      <EditStudentModal
        student={editingStudent}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={onUpdateStudent}
      />

      {/* Data Provenance & Evidence Passport Modal (Feature D) */}
      <ProvenanceModal
        record={activeProvenance}
        isOpen={!!provenanceTargetId}
        onClose={() => setProvenanceTargetId(null)}
      />
    </div>
  );
};

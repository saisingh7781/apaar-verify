/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  Edit2,
  Check,
  X,
  SlidersHorizontal,
  Table,
  Filter
} from 'lucide-react';
import { Institution, Student, AdmissionCategory } from '../../types.ts';
import { SAMPLE_BATCH_CSV } from '../../data/seedData.ts';
import { parseCSVToStudents, evaluateStudentRecord, isValidApaarId, normalizeApaarId } from '../../utils/validation.ts';
import { apiService } from '../../services/apiService.ts';
import { ScreenId } from '../Navbar.tsx';

interface StudentUploadPageProps {
  institution: Institution;
  institutions: Institution[];
  onSelectInstitution: (id: string) => void;
  onUploadSuccess: () => void;
  onNavigate: (screen: ScreenId) => void;
}

interface StagedRow {
  apaar_id: string;
  student_id: string;
  full_name: string;
  program: string;
  admission_year: number;
  admission_category: AdmissionCategory;
  computedStatus: 'Valid' | 'Warning' | 'Duplicate' | 'Needs Review';
  notes: string;
}

export const StudentUploadPage: React.FC<StudentUploadPageProps> = ({
  institution,
  institutions,
  onSelectInstitution,
  onUploadSuccess,
  onNavigate
}) => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [stagedRows, setStagedRows] = useState<StagedRow[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<StagedRow>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Clean' | 'Flagged'>('All');

  // Column Mapping state
  const [showColumnMapper, setShowColumnMapper] = useState(false);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({
    apaar_id: 'apaar_id',
    student_id: 'student_id',
    full_name: 'full_name',
    program: 'program',
    admission_year: 'admission_year',
    admission_category: 'admission_category'
  });

  const [uploadFeedback, setUploadFeedback] = useState<{
    success: boolean;
    total: number;
    valid: number;
    warnings: number;
    duplicates: number;
    committedCleanOnly?: boolean;
  } | null>(null);

  const processCsvText = (text: string, name = 'uploaded_batch.csv') => {
    setCsvContent(text);
    setFileName(name);
    setUploadFeedback(null);
    setEditingIndex(null);

    // Extract headers
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length > 0) {
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      setDetectedHeaders(headers);
    }

    const parsed = parseCSVToStudents(text);
    const existing = apiService.getStudents();
    const evaluated = parsed.records.map((rec) => {
      const evalRes = evaluateStudentRecord(rec, existing, parsed.records as any);
      return {
        ...rec,
        computedStatus: evalRes.status,
        notes: evalRes.notes
      };
    });
    setStagedRows(evaluated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCsvText(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCsvText(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSampleBatch = () => {
    processCsvText(SAMPLE_BATCH_CSV, 'aicte_mit_sample_admissions_2026.csv');
  };

  const handleDownloadTemplate = () => {
    const templateContent = `apaar_id,student_id,full_name,program,admission_year,admission_category\n123456789012,ROLL-001,Aarav Ramanathan,B.Tech Computer Science & Engineering,2026,Regular\n234567890123,ROLL-002,Kavya Sundaram,B.Tech Information Technology,2026,Regular\n345678901234,ROLL-003,Deepak Sharma,B.Tech Aeronautical Engineering,2026,NRI`;
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AICTE_APAAR_Batch_Upload_Template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Inline Row Editing in Quality Workbench
  const startEditingRow = (index: number) => {
    setEditingIndex(index);
    setEditFormData({ ...stagedRows[index] });
  };

  const cancelEditingRow = () => {
    setEditingIndex(null);
    setEditFormData({});
  };

  const saveEditingRow = (index: number) => {
    const updatedRows = [...stagedRows];
    const existing = apiService.getStudents();
    const updatedCandidate = { ...updatedRows[index], ...editFormData } as StagedRow;

    // Re-evaluate validation
    const evalRes = evaluateStudentRecord(updatedCandidate, existing, updatedRows);
    updatedCandidate.computedStatus = evalRes.status;
    updatedCandidate.notes = evalRes.notes;

    updatedRows[index] = updatedCandidate;
    setStagedRows(updatedRows);
    setEditingIndex(null);
    setEditFormData({});
  };

  // Download Error Report CSV
  const handleDownloadErrorReport = () => {
    const flaggedRows = stagedRows.filter((r) => r.computedStatus !== 'Valid');
    if (flaggedRows.length === 0) {
      alert('All staged records are clean. No error report needed!');
      return;
    }

    const header = 'Row Number,APAAR ID,Student ID,Student Name,Program,Status,Diagnostic Reason\n';
    const body = flaggedRows
      .map(
        (r, idx) =>
          `"${idx + 1}","${r.apaar_id}","${r.student_id}","${r.full_name}","${r.program}","${r.computedStatus}","${r.notes.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICTE_Import_Exceptions_Report_${fileName.replace(/\.csv$/, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Commit All or Clean Only
  const handleCommitUpload = (cleanOnly = false) => {
    if (stagedRows.length === 0) return;
    setIsProcessing(true);

    const rowsToCommit = cleanOnly
      ? stagedRows.filter((r) => r.computedStatus === 'Valid')
      : stagedRows;

    // Convert back to CSV representation
    const csvHeader = 'apaar_id,student_id,full_name,program,admission_year,admission_category\n';
    const csvRows = rowsToCommit
      .map(
        (r) =>
          `"${r.apaar_id}","${r.student_id}","${r.full_name}","${r.program}",${r.admission_year},"${r.admission_category}"`
      )
      .join('\n');

    setTimeout(() => {
      const result = apiService.uploadBatch(institution.id, csvHeader + csvRows);
      setIsProcessing(false);
      setUploadFeedback({
        success: true,
        total: result.total,
        valid: result.valid,
        warnings: result.warnings,
        duplicates: result.duplicates,
        committedCleanOnly: cleanOnly
      });
      onUploadSuccess();
    }, 400);
  };

  const validCount = stagedRows.filter((r) => r.computedStatus === 'Valid').length;
  const duplicateCount = stagedRows.filter((r) => r.computedStatus === 'Duplicate').length;
  const warningCount = stagedRows.filter((r) => r.computedStatus === 'Warning' || r.computedStatus === 'Needs Review').length;

  const filteredStagedRows = stagedRows.filter((r) => {
    if (statusFilter === 'Clean') return r.computedStatus === 'Valid';
    if (statusFilter === 'Flagged') return r.computedStatus !== 'Valid';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              FEATURE B: SMART IMPORT QUALITY WORKBENCH
            </span>
            <span className="text-xs text-slate-500">Schema Mapper & Pre-Commit Ingestion Staging</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Student Roster Ingestion & Data Quality Workbench
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Target College: <strong className="text-slate-800">{institution.name}</strong> ({institution.aicte_id})
          </p>
        </div>

        {/* Change Target College Dropdown & Template Button */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="text-slate-500 font-medium">Target College:</label>
          <select
            value={institution.id}
            onChange={(e) => onSelectInstitution(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer focus:outline-hidden focus:border-teal-700"
          >
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name.split(',')[0]} ({inst.aicte_id})
              </option>
            ))}
          </select>
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>CSV Template</span>
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
          isDragging
            ? 'border-teal-700 bg-teal-50/40'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3.5">
          <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Drag & Drop Student Admissions Roster (CSV / Excel)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports 12-digit national APAAR IDs, college roll numbers, degree branches, and reservation quotas
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <label className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs cursor-pointer shadow-xs transition flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse Local CSV</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-xs text-slate-400">or</span>
            <button
              type="button"
              onClick={handleLoadSampleBatch}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Load Sample Batch (Demo)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Sample roster contains 8 records demonstrating valid credentials, a cross-college duplicate, and a format warning.</span>
          </div>
        </div>
      </div>

      {/* Successful Upload Banner */}
      {uploadFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="text-slate-900 block font-semibold">
                Batch Roster Successfully Committed to Ingestion Ledger!
              </strong>
              <span>
                Ingested {uploadFeedback.total} records: {uploadFeedback.valid} verified clean, {uploadFeedback.duplicates} duplicate alerts, {uploadFeedback.warnings} warnings.
                {uploadFeedback.committedCleanOnly && ' (Committed verified clean records only)'}
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('validation-results')}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>Open Validation Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quality Workbench Pre-Commit Staging Table */}
      {stagedRows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-5">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-teal-700" />
                Pre-Ingestion Quality Workbench ({fileName})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect anomalies, correct typos inline, map schema columns, or download diagnostic error logs before committing to the registry
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowColumnMapper(!showColumnMapper)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-700" />
                <span>{showColumnMapper ? 'Hide Column Mapper' : 'Column Mapper'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadErrorReport}
                disabled={duplicateCount + warningCount === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
                  duplicateCount + warningCount > 0
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Error Report ({duplicateCount + warningCount})</span>
              </button>

              <button
                type="button"
                onClick={() => handleCommitUpload(true)}
                disabled={isProcessing || validCount === 0}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                title="Commit only the verified error-free records"
              >
                <span>Commit Clean Records Only ({validCount})</span>
              </button>

              <button
                type="button"
                onClick={() => handleCommitUpload(false)}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <span>Commit All ({stagedRows.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Column Mapper Dropdown Panel */}
          {showColumnMapper && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-teal-700" />
                  Interactive Schema Column Mapper
                </span>
                <span className="text-[11px] text-slate-500">
                  Headers detected from uploaded CSV: {detectedHeaders.join(', ') || 'Default schema'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {[
                  { key: 'apaar_id', label: 'APAAR ID (12-Digit)' },
                  { key: 'student_id', label: 'Roll Number' },
                  { key: 'full_name', label: 'Student Name' },
                  { key: 'program', label: 'Degree / Branch' },
                  { key: 'admission_year', label: 'Admission Year' },
                  { key: 'admission_category', label: 'Quota Category' }
                ].map((col) => (
                  <div key={col.key} className="space-y-1">
                    <label className="text-[11px] text-slate-600 block font-medium">{col.label}</label>
                    <select
                      value={columnMap[col.key] || col.key}
                      onChange={(e) => setColumnMap({ ...columnMap, [col.key]: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs focus:outline-hidden focus:border-teal-700"
                    >
                      {detectedHeaders.length > 0 ? (
                        detectedHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))
                      ) : (
                        <option value={col.key}>{col.key}</option>
                      )}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staging Metrics Badges & Row Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Show Rows:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium ${
                  statusFilter === 'All'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                All ({stagedRows.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Clean')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium ${
                  statusFilter === 'Clean'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                Clean ({validCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Flagged')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium ${
                  statusFilter === 'Flagged'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                Flagged Issues ({duplicateCount + warningCount})
              </button>
            </div>

            <span className="text-[11px] text-slate-500">
              Click the edit icon on any row to fix errors inline before database commit.
            </span>
          </div>

          {/* Pre-Ingestion Staging Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Validation Status</th>
                  <th className="py-2.5 px-3">APAAR ID</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Program</th>
                  <th className="py-2.5 px-3">Quota</th>
                  <th className="py-2.5 px-3">Diagnostic Rationale</th>
                  <th className="py-2.5 px-3 text-right">Inline Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredStagedRows.map((row, idx) => {
                  const isEditing = editingIndex === idx;
                  const isDup = row.computedStatus === 'Duplicate';
                  const isWarn = row.computedStatus === 'Warning' || row.computedStatus === 'Needs Review';
                  const isOk = row.computedStatus === 'Valid';

                  if (isEditing) {
                    return (
                      <tr key={idx} className="bg-amber-50/60">
                        <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Editing
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editFormData.apaar_id || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, apaar_id: e.target.value })}
                            placeholder="12-digit APAAR"
                            className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs w-36 focus:border-teal-700"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editFormData.full_name || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs w-36 focus:border-teal-700"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editFormData.student_id || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, student_id: e.target.value })}
                            className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs w-28 focus:border-teal-700"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editFormData.program || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, program: e.target.value })}
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs w-44 focus:border-teal-700"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={editFormData.admission_category || 'Regular'}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, admission_category: e.target.value as any })
                            }
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          >
                            <option value="Regular">Regular</option>
                            <option value="NRI">NRI</option>
                            <option value="Supernumerary">Supernumerary</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-500 italic">
                          Click save to re-run validation checks
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => saveEditingRow(idx)}
                              className="p-1 rounded bg-teal-700 text-white hover:bg-teal-800 transition cursor-pointer"
                              title="Save & Revalidate"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingRow}
                              className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={idx}
                      className={
                        isDup
                          ? 'bg-rose-50/50 hover:bg-rose-50/70'
                          : isWarn
                          ? 'bg-amber-50/40 hover:bg-amber-50/60'
                          : 'hover:bg-slate-50/80'
                      }
                    >
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOk
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isDup
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isOk && <CheckCircle2 className="w-3 h-3" />}
                          {isDup && <AlertTriangle className="w-3 h-3" />}
                          {isWarn && <AlertTriangle className="w-3 h-3" />}
                          {row.computedStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {row.apaar_id || <span className="text-rose-600 italic">Missing</span>}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {row.full_name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono whitespace-nowrap">
                        {row.student_id}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={row.program}>
                        {row.program}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{row.admission_category}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-xs truncate" title={row.notes}>
                        {row.notes}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => startEditingRow(idx)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                          title="Inline edit row"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { Institution, Student, ValidationStatus, AdmissionCategory } from '../../types.ts';

interface ReportsPageProps {
  institutions: Institution[];
  students: Student[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ institutions, students }) => {
  const [selectedInstId, setSelectedInstId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const filteredStudents = students.filter((s) => {
    if (selectedInstId !== 'all' && s.institution_id !== selectedInstId) return false;
    if (selectedStatus !== 'all' && s.validation_status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && s.admission_category !== selectedCategory) return false;
    if (selectedYear !== 'all' && s.admission_year.toString() !== selectedYear) return false;
    return true;
  });

  const getInstitution = (id: string) => institutions.find((i) => i.id === id);

  const handleExportCSV = () => {
    const headers = 'APAAR ID,Roll Number,Student Name,Program,Institution,AICTE ID,Admission Year,Category,Validation Status,Validation Notes\n';
    const rows = filteredStudents
      .map((s) => {
        const inst = getInstitution(s.institution_id);
        return `"${s.apaar_id}","${s.student_id}","${s.full_name}","${s.program}","${inst?.name || ''}","${inst?.aicte_id || ''}","${s.admission_year}","${s.admission_category}","${s.validation_status}","${s.validation_notes || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AICTE_APAAR_Compliance_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredStudents, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `AICTE_APAAR_Audit_Export_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              AICTE COMPLIANCE ENGINE
            </span>
            <span className="text-xs text-slate-500">Statistical Analysis & Regulatory Exports</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Institutional Compliance & APAAR Audit Reports
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Generate and export signed compliance summaries for academic council approvals and NAAC/NBA reviews
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Query Builder Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
          <Filter className="w-4 h-4 text-teal-700" />
          <span>Multi-Dimensional Audit Filter Builder</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Institution */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Institution</label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 cursor-pointer focus:outline-hidden focus:border-teal-700"
            >
              <option value="all">All Institutions</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name.split(',')[0]} ({i.aicte_id})
                </option>
              ))}
            </select>
          </div>

          {/* Validation Status */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Validation Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 cursor-pointer focus:outline-hidden focus:border-teal-700"
            >
              <option value="all">All Statuses</option>
              <option value="Valid">Valid</option>
              <option value="Duplicate">Duplicate Conflict</option>
              <option value="Warning">Warning (Format)</option>
              <option value="Needs Review">Needs Review</option>
            </select>
          </div>

          {/* Admission Category */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Quota Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 cursor-pointer focus:outline-hidden focus:border-teal-700"
            >
              <option value="all">All Quotas</option>
              <option value="Regular">Regular</option>
              <option value="NRI">NRI Quota</option>
              <option value="Supernumerary">Supernumerary</option>
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Admission Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 cursor-pointer focus:outline-hidden focus:border-teal-700"
            >
              <option value="all">All Years</option>
              <option value="2026">2026-27 (Current)</option>
              <option value="2025">2025-26</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px] font-medium">Filtered Records</span>
          <span className="text-lg font-bold text-slate-900 font-mono">{filteredStudents.length}</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px] font-medium">Valid APAAR Records</span>
          <span className="text-lg font-bold text-emerald-700 font-mono">
            {filteredStudents.filter((s) => s.validation_status === 'Valid').length}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px] font-medium">Duplicate Incidents</span>
          <span className="text-lg font-bold text-rose-700 font-mono">
            {filteredStudents.filter((s) => s.validation_status === 'Duplicate').length}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px] font-medium">Format Warnings</span>
          <span className="text-lg font-bold text-amber-700 font-mono">
            {filteredStudents.filter((s) => s.validation_status === 'Warning' || s.validation_status === 'Needs Review').length}
          </span>
        </div>
      </div>

      {/* Report Preview Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">APAAR ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">College Roll No</th>
                <th className="py-2.5 px-3">Program</th>
                <th className="py-2.5 px-3">Institution</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredStudents.slice(0, 15).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {s.apaar_id || 'Missing'}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{s.full_name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{s.student_id}</td>
                  <td className="py-2.5 px-3 text-slate-700">{s.program}</td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {getInstitution(s.institution_id)?.name.split(',')[0]}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{s.admission_category}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.validation_status === 'Valid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.validation_status === 'Duplicate'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {s.validation_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length > 15 && (
          <p className="text-xs text-slate-500 text-center py-2.5 bg-slate-50 border-t border-slate-100">
            Showing first 15 of {filteredStudents.length} records. Export full report via CSV button above.
          </p>
        )}
      </div>
    </div>
  );
};

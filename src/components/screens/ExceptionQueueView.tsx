/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Clock,
  ArrowRight,
  ShieldAlert,
  Building,
  UserCheck,
  Check
} from 'lucide-react';
import { ExceptionItem, ExceptionPriority, ExceptionType } from '../../types.ts';
import { apiService } from '../../services/apiService.ts';

interface ExceptionQueueViewProps {
  exceptions: ExceptionItem[];
  onExceptionUpdated: () => void;
  onOpenCase?: () => void;
  onOpenProvenance?: (studentId: string) => void;
}

export const ExceptionQueueView: React.FC<ExceptionQueueViewProps> = ({
  exceptions,
  onExceptionUpdated,
  onOpenCase,
  onOpenProvenance
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'All' | ExceptionPriority>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const filtered = exceptions.filter((item) => {
    if (priorityFilter !== 'All' && item.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.student_name.toLowerCase().includes(q) ||
        item.apaar_id.toLowerCase().includes(q) ||
        item.institution_name.toLowerCase().includes(q) ||
        item.issue_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (id: string, newStatus: 'Pending Review' | 'In Progress' | 'Resolved') => {
    apiService.updateExceptionStatus(id, newStatus);
    setActiveActionId(id);
    onExceptionUpdated();
    setTimeout(() => setActiveActionId(null), 1500);
  };

  const highCount = exceptions.filter((e) => e.priority === 'High' && e.status !== 'Resolved').length;
  const inProgressCount = exceptions.filter((e) => e.status === 'In Progress').length;
  const resolvedCount = exceptions.filter((e) => e.status === 'Resolved').length;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 font-mono">
              FEATURE E: EXCEPTION REVIEW QUEUE
            </span>
            <span className="text-xs text-slate-500">Deterministic Priority Dispatch</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Prioritized Operational Exception Queue
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Actionable worklist of student enrollment anomalies requiring institutional officer or regulatory intervention
          </p>
        </div>

        {/* 3 Metric Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-medium">
            <strong>{highCount}</strong> High Priority
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium">
            <strong>{inProgressCount}</strong> In Progress
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
            <strong>{resolvedCount}</strong> Resolved
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Priority Filter:</span>
          {(['All', 'High', 'Medium', 'Low'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                priorityFilter === p
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, college, issue..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-teal-700"
          />
        </div>
      </div>

      {/* Exception Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-3.5">Priority</th>
                <th className="py-3 px-3.5">Issue Category</th>
                <th className="py-3 px-3.5">Student / APAAR</th>
                <th className="py-3 px-3.5">Institution</th>
                <th className="py-3 px-3.5">Deterministic Reason</th>
                <th className="py-3 px-3.5">Age</th>
                <th className="py-3 px-3.5">Recommended Action</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No exception items match current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isHigh = item.priority === 'High';
                  const isMed = item.priority === 'Medium';
                  const isResolved = item.status === 'Resolved';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isResolved ? 'opacity-60 bg-slate-50/40' : ''
                      }`}
                    >
                      {/* Priority */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isHigh
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isMed
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isHigh && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                          {item.priority}
                        </span>
                      </td>

                      {/* Issue Category */}
                      <td className="py-3 px-3.5 font-medium text-slate-900 whitespace-nowrap">
                        {item.issue_type}
                      </td>

                      {/* Student & APAAR */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{item.student_name}</span>
                        <span className="font-mono text-slate-500 text-[10px] block">
                          {item.apaar_id || 'Missing ID'}
                        </span>
                      </td>

                      {/* Institution */}
                      <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-[150px] truncate" title={item.institution_name}>
                        {item.institution_name.split(',')[0]}
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-[200px]" title={item.priority_reason}>
                        <span className="line-clamp-2">{item.priority_reason}</span>
                      </td>

                      {/* Age */}
                      <td className="py-3 px-3.5 text-slate-500 text-[11px] whitespace-nowrap font-mono">
                        {item.age_days}d ago
                      </td>

                      {/* Recommended Action */}
                      <td className="py-3 px-3.5 text-slate-700 text-[11px] max-w-[180px]">
                        <span className="line-clamp-2 italic">{item.recommended_action}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'In Progress'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {item.issue_type === 'Cross-University Duplicate' && onOpenCase && (
                            <button
                              type="button"
                              onClick={onOpenCase}
                              className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-medium border border-teal-200 transition cursor-pointer"
                              title="Open in Case Management Desk"
                            >
                              Case Desk
                            </button>
                          )}

                          {onOpenProvenance && item.student_id && (
                            <button
                              type="button"
                              onClick={() => onOpenProvenance(item.student_id)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-200 transition cursor-pointer"
                              title="Inspect Data Provenance"
                            >
                              Audit Passport
                            </button>
                          )}

                          {item.status !== 'Resolved' ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'Resolved')}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium shadow-xs transition cursor-pointer"
                            >
                              Resolve
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'Pending Review')}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition cursor-pointer"
                            >
                              Reopen
                            </button>
                          )}
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
    </div>
  );
};

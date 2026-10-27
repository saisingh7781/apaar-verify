/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History,
  Download,
  Filter,
  Search,
  Calendar,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck,
  Building
} from 'lucide-react';
import { TimelineEvent, Institution } from '../../types.ts';
import { apiService } from '../../services/apiService.ts';

interface AuditTimelineViewProps {
  institutions: Institution[];
}

export const AuditTimelineView: React.FC<AuditTimelineViewProps> = ({ institutions }) => {
  const [events, setEvents] = useState<TimelineEvent[]>(apiService.getTimelineEvents());
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [institutionFilter, setInstitutionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = events.filter((evt) => {
    if (categoryFilter !== 'All' && evt.category !== categoryFilter) return false;
    if (institutionFilter !== 'All' && evt.institution_id !== institutionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        evt.summary.toLowerCase().includes(q) ||
        evt.details.toLowerCase().includes(q) ||
        evt.actor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = 'Timestamp,Category,Institution,Summary,Details,Actor,Storage Type\n';
    const rows = filtered
      .map(
        (e) =>
          `"${e.timestamp}","${e.category}","${e.institution_name || ''}","${e.summary}","${e.details.replace(/"/g, '""')}","${e.actor}","${e.storage_type}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AICTE_APAAR_Audit_Timeline_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `AICTE_APAAR_Audit_Timeline_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              FEATURE F: AUDIT TIMELINE
            </span>
            <span className="text-xs text-slate-500">Chronological Regulatory Log</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Institutional Ingestion & Operational Audit Timeline
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Traceable log of batch rosters, validation pipeline runs, case adjudication decisions, and statutory notices
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Timeline CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Export JSON Proof</span>
          </button>
        </div>
      </div>

      {/* Storage & Environment Notice Banner */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-3 text-slate-600">
        <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 font-semibold block">
            Client-Side Prototype Ledger & Persistence Context
          </strong>
          <span>
            Events displayed below are recorded in browser session storage and synced with in-memory application state for presentation and interactive testing. Production deployments connect directly to statutory state agency databases via TLS-encrypted REST endpoints.
          </span>
        </div>
      </div>

      {/* Filter and Query Controls */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-500 mb-1 font-medium">Event Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-teal-700 cursor-pointer"
          >
            <option value="All">All Categories ({events.length})</option>
            <option value="Batch Ingestion">Batch Ingestion</option>
            <option value="Validation Run">Validation Run</option>
            <option value="Reviewer Action">Reviewer Action</option>
            <option value="Statutory Notice">Statutory Notice</option>
            <option value="Security Consent">Security Consent</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-500 mb-1 font-medium">Institution Scope</label>
          <select
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-teal-700 cursor-pointer"
          >
            <option value="All">All Institutions</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name.split(',')[0]} ({inst.aicte_id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 mb-1 font-medium">Search Keyword</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search summary, actor, details..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-teal-700"
            />
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-700" />
            Chronological Audit Stream ({filtered.length} Recorded Events)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Order: Newest First</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No audit timeline events match active filter criteria.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filtered.map((item) => {
              const badgeColors: Record<string, string> = {
                'Batch Ingestion': 'bg-sky-50 text-sky-800 border-sky-200',
                'Validation Run': 'bg-teal-50 text-teal-800 border-teal-200',
                'Reviewer Action': 'bg-indigo-50 text-indigo-800 border-indigo-200',
                'Statutory Notice': 'bg-rose-50 text-rose-800 border-rose-200',
                'Security Consent': 'bg-amber-50 text-amber-800 border-amber-200'
              };

              return (
                <div key={item.id} className="relative group">
                  {/* Dot */}
                  <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-teal-700 group-hover:scale-125 transition" />

                  {/* Event Card */}
                  <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            badgeColors[item.category] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.category}
                        </span>
                        <strong className="text-slate-900 text-xs">{item.summary}</strong>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{item.details}</p>

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <span>Actor:</span>
                        <strong className="text-slate-700">{item.actor}</strong>
                      </div>
                      {item.institution_name && (
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{item.institution_name.split(',')[0]}</span>
                        </div>
                      )}
                      <span className="font-mono text-[10px] text-slate-400">
                        {item.storage_type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

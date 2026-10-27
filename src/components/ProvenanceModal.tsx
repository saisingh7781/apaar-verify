/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileCheck2,
  Database,
  History,
  Copy,
  Check,
  ExternalLink,
  Layers,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ProvenanceRecord } from '../types.ts';

interface ProvenanceModalProps {
  record: ProvenanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProvenanceModal: React.FC<ProvenanceModalProps> = ({
  record,
  isOpen,
  onClose
}) => {
  if (!isOpen || !record) return null;

  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(record.record_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="provenance-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl text-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="provenance-title" className="font-bold text-base text-slate-900">
                Data Provenance & Evidence Passport
              </h2>
              <p className="text-xs text-slate-500">
                Verified digital audit trail for APAAR {record.apaar_id || 'Identifier'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Candidate Card Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Student Full Name</span>
              <strong className="text-slate-900 text-sm block">{record.student_name}</strong>
              <span className="text-slate-600 text-[11px] block mt-0.5">Roll No: {record.student_id}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Affiliated Institution</span>
              <strong className="text-slate-900 text-sm block">{record.institution_name}</strong>
              <span className="text-slate-600 text-[11px] block mt-0.5">Batch: {record.batch_id}</span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Digest */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-700" />
                Immutable Record Digest (SHA-256)
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-lg border border-slate-800 break-all select-all">
              {record.record_hash}
            </div>
            <span className="text-[10px] text-slate-400 block">
              Cryptographically hashes: APAAR ID + Internal Roll Number + Legal Candidate Name.
            </span>
          </div>

          {/* Ingestion & Origin Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                Ingestion Source System
              </span>
              <span className="text-slate-800 font-semibold block">{record.source_system}</span>
              <span className="text-slate-500 text-[11px] block">Batch ID: {record.batch_id}</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                Ingested Timestamp
              </span>
              <span className="text-slate-800 font-semibold block">{record.ingested_at}</span>
              <span className="text-emerald-700 text-[11px] font-medium block">Local Regulatory Stamping: Active</span>
            </div>
          </div>

          {/* Rules Evaluated Checklist */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-teal-700" />
              Automated Validation Rule Suite
            </h3>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {record.rules_evaluated.map((rule) => (
                <div key={rule.rule_id} className="p-3 bg-white flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{rule.rule_id}</span>
                      <strong className="text-slate-800">{rule.rule_name}</strong>
                    </div>
                    <p className="text-slate-500 text-[11px]">{rule.details}</p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.passed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {rule.passed ? 'PASSED' : 'FLAGGED'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revision & Audit Timeline */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-teal-700" />
              Provenance Audit History
            </h3>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {record.revision_history.map((rev, i) => (
                <div key={i} className="p-2.5 bg-slate-50/50 flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span className="font-semibold text-slate-800">{rev.event}</span>
                    <span className="text-slate-400">by {rev.modified_by}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[10px]">{rev.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Compliant with Section 6 of Digital Personal Data Protection Act (DPDP), 2023.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

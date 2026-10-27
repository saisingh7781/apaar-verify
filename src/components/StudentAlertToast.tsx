/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Smartphone, Bell, X, ShieldAlert, CheckCircle2, Building, ExternalLink } from 'lucide-react';
import { VerificationResult } from '../services/apiService.ts';

interface StudentAlertToastProps {
  alert: VerificationResult | null;
  onClose: () => void;
  onNavigateToAudit?: () => void;
}

export const StudentAlertToast: React.FC<StudentAlertToastProps> = ({
  alert,
  onClose,
  onNavigateToAudit
}) => {
  if (!alert) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="alert-dialog-title"
      aria-modal="true"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-5 sm:bottom-5 z-50 max-w-md w-auto sm:w-full bg-white border border-slate-300 rounded-2xl shadow-xl text-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {/* Top Banner */}
      <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xs">
          <Smartphone className="w-4 h-4 text-teal-400" />
          <span id="alert-dialog-title">Live Security SMS Alert Dispatched</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3 text-xs">
        {/* Recipient Details */}
        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500 text-[10px] block">Student Recipient:</span>
            <span className="font-bold text-slate-900">{alert.student?.full_name || 'Candidate'}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[10px] block">Registered Mobile:</span>
            <span className="font-mono text-teal-800 font-bold">{alert.student?.contact_masked || '+91 98*** **412'}</span>
          </div>
        </div>

        {/* Realistic SMS Message Bubble */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
            <span className="font-semibold text-teal-800">CDAC SMS Gateway: VM-AICTE-GOV</span>
            <span>{alert.auditLog.access_timestamp.slice(11)}</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
            "{alert.smsMessage}"
          </p>
        </div>

        {/* Verification Metadata */}
        <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
          <div className="flex justify-between">
            <span className="text-slate-500">Querying Verifier:</span>
            <strong className="text-slate-800">{alert.auditLog.verifier_entity}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">APAAR ID Queried:</span>
            <strong className="text-teal-900 font-mono">{alert.auditLog.apaar_id}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">PostgreSQL Status:</span>
            <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Logged & Dispatched
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {onNavigateToAudit && (
            <button
              onClick={() => {
                onClose();
                onNavigateToAudit();
              }}
              className="flex-1 py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect Audit Ledger</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition border border-slate-300 cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

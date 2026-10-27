/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  QrCode,
  Search,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  History,
  Building,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Camera,
  Check,
  Copy
} from 'lucide-react';
import { Student, AccessAuditLog } from '../../types.ts';
import { apiService, VerificationResult } from '../../services/apiService.ts';
import { isValidApaarId } from '../../utils/validation.ts';

interface VerificationAuditScreenProps {
  students: Student[];
  auditLogs: AccessAuditLog[];
  onTriggerAlert: (result: VerificationResult) => void;
}

export const VerificationAuditScreen: React.FC<VerificationAuditScreenProps> = ({
  students,
  auditLogs,
  onTriggerAlert
}) => {
  const [apaarInput, setApaarInput] = useState('1234-5678-9012');
  const [verifierName, setVerifierName] = useState('Tata Consultancy Services (TCS) Campus Verification Desk');
  const [activeVerification, setActiveVerification] = useState<VerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);

  const handleVerify = (targetApaar?: string, customVerifier?: string) => {
    const idToVerify = targetApaar || apaarInput;
    const verifier = customVerifier || verifierName;

    const result = apiService.verifyCredential(
      idToVerify,
      verifier,
      '14.143.190.' + Math.floor(10 + Math.random() * 80)
    );

    setActiveVerification(result);
    onTriggerAlert(result);
  };

  const handleSimulateQrScan = (student: Student) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setApaarInput(student.apaar_id);
      handleVerify(student.apaar_id, `National Optical Scan (${student.full_name.split(' ')[0]})`);
    }, 350);
  };

  const handleCopySlip = () => {
    if (!activeVerification) return;
    const slipText = `AICTE APAAR DIGITAL VERIFICATION RECEIPT
Ref ID: ${activeVerification.auditLog.log_id}
Candidate: ${activeVerification.student?.full_name || 'N/A'}
APAAR: ${activeVerification.auditLog.apaar_id}
Verifier: ${activeVerification.auditLog.verifier_entity}
Timestamp: ${activeVerification.auditLog.access_timestamp}
SMS Notification: Dispatched to student mobile.`;
    navigator.clipboard.writeText(slipText);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              POST /api/v1/verify/credential
            </span>
            <span className="text-xs text-slate-500">Student-First Privacy & Real-Time Alert Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            APAAR Credential Verification & Access Audit Ledger
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Every verification lookup automatically stamps a permanent audit entry and delivers an instant SMS alert to the student
          </p>
        </div>

        <button
          onClick={() => handleVerify()}
          className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Simulate Live Verification & SMS</span>
        </button>
      </div>

      {/* Grid: Left Column Verification Console, Right Column QR & Credential Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Lookup & QR Console */}
        <div className="lg:col-span-7 space-y-5">
          {/* Lookup Input Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-3.5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-teal-700" />
              Direct National APAAR / ABC ID Query
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  National APAAR ID (12-Digit) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={apaarInput}
                    onChange={(e) => setApaarInput(e.target.value)}
                    placeholder="e.g. 1234-5678-9012"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-700"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-slate-400">
                    {isValidApaarId(apaarInput).valid ? '✓ Valid Format' : 'Must be 12 digits'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Querying Agency / Verifier Entity *
                </label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
                />
              </div>

              <button
                onClick={() => handleVerify()}
                className="w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Credential & Dispatch Student Alert</span>
              </button>
            </div>

            {/* Quick Demo Student Clickers */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Quick Presentation Samples:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setApaarInput('123456789012');
                    setVerifierName('Tata Consultancy Services (TCS) Campus Verification Desk');
                    handleVerify('123456789012', 'Tata Consultancy Services (TCS) Campus Verification Desk');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                >
                  Aarav Ramanathan (MIT)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApaarInput('548291037462');
                    setVerifierName('Anna University Registrar Office');
                    handleVerify('548291037462', 'Anna University Registrar Office');
                  }}
                  className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition cursor-pointer"
                >
                  Siddharth (Duplicate Alert)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApaarInput('234567890123');
                    setVerifierName('Amazon Web Services (AWS) India Talent Acquisition');
                    handleVerify('234567890123', 'Amazon Web Services (AWS) India Talent Acquisition');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                >
                  Kavya Sundaram (MIT)
                </button>
              </div>
            </div>
          </div>

          {/* QR Scanner Simulation Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-teal-700" />
                  Optical QR Code Scanner Interface
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate scanning student DigiLocker APAAR QR card
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Optical Scanner Ready
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-2.5">
              <div className="w-24 h-24 rounded-xl border border-slate-300 p-2 bg-white flex flex-col items-center justify-center shadow-xs">
                <QrCode className="w-16 h-16 text-slate-700" />
              </div>
              <p className="text-xs text-slate-600">
                Click any sample candidate below to simulate instant optical QR scan:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {students.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSimulateQrScan(s)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs transition cursor-pointer font-medium"
                  >
                    Scan {s.full_name.split(' ')[0]}'s QR
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Verified Credential Card & Alert Notice */}
        <div className="lg:col-span-5 space-y-5">
          {activeVerification && activeVerification.student ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">NATIONAL APAAR CREDENTIAL</h4>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">
                      AICTE • ABC • DigiLocker Verified
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeVerification.student.validation_status === 'Valid'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : activeVerification.student.validation_status === 'Duplicate'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {activeVerification.student.validation_status === 'Valid'
                    ? '✓ VERIFIED'
                    : activeVerification.student.validation_status}
                </span>
              </div>

              {/* Student Identity Details */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium">Candidate Name</span>
                  <span className="text-sm font-bold text-slate-900">{activeVerification.student.full_name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-medium">12-Digit APAAR ID</span>
                    <span className="font-mono text-teal-900 font-bold text-xs">
                      {isValidApaarId(activeVerification.student.apaar_id).formatted || activeVerification.student.apaar_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-medium">College Roll Number</span>
                    <span className="font-mono text-slate-800 font-semibold">{activeVerification.student.student_id}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block font-medium">Degree Program</span>
                  <span className="text-slate-800 font-medium">{activeVerification.student.program}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block font-medium">Affiliated Institution</span>
                  <span className="text-slate-700">{activeVerification.institution?.name}</span>
                </div>
              </div>

              {/* Copy Receipt Button */}
              <button
                type="button"
                onClick={handleCopySlip}
                className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSlip ? 'Copied Receipt' : 'Copy Verification Receipt'}</span>
              </button>

              {/* Alert Confirmation Box */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-700 font-semibold text-[11px]">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" /> Real-Time SMS Alert Dispatched
                  </span>
                  <span>Delivered</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Delivered to registered mobile: {activeVerification.student.contact_masked || '+91 98*** **412'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 mx-auto flex items-center justify-center text-slate-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Student Credential Verification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter any 12-digit APAAR ID or scan a student QR code to inspect credentials and view the real-time access alert dispatch.
              </p>
            </div>
          )}

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-teal-700" />
              Real-Time Student Notification Architecture
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              In accordance with AICTE Student Data Privacy Guidelines, students receive an instant SMS whenever their academic records are accessed. This guarantees transparent audit trails and empowers students against unauthorized credential scraping.
            </p>
          </div>
        </div>
      </div>

      {/* Live Access Audit Log Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-teal-700" />
              Live Access Audit Log Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable ledger logging every verifier query, client IP, timestamp, and SMS dispatch status
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Total Access Events: <strong className="text-slate-900">{auditLogs.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">APAAR ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Verifier Entity</th>
                <th className="py-2.5 px-3">Access Timestamp</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3 text-right">Student Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {auditLogs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">
                    {log.log_id.slice(0, 12)}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-900">
                    {log.apaar_id}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-800">
                    {log.student_name || 'Candidate'}
                  </td>
                  <td className="py-2 px-3 text-slate-700">
                    {log.verifier_entity}
                  </td>
                  <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                    {log.access_timestamp}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400">
                    {log.ip_address}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {log.alert_dispatched ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> SMS Dispatched
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

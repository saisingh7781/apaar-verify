/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Code2,
  Lock,
  Copy,
  Check,
  Download,
  Key,
  Terminal,
  FileCode,
  Shield
} from 'lucide-react';
import { SQL_SCHEMA_DDL, PYTHON_FASTAPI_CODE } from '../../data/seedData.ts';

export const AdminSecurityPage: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'sql' | 'fastapi' | 'python_seed'>('sql');
  const [copied, setCopied] = useState(false);
  const [sampleHashInput, setSampleHashInput] = useState('123456789012');
  const [hashOutput, setHashOutput] = useState('8f4a3e2b9c1d0e5f7a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const computeMockHash = (input: string) => {
    // Deterministic visual pseudo-hash for demonstration
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    const hex = (h >>> 0).toString(16).padStart(8, '0');
    return `sha256_${hex}${input.length * 37}a4f89d023c914b7e8012${hex}`;
  };

  const handleHashChange = (val: string) => {
    setSampleHashInput(val);
    setHashOutput(computeMockHash(val));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              System Architecture & RBAC Security Blueprint
            </span>
            <span className="text-xs text-slate-500">PostgreSQL Schema & FastAPI Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            System Architecture, PostgreSQL Schema & Security Specifications
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Relational DDL, Python FastAPI microservices, automated deduplication workers, and cryptographic integrity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            TLS 1.3 & JWT Encrypted
          </span>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4">
        <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-700" />
          Role-Based Access Control (RBAC) Enforcement Matrix
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">System Capability / Endpoint</th>
                <th className="py-2.5 px-3 font-semibold">Institution Admin</th>
                <th className="py-2.5 px-3 font-semibold">AICTE Regulator</th>
                <th className="py-2.5 px-3 font-semibold">External Verifier (TCS/Employer)</th>
                <th className="py-2.5 px-3 font-semibold">Student (Data Owner)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-medium text-slate-800">Upload Batch CSV / Excel (<code className="font-mono text-[11px] text-teal-800">/upload-batch</code>)</td>
                <td className="py-2.5 px-3 text-emerald-700 font-semibold">✓ Own Institute Only</td>
                <td className="py-2.5 px-3 text-slate-400">✗ Read-Only</td>
                <td className="py-2.5 px-3 text-slate-400">✗ Denied</td>
                <td className="py-2.5 px-3 text-slate-400">✗ Denied</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-medium text-slate-800">National Duplicate Resolution & Cross-College Flags</td>
                <td className="py-2.5 px-3 text-amber-700 font-medium">Partial (Self-Correction)</td>
                <td className="py-2.5 px-3 text-emerald-700 font-semibold">✓ Full National Authority</td>
                <td className="py-2.5 px-3 text-slate-400">✗ Denied</td>
                <td className="py-2.5 px-3 text-slate-400">✗ Denied</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-medium text-slate-800">Intake Cap Sanction Enforcement & Breach Notice</td>
                <td className="py-2.5 px-3 text-slate-500">View Alert Only</td>
                <td className="py-2.5 px-3 text-emerald-700 font-semibold">✓ Issue Statutory Notices</td>
                <td className="py-2.5 px-3 text-slate-400">✗ Denied</td>
                <td className="py-2.5 px-3 text-slate-400">✗ Denied</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-medium text-slate-800">APAAR Credential Verification (<code className="font-mono text-[11px] text-teal-800">/verify/credential</code>)</td>
                <td className="py-2.5 px-3 text-emerald-700">✓ Permitted</td>
                <td className="py-2.5 px-3 text-emerald-700">✓ Permitted</td>
                <td className="py-2.5 px-3 text-emerald-700 font-semibold">✓ Permitted (Logs Audit)</td>
                <td className="py-2.5 px-3 text-emerald-700">✓ View Own Credential</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-medium text-slate-800">Real-Time Access Notification Dispatch</td>
                <td className="py-2.5 px-3 text-slate-500">System Automatic</td>
                <td className="py-2.5 px-3 text-slate-500">System Automatic</td>
                <td className="py-2.5 px-3 text-teal-800 font-medium">Triggers Notification</td>
                <td className="py-2.5 px-3 text-emerald-700 font-semibold">✓ Receives SMS & Email Alert</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cryptographic SHA-256 Hash Verification Simulator */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-3">
        <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
          <Key className="w-4 h-4 text-teal-700" />
          Cryptographic APAAR Verification Hash & QR Digest
        </h3>
        <p className="text-xs text-slate-600">
          APAAR QR codes embed a cryptographically signed SHA-256 token ensuring tampering cannot alter student records offline
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Test 12-Digit APAAR ID Input</label>
            <input
              type="text"
              value={sampleHashInput}
              onChange={(e) => handleHashChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-700"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Generated SHA-256 Digital Signature</label>
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800 text-[11px] truncate">
              {hashOutput}
            </div>
          </div>
        </div>
      </div>

      {/* Relational Database DDL & FastAPI Code Inspector */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
        {/* Code Tabs Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('sql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeCodeTab === 'sql'
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL Schema DDL</span>
            </button>
            <button
              onClick={() => setActiveCodeTab('fastapi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeCodeTab === 'fastapi'
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Python FastAPI Blueprint</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeCodeTab === 'sql' ? SQL_SCHEMA_DDL : PYTHON_FASTAPI_CODE)}
              className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Content Box */}
        <div className="p-4 bg-slate-900 overflow-x-auto max-h-[460px] scrollbar-thin">
          <pre className="text-xs font-mono text-slate-200 leading-relaxed">
            {activeCodeTab === 'sql' ? SQL_SCHEMA_DDL : PYTHON_FASTAPI_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
};

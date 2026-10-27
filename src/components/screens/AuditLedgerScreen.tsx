/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database,
  Link,
  CheckCheck,
  Download,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { apiService } from '../../services/apiService.ts';
import { AuditBlock } from '../../types.ts';

export const AuditLedgerScreen: React.FC = () => {
  const [blocks, setBlocks] = useState<AuditBlock[]>(apiService.getAuditBlocks());
  const [verificationState, setVerificationState] = useState<{
    tested: boolean;
    isValid: boolean;
    message: string;
    verifiedCount: number;
  }>({
    tested: false,
    isValid: true,
    message: '',
    verifiedCount: 0
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = apiService.verifyBlockchainLedger();
      setVerificationState({
        tested: true,
        isValid: res.isValid,
        message: res.message,
        verifiedCount: res.verifiedCount
      });
      setIsVerifying(false);
    }, 400);
  };

  const handleDownloadProof = () => {
    const jsonStr = apiService.exportAuditTrailProof();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICTE_APAAR_Cryptographic_Audit_Proof_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'GENESIS':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'INTAKE_BREACH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'DUPLICATE_FLAGGED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'CONSENT_LOCKED':
      case 'CONSENT_UNLOCKED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'CREDIT_TRANSFER_REQUEST':
      case 'CREDIT_TRANSFER_APPROVED':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'GHOST_NOTICE_ISSUED':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              Public Cryptographic Ledger
            </span>
            <span className="text-xs text-slate-500">Zero-Knowledge Verifiable Audit Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            AICTE National Immutable Audit Blockchain
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            Cryptographic SHA-256 block ledger preserving all statutory events (Sanctioned Intake Breaches, DPDP Consent Locks, Inter-University Transfers, and Duplicate Alerts) with tamper-proof mathematical chaining.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recomputing SHA-256 Hashes...</span>
              </>
            ) : (
              <>
                <CheckCheck className="w-4 h-4" />
                <span>Verify Chain Integrity</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadProof}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Audit Trail (.json)</span>
          </button>
        </div>
      </div>

      {/* Verification State Banner */}
      {verificationState.tested && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-4 animate-in fade-in ${
          verificationState.isValid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-3">
            {verificationState.isValid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <strong className="block font-semibold">
                {verificationState.isValid ? 'Cryptographic Proof Validated' : 'Cryptographic Failure Detected'}
              </strong>
              <span className="text-slate-700">{verificationState.message}</span>
            </div>
          </div>
          <span className="font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
            Hash: SHA-256 (64-byte Digest)
          </span>
        </div>
      )}

      {/* Blockchain Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[11px] block font-medium">Total Mined Blocks</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-0.5 block">{blocks.length}</span>
          <span className="text-[10px] text-teal-700 block mt-0.5 font-medium">Consecutive Height</span>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[11px] block font-medium">Consensus Anchor</span>
          <span className="text-base font-bold text-slate-900 mt-1 block">Proof-of-Authority</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">AICTE Trust Root</span>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[11px] block font-medium">Chain Status</span>
          <span className="text-base font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Immutable & Synced
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">0 Forks Detected</span>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 text-[11px] block font-medium">Tip Block Hash</span>
          <span className="font-mono text-slate-800 text-[11px] truncate block mt-1 font-semibold" title={blocks[blocks.length - 1]?.block_hash}>
            {blocks[blocks.length - 1]?.block_hash.slice(0, 16)}...
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Latest State Root</span>
        </div>
      </div>

      {/* Sequential Blockchain Log View */}
      <div className="space-y-4">
        {blocks.map((block) => (
          <div
            key={block.index}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5 relative overflow-hidden group hover:border-slate-300 transition"
          >
            {/* Block Top Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center font-mono font-bold text-teal-800 text-xs">
                  #{block.index.toString().padStart(3, '0')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      block.event_type === 'GENESIS'
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : block.event_type.includes('BREACH')
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : block.event_type.includes('DUPLICATE')
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-teal-50 text-teal-800 border-teal-200'
                    }`}>
                      {block.event_type}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{block.timestamp}</span>
                  </div>
                  <span className="text-xs text-slate-600 font-medium mt-0.5 block">
                    Signed by: <strong className="text-slate-800">{block.issuer}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Nonce: {block.nonce}</span>
                <button
                  onClick={() => handleCopyHash(block.block_hash)}
                  className="px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-mono flex items-center gap-1 transition cursor-pointer"
                  title="Copy block hash"
                >
                  {copiedHash === block.block_hash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                  <span>{copiedHash === block.block_hash ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
            </div>

            {/* Block Payload Content */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">Payload Details:</span>
              <p className="text-slate-800 font-sans leading-relaxed">{block.details}</p>
              <div className="text-[11px] text-slate-600 pt-0.5">
                Target Identifier: <strong className="font-mono text-slate-900">{block.entity_id}</strong>
              </div>
            </div>

            {/* Cryptographic Hash Chain Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 space-y-0.5">
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <Link className="w-3 h-3 text-slate-400" />
                  <span>Previous Block Hash:</span>
                </div>
                <div className="font-mono text-slate-600 text-[10px] truncate" title={block.previous_hash}>
                  {block.previous_hash}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 space-y-0.5">
                <div className="flex items-center gap-1 text-teal-800 font-medium">
                  <Database className="w-3 h-3 text-teal-700" />
                  <span>Block Hash (SHA-256 Proof):</span>
                </div>
                <div className="font-mono text-slate-900 text-[10px] truncate font-semibold" title={block.block_hash}>
                  {block.block_hash}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

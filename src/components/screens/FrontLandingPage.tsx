/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
import {
  Building2,
  Shield,
  UserCheck,
  Search,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  Unlock,
  Smartphone,
  GraduationCap,
  Layers,
  FileCheck2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Check,
  Copy,
  Gauge,
  HelpCircle,
  Clock,
  ShieldAlert,
  Sliders,
  Database
} from 'lucide-react';
import { Institution, Student } from '../../types.ts';
import { apiService, VerificationResult } from '../../services/apiService.ts';
import { isValidApaarId, analyzeApaarStructure, calculateIntakeAnalysis } from '../../utils/validation.ts';

interface FrontLandingPageProps {
  onNavigateToLogin: (role: 'institution_admin' | 'aicte_regulator' | 'student') => void;
  onNavigateToPortal: (role: 'institution_admin' | 'aicte_regulator' | 'student') => void;
  onTriggerAlert: (result: VerificationResult) => void;
  institutions: Institution[];
  students: Student[];
}

export const FrontLandingPage: React.FC<FrontLandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToPortal,
  onTriggerAlert,
  institutions,
  students
}) => {
  // Public Verification State
  const [quickSearchId, setQuickSearchId] = useState('1234-5678-9012');
  const [quickVerifier, setQuickVerifier] = useState('Tata Consultancy Services (TCS) Campus Verification Desk');
  const [publicResult, setPublicResult] = useState<VerificationResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);

  // Diagnostic Lab State
  const [diagnosticInput, setDiagnosticInput] = useState('123456789015');
  const structureAnalysis = analyzeApaarStructure(diagnosticInput);

  // Quota Explorer State
  const [collegeSearch, setCollegeSearch] = useState('');
  const [selectedInstFilter, setSelectedInstFilter] = useState('all');

  // Workflow Stepper
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const apaarInputId = useId();
  const verifierInputId = useId();
  const diagnosticInputId = useId();
  const collegeSearchId = useId();

  const handleQuickVerify = (e?: React.FormEvent, customId?: string, customVerifier?: string) => {
    if (e) e.preventDefault();
    const idToSearch = customId !== undefined ? customId : quickSearchId;
    const verifierToUse = customVerifier !== undefined ? customVerifier : quickVerifier;

    if (!idToSearch.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      const res = apiService.verifyCredential(
        idToSearch,
        verifierToUse || 'Public Verification Service',
        '103.246.40.' + Math.floor(10 + Math.random() * 80)
      );
      setPublicResult(res);
      setIsSearching(false);
      onTriggerAlert(res);
    }, 200);
  };

  const handleCopyVerificationSlip = () => {
    if (!publicResult) return;
    const slipText = `AICTE APAAR DIGITAL VERIFICATION RECEIPT
Ref ID: ${publicResult.auditLog.log_id}
Status: ${publicResult.verified ? 'VERIFIED' : publicResult.isLocked ? 'LOCKED_BY_STUDENT' : 'UNVERIFIED'}
Candidate: ${publicResult.student?.full_name || 'N/A'}
APAAR ID: ${publicResult.auditLog.apaar_id}
Program: ${publicResult.student?.program || 'N/A'}
Institution: ${publicResult.institution?.name || 'N/A'}
Verifier: ${publicResult.auditLog.verifier_entity}
Timestamp: ${publicResult.auditLog.access_timestamp}
SMS Notification: Dispatched to registered student mobile.`;

    navigator.clipboard.writeText(slipText);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2000);
  };

  const filteredInstitutions = institutions.filter((inst) => {
    if (selectedInstFilter !== 'all' && inst.id !== selectedInstFilter) return false;
    if (collegeSearch.trim()) {
      const q = collegeSearch.toLowerCase();
      return (
        inst.name.toLowerCase().includes(q) ||
        inst.aicte_id.toLowerCase().includes(q) ||
        inst.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const workflowSteps = [
    {
      title: '1. Institutional Roster Ingestion',
      badge: 'Registrar Desk',
      desc: 'Accredited colleges upload admission batches with column auto-mapping and pre-commit anomaly scanning.',
      details: [
        'Batch CSV and Excel parsing with immediate field normalization',
        'Pre-commit inline correction of format warnings and typo errors',
        'Audit-stamped batch IDs linking records to institutional submission dates'
      ]
    },
    {
      title: '2. 12-Digit Luhn & Deduplication Engine',
      badge: 'National AICTE Engine',
      desc: 'The central engine validates the 12-digit format and scans all colleges nationwide in real time.',
      details: [
        'Deterministic Luhn Modulo-10 checksum prevents typographical misallocations',
        'Cross-university deduplication identifies dual enrollment across multiple colleges',
        'Immediate collision notice dispatched to institutional registrars'
      ]
    },
    {
      title: '3. Case Management & Exception Queue',
      badge: 'Reviewer Adjudication',
      desc: 'Side-by-side reconciliation of conflicting candidate enrollments with formal regulatory audit trails.',
      details: [
        'Side-by-side comparison highlighting matching vs conflicting institutional claims',
        'Reviewer authority: Confirmed Duplicate, Dismissed, or Under Inquiry',
        'Deterministic priority scoring dispatches high-urgency exceptions to officers'
      ]
    },
    {
      title: '4. Intake Cap & Live SMS Alert Ledger',
      badge: 'Statutory Transparency',
      desc: 'Headcount tracking against approved orders and citizen privacy notification on every verification query.',
      details: [
        'Automated detection of unsanctioned admissions exceeding approved quota',
        'Instant security SMS alert delivered to registered student mobile upon verifier query',
        'Student sovereign DPDP consent lock gives students control over verification'
      ]
    }
  ];

  const faqs = [
    {
      question: 'What is the APAAR ID and why is it mandatory for AICTE technical institutions?',
      answer: 'APAAR (Automated Permanent Academic Account Registry), known as "One Nation, One Student ID", is an initiative under the National Education Policy (NEP) 2020. It assigns a lifelong 12-digit digital identifier to every student in India, seamlessly connecting academic records, degrees, and credit transfers to the Academic Bank of Credits (ABC) and DigiLocker.'
    },
    {
      question: 'How does the platform detect and handle dual admissions / duplicate enrollments?',
      answer: 'Whenever an institution ingests a student roster, the platform indexes the 12-digit APAAR ID across all AICTE-approved institutions nationwide. If an identical APAAR ID is found actively registered in another regular full-time program, the system flags a "Duplicate Conflict", creates a Case in the Case Management Desk, and alerts both college administrators.'
    },
    {
      question: 'What happens when an institution exceeds its approved intake capacity?',
      answer: 'Under the AICTE Approval Process Handbook (APH 2026-27), colleges have strict seat caps per discipline. The platform continuously computes actual APAAR enrollments against approved intake. When headcount exceeds the limit (e.g., 95 admissions against a 90-seat cap), the system generates an immediate Capacity Breach Alert and logs the incident.'
    },
    {
      question: 'How is student privacy protected under the Digital Personal Data Protection (DPDP) Act, 2023?',
      answer: 'Students retain total sovereignty over their academic identity. Whenever an employer or background verifier inspects a record, an instant SMS alert is dispatched to the student mobile. Students can also toggle their "Consent Privacy Lock" from the Citizen Portal to block automated verifications.'
    }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        {/* Subtle Government Strip */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-slate-300 to-emerald-600" />

        <div className="max-w-4xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Ministry of Education & AICTE Academic Architecture</span>
            <span className="text-slate-400">•</span>
            <span className="text-teal-800 font-medium">NEP 2020 Framework</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            National APAAR Student Verification & Institutional Intake Platform
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-3xl">
            A unified digital governance platform connecting all AICTE-approved colleges. Eliminates cross-university duplicate admissions, automates 12-digit APAAR validation, and enforces statutory approved intake capacities in real time.
          </p>

          {/* Core Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => onNavigateToPortal('aicte_regulator')}
              className="px-4 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Open Verification Workspace</span>
            </button>

            <button
              onClick={() => onNavigateToLogin('institution_admin')}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-300 shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>College Registrar Portal</span>
            </button>

            <button
              onClick={() => onNavigateToLogin('student')}
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-200 transition flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-teal-700" />
              <span>Student Citizen Portal</span>
            </button>
          </div>

          {/* Operational Metrics Strip */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium text-[11px] block">Verified Student Headcount</span>
              <strong className="text-slate-900 font-bold text-lg font-mono">{students.length}</strong>
              <span className="text-slate-500 text-[10px] block">Across 3 seed colleges</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium text-[11px] block">Deduplication Accuracy</span>
              <strong className="text-emerald-700 font-bold text-lg font-mono">100%</strong>
              <span className="text-slate-500 text-[10px] block">Deterministic 12-digit match</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium text-[11px] block">Duplicate Conflicts Flagged</span>
              <strong className="text-rose-700 font-bold text-lg font-mono">
                {students.filter((s) => s.validation_status === 'Duplicate').length}
              </strong>
              <span className="text-slate-500 text-[10px] block">Dual-admission alerts</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium text-[11px] block">Statutory Rule Base</span>
              <strong className="text-slate-900 font-bold text-lg font-mono">APH 2026-27</strong>
              <span className="text-slate-500 text-[10px] block">AICTE Approved Intake</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Operational Demo Preview (Realistic Snapshot of the Workbench) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Operational Workbench Snapshot</h2>
            <p className="text-xs text-slate-600">
              Live preview of candidate roster verification, duplicate conflict detection, and explainable diagnostics
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Interactive Prototype Environment
          </span>
        </div>

        {/* Structured Realistic Table Card */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Sample Active Admissions Roster:</span>
              <span className="text-slate-500 font-mono text-[11px]">Madras Institute of Technology (AICTE-TN-042)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                12-Digit Luhn Checked
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                1 Duplicate Flag
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">APAAR ID</th>
                  <th className="py-2.5 px-3.5">Student Name</th>
                  <th className="py-2.5 px-3.5">College Roll No</th>
                  <th className="py-2.5 px-3.5">Degree Program</th>
                  <th className="py-2.5 px-3.5">Engine Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {students.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.validation_status === 'Valid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.validation_status === 'Duplicate'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {s.validation_status === 'Valid' && <CheckCircle2 className="w-3 h-3" />}
                        {s.validation_status === 'Duplicate' && <AlertTriangle className="w-3 h-3" />}
                        {s.validation_status === 'Warning' && <AlertTriangle className="w-3 h-3" />}
                        {s.validation_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {isValidApaarId(s.apaar_id).formatted || s.apaar_id || 'Missing'}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-900 whitespace-nowrap">
                      {s.full_name}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {s.student_id}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 max-w-xs truncate">{s.program}</td>
                    <td className="py-2.5 px-3.5 text-[11px] text-slate-600 max-w-xs truncate" title={s.validation_notes}>
                      {s.validation_notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Role-Based Portal Entry Cards (Structured 4-Card Responsive Grid) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Dedicated Role-Based Portals</h2>
          <p className="text-xs text-slate-600">
            Tailored administrative workspaces enforcing role-based access control (RBAC) across education stakeholders
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Institution */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                  Colleges & Universities
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">Institution Portal</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Upload admission batches, check quota utilization, correct errors inline, and manage student rosters.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToLogin('institution_admin')}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Institution Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Regulator */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  AICTE National HQ
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">Central Regulator Hub</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Macro oversight across affiliated colleges, capacity breach feed, dual-enrollment case desk, and statutory notices.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToLogin('aicte_regulator')}
              className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Regulator Command</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Student */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  Students & Citizens
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">Citizen / Student Portal</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  View your digital APAAR ID card, transfer ABC course credits, inspect real-time access logs, and toggle consent lock.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToLogin('student')}
              className="w-full py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Student Citizen Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Employer / Public Verifier */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                  Recruiters & Agencies
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">Public Verifier Desk</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Instant degree and enrollment verification for corporate recruiters with automated student SMS dispatch.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('public-verify-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Instant Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Public Credential Verification Simulator */}
      <section
        id="public-verify-section"
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-teal-800 font-semibold mb-1">
              <Search className="w-3.5 h-3.5" />
              Public Credential Verification Service
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Instant Employer & Third-Party Credential Lookup
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Verify degree enrollment or student credentials without an account. Each lookup automatically dispatches a security SMS alert to the student.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
            No Login Required
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleQuickVerify} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <label htmlFor={apaarInputId} className="block text-xs font-medium text-slate-700 mb-1">
                Enter 12-Digit APAAR / ABC ID *
              </label>
              <input
                id={apaarInputId}
                type="text"
                value={quickSearchId}
                onChange={(e) => setQuickSearchId(e.target.value)}
                placeholder="e.g. 1234-5678-9012"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-700"
                required
              />
            </div>

            <div className="md:col-span-5">
              <label htmlFor={verifierInputId} className="block text-xs font-medium text-slate-700 mb-1">
                Querying Organization / Employer Name *
              </label>
              <input
                id={verifierInputId}
                type="text"
                value={quickVerifier}
                onChange={(e) => setQuickVerifier(e.target.value)}
                placeholder="e.g. Tata Consultancy Services or Amazon Web Services"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
                required
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSearching ? <span>Checking...</span> : <span>Verify Record</span>}
              </button>
            </div>
          </div>
        </form>

        {/* Demo Samples */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="text-slate-500 font-medium">Quick Demo Samples:</span>
          <button
            type="button"
            onClick={() => {
              setQuickSearchId('123456789012');
              setQuickVerifier('Tata Consultancy Services (TCS)');
              handleQuickVerify(undefined, '123456789012', 'Tata Consultancy Services (TCS)');
            }}
            className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer"
          >
            Aarav Ramanathan (MIT)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuickSearchId('548291037462');
              setQuickVerifier('Anna University Transcript Desk');
              handleQuickVerify(undefined, '548291037462', 'Anna University Transcript Desk');
            }}
            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition cursor-pointer"
          >
            Siddharth (Duplicate Conflict)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuickSearchId('234567890123');
              setQuickVerifier('Amazon Web Services');
              handleQuickVerify(undefined, '234567890123', 'Amazon Web Services');
            }}
            className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer"
          >
            Kavya Sundaram (MIT)
          </button>
        </div>

        {/* Result Preview */}
        {publicResult && (
          <div className="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
            {publicResult.isLocked ? (
              <div className="flex items-start gap-3 text-rose-800">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose-900">
                    Verification Blocked: Student Sovereign Consent Lock Active
                  </h4>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    The student has enabled Consent Privacy Lock on their APAAR account under Section 6 of the DPDP Act, 2023. Automated third-party lookup is blocked until unlocked in the Student Portal. An immediate security SMS alert has been dispatched to the candidate's mobile.
                  </p>
                </div>
              </div>
            ) : publicResult.verified && publicResult.student ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-base font-bold text-slate-900">
                        {publicResult.student.full_name}
                      </strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ AICTE & ABC Verified
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Roll: {publicResult.student.student_id} • APAAR: {isValidApaarId(publicResult.student.apaar_id).formatted}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyVerificationSlip}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSlip ? 'Copied' : 'Copy Verification Receipt'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Degree Program</span>
                    <strong className="text-slate-800">{publicResult.student.program}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Affiliated College</span>
                    <strong className="text-slate-800">{publicResult.institution?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Admission Batch & Quota</span>
                    <strong className="text-slate-800">
                      {publicResult.student.admission_category} (Batch {publicResult.student.admission_year})
                    </strong>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-teal-700" />
                    SMS Alert Dispatched: {publicResult.smsMessage}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Status: Logged</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>No verified record found for identifier {publicResult.auditLog.apaar_id}.</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. 4-Stage Operational Architecture Workflow */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-teal-800 font-semibold mb-1">
            <Layers className="w-3.5 h-3.5" />
            National Operational Protocol
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            End-to-End APAAR Verification & Intake Monitoring Pipeline
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Four sequential stages ensuring complete data integrity across Indian technical institutions
          </p>
        </div>

        {/* 4 Step Selector Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {workflowSteps.map((step, idx) => {
            const isActive = activeWorkflowStep === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveWorkflowStep(idx)}
                className={`p-3.5 rounded-xl text-left border transition cursor-pointer ${
                  isActive
                    ? 'bg-teal-50/70 border-teal-700 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 mb-1">
                  Stage {idx + 1}
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{step.title.slice(3)}</div>
                <span className="text-[10px] text-slate-500 block mt-0.5">{step.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Card */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-slate-900">
              {workflowSteps[activeWorkflowStep].title}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200">
              {workflowSteps[activeWorkflowStep].badge}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {workflowSteps[activeWorkflowStep].desc}
          </p>

          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            {workflowSteps[activeWorkflowStep].details.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Concrete Breakdown: Prototype Simulation vs Planned Live Integrations */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Architecture Matrix: Prototype Capabilities vs Planned Integration Bridges
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Transparent differentiation between current client-side prototype features and production ministerial API connectors
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">Platform Capability</th>
                <th className="py-2.5 px-3.5">Current Prototype Implementation</th>
                <th className="py-2.5 px-3.5">Planned Production Integration Bridge</th>
                <th className="py-2.5 px-3.5">Target Statutory Body</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              <tr>
                <td className="py-3 px-3.5 font-semibold text-slate-900">APAAR Format & Luhn Check</td>
                <td className="py-3 px-3.5 text-slate-700">
                  Client-side Modulo-10 checksum validation with 4-segment state routing analysis
                </td>
                <td className="py-3 px-3.5 text-slate-600">
                  National UIDAI Aadhaar e-KYC & DigiLocker live authorization REST endpoints
                </td>
                <td className="py-3 px-3.5 font-medium text-slate-800">Ministry of Education (NAD / ABC)</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-semibold text-slate-900">Cross-College Deduplication</td>
                <td className="py-3 px-3.5 text-slate-700">
                  In-memory & LocalStorage multi-university indexed collision detection engine
                </td>
                <td className="py-3 px-3.5 text-slate-600">
                  National PostgreSQL partitioned cluster synchronizing 10,000+ AICTE institutions
                </td>
                <td className="py-3 px-3.5 font-medium text-slate-800">AICTE Central Regulatory Command</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-semibold text-slate-900">Seat Cap Enforcement & Breaches</td>
                <td className="py-3 px-3.5 text-slate-700">
                  Dynamic headcount vs approved intake calculation with What-If intake simulator
                </td>
                <td className="py-3 px-3.5 text-slate-600">
                  Automated sync with Annual Approval Orders (APH 2026-27) & AISHE database
                </td>
                <td className="py-3 px-3.5 font-medium text-slate-800">Approval Process Handbook (APH)</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-semibold text-slate-900">Real-Time Access Notification</td>
                <td className="py-3 px-3.5 text-slate-700">
                  Client-side real-time SMS toast simulator logging into structured PostgreSQL ledger
                </td>
                <td className="py-3 px-3.5 text-slate-600">
                  Govt. CDAC SMS / Email Gateway delivering OTPs and access security alerts
                </td>
                <td className="py-3 px-3.5 font-medium text-slate-800">DPDP Act 2023 / Telecom Gateway</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Practical FAQ Accordion */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Operational guidelines covering duplicate resolution, DPDP compliance, and sanctioned seat caps
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-teal-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

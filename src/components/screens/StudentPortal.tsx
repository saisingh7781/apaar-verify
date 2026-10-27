/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  Smartphone,
  Lock,
  Unlock,
  QrCode,
  History,
  GraduationCap,
  Building,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  ArrowLeftRight,
  FileCheck,
  Plus,
  X,
  Check,
  Clock
} from 'lucide-react';
import { Student, Institution, AccessAuditLog, CourseCredit, CreditTransferRequest } from '../../types.ts';
import { apiService, UserSession } from '../../services/apiService.ts';
import { isValidApaarId } from '../../utils/validation.ts';

interface StudentPortalProps {
  currentUser: UserSession | null;
  students: Student[];
  institutions: Institution[];
  auditLogs: AccessAuditLog[];
  onSelectStudent?: (apaarId: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentUser,
  students,
  institutions,
  auditLogs,
  onSelectStudent
}) => {
  // Find current student by session apaar id or default to Aarav Ramanathan
  const activeStudent =
    students.find((s) => s.apaar_id === currentUser?.student_apaar_id) ||
    students[0];

  const [activeTab, setActiveTab] = useState<'profile' | 'abc-credits' | 'audit' | 'consent'>('profile');
  const [isLocked, setIsLocked] = useState<boolean>(Boolean(activeStudent.is_sharing_locked));
  const [consentUpdated, setConsentUpdated] = useState(false);

  // ABC Credit Transfer State
  const [courseCredits, setCourseCredits] = useState<CourseCredit[]>(apiService.getCourseCredits(activeStudent.apaar_id));
  const [transferRequests, setTransferRequests] = useState<CreditTransferRequest[]>(
    apiService.getTransferRequests(undefined, activeStudent.apaar_id)
  );
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(['CS8491', 'CS8492']);
  const [targetInstitutionId, setTargetInstitutionId] = useState<string>('inst-2');
  const [targetProgramInput, setTargetProgramInput] = useState('B.Tech Computer Science & Engineering (Dual Degree)');
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);

  const institution = institutions.find((i) => i.id === activeStudent.institution_id);

  // Filter audit logs specifically for this student
  const studentLogs = auditLogs.filter(
    (log) => log.apaar_id.replace(/[\s-]/g, '') === activeStudent.apaar_id.replace(/[\s-]/g, '')
  );

  const handleToggleConsent = () => {
    const nextState = !isLocked;
    setIsLocked(nextState);
    apiService.toggleStudentConsent(activeStudent.apaar_id, nextState);
    setConsentUpdated(true);
    setTimeout(() => setConsentUpdated(false), 2500);
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleCourseSelectionToggle = (code: string) => {
    setSelectedCourses(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleInitiateTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourses.length === 0) {
      alert('Please select at least one verified course credit to transfer.');
      return;
    }

    const newReq = apiService.createCreditTransferRequest(
      activeStudent.apaar_id,
      targetInstitutionId,
      targetProgramInput,
      selectedCourses
    );

    setTransferRequests(apiService.getTransferRequests(undefined, activeStudent.apaar_id));
    setIsTransferModalOpen(false);
    setTransferFeedback(`Transfer request #${newReq.id} submitted for ${newReq.total_credits} credits to ${newReq.target_institution_name}!`);
    setTimeout(() => setTransferFeedback(null), 4000);
  };

  const totalCreditsEarned = courseCredits.reduce((acc, c) => acc + c.credits, 0);

  return (
    <div className="space-y-5">
      {/* 1. Header & Identity Ribbon */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-base">
            {activeStudent.full_name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Citizen / Student Portal
              </span>
              <span className="text-xs text-slate-500">DigiLocker & ABC Verified</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              {activeStudent.full_name}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Roll No: <strong className="text-slate-900 font-mono">{activeStudent.student_id}</strong> •{' '}
              {institution?.name.split(',')[0]}
            </p>
          </div>
        </div>

        {/* Quick Student Switcher for Presentations */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">Active Candidate:</span>
          <select
            value={activeStudent.apaar_id}
            onChange={(e) => {
              if (onSelectStudent) onSelectStudent(e.target.value);
              else apiService.loginAsStudent(e.target.value);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer focus:outline-hidden focus:border-teal-700"
          >
            {students.slice(0, 6).map((s) => (
              <option key={s.id} value={s.apaar_id}>
                {s.full_name} ({s.validation_status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {transferFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{transferFeedback}</span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>My Academic Profile & Card</span>
        </button>

        <button
          onClick={() => setActiveTab('abc-credits')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer relative ${
            activeTab === 'abc-credits'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Academic Bank of Credits (ABC) & Transfer</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold border border-teal-200">
            {totalCreditsEarned} Credits
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer relative ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Live Access Audit Trail</span>
          {studentLogs.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold border border-slate-200">
              {studentLogs.length} Events
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('consent')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'consent'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
          <span>Privacy & Consent Lock</span>
          {isLocked && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-50 text-rose-700 font-bold border border-rose-200">
              LOCKED
            </span>
          )}
        </button>
      </div>

      {/* 3. Tab 1: My Academic Profile & Digital APAAR Card */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Digital APAAR Identity Card */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-4">
              {/* Card Tricolor Header */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      GOVERNMENT OF INDIA
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      AICTE • ABC • APAAR CARD
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  e-KYC VERIFIED
                </span>
              </div>

              {/* Card Body */}
              <div className="flex items-start gap-4">
                {/* Photo & QR */}
                <div className="space-y-2 shrink-0">
                  <div className="w-20 h-24 bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                      PHOTO
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">DigiLocker</span>
                  </div>
                  <div className="w-20 h-10 bg-slate-50 border border-slate-200 rounded p-1 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-slate-800" />
                  </div>
                </div>

                {/* Identity Text */}
                <div className="space-y-1.5 text-xs flex-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Student Name</span>
                    <span className="text-sm font-bold text-slate-900">{activeStudent.full_name}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">National APAAR ID</span>
                    <span className="font-mono text-teal-900 font-bold text-xs tracking-wider">
                      {isValidApaarId(activeStudent.apaar_id).formatted || activeStudent.apaar_id}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Degree Program</span>
                    <span className="text-slate-800 font-medium leading-tight block">
                      {activeStudent.program}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Affiliated Institution</span>
                    <span className="text-slate-600 text-[11px] block">
                      {institution?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Batch: {activeStudent.admission_year}</span>
                <span>Category: {activeStudent.admission_category}</span>
                <span className="text-emerald-700 font-semibold">Status: {activeStudent.validation_status}</span>
              </div>
            </div>

            <button
              onClick={handlePrintCard}
              className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download / Print APAAR Digital Card</span>
            </button>
          </div>

          {/* Right Column: Academic Details & ABC Bank */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-700" />
                Verified Academic Mapping & Enrollment Registry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-medium">National Student ID (APAAR)</span>
                  <span className="font-mono text-teal-900 font-bold text-sm">
                    {isValidApaarId(activeStudent.apaar_id).formatted}
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-medium">Linked to Aadhaar & ABC</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-medium">College Roll Number</span>
                  <span className="font-mono text-slate-900 font-bold text-sm">{activeStudent.student_id}</span>
                  <span className="text-[10px] text-slate-500 block">Internal institutional identifier</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5 sm:col-span-2">
                  <span className="text-slate-400 text-[10px] block font-medium">Enrolled Degree & Program</span>
                  <span className="text-slate-900 font-semibold text-sm">{activeStudent.program}</span>
                  <span className="text-[11px] text-slate-500 block">
                    {institution?.name} ({institution?.aicte_id})
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-medium">Admission Quota</span>
                  <span className="text-slate-900 font-semibold">{activeStudent.admission_category}</span>
                  <span className="text-[10px] text-slate-500 block">Sanctioned Quota Allocation</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-medium">Validation Status</span>
                  <span
                    className={`font-semibold inline-flex items-center gap-1 ${
                      activeStudent.validation_status === 'Valid'
                        ? 'text-emerald-700'
                        : activeStudent.validation_status === 'Duplicate'
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {activeStudent.validation_status}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {activeStudent.validation_notes || 'Clean record'}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Bank of Credits Mini Card */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <h4 className="font-bold text-slate-900">
                    Academic Bank of Credits (ABC) Credit Ledger
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-teal-800 border border-teal-200">
                  {totalCreditsEarned} Credits Synced
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Your earned course credits automatically transfer across recognized universities under the National Credit Framework (NCrF). Click the ABC & Transfer tab to initiate inter-university transfers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab 2: ABC Course Credit Breakdown & Inter-University Transfer Flow */}
      {activeTab === 'abc-credits' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                  ACADEMIC BANK OF CREDITS (ABC)
                </span>
                <span className="text-xs text-slate-500">Semester-Wise Credit Ledger</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Course Credits Ledger & Inter-University Mobility
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Earned course credits verified and sealed with cryptographic proof under NEP 2020
              </p>
            </div>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Initiate Inter-University Credit Transfer</span>
            </button>
          </div>

          {/* Course Credit Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Semester-Wise Course Breakdown ({courseCredits.length} Verified Courses)
              </span>
              <span className="text-slate-500 font-mono">Total Cumulative Credits: {totalCreditsEarned}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">Course Code</th>
                    <th className="py-2.5 px-3.5">Course Title</th>
                    <th className="py-2.5 px-3.5">Sem</th>
                    <th className="py-2.5 px-3.5">Credits</th>
                    <th className="py-2.5 px-3.5">Grade</th>
                    <th className="py-2.5 px-3.5">Issuing University</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5">Verification Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {courseCredits.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">{course.course_code}</td>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">{course.course_name}</td>
                      <td className="py-2.5 px-3.5 text-slate-600">Sem {course.semester}</td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-teal-900">{course.credits} cr</td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800">{course.grade}</td>
                      <td className="py-2.5 px-3.5 text-slate-600 text-[11px]">{course.issuing_university.split(',')[0]}</td>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {course.verified_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[10px] text-slate-400">
                        {course.verification_hash.slice(0, 14)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transfer Requests Ledger */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                My Inter-University Transfer Requests ({transferRequests.length})
              </span>
              <span className="text-slate-500 text-[11px]">Subject to Central AICTE Approval</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">Transfer ID</th>
                    <th className="py-2.5 px-3.5">Target Institution</th>
                    <th className="py-2.5 px-3.5">Degree Program</th>
                    <th className="py-2.5 px-3.5">Courses</th>
                    <th className="py-2.5 px-3.5">Total Credits</th>
                    <th className="py-2.5 px-3.5">Requested At</th>
                    <th className="py-2.5 px-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {transferRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">#{req.id}</td>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">{req.target_institution_name}</td>
                      <td className="py-2.5 px-3.5 text-slate-600">{req.target_program}</td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px]">{req.course_codes.join(', ')}</td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-teal-900">{req.total_credits} cr</td>
                      <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px]">{req.requested_at}</td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'Approved & Synced'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : req.status === 'Pending Central Approval'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 3: Live Access Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-teal-700" />
              Personal Credential Access Log & Real-Time Alert Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Every time an employer, government portal, or agency verifies your credentials, a permanent entry is stamped below and an SMS is sent to your phone.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">Access Timestamp</th>
                    <th className="py-2.5 px-3.5">Verifier / Organization</th>
                    <th className="py-2.5 px-3.5">Client IP Address</th>
                    <th className="py-2.5 px-3.5">Alert Dispatched</th>
                    <th className="py-2.5 px-3.5 text-right">Student Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {studentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No external access lookups recorded for your APAAR ID yet.
                      </td>
                    </tr>
                  ) : (
                    studentLogs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                          {log.access_timestamp}
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                          {log.verifier_entity}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-500">
                          {log.ip_address}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Smartphone className="w-3 h-3" /> SMS Dispatched
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <button
                            onClick={() => {
                              alert(
                                `Flagged Inquiry: Report filed for query by "${log.verifier_entity}" on ${log.access_timestamp}. AICTE Privacy Nodal Officer notified.`
                              );
                            }}
                            className="text-xs text-rose-700 hover:text-rose-800 font-medium transition cursor-pointer"
                          >
                            Report Inquiry
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 4: Consent & Privacy Lock */}
      {activeTab === 'consent' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 max-w-3xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              Student Sovereign Consent & Credential Privacy Control
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Under AICTE and Digital Personal Data Protection (DPDP) Act rules, you maintain unconditional authority to lock your credential verification.
            </p>
          </div>

          {consentUpdated && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Consent lock state updated successfully in the national registry!</span>
            </div>
          )}

          {/* Big Consent Toggle Box */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Verification Sharing Status
              </span>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {isLocked ? (
                  <>
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span className="text-rose-700">Credential Sharing is LOCKED</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Credential Sharing is ALLOWED</span>
                  </>
                )}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isLocked
                  ? 'All third-party employers and agencies attempting to verify your degree will be denied. You will receive an immediate SMS warning of any blocked attempt.'
                  : 'Authorized recruitment agencies, universities, and background verification desks can verify your degree and enrollment status.'}
              </p>
            </div>

            <button
              onClick={handleToggleConsent}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer ${
                isLocked
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-rose-700 hover:bg-rose-800 text-white'
              }`}
            >
              {isLocked ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Credential Sharing</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Lock Credential Sharing</span>
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h5 className="font-semibold text-slate-800">How Student Consent Works:</h5>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>When LOCKED: External verification requests return an explicit privacy lock notice.</li>
              <li>Every verification attempt (allowed or blocked) logs timestamp, verifier name, and IP address.</li>
              <li>You receive an instant alert on registered mobile: <code className="text-slate-800 font-mono">{activeStudent.contact_masked || '+91 98*** **412'}</code>.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Transfer Request Modal */}
      {isTransferModalOpen && (
        <div
          role="dialog"
          aria-labelledby="transfer-dialog-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl text-slate-800 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 id="transfer-dialog-title" className="font-bold text-sm text-slate-900">
                  Initiate Inter-University Credit Transfer
                </h3>
                <p className="text-xs text-slate-500">Academic Bank of Credits Protocol</p>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInitiateTransferSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target AICTE Institution *</label>
                <select
                  value={targetInstitutionId}
                  onChange={(e) => setTargetInstitutionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
                >
                  {institutions.filter(i => i.id !== activeStudent.institution_id).map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.aicte_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Degree Program *</label>
                <input
                  type="text"
                  value={targetProgramInput}
                  onChange={(e) => setTargetProgramInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Verified Credits to Transfer *</label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 p-1">
                  {courseCredits.map((course) => {
                    const isChecked = selectedCourses.includes(course.course_code);
                    return (
                      <label
                        key={course.id}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCourseSelectionToggle(course.course_code)}
                            className="rounded border-slate-300 text-teal-700"
                          />
                          <span className="font-semibold text-slate-900">{course.course_code}</span>
                          <span className="text-slate-600 truncate max-w-[200px]">{course.course_name}</span>
                        </div>
                        <span className="font-mono font-bold text-teal-900">{course.credits} cr</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

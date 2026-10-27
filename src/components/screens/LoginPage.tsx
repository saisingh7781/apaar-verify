/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Smartphone,
  Fingerprint
} from 'lucide-react';
import { apiService, UserSession } from '../../services/apiService.ts';
import { Institution, Student, UserRole } from '../../types.ts';
import { isValidApaarId } from '../../utils/validation.ts';

interface LoginPageProps {
  initialRole?: UserRole;
  onLoginSuccess: (session: UserSession) => void;
  institutions: Institution[];
  students: Student[];
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole = 'institution_admin',
  onLoginSuccess,
  institutions,
  students
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(institutions[0]?.id || 'inst-1');
  const [email, setEmail] = useState('registrar@mitindia.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [studentApaarId, setStudentApaarId] = useState('1234-5678-9012');
  const [studentOtp, setStudentOtp] = useState('849201');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'aicte_regulator') {
      setEmail('regulator.hq@aicte-india.org');
    } else if (newRole === 'institution_admin') {
      setEmail('registrar@mitindia.edu');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      let session: UserSession;
      if (role === 'student') {
        session = apiService.loginAsStudent(studentApaarId);
      } else {
        session = apiService.login(
          role,
          role === 'institution_admin' ? selectedInstitutionId : undefined,
          email
        );
      }
      setIsLoading(false);
      onLoginSuccess(session);
    }, 250);
  };

  const handleQuickDemoLogin = (targetRole: UserRole, targetId = 'inst-1') => {
    setIsLoading(true);
    setTimeout(() => {
      let session: UserSession;
      if (targetRole === 'student') {
        session = apiService.loginAsStudent(targetId || '123456789012');
      } else {
        session = apiService.login(
          targetRole,
          targetRole === 'institution_admin' ? targetId : undefined,
          targetRole === 'institution_admin' ? 'registrar@mitindia.edu' : 'regulator.hq@aicte-india.org'
        );
      }
      setIsLoading(false);
      onLoginSuccess(session);
    }, 200);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden grid md:grid-cols-12">
        {/* Left Side: National Institutional Authority Notice */}
        <div className="md:col-span-5 bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              National Academic Depository (NAD)
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AICTE APAAR Gateway
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Official authentication entry for technical college administrators, AICTE central authorities, and verified student citizens.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>One Nation, One Student ID (12-digit APAAR) linked to DigiLocker and ABC.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Zero duplicate admissions across Indian universities and institutions.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Transparent access logging with instant SMS alert delivery to candidates.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="block font-medium text-slate-300">Statutory Compliance</span>
            <span>All technical universities must verify student admissions under AICTE APH 2026-27.</span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="md:col-span-7 p-6 sm:p-8 bg-white flex flex-col justify-center space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Sign In to Platform</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select your authorized role to proceed</p>
          </div>

          {/* Quick 1-Click Demo Buttons */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              Quick Presentation Demo Shortcuts:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('institution_admin', 'inst-1')}
                className="px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-left transition cursor-pointer"
              >
                <span className="block font-bold text-slate-900 text-[11px] truncate">Admin</span>
                <span className="text-[10px] text-slate-500">MIT Chennai</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('aicte_regulator')}
                className="px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-left transition cursor-pointer"
              >
                <span className="block font-bold text-slate-900 text-[11px] truncate">Regulator</span>
                <span className="text-[10px] text-slate-500">National HQ</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student', '123456789012')}
                className="px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-left transition cursor-pointer"
              >
                <span className="block font-bold text-slate-900 text-[11px] truncate">Student</span>
                <span className="text-[10px] text-slate-500">Aarav (MIT)</span>
              </button>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleChange('institution_admin')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition cursor-pointer ${
                role === 'institution_admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>College Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('aicte_regulator')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition cursor-pointer ${
                role === 'aicte_regulator'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Regulator</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition cursor-pointer ${
                role === 'student'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {role === 'institution_admin' && (
              <>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Accredited Institution *
                  </label>
                  <select
                    value={selectedInstitutionId}
                    onChange={(e) => setSelectedInstitutionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:border-teal-700 cursor-pointer"
                  >
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.aicte_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Official College Administrator Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Password / Secure Passkey *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'aicte_regulator' && (
              <>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    AICTE Official Regulator Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Govt. 2FA Security Passkey *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'student' && (
              <>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    12-Digit National APAAR / ABC ID *
                  </label>
                  <div className="relative">
                    <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={studentApaarId}
                      onChange={(e) => setStudentApaarId(e.target.value)}
                      placeholder="1234-5678-9012"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold">
                      One-Time Password (OTP) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(true)}
                      className="text-[11px] text-teal-800 hover:text-teal-900 font-medium cursor-pointer"
                    >
                      {otpSent ? '✓ OTP Sent to +91 98*** **412' : 'Send OTP to Mobile'}
                    </button>
                  </div>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={studentOtp}
                      onChange={(e) => setStudentOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-700"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg font-semibold text-white bg-teal-700 hover:bg-teal-800 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>
                    {role === 'student'
                      ? 'Access Student Academic Portal'
                      : role === 'aicte_regulator'
                      ? 'Enter Regulator Central Command'
                      : 'Launch Institution Dashboard'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

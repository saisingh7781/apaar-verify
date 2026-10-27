/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, AdmissionCategory } from '../types.ts';
import { X, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { isValidApaarId } from '../utils/validation.ts';

interface EditStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: string, updates: Partial<Student>) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !student) return null;

  const [apaarId, setApaarId] = useState(student.apaar_id);
  const [studentId, setStudentId] = useState(student.student_id);
  const [fullName, setFullName] = useState(student.full_name);
  const [program, setProgram] = useState(student.program);
  const [admissionCategory, setAdmissionCategory] = useState<AdmissionCategory>(student.admission_category);
  const [admissionYear, setAdmissionYear] = useState(student.admission_year);

  const apaarValidation = isValidApaarId(apaarId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(student.id, {
      apaar_id: apaarId,
      student_id: studentId,
      full_name: fullName,
      program,
      admission_category: admissionCategory,
      admission_year: admissionYear
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="edit-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 id="edit-dialog-title" className="font-bold text-base text-slate-900">
              Edit & Correct Student Record
            </h3>
            <p className="text-xs text-slate-500">Resolve format errors or update national APAAR ID registry</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Current Status Callout */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <div className="mt-0.5">
              {student.validation_status === 'Valid' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <div className="text-xs">
              <span className="font-semibold text-slate-700">Current Status: </span>
              <strong
                className={
                  student.validation_status === 'Valid'
                    ? 'text-emerald-700'
                    : student.validation_status === 'Duplicate'
                    ? 'text-rose-700'
                    : 'text-amber-700'
                }
              >
                {student.validation_status}
              </strong>
              {student.validation_notes && (
                <p className="text-slate-500 mt-0.5 text-[11px]">{student.validation_notes}</p>
              )}
            </div>
          </div>

          {/* APAAR ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              National APAAR / ABC ID (12 Digits) *
            </label>
            <input
              type="text"
              value={apaarId}
              onChange={(e) => setApaarId(e.target.value)}
              placeholder="e.g. 123456789012"
              maxLength={14}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-700"
            />
            {apaarId.length > 0 && (
              <div className="mt-1 text-[11px]">
                {apaarValidation.valid ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3" /> Formatted: {apaarValidation.formatted} (Valid 12-digit format)
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3" /> {apaarValidation.error}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Full Name & Student ID (Roll No) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name (Matches Aadhaar) *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Roll No *
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-700"
              />
            </div>
          </div>

          {/* Program */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Degree Program / Discipline *
            </label>
            <input
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
            />
          </div>

          {/* Category & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Category *
              </label>
              <select
                value={admissionCategory}
                onChange={(e) => setAdmissionCategory(e.target.value as AdmissionCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-teal-700 cursor-pointer"
              >
                <option value="Regular">Regular</option>
                <option value="NRI">NRI Quota</option>
                <option value="OCI">OCI</option>
                <option value="Foreign National">Foreign National</option>
                <option value="Supernumerary">Supernumerary (PMSSS/Sports)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Year
              </label>
              <input
                type="number"
                value={admissionYear}
                onChange={(e) => setAdmissionYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-teal-700"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Revalidate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

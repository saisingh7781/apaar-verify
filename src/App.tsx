/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { apiService, UserSession, VerificationResult } from './services/apiService.ts';
import { Institution, Student, AccessAuditLog, UserRole } from './types.ts';
import { Navbar, ScreenId } from './components/Navbar.tsx';
import { DemoModeBar } from './components/DemoModeBar.tsx';
import { StudentAlertToast } from './components/StudentAlertToast.tsx';
import { FrontLandingPage } from './components/screens/FrontLandingPage.tsx';
import { LoginPage } from './components/screens/LoginPage.tsx';
import { StudentPortal } from './components/screens/StudentPortal.tsx';
import { InstitutionDashboard } from './components/screens/InstitutionDashboard.tsx';
import { StudentUploadPage } from './components/screens/StudentUploadPage.tsx';
import { ValidationResultsTable } from './components/screens/ValidationResultsTable.tsx';
import { IntakeMonitoringScreen } from './components/screens/IntakeMonitoringScreen.tsx';
import { AicteCentralDashboard } from './components/screens/AicteCentralDashboard.tsx';
import { VerificationAuditScreen } from './components/screens/VerificationAuditScreen.tsx';
import { ReportsPage } from './components/screens/ReportsPage.tsx';
import { AdminSecurityPage } from './components/screens/AdminSecurityPage.tsx';
import { AuditLedgerScreen } from './components/screens/AuditLedgerScreen.tsx';
import { ApaarSahayakChat } from './components/widgets/ApaarSahayakChat.tsx';
import { BreadcrumbNav } from './components/BreadcrumbNav.tsx';
import { getScreenLabel } from './utils/breadcrumbs.ts';
import { SAMPLE_BATCH_CSV } from './data/seedData.ts';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(apiService.getCurrentUser());
  // Default entry screen is the Front Landing Page (/)
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('landing');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>([]);
  const [loginRoleTarget, setLoginRoleTarget] = useState<UserRole>('institution_admin');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('inst-1');
  const [institutions, setInstitutions] = useState<Institution[]>(apiService.getInstitutions());
  const [students, setStudents] = useState<Student[]>(apiService.getStudents());
  const [auditLogs, setAuditLogs] = useState<AccessAuditLog[]>(apiService.getAuditLogs());
  const [activeAlert, setActiveAlert] = useState<VerificationResult | null>(null);
  const [rbacMessage, setRbacMessage] = useState<string | null>(null);

  // Sync state helper
  const refreshState = () => {
    setInstitutions(apiService.getInstitutions());
    setStudents(apiService.getStudents());
    setAuditLogs(apiService.getAuditLogs());
    setCurrentUser(apiService.getCurrentUser());
  };

  useEffect(() => {
    refreshState();
    // Subscribe to real-time verification alerts
    const unsubscribe = apiService.onAlertDispatched((result) => {
      setActiveAlert(result);
      setAuditLogs(apiService.getAuditLogs());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Listen for browser back/forward popstate
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.screen) {
        setCurrentScreen(event.state.screen);
        setScreenHistory((prev) => prev.slice(0, -1));
        setRbacMessage(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Set current screen and push to navigation stack
  const navigateTo = (targetScreen: ScreenId, pushToHistory = true) => {
    if (targetScreen === currentScreen) return;
    if (pushToHistory) {
      setScreenHistory((prev) => [...prev, currentScreen]);
      try {
        window.history.pushState({ screen: targetScreen }, '', `#${targetScreen}`);
      } catch {
        // ignore in iframe contexts
      }
    }
    setCurrentScreen(targetScreen);
    setRbacMessage(null);
  };

  // Back navigation handler (pops stack or uses browser history fallback)
  const handleBack = () => {
    if (screenHistory.length > 0) {
      const nextHistory = [...screenHistory];
      const previousScreen = nextHistory.pop()!;
      setScreenHistory(nextHistory);
      setCurrentScreen(previousScreen);
      setRbacMessage(null);
      try {
        window.history.replaceState({ screen: previousScreen }, '', `#${previousScreen}`);
      } catch {
        // ignore
      }
    } else if (currentScreen !== 'landing') {
      setCurrentScreen('landing');
      setRbacMessage(null);
      try {
        window.history.replaceState({ screen: 'landing' }, '', '#landing');
      } catch {
        // ignore
      }
    } else {
      try {
        window.history.back();
      } catch {
        // ignore
      }
    }
  };

  // Handle Role Switch from Demo Mode Toolbar
  const handleRoleSwitch = (role: UserRole, targetId?: string) => {
    let session: UserSession;
    if (role === 'student') {
      session = apiService.loginAsStudent(targetId || '123456789012');
      navigateTo('student-portal');
    } else if (role === 'aicte_regulator') {
      session = apiService.login('aicte_regulator');
      navigateTo('aicte-central');
    } else {
      session = apiService.login('institution_admin', targetId || 'inst-1');
      setSelectedInstitutionId(targetId || 'inst-1');
      navigateTo('institution-dashboard');
    }
    setCurrentUser(session);
    setRbacMessage(null);
    refreshState();
  };

  // RBAC Protected Navigation Router
  const handleNavigateWithRBAC = (screen: ScreenId) => {
    setRbacMessage(null);

    // Public routes (Always accessible)
    if (screen === 'landing' || screen === 'verification-audit' || screen === 'admin-security' || screen === 'audit-ledger') {
      navigateTo(screen);
      return;
    }

    if (screen === 'login') {
      navigateTo('login');
      return;
    }

    // Role-specific protection checks
    if (screen === 'institution-dashboard' || screen === 'student-upload') {
      if (!currentUser) {
        setLoginRoleTarget('institution_admin');
        setRbacMessage('Authentication Required: Please sign in as an authorized College Administrator.');
        navigateTo('login');
        return;
      }
      if (currentUser.role !== 'institution_admin') {
        setRbacMessage(`Access Denied: Your current persona (${currentUser.role}) does not have Institution Admin privileges.`);
        return;
      }
      navigateTo(screen);
      return;
    }

    if (screen === 'aicte-central') {
      if (!currentUser) {
        setLoginRoleTarget('aicte_regulator');
        setRbacMessage('Authentication Required: Please sign in with AICTE Central Regulatory credentials.');
        navigateTo('login');
        return;
      }
      if (currentUser.role !== 'aicte_regulator') {
        setRbacMessage(`Access Denied: AICTE Central Command is restricted to national regulators. Current persona: ${currentUser.role}`);
        return;
      }
      navigateTo(screen);
      return;
    }

    if (screen === 'student-portal') {
      if (!currentUser) {
        setLoginRoleTarget('student');
        setRbacMessage('Authentication Required: Please sign in with your 12-digit APAAR ID.');
        navigateTo('login');
        return;
      }
      if (currentUser.role !== 'student') {
        // If an institution admin or regulator wants to view student portal, auto-switch persona or allow with Aarav
        apiService.loginAsStudent('123456789012');
        refreshState();
      }
      navigateTo('student-portal');
      return;
    }

    // Default route allowance
    navigateTo(screen);
  };

  // Demo: Simulate Instant Batch Upload
  const handleSimulateUpload = () => {
    const result = apiService.uploadBatch(selectedInstitutionId, SAMPLE_BATCH_CSV);
    refreshState();
    navigateTo('validation-results');
  };

  // Demo: Simulate External Verification & Student SMS Alert
  const handleSimulateVerify = () => {
    const result = apiService.verifyCredential(
      '1234-5678-9012',
      'Tata Consultancy Services (TCS) Campus Verification Desk',
      '14.143.190.45'
    );
    setActiveAlert(result);
    setAuditLogs(apiService.getAuditLogs());
  };

  // Demo: Reset Database back to initial seed
  const handleResetData = () => {
    if (confirm('Reset database back to initial seed data?')) {
      apiService.resetSeedData();
      refreshState();
      setSelectedInstitutionId('inst-1');
    }
  };

  const handleUpdateStudent = (studentId: string, updates: Partial<Student>) => {
    apiService.updateStudent(studentId, updates);
    refreshState();
  };

  const handleDeleteStudent = (studentId: string) => {
    apiService.deleteStudent(studentId);
    refreshState();
  };

  const activeInstitution = institutions.find((i) => i.id === selectedInstitutionId) || institutions[0];
  const activeIntake = activeInstitution ? apiService.getIntakeCheck(activeInstitution.id) : null;
  const activeStudent = currentUser?.student_apaar_id
    ? students.find((s) => s.apaar_id === currentUser.student_apaar_id)
    : students[0];

  // Stats for badge alerts
  const duplicateCount = students.filter((s) => s.validation_status === 'Duplicate').length;
  const isAnyBreached = institutions.some((i) => {
    const intake = apiService.getIntakeCheck(i.id);
    return intake.is_exceeded;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-700 selection:text-white">
      {/* 1. Global Demo Mode Toolbar */}
      <DemoModeBar
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        onSwitchToGuest={() => {
          apiService.logout();
          setCurrentUser(null);
          setRbacMessage(null);
          setCurrentScreen('landing');
        }}
        onNavigateLanding={() => {
          setRbacMessage(null);
          setCurrentScreen('landing');
        }}
        onSimulateUpload={handleSimulateUpload}
        onSimulateVerify={handleSimulateVerify}
        onResetData={handleResetData}
      />

      {/* 2. Main Navigation Bar */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={handleNavigateWithRBAC}
        currentUser={currentUser}
        onLogout={() => {
          apiService.logout();
          setCurrentUser(null);
          setCurrentScreen('landing');
        }}
        stats={{
          duplicateCount,
          intakeBreached: isAnyBreached
        }}
      />

      {/* RBAC Notice / Feedback Toast */}
      {rbacMessage && (
        <div className="max-w-7xl mx-auto px-4 pt-4 w-full">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{rbacMessage}</span>
            </div>
            <button
              onClick={() => setRbacMessage(null)}
              className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. Screen Views Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Hierarchical Breadcrumb Navigation with Back button */}
        <BreadcrumbNav
          currentScreen={currentScreen}
          currentUser={currentUser}
          activeInstitution={activeInstitution}
          activeStudentName={activeStudent?.full_name}
          institutions={institutions}
          onNavigate={handleNavigateWithRBAC}
          onSelectInstitution={setSelectedInstitutionId}
          onBack={handleBack}
          canGoBack={currentScreen !== 'landing' || screenHistory.length > 0}
          previousScreenLabel={
            screenHistory.length > 0
              ? getScreenLabel(screenHistory[screenHistory.length - 1])
              : (currentScreen !== 'landing' ? 'Home' : undefined)
          }
        />

        {/* Entry Public Landing Page (/) */}
        {currentScreen === 'landing' && (
          <FrontLandingPage
            onNavigateToLogin={(role) => {
              setLoginRoleTarget(role);
              navigateTo('login');
            }}
            onNavigateToPortal={(role) => {
              handleRoleSwitch(role);
            }}
            onTriggerAlert={(res) => setActiveAlert(res)}
            institutions={institutions}
            students={students}
          />
        )}

        {/* Portal Login Page */}
        {currentScreen === 'login' && (
          <LoginPage
            initialRole={loginRoleTarget}
            onLoginSuccess={(session) => {
              setCurrentUser(session);
              setRbacMessage(null);
              if (session.role === 'aicte_regulator') {
                navigateTo('aicte-central');
              } else if (session.role === 'student') {
                navigateTo('student-portal');
              } else {
                if (session.institution_id) setSelectedInstitutionId(session.institution_id);
                navigateTo('institution-dashboard');
              }
              refreshState();
            }}
            institutions={institutions}
            students={students}
          />
        )}

        {/* Citizen / Student Portal */}
        {currentScreen === 'student-portal' && (
          <StudentPortal
            currentUser={currentUser}
            students={students}
            institutions={institutions}
            auditLogs={auditLogs}
            onSelectStudent={(apaarId) => {
              apiService.loginAsStudent(apaarId);
              refreshState();
            }}
          />
        )}

        {/* Institution Dashboard */}
        {currentScreen === 'institution-dashboard' && activeInstitution && activeIntake && (
          <InstitutionDashboard
            institution={activeInstitution}
            students={students}
            intakeAnalysis={activeIntake}
            onNavigate={handleNavigateWithRBAC}
            institutions={institutions}
            onSelectInstitution={setSelectedInstitutionId}
          />
        )}

        {/* Student Batch Upload */}
        {currentScreen === 'student-upload' && activeInstitution && (
          <StudentUploadPage
            institution={activeInstitution}
            institutions={institutions}
            onSelectInstitution={setSelectedInstitutionId}
            onUploadSuccess={refreshState}
            onNavigate={handleNavigateWithRBAC}
          />
        )}

        {/* Validation Results Table */}
        {currentScreen === 'validation-results' && (
          <ValidationResultsTable
            students={students}
            institutions={institutions}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            selectedInstitutionId={currentUser?.role === 'institution_admin' ? selectedInstitutionId : undefined}
            onSelectInstitution={setSelectedInstitutionId}
          />
        )}

        {/* Intake Monitoring Screen */}
        {currentScreen === 'intake-monitoring' && (
          <IntakeMonitoringScreen
            institutions={institutions}
            students={students}
            selectedInstitutionId={selectedInstitutionId}
            onSelectInstitution={setSelectedInstitutionId}
          />
        )}

        {/* AICTE Central Regulator Dashboard */}
        {currentScreen === 'aicte-central' && (
          <AicteCentralDashboard
            institutions={institutions}
            students={students}
            onNavigate={handleNavigateWithRBAC}
            onSelectInstitution={(id) => {
              setSelectedInstitutionId(id);
            }}
          />
        )}

        {/* Credential Verification & Access Audit */}
        {currentScreen === 'verification-audit' && (
          <VerificationAuditScreen
            students={students}
            auditLogs={auditLogs}
            onTriggerAlert={(res) => setActiveAlert(res)}
          />
        )}

        {/* Compliance Reports & Data Queries */}
        {currentScreen === 'reports' && (
          <ReportsPage
            institutions={institutions}
            students={students}
          />
        )}

        {/* Ghost Student Audit Screen */}
        {currentScreen === 'ghost-audit' && (
          <IntakeMonitoringScreen
            institutions={institutions}
            students={students}
            selectedInstitutionId={selectedInstitutionId}
            onSelectInstitution={setSelectedInstitutionId}
            initialTab="ghost-audit"
          />
        )}

        {/* Cryptographic Blockchain Audit Ledger */}
        {currentScreen === 'audit-ledger' && (
          <AuditLedgerScreen />
        )}

        {/* Admin, Security & SQL Seeder Blueprint */}
        {currentScreen === 'admin-security' && (
          <AdminSecurityPage />
        )}
      </main>

      {/* 4. Real-Time Student Access Alert Notification Pop-up */}
      <StudentAlertToast
        alert={activeAlert}
        onClose={() => setActiveAlert(null)}
        onNavigateToAudit={() => setCurrentScreen('verification-audit')}
      />

      {/* 5. Floating Multilingual Assistant Widget */}
      <ApaarSahayakChat />

      {/* 6. Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              All India Council for Technical Education (AICTE)
            </span>
            <span>•</span>
            <span className="text-slate-600">Academic Bank of Credits (ABC) & APAAR Registry</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Multi-Role RBAC • Explainable Verification Panel • What-If Intake Simulator • Evidence Passport • Case Adjudication Desk
          </div>
        </div>
      </footer>
    </div>
  );
}

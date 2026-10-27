/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Institution,
  Student,
  AccessAuditLog,
  CourseCredit,
  CreditTransferRequest,
  GhostStudentMetric,
  AuditBlock,
  DuplicateCase,
  ExceptionItem,
  TimelineEvent
} from '../types.ts';
import { createAuditBlock } from '../utils/security.ts';

export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1',
    aicte_id: 'AICTE-TN-042',
    name: 'Madras Institute of Technology, Chennai',
    state: 'Tamil Nadu',
    approved_intake: 120,
    programs: [
      'B.Tech Aeronautical Engineering',
      'B.Tech Computer Science & Engineering',
      'B.Tech Information Technology',
      'B.Tech Electronics & Communication',
      'B.Tech Artificial Intelligence & Data Science'
    ]
  },
  {
    id: 'inst-2',
    aicte_id: 'AICTE-TN-001',
    name: 'College of Engineering Guindy, Anna University',
    state: 'Tamil Nadu',
    approved_intake: 180,
    programs: [
      'B.Tech Computer Science & Engineering',
      'B.Tech Electrical & Electronics Engineering',
      'B.Tech Mechanical Engineering',
      'B.Tech Civil Engineering',
      'B.Tech Biomedical Engineering'
    ]
  },
  {
    id: 'inst-3',
    aicte_id: 'AICTE-TN-015',
    name: 'PSG College of Technology, Coimbatore',
    state: 'Tamil Nadu',
    approved_intake: 90,
    programs: [
      'B.Tech Mechanical Engineering',
      'B.Tech Robotics and Automation',
      'B.Tech Metallurgical Engineering',
      'B.Tech Production Engineering'
    ]
  }
];

// Seed 22 students demonstrating Valid, Duplicate, Intake Breach, and Formatting Warnings
export const INITIAL_STUDENTS: Student[] = [
  // MIT Chennai (120 intake) - Valid records
  {
    id: 'stud-mit-01',
    apaar_id: '123456789012',
    student_id: 'MIT-2026-CSE-001',
    full_name: 'Aarav Ramanathan',
    program: 'B.Tech Computer Science & Engineering',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-1',
    validation_status: 'Valid',
    validation_notes: 'Verified: 12-digit APAAR valid, matches Aadhaar e-KYC record',
    created_at: '2026-08-15T10:30:00Z',
    contact_masked: '+91 98*** **412'
  },
  {
    id: 'stud-mit-02',
    apaar_id: '234567890123',
    student_id: 'MIT-2026-CSE-002',
    full_name: 'Kavya Sundaram',
    program: 'B.Tech Computer Science & Engineering',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-1',
    validation_status: 'Valid',
    validation_notes: 'Verified: 12-digit APAAR valid, no duplicate detected',
    created_at: '2026-08-15T10:32:00Z',
    contact_masked: '+91 94*** **823'
  },
  {
    id: 'stud-mit-03',
    apaar_id: '345678901234',
    student_id: 'MIT-2026-AERO-014',
    full_name: 'Rohan Venkatesh',
    program: 'B.Tech Aeronautical Engineering',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-1',
    validation_status: 'Valid',
    validation_notes: 'Verified: 12-digit APAAR valid, no duplicate detected',
    created_at: '2026-08-15T11:00:00Z',
    contact_masked: '+91 87*** **345'
  },
  {
    id: 'stud-mit-04',
    apaar_id: '456789012345',
    student_id: 'MIT-2026-AI-008',
    full_name: 'Ananya Karthikeyan',
    program: 'B.Tech Artificial Intelligence & Data Science',
    admission_year: 2026,
    admission_category: 'NRI',
    institution_id: 'inst-1',
    validation_status: 'Valid',
    validation_notes: 'Verified: NRI quota verified with MEA passport cross-link',
    created_at: '2026-08-16T09:15:00Z',
    contact_masked: '+91 91*** **902'
  },

  // DUPLICATE ALERT PAIR: Exactly same APAAR ID registered at MIT Chennai AND CEG Anna University
  {
    id: 'stud-dup-01',
    apaar_id: '548291037462',
    student_id: 'MIT-2026-IT-022',
    full_name: 'Siddharth Natarajan',
    program: 'B.Tech Information Technology',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-1',
    validation_status: 'Duplicate',
    validation_notes: 'CRITICAL DUPLICATE: APAAR 5482-9103-7462 also registered at College of Engineering Guindy (Roll: CEG-2026-CSE-091)',
    created_at: '2026-08-17T14:20:00Z',
    contact_masked: '+91 97*** **114'
  },
  {
    id: 'stud-dup-02',
    apaar_id: '548291037462',
    student_id: 'CEG-2026-CSE-091',
    full_name: 'Siddharth Natarajan',
    program: 'B.Tech Computer Science & Engineering',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-2',
    validation_status: 'Duplicate',
    validation_notes: 'CRITICAL DUPLICATE: APAAR 5482-9103-7462 also registered at Madras Institute of Technology (Roll: MIT-2026-IT-022)',
    created_at: '2026-08-18T16:05:00Z',
    contact_masked: '+91 97*** **114'
  },

  // CEG Anna University (180 intake) - Valid & Supernumerary
  {
    id: 'stud-ceg-01',
    apaar_id: '678901234567',
    student_id: 'CEG-2026-ECE-012',
    full_name: 'Priyanka Subramanian',
    program: 'B.Tech Electrical & Electronics Engineering',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-2',
    validation_status: 'Valid',
    validation_notes: 'Verified: 12-digit APAAR valid, no duplicate detected',
    created_at: '2026-08-18T10:00:00Z',
    contact_masked: '+91 96*** **765'
  },
  {
    id: 'stud-ceg-02',
    apaar_id: '789012345678',
    student_id: 'CEG-2026-MECH-045',
    full_name: 'Aditya Balasubramanian',
    program: 'B.Tech Mechanical Engineering',
    admission_year: 2026,
    admission_category: 'Supernumerary',
    institution_id: 'inst-2',
    validation_status: 'Valid',
    validation_notes: 'Verified: Supernumerary (PMSSS/Sports quota verified)',
    created_at: '2026-08-19T11:45:00Z',
    contact_masked: '+91 80*** **555'
  },
  {
    id: 'stud-ceg-03',
    apaar_id: '890123456789',
    student_id: 'CEG-2026-CIVIL-019',
    full_name: 'Meera Krishnan',
    program: 'B.Tech Civil Engineering',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-2',
    validation_status: 'Valid',
    validation_notes: 'Verified: 12-digit APAAR valid, no duplicate detected',
    created_at: '2026-08-20T12:30:00Z',
    contact_masked: '+91 93*** **219'
  },

  // WARNING RECORDS: Missing or Truncated 10-digit APAAR format
  {
    id: 'stud-warn-01',
    apaar_id: '8839201948', // 10 digits instead of 12!
    student_id: 'MIT-2026-ECE-031',
    full_name: 'Varun Swaminathan',
    program: 'B.Tech Electronics & Communication',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-1',
    validation_status: 'Warning',
    validation_notes: 'FORMAT ERROR: APAAR ID must be exactly 12 digits (found 10 digits). Student submitted legacy Aadhaar reference or truncated ID.',
    created_at: '2026-08-21T08:10:00Z',
    contact_masked: '+91 95*** **441'
  },
  {
    id: 'stud-warn-02',
    apaar_id: '', // Missing APAAR ID!
    student_id: 'MIT-2026-CSE-089',
    full_name: 'Harini Jayaraman',
    program: 'B.Tech Computer Science & Engineering',
    admission_year: 2026,
    admission_category: 'Regular',
    institution_id: 'inst-1',
    validation_status: 'Needs Review',
    validation_notes: 'MISSING IDENTIFIER: APAAR ID is missing or pending e-KYC consent from student.',
    created_at: '2026-08-22T09:40:00Z',
    contact_masked: '+91 99*** **123'
  },

  // PSG COLLEGE OF TECHNOLOGY (Approved Intake: 90)
  // We seed 95 students to actively trigger the Capacity Exceeded Warning Banner (95 > 90)
  ...Array.from({ length: 95 }, (_, i) => {
    const num = i + 1;
    const isSpecial = num === 91 || num === 92 || num === 93 || num === 94 || num === 95;
    return {
      id: `stud-psg-${String(num).padStart(3, '0')}`,
      apaar_id: `9100${String(num).padStart(4, '0')}${String(1000 + num).slice(-4)}`,
      student_id: `PSG-2026-ENG-${String(num).padStart(3, '0')}`,
      full_name: [
        'Karthik Selvam', 'Divya Murugan', 'Manoj Kumar', 'Sneha Radhakrishnan', 'Naveen Rajan',
        'Ishwarya Prabhu', 'Vigneshwaran M', 'Swetha Srinivasan', 'Gokul Chandran', 'Preethi V'
      ][i % 10] + (num > 10 ? ` ${Math.floor(num / 10)}` : ''),
      program: num <= 45 ? 'B.Tech Mechanical Engineering' : (num <= 80 ? 'B.Tech Robotics and Automation' : 'B.Tech Metallurgical Engineering'),
      admission_year: 2026,
      admission_category: (num % 15 === 0 ? 'NRI' : (num % 20 === 0 ? 'Supernumerary' : 'Regular')) as any,
      institution_id: 'inst-3',
      validation_status: 'Valid' as const,
      validation_notes: isSpecial 
        ? `CAPACITY WARNING: Enrolled under excess quota beyond sanctioned batch limit of 90.` 
        : 'Verified: 12-digit APAAR valid, no duplicate detected',
      created_at: `2026-08-${String(10 + Math.min(i, 20)).padStart(2, '0')}T10:00:00Z`,
      contact_masked: `+91 98*** **${String(100 + (num * 7) % 900).slice(0, 3)}`
    };
  })
];

export const INITIAL_AUDIT_LOGS: AccessAuditLog[] = [
  {
    log_id: 'log-001',
    apaar_id: '123456789012',
    verifier_entity: 'Tata Consultancy Services (TCS) Campus Verification Desk',
    access_timestamp: '2026-10-25 14:22:10 UTC',
    ip_address: '14.143.190.45',
    alert_dispatched: true,
    student_name: 'Aarav Ramanathan',
    institution_name: 'Madras Institute of Technology, Chennai'
  },
  {
    log_id: 'log-002',
    apaar_id: '234567890123',
    verifier_entity: 'Amazon Web Services (AWS) India Talent Acquisition',
    access_timestamp: '2026-10-25 15:45:32 UTC',
    ip_address: '52.95.120.12',
    alert_dispatched: true,
    student_name: 'Kavya Sundaram',
    institution_name: 'Madras Institute of Technology, Chennai'
  },
  {
    log_id: 'log-003',
    apaar_id: '678901234567',
    verifier_entity: 'Anna University Academic Transcript Cell',
    access_timestamp: '2026-10-26 09:12:04 UTC',
    ip_address: '103.246.40.18',
    alert_dispatched: true,
    student_name: 'Priyanka Subramanian',
    institution_name: 'College of Engineering Guindy, Anna University'
  },
  {
    log_id: 'log-004',
    apaar_id: '789012345678',
    verifier_entity: 'National Board of Accreditation (NBA) Audit Team',
    access_timestamp: '2026-10-26 11:30:18 UTC',
    ip_address: '164.100.80.201',
    alert_dispatched: true,
    student_name: 'Aditya Balasubramanian',
    institution_name: 'College of Engineering Guindy, Anna University'
  }
];

export const SAMPLE_BATCH_CSV = `apaar_id,student_id,full_name,program,admission_year,admission_category
981273645019,MIT-2026-CSE-105,Devika Ranganathan,B.Tech Computer Science & Engineering,2026,Regular
449102837461,MIT-2026-CSE-106,Bhuvanesh Waran,B.Tech Computer Science & Engineering,2026,Regular
548291037462,MIT-2026-CSE-107,Siddharth Natarajan,B.Tech Computer Science & Engineering,2026,Regular
301928475610,MIT-2026-IT-049,Shreya Pattabiraman,B.Tech Information Technology,2026,Regular
8839201948,MIT-2026-IT-050,Varun Swaminathan,B.Tech Information Technology,2026,Regular
710293846519,MIT-2026-AERO-025,Tanvi Deshmukh,B.Tech Aeronautical Engineering,2026,Regular
829103847561,MIT-2026-AERO-026,Nikhil Chidambaram,B.Tech Aeronautical Engineering,2026,Supernumerary
192837465019,MIT-2026-AI-019,Deepak Srinivas,B.Tech Artificial Intelligence & Data Science,2026,Regular`;

export const SQL_SCHEMA_DDL = `-- ====================================================================
-- AICTE APAAR ID-BASED STUDENT DATA MANAGEMENT & VERIFICATION PLATFORM
-- PostgreSQL Relational Schema Blueprint
-- ====================================================================

-- 1. institutions Table
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aicte_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    approved_intake INTEGER NOT NULL CHECK (approved_intake > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apaar_id VARCHAR(12) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    program VARCHAR(100) NOT NULL,
    admission_year INTEGER NOT NULL,
    admission_category VARCHAR(50) NOT NULL CHECK (
        admission_category IN ('Regular', 'NRI', 'OCI', 'Foreign National', 'Supernumerary')
    ),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    validation_status VARCHAR(50) DEFAULT 'Pending' CHECK (
        validation_status IN ('Pending', 'Valid', 'Warning', 'Duplicate', 'Needs Review')
    ),
    validation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast lookups & duplicate detection
CREATE INDEX IF NOT EXISTS idx_students_apaar_id ON students(apaar_id);
CREATE INDEX IF NOT EXISTS idx_students_institution_id ON students(institution_id);
CREATE INDEX IF NOT EXISTS idx_students_program ON students(program);

-- 3. access_audit_logs Table (Security & Custom Alert Ledger)
CREATE TABLE IF NOT EXISTS access_audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apaar_id VARCHAR(12) NOT NULL,
    verifier_entity VARCHAR(255) NOT NULL,
    access_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL,
    alert_dispatched BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_apaar_id ON access_audit_logs(apaar_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON access_audit_logs(access_timestamp DESC);
`;

export const PYTHON_FASTAPI_CODE = `"""
AICTE APAAR ID-Based Student Data Management and Verification Backend
Stack: Python 3.11 + FastAPI + SQLAlchemy + Pandas + Redis
"""

import os
import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
import pandas as pd

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://aicte_admin:secret@localhost:5432/aicte_apaar_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Models
class Institution(Base):
    __tablename__ = "institutions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aicte_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False)
    approved_intake = Column(Integer, nullable=False)
    students = relationship("Student", back_populates="institution")

class Student(Base):
    __tablename__ = "students"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    apaar_id = Column(String(12), nullable=False, index=True)
    student_id = Column(String(100), nullable=False)
    full_name = Column(String(255), nullable=False)
    program = Column(String(100), nullable=False)
    admission_year = Column(Integer, nullable=False)
    admission_category = Column(String(50), nullable=False)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=False)
    validation_status = Column(String(50), default="Pending", nullable=False)
    institution = relationship("Institution", back_populates="students")

class AccessAuditLog(Base):
    __tablename__ = "access_audit_logs"
    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    apaar_id = Column(String(12), nullable=False, index=True)
    verifier_entity = Column(String(255), nullable=False)
    access_timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    ip_address = Column(String(45), nullable=False)
    alert_dispatched = Column(Boolean, default=False, nullable=False)

app = FastAPI(title="AICTE APAAR Student Verification Platform API", version="1.0.0")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Background Task: Student Alert Service
async def dispatch_student_alert_sms(apaar_id: str, verifier_entity: str, timestamp_str: str, log_id: uuid.UUID):
    """
    Asynchronously triggers the Student Alert Service simulating SMS/Email dispatch.
    Message format:
    'Alert: Your APAAR academic record was accessed by [Verifier Name] on [Timestamp].
     If this wasn't you, report it immediately to AICTE support.'
    """
    message = (
        f"Alert: Your APAAR academic record was accessed by {verifier_entity} on {timestamp_str}. "
        "If this wasn't you, report it immediately to AICTE support."
    )
    print(f"[SMS/Email Gateway] Dispatched to registered mobile of APAAR {apaar_id}: {message}")
    # Update audit record to confirm alert dispatch
    with SessionLocal() as db:
        log_entry = db.query(AccessAuditLog).filter(AccessAuditLog.log_id == log_id).first()
        if log_entry:
            log_entry.alert_dispatched = True
            db.commit()

# Endpoint 1: POST /api/v1/auth/login
@app.post("/api/v1/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Issues JWT token with claims: role (institution_admin or aicte_regulator)
    role = "aicte_regulator" if "aicte" in form_data.username.lower() else "institution_admin"
    return {
        "access_token": f"mock_jwt_token_{role}_{uuid.uuid4().hex[:8]}",
        "token_type": "bearer",
        "role": role,
        "username": form_data.username
    }

# Endpoint 2: POST /api/v1/students/upload-batch
@app.post("/api/v1/students/upload-batch")
async def upload_batch(
    institution_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    df = pd.read_csv(file.file)
    required_cols = {"apaar_id", "student_id", "full_name", "program", "admission_year", "admission_category"}
    if not required_cols.issubset(df.columns):
        raise HTTPException(status_code=400, detail="Missing required CSV columns")

    results = []
    for _, row in df.iterrows():
        clean_apaar = str(row["apaar_id"]).strip().replace("-", "")
        # Automated Duplicate Check across all colleges
        existing = db.query(Student).filter(Student.apaar_id == clean_apaar).first()
        status = "Duplicate" if existing else ("Valid" if len(clean_apaar) == 12 else "Warning")
        
        student = Student(
            apaar_id=clean_apaar,
            student_id=str(row["student_id"]),
            full_name=str(row["full_name"]),
            program=str(row["program"]),
            admission_year=int(row["admission_year"]),
            admission_category=str(row["admission_category"]),
            institution_id=institution_id,
            validation_status=status
        )
        db.add(student)
        results.append({"apaar_id": clean_apaar, "status": status})
    db.commit()
    return {"message": "Batch processed successfully", "total_processed": len(results), "records": results}

# Endpoint 3: GET /api/v1/monitoring/intake-check/{institution_id}
@app.get("/api/v1/monitoring/intake-check/{institution_id}")
def check_intake(institution_id: uuid.UUID, db: Session = Depends(get_db)):
    institution = db.query(Institution).filter(Institution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    enrolled_count = db.query(func.count(Student.id)).filter(Student.institution_id == institution_id).scalar()
    program_counts = db.query(Student.program, func.count(Student.id)).filter(
        Student.institution_id == institution_id
    ).group_by(Student.program).all()
    
    is_exceeded = enrolled_count > institution.approved_intake
    return {
        "institution_name": institution.name,
        "aicte_id": institution.aicte_id,
        "approved_intake": institution.approved_intake,
        "actual_admissions": enrolled_count,
        "capacity_exceeded": is_exceeded,
        "excess_count": enrolled_count - institution.approved_intake if is_exceeded else 0,
        "utilization_percentage": round((enrolled_count / institution.approved_intake) * 100, 2),
        "program_breakdown": {p: c for p, c in program_counts}
    }

# Endpoint 4: POST /api/v1/verify/credential
class VerificationRequest(BaseModel):
    apaar_id: str
    verifier_entity: str
    ip_address: Optional[str] = "127.0.0.1"

@app.post("/api/v1/verify/credential")
def verify_credential(
    payload: VerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    clean_apaar = payload.apaar_id.strip().replace("-", "")
    student = db.query(Student).filter(Student.apaar_id == clean_apaar).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student APAAR record not found")

    now = datetime.datetime.utcnow()
    log_id = uuid.uuid4()
    audit_entry = AccessAuditLog(
        log_id=log_id,
        apaar_id=clean_apaar,
        verifier_entity=payload.verifier_entity,
        access_timestamp=now,
        ip_address=payload.ip_address,
        alert_dispatched=False
    )
    db.add(audit_entry)
    db.commit()

    # Asynchronously trigger Student Alert Service
    background_tasks.add_task(
        dispatch_student_alert_sms,
        clean_apaar,
        payload.verifier_entity,
        now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        log_id
    )

    return {
        "verified": True,
        "student": {
            "full_name": student.full_name,
            "apaar_id": clean_apaar,
            "program": student.program,
            "institution": student.institution.name,
            "admission_year": student.admission_year,
            "validation_status": student.validation_status
        },
        "audit_log_id": str(log_id),
        "alert_dispatched": True
    }
`;

// --- Seed 1: Academic Bank of Credits (ABC) Course Records ---
export const INITIAL_COURSE_CREDITS: CourseCredit[] = [
  {
    id: 'cred-01',
    course_code: 'CS8251',
    course_name: 'Programming in C & Data Structures',
    semester: 1,
    credits: 4,
    grade: 'O (Outstanding)',
    issuing_university: 'Anna University / MIT Chennai',
    academic_year: '2024-25',
    verified_status: 'Verified',
    verification_hash: 'sha256_e819ac4092b71940194821a8109283719'
  },
  {
    id: 'cred-02',
    course_code: 'MA8151',
    course_name: 'Engineering Mathematics I (Calculus & Linear Algebra)',
    semester: 1,
    credits: 4,
    grade: 'A+ (Excellent)',
    issuing_university: 'Anna University / MIT Chennai',
    academic_year: '2024-25',
    verified_status: 'Verified',
    verification_hash: 'sha256_b10927391094028471920381029482710'
  },
  {
    id: 'cred-03',
    course_code: 'CS8391',
    course_name: 'Data Structures & Algorithms Laboratory',
    semester: 2,
    credits: 4,
    grade: 'O (Outstanding)',
    issuing_university: 'Anna University / MIT Chennai',
    academic_year: '2024-25',
    verified_status: 'Verified',
    verification_hash: 'sha256_c91028374619284719203847102938471'
  },
  {
    id: 'cred-04',
    course_code: 'CS8392',
    course_name: 'Object Oriented Programming & Design Patterns',
    semester: 2,
    credits: 3,
    grade: 'A (Very Good)',
    issuing_university: 'Anna University / MIT Chennai',
    academic_year: '2024-25',
    verified_status: 'Verified',
    verification_hash: 'sha256_a09182736451928374610293847102938'
  },
  {
    id: 'cred-05',
    course_code: 'CS8491',
    course_name: 'Computer Architecture & Microprocessors',
    semester: 3,
    credits: 3,
    grade: 'A+ (Excellent)',
    issuing_university: 'Anna University / MIT Chennai',
    academic_year: '2025-26',
    verified_status: 'Verified',
    verification_hash: 'sha256_f82910384719203847102938471029384'
  },
  {
    id: 'cred-06',
    course_code: 'CS8492',
    course_name: 'Database Management Systems & SQL Internals',
    semester: 3,
    credits: 4,
    grade: 'O (Outstanding)',
    issuing_university: 'Anna University / MIT Chennai',
    academic_year: '2025-26',
    verified_status: 'Verified',
    verification_hash: 'sha256_d10928374619203847102938471029384'
  },
  {
    id: 'cred-07',
    course_code: 'CS8591',
    course_name: 'Computer Networks & Internet Protocols',
    semester: 4,
    credits: 4,
    grade: 'A+ (Excellent)',
    issuing_university: 'Anna University / MIT Chennai',
    academic_year: '2025-26',
    verified_status: 'Verified',
    verification_hash: 'sha256_e01928374619203847102938471029384'
  },
  {
    id: 'cred-08',
    course_code: 'CS8501',
    course_name: 'Theory of Computation & Automata',
    semester: 4,
    credits: 3,
    grade: 'A (Very Good)',
    issuing_university: 'Anna University / MIT Chennai',
    academic_year: '2025-26',
    verified_status: 'Verified',
    verification_hash: 'sha256_b91028374619203847102938471029384'
  }
];

// --- Seed 2: Inter-University Credit Transfer Requests ---
export const INITIAL_TRANSFER_REQUESTS: CreditTransferRequest[] = [
  {
    id: 'trans-001',
    apaar_id: '123456789012',
    student_name: 'Aarav Ramanathan',
    source_institution_id: 'inst-1',
    source_institution_name: 'Madras Institute of Technology, Chennai',
    target_institution_id: 'inst-2',
    target_institution_name: 'College of Engineering Guindy, Anna University',
    target_program: 'B.Tech Computer Science & Engineering (Dual Mobility)',
    requested_at: '2026-10-24 16:30:10 UTC',
    total_credits: 14,
    course_codes: ['CS8491', 'CS8492', 'CS8591', 'CS8501'],
    status: 'Pending Central Approval',
    audit_hash: 'sha256_7a9c8b01e23f456789a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2'
  },
  {
    id: 'trans-002',
    apaar_id: '234567890123',
    student_name: 'Kavya Sundaram',
    source_institution_id: 'inst-1',
    source_institution_name: 'Madras Institute of Technology, Chennai',
    target_institution_id: 'inst-3',
    target_institution_name: 'PSG College of Technology, Coimbatore',
    target_program: 'B.Tech Robotics & Automation (Inter-Disciplinary Exchange)',
    requested_at: '2026-10-22 11:15:00 UTC',
    total_credits: 8,
    course_codes: ['CS8251', 'CS8391'],
    status: 'Approved & Synced',
    audit_hash: 'sha256_4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5'
  },
  {
    id: 'trans-003',
    apaar_id: '548291037462',
    student_name: 'Siddharth Natarajan (Duplicate Alert)',
    source_institution_id: 'inst-1',
    source_institution_name: 'Madras Institute of Technology, Chennai',
    target_institution_id: 'inst-2',
    target_institution_name: 'College of Engineering Guindy, Anna University',
    target_program: 'B.Tech Computer Science & Engineering',
    requested_at: '2026-10-25 09:40:22 UTC',
    total_credits: 24,
    course_codes: ['CS8251', 'MA8151', 'CS8391', 'CS8392', 'CS8491', 'CS8492'],
    status: 'Flagged',
    rejection_reason: 'Flagged: Candidate registered concurrently in regular programs at both source and target institutions.',
    audit_hash: 'sha256_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8'
  }
];

// --- Seed 3: AI Anomaly Detection & Ghost Student / Dropout Metrics ---
export const INITIAL_GHOST_METRICS: GhostStudentMetric[] = [
  {
    student_id: 'MIT-2026-CSE-089',
    apaar_id: '992018274610',
    student_name: 'Harini Jayaraman',
    institution_id: 'inst-1',
    institution_name: 'Madras Institute of Technology, Chennai',
    program: 'B.Tech Computer Science & Engineering',
    admission_year: 2026,
    last_lms_login_days: 78,
    attendance_percentage: 12,
    fee_payment_status: 'Unpaid (Overdue >90d)',
    biometric_verified: false,
    risk_score: 85,
    risk_level: 'Critical / Ghost Admission',
    anomaly_flags: [
      'Zero digital LMS footprint (78 days inactive)',
      'Critical attendance deficit (12% vs 75% required)',
      'Institutional tuition fees overdue > 90 days',
      'Missing Aadhaar biometric campus attendance e-KYC'
    ],
    notice_issued: false
  },
  {
    student_id: 'PSG-2026-ENG-094',
    apaar_id: '910000941094',
    student_name: 'PSG Student 94 (Excess Batch)',
    institution_id: 'inst-3',
    institution_name: 'PSG College of Technology, Coimbatore',
    program: 'B.Tech Robotics and Automation',
    admission_year: 2026,
    last_lms_login_days: 64,
    attendance_percentage: 22,
    fee_payment_status: 'Partial',
    biometric_verified: false,
    risk_score: 75,
    risk_level: 'Critical / Ghost Admission',
    anomaly_flags: [
      'Admitted beyond sanctioned capacity cap of 90 (Unsanctioned excess quota)',
      'Zero digital LMS footprint (64 days inactive)',
      'Critical attendance deficit (22%)',
      'Missing biometric e-KYC validation'
    ],
    notice_issued: false
  },
  {
    student_id: 'CEG-2026-CSE-091',
    apaar_id: '548291037462',
    student_name: 'Siddharth Natarajan',
    institution_id: 'inst-2',
    institution_name: 'College of Engineering Guindy, Anna University',
    program: 'B.Tech Computer Science & Engineering',
    admission_year: 2026,
    last_lms_login_days: 42,
    attendance_percentage: 41,
    fee_payment_status: 'Paid',
    biometric_verified: true,
    risk_score: 65,
    risk_level: 'Critical / Ghost Admission',
    anomaly_flags: [
      'Concurrent multi-college admission conflict detected (MIT & CEG)',
      'Infrequent LMS activity (42 days inactive)',
      'Sub-par attendance warning (41%)'
    ],
    notice_issued: false
  },
  {
    student_id: 'MIT-2026-ECE-031',
    apaar_id: '8839201948',
    student_name: 'Varun Swaminathan',
    institution_id: 'inst-1',
    institution_name: 'Madras Institute of Technology, Chennai',
    program: 'B.Tech Electronics & Communication',
    admission_year: 2026,
    last_lms_login_days: 35,
    attendance_percentage: 58,
    fee_payment_status: 'Paid',
    biometric_verified: false,
    risk_score: 45,
    risk_level: 'Moderate',
    anomaly_flags: [
      'Format error: 10-digit legacy identifier instead of 12-digit standard',
      'Infrequent LMS activity (35 days inactive)',
      'Sub-par attendance warning (58%)'
    ],
    notice_issued: false
  },
  {
    student_id: 'MIT-2026-CSE-001',
    apaar_id: '123456789012',
    student_name: 'Aarav Ramanathan',
    institution_id: 'inst-1',
    institution_name: 'Madras Institute of Technology, Chennai',
    program: 'B.Tech Computer Science & Engineering',
    admission_year: 2026,
    last_lms_login_days: 1,
    attendance_percentage: 95,
    fee_payment_status: 'Paid',
    biometric_verified: true,
    risk_score: 0,
    risk_level: 'Low',
    anomaly_flags: [],
    notice_issued: false
  }
];

// --- Seed 4: Immutable Cryptographic Blockchain Audit Ledger ---
const b0 = createAuditBlock(
  0,
  'GENESIS',
  'AICTE Central Security Root Authority',
  'SYS-GENESIS-ROOT',
  'AICTE APAAR Immutable National Ledger Initialized. Root SHA-256 genesis block stamped.',
  '0'.repeat(64),
  '2026-10-01 00:00:00 UTC',
  104729
);

const b1 = createAuditBlock(
  1,
  'INTAKE_BREACH',
  'National Intake Monitoring Worker',
  'AICTE-TN-015',
  'Sanctioned intake cap breach flagged at PSG College of Technology: 95 students registered vs 90 approved (+5 excess).',
  b0.block_hash,
  '2026-10-10 14:10:05 UTC',
  204911
);

const b2 = createAuditBlock(
  2,
  'DUPLICATE_FLAGGED',
  'Cross-University Deduplication Service',
  '548291037462',
  'Duplicate APAAR conflict stamped: Siddharth Natarajan concurrently registered at MIT Chennai and CEG Anna University.',
  b1.block_hash,
  '2026-10-15 09:22:40 UTC',
  314159
);

const b3 = createAuditBlock(
  3,
  'CONSENT_LOCKED',
  'Citizen Student Portal (Aarav Ramanathan)',
  '123456789012',
  'Student sovereign DPDP consent lock toggled. Third-party automated verification queries blocked.',
  b2.block_hash,
  '2026-10-20 11:05:18 UTC',
  428190
);

const b4 = createAuditBlock(
  4,
  'CREDIT_TRANSFER_REQUEST',
  'Academic Bank of Credits Protocol',
  'trans-001',
  'Inter-University credit transfer request created: 14 ABC credits initiated from MIT Chennai to CEG Anna University for Aarav Ramanathan.',
  b3.block_hash,
  '2026-10-24 16:30:10 UTC',
  539201
);

export const INITIAL_AUDIT_BLOCKS: AuditBlock[] = [b0, b1, b2, b3, b4];

// --- Seed Duplicate Cases (Feature A) ---
export const INITIAL_DUPLICATE_CASES: DuplicateCase[] = [
  {
    id: 'case-dup-01',
    apaar_id: '548291037462',
    candidate_name: 'Siddharth Natarajan',
    severity: 'Critical Cross-College Duplicate',
    status: 'Open Conflict',
    records: [
      {
        id: 'stud-dup-01',
        apaar_id: '548291037462',
        student_id: 'MIT-2026-IT-022',
        full_name: 'Siddharth Natarajan',
        program: 'B.Tech Information Technology',
        admission_year: 2026,
        admission_category: 'Regular',
        institution_id: 'inst-1',
        validation_status: 'Duplicate',
        validation_notes: 'CRITICAL DUPLICATE: APAAR 5482-9103-7462 also registered at College of Engineering Guindy (Roll: CEG-2026-CSE-091)',
        created_at: '2026-08-17T14:20:00Z',
        contact_masked: '+91 97*** **114'
      },
      {
        id: 'stud-dup-02',
        apaar_id: '548291037462',
        student_id: 'CEG-2026-CSE-091',
        full_name: 'Siddharth Natarajan',
        program: 'B.Tech Computer Science & Engineering',
        admission_year: 2026,
        admission_category: 'Regular',
        institution_id: 'inst-2',
        validation_status: 'Duplicate',
        validation_notes: 'CRITICAL DUPLICATE: APAAR 5482-9103-7462 also registered at Madras Institute of Technology (Roll: MIT-2026-IT-022)',
        created_at: '2026-08-18T16:05:00Z',
        contact_masked: '+91 97*** **114'
      }
    ],
    matching_fields: ['apaar_id (5482-9103-7462)', 'full_name ("Siddharth Natarajan")', 'contact_masked ("+91 97*** **114")', 'admission_year (2026)'],
    conflicting_fields: ['institution ("MIT Chennai" vs "CEG Anna University")', 'program ("B.Tech IT" vs "B.Tech CSE")', 'student_id ("MIT-2026-IT-022" vs "CEG-2026-CSE-091")'],
    rationale: 'Identical 12-digit APAAR ID and name submitted in concurrent regular full-time engineering degree admissions across two distinct Anna University constituent colleges. Breaches AICTE APH concurrent full-time study clause.',
    reviewer_notes: 'Pending clarification from student and CEG Admissions Cell. Both institutions uploaded active admission letters.',
    assigned_officer: 'Prof. A. Sahasrabudhe (Central Regulator)',
    last_updated: '2026-10-24 11:30 UTC',
    history: [
      {
        timestamp: '2026-08-18 16:10 UTC',
        action: 'Case Created',
        actor: 'Automated Deduplication Engine',
        notes: 'Matched identical 12-digit APAAR across inst-1 and inst-2'
      },
      {
        timestamp: '2026-09-02 10:15 UTC',
        action: 'Assigned to Central Regulator',
        actor: 'System Router',
        notes: 'Cross-institution conflict assigned to Central Jurisdiction'
      }
    ]
  }
];

// --- Seed Exception Queue Items (Feature E) ---
export const INITIAL_EXCEPTION_ITEMS: ExceptionItem[] = [
  {
    id: 'exc-01',
    student_id: 'stud-dup-01',
    student_name: 'Siddharth Natarajan',
    apaar_id: '548291037462',
    institution_id: 'inst-1',
    institution_name: 'Madras Institute of Technology, Chennai',
    program: 'B.Tech Information Technology',
    issue_type: 'Cross-University Duplicate',
    priority: 'High',
    priority_reason: 'Identical APAAR enrolled simultaneously at MIT and CEG Anna University for 2026 regular batch',
    age_days: 68,
    assigned_reviewer: 'Prof. A. Sahasrabudhe',
    recommended_action: 'Issue joint show-cause inquiry to student and cancel unverified seat',
    status: 'Pending Review'
  },
  {
    id: 'exc-02',
    student_id: 'stud-warn-01',
    student_name: 'Varun Swaminathan',
    apaar_id: '8839201948',
    institution_id: 'inst-1',
    institution_name: 'Madras Institute of Technology, Chennai',
    program: 'B.Tech Electronics & Communication',
    issue_type: 'Format / Luhn Checksum Failure',
    priority: 'Medium',
    priority_reason: 'Identifier has only 10 digits instead of standard 12-digit APAAR national sequence',
    age_days: 65,
    assigned_reviewer: 'Registrar (MIT Chennai)',
    recommended_action: 'Contact student to collect standard 12-digit APAAR or initiate DigiLocker e-KYC',
    status: 'Pending Review'
  },
  {
    id: 'exc-03',
    student_id: 'stud-warn-02',
    student_name: 'Harini Jayaraman',
    apaar_id: '',
    institution_id: 'inst-1',
    institution_name: 'Madras Institute of Technology, Chennai',
    program: 'B.Tech Computer Science & Engineering',
    issue_type: 'Missing Student Roll No',
    priority: 'Medium',
    priority_reason: 'APAAR ID blank; candidate e-KYC consent not completed during college enrollment',
    age_days: 64,
    assigned_reviewer: 'Registrar (MIT Chennai)',
    recommended_action: 'Trigger DigiLocker consent SMS link to candidate mobile',
    status: 'In Progress'
  },
  {
    id: 'exc-04',
    student_id: 'stud-psg-091',
    student_name: 'Karthik Selvam 9',
    apaar_id: '910000911091',
    institution_id: 'inst-3',
    institution_name: 'PSG College of Technology, Coimbatore',
    program: 'B.Tech Mechanical Engineering',
    issue_type: 'Sanctioned Intake Overflow',
    priority: 'High',
    priority_reason: 'Enrolled beyond sanctioned batch cap of 90 (Seat #91 of 95 total admissions)',
    age_days: 62,
    assigned_reviewer: 'Southern Regional Office (AICTE)',
    recommended_action: 'Verify supernumerary quota authorization or issue compliance penalty',
    status: 'Pending Review'
  },
  {
    id: 'exc-05',
    student_id: 'stud-ghost-01',
    student_name: 'Karthik Raja M',
    apaar_id: '910000881088',
    institution_id: 'inst-3',
    institution_name: 'PSG College of Technology, Coimbatore',
    program: 'B.Tech Metallurgical Engineering',
    issue_type: 'Prolonged Digital Inactivity',
    priority: 'High',
    priority_reason: 'Zero LMS footprint for 74 consecutive days and overdue semester tuition fees',
    age_days: 45,
    assigned_reviewer: 'Academic Audit Officer',
    recommended_action: 'Dispatch biometric attendance audit team or issue show-cause notice',
    status: 'In Progress'
  }
];

// --- Seed Import & Audit Timeline Events (Feature F) ---
export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-01',
    timestamp: '2026-10-25 15:45 UTC',
    category: 'Validation Run',
    institution_id: 'inst-1',
    institution_name: 'Madras Institute of Technology, Chennai',
    summary: 'Automated 12-Digit Luhn & Deduplication Pipeline Completed',
    details: 'Validated 12 student records; flagged 1 cross-university duplicate conflict and 2 format anomalies.',
    actor: 'Background Ingestion Worker (PostgreSQL Engine)',
    storage_type: 'Session (In-Memory)'
  },
  {
    id: 'evt-02',
    timestamp: '2026-10-24 16:30 UTC',
    category: 'Reviewer Action',
    institution_id: 'inst-1',
    institution_name: 'Madras Institute of Technology, Chennai',
    summary: 'Credit Transfer Request Stamped (14 ABC Credits)',
    details: 'Initiated inter-university transfer for Aarav Ramanathan to College of Engineering Guindy.',
    actor: 'Citizen Student Portal / ABC Gateway',
    storage_type: 'Session (In-Memory)'
  },
  {
    id: 'evt-03',
    timestamp: '2026-10-20 11:05 UTC',
    category: 'Security Consent',
    institution_id: 'inst-1',
    institution_name: 'Madras Institute of Technology, Chennai',
    summary: 'DPDP Sovereign Consent Lock Toggled',
    details: 'Student Aarav Ramanathan locked credential sharing. Automated verifications redirected to locked state.',
    actor: 'Aarav Ramanathan (Student Data Owner)',
    storage_type: 'Session (In-Memory)'
  },
  {
    id: 'evt-04',
    timestamp: '2026-10-15 09:22 UTC',
    category: 'Batch Ingestion',
    institution_id: 'inst-2',
    institution_name: 'College of Engineering Guindy, Anna University',
    summary: 'Batch CSV Ingestion Completed (180 Sanctioned Quota)',
    details: 'Batch roster ingested with 3 student records. Conflict detection triggered for APAAR 5482-9103-7462.',
    actor: 'Dr. S. Kulanthaivel (CEG Registrar)',
    storage_type: 'Session (In-Memory)'
  },
  {
    id: 'evt-05',
    timestamp: '2026-10-10 14:10 UTC',
    category: 'Statutory Notice',
    institution_id: 'inst-3',
    institution_name: 'PSG College of Technology, Coimbatore',
    summary: 'Statutory Capacity Overflow Inquiry Logged',
    details: 'Sanctioned intake cap breach: 95 students enrolled vs 90 approved (+5 excess admissions).',
    actor: 'AICTE Central Regulatory Command',
    storage_type: 'Session (In-Memory)'
  }
];






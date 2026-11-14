# APAAR ID-Based Student Data Management & Verification Platform

<p align="center">
  **Smart India Hackathon 2026 | Problem Statement ID: 26263**
</p>

<p align="center">
  A student data management and verification platform designed for AICTE-approved institutions.
</p>

---

## About the Project

The **APAAR ID-Based Student Data Management and Verification Platform** is a proposed digital solution for managing and verifying student-level academic information across AICTE-approved institutions.

The project aims to use APAAR ID as a unique academic identifier to support student record management, data verification, and institutional intake monitoring.

It addresses the need for a more organized and transparent process for maintaining student enrolment information and supporting institutional reporting.

## Problem Statement

**PS ID: 26263**

**Title:** Development of an APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions.

The proposed platform focuses on improving student data management and verification using APAAR ID, while supporting the reporting of:

- Approved Intake
- Actual Student Enrolment
- Student-level academic information

## Key Features

- **Student Data Management:** Organizing student-level information.
- **APAAR ID Verification:** Supporting APAAR ID format and checksum diagnostics.
- **Interactive Diagnostic Lab:** Examining the 12-digit ID structure and identifying formatting anomalies.
- **Validation Status:** Displaying statuses such as Valid, Incomplete, Checksum Mismatch, and Formatting Anomaly.
- **Institutional Intake Monitoring:** Supporting the management of approved intake and actual enrolment information.
- **Verification Assistance:** Providing explanations of validation findings to help users understand potential data issues.

*Note: Prototype-level checks should not be interpreted as official APAAR identity authentication or a live connection to government databases.*

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Application development |
| Node.js | Development environment |
| Vite | Local development server |
| Google AI Studio | AI-assisted application development |
| Gemini API | AI-powered functionality, where configured |

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

- Node.js
- npm
- Gemini API key (if using Gemini-powered functionality)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/saisingh7781/apaar-verify.git
```

**2. Open the project folder**

```bash
cd apaar-verify
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure environment variables**

Create a `.env.local` file in the root directory and add:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder with your own API key.

**5. Start the development server**

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## Google AI Studio

View the application in Google AI Studio:

[Open APAAR Project in AI Studio](https://aistudio.google.com/apps/f89ffd31-946a-4aba-8c02-bce51d0aaabf?fullscreenApplet=true&showAssistant=true&showPreview=true)

## Repository Structure

```text
apaar-verify/
│
├── .aistudio/
├── public/
├── src/
├── .env.example
├── .gitignore
├── README.md
├── index.html
├── metadata.json
├── package.json
├── seed_data.py
└── tsconfig.json
```

## Security

- Never upload API keys or passwords to GitHub.
- Keep `.env.local` out of version control.
- Use dummy student information for demonstrations.
- Do not publish real student personal or academic records.
- Use authorized integrations for any official institutional or APAAR data exchange.

## Future Scope

- Integration with authorized institutional data systems.
- Improved student record verification workflows.
- Advanced institutional dashboards and reporting.
- More detailed audit and verification history.
- Enhanced explainability of validation results.

## Project Information

| Detail | Information |
|---|---|
| Event | Smart India Hackathon 2026 |
| Problem Statement ID | 26263 |
| Domain | Software – Smart Automation |
| Project | APAAR Student Data Management & Verification Platform |
| Repository | [GitHub – apaar-verify](https://github.com/saisingh7781/apaar-verify) |

## Team

**Developed as part of Smart India Hackathon 2026.**

Add your team name and all team members' names and contributions here.

---

<p align="center">
  **Building a more organized and transparent student data management ecosystem.**
</p>

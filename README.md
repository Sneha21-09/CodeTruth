# CodeTruth
### Product Claim Verification & Brand Governance Platform

[![Live Website](https://img.shields.io/badge/Live%20Website-Visit%20CodeTruth-2563EB?style=for-the-badge)](https://code-truth.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**CodeTruth** is a product claim verification and brand governance platform designed to help organizations ensure that their marketing content accurately reflects approved product capabilities, specifications, pricing, limitations, and brand guidelines.

It provides a centralized workspace where content can be submitted, reviewed, checked against approved product facts, and revised before publication.

**Live Application:** https://code-truth.vercel.app

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [How CodeTruth Works](#how-codetruth-works)
- [Verification Engine](#verification-engine)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Current Implementation Scope](#current-implementation-scope)
- [Future Enhancements](#future-enhancements)

---

## Overview

Organizations frequently publish product-related content across websites, advertisements, emails, newsletters, and social media platforms.

Over time, product specifications change. Marketing teams may unintentionally communicate outdated pricing, unsupported capabilities, unreleased features, or claims that contradict official product documentation.

CodeTruth addresses this problem through a structured content verification workflow.

The platform brings together:

- Product fact management
- Marketing content review
- Brand guideline enforcement
- Claim-level verification
- Finding classification and severity assessment
- Human review and correction
- Verification history and insights

Its central principle is:

**Marketing claims should be supported by approved product information before they reach customers.**

## Problem Statement

Traditional content review processes often rely on manual checks, scattered documentation, and communication between marketing, product, and compliance teams.

This creates several challenges:

1. **Factual inconsistencies:** Marketing claims may contradict actual product specifications.
2. **Outdated information:** Previously accurate claims may become invalid after product updates.
3. **Premature announcements:** Marketing teams may advertise features that have not yet been released.
4. **Brand inconsistency:** Content may use prohibited terminology or deviate from approved brand language.
5. **Limited traceability:** Reviewers may struggle to identify the source supporting or contradicting a particular claim.

CodeTruth aims to bring these verification activities into one organized workspace.

## Key Features

### 1. Content Reviews

A centralized interface for managing marketing content submissions.

- Create and submit content for review.
- Organize submissions by publication channel.
- Track draft, pending, approved, rejected, and changes-requested statuses.
- Open individual submissions to inspect verification findings.
- Maintain review notes and decisions.

### 2. Product Facts Management

Maintain structured product information that can be used as the reference for claim verification.

Each product fact includes:

- Fact identifier
- Product attribute and value
- Category and unit
- Source file and line reference
- Product version
- Last updated date
- Approval status
- Historical changes

Fact statuses include Candidate, Approved, Expired, and Rejected.

### 3. Brand Guidelines

A centralized location for maintaining brand communication rules.

Includes:

- Preferred terminology
- Banned terminology
- Brand tone and writing guidance
- Brand colours
- General content guidelines
- Accessibility rules

The verification engine uses terminology rules when checking submitted content.

### 4. Claim Verification

The verification engine examines submitted marketing content against approved product facts and brand rules.

It can identify:

- Factual mismatches
- Outdated numerical claims
- Unsupported absolute claims
- Premature feature announcements
- Banned terminology
- Preferred terminology violations

Findings include explanations, expected and actual values, severity, and suggested corrections where applicable.

### 5. Human Review and Corrections

Verification findings can be reviewed individually.

Reviewers can:

- Accept suggested corrections.
- Edit suggested replacement text.
- Reject a finding.
- Track the decision associated with a finding.

This keeps human judgment within the content approval process.

### 6. Asset Library

A centralized interface for organizing brand-related assets, including logos, brand images, icons, and marketing visuals.

### 7. Repository Sources

An interface for managing and inspecting configured content-source information, including repository and uploaded-source records.

### 8. Verification History

Provides a record-oriented view of previous content reviews, decisions, and verification activity.

### 9. Insights Dashboard

Provides an overview of content review activity and verification-related information through a centralized dashboard.

### 10. Workspace Settings

Includes workspace-level settings and team-oriented interfaces for managing the platform's configuration.

---

## How CodeTruth Works

The platform follows a structured verification workflow:

1. **Submit content:** A user creates a marketing content submission and selects its publication channel.
2. **Load approved facts:** The verification process references the available approved product facts.
3. **Apply verification rules:** Submitted content is checked for numerical inconsistencies, disabled features, absolute claims, and terminology violations.
4. **Generate findings:** Detected issues are classified and assigned severity levels.
5. **Review findings:** A reviewer examines each finding and its supporting information.
6. **Apply corrections:** Suggested text can be accepted or manually edited.
7. **Track decisions:** Submission status and review information provide visibility into the content review process.

---

## Verification Engine

The current frontend implements a deterministic, rule-based verification engine.

### Verification Categories

| Category | Description |
|---|---|
| Factual Mismatch | Identifies numerical claims that contradict approved product facts. |
| Premature Announcement | Detects references to features marked as disabled. |
| Absolute Claim | Flags unsupported statements such as unlimited capabilities when approved limits exist. |
| Banned Terminology | Identifies words or phrases prohibited by brand guidelines. |
| Preferred Terminology | Detects wording that should be replaced with approved brand terminology. |
| Verified Claim | Recognizes supported numerical claims that match approved facts. |

### Severity Levels

- **Critical:** Significant product or feature misrepresentation.
- **Major:** Material factual or brand-guideline inconsistency.
- **Minor:** Less severe terminology or verification finding.

### Traceability

Factual findings can include references to the associated fact identifier, source file, and line number.

This makes it easier for reviewers to understand why a claim was flagged.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Application framework |
| React 19 | Component-based user interface |
| TypeScript | Type-safe development |
| Tailwind CSS 3 | Styling and responsive interface |
| Recharts | Dashboard visualizations |
| Lucide React | Interface icons |
| Browser Local Storage | Persistence of current frontend application data |
| Vercel | Frontend deployment |
| Git & GitHub | Version control and source-code hosting |

---

## System Architecture

The current application is organized into the following layers:

```text
                 CODETRUTH
                     |
          Next.js Application
                     |
             React Interface
                     |
       +-------------+-------------+
       |             |             |
   Dashboard     Content       Workspace
                 Reviews       Management
       |             |             |
       +-------------+-------------+
                     |
              Verification
                  Engine
                     |
       +-------------+-------------+
       |             |             |
   Product Facts  Brand Rules   Submitted
                                Content
       |             |             |
       +-------------+-------------+
                     |
             Verification
                Findings
                     |
            Human Review
                     |
           Corrections &
             Decisions
                     |
             Local Storage
```

The frontend uses reusable components and typed data models to organize product facts, submissions, brand rules, assets, source records, and review findings.

Application collections are persisted through versioned browser Local Storage keys.

---

## Project Structure

```text
CodeTruth/
│
├── backend/
│   └── app/
│       └── core/
│           ├── config.py
│           ├── database.py
│           └── security.py
│
├── frontend/
│   ├── public/
│   │   └── llms.txt
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── app/
│   │   │   ├── contact/
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   ├── forgot-password/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── robots.ts
│   │   │   └── sitemap.ts
│   │   │
│   │   ├── components/
│   │   │   ├── app/
│   │   │   ├── auth/
│   │   │   ├── site/
│   │   │   └── ui/
│   │   │
│   │   ├── data/
│   │   │   ├── facts.ts
│   │   │   ├── misc.ts
│   │   │   ├── submissions.ts
│   │   │   └── types.ts
│   │   │
│   │   └── lib/
│   │       ├── checker.ts
│   │       ├── contrast.ts
│   │       ├── data.ts
│   │       ├── extract.ts
│   │       ├── session.ts
│   │       ├── useLocalStorage.ts
│   │       └── utils.ts
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── .gitignore
```

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Sneha21-09/CodeTruth.git
```

### 2. Navigate to the Frontend

```bash
cd CodeTruth/frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Open the Application

Visit:

```text
http://localhost:3000
```

### Additional Commands

Build the application:

```bash
npm run build
```

Run the production server:

```bash
npm run start
```

Check TypeScript types:

```bash
npm run typecheck
```

---

## Deployment

The frontend is deployed using Vercel and connected to the GitHub repository.

**Live Application:** https://code-truth.vercel.app

**Source Code:** https://github.com/Sneha21-09/CodeTruth

### Deployment Configuration

| Configuration | Value |
|---|---|
| Hosting Platform | Vercel |
| Framework | Next.js |
| Root Directory | frontend |
| Production Branch | main |
| Build Command | npm run build |
| Install Command | npm install |

Changes pushed to the connected production branch trigger automatic deployments.

---

## Current Implementation Scope

CodeTruth currently provides a functional frontend application with a browser-based deterministic verification engine and sample application data.

The current verification engine does not require an external AI API to perform its implemented rule checks.

Application records and user-interface state are persisted in browser Local Storage. This means the current implementation does not provide shared server-side persistence across different users or browsers.

The backend directory contains initial core configuration, database, and security modules; it is not currently integrated as a deployed backend service.

---

## Future Enhancements

Potential improvements to extend CodeTruth include:

- Integration with live product documentation and repositories.
- Automated synchronization of product facts.
- AI-assisted semantic claim verification.
- Context-aware detection of misleading or unsupported statements.
- Backend APIs and centralized database persistence.
- Secure production authentication and role-based access control.
- Collaborative review workflows across teams.
- Automated notifications for outdated product claims.
- Version-aware verification and revalidation.
- Integrations with content management and marketing platforms.
- Advanced reporting and analytics.

---

## Project Links

- **Live Website:** https://code-truth.vercel.app
- **GitHub Repository:** https://github.com/Sneha21-09/CodeTruth

---

**CodeTruth — Because every product claim should be backed by the truth.**

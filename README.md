<<<<<<< HEAD
# CommunityBridge Frontend

Smart Resource Allocation — NGO Dashboard & Volunteer Interface

## Folder Structure

```
communitybridge/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx          ← React entry point
    ├── App.jsx           ← All UI: NGO Dashboard + Volunteer Interface
    ├── api/
    │   └── index.js      ← API stubs (swap mock → real fetch when backend is ready)
    └── data/
        └── mock.js       ← All mock/seed data
```
=======
# smart-resource-allocation
# Smart Resource Allocation Platform (SRAP)

A full-stack crisis and NGO resource management system that helps convert real-world reports into prioritized tasks and assigns volunteers intelligently based on skills, location, availability, and system-defined scoring.

---

## Problem Statement

NGOs and disaster response teams face difficulties in:
- Managing large volumes of incoming reports
- Prioritizing urgent needs effectively
- Assigning suitable volunteers quickly
- Tracking task execution in real time
- Coordinating resources efficiently

---

## Solution Overview

SRAP is a modular system that:
- Ingests and structures real-world reports
- Assigns priority scores using rule-based AI logic
- Matches volunteers intelligently
- Automates assignment of tasks
- Tracks lifecycle and system analytics

---

## System Modules

### 1. Data & AI Layer (Person A)
- Data ingestion from reports and inputs
- Priority scoring engine
- Predictive logic for urgency classification
- Analytics generation

---

### 2. Core Backend & System Logic (Person B)
- REST API development
- Smart volunteer matching system
- Auto-assignment engine
- Task lifecycle management (assigned → in_progress → completed)
- Resource tracking and system logs

---

### 3. Frontend & UI Layer (Person C)
- NGO dashboard
- Volunteer interface
- Citizen reporting UI
- Analytics visualization dashboard
- Integration with backend APIs

---

## Key Features

### Issue Reporting System
- Structured reporting of real-world issues
- Captures location, severity, type, and impact

---

### Priority Scoring System
- Assigns scores based on severity and impact
- Provides explainable reasoning for decisions

---

### Volunteer Matching Engine
- Matches volunteers using:
  - Skills
  - Location proximity
  - Availability
  - Performance rating

---

### Auto Assignment System
- Automatically assigns best-matched volunteer to tasks
- Reduces manual intervention

---

### Task Lifecycle Management
- Tracks task progress:
  - assigned
  - in_progress
  - completed

---

## System Flow

Report → Priority Scoring → Matching Engine → Auto Assignment → Task Execution → Completion Tracking

---

## Tech Stack

- Node.js
- Express.js
- JavaScript
- In-memory data store (MVP stage)
- REST APIs

---

## API Overview

- POST /api/reports → Create report
- GET /api/reports → Fetch reports
- GET /api/match/:id → Get volunteer matches
- POST /api/assign/auto/:id → Auto assign volunteer
- PATCH /api/assign/:id/status → Update task status

---
>>>>>>> 33df6f703b06ccde67276e50151abbf727d0f924

## How to Run

```bash
<<<<<<< HEAD
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

## Connecting to the Real Backend

When the backend is ready, open `src/api/index.js` and replace the mock functions with real fetch calls. Example:

```js
// BEFORE (mock)
export const getTasks = async () => {
  await delay();
  return [...mockTasks];
};

// AFTER (real backend)
export const getTasks = async () => {
  const res = await fetch('http://localhost:5000/tasks');
  return res.json();
};
```

All functions already match the API contract exactly.
=======
cd backend
npm install
npm run dev
>>>>>>> 33df6f703b06ccde67276e50151abbf727d0f924

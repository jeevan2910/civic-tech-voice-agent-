# 🏛️ CivicAI — AI-Enabled Citizen Grievance Prioritization & Resolution Assistant

> **An intelligent municipal grievance triage platform engineered for Grievance Officers, Departmental Supervisors, and Citizens.**
> Powered by **Google Gemini 2.5 Flash**, **Express.js**, and **React 19 + Vite 8 + Tailwind CSS + shadcn/ui**.

---

## 🚀 Key Highlights & Capabilities

### 1. 🚨 Grievance Officer Command Center ("Why is this complaint #1?")
Instead of a generic list of thousands of tickets, the officer sees:
- **Prioritized Queue**: 🔴 **Critical** · 🟠 **High** · 🟡 **Medium** · 🟢 **Low / Resolved**
- **Explainable Multi-Factor Scoring (0–100)**: Evaluates public health hazards, safety risks, essential lifeline service disruptions, vulnerable demographic proximity (schools/hospitals), community repeat volume, and duration open.
- **AI Priority Explainer Sheet**: Explains why a grievance is prioritized, identifies correlated duplicate tickets, and provides 1-click **Escalate** and **Resolve** actions.

### 2. 🏢 Department Supervisor Command (Water, Sanitation, Roads, Electricity)
Answers all 6 core supervisor operational questions:
1. **How many complaints?** → Total inflow and active caseload KPIs.
2. **Which areas have the most?** → Locality concentration ranking with critical indicators.
3. **Which complaints are overdue?** → SLA breach tracking table.
4. **Which problems are recurring?** → **AI-Detected Recurring Infrastructure Hotspots** that diagnose root causes and recommend permanent capital work orders.
5. **Which officers are overloaded?** → Real-time active caseload progress meters and overload warnings.
6. **What infrastructure is causing repeated complaints?** → Asset-level diagnostics (e.g. *Water Supply Grid at KPHB Colony*).

### 3. 🔗 Systemic Incident Grouping & Deduplication
- Automatically clusters correlated complaints by **Master Incident ID**, **Locality**, and **Issue Type**.
- Calculates total community population affected and generates unified work orders.

### 4. 🗺️ Interactive Leaflet GIS Geospatial Map
- Live **Carto Voyager** tiles mapping grievances across Hyderabad wards.
- Color-coded, priority-weighted circle markers with interactive popups and ward focus navigation.

### 5. 📝 Public Citizen Portal with Live AI Triage
- Real-time **Google Gemini 2.5 Flash** evaluation as citizens type.
- Live predicted priority score, auto-routing to the responsible municipal department with confidence score, and automatic health/safety risk detection.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS, shadcn/ui components, Lucide Icons, Leaflet / React-Leaflet, Recharts, Canvas-Confetti |
| **Backend** | Node.js, Express.js 5, `@google/generative-ai` (Gemini 2.5 Flash), `csv-parser` |
| **Theme & Design** | Cream / Warm Light Theme, Google Fonts Nunito |
| **Dataset** | 120 rich civic records across Hyderabad municipal wards (`civicai_enhanced_grievances_120_records.csv`) |

---

## 🔑 Demo Personas & Credentials

| Role | Email | Password | Access / Default View |
|---|---|---|---|
| 🏛️ **Chief Grievance Officer** *(Dr. Ramesh Verma)* | `officer@grievance.gov` | `officer123` | Morning Triage & Priority Queue |
| 💧 **Water Supervisor** *(A. K. Sharma)* | `supervisor@grievance.gov` | `super123` | Water Outages & Pipeline Hotspots |
| 🧹 **Sanitation Lead** *(Meera Nambiar)* | `sanitation@grievance.gov` | `super123` | Garbage Overflow & Sewer Jetting |
| 🛣️ **Roads Engineer** *(Venkatesh Rao)* | `roads@grievance.gov` | `super123` | Potholes & Asphalt Work Orders |
| 👥 **Public Citizen** *(Ananya Rao)* | `citizen@hyderabad.gov` | `citizen123` | Live AI Triage Submission |
| 👔 **State Director / Admin** *(Pooja Hegde)* | `admin@grievance.gov` | `admin123` | Full Administrative & GIS Access |

---

## 📦 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
```bash
cd API
npm install

# Configure Environment Variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start Backend Server (Port 5000)
node server.js
```

### 2. Frontend Setup
```bash
cd ../UI
npm install

# Start Vite Development Server (Port 5173)
npm run dev
```

Open **`http://localhost:5173/`** in your browser.

---

## 🌐 API Endpoints

- `GET /api/health` — API health check
- `POST /api/auth/login` — Role-based login
- `GET /api/auth/demo-users` — Fetch demo accounts
- `GET /api/grievances` — Grievances list with multi-filters
- `POST /api/grievances` — Citizen grievance submission
- `GET /api/ai/explain/:id` — "Why is this #1?" AI priority breakdown
- `GET /api/ai/clusters` — Grouped systemic incident clusters
- `GET /api/ai/recurring` — Recurring infrastructure breakdown diagnostics
- `POST /api/ai/evaluate-text` — Live Gemini 2.5 Flash real-time triage
- `GET /api/analytics/officer-summary` — Officer morning triage metrics
- `GET /api/analytics/supervisor` — Department supervisor operational metrics
- `GET /api/analytics/heatmap` — Ward-level GPS density data
- `POST /api/grievances/reset` — Reset dataset to pristine CSV state

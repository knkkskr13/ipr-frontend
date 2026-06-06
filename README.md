# IPR Management System — Frontend

React + Tailwind CSS frontend for the **Immovable Property Return (IPR) Management System**  
Built for **NIC Tripura State Unit — Batch 13 Summer Training**

## Tech Stack
- React 18 + React Router v6
- Tailwind CSS v3
- Axios
- JWT (localStorage, decoded without library)

## Getting Started

```bash
npm install
npm start
```

App runs on **http://localhost:3000**  
Backend must be running on **http://localhost:8080**

## Folder Structure

```
src/
├── api/              # Axios instance + all API modules
├── components/       # Sidebar, Header, Layout, ProtectedRoute, StatusBadge
├── pages/            # Login, EmployeeDashboard, IprForm, MySubmissions, PreviousReturns, AdminDashboard
├── utils/            # jwtHelper.js, formatters.js
└── App.jsx           # Routes
```

## Roles
| Role | Home | Access |
|------|------|--------|
| EMPLOYEE | `/dashboard` | Dashboard, IPR Filing, Submissions, Previous Returns |
| ADMIN | `/admin` | All IPR Returns, Approve actions |

## Key Features
- JWT auth with role-based routing
- IPR Form with 3 sections: Employee Details, Property Table, Declaration
- Add/Edit/Delete properties via modal
- Save as Draft, Preview, Submit flow
- Admin dashboard with KPI cards, filters, approve action
- Indian Rupee formatting, backend date array handling

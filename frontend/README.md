# AlertBridge Frontend

React and Vite client interface for the AlertBridge campus emergency coordination system. Communicates with the Python backend via the WebSocket-to-TCP bridge.

## Environment Configuration

Copy `.env.example` to `.env` if custom bridge parameters are required:

```
VITE_BRIDGE_URL=ws://localhost:8080
```

Default connection target: `ws://localhost:8080`.

## Installation and Execution

```bash
cd frontend
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Directory Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   ├── tokens.css
│   │   └── global.css
│   ├── api/
│   │   └── protocol.js
│   ├── context/
│   │   ├── SocketContext.jsx
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── utils/
│   │   ├── format.js
│   │   └── transitions.js
│   ├── components/
│   │   ├── Logo.jsx
│   │   ├── ConnectionStatus.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── SeverityChip.jsx
│   │   ├── StatCard.jsx
│   │   ├── IncidentTable.jsx
│   │   ├── Timeline.jsx
│   │   ├── Toast.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   └── landing/
│   │       ├── Navbar.jsx
│   │       ├── Hero.jsx
│   │       ├── FloatingObjects.jsx
│   │       ├── BridgeTrack.jsx
│   │       ├── HowItWorks.jsx
│   │       ├── RolesSection.jsx
│   │       ├── FeaturesSection.jsx
│   │       ├── ArchitectureSection.jsx
│   │       ├── CtaBand.jsx
│   │       └── Footer.jsx
│   ├── layouts/
│   │   └── AppLayout.jsx
│   └── pages/
│       ├── Landing.jsx
│       ├── Login.jsx
│       ├── NotFound.jsx
│       ├── student/
│       │   ├── Dashboard.jsx
│       │   ├── ReportEmergency.jsx
│       │   ├── MyReports.jsx
│       │   └── IncidentDetails.jsx
│       ├── admin/
│       │   ├── Dashboard.jsx
│       │   ├── Incidents.jsx
│       │   └── IncidentDetails.jsx
│       └── responder/
│           ├── Dashboard.jsx
│           └── IncidentDetails.jsx
```

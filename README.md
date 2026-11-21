# Campus Emergency Coordination System

A robust, real-time campus emergency coordination backend built with raw Python TCP sockets, multi-threading, SQLite3, and a Node.js WebSocket bridge.

This project was built for a **Computer Networks** semester project. It demonstrates socket programming, thread-per-client concurrency, newline-delimited JSON (NDJSON) framing, synchronized in-memory client registration, thread-safe socket sends, and application-level unicast/multicast message routing.

---

## Architecture

```
[Student / Admin / Responder]
             │
      TCP / WebSocket
             ▼
   ┌───────────────────┐
   │  Node.js Bridge   │  (port 8080 - WebSocket ↔ TCP relay)
   └─────────┬─────────┘
             │ Raw TCP (127.0.0.1:5000)
             ▼
   ┌─────────────────────────────────────────────────────────┐
   │                   Python TCP Server                     │
   │  ┌───────────────────────────────────────────────────┐  │
   │  │ Server Socket (server.py) - 127.0.0.1:5000        │  │
   │  │   └─ Spawns daemon thread per connected client    │  │
   │  └────────────────────────┬──────────────────────────┘  │
   │                           ▼                             │
   │  ┌───────────────────────────────────────────────────┐  │
   │  │ Client Handler (clienthandler.py)                 │  │
   │  │   └─ Raw byte buffer, split on b'\n', NDJSON      │  │
   │  └────────────────────────┬──────────────────────────┘  │
   │                           ▼                             │
   │  ┌───────────────────────────────────────────────────┐  │
   │  │ Message Router (message_router.py)                │  │
   │  │   └─ Server-side identity & role validation       │  │
   │  └───────┬────────────────────┬──────────────────┬───┘  │
   │          ▼                    ▼                  ▼      │
   │   ┌─────────────┐     ┌───────────────┐   ┌──────────┐  │
   │   │   auth.py   │     │ incident_     │   │ notif_   │  │
   │   │  (PBKDF2)   │     │ manager.py    │   │ mgr.py   │  │
   │   └─────────────┘     └───────────────┘   └──────────┘  │
   │          ▲                    ▲                  ▲      │
   │          └────────────┬───────┴──────────────────┘      │
   │                       ▼                                 │
   │  ┌───────────────────────────────────────────────────┐  │
   │  │ Thread-Safe Registry & Send Lock (registry.py)    │  │
   │  │   ├─ In-memory socket / user / role mapping       │  │
   │  │   └─ Per-connection send_lock (prevents byte mix) │  │
   │  └────────────────────────┬──────────────────────────┘  │
   │                           ▼                             │
   │  ┌───────────────────────────────────────────────────┐  │
   │  │ Database Layer (db.py) - SQLite3 + Write Lock     │  │
   │  │   └─ users, incidents, assignments, history, notif│  │
   │  └───────────────────────────────────────────────────┘  │
   └─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Campus-Emergency-Coordination-System/
├── Backend/
│   ├── server.py              # Main TCP server, socket setup, thread spawner
│   ├── clienthandler.py       # Per-client recv loop, 64KB guard, NDJSON framing
│   ├── registry.py            # Thread-safe client registry & per-connection send_lock
│   ├── message_router.py      # Request dispatcher, server-side identity check
│   ├── auth.py                # User login verification with PBKDF2 hashing
│   ├── incident_manager.py    # Incident CRUD, role validation & FSM status transitions
│   ├── notification_manager.py# Application-level unicast & group/role push routing
│   ├── db.py                  # SQLite schema, parameterized queries, DB write lock
│   ├── test_client.py         # Interactive CLI client with async reader thread
│   └── test_flow.py        

   # Automated end-to-end integration test suite
├── bridge/
│   ├── bridge.js              # Node.js WebSocket ↔ TCP bridge (port 8080)
│   └── package.json           # Dependencies ("ws")
├── frontend/
│   ├── index.html             # HTML entry point (Anton & Inter fonts)
│   ├── package.json           # React 18, React Router v6, Vite
│   ├── vite.config.js         # Vite configuration (port 3000)
│   └── src/                   # React app (Landing, Login, Student, Admin, Responder)
├── .gitignore
└── README.md
```

---

## Roles & Demo Accounts

All accounts use the password: `pass` (stored securely using PBKDF2-HMAC-SHA256 with random salt).

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `student01` | `pass` | `student` | Report incidents, view own reported incidents |
| `admin01` | `pass` | `admin` | View all incidents, change status to `UNDER_REVIEW`, assign responders, cancel/reject incidents, broadcast notifications |
| `sec01` | `pass` | `security` | View assigned security/fire incidents, update lifecycle status (`ACCEPTED` → `EN_ROUTE` → `ON_SCENE` → `RESOLVED`) |
| `med01` | `pass` | `medical` | View assigned medical incidents, update lifecycle status (`ACCEPTED` → `EN_ROUTE` → `ON_SCENE` → `RESOLVED`) |

---

## Incident State Machine

Status transitions follow a strict Finite State Machine (FSM):

```
[REPORTED]
    │
    ├── (Admin) ─────────────► [UNDER_REVIEW]
    │                               │
    ├── (Admin Assign) ─────────────┼──────────────► [ASSIGNED]
    │                                                     │
    ├── (Admin) ──► [CANCELLED] (Terminal)                ▼ (Responder)
    │                                                [ACCEPTED]
    └── (Admin) ──► [REJECTED]  (Terminal)                │
                                                          ▼ (Responder)
                                                     [EN_ROUTE]
                                                          │
                                                          ▼ (Responder)
                                                     [ON_SCENE]
                                                          │
                                                          ▼ (Responder)
                                                     [RESOLVED] (Terminal)
```

- **Admins** may set: `UNDER_REVIEW`, `CANCELLED`, `REJECTED`.
- **Assigned Responders** (and only the assigned responder) may set: `ACCEPTED`, `EN_ROUTE`, `ON_SCENE`, `RESOLVED`.
- **Students** cannot update status.
- Terminal statuses (`RESOLVED`, `CANCELLED`, `REJECTED`) cannot be changed.
- Incidents of type `medical` can only be assigned to responders with role `medical`.
- Incidents of type `fire` and `security` can only be assigned to responders with role `security`.

---

## Setup & Running

### 1. Initialize the Database
The database will be automatically initialized when the server starts. To initialize or reset it manually:
```bash
python Backend/db.py
```

### 2. Start the TCP Server
Binds to `127.0.0.1:5000` by default (can be overridden with `ALERTBRIDGE_HOST` and `ALERTBRIDGE_PORT` environment variables):
```bash
python Backend/server.py
```

### 3. Run Automated Integration Tests
Runs 9 comprehensive automated tests across 4 simultaneous client sockets:
```bash
python Backend/test_flow.py
```

### 4. Interactive Test Client (CLI)
Allows manual testing without the frontend. Pushes from other clients appear live while typing:
```bash
python Backend/test_client.py
```

### 5. Node.js WebSocket Bridge (for Web Frontend)
```bash
cd bridge
npm install
node bridge.js
```
The bridge listens on `ws://127.0.0.1:8080` and relays traffic to `127.0.0.1:5000`.

---

## Message Protocol (NDJSON)

Every message is a single-line JSON string followed by `\n`.

### 1. Authentication

#### Request: Login
```json
{ "type": "login", "username": "student01", "password": "pass" }
```

#### Response: Success
```json
{ "type": "login_success", "role": "student", "user_id": 1, "username": "student01" }
```

#### Request: Logout
```json
{ "type": "logout" }
```

#### Response: Logout Success
```json
{ "type": "logout_success", "message": "Logged out successfully" }
```

---

### 2. Incidents

#### Request: Report Incident (Student Only)
Allowed `incident_type`: `"fire"`, `"medical"`, `"security"`, `"accident"`, `"other"`.  
Allowed `severity`: `"low"`, `"medium"`, `"high"`, `"critical"`.
```json
{
  "type": "report_incident",
  "title": "Severe Asthma Attack",
  "description": "Student in Library 3rd floor having breathing trouble",
  "location": "Library Floor 3",
  "incident_type": "medical",
  "severity": "high"
}
```

#### Response: Incident Created
```json
{ "type": "incident_created", "incident_id": 1 }
```

#### Push to All Admins (Real-time Broadcast)
```json
{
  "type": "new_incident",
  "incident": {
    "id": 1,
    "title": "Severe Asthma Attack",
    "description": "Student in Library 3rd floor having breathing trouble",
    "location": "Library Floor 3",
    "type": "medical",
    "severity": "high",
    "status": "REPORTED",
    "reported_by": 1,
    "created_at": "2026-11-21 11:15:00",
    "updated_at": "2026-11-21 11:15:00"
  }
}
```

---

### 3. Incident Listing

#### Request: Get Incidents
*(Admin receives all incidents; student receives own; responder receives assigned incidents)*
```json
{ "type": "get_incidents" }
```

#### Response: Incidents List
```json
{
  "type": "incidents_list",
  "incidents": [
    {
      "id": 1,
      "title": "Severe Asthma Attack",
      "status": "REPORTED",
      "type": "medical",
      "severity": "high",
      "location": "Library Floor 3",
      "reported_by": 1,
      "created_at": "2026-11-21 11:15:00",
      "updated_at": "2026-11-21 11:15:00"
    }
  ]
}
```

---

### 4. Assignment

#### Request: Assign Responder (Admin Only)
```json
{ "type": "assign_responder", "incident_id": 1, "responder_id": 4 }
```

#### Response: Assigned
```json
{ "type": "assigned", "incident_id": 1, "responder_id": 4 }
```

#### Push to Assigned Responder (Unicast Routing)
*(Only the assigned responder receives this; other responders receive nothing)*
```json
{
  "type": "assignment_received",
  "incident_id": 1,
  "incident": { "id": 1, "title": "Severe Asthma Attack", "status": "ASSIGNED" },
  "assigned_by": "admin01"
}
```

---

### 5. Status Updates

#### Request: Update Status
```json
{ "type": "update_status", "incident_id": 1, "new_status": "ACCEPTED" }
```

#### Response: Status Updated
```json
{ "type": "status_updated", "incident_id": 1, "new_status": "ACCEPTED" }
```

#### Push to Reporting Student & Admins (Real-time)
```json
{
  "type": "incident_update",
  "incident_id": 1,
  "new_status": "ACCEPTED",
  "updated_by": "med01"
}
```

---

### 6. Notifications

#### Request: Get Notifications
```json
{ "type": "get_notifications" }
```

#### Response: Notifications List
```json
{
  "type": "notifications_list",
  "notifications": [
    {
      "id": 1,
      "user_id": 4,
      "incident_id": 1,
      "message": "Assignment received for incident #1",
      "is_read": 1,
      "created_at": "2026-11-21 11:15:30"
    }
  ]
}
```

#### Automatic Push on Login: Unread Notifications
```json
{
  "type": "unread_notifications",
  "notifications": [...]
}
```

---

### 7. Responders List & Incident History

#### Request: Get Responders (Admin Only)
```json
{ "type": "get_responders" }
```

#### Response: Responders List
```json
{
  "type": "responders_list",
  "responders": [
    { "user_id": 3, "username": "sec01", "role": "security", "online": true },
    { "user_id": 4, "username": "med01", "role": "medical", "online": false }
  ]
}
```

#### Request: Get Incident History
*(Visible to Admin, reporting student, or assigned responder)*
```json
{ "type": "get_incident_history", "incident_id": 1 }
```

#### Response: Incident History
```json
{
  "type": "incident_history",
  "incident_id": 1,
  "history": [
    {
      "id": 1,
      "incident_id": 1,
      "old_status": null,
      "new_status": "REPORTED",
      "changed_by_username": "student01",
      "created_at": "2026-11-21 11:15:00"
    }
  ]
}
```

---

### 8. Errors
All failed requests return a consistent error structure including the triggering `request`:
```json
{
  "type": "error",
  "message": "Only students are authorized to report incidents",
  "request": "report_incident"
}
```

---

## Deployment

AlertBridge supports both local evaluation and remote access via a secure tunnel:

### 1. Production Architecture (Vercel + Cloudflare Tunnel)

1. **Frontend (Vercel)**:
   - Hosted on Vercel at `https://alert-bridge-sage.vercel.app/`.
   - Single-Page Application (SPA) built with React 18 and Vite.
   - SPA rewrite rules in `frontend/vercel.json` direct all routes to `/index.html`.
   - Connects to the bridge via secure WebSockets (`wss://`).
   - Environment Variable: `VITE_BRIDGE_URL` (set to the Cloudflare tunnel `wss://` URL).

2. **Backend & Bridge (Local Host via Cloudflare Quick Tunnel)**:
   - The Python TCP server and Node.js WebSocket bridge run on the local machine.
   - Traffic is securely exposed over HTTPS/WSS using Cloudflare Quick Tunnels:
     ```bash
     cloudflared tunnel --url http://localhost:8080
     ```
   - Cloudflare terminates TLS and provides a public `https://<random>.trycloudflare.com` URL. The WebSocket endpoint is `wss://<random>.trycloudflare.com`.
   - `VITE_BRIDGE_URL` on Vercel must be updated with this new `wss://` URL, and the frontend redeployed whenever the tunnel restarts, as quick tunnel hostnames change on each execution.
   - If `ALLOWED_ORIGIN` is configured in `bridge/bridge.js`, it restricts connections strictly to `https://alert-bridge-sage.vercel.app` and blocks `localhost`. Leave unset during local testing.

### 2. Operational Limits
- **Host Machine Dependency**: The live Vercel deployment functions only while the host machine is awake, connected to the internet, and actively running the Python server, bridge, and Cloudflare tunnel processes.
- **Dynamic Tunnel URLs**: Free Cloudflare quick tunnels generate an ephemeral hostname on each launch, requiring an environment variable update on Vercel for remote access.
- **Academic Grading Demo**: The graded presentation and evaluation should run entirely on `localhost` for predictable low-latency socket demonstrations without external network hops.

---

## Local Development (Windows Commands)

To run the complete system locally for demonstration or development, open three separate terminal windows:

### Terminal 1: Python TCP Server
```powershell
py Backend/server.py
```
*Listens on `127.0.0.1:5000` and creates or connects to `Backend/emergency.db`.*

### Terminal 2: Node.js WebSocket Bridge
In PowerShell:
```powershell
$env:PORT="8080"
node bridge/bridge.js
```
Or in Command Prompt:
```cmd
set PORT=8080 && node bridge/bridge.js
```
*Listens for WebSocket connections on port `8080` and relays NDJSON packets to `127.0.0.1:5000`.*

### Terminal 3: React Frontend Dev Server
```powershell
cd frontend
npm run dev
```
*Serves the frontend at `http://localhost:5173/`, connecting by default to `ws://localhost:8080`.*

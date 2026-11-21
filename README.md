# Campus Emergency Coordination System

A real-time campus emergency management system built with raw TCP sockets, WebSocket bridge, and React frontend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python (raw TCP sockets, threading, SQLite3) |
| Bridge | Node.js (WebSocket ↔ TCP relay) |
| Frontend | React + Vite |

## Architecture

```
React Frontend  <──WebSocket──>  Node.js Bridge  <──TCP──>  Python Server  <──>  SQLite DB
   (port 3000)                    (port 8080)                 (port 5000)
```

## Project Structure

```
campus-emergency-system/
├── backend/
│   ├── server.py              # TCP server, accepts connections, spawns threads
│   ├── client_handler.py      # Per-client thread, NDJSON message framing
│   ├── message_router.py      # Routes messages to correct handler
│   ├── auth.py                # Login authentication
│   ├── incident_manager.py    # Incident CRUD operations
│   ├── notification_manager.py # Notification handling
│   └── db.py                  # SQLite3 schema and queries
├── bridge/
│   ├── bridge.js              # WebSocket ↔ TCP relay
│   └── package.json
└── frontend/
    └── (React + Vite app)
```

## Features

- **Role-based access** — Student, Admin, Security, Medical
- **Real-time updates** via WebSocket
- **Incident lifecycle** — REPORTED → UNDER_REVIEW → ASSIGNED → ACCEPTED → EN_ROUTE → ON_SCENE → RESOLVED
- **Multi-client support** — one thread per connected client
- **Notifications** — per-user notification system

## Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| student01 | pass | Student |
| admin01 | pass | Admin |
| sec01 | pass | Security |
| med01 | pass | Medical |

## Setup & Run

### 1. Backend (Python)
```bash
cd backend
python db.py        # initialize database
python server.py    # start TCP server on port 5000
```

### 2. Bridge (Node.js)
```bash
cd bridge
npm install
node bridge.js      # start WebSocket bridge on port 8080
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev         # start on port 3000
```

## Message Protocol

All messages are JSON over TCP/WebSocket, delimited by `\n` (NDJSON).

**Login:**
```json
{ "type": "login", "username": "student01", "password": "pass" }
```

**Report Incident:**
```json
{ "type": "report_incident", "title": "Fire in Lab", "description": "...", "location": "Block C", "incident_type": "fire", "reported_by": 1 }
```

**Get Incidents:**
```json
{ "type": "get_incidents", "user_id": 1, "role": "admin" }
```

**Update Status:**
```json
{ "type": "update_status", "incident_id": 1, "new_status": "RESOLVED" }
```

## Course Project

Built as a semester project for **Computer Networks** — demonstrates TCP socket programming, multi-threading, and real-time client-server communication.

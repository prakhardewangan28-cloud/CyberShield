# CyberShield
A Python course project demonstrating multithreading, HTTP/JSON communication, exception handling, and simulation of a security monitoring system.



## Backend: Multithreaded Cybersecurity Event Simulator

### What It Does
Four monitor threads run simultaneously and POST simulated security events as JSON to a local Flask receiver:



- **network_monitor** - simulated network traffic events

- **login_monitor** - simulated failed login attempts

- **ip_monitor** - checks random IPs against a watchlist, flags matches as critical

- **file_monitor** - simulated file integrity changes



## Syllabus Topics Demonstrated
- Python basics: variables, functions, loops, conditionals, random

- `threading`, `time`, `random`, `requests` modules

- Multithreading (4 concurrent monitor threads)

- try-except exception handling

- HTTP POST with JSON payloads

- time.sleep() pacing

- Simulation of a cybersecurity monitoring system (not real packet capture)



## Requirements
- Python 3.10+

- `pip install -r requirements.txt`



## How to Run
Two terminals required.



**Terminal 1 - start the receiver:**

```

cd cybershield

python receiver.py

```



**Terminal 2 - start the simulator:**

```

cd cybershield

python main.py

```



**View collected events:**

```

Invoke-RestMethod -Uri http://127.0.0.1:5000/api/v1/events -Method GET

```



The simulator runs for 30 seconds then shuts down cleanly.



## New Features
1. Alert engine with severity-based rule triggers

2. Event counters and /api/stats endpoint

3. Filterable GET /api/events (event_type, severity, source_ip, min_severity)

4. Per-run summary printed at shutdown

5. Watchlist hot-reload endpoint (POST /api/watchlist/reload)

6. Event deduplication (409 on duplicate event_id)

7. Health check endpoint (GET /api/health)

8. Bounded in-memory buffer (last 500 events)

9. Per-source-IP rate limiting (20 events / 10 seconds, returns 429)

10. CLI run duration override (python main.py <seconds>)

11. Full endpoint documentation in FRONTEND_CONTRACT.md



## Project Structure
```

cybershield/

  main.py

  config.py

  sender.py

  receiver.py

  watchlist.txt

  requirements.txt

  README.md

  monitors/

    __init__.py

    network_monitor.py

    login_monitor.py

    ip_monitor.py

    file_monitor.py

```



## API Endpoints
- **POST /api/events** - receive one event (JSON body, returns 201)

- **GET  /api/events** - return all collected events as a JSON array



## Event JSON Format
```json

{

  "event_id": "evt_4821",

  "timestamp": "2026-10-18T12:30:00Z",

  "event_type": "network_traffic",

  "source_ip": "192.0.2.10",

  "severity": "low",

  "message": "Network traffic detected: 1024 bytes",

  "metadata": {"bytes": 1024, "packets": 10}

}

```



## Notes
- All events are **SIMULATED**. No real network traffic is captured.

- All IPs use the documentation range 192.0.2.0/24 (except file_monitor which uses 127.0.0.1 for local file events).

- suspicious_ip events only occur when a random IP matches watchlist.txt (~2% probability per check) - this is expected.

---

## Frontend: Cybersecurity Network Monitoring Dashboard

> **Python Multithreading and API Communication Mini-Project**  

> Developed for Academic Presentation, Demonstrations, and Live SOC Operations.



---



## 1. Project Overview
**CyberShield** is a cybersecurity monitoring web application designed to demonstrate how security events are collected concurrently via Python background threads, passed through a synchronized FIFO queue (`queue.Queue`), evaluated against configurable detection rules, persisted in a database, and presented through a Security Operations Centre (SOC) dashboard.



The application has been designed specifically for a live college presentation. It features both a **Live API Mode** (connecting to the Python backend on `http://127.0.0.1:8000`) and a **Demo Mode** with a consistent dataset that showcases:

- **Requirement 18 Worked Example**: 6 repeated failed SSH logins from `192.0.2.10` within 120 seconds triggering alert `alt_001`.

- **IP Watchlist Detection**: Real-time correlation with maintained threat indicators.

- **Host File Integrity Monitoring (FIM)**: SHA-256 cryptographic drift detection on sensitive configuration files (`/etc/security/pam_auth.conf`).

- **Python Multithreaded Workers**: 5 active daemon threads (`threading.Thread`) and 1 stopped worker to demonstrate fault handling.



---



## 2. Technology Stack & Student-Friendly Explanations
| Technology | Purpose in CyberShield | Why It Was Chosen (Student Explanation) |

| :--- | :--- | :--- |

| **React 19** | Component-based UI library | Enables modular, reusable UI components (Metric cards, tables, modal drawers, topology canvases) that update efficiently when event state changes. |

| **TypeScript** | Static typing and interfaces | Enforces strict contracts between the Python API responses and React props (`EventItem`, `AlertItem`, `WorkerItem`), preventing runtime `undefined` bugs during presentation. |

| **Vite** | Build tool and dev server | Provides instant hot-module replacement (HMR) and fast ES-module builds, making presentation startup instant. |

| **Vanilla CSS3** | Custom design system & animations | Built without heavy third-party CSS utility frameworks. Uses CSS custom properties (variables), glassmorphism, pulse keyframes, custom scrollbars, and responsive media queries. |

| **React Router v7** | Client-side routing | Allows instant navigation between 10 SOC screens without reloading the webpage or losing active session state. |

| **Recharts** | Interactive charts and telemetry | Renders SVG-based Area, Bar, and Donut charts that adapt to dark SOC themes and display real event trends. |

| **Lucide React** | Consistent iconography | Clean, recognizable cybersecurity and systems icons (Shields, CPU, Terminal, Database, Activity). |

| **Axios** | Typed HTTP client | Handles API requests to the Python backend with automatic request cancellation, timeout protection, bearer token headers, and friendly error wrapping. |



---



## 3. Application Structure
```text

frontend/

├── public/

│   └── favicon.svg               # Custom Shield-and-Circuit SVG brand icon

├── src/

│   ├── api/                      # Typed API service modules

│   │   ├── client.ts             # Central Axios instance with error formatting

│   │   ├── auth.api.ts           # Login, logout, session verification

│   │   ├── dashboard.api.ts      # Summary aggregates and backend health check

│   │   ├── events.api.ts         # Filterable and paginated event explorer

│   │   ├── alerts.api.ts         # Alert retrieval, acknowledge, and resolve actions

│   │   ├── watchlist.api.ts      # IP indicator add/update/delete operations

│   │   ├── files.api.ts          # File Integrity Monitoring (FIM) & SHA-256

│   │   ├── workers.api.ts        # Worker threads and queue.Queue metrics

│   │   ├── reports.api.ts        # Aggregate compliance reports

│   │   └── audit.api.ts          # Read-only operator audit log

│   ├── components/

│   │   ├── layout/

│   │   │   ├── Sidebar.tsx       # Collapsible SOC sidebar with 10 nav items

│   │   │   ├── TopNavbar.tsx     # Connection ping, demo switch, worked demo trigger

│   │   │   └── Layout.tsx        # Persistent responsive shell

│   │   └── common/

│   │       ├── WorkedExampleModal.tsx # Requirement 18: 6 failed logins demo modal

│   │       ├── WorkedBanner.tsx       # One-click demo banner

│   │       ├── EducationalCard.tsx    # College presentation guide & viva talking points

│   │       ├── ToastContainer.tsx     # Live status toast notifications

│   │       └── SkeletonLoader.tsx     # Polished data loading skeletons

│   ├── context/

│   │   ├── AuthContext.tsx       # Operator session & role switching (Admin/Analyst/Viewer)

│   │   ├── ApiContext.tsx        # Backend URL configuration & Demo/Live mode toggle

│   │   └── ToastContext.tsx      # System-wide toast triggers

│   ├── mock/

│   │   └── mockData.ts           # Coherent dataset including RFC 5737 worked demo

│   ├── pages/

│   │   ├── LoginPage.tsx         # Dark cybersecurity auth screen with demo quick-fill

│   │   ├── DashboardPage.tsx     # Page 1: Overview with Recharts & recent alerts

│   │   ├── NetworkMonitoringPage.tsx # Page 2: Interactive SVG network topology

│   │   ├── EventsPage.tsx        # Page 3: Searchable event explorer & JSON inspector

│   │   ├── AlertsPage.tsx        # Page 4: Threat investigation with Ack/Resolve modals

│   │   ├── WatchlistPage.tsx     # Page 5: IP indicator management with validation

│   │   ├── FileIntegrityPage.tsx # Page 6: SHA-256 baseline vs current hash comparison

│   │   ├── WorkersPage.tsx       # Page 7: Multithreading architecture & 8-step pipeline

│   │   ├── ReportsPage.tsx       # Page 8: Print-friendly view, CSV & JSON download

│   │   ├── AuditLogsPage.tsx     # Page 9: Operator action audit trail

│   │   └── SettingsPage.tsx      # Page 10: API tester & detection rule thresholds

│   ├── styles/

│   │   ├── variables.css         # Dark SOC palette (#070B14, Electric Cyan #00E5FF)

│   │   ├── animations.css        # Radar sweep, scanlines, packet flow, pulsing dots

│   │   ├── index.css             # Resets, glassmorphism, scrollbars, print styles

│   │   └── components.css        # Reusable buttons, badges, inputs, tables, modals

│   ├── types/

│   │   └── index.ts              # Complete TypeScript interfaces

│   ├── App.tsx                   # Central router & protected route guards

│   └── main.tsx                  # Application entry point

├── package.json

└── tsconfig.app.json

```



---



## 4. Setup and Execution Instructions
### Prerequisites
- **Node.js** (v18 or higher recommended; verified on Node v24)

- **npm** (v9 or higher)



### Installation
From the root of the project (there is no `frontend/` subfolder — `package.json` lives in the root):

```bash

npm install

```



### Running Locally (Development Mode)
```bash

npm run dev

```

Open your browser to: **`http://127.0.0.1:5173/`**



### Building for Production
```bash

npm run build

```

Generates optimized, minified bundles into the `frontend/dist/` directory.



---



## 5. Presentation Script & Worked Demonstration Walkthrough
When presenting CyberShield to professors, examiners, or peers, follow this recommended walkthrough:



### Step 1: Login & Role Selection
- Open `http://127.0.0.1:5173/login`.

- Click the **Admin (Full)** quick-fill button (credentials `admin` / `cybershield`) to illustrate Role-Based Access Control (RBAC).



### Step 2: Overview Dashboard (Page 1)
- Explain the SOC color coding:

  - Cyan (`#00E5FF`) for normal telemetry.

  - Amber (`#FFB020`) for medium-severity review items.

  - Coral/Red (`#FF3B5C`) for genuine critical alerts.

- Point out the active **Python Worker Threads (5/6)** card, emphasizing that one worker is deliberately shown as `Stopped` to prove the UI reflects real health rather than assuming everything is running.



### Step 3: Trigger the Worked Demonstration (Section 18)
- Click the **"Worked Example (6 Logins)"** button in the top navigation bar or banner.

- Walk through the scenario:

  1. **6 Failed Sign-ins**: Timestamped between `12:00:05` and `12:01:03` from RFC 5737 test address `192.0.2.10`.

  2. **Sliding Time Window**: 120 seconds evaluation window.

  3. **Rule Threshold**: 5 attempts. Since 6 &gt; 5, the detection engine creates Alert `alt_001`.

  4. Click **"Investigate Alert alt_001"** to seamlessly navigate to the Threat Alerts page.



### Step 4: Threat Alerts & Incident Investigation (Page 4)
- Show the alert details drawer: title, detection reason, associated event evidence, and suggested SOC investigation steps.

- Click **Acknowledge Alert**: Demonstrates state transition to `ACKNOWLEDGED`.

- Click **Resolve Alert**: Opens a confirmation dialog requiring root-cause notes.

- Switch to the **Audit Logs** page (Page 9) to prove that the operator's resolution notes were immutably recorded with actor, timestamp, and IP!



### Step 5: Network Topology (Page 2)
- Click on **Network Monitoring**.

- Click the nodes on the dynamic topology canvas (`Auth Server`, `192.0.2.10`, `Firewall`) to show how connection metadata is linked.

- Emphasize to the examiner: *"We monitor socket metadata (IP, port, flags) rather than running CPU-heavy Deep Packet Inspection on the host."*



### Step 6: Multithreading Architecture (Page 7)
- Open **Monitoring Workers**.

- Point to the **8-step pipeline visual**:

  $$\text{Observation} \rightarrow \text{Monitoring Worker} \rightarrow \text{Thread-Safe Queue} \rightarrow \text{Event Processor} \rightarrow \text{Detection Engine} \rightarrow \text{Database} \rightarrow \text{REST API} \rightarrow \text{Dashboard}$$

- Explain:

  - Why Python threads? Network and disk monitoring are I/O bound. Python releases the GIL during socket/file I/O, allowing all 5 collectors to run concurrently.

  - Why `queue.Queue`? Mutex-guarded FIFO prevents race conditions between threads.



### Step 7: File Integrity Monitoring (Page 6)
- Open **File Integrity**.

- Click on `/etc/security/pam_auth.conf`.

- Show the **SHA-256 baseline vs current disk hash comparison** showing the drift alert.



---



## 6. Python Backend REST API Contract & Mapping
The frontend communicates with the backend via the following REST API endpoints:



| Frontend Service Method | HTTP Method | Endpoint | Description |

| :--- | :--- | :--- | :--- |

| `authApi.login()` | `POST` | `/api/v1/auth/login` | Authenticate credentials & return JWT/session token |

| `authApi.getCurrentUser()` | `GET` | `/api/v1/auth/me` | Fetch active operator user details & role |

| `dashboardApi.getSummary()` | `GET` | `/api/v1/dashboard/summary` | Aggregate metrics (totals, open alerts, event trends) |

| `dashboardApi.getHealth()` | `GET` | `/api/v1/health` | Service health status, uptime, database check |

| `eventsApi.getEvents()` | `GET` | `/api/v1/events` | Paginated event list with search & severity filters |

| `eventsApi.getEventById()` | `GET` | `/api/v1/events/{id}` | Complete un-truncated event JSON |

| `alertsApi.getAlerts()` | `GET` | `/api/v1/alerts` | Filtered threat alerts list |

| `alertsApi.getAlertById()` | `GET` | `/api/v1/alerts/{id}` | Alert details, evidence list, and recommendations |

| `alertsApi.acknowledgeAlert()` | `PATCH` | `/api/v1/alerts/{id}/acknowledge` | Update status to `acknowledged` with actor ID |

| `alertsApi.resolveAlert()` | `PATCH` | `/api/v1/alerts/{id}/resolve` | Update status to `resolved` with resolution notes |

| `watchlistApi.getWatchlist()` | `GET` | `/api/v1/watchlist` | Configured IP indicators list |

| `watchlistApi.addEntry()` | `POST` | `/api/v1/watchlist` | Add new IP indicator with reason |

| `watchlistApi.deleteEntry()` | `DELETE` | `/api/v1/watchlist/{id}` | Remove indicator from active watchlist |

| `filesApi.getFiles()` | `GET` | `/api/v1/fim/files` | Monitored file paths and SHA-256 hash comparison |

| `filesApi.getFimSummary()` | `GET` | `/api/v1/fim/summary` | FIM directory config and modification counts |

| `workersApi.getWorkers()` | `GET` | `/api/v1/workers` | Python thread statuses, TID, and `queue.Queue` metrics |

| `reportsApi.getReport()` | `GET` | `/api/v1/reports/summary` | Timeframe aggregates for printing & CSV export |

| `auditApi.getAuditLogs()` | `GET` | `/api/v1/audit` | Read-only compliance audit trail |



> **Note on Backend Integration**: If your Python backend is still under development, you can toggle **Demo Mode** ON from the top bar or Settings page. The application will render the consistent, verified dataset without throwing errors!

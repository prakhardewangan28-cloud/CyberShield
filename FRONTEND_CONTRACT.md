# CyberShield - Frontend Integration Contract

Backend is complete and running. This file is everything the frontend developer needs.

## How to Run Backend

Two terminals:

```
Terminal 1: cd cybershield && python receiver.py
Terminal 2: cd cybershield && python main.py
```

The simulator runs for 30 seconds and stops. Restart `main.py` to generate a new batch of events.

## API Base URL

```
http://127.0.0.1:5000
```

## API Endpoints Summary

| Method | Endpoint                    | Purpose                                  |
|--------|----------------------------|------------------------------------------|
| POST   | /api/events                | Receive event from monitors              |
| GET    | /api/events                | Retrieve events (with optional filters)  |
| GET    | /api/alerts                | Retrieve all alerts                      |
| GET    | /api/stats                 | Get event/alert statistics               |
| GET    | /api/health                | Server health and uptime                 |
| POST   | /api/watchlist/reload      | Reload IP watchlist from file            |

## Status Codes

| Code | Meaning                                                    |
|------|-----------------------------------------------------------|
| 200  | OK - Request succeeded                                     |
| 201  | Created - Event successfully received                      |
| 400  | Bad Request - Missing required fields                      |
| 409  | Conflict - Duplicate event_id                              |
| 429  | Too Many Requests - Rate limit exceeded (20/10s per IP)    |

## Endpoints

### GET /api/events

Returns a JSON array of all events collected since the receiver started. Supports optional query parameters for filtering.

**Query Parameters (all optional):**
- `event_type` - Filter by event type (e.g., "login_failure")
- `severity` - Filter by exact severity (e.g., "high")
- `source_ip` - Filter by source IP address (e.g., "192.0.2.10")
- `min_severity` - Filter by minimum severity level: "low" | "medium" | "high" | "critical"

**Examples:**
- `/api/events` - Returns all events
- `/api/events?event_type=login_failure` - Only login_failure events
- `/api/events?severity=high` - Only events with severity exactly "high"
- `/api/events?min_severity=high` - Events with severity "high" or "critical"
- `/api/events?event_type=login_failure&severity=high` - Combined filters (AND logic)

**Response 200:** array of Event objects (see schema below)

### POST /api/events

Called by the monitor threads - frontend does NOT call this.

**Body:** Event object

**Response 201:** `{"ok": true}`

**Response 400:** `{"error": "missing fields"}`

**Response 409:** `{"error": "duplicate event_id"}` - Event with this event_id already received

**Response 429:** `{"error": "rate limit exceeded"}` - More than 20 events from this source_ip in the last 10 seconds

### GET /api/alerts

Returns a JSON array of all alerts generated from events.

**Response 200:** array of Alert objects (see schema below)

### GET /api/stats

Returns statistics about events and alerts.

**Response 200:**
```json
{
  "total_events": 42,
  "by_type": {
    "network_traffic": 15,
    "login_failure": 12,
    "suspicious_ip": 2,
    "file_change": 13
  },
  "total_alerts": 5
}
```

### POST /api/watchlist/reload

Reloads the IP watchlist from watchlist.txt file. Used to update the watchlist without restarting the backend.

**Response 200:**
```json
{
  "ok": true,
  "watchlist_size": 5
}
```

### GET /api/health

Returns server health status and uptime information.

**Response 200:**
```json
{
  "status": "ok",
  "uptime_seconds": 123.4,
  "events_received": 42,
  "alerts_generated": 5
}
```

## Alert Schema

Alerts are generated automatically when certain event conditions are met.

**Alert JSON Structure:**
```json
{
  "alert_id": "alt_0001",
  "timestamp": "2026-10-18T12:30:00Z",
  "linked_event_id": "evt_4821",
  "rule_name": "Repeated failed login attempts",
  "severity": "high",
  "source_ip": "192.0.2.20",
  "status": "open"
}
```

## Alert Object Schema

| field            | type   | values |
|------------------|--------|--------|
| alert_id         | string | "alt_" + 4-digit number, e.g. "alt_0001" |
| timestamp        | string | ISO 8601 UTC when alert was created |
| linked_event_id  | string | event_id that triggered this alert |
| rule_name        | string | Description of the alert rule |
| severity         | string | "high" \| "critical" |
| source_ip        | string | IP address from the triggering event |
| status           | string | "open" (future: may support "closed") |

**Alert Rules:**
- login_failure with failed_attempts >= 12 -> high severity
- suspicious_ip (any) -> critical severity
- file_change with action="deleted" -> high severity

## Event Object Schema

| field       | type   | values |
|-------------|--------|--------|
| event_id    | string | "evt_" + 4-digit number, e.g. "evt_4821" |
| timestamp   | string | ISO 8601 UTC, e.g. "2026-10-18T12:30:00Z" |
| event_type  | string | "network_traffic" \| "login_failure" \| "suspicious_ip" \| "file_change" |
| source_ip   | string | "192.0.2.x" for network/login/ip events, "127.0.0.1" for file events |
| severity    | string | "low" \| "medium" \| "high" \| "critical" |
| message     | string | human-readable description |
| metadata    | object | varies by event_type (see below) |

## metadata by event_type

- **network_traffic:** `{"bytes": int, "packets": int}`
- **login_failure:** `{"failed_attempts": int, "window_seconds": 120}`
- **suspicious_ip:** `{"watchlist_match": true, "watchlist_size": int}`
- **file_change:** `{"file": "config.ini" | "users.db" | "app.log", "action": "modified" | "deleted" | "created"}`

## Event Frequency

- **network_traffic:** every 1-3 seconds
- **login_failure:** every 2-4 seconds
- **suspicious_ip:** very rare (~2% per check, every 3-5 seconds) - may not appear in short runs
- **file_change:** every 4-6 seconds

Expect 30-40 events per 30-second run.

## What the Frontend Should Do

1. Poll GET /api/events every 2 seconds using fetch()
2. Render:
   - An events table: timestamp, event_type, severity, source_ip
   - A count chart by event_type (Chart.js from CDN is fine)
   - A severity indicator (badge or row color): critical=red, high=orange, medium=yellow, low=green
3. Show a "last updated" timestamp
4. Handle empty state ("No events yet - start main.py")

## CORS Note

If the frontend is opened from a different origin (e.g. file:// or a dev server on port 3000), fetch() will be blocked by CORS. Fix in backend (one-line change):

```bash
pip install flask-cors
```

In receiver.py add:
```python
from flask_cors import CORS
CORS(app)
```

Coordinate with backend owner before editing receiver.py.

## Example fetch snippet

```javascript
fetch('http://127.0.0.1:5000/api/v1/events')
  .then(r => r.json())
  .then(events => console.log(events))
  .catch(err => console.error('fetch failed:', err));
```

# CyberShield - Multithreaded Cybersecurity Network Monitoring Simulator

A Python course project demonstrating multithreading, HTTP/JSON communication, exception handling, and simulation of a security monitoring system.

## What It Does

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
Invoke-RestMethod -Uri http://127.0.0.1:5000/api/events -Method GET
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
- **GET  /api/events** - return all collected events as a JSON array

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

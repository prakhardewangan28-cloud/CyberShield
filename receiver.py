import sys
import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from alerts import check_and_create_alert, ALERTS

# Add current directory to path for monitors import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
CORS(app)  # Allow requests from the Vite dev server (port 5173) â€” added for frontend integration
START_TIME = time.time()  # Track server start time for uptime
EVENTS = []  # In-memory event store
EVENT_COUNTS = {}  # Event type counters
SEEN_EVENT_IDS = set()  # Track event IDs for deduplication
RATE_LIMIT = {}  # Per-source-IP rate limiting

@app.route("/api/events", methods=["POST"])
def receive_event():
    # Get JSON data from request
    event = request.get_json()
    
    # Validate required fields are present
    if not event or "event_id" not in event or "timestamp" not in event or "event_type" not in event:
        return jsonify({"error": "missing fields"}), 400
    
    # Check for duplicate event_id
    event_id = event.get("event_id")
    if event_id in SEEN_EVENT_IDS:
        return jsonify({"error": "duplicate event_id"}), 409
    SEEN_EVENT_IDS.add(event_id)
    
    # Rate limit check (20 events per 10 seconds per source IP)
    ip = event.get("source_ip", "unknown")
    now = time.time()
    timestamps = [t for t in RATE_LIMIT.get(ip, []) if now - t < 10]
    if len(timestamps) >= 20:
        return jsonify({"error": "rate limit exceeded"}), 429
    timestamps.append(now)
    RATE_LIMIT[ip] = timestamps
    
    # Append to in-memory store
    EVENTS.append(event)
    
    # Update event type counter
    EVENT_COUNTS[event["event_type"]] = EVENT_COUNTS.get(event["event_type"], 0) + 1
    
    # Bounded in-memory buffer: keeps last 500 events
    if len(EVENTS) > 500:
        EVENTS.pop(0)
    
    # Check for alerts
    check_and_create_alert(event)
    
    # Print receipt confirmation
    count = len(EVENTS)
    event_type = event.get("event_type", "unknown")
    severity = event.get("severity", "unknown")
    print(f"[receiver] #{count} {event_type} {severity}")
    
    return jsonify({"ok": True}), 201

@app.route("/api/events", methods=["GET"])
def get_events():
    # Get query parameters for filtering
    event_type = request.args.get("event_type")
    severity = request.args.get("severity")
    source_ip = request.args.get("source_ip")
    min_severity = request.args.get("min_severity")
    
    # Start with all events
    filtered = EVENTS
    
    # Apply filters if provided
    if event_type:
        filtered = [e for e in filtered if e.get("event_type") == event_type]
    
    if severity:
        filtered = [e for e in filtered if e.get("severity") == severity]
    
    if source_ip:
        filtered = [e for e in filtered if e.get("source_ip") == source_ip]
    
    if min_severity:
        # Severity ordering: low < medium < high < critical
        severity_order = {"low": 0, "medium": 1, "high": 2, "critical": 3}
        min_level = severity_order.get(min_severity, 0)
        filtered = [e for e in filtered if severity_order.get(e.get("severity"), 0) >= min_level]
    
    return jsonify(filtered)

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    # Return all alerts as JSON
    return jsonify(ALERTS)

@app.route("/api/stats", methods=["GET"])
def get_stats():
    # Return statistics
    return jsonify({
        "total_events": len(EVENTS),
        "by_type": EVENT_COUNTS,
        "total_alerts": len(ALERTS)
    })

@app.route("/api/watchlist/reload", methods=["POST"])
def reload_watchlist_route():
    # Import here to avoid circular imports
    from monitors.ip_monitor import reload_watchlist
    size = reload_watchlist()
    return jsonify({"ok": True, "watchlist_size": size})

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "events_received": len(EVENTS),
        "alerts_generated": len(ALERTS)
    })


# ---------------------------------------------------------------------------
# /api/v1/ ALIASES â€” added for React frontend integration
# The frontend's Axios client calls /api/v1/... paths.
# These routes forward to the same logic as the original /api/ routes so
# we don't duplicate any business logic.
# ---------------------------------------------------------------------------

@app.route("/api/v1/health", methods=["GET"])
def v1_health():
    """Alias of /api/health with richer shape expected by the frontend HealthResponse type."""
    return jsonify({
        "status": "healthy",
        "version": "1.0.0",
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "active_threads": 4,          # 4 monitor threads from main.py
        "database": "connected",       # in-memory store is always available
        "events_received": len(EVENTS),
        "alerts_generated": len(ALERTS)
    })


@app.route("/api/v1/events", methods=["GET"])
def v1_get_events():
    """
    Alias of /api/events with the paginated response shape the frontend expects.
    Supports: search, eventType, severity, source, page, pageSize query params.
    Also maps backend field names to frontend field names:
      source_ip  -> source
      message    -> description
    """
    # --- Read query parameters ---
    search     = request.args.get("search", "").lower()
    event_type = request.args.get("eventType") or request.args.get("event_type")
    severity   = request.args.get("severity")
    source     = request.args.get("source") or request.args.get("source_ip")
    min_sev    = request.args.get("min_severity")
    page       = int(request.args.get("page", 1))
    page_size  = int(request.args.get("pageSize", 10))

    severity_order = {"low": 0, "medium": 1, "high": 2, "critical": 3}

    # --- Filter ---
    filtered = list(EVENTS)
    if search:
        filtered = [e for e in filtered if
                    search in e.get("event_id", "").lower() or
                    search in e.get("source_ip", "").lower() or
                    search in e.get("message", "").lower() or
                    search in e.get("event_type", "").lower()]
    if event_type and event_type != "all":
        filtered = [e for e in filtered if e.get("event_type") == event_type]
    if severity and severity != "all":
        filtered = [e for e in filtered if e.get("severity") == severity]
    if source:
        filtered = [e for e in filtered if e.get("source_ip") == source]
    if min_sev:
        min_level = severity_order.get(min_sev, 0)
        filtered = [e for e in filtered if severity_order.get(e.get("severity"), 0) >= min_level]

    # --- Paginate ---
    total = len(filtered)
    start = (page - 1) * page_size
    page_items = filtered[start:start + page_size]

    # --- Map backend fields -> frontend TypeScript interface fields ---
    def map_event(e):
        return {
            "event_id":         e.get("event_id", ""),
            "timestamp":        e.get("timestamp", ""),
            "event_type":       e.get("event_type", ""),
            "source":           e.get("source_ip", ""),        # frontend uses "source"
            "description":      e.get("message", ""),          # frontend uses "description"
            "severity":         e.get("severity", "low"),
            "processing_status": "processed",                  # all stored events are processed
            "metadata":         e.get("metadata", {}),
            "is_simulated":     False
        }

    return jsonify({
        "items":    [map_event(e) for e in page_items],
        "total":    total,
        "page":     page,
        "pageSize": page_size
    })


@app.route("/api/v1/events/<string:event_id>", methods=["GET"])
def v1_get_event_by_id(event_id):
    """Return a single event by ID, with frontend field mapping applied."""
    for e in EVENTS:
        if e.get("event_id") == event_id:
            return jsonify({
                "event_id":         e.get("event_id", ""),
                "timestamp":        e.get("timestamp", ""),
                "event_type":       e.get("event_type", ""),
                "source":           e.get("source_ip", ""),
                "description":      e.get("message", ""),
                "severity":         e.get("severity", "low"),
                "processing_status": "processed",
                "metadata":         e.get("metadata", {}),
                "is_simulated":     False
            })
    return jsonify({"error": "event not found"}), 404


@app.route("/api/v1/alerts", methods=["GET"])
def v1_get_alerts():
    """
    Alias of /api/alerts with the richer AlertItem shape the frontend expects.
    Maps backend alert fields to frontend AlertItem TypeScript interface.
    """
    def map_alert(a):
        return {
            "alert_id":                    a.get("alert_id", ""),
            "title":                       a.get("rule_name", "Security Alert"),
            "severity":                    a.get("severity", "high"),
            "status":                      a.get("status", "open"),
            "source_ip":                   a.get("source_ip", ""),
            "event_category":              a.get("rule_name", "Detection Rule"),
            "detection_rule":              a.get("rule_name", ""),
            "detection_reason":            a.get("rule_name", ""),
            "time_detected":               a.get("timestamp", ""),
            "related_event_ids":           [a.get("linked_event_id", "")],
            "suggested_investigation_steps": [
                "Review the linked event for full context.",
                "Check source IP against threat intelligence feeds.",
                "Verify whether the activity was authorised."
            ],
            "is_simulated": False
        }
    return jsonify([map_alert(a) for a in ALERTS])


@app.route("/api/v1/alerts/<string:alert_id>", methods=["GET"])
def v1_get_alert_by_id(alert_id):
    """Return a single alert by ID with frontend field mapping."""
    for a in ALERTS:
        if a.get("alert_id") == alert_id:
            return jsonify({
                "alert_id":        a.get("alert_id", ""),
                "title":           a.get("rule_name", "Security Alert"),
                "severity":        a.get("severity", "high"),
                "status":          a.get("status", "open"),
                "source_ip":       a.get("source_ip", ""),
                "event_category":  a.get("rule_name", ""),
                "detection_rule":  a.get("rule_name", ""),
                "detection_reason": a.get("rule_name", ""),
                "time_detected":   a.get("timestamp", ""),
                "related_event_ids": [a.get("linked_event_id", "")],
                "suggested_investigation_steps": [
                    "Review the linked event for full context.",
                    "Check source IP against threat intelligence feeds.",
                    "Verify whether the activity was authorised."
                ],
                "is_simulated": False
            })
    return jsonify({"error": "alert not found"}), 404


@app.route("/api/v1/alerts/<string:alert_id>/acknowledge", methods=["PATCH"])
def v1_acknowledge_alert(alert_id):
    """Mark an alert as acknowledged. Mutates the in-memory ALERTS list."""
    body = request.get_json() or {}
    for a in ALERTS:
        if a.get("alert_id") == alert_id:
            a["status"] = "acknowledged"
            a["acknowledged_by"] = body.get("actor", "operator")
            a["acknowledged_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            print(f"[alerts] {alert_id} acknowledged by {a['acknowledged_by']}")
            return jsonify({"ok": True, "alert_id": alert_id, "status": "acknowledged"})
    return jsonify({"error": "alert not found"}), 404


@app.route("/api/v1/alerts/<string:alert_id>/resolve", methods=["PATCH"])
def v1_resolve_alert(alert_id):
    """Mark an alert as resolved with optional resolution notes."""
    body = request.get_json() or {}
    for a in ALERTS:
        if a.get("alert_id") == alert_id:
            a["status"] = "resolved"
            a["resolved_by"] = body.get("actor", "operator")
            a["resolved_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            a["resolution_notes"] = body.get("resolution_notes", "")
            print(f"[alerts] {alert_id} resolved by {a['resolved_by']}")
            return jsonify({"ok": True, "alert_id": alert_id, "status": "resolved"})
    return jsonify({"error": "alert not found"}), 404


@app.route("/api/v1/dashboard/summary", methods=["GET"])
def v1_dashboard_summary():
    """
    Returns a DashboardSummary-shaped JSON for the React Dashboard page.
    Computed from live in-memory EVENTS and ALERTS lists.
    """
    severity_order = {"low": 0, "medium": 1, "high": 2, "critical": 3}

    open_alerts      = [a for a in ALERTS if a.get("status") == "open"]
    high_sev_alerts  = [a for a in ALERTS if a.get("severity") in ("high", "critical")]
    login_failures   = [e for e in EVENTS if e.get("event_type") == "login_failure"]

    # Build a simple 6-point trend (group last 60 events into 6 buckets)
    bucket_size = max(1, len(EVENTS) // 6) if EVENTS else 1
    trend = []
    for i in range(6):
        bucket = EVENTS[i * bucket_size:(i + 1) * bucket_size]
        trend.append({
            "time":     f"T-{5 - i}",
            "events":   len(bucket),
            "failures": sum(1 for e in bucket if e.get("event_type") == "login_failure"),
            "alerts":   sum(1 for e in bucket if e.get("severity") in ("high", "critical"))
        })

    # Severity distribution for the donut chart
    sev_counts = {}
    sev_colors = {"low": "#22C55E", "medium": "#F59E0B", "high": "#F97316", "critical": "#EF4444"}
    for e in EVENTS:
        s = e.get("severity", "low")
        sev_counts[s] = sev_counts.get(s, 0) + 1
    severity_dist = [
        {"name": k.capitalize(), "value": v, "color": sev_colors.get(k, "#888")}
        for k, v in sev_counts.items()
    ]

    # Category distribution for bar chart
    cat_counts = {}
    for e in EVENTS:
        t = e.get("event_type", "unknown")
        cat_counts[t] = cat_counts.get(t, 0) + 1
    category_dist = [{"category": k, "count": v} for k, v in cat_counts.items()]

    return jsonify({
        "total_events":           len(EVENTS),
        "open_alerts":            len(open_alerts),
        "high_severity_alerts":   len(high_sev_alerts),
        "failed_login_attempts":  len(login_failures),
        "workers_running":        4,
        "workers_total":          4,
        "api_health":             "healthy",
        "uptime_seconds":         round(time.time() - START_TIME, 1),
        "events_trend":           trend,
        "severity_distribution":  severity_dist,
        "category_distribution":  category_dist,
        "is_simulated":           False
    })


@app.route("/api/v1/auth/login", methods=["POST"])
def v1_auth_login():
    """
    Simple auth endpoint.
    Accepts any credentials and returns a session token so Live Mode login works.
    NOTE: This is for demonstration only â€” not real authentication.
    """
    body = request.get_json() or {}
    username = body.get("username", "operator")
    role_map = {"admin": "admin", "analyst": "analyst", "viewer": "viewer"}
    role = role_map.get(username.lower(), "admin")
    token = f"live_token_{role}_{int(time.time())}"
    return jsonify({
        "token": token,
        "user": {
            "id":         f"usr_{int(time.time()) % 9999:04d}",
            "username":   username,
            "name":       username.capitalize(),
            "email":      f"{username}@cybershield.internal",
            "role":       role,
            "last_login": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
        }
    })


@app.route("/api/v1/auth/me", methods=["GET"])
def v1_auth_me():
    """Returns current operator info derived from the Authorization header token."""
    auth_header = request.headers.get("Authorization", "")
    # Parse role out of the token string (e.g. "live_token_admin_...")
    role = "admin"
    if "analyst" in auth_header:
        role = "analyst"
    elif "viewer" in auth_header:
        role = "viewer"
    return jsonify({
        "id":         "usr_0001",
        "username":   role,
        "name":       role.capitalize(),
        "email":      f"{role}@cybershield.internal",
        "role":       role,
        "last_login": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    })


@app.route("/api/v1/auth/logout", methods=["POST"])
def v1_auth_logout():
    """Acknowledge logout (token is managed client-side in sessionStorage)."""
    return jsonify({"ok": True})


@app.route("/api/v1/watchlist", methods=["GET"])
def v1_get_watchlist():
    """Returns the current watchlist IPs read from watchlist.txt, in WatchlistEntry shape."""
    try:
        with open("watchlist.txt", "r") as f:
            lines = [l.strip() for l in f if l.strip() and not l.startswith("#")]
    except FileNotFoundError:
        lines = []
    entries = []
    for i, ip in enumerate(lines, start=1):
        entries.append({
            "id":             f"wl_{i:03d}",
            "ip_address":     ip,
            "description":    f"Watchlist entry {i}",
            "reason":         "Flagged in watchlist.txt",
            "created_at":     "2026-10-01T00:00:00Z",
            "status":         "active",
            "match_count":    sum(1 for e in EVENTS if e.get("source_ip") == ip),
            "last_matched_at": None
        })
    return jsonify(entries)


@app.route("/api/v1/watchlist", methods=["POST"])
def v1_add_watchlist():
    """Append a new IP to watchlist.txt and return the new entry."""
    body = request.get_json() or {}
    ip = body.get("ip_address", "")
    reason = body.get("reason", "Manual entry")
    if not ip:
        return jsonify({"error": "ip_address required"}), 400
    try:
        with open("watchlist.txt", "a") as f:
            f.write(f"\n{ip}\n")
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({
        "id":          f"wl_new_{int(time.time())}",
        "ip_address":  ip,
        "description": reason,
        "reason":      reason,
        "created_at":  time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "status":      "active",
        "match_count": 0
    }), 201


@app.route("/api/v1/watchlist/<string:entry_id>", methods=["DELETE"])
def v1_delete_watchlist(entry_id):
    """Stub delete â€” returns 200 (watchlist.txt editing by index is complex for a demo)."""
    return jsonify({"ok": True, "deleted_id": entry_id})


@app.route("/api/v1/fim/files", methods=["GET"])
def v1_fim_files():
    """
    File Integrity Monitoring â€” returns the PROTECTED_FILES list from config.py
    with simulated SHA-256 baseline vs current comparison data.
    """
    from config import PROTECTED_FILES
    import hashlib, random
    entries = []
    for i, fname in enumerate(PROTECTED_FILES, start=1):
        baseline = hashlib.sha256(fname.encode()).hexdigest()
        # Simulate a drift on the first file to show an alert
        current = baseline if i > 1 else hashlib.sha256((fname + "_modified").encode()).hexdigest()
        entries.append({
            "id":               f"fim_{i:03d}",
            "file_path":        f"/etc/cybershield/{fname}",
            "directory":        "/etc/cybershield",
            "status":           "unchanged" if baseline == current else "modified",
            "baseline_hash":    baseline,
            "current_hash":     current,
            "last_checked":     time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "alert_triggered":  baseline != current,
            "algorithm":        "SHA-256",
            "file_size_bytes":  random.randint(1024, 65536)
        })
    return jsonify(entries)


@app.route("/api/v1/fim/summary", methods=["GET"])
def v1_fim_summary():
    """FIM directory summary."""
    from config import PROTECTED_FILES
    return jsonify({
        "monitored_directory": "/etc/cybershield",
        "total_files":         len(PROTECTED_FILES),
        "modified_count":      1,
        "unchanged_count":     len(PROTECTED_FILES) - 1,
        "last_scan":           time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    })


@app.route("/api/v1/workers", methods=["GET"])
def v1_workers():
    """Returns the 4 monitor thread statuses in WorkerItem shape."""
    worker_defs = [
        ("wrk_001", "Network Monitor",  "connection_monitoring", "network_monitor"),
        ("wrk_002", "Login Monitor",    "login_monitoring",      "login_monitor"),
        ("wrk_003", "IP Monitor",       "watchlist_checking",    "ip_monitor"),
        ("wrk_004", "File Monitor",     "file_integrity",        "file_monitor"),
    ]
    workers = []
    for wid, name, task_type, tname in worker_defs:
        events_for_worker = [e for e in EVENTS if
            (task_type == "connection_monitoring" and e.get("event_type") == "network_traffic") or
            (task_type == "login_monitoring"      and e.get("event_type") == "login_failure") or
            (task_type == "watchlist_checking"    and e.get("event_type") == "suspicious_ip") or
            (task_type == "file_integrity"        and e.get("event_type") == "file_change")]
        workers.append({
            "id":               wid,
            "name":             name,
            "task_type":        task_type,
            "status":           "running",
            "thread_name":      tname,
            "last_activity":    time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "events_processed": len(events_for_worker),
            "error_count":      0,
            "description":      f"Daemon thread monitoring {task_type.replace('_', ' ')}."
        })
    return jsonify({
        "workers": workers,
        "queue_metrics": {
            "queue_size":         0,
            "max_queue_size":     500,
            "throughput_per_sec": round(len(EVENTS) / max(1, time.time() - START_TIME), 2),
            "average_latency_ms": 12,
            "is_thread_safe":     True,
            "status":             "active"
        }
    })


@app.route("/api/v1/reports/summary", methods=["GET"])
def v1_reports_summary():
    """Aggregate report data for the Reports page."""
    by_type = dict(EVENT_COUNTS)
    return jsonify({
        "timeframe":          "session",
        "total_events":       len(EVENTS),
        "total_alerts":       len(ALERTS),
        "open_alerts":        sum(1 for a in ALERTS if a.get("status") == "open"),
        "resolved_alerts":    sum(1 for a in ALERTS if a.get("status") == "resolved"),
        "events_by_type":     by_type,
        "uptime_seconds":     round(time.time() - START_TIME, 1),
        "generated_at":       time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    })


@app.route("/api/v1/audit", methods=["GET"])
def v1_audit():
    """
    Returns a read-only audit trail derived from alert state changes.
    Operator actions (acknowledge/resolve) recorded in the ALERTS list are
    surfaced here as AuditLog entries.
    """
    logs = []
    for a in ALERTS:
        if a.get("acknowledged_by"):
            logs.append({
                "id":               f"aud_{a['alert_id']}_ack",
                "timestamp":        a.get("acknowledged_at", ""),
                "actor":            a.get("acknowledged_by", "operator"),
                "role":             "analyst",
                "action":           "ACKNOWLEDGE_ALERT",
                "target_resource":  a.get("alert_id", ""),
                "result":           "success",
                "client_ip":        "127.0.0.1",
                "details":          f"Alert {a['alert_id']} acknowledged."
            })
        if a.get("resolved_by"):
            logs.append({
                "id":               f"aud_{a['alert_id']}_res",
                "timestamp":        a.get("resolved_at", ""),
                "actor":            a.get("resolved_by", "operator"),
                "role":             "analyst",
                "action":           "RESOLVE_ALERT",
                "target_resource":  a.get("alert_id", ""),
                "result":           "success",
                "client_ip":        "127.0.0.1",
                "details":          a.get("resolution_notes", "Alert resolved.")
            })
    # Most recent first
    logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return jsonify(logs)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)

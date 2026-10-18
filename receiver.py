import sys
import os
import time
from flask import Flask, request, jsonify
from alerts import check_and_create_alert, ALERTS

# Add current directory to path for monitors import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
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

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)

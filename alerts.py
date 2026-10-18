import time

# Module-level storage
ALERTS = []
next_alert_id = 1

def check_and_create_alert(event):
    """Check if event triggers an alert and create one if needed"""
    global next_alert_id
    
    alert = None
    severity = None
    reason = None
    
    # Rule 1: login_failure with >= 12 attempts
    if event.get("event_type") == "login_failure":
        failed_attempts = event.get("metadata", {}).get("failed_attempts", 0)
        if failed_attempts >= 12:
            severity = "high"
            reason = "Repeated failed login attempts"
    
    # Rule 2: suspicious_ip always triggers critical
    elif event.get("event_type") == "suspicious_ip":
        severity = "critical"
        reason = "Source IP matches watchlist"
    
    # Rule 3: file_change with deleted action
    elif event.get("event_type") == "file_change":
        action = event.get("metadata", {}).get("action", "")
        if action == "deleted":
            filename = event.get("metadata", {}).get("file", "unknown")
            severity = "high"
            reason = f"Protected file deleted: {filename}"
    
    # If no rule matched, return None
    if severity is None:
        return None
    
    # Build alert
    alert = {
        "alert_id": f"alt_{next_alert_id:04d}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "linked_event_id": event.get("event_id", "unknown"),
        "rule_name": reason,
        "severity": severity,
        "source_ip": event.get("source_ip", "unknown"),
        "status": "open"
    }
    
    # Store and log
    ALERTS.append(alert)
    print(f"[alerts] #{len(ALERTS)} {severity} {reason}")
    next_alert_id += 1
    
    return alert

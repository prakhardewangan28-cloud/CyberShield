"""
tests/test_receiver.py
======================
Automated pytest smoke tests for the CyberShield Flask backend (receiver.py).

How to run:
    pip install pytest
    pytest tests/test_receiver.py -v

These tests use Flask's built-in test client — no real server is started,
no real network calls are made.  All tests are self-contained and fast.
"""

import sys
import os
import time

# Make sure the project root is on the Python path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from receiver import app, EVENTS, ALERTS, SEEN_EVENT_IDS, EVENT_COUNTS, RATE_LIMIT


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_event(event_id="evt_test_001", event_type="network_traffic", severity="low",
               source_ip="192.0.2.10", message="test event"):
    """Return a minimal valid event payload."""
    return {
        "event_id":   event_id,
        "timestamp":  "2026-10-24T12:00:00Z",
        "event_type": event_type,
        "source_ip":  source_ip,
        "severity":   severity,
        "message":    message,
        "metadata":   {"bytes": 512, "packets": 5}
    }


@pytest.fixture(autouse=True)
def clear_state():
    """Reset in-memory state before every test so tests don't affect each other."""
    EVENTS.clear()
    ALERTS.clear()
    SEEN_EVENT_IDS.clear()
    EVENT_COUNTS.clear()
    RATE_LIMIT.clear()
    yield


@pytest.fixture()
def client():
    """Return a Flask test client."""
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


# ---------------------------------------------------------------------------
# Original /api/ routes
# ---------------------------------------------------------------------------

class TestOriginalRoutes:

    def test_health_returns_200(self, client):
        r = client.get("/api/health")
        assert r.status_code == 200
        data = r.get_json()
        assert data["status"] == "ok"
        assert "uptime_seconds" in data

    def test_post_event_returns_201(self, client):
        r = client.post("/api/events", json=make_event())
        assert r.status_code == 201
        assert r.get_json()["ok"] is True

    def test_post_event_missing_fields_returns_400(self, client):
        r = client.post("/api/events", json={"event_id": "x"})
        assert r.status_code == 400

    def test_post_event_duplicate_returns_409(self, client):
        ev = make_event()
        client.post("/api/events", json=ev)
        r = client.post("/api/events", json=ev)
        assert r.status_code == 409

    def test_get_events_returns_list(self, client):
        client.post("/api/events", json=make_event("e1"))
        client.post("/api/events", json=make_event("e2", event_type="login_failure"))
        r = client.get("/api/events")
        assert r.status_code == 200
        events = r.get_json()
        assert len(events) == 2

    def test_get_events_filter_by_event_type(self, client):
        client.post("/api/events", json=make_event("e1", event_type="network_traffic"))
        client.post("/api/events", json=make_event("e2", event_type="login_failure"))
        r = client.get("/api/events?event_type=login_failure")
        data = r.get_json()
        assert len(data) == 1
        assert data[0]["event_type"] == "login_failure"

    def test_get_events_filter_by_min_severity(self, client):
        client.post("/api/events", json=make_event("e1", severity="low"))
        client.post("/api/events", json=make_event("e2", severity="high"))
        r = client.get("/api/events?min_severity=high")
        data = r.get_json()
        assert len(data) == 1
        assert data[0]["severity"] == "high"

    def test_get_alerts_returns_list(self, client):
        r = client.get("/api/alerts")
        assert r.status_code == 200
        assert isinstance(r.get_json(), list)

    def test_get_stats_structure(self, client):
        client.post("/api/events", json=make_event("e1", event_type="login_failure"))
        r = client.get("/api/stats")
        assert r.status_code == 200
        data = r.get_json()
        assert "total_events" in data
        assert "total_alerts" in data
        assert "by_type" in data
        assert data["total_events"] == 1


# ---------------------------------------------------------------------------
# Alert rules
# ---------------------------------------------------------------------------

class TestAlertRules:

    def test_suspicious_ip_triggers_critical_alert(self, client):
        ev = make_event("e1", event_type="suspicious_ip", severity="critical")
        ev["metadata"] = {"watchlist_match": True, "watchlist_size": 5}
        client.post("/api/events", json=ev)
        alerts = client.get("/api/alerts").get_json()
        assert len(alerts) == 1
        assert alerts[0]["severity"] == "critical"

    def test_high_failed_logins_triggers_alert(self, client):
        ev = make_event("e1", event_type="login_failure", severity="high")
        ev["metadata"] = {"failed_attempts": 15, "window_seconds": 120}
        client.post("/api/events", json=ev)
        alerts = client.get("/api/alerts").get_json()
        assert len(alerts) == 1
        assert alerts[0]["severity"] == "high"

    def test_low_failed_logins_no_alert(self, client):
        ev = make_event("e1", event_type="login_failure")
        ev["metadata"] = {"failed_attempts": 3, "window_seconds": 120}
        client.post("/api/events", json=ev)
        alerts = client.get("/api/alerts").get_json()
        assert len(alerts) == 0

    def test_file_deleted_triggers_alert(self, client):
        ev = make_event("e1", event_type="file_change")
        ev["metadata"] = {"file": "users.db", "action": "deleted"}
        client.post("/api/events", json=ev)
        alerts = client.get("/api/alerts").get_json()
        assert len(alerts) == 1
        assert alerts[0]["severity"] == "high"

    def test_file_modified_no_alert(self, client):
        ev = make_event("e1", event_type="file_change")
        ev["metadata"] = {"file": "config.ini", "action": "modified"}
        client.post("/api/events", json=ev)
        alerts = client.get("/api/alerts").get_json()
        assert len(alerts) == 0


# ---------------------------------------------------------------------------
# /api/v1/ alias routes
# ---------------------------------------------------------------------------

class TestV1Routes:

    def test_v1_health_returns_200(self, client):
        r = client.get("/api/v1/health")
        assert r.status_code == 200
        data = r.get_json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "active_threads" in data
        assert "database" in data

    def test_v1_events_paginated_structure(self, client):
        client.post("/api/events", json=make_event("e1"))
        client.post("/api/events", json=make_event("e2"))
        r = client.get("/api/v1/events")
        assert r.status_code == 200
        data = r.get_json()
        # Must have pagination wrapper
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "pageSize" in data
        assert data["total"] == 2

    def test_v1_events_field_mapping(self, client):
        """Backend source_ip and message must be mapped to source and description."""
        ev = make_event("e1", source_ip="192.0.2.55", message="hello world")
        client.post("/api/events", json=ev)
        r = client.get("/api/v1/events")
        item = r.get_json()["items"][0]
        assert item["source"] == "192.0.2.55"
        assert item["description"] == "hello world"
        assert item["processing_status"] == "processed"
        assert item["is_simulated"] is False

    def test_v1_events_search_filter(self, client):
        client.post("/api/events", json=make_event("e1", event_type="network_traffic", message="bytes overflow"))
        client.post("/api/events", json=make_event("e2", event_type="login_failure", message="bad password"))
        r = client.get("/api/v1/events?search=bytes")
        data = r.get_json()
        assert data["total"] == 1
        assert data["items"][0]["event_id"] == "e1"

    def test_v1_events_pagination(self, client):
        for i in range(5):
            client.post("/api/events", json=make_event(f"e{i}"))
        r = client.get("/api/v1/events?page=1&pageSize=2")
        data = r.get_json()
        assert data["total"] == 5
        assert len(data["items"]) == 2

    def test_v1_event_by_id_found(self, client):
        client.post("/api/events", json=make_event("evt_unique"))
        r = client.get("/api/v1/events/evt_unique")
        assert r.status_code == 200
        assert r.get_json()["event_id"] == "evt_unique"

    def test_v1_event_by_id_not_found(self, client):
        r = client.get("/api/v1/events/nonexistent")
        assert r.status_code == 404

    def test_v1_alerts_field_mapping(self, client):
        """Alert from backend must have the richer AlertItem fields."""
        ev = make_event("e1", event_type="suspicious_ip", severity="critical")
        ev["metadata"] = {"watchlist_match": True, "watchlist_size": 5}
        client.post("/api/events", json=ev)
        r = client.get("/api/v1/alerts")
        assert r.status_code == 200
        alerts = r.get_json()
        assert len(alerts) == 1
        a = alerts[0]
        assert "title" in a
        assert "detection_rule" in a
        assert "detection_reason" in a
        assert "time_detected" in a
        assert "related_event_ids" in a
        assert "suggested_investigation_steps" in a
        assert a["is_simulated"] is False

    def test_v1_alert_acknowledge(self, client):
        ev = make_event("e1", event_type="suspicious_ip", severity="critical")
        ev["metadata"] = {"watchlist_match": True, "watchlist_size": 5}
        client.post("/api/events", json=ev)
        alert_id = client.get("/api/v1/alerts").get_json()[0]["alert_id"]
        r = client.patch(f"/api/v1/alerts/{alert_id}/acknowledge",
                         json={"actor": "test_analyst"})
        assert r.status_code == 200
        assert r.get_json()["status"] == "acknowledged"
        # Confirm status changed in the alerts list
        updated = client.get("/api/v1/alerts").get_json()[0]
        assert updated["status"] == "acknowledged"

    def test_v1_alert_resolve(self, client):
        ev = make_event("e1", event_type="suspicious_ip", severity="critical")
        ev["metadata"] = {"watchlist_match": True, "watchlist_size": 5}
        client.post("/api/events", json=ev)
        alert_id = client.get("/api/v1/alerts").get_json()[0]["alert_id"]
        r = client.patch(f"/api/v1/alerts/{alert_id}/resolve",
                         json={"actor": "test_admin", "resolution_notes": "Confirmed benign."})
        assert r.status_code == 200
        assert r.get_json()["status"] == "resolved"

    def test_v1_alert_not_found(self, client):
        r = client.patch("/api/v1/alerts/nonexistent/acknowledge", json={})
        assert r.status_code == 404

    def test_v1_dashboard_summary_structure(self, client):
        client.post("/api/events", json=make_event("e1", event_type="login_failure", severity="high"))
        r = client.get("/api/v1/dashboard/summary")
        assert r.status_code == 200
        data = r.get_json()
        required_keys = [
            "total_events", "open_alerts", "high_severity_alerts",
            "failed_login_attempts", "workers_running", "workers_total",
            "api_health", "uptime_seconds", "events_trend",
            "severity_distribution", "category_distribution", "is_simulated"
        ]
        for key in required_keys:
            assert key in data, f"Missing key: {key}"
        assert data["is_simulated"] is False
        assert data["total_events"] == 1

    def test_v1_auth_login_returns_token(self, client):
        r = client.post("/api/v1/auth/login", json={"username": "admin", "password": "any"})
        assert r.status_code == 200
        data = r.get_json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"

    def test_v1_auth_login_role_mapping(self, client):
        r = client.post("/api/v1/auth/login", json={"username": "analyst", "password": "x"})
        assert r.get_json()["user"]["role"] == "analyst"

    def test_v1_auth_me(self, client):
        r = client.get("/api/v1/auth/me",
                       headers={"Authorization": "Bearer live_token_admin_123"})
        assert r.status_code == 200
        data = r.get_json()
        assert "role" in data
        assert data["role"] == "admin"

    def test_v1_auth_logout(self, client):
        r = client.post("/api/v1/auth/logout")
        assert r.status_code == 200
        assert r.get_json()["ok"] is True

    def test_v1_watchlist_returns_list(self, client):
        r = client.get("/api/v1/watchlist")
        assert r.status_code == 200
        data = r.get_json()
        assert isinstance(data, list)
        # watchlist.txt has 5 IPs
        assert len(data) >= 1
        entry = data[0]
        assert "ip_address" in entry
        assert "status" in entry

    def test_v1_watchlist_add(self, client):
        r = client.post("/api/v1/watchlist",
                        json={"ip_address": "10.0.0.99", "reason": "Test entry"})
        assert r.status_code == 201
        data = r.get_json()
        assert data["ip_address"] == "10.0.0.99"

    def test_v1_watchlist_add_missing_ip(self, client):
        r = client.post("/api/v1/watchlist", json={"reason": "no ip"})
        assert r.status_code == 400

    def test_v1_watchlist_delete(self, client):
        r = client.delete("/api/v1/watchlist/wl_001")
        assert r.status_code == 200
        assert r.get_json()["ok"] is True

    def test_v1_fim_files_returns_list(self, client):
        r = client.get("/api/v1/fim/files")
        assert r.status_code == 200
        data = r.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
        entry = data[0]
        for key in ["id", "file_path", "status", "baseline_hash", "current_hash", "algorithm"]:
            assert key in entry, f"Missing FIM key: {key}"
        assert entry["algorithm"] == "SHA-256"

    def test_v1_fim_modified_file_detected(self, client):
        """First file should always show as modified (hash drift simulated)."""
        r = client.get("/api/v1/fim/files")
        entries = r.get_json()
        first = entries[0]
        assert first["status"] == "modified"
        assert first["baseline_hash"] != first["current_hash"]
        assert first["alert_triggered"] is True

    def test_v1_fim_summary(self, client):
        r = client.get("/api/v1/fim/summary")
        assert r.status_code == 200
        data = r.get_json()
        assert "total_files" in data
        assert "modified_count" in data

    def test_v1_workers_structure(self, client):
        r = client.get("/api/v1/workers")
        assert r.status_code == 200
        data = r.get_json()
        assert "workers" in data
        assert "queue_metrics" in data
        assert len(data["workers"]) == 4
        w = data["workers"][0]
        for key in ["id", "name", "task_type", "status", "events_processed"]:
            assert key in w

    def test_v1_reports_summary(self, client):
        client.post("/api/events", json=make_event("e1"))
        r = client.get("/api/v1/reports/summary")
        assert r.status_code == 200
        data = r.get_json()
        assert data["total_events"] == 1
        assert "generated_at" in data

    def test_v1_audit_empty_initially(self, client):
        r = client.get("/api/v1/audit")
        assert r.status_code == 200
        assert r.get_json() == []

    def test_v1_audit_records_resolution(self, client):
        """After resolving an alert, it must appear in the audit log."""
        ev = make_event("e1", event_type="suspicious_ip", severity="critical")
        ev["metadata"] = {"watchlist_match": True, "watchlist_size": 5}
        client.post("/api/events", json=ev)
        alert_id = client.get("/api/v1/alerts").get_json()[0]["alert_id"]
        client.patch(f"/api/v1/alerts/{alert_id}/resolve",
                     json={"actor": "tester", "resolution_notes": "Test pass."})
        r = client.get("/api/v1/audit")
        logs = r.get_json()
        assert len(logs) >= 1
        assert logs[0]["action"] == "RESOLVE_ALERT"
        assert logs[0]["actor"] == "tester"

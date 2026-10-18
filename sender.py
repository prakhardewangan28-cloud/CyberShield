import requests
from config import SERVER_URL

def send_event(event):
    """Send event to receiver via HTTP POST"""
    try:
        # POST event with timeout
        response = requests.post(SERVER_URL, json=event, timeout=5)
        # Print success message
        event_id = event.get("event_id", "unknown")
        print(f"sent {event_id} -> {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        # Print error message
        print(f"POST failed: {e}")
        return False

if __name__ == "__main__":
    # Hardcoded test event
    test_event = {
        "event_id": "evt_test001",
        "timestamp": "2026-10-18T12:00:00Z",
        "event_type": "network_traffic",
        "source_ip": "192.0.2.10",
        "severity": "low",
        "message": "test event",
        "metadata": {"bytes": 1024, "packets": 10}
    }
    
    # Send test event
    send_event(test_event)

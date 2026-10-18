import random
import time
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import LOGIN_INTERVAL
from sender import send_event

def run(stop_event):
    """Generate login failure events"""
    while not stop_event.is_set():
        try:
            # Generate random failed attempts
            failed_attempts = random.randint(1, 15)
            
            # Determine severity based on attempt count
            severity = "high" if failed_attempts >= 10 else "medium"
            
            # Build event dictionary
            event = {
                "event_id": f"evt_{random.randint(1000, 9999)}",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "event_type": "login_failure",
                "source_ip": f"192.0.2.{random.randint(1, 254)}",
                "severity": severity,
                "message": f"Repeated failed login attempts detected: {failed_attempts} attempts",
                "metadata": {"failed_attempts": failed_attempts, "window_seconds": 120}
            }
            
            # Send event
            send_event(event)
            
        except Exception as e:
            print(f"[login] error: {e}")
        
        # Sleep for random interval
        time.sleep(random.uniform(*LOGIN_INTERVAL))

if __name__ == "__main__":
    import threading
    stop = threading.Event()
    try:
        run(stop)
    except KeyboardInterrupt:
        stop.set()

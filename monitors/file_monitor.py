import random
import time
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import FILE_INTERVAL, PROTECTED_FILES
from sender import send_event

def run(stop_event):
    """Generate file change events for protected files"""
    actions = ["modified", "deleted", "created"]
    
    while not stop_event.is_set():
        try:
            # Pick random file and action
            filename = random.choice(PROTECTED_FILES)
            action = random.choice(actions)
            
            # Determine severity based on action
            if action == "deleted":
                severity = "high"
            elif action in ("modified", "created"):
                severity = "medium"
            
            # Build event dictionary
            event = {
                "event_id": f"evt_{random.randint(1000, 9999)}",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "event_type": "file_change",
                "source_ip": "127.0.0.1",  # Local host - file events originate from the local system
                "severity": severity,
                "message": f"File {action}: {filename}",
                "metadata": {"file": filename, "action": action}
            }
            
            # Send event
            send_event(event)
            
        except Exception as e:
            print(f"[file] error: {e}")
        
        # Sleep for random interval
        time.sleep(random.uniform(*FILE_INTERVAL))

if __name__ == "__main__":
    import threading
    stop = threading.Event()
    try:
        run(stop)
    except KeyboardInterrupt:
        stop.set()

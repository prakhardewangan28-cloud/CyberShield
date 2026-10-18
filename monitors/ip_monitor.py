import random
import time
import sys
import os
import threading

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import IP_INTERVAL, WATCHLIST_FILE
from sender import send_event

# Module-level lock for thread-safe watchlist updates
watchlist_lock = threading.Lock()

def load_watchlist():
    """Load watchlist IPs from file, skip comments and blank lines"""
    try:
        watchlist = []
        with open(WATCHLIST_FILE, "r") as f:
            for line in f:
                line = line.strip()
                # Skip blank lines and comments
                if line and not line.startswith("#"):
                    watchlist.append(line)
        return watchlist
    except FileNotFoundError:
        print("[ip] watchlist file not found, using empty list")
        return []

# Load watchlist once at module startup
WATCHLIST = load_watchlist()

def reload_watchlist():
    """Reload watchlist from file and update global WATCHLIST"""
    new_list = load_watchlist()
    with watchlist_lock:
        WATCHLIST.clear()
        WATCHLIST.extend(new_list)
    return len(WATCHLIST)

def run(stop_event):
    """Monitor for suspicious IPs from watchlist"""
    while not stop_event.is_set():
        try:
            # Pick random IP from 192.0.2.0/24 range
            ip = f"192.0.2.{random.randint(1, 254)}"
            
            # Only emit event if IP is in watchlist
            if ip in WATCHLIST:
                # Build suspicious_ip event
                event = {
                    "event_id": f"evt_{random.randint(1000, 9999)}",
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "event_type": "suspicious_ip",
                    "source_ip": ip,
                    "severity": "critical",
                    "message": "Source IP matches watchlist",
                    "metadata": {"watchlist_match": True, "watchlist_size": len(WATCHLIST)}
                }
                
                # Send event
                send_event(event)
            
        except Exception as e:
            print(f"[ip] error: {e}")
        
        # Sleep for random interval
        time.sleep(random.uniform(*IP_INTERVAL))

if __name__ == "__main__":
    import threading
    # Note: with only 5 IPs in watchlist out of 253 possible,
    # most iterations will not emit events (this is expected behavior)
    stop = threading.Event()
    try:
        run(stop)
    except KeyboardInterrupt:
        stop.set()

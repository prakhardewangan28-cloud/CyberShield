import random
import time
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import NETWORK_INTERVAL
from sender import send_event

def run(stop_event):
    """Generate network traffic events"""
    while not stop_event.is_set():
        try:
            # Generate random bytes and packets
            bytes_count = random.randint(100, 10000)
            packets_count = random.randint(1, 500)
            
            # Build event dictionary
            event = {
                "event_id": f"evt_{random.randint(1000, 9999)}",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "event_type": "network_traffic",
                "source_ip": f"192.0.2.{random.randint(1, 254)}",
                "severity": random.choice(["low", "low", "medium", "medium", "high"]),
                "message": f"Network traffic detected: {bytes_count} bytes",
                "metadata": {"bytes": bytes_count, "packets": packets_count}
            }
            
            # Send event
            send_event(event)
            
        except Exception as e:
            print(f"[network] error: {e}")
        
        # Sleep for random interval
        time.sleep(random.uniform(*NETWORK_INTERVAL))

if __name__ == "__main__":
    import threading
    stop = threading.Event()
    try:
        run(stop)
    except KeyboardInterrupt:
        stop.set()

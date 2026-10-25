import threading
import time
import requests
import sys
from monitors import network_monitor, login_monitor, ip_monitor, file_monitor
from config import RUN_SECONDS, SERVER_URL

def main(run_seconds=RUN_SECONDS):
    """Main orchestrator for all monitor threads"""
    # Create stop event for coordinating shutdown
    stop_event = threading.Event()
    start_time = time.time()
    
    # Define monitor specifications (name, target function)
    monitor_specs = [
        ("network", network_monitor.run),
        ("login",   login_monitor.run),
        ("ip",      ip_monitor.run),
        ("file",    file_monitor.run),
    ]
    
    # Create and start all threads
    threads = []
    for name, target in monitor_specs:
        t = threading.Thread(target=target, args=(stop_event,), name=name, daemon=True)
        threads.append(t)
        t.start()
        print(f"[main] started thread: {name}")
    
    print(f"[main] all monitors started, running for {run_seconds} seconds")
    
    try:
        time.sleep(run_seconds)
    except KeyboardInterrupt:
        print("[main] interrupted by user")
    finally:
        print("[main] stopping all threads...")
        stop_event.set()
        
        for t in threads:
            t.join(timeout=5)
            print(f"[main] thread {t.name} stopped (alive={t.is_alive()})")
        
        print("[main] shutdown complete")
        
        # Fetch and display run summary
        try:
            stats_url = SERVER_URL.replace("/events", "/stats")
            r = requests.get(stats_url, timeout=5)
            stats = r.json()
            elapsed = time.time() - start_time
            print("[main] === RUN SUMMARY ===")
            print(f"[main] total events: {stats['total_events']}")
            print(f"[main] total alerts: {stats['total_alerts']}")
            for etype, count in sorted(stats["by_type"].items()):
                print(f"[main] {etype}: {count}")
            print(f"[main] run duration: {elapsed:.1f}s")
        except Exception as e:
            print(f"[main] could not fetch summary: {e}")

if __name__ == "__main__":
    run_seconds = RUN_SECONDS
    source = "config"
    
    if len(sys.argv) > 1:
        try:
            run_seconds = int(sys.argv[1])
            source = "CLI"
        except ValueError:
            print(f"[main] warning: invalid duration argument '{sys.argv[1]}', using default {RUN_SECONDS}s")
    
    print(f"[main] run duration: {run_seconds}s (from {source})")
    main(run_seconds)

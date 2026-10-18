# Configuration for CyberShield simulator

# HTTP receiver endpoint
SERVER_URL = "http://127.0.0.1:5000/api/events"

# Simulation runtime in seconds
RUN_SECONDS = 30

# IP watchlist file path
WATCHLIST_FILE = "watchlist.txt"

# Protected files to monitor
PROTECTED_FILES = ["config.ini", "users.db", "app.log"]

# Event generation intervals (min, max) in seconds
NETWORK_INTERVAL = (1, 3)
LOGIN_INTERVAL = (2, 4)
IP_INTERVAL = (3, 5)
FILE_INTERVAL = (4, 6)

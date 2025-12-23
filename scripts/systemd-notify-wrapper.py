#!/usr/bin/env python3
# systemd-notify wrapper for TSiJUKEBOX
# Version: 4.1.0
# Last updated: 2025-12-23T04:48:50.609Z

"""
Wrapper script for systemd-notify integration.
Allows the application to communicate with systemd.
"""

import os
import socket

def notify(state: str) -> bool:
    """Send notification to systemd."""
    notify_socket = os.environ.get("NOTIFY_SOCKET")
    if not notify_socket:
        return False
    
    try:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
        if notify_socket.startswith("@"):
            notify_socket = "\0" + notify_socket[1:]
        sock.connect(notify_socket)
        sock.sendall(state.encode())
        sock.close()
        return True
    except Exception:
        return False

def ready():
    """Notify systemd that service is ready."""
    return notify("READY=1")

def watchdog():
    """Send watchdog ping to systemd."""
    return notify("WATCHDOG=1")

if __name__ == "__main__":
    ready()
    print("Systemd notified: READY")

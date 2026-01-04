#!/usr/bin/env python3
"""
TSiJUKEBOX systemd-notify Wrapper v6.0.0
========================================
Wrapper script for systemd-notify integration.

Allows the TSiJUKEBOX application to communicate with systemd
for proper service lifecycle management.

FEATURES:
    - Notify systemd when service is ready (Type=notify)
    - Send watchdog pings for health monitoring
    - Report service status updates
    - Handle graceful shutdown signals

USO:
    # Como módulo Python
    from systemd_notify_wrapper import ready, watchdog, status
    
    ready()  # Notifica que serviço está pronto
    watchdog()  # Ping de watchdog
    status("Processando...")  # Atualiza status

    # Como script standalone
    python3 systemd-notify-wrapper.py ready
    python3 systemd-notify-wrapper.py watchdog
    python3 systemd-notify-wrapper.py status "Mensagem"

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import sys
import socket
import signal
import time
import threading
from typing import Optional, Callable
from pathlib import Path

VERSION = "6.0.0"


# =============================================================================
# CORE NOTIFICATION
# =============================================================================

def notify(state: str) -> bool:
    """
    Send notification to systemd.
    
    Args:
        state: Notification state string (e.g., "READY=1", "WATCHDOG=1")
    
    Returns:
        True if notification was sent successfully
    """
    notify_socket = os.environ.get("NOTIFY_SOCKET")
    if not notify_socket:
        return False
    
    try:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
        
        # Handle abstract sockets (start with @)
        if notify_socket.startswith("@"):
            notify_socket = "\0" + notify_socket[1:]
        
        sock.connect(notify_socket)
        sock.sendall(state.encode())
        sock.close()
        return True
        
    except socket.error as e:
        print(f"[systemd-notify] Socket error: {e}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"[systemd-notify] Error: {e}", file=sys.stderr)
        return False


# =============================================================================
# HIGH-LEVEL API
# =============================================================================

def ready() -> bool:
    """
    Notify systemd that the service is ready to serve.
    
    Call this after your service has completed initialization.
    
    Returns:
        True if notification was sent
    """
    return notify("READY=1")


def reloading() -> bool:
    """
    Notify systemd that the service is reloading configuration.
    
    Call ready() again when reload is complete.
    
    Returns:
        True if notification was sent
    """
    return notify("RELOADING=1")


def stopping() -> bool:
    """
    Notify systemd that the service is beginning shutdown.
    
    Returns:
        True if notification was sent
    """
    return notify("STOPPING=1")


def watchdog() -> bool:
    """
    Send a watchdog ping to systemd.
    
    If WatchdogSec is set in the unit file, this must be called
    periodically (at least once per WatchdogSec/2) to prevent
    systemd from killing the service.
    
    Returns:
        True if notification was sent
    """
    return notify("WATCHDOG=1")


def status(message: str) -> bool:
    """
    Update the service status message shown in systemctl status.
    
    Args:
        message: Human-readable status message
    
    Returns:
        True if notification was sent
    """
    return notify(f"STATUS={message}")


def errno(code: int) -> bool:
    """
    Report an error code to systemd.
    
    Args:
        code: Errno code
    
    Returns:
        True if notification was sent
    """
    return notify(f"ERRNO={code}")


def mainpid(pid: Optional[int] = None) -> bool:
    """
    Report the main PID to systemd.
    
    Args:
        pid: Process ID (defaults to current process)
    
    Returns:
        True if notification was sent
    """
    if pid is None:
        pid = os.getpid()
    return notify(f"MAINPID={pid}")


# =============================================================================
# WATCHDOG THREAD
# =============================================================================

class WatchdogThread(threading.Thread):
    """Background thread that sends periodic watchdog pings."""
    
    def __init__(self, interval: float = 5.0):
        """
        Initialize watchdog thread.
        
        Args:
            interval: Seconds between watchdog pings (should be < WatchdogSec/2)
        """
        super().__init__(daemon=True, name="systemd-watchdog")
        self.interval = interval
        self._stop_event = threading.Event()
    
    def run(self):
        """Run the watchdog ping loop."""
        while not self._stop_event.is_set():
            watchdog()
            self._stop_event.wait(self.interval)
    
    def stop(self):
        """Stop the watchdog thread."""
        self._stop_event.set()


def start_watchdog(interval: float = 5.0) -> WatchdogThread:
    """
    Start a background thread that sends watchdog pings.
    
    Args:
        interval: Seconds between pings
    
    Returns:
        WatchdogThread instance (call .stop() to terminate)
    """
    thread = WatchdogThread(interval)
    thread.start()
    return thread


# =============================================================================
# SIGNAL HANDLING
# =============================================================================

def setup_signal_handlers(
    on_reload: Optional[Callable] = None,
    on_stop: Optional[Callable] = None
):
    """
    Set up signal handlers for systemd integration.
    
    Args:
        on_reload: Callback for SIGHUP (reload)
        on_stop: Callback for SIGTERM (stop)
    """
    def handle_sighup(signum, frame):
        reloading()
        if on_reload:
            on_reload()
        ready()
    
    def handle_sigterm(signum, frame):
        stopping()
        if on_stop:
            on_stop()
        sys.exit(0)
    
    signal.signal(signal.SIGHUP, handle_sighup)
    signal.signal(signal.SIGTERM, handle_sigterm)


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_watchdog_usec() -> Optional[int]:
    """
    Get the watchdog timeout from environment.
    
    Returns:
        Watchdog timeout in microseconds, or None if not set
    """
    usec = os.environ.get("WATCHDOG_USEC")
    if usec:
        try:
            return int(usec)
        except ValueError:
            return None
    return None


def get_notify_socket() -> Optional[str]:
    """
    Get the notify socket path from environment.
    
    Returns:
        Socket path, or None if not running under systemd
    """
    return os.environ.get("NOTIFY_SOCKET")


def is_running_under_systemd() -> bool:
    """
    Check if the process is running under systemd.
    
    Returns:
        True if running under systemd with notification socket
    """
    return get_notify_socket() is not None


# =============================================================================
# CLI
# =============================================================================

def print_help():
    """Print CLI help."""
    print(f"""
TSiJUKEBOX systemd-notify Wrapper v{VERSION}

USAGE:
    python3 systemd-notify-wrapper.py <command> [args]

COMMANDS:
    ready           Notify that service is ready
    reloading       Notify that service is reloading
    stopping        Notify that service is stopping
    watchdog        Send watchdog ping
    status <msg>    Update status message
    mainpid [pid]   Report main PID

EXAMPLES:
    python3 systemd-notify-wrapper.py ready
    python3 systemd-notify-wrapper.py status "Processing requests"
    python3 systemd-notify-wrapper.py watchdog

ENVIRONMENT:
    NOTIFY_SOCKET   Path to systemd notification socket
    WATCHDOG_USEC   Watchdog timeout in microseconds
""")


def main() -> int:
    """CLI entry point."""
    if len(sys.argv) < 2:
        print_help()
        return 0
    
    command = sys.argv[1].lower()
    
    if command in ('-h', '--help', 'help'):
        print_help()
        return 0
    
    if command == 'ready':
        success = ready()
        if success:
            print("Notified: READY=1")
        else:
            print("Failed to notify (NOTIFY_SOCKET not set?)", file=sys.stderr)
        return 0 if success else 1
    
    elif command == 'reloading':
        success = reloading()
        print("Notified: RELOADING=1" if success else "Failed")
        return 0 if success else 1
    
    elif command == 'stopping':
        success = stopping()
        print("Notified: STOPPING=1" if success else "Failed")
        return 0 if success else 1
    
    elif command == 'watchdog':
        success = watchdog()
        print("Notified: WATCHDOG=1" if success else "Failed")
        return 0 if success else 1
    
    elif command == 'status':
        if len(sys.argv) < 3:
            print("Error: status requires a message", file=sys.stderr)
            return 1
        message = " ".join(sys.argv[2:])
        success = status(message)
        print(f"Notified: STATUS={message}" if success else "Failed")
        return 0 if success else 1
    
    elif command == 'mainpid':
        pid = int(sys.argv[2]) if len(sys.argv) > 2 else None
        success = mainpid(pid)
        print(f"Notified: MAINPID={pid or os.getpid()}" if success else "Failed")
        return 0 if success else 1
    
    elif command == 'info':
        print(f"Version: {VERSION}")
        print(f"NOTIFY_SOCKET: {get_notify_socket() or '(not set)'}")
        print(f"WATCHDOG_USEC: {get_watchdog_usec() or '(not set)'}")
        print(f"Running under systemd: {is_running_under_systemd()}")
        return 0
    
    else:
        print(f"Unknown command: {command}", file=sys.stderr)
        print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())

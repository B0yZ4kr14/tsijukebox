#!/usr/bin/env python3
# TSiJUKEBOX Service Diagnostics
# Version: 4.1.0
# Last updated: 2025-12-23T02:37:23.260Z

"""
Service Diagnostics Tool

Checks the health of TSiJUKEBOX services and provides auto-fix capabilities.
"""

import os
import sys
import subprocess

VERSION = "4.1.0"

def check_service_status(service_name: str) -> dict:
    """Check if a systemd service is running."""
    try:
        result = subprocess.run(
            ["systemctl", "is-active", service_name],
            capture_output=True,
            text=True
        )
        return {
            "service": service_name,
            "status": result.stdout.strip(),
            "running": result.returncode == 0
        }
    except Exception as e:
        return {"service": service_name, "status": "error", "error": str(e)}

def main():
    """Main diagnostic entry point."""
    print(f"TSiJUKEBOX Service Diagnostics v{VERSION}")
    print("=" * 50)
    
    services = [
        "tsijukebox",
        "tsijukebox-kiosk",
    ]
    
    for service in services:
        status = check_service_status(service)
        icon = "✅" if status.get("running") else "❌"
        print(f"{icon} {service}: {status.get('status', 'unknown')}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

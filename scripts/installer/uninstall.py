#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Enterprise - Uninstaller
# Complete removal and cleanup utility
# =============================================================================

import subprocess
import shutil
import os
from pathlib import Path
from typing import Optional, List, Dict
from dataclasses import dataclass

from .utils.logger import Logger

@dataclass
class UninstallResult:
    """Uninstallation result."""
    success: bool
    removed_files: List[Path]
    removed_packages: List[str]
    errors: List[str]
    preserved: List[Path]

class Uninstaller:
    """
    Handles complete removal of TSiJUKEBOX and related components.
    Supports selective uninstallation and data preservation.
    """
    
    # Paths to remove
    INSTALL_PATHS = [
        Path("/opt/tsijukebox"),
        Path("/var/log/tsijukebox"),
        Path("/var/lib/tsijukebox"),
    ]
    
    CONFIG_PATHS = [
        Path("/etc/tsijukebox"),
        Path.home() / ".config" / "tsijukebox",
        Path.home() / ".local" / "share" / "tsijukebox",
    ]
    
    SYSTEMD_SERVICES = [
        "tsijukebox.service",
        "tsijukebox-docker.service",
        "tsijukebox-backup-storj.timer",
        "tsijukebox-backup-storj.service",
    ]
    
    PACKAGES = [
        "tsijukebox",  # AUR package
    ]
    
    OPTIONAL_PACKAGES = [
        "spicetify-cli",
        "spotify",
    ]
    
    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger or Logger()
    
    def _run_command(
        self, 
        cmd: List[str],
        capture: bool = True
    ) -> tuple[int, str, str]:
        """Run a shell command."""
        self.logger.debug(f"Running: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                timeout=120
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            self.logger.error(f"Command failed: {e}")
            return 1, "", str(e)
    
    def detect_installation(self) -> Dict[str, bool]:
        """Detect what TSiJUKEBOX components are installed."""
        detected = {
            "app_installed": False,
            "config_exists": False,
            "data_exists": False,
            "services_exist": False,
            "docker_exists": False,
            "user_exists": False,
        }
        
        # Check installation paths
        for path in self.INSTALL_PATHS:
            if path.exists():
                detected["app_installed"] = True
                break
        
        # Check config paths
        for path in self.CONFIG_PATHS:
            if path.exists():
                detected["config_exists"] = True
                break
        
        # Check data
        data_path = Path.home() / ".local" / "share" / "tsijukebox"
        detected["data_exists"] = data_path.exists() and any(data_path.iterdir()) if data_path.exists() else False
        
        # Check systemd services
        for service in self.SYSTEMD_SERVICES:
            code, _, _ = self._run_command(
                ["systemctl", "list-unit-files", service],
                capture=True
            )
            if code == 0:
                detected["services_exist"] = True
                break
        
        # Check Docker
        code, out, _ = self._run_command(
            ["docker", "ps", "-a", "--filter", "label=com.tsijukebox.service", "-q"],
            capture=True
        )
        detected["docker_exists"] = code == 0 and bool(out.strip())
        
        # Check user
        try:
            import pwd
            pwd.getpwnam("tsi")
            detected["user_exists"] = True
        except (KeyError, ImportError):
            pass
        
        return detected
    
    def stop_services(self) -> bool:
        """Stop all TSiJUKEBOX services."""
        self.logger.info("Stopping services...")
        
        for service in self.SYSTEMD_SERVICES:
            self._run_command(
                ["sudo", "systemctl", "stop", service],
                capture=True
            )
            self._run_command(
                ["sudo", "systemctl", "disable", service],
                capture=True
            )
        
        return True
    
    def stop_docker(self) -> bool:
        """Stop and remove Docker containers."""
        self.logger.info("Stopping Docker containers...")
        
        # Get container IDs
        code, out, _ = self._run_command(
            ["docker", "ps", "-a", "--filter", "label=com.tsijukebox.service", "-q"],
            capture=True
        )
        
        if code == 0 and out.strip():
            containers = out.strip().split("\n")
            
            for container_id in containers:
                self._run_command(["docker", "stop", container_id], capture=True)
                self._run_command(["docker", "rm", container_id], capture=True)
        
        return True
    
    def remove_packages(self, include_optional: bool = False) -> List[str]:
        """Remove installed packages."""
        self.logger.info("Removing packages...")
        
        removed = []
        packages = self.PACKAGES.copy()
        
        if include_optional:
            packages.extend(self.OPTIONAL_PACKAGES)
        
        for package in packages:
            # Check if installed
            code, _, _ = self._run_command(
                ["pacman", "-Qi", package],
                capture=True
            )
            
            if code == 0:
                code, _, err = self._run_command(
                    ["sudo", "pacman", "-Rns", "--noconfirm", package],
                    capture=True
                )
                
                if code == 0:
                    removed.append(package)
                    self.logger.info(f"Removed package: {package}")
                else:
                    self.logger.warning(f"Failed to remove {package}: {err}")
        
        return removed
    
    def remove_files(
        self, 
        include_config: bool = True,
        include_data: bool = False
    ) -> List[Path]:
        """Remove installation files."""
        self.logger.info("Removing files...")
        
        removed = []
        
        # Always remove installation paths
        for path in self.INSTALL_PATHS:
            if path.exists():
                try:
                    if path.is_dir():
                        shutil.rmtree(path)
                    else:
                        path.unlink()
                    removed.append(path)
                    self.logger.info(f"Removed: {path}")
                except PermissionError:
                    # Try with sudo
                    code, _, _ = self._run_command(
                        ["sudo", "rm", "-rf", str(path)],
                        capture=True
                    )
                    if code == 0:
                        removed.append(path)
                        self.logger.info(f"Removed: {path}")
        
        # Optionally remove config
        if include_config:
            for path in self.CONFIG_PATHS:
                if path.exists():
                    try:
                        if path.is_dir():
                            shutil.rmtree(path)
                        else:
                            path.unlink()
                        removed.append(path)
                        self.logger.info(f"Removed config: {path}")
                    except PermissionError:
                        self._run_command(
                            ["sudo", "rm", "-rf", str(path)],
                            capture=True
                        )
                        removed.append(path)
        
        # Optionally remove data
        if include_data:
            data_paths = [
                Path.home() / ".local" / "share" / "tsijukebox",
                Path.home() / "Music" / "tsijukebox",
            ]
            
            for path in data_paths:
                if path.exists():
                    shutil.rmtree(path)
                    removed.append(path)
                    self.logger.info(f"Removed data: {path}")
        
        # Remove systemd service files
        for service in self.SYSTEMD_SERVICES:
            service_path = Path(f"/etc/systemd/system/{service}")
            if service_path.exists():
                self._run_command(
                    ["sudo", "rm", str(service_path)],
                    capture=True
                )
                removed.append(service_path)
        
        # Reload systemd
        self._run_command(["sudo", "systemctl", "daemon-reload"], capture=True)
        
        return removed
    
    def remove_user(self, username: str = "tsi", remove_home: bool = False) -> bool:
        """Remove TSiJUKEBOX system user."""
        self.logger.info(f"Removing user: {username}")
        
        cmd = ["sudo", "userdel"]
        if remove_home:
            cmd.append("-r")
        cmd.append(username)
        
        code, _, err = self._run_command(cmd, capture=True)
        
        if code == 0:
            self.logger.success(f"User removed: {username}")
            return True
        else:
            self.logger.warning(f"Failed to remove user: {err}")
            return False
    
    def remove_docker_resources(self, remove_volumes: bool = False) -> bool:
        """Remove Docker resources."""
        self.logger.info("Removing Docker resources...")
        
        # Remove containers
        self.stop_docker()
        
        # Remove images
        code, out, _ = self._run_command(
            ["docker", "images", "--filter", "label=com.tsijukebox", "-q"],
            capture=True
        )
        
        if code == 0 and out.strip():
            for image_id in out.strip().split("\n"):
                self._run_command(["docker", "rmi", image_id], capture=True)
        
        # Remove volumes
        if remove_volumes:
            volumes = ["tsijukebox-data", "tsijukebox-logs"]
            for vol in volumes:
                self._run_command(["docker", "volume", "rm", vol], capture=True)
        
        # Remove network
        self._run_command(
            ["docker", "network", "rm", "tsijukebox-network"],
            capture=True
        )
        
        return True
    
    def clean_spicetify(self) -> bool:
        """Restore Spotify and remove Spicetify."""
        self.logger.info("Cleaning Spicetify...")
        
        # Restore Spotify
        code, _, _ = self._run_command(
            ["spicetify", "restore"],
            capture=True
        )
        
        # Remove Spicetify config
        spicetify_paths = [
            Path.home() / ".spicetify",
            Path.home() / ".config" / "spicetify",
        ]
        
        for path in spicetify_paths:
            if path.exists():
                shutil.rmtree(path)
                self.logger.info(f"Removed: {path}")
        
        return True
    
    def uninstall(
        self,
        remove_config: bool = True,
        remove_data: bool = False,
        remove_packages: bool = True,
        remove_optional_packages: bool = False,
        remove_user: bool = False,
        remove_docker: bool = True,
        remove_spicetify: bool = True,
        dry_run: bool = False
    ) -> UninstallResult:
        """
        Complete uninstallation of TSiJUKEBOX.
        
        Args:
            remove_config: Remove configuration files
            remove_data: Remove user data (music library, etc.)
            remove_packages: Remove pacman/AUR packages
            remove_optional_packages: Remove optional packages (Spotify, etc.)
            remove_user: Remove TSiJUKEBOX system user
            remove_docker: Remove Docker resources
            remove_spicetify: Restore Spotify and remove Spicetify
            dry_run: Only show what would be removed
        """
        self.logger.info("Starting TSiJUKEBOX uninstallation...")
        
        if dry_run:
            self.logger.info("DRY RUN - No changes will be made")
        
        removed_files = []
        removed_pkgs = []
        errors = []
        preserved = []
        
        try:
            # Stop services first
            if not dry_run:
                self.stop_services()
            
            # Docker cleanup
            if remove_docker:
                if dry_run:
                    self.logger.info("Would remove Docker containers and resources")
                else:
                    self.remove_docker_resources(remove_volumes=remove_data)
            
            # Spicetify cleanup
            if remove_spicetify:
                if dry_run:
                    self.logger.info("Would restore Spotify and remove Spicetify")
                else:
                    self.clean_spicetify()
            
            # Remove files
            if dry_run:
                for path in self.INSTALL_PATHS:
                    if path.exists():
                        self.logger.info(f"Would remove: {path}")
                if remove_config:
                    for path in self.CONFIG_PATHS:
                        if path.exists():
                            self.logger.info(f"Would remove config: {path}")
            else:
                removed_files = self.remove_files(
                    include_config=remove_config,
                    include_data=remove_data
                )
            
            # Remove packages
            if remove_packages:
                if dry_run:
                    self.logger.info(f"Would remove packages: {self.PACKAGES}")
                    if remove_optional_packages:
                        self.logger.info(f"Would remove optional: {self.OPTIONAL_PACKAGES}")
                else:
                    removed_pkgs = self.remove_packages(include_optional=remove_optional_packages)
            
            # Remove user
            if remove_user:
                if dry_run:
                    self.logger.info("Would remove user: tsi")
                else:
                    self.remove_user(remove_home=remove_data)
            
            # Track preserved items
            if not remove_config:
                preserved.extend(p for p in self.CONFIG_PATHS if p.exists())
            if not remove_data:
                data_path = Path.home() / ".local" / "share" / "tsijukebox"
                if data_path.exists():
                    preserved.append(data_path)
            
            self.logger.success("Uninstallation complete!")
            
            if preserved:
                self.logger.info("Preserved paths:")
                for path in preserved:
                    self.logger.info(f"  {path}")
            
            return UninstallResult(
                success=True,
                removed_files=removed_files,
                removed_packages=removed_pkgs,
                errors=errors,
                preserved=preserved
            )
            
        except Exception as e:
            self.logger.error(f"Uninstallation failed: {e}")
            errors.append(str(e))
            
            return UninstallResult(
                success=False,
                removed_files=removed_files,
                removed_packages=removed_pkgs,
                errors=errors,
                preserved=preserved
            )


def main():
    """Interactive uninstaller."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="TSiJUKEBOX Uninstaller",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "--all", "-a",
        action="store_true",
        help="Remove everything including data"
    )
    parser.add_argument(
        "--keep-config",
        action="store_true",
        help="Keep configuration files"
    )
    parser.add_argument(
        "--keep-data",
        action="store_true",
        help="Keep user data (default)"
    )
    parser.add_argument(
        "--remove-user",
        action="store_true",
        help="Remove TSiJUKEBOX system user"
    )
    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="Show what would be removed without doing it"
    )
    parser.add_argument(
        "--yes", "-y",
        action="store_true",
        help="Skip confirmation prompts"
    )
    
    args = parser.parse_args()
    
    uninstaller = Uninstaller()
    
    # Detect installation
    print("=== TSiJUKEBOX Uninstaller ===\n")
    
    detected = uninstaller.detect_installation()
    
    print("Detected components:")
    for key, value in detected.items():
        status = "✓" if value else "✗"
        print(f"  {status} {key.replace('_', ' ').title()}")
    
    print()
    
    if not any(detected.values()):
        print("Nothing to uninstall.")
        return
    
    # Confirm
    if not args.yes and not args.dry_run:
        response = input("Proceed with uninstallation? [y/N]: ")
        if response.lower() != 'y':
            print("Cancelled.")
            return
    
    # Run uninstallation
    result = uninstaller.uninstall(
        remove_config=not args.keep_config,
        remove_data=args.all and not args.keep_data,
        remove_packages=True,
        remove_optional_packages=args.all,
        remove_user=args.remove_user or args.all,
        remove_docker=True,
        remove_spicetify=True,
        dry_run=args.dry_run
    )
    
    print()
    if result.success:
        print("✓ Uninstallation complete!")
        if result.removed_files:
            print(f"  Removed {len(result.removed_files)} files/directories")
        if result.removed_packages:
            print(f"  Removed packages: {', '.join(result.removed_packages)}")
        if result.preserved:
            print(f"  Preserved: {len(result.preserved)} paths")
    else:
        print("✗ Uninstallation failed!")
        for error in result.errors:
            print(f"  Error: {error}")


if __name__ == "__main__":
    main()

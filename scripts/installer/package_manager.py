#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Enterprise - Package Manager
# Handles pacman/yay/paru operations for Arch Linux
# =============================================================================

import subprocess
import shutil
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from utils.logger import Logger

class PackageManager(Enum):
    """Supported package managers."""
    PACMAN = "pacman"
    YAY = "yay"
    PARU = "paru"

@dataclass
class PackageInfo:
    """Package information."""
    name: str
    version: str
    description: str
    installed: bool
    repository: str

class PackageManagerHandler:
    """
    Handles package installation and management for Arch Linux.
    Supports pacman, yay, and paru.
    """
    
    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger or Logger()
        self.aur_helper = self._detect_aur_helper()
        
    def _detect_aur_helper(self) -> Optional[str]:
        """Detect available AUR helper."""
        for helper in ["paru", "yay"]:
            if shutil.which(helper):
                self.logger.info(f"Detected AUR helper: {helper}")
                return helper
        self.logger.warning("No AUR helper found")
        return None
    
    def _run_command(
        self, 
        cmd: List[str], 
        sudo: bool = False,
        capture: bool = True
    ) -> Tuple[int, str, str]:
        """Run a shell command."""
        if sudo and cmd[0] != "sudo":
            cmd = ["sudo"] + cmd
            
        self.logger.debug(f"Running: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                timeout=600
            )
            return result.returncode, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            self.logger.error(f"Command timed out: {' '.join(cmd)}")
            return 1, "", "Command timed out"
        except Exception as e:
            self.logger.error(f"Command failed: {e}")
            return 1, "", str(e)
    
    def update_system(self) -> bool:
        """Update system packages."""
        self.logger.info("Updating system packages...")
        
        code, _, err = self._run_command(
            ["pacman", "-Syu", "--noconfirm"],
            sudo=True
        )
        
        if code == 0:
            self.logger.success("System updated successfully")
            return True
        else:
            self.logger.error(f"System update failed: {err}")
            return False
    
    def is_installed(self, package: str) -> bool:
        """Check if a package is installed."""
        code, _, _ = self._run_command(
            ["pacman", "-Qi", package],
            capture=True
        )
        return code == 0
    
    def get_package_info(self, package: str) -> Optional[PackageInfo]:
        """Get information about a package."""
        code, out, _ = self._run_command(
            ["pacman", "-Si", package],
            capture=True
        )
        
        if code != 0:
            # Try AUR
            if self.aur_helper:
                code, out, _ = self._run_command(
                    [self.aur_helper, "-Si", package],
                    capture=True
                )
        
        if code == 0:
            info = {}
            for line in out.split("\n"):
                if ":" in line:
                    key, value = line.split(":", 1)
                    info[key.strip().lower()] = value.strip()
            
            return PackageInfo(
                name=info.get("name", package),
                version=info.get("version", "unknown"),
                description=info.get("description", ""),
                installed=self.is_installed(package),
                repository=info.get("repository", "aur")
            )
        
        return None
    
    def install_packages(
        self, 
        packages: List[str], 
        aur: bool = False,
        confirm: bool = False
    ) -> Dict[str, bool]:
        """
        Install multiple packages.
        
        Args:
            packages: List of package names
            aur: Whether to use AUR helper
            confirm: Whether to require confirmation
            
        Returns:
            Dict mapping package names to installation success
        """
        results = {}
        
        # Separate already installed
        to_install = []
        for pkg in packages:
            if self.is_installed(pkg):
                self.logger.info(f"Package already installed: {pkg}")
                results[pkg] = True
            else:
                to_install.append(pkg)
        
        if not to_install:
            return results
        
        self.logger.info(f"Installing packages: {', '.join(to_install)}")
        
        # Choose package manager
        if aur and self.aur_helper:
            cmd = [self.aur_helper, "-S"]
        else:
            cmd = ["pacman", "-S"]
        
        if not confirm:
            cmd.append("--noconfirm")
        
        cmd.extend(to_install)
        
        code, out, err = self._run_command(cmd, sudo=not aur)
        
        if code == 0:
            for pkg in to_install:
                results[pkg] = True
                self.logger.success(f"Installed: {pkg}")
        else:
            self.logger.error(f"Installation failed: {err}")
            # Check which packages failed
            for pkg in to_install:
                results[pkg] = self.is_installed(pkg)
        
        return results
    
    def install_package(self, package: str, aur: bool = False) -> bool:
        """Install a single package."""
        results = self.install_packages([package], aur=aur)
        return results.get(package, False)
    
    def remove_packages(
        self, 
        packages: List[str],
        recursive: bool = False,
        nosave: bool = False
    ) -> Dict[str, bool]:
        """
        Remove packages.
        
        Args:
            packages: List of package names
            recursive: Remove dependencies too (-s)
            nosave: Don't save config files (-n)
        """
        results = {}
        
        to_remove = [pkg for pkg in packages if self.is_installed(pkg)]
        
        if not to_remove:
            self.logger.info("No packages to remove")
            return {pkg: True for pkg in packages}
        
        self.logger.info(f"Removing packages: {', '.join(to_remove)}")
        
        cmd = ["pacman", "-R", "--noconfirm"]
        if recursive:
            cmd.append("-s")
        if nosave:
            cmd.append("-n")
        cmd.extend(to_remove)
        
        code, _, err = self._run_command(cmd, sudo=True)
        
        if code == 0:
            for pkg in to_remove:
                results[pkg] = True
                self.logger.success(f"Removed: {pkg}")
        else:
            self.logger.error(f"Removal failed: {err}")
            for pkg in to_remove:
                results[pkg] = not self.is_installed(pkg)
        
        return results
    
    def install_aur_helper(self, helper: str = "yay") -> bool:
        """Install an AUR helper (yay or paru)."""
        if self.aur_helper:
            self.logger.info(f"AUR helper already available: {self.aur_helper}")
            return True
        
        self.logger.info(f"Installing AUR helper: {helper}")
        
        # Install base-devel if needed
        self.install_packages(["base-devel", "git"])
        
        # Clone and build
        temp_dir = Path("/tmp") / f"{helper}-install"
        
        try:
            # Remove if exists
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
            
            # Clone
            clone_url = f"https://aur.archlinux.org/{helper}.git"
            code, _, err = self._run_command(
                ["git", "clone", clone_url, str(temp_dir)]
            )
            
            if code != 0:
                self.logger.error(f"Failed to clone {helper}: {err}")
                return False
            
            # Build and install
            code, _, err = self._run_command(
                ["makepkg", "-si", "--noconfirm"],
                capture=True
            )
            
            if code == 0:
                self.aur_helper = helper
                self.logger.success(f"Installed AUR helper: {helper}")
                return True
            else:
                self.logger.error(f"Failed to build {helper}: {err}")
                return False
                
        finally:
            # Cleanup
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
    
    def get_installed_packages(self) -> List[str]:
        """Get list of all installed packages."""
        code, out, _ = self._run_command(
            ["pacman", "-Qq"],
            capture=True
        )
        
        if code == 0:
            return out.strip().split("\n")
        return []
    
    def get_orphan_packages(self) -> List[str]:
        """Get packages no longer required as dependencies."""
        code, out, _ = self._run_command(
            ["pacman", "-Qtdq"],
            capture=True
        )
        
        if code == 0:
            return out.strip().split("\n") if out.strip() else []
        return []
    
    def clean_cache(self, keep: int = 1) -> bool:
        """Clean package cache."""
        self.logger.info("Cleaning package cache...")
        
        code, _, err = self._run_command(
            ["paccache", "-rk", str(keep)],
            sudo=True
        )
        
        if code == 0:
            self.logger.success("Cache cleaned")
            return True
        else:
            # Fallback to pacman
            code, _, err = self._run_command(
                ["pacman", "-Sc", "--noconfirm"],
                sudo=True
            )
            return code == 0
    
    def search_packages(self, query: str, aur: bool = True) -> List[PackageInfo]:
        """Search for packages."""
        results = []
        
        # Search official repos
        code, out, _ = self._run_command(
            ["pacman", "-Ss", query],
            capture=True
        )
        
        if code == 0:
            lines = out.strip().split("\n")
            i = 0
            while i < len(lines):
                if "/" in lines[i]:
                    parts = lines[i].split("/")
                    repo = parts[0]
                    name_ver = parts[1].split(" ")
                    name = name_ver[0]
                    version = name_ver[1] if len(name_ver) > 1 else "unknown"
                    desc = lines[i + 1].strip() if i + 1 < len(lines) else ""
                    
                    results.append(PackageInfo(
                        name=name,
                        version=version,
                        description=desc,
                        installed=self.is_installed(name),
                        repository=repo
                    ))
                    i += 2
                else:
                    i += 1
        
        # Search AUR
        if aur and self.aur_helper:
            code, out, _ = self._run_command(
                [self.aur_helper, "-Ss", query],
                capture=True
            )
            # Parse similar to above...
        
        return results
    
    def check_updates(self) -> List[Tuple[str, str, str]]:
        """Check for available updates. Returns list of (name, current, new)."""
        updates = []
        
        code, out, _ = self._run_command(
            ["checkupdates"],
            capture=True
        )
        
        if code == 0 and out.strip():
            for line in out.strip().split("\n"):
                parts = line.split()
                if len(parts) >= 4:
                    name = parts[0]
                    current = parts[1]
                    new = parts[3]
                    updates.append((name, current, new))
        
        # Check AUR updates
        if self.aur_helper:
            code, out, _ = self._run_command(
                [self.aur_helper, "-Qua"],
                capture=True
            )
            
            if code == 0 and out.strip():
                for line in out.strip().split("\n"):
                    parts = line.split()
                    if len(parts) >= 4:
                        updates.append((parts[0], parts[1], parts[3]))
        
        return updates


def main():
    """Test package manager functionality."""
    pm = PackageManagerHandler()
    
    print("=== Package Manager Test ===\n")
    
    # Check installed packages
    print("Checking common packages:")
    for pkg in ["chromium", "nodejs", "npm", "git", "nginx"]:
        installed = pm.is_installed(pkg)
        status = "✓" if installed else "✗"
        print(f"  {status} {pkg}")
    
    # Check for updates
    print("\nChecking for updates...")
    updates = pm.check_updates()
    if updates:
        print(f"  {len(updates)} updates available")
        for name, current, new in updates[:5]:
            print(f"    {name}: {current} → {new}")
    else:
        print("  System is up to date")
    
    # Check orphans
    print("\nChecking for orphan packages...")
    orphans = pm.get_orphan_packages()
    if orphans:
        print(f"  {len(orphans)} orphan packages found")
    else:
        print("  No orphan packages")


if __name__ == "__main__":
    main()

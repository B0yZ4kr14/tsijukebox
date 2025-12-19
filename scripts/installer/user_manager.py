#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Enterprise - User Manager
# Handles system user creation and configuration
# =============================================================================

import subprocess
import os
import pwd
import grp
from pathlib import Path
from typing import Optional, List, Dict
from dataclasses import dataclass

from utils.logger import Logger

@dataclass
class UserInfo:
    """System user information."""
    username: str
    uid: int
    gid: int
    home: Path
    shell: str
    groups: List[str]
    exists: bool

class UserManager:
    """
    Manages system users for TSiJUKEBOX installation.
    Creates kiosk user, configures groups, and sets up home directory.
    """
    
    DEFAULT_USER = "tsi"
    DEFAULT_SHELL = "/bin/bash"
    REQUIRED_GROUPS = ["audio", "video", "input", "render"]
    OPTIONAL_GROUPS = ["docker", "wheel", "plugdev", "netdev"]
    
    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger or Logger()
    
    def _run_command(
        self, 
        cmd: List[str], 
        sudo: bool = True
    ) -> tuple[int, str, str]:
        """Run a shell command."""
        if sudo and os.geteuid() != 0:
            cmd = ["sudo"] + cmd
        
        self.logger.debug(f"Running: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            self.logger.error(f"Command failed: {e}")
            return 1, "", str(e)
    
    def user_exists(self, username: str) -> bool:
        """Check if a user exists."""
        try:
            pwd.getpwnam(username)
            return True
        except KeyError:
            return False
    
    def group_exists(self, groupname: str) -> bool:
        """Check if a group exists."""
        try:
            grp.getgrnam(groupname)
            return True
        except KeyError:
            return False
    
    def get_user_info(self, username: str) -> Optional[UserInfo]:
        """Get information about a user."""
        try:
            pw = pwd.getpwnam(username)
            
            # Get user's groups
            groups = []
            for g in grp.getgrall():
                if username in g.gr_mem:
                    groups.append(g.gr_name)
            
            # Add primary group
            try:
                primary_group = grp.getgrgid(pw.pw_gid).gr_name
                if primary_group not in groups:
                    groups.insert(0, primary_group)
            except KeyError:
                pass
            
            return UserInfo(
                username=username,
                uid=pw.pw_uid,
                gid=pw.pw_gid,
                home=Path(pw.pw_dir),
                shell=pw.pw_shell,
                groups=groups,
                exists=True
            )
        except KeyError:
            return None
    
    def create_user(
        self,
        username: str = DEFAULT_USER,
        home: Optional[Path] = None,
        shell: str = DEFAULT_SHELL,
        system_user: bool = False,
        create_home: bool = True
    ) -> bool:
        """
        Create a new system user.
        
        Args:
            username: Username to create
            home: Home directory path
            shell: Login shell
            system_user: Create as system user
            create_home: Create home directory
        """
        if self.user_exists(username):
            self.logger.info(f"User already exists: {username}")
            return True
        
        self.logger.info(f"Creating user: {username}")
        
        # Build useradd command
        cmd = ["useradd"]
        
        if system_user:
            cmd.extend(["-r", "-s", "/usr/bin/nologin"])
        else:
            cmd.extend(["-s", shell])
        
        if create_home:
            cmd.append("-m")
            if home:
                cmd.extend(["-d", str(home)])
        
        cmd.append(username)
        
        code, _, err = self._run_command(cmd)
        
        if code == 0:
            self.logger.success(f"User created: {username}")
            return True
        else:
            self.logger.error(f"Failed to create user: {err}")
            return False
    
    def delete_user(
        self,
        username: str,
        remove_home: bool = False,
        force: bool = False
    ) -> bool:
        """Delete a user."""
        if not self.user_exists(username):
            self.logger.info(f"User does not exist: {username}")
            return True
        
        self.logger.warning(f"Deleting user: {username}")
        
        cmd = ["userdel"]
        if remove_home:
            cmd.append("-r")
        if force:
            cmd.append("-f")
        cmd.append(username)
        
        code, _, err = self._run_command(cmd)
        
        if code == 0:
            self.logger.success(f"User deleted: {username}")
            return True
        else:
            self.logger.error(f"Failed to delete user: {err}")
            return False
    
    def add_to_group(self, username: str, group: str) -> bool:
        """Add user to a group."""
        if not self.group_exists(group):
            self.logger.warning(f"Group does not exist: {group}")
            return False
        
        if not self.user_exists(username):
            self.logger.error(f"User does not exist: {username}")
            return False
        
        # Check if already in group
        user_info = self.get_user_info(username)
        if user_info and group in user_info.groups:
            self.logger.debug(f"User {username} already in group {group}")
            return True
        
        self.logger.info(f"Adding {username} to group {group}")
        
        code, _, err = self._run_command(
            ["usermod", "-aG", group, username]
        )
        
        return code == 0
    
    def add_to_groups(self, username: str, groups: List[str]) -> Dict[str, bool]:
        """Add user to multiple groups."""
        results = {}
        for group in groups:
            results[group] = self.add_to_group(username, group)
        return results
    
    def setup_kiosk_user(
        self,
        username: str = DEFAULT_USER,
        password: Optional[str] = None
    ) -> bool:
        """
        Set up a complete kiosk user with all required configurations.
        """
        self.logger.info(f"Setting up kiosk user: {username}")
        
        # Create user
        if not self.create_user(username):
            return False
        
        # Add to required groups
        for group in self.REQUIRED_GROUPS:
            self.add_to_group(username, group)
        
        # Add to optional groups if they exist
        for group in self.OPTIONAL_GROUPS:
            if self.group_exists(group):
                self.add_to_group(username, group)
        
        # Set password if provided
        if password:
            self.set_password(username, password)
        
        # Configure home directory
        user_info = self.get_user_info(username)
        if user_info:
            self._setup_home_directory(user_info.home, username)
        
        self.logger.success(f"Kiosk user setup complete: {username}")
        return True
    
    def set_password(self, username: str, password: str) -> bool:
        """Set user password."""
        self.logger.info(f"Setting password for: {username}")
        
        try:
            proc = subprocess.Popen(
                ["sudo", "chpasswd"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            proc.communicate(input=f"{username}:{password}".encode())
            return proc.returncode == 0
        except Exception as e:
            self.logger.error(f"Failed to set password: {e}")
            return False
    
    def _setup_home_directory(self, home: Path, username: str) -> None:
        """Set up home directory structure."""
        self.logger.info(f"Configuring home directory: {home}")
        
        # Create directories
        dirs = [
            home / ".config",
            home / ".config" / "tsijukebox",
            home / ".local" / "share" / "tsijukebox",
            home / "Music",
            home / "Downloads"
        ]
        
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)
        
        # Set ownership
        self._run_command(["chown", "-R", f"{username}:{username}", str(home)])
    
    def configure_autologin(
        self,
        username: str,
        tty: str = "tty1"
    ) -> bool:
        """
        Configure autologin for the user on specified TTY.
        Creates systemd override for getty.
        """
        self.logger.info(f"Configuring autologin for {username} on {tty}")
        
        override_dir = Path(f"/etc/systemd/system/getty@{tty}.service.d")
        override_file = override_dir / "autologin.conf"
        
        content = f"""[Service]
ExecStart=
ExecStart=-/usr/bin/agetty --autologin {username} --noclear %I $TERM
"""
        
        try:
            override_dir.mkdir(parents=True, exist_ok=True)
            override_file.write_text(content)
            
            # Reload systemd
            self._run_command(["systemctl", "daemon-reload"])
            self._run_command(["systemctl", "enable", f"getty@{tty}.service"])
            
            self.logger.success(f"Autologin configured for {username}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to configure autologin: {e}")
            return False
    
    def configure_x_autostart(
        self,
        username: str,
        command: str = "chromium --kiosk http://localhost:5173"
    ) -> bool:
        """
        Configure X11 autostart for the user.
        Creates .xinitrc and .bash_profile.
        """
        user_info = self.get_user_info(username)
        if not user_info:
            self.logger.error(f"User not found: {username}")
            return False
        
        home = user_info.home
        self.logger.info(f"Configuring X autostart for {username}")
        
        # Create .xinitrc
        xinitrc = home / ".xinitrc"
        xinitrc_content = f"""#!/bin/sh

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide cursor after inactivity
unclutter -idle 3 &

# Start TSiJUKEBOX
exec {command}
"""
        
        try:
            xinitrc.write_text(xinitrc_content)
            xinitrc.chmod(0o755)
        except Exception as e:
            self.logger.error(f"Failed to create .xinitrc: {e}")
            return False
        
        # Create .bash_profile for auto-startx
        bash_profile = home / ".bash_profile"
        bash_profile_content = """# TSiJUKEBOX Kiosk Auto-start

# Start X if on tty1
if [[ -z $DISPLAY ]] && [[ $(tty) = /dev/tty1 ]]; then
    exec startx
fi
"""
        
        try:
            # Append or create
            if bash_profile.exists():
                current = bash_profile.read_text()
                if "TSiJUKEBOX" not in current:
                    bash_profile.write_text(current + "\n" + bash_profile_content)
            else:
                bash_profile.write_text(bash_profile_content)
        except Exception as e:
            self.logger.error(f"Failed to configure .bash_profile: {e}")
            return False
        
        # Set ownership
        self._run_command(["chown", f"{username}:{username}", str(xinitrc)])
        self._run_command(["chown", f"{username}:{username}", str(bash_profile)])
        
        self.logger.success("X autostart configured")
        return True
    
    def get_all_users(self, min_uid: int = 1000, max_uid: int = 60000) -> List[UserInfo]:
        """Get all regular users on the system."""
        users = []
        
        for pw in pwd.getpwall():
            if min_uid <= pw.pw_uid <= max_uid:
                user_info = self.get_user_info(pw.pw_name)
                if user_info:
                    users.append(user_info)
        
        return users


def main():
    """Test user manager functionality."""
    um = UserManager()
    
    print("=== User Manager Test ===\n")
    
    # List users
    print("System users (UID 1000-60000):")
    for user in um.get_all_users():
        groups = ", ".join(user.groups[:5])
        if len(user.groups) > 5:
            groups += f" (+{len(user.groups) - 5} more)"
        print(f"  {user.username} (UID: {user.uid})")
        print(f"    Home: {user.home}")
        print(f"    Shell: {user.shell}")
        print(f"    Groups: {groups}")
        print()
    
    # Check TSiJUKEBOX user
    if um.user_exists("tsi"):
        print("TSiJUKEBOX user (tsi) exists: ✓")
    else:
        print("TSiJUKEBOX user (tsi) exists: ✗")
        print("  Run with --setup to create")


if __name__ == "__main__":
    main()

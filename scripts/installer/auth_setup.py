#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Enterprise - Authentication Setup
# Handles SSH/GPG key generation and authentication configuration
# =============================================================================

import subprocess
import os
import secrets
import string
import hashlib
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
from dataclasses import dataclass
from datetime import datetime

from .utils.logger import Logger

@dataclass
class KeyPair:
    """SSH/GPG key pair information."""
    key_type: str
    public_key: str
    private_key_path: Path
    fingerprint: str
    created_at: datetime

@dataclass
class AuthConfig:
    """Authentication configuration."""
    ssh_enabled: bool
    gpg_enabled: bool
    sudo_passwordless: bool
    ssh_keys: List[KeyPair]
    gpg_keys: List[str]

class AuthSetup:
    """
    Manages authentication configuration for TSiJUKEBOX.
    Handles SSH keys, GPG keys, and sudo configuration.
    """
    
    SSH_DIR = Path.home() / ".ssh"
    GPG_DIR = Path.home() / ".gnupg"
    
    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger or Logger()
    
    def _run_command(
        self, 
        cmd: List[str],
        capture: bool = True,
        input_text: Optional[str] = None,
        env: Optional[Dict[str, str]] = None
    ) -> tuple[int, str, str]:
        """Run a shell command."""
        self.logger.debug(f"Running: {' '.join(cmd)}")
        
        full_env = os.environ.copy()
        if env:
            full_env.update(env)
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                input=input_text,
                env=full_env,
                timeout=60
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            self.logger.error(f"Command failed: {e}")
            return 1, "", str(e)
    
    def generate_password(
        self, 
        length: int = 16,
        include_special: bool = True
    ) -> str:
        """Generate a secure random password."""
        chars = string.ascii_letters + string.digits
        if include_special:
            chars += "!@#$%^&*"
        
        return ''.join(secrets.choice(chars) for _ in range(length))
    
    def hash_password(self, password: str) -> str:
        """Hash a password using SHA-256 (for config storage)."""
        return hashlib.sha256(password.encode()).hexdigest()
    
    # =========================================================================
    # SSH Key Management
    # =========================================================================
    
    def generate_ssh_key(
        self,
        key_type: str = "ed25519",
        comment: str = "tsijukebox",
        passphrase: str = "",
        filename: Optional[str] = None
    ) -> Optional[KeyPair]:
        """
        Generate a new SSH key pair.
        
        Args:
            key_type: Key type (ed25519, rsa, ecdsa)
            comment: Key comment
            passphrase: Key passphrase (empty for no passphrase)
            filename: Custom filename (default: id_<type>)
        """
        self.logger.info(f"Generating {key_type} SSH key...")
        
        # Create SSH directory
        self.SSH_DIR.mkdir(mode=0o700, exist_ok=True)
        
        # Determine filename
        if not filename:
            filename = f"id_{key_type}"
        
        key_path = self.SSH_DIR / filename
        
        # Check if key exists
        if key_path.exists():
            self.logger.warning(f"Key already exists: {key_path}")
            response = input("Overwrite? [y/N]: ")
            if response.lower() != 'y':
                return None
            key_path.unlink()
            (key_path.parent / f"{filename}.pub").unlink(missing_ok=True)
        
        # Generate key
        cmd = [
            "ssh-keygen",
            "-t", key_type,
            "-C", comment,
            "-f", str(key_path),
            "-N", passphrase
        ]
        
        if key_type == "rsa":
            cmd.extend(["-b", "4096"])
        
        code, out, err = self._run_command(cmd, capture=True)
        
        if code != 0:
            self.logger.error(f"Key generation failed: {err}")
            return None
        
        # Read public key
        pub_path = key_path.parent / f"{filename}.pub"
        public_key = pub_path.read_text().strip()
        
        # Get fingerprint
        code, out, _ = self._run_command(
            ["ssh-keygen", "-lf", str(pub_path)],
            capture=True
        )
        fingerprint = out.split()[1] if code == 0 else "unknown"
        
        self.logger.success(f"SSH key generated: {key_path}")
        
        return KeyPair(
            key_type=key_type,
            public_key=public_key,
            private_key_path=key_path,
            fingerprint=fingerprint,
            created_at=datetime.now()
        )
    
    def list_ssh_keys(self) -> List[KeyPair]:
        """List all SSH keys in ~/.ssh."""
        keys = []
        
        if not self.SSH_DIR.exists():
            return keys
        
        for pub_file in self.SSH_DIR.glob("*.pub"):
            private_file = pub_file.with_suffix("")
            
            if not private_file.exists():
                continue
            
            public_key = pub_file.read_text().strip()
            
            # Determine key type from public key
            parts = public_key.split()
            key_type = parts[0].replace("ssh-", "") if parts else "unknown"
            
            # Get fingerprint
            code, out, _ = self._run_command(
                ["ssh-keygen", "-lf", str(pub_file)],
                capture=True
            )
            fingerprint = out.split()[1] if code == 0 else "unknown"
            
            # Get creation time
            stat = private_file.stat()
            created_at = datetime.fromtimestamp(stat.st_mtime)
            
            keys.append(KeyPair(
                key_type=key_type,
                public_key=public_key,
                private_key_path=private_file,
                fingerprint=fingerprint,
                created_at=created_at
            ))
        
        return keys
    
    def add_to_authorized_keys(self, public_key: str, user: str = "") -> bool:
        """Add a public key to authorized_keys."""
        if user:
            auth_keys_path = Path(f"/home/{user}/.ssh/authorized_keys")
        else:
            auth_keys_path = self.SSH_DIR / "authorized_keys"
        
        auth_keys_path.parent.mkdir(mode=0o700, exist_ok=True)
        
        # Check if already exists
        if auth_keys_path.exists():
            existing = auth_keys_path.read_text()
            if public_key in existing:
                self.logger.info("Key already in authorized_keys")
                return True
        
        # Append key
        with open(auth_keys_path, "a") as f:
            f.write(f"\n{public_key}\n")
        
        auth_keys_path.chmod(0o600)
        self.logger.success("Key added to authorized_keys")
        return True
    
    def configure_ssh_daemon(
        self,
        permit_root: bool = False,
        password_auth: bool = False,
        pubkey_auth: bool = True,
        port: int = 22
    ) -> bool:
        """Configure SSH daemon settings."""
        self.logger.info("Configuring SSH daemon...")
        
        sshd_config = Path("/etc/ssh/sshd_config")
        
        if not sshd_config.exists():
            self.logger.error("sshd_config not found")
            return False
        
        # Create config snippet
        config_dir = Path("/etc/ssh/sshd_config.d")
        config_dir.mkdir(exist_ok=True)
        
        config_content = f"""# TSiJUKEBOX SSH Configuration
Port {port}
PermitRootLogin {'yes' if permit_root else 'no'}
PasswordAuthentication {'yes' if password_auth else 'no'}
PubkeyAuthentication {'yes' if pubkey_auth else 'no'}
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/ssh/sftp-server
"""
        
        config_file = config_dir / "99-tsijukebox.conf"
        
        try:
            # Write with sudo
            proc = subprocess.Popen(
                ["sudo", "tee", str(config_file)],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            proc.communicate(input=config_content.encode())
            
            if proc.returncode == 0:
                # Restart SSH
                subprocess.run(["sudo", "systemctl", "restart", "sshd"], capture_output=True)
                self.logger.success("SSH daemon configured")
                return True
            
        except Exception as e:
            self.logger.error(f"Failed to configure SSH: {e}")
        
        return False
    
    # =========================================================================
    # GPG Key Management
    # =========================================================================
    
    def generate_gpg_key(
        self,
        name: str,
        email: str,
        passphrase: str = "",
        key_type: str = "RSA",
        key_length: int = 4096,
        expire_years: int = 2
    ) -> Optional[str]:
        """
        Generate a new GPG key pair.
        
        Returns the key ID if successful.
        """
        self.logger.info("Generating GPG key...")
        
        # Create GPG batch file
        batch_content = f"""
%echo Generating GPG key for TSiJUKEBOX
Key-Type: {key_type}
Key-Length: {key_length}
Subkey-Type: {key_type}
Subkey-Length: {key_length}
Name-Real: {name}
Name-Email: {email}
Expire-Date: {expire_years}y
{"Passphrase: " + passphrase if passphrase else "%no-protection"}
%commit
%echo done
"""
        
        batch_file = Path("/tmp/gpg-batch")
        batch_file.write_text(batch_content)
        
        try:
            code, out, err = self._run_command(
                ["gpg", "--batch", "--generate-key", str(batch_file)],
                capture=True
            )
            
            if code != 0:
                self.logger.error(f"GPG key generation failed: {err}")
                return None
            
            # Get the key ID
            code, out, _ = self._run_command(
                ["gpg", "--list-keys", "--keyid-format", "LONG", email],
                capture=True
            )
            
            if code == 0:
                # Parse key ID from output
                for line in out.split("\n"):
                    if "pub" in line:
                        parts = line.split("/")
                        if len(parts) > 1:
                            key_id = parts[1].split()[0]
                            self.logger.success(f"GPG key generated: {key_id}")
                            return key_id
            
        finally:
            batch_file.unlink(missing_ok=True)
        
        return None
    
    def list_gpg_keys(self) -> List[Dict[str, str]]:
        """List all GPG keys."""
        keys = []
        
        code, out, _ = self._run_command(
            ["gpg", "--list-keys", "--keyid-format", "LONG"],
            capture=True
        )
        
        if code == 0:
            current_key = {}
            for line in out.split("\n"):
                if line.startswith("pub"):
                    if current_key:
                        keys.append(current_key)
                    parts = line.split()
                    key_info = parts[1].split("/")
                    current_key = {
                        "type": key_info[0],
                        "id": key_info[1].split()[0] if len(key_info) > 1 else "",
                        "created": parts[-1] if len(parts) > 2 else ""
                    }
                elif line.startswith("uid"):
                    current_key["uid"] = line.split("]")[-1].strip() if "]" in line else line[3:].strip()
            
            if current_key:
                keys.append(current_key)
        
        return keys
    
    def export_gpg_public_key(self, key_id: str) -> Optional[str]:
        """Export GPG public key."""
        code, out, err = self._run_command(
            ["gpg", "--armor", "--export", key_id],
            capture=True
        )
        
        if code == 0:
            return out
        
        self.logger.error(f"Failed to export GPG key: {err}")
        return None
    
    # =========================================================================
    # Sudo Configuration
    # =========================================================================
    
    def configure_passwordless_sudo(self, username: str) -> bool:
        """Configure passwordless sudo for a user."""
        self.logger.info(f"Configuring passwordless sudo for: {username}")
        
        sudoers_file = Path(f"/etc/sudoers.d/{username}")
        content = f"{username} ALL=(ALL) NOPASSWD: ALL\n"
        
        try:
            proc = subprocess.Popen(
                ["sudo", "tee", str(sudoers_file)],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            proc.communicate(input=content.encode())
            
            if proc.returncode == 0:
                # Set proper permissions
                subprocess.run(
                    ["sudo", "chmod", "440", str(sudoers_file)],
                    capture_output=True
                )
                self.logger.success("Passwordless sudo configured")
                return True
            
        except Exception as e:
            self.logger.error(f"Failed to configure sudo: {e}")
        
        return False
    
    def remove_passwordless_sudo(self, username: str) -> bool:
        """Remove passwordless sudo for a user."""
        sudoers_file = Path(f"/etc/sudoers.d/{username}")
        
        if sudoers_file.exists():
            code, _, _ = self._run_command(
                ["sudo", "rm", str(sudoers_file)],
                capture=True
            )
            return code == 0
        
        return True
    
    # =========================================================================
    # Complete Setup
    # =========================================================================
    
    def setup_for_tsijukebox(
        self,
        username: str,
        email: str = "",
        generate_ssh: bool = True,
        generate_gpg: bool = False,
        passwordless_sudo: bool = True
    ) -> AuthConfig:
        """
        Complete authentication setup for TSiJUKEBOX.
        """
        self.logger.info("Setting up authentication for TSiJUKEBOX...")
        
        ssh_keys = []
        gpg_keys = []
        
        # Generate SSH key
        if generate_ssh:
            key = self.generate_ssh_key(
                key_type="ed25519",
                comment=f"tsijukebox@{username}"
            )
            if key:
                ssh_keys.append(key)
                self.add_to_authorized_keys(key.public_key)
        
        # Generate GPG key
        if generate_gpg and email:
            key_id = self.generate_gpg_key(
                name=f"TSiJUKEBOX ({username})",
                email=email
            )
            if key_id:
                gpg_keys.append(key_id)
        
        # Configure passwordless sudo
        sudo_configured = False
        if passwordless_sudo:
            sudo_configured = self.configure_passwordless_sudo(username)
        
        self.logger.success("Authentication setup complete!")
        
        return AuthConfig(
            ssh_enabled=len(ssh_keys) > 0,
            gpg_enabled=len(gpg_keys) > 0,
            sudo_passwordless=sudo_configured,
            ssh_keys=ssh_keys,
            gpg_keys=gpg_keys
        )


def main():
    """Test authentication setup functionality."""
    auth = AuthSetup()
    
    print("=== Authentication Setup Test ===\n")
    
    # List SSH keys
    print("SSH Keys:")
    keys = auth.list_ssh_keys()
    if keys:
        for key in keys:
            print(f"  {key.key_type}: {key.fingerprint}")
            print(f"    Path: {key.private_key_path}")
            print(f"    Created: {key.created_at}")
    else:
        print("  No SSH keys found")
    
    print()
    
    # List GPG keys
    print("GPG Keys:")
    gpg_keys = auth.list_gpg_keys()
    if gpg_keys:
        for key in gpg_keys:
            print(f"  {key.get('id', 'unknown')}: {key.get('uid', 'unknown')}")
    else:
        print("  No GPG keys found")
    
    print()
    print("Run with --setup to generate new keys")


if __name__ == "__main__":
    main()

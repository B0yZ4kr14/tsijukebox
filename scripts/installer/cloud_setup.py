#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Enterprise - Cloud Setup
# Handles cloud backup configuration (Storj, rclone, AWS, MEGA)
# =============================================================================

import subprocess
import os
import shutil
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum

from config import Config, CloudProvider
from utils.logger import Logger

class CloudProviderType(Enum):
    """Supported cloud providers."""
    STORJ = "storj"
    RCLONE = "rclone"
    AWS = "aws"
    MEGA = "mega"
    BACKBLAZE = "backblaze"
    WASABI = "wasabi"

@dataclass
class CloudStatus:
    """Cloud provider status."""
    provider: CloudProviderType
    installed: bool
    configured: bool
    connected: bool
    config_path: Path

class CloudSetup:
    """
    Manages cloud backup provider setup and configuration.
    Supports Storj, rclone, AWS S3, MEGA, and more.
    """
    
    CONFIG_DIR = Path.home() / ".config" / "tsijukebox" / "cloud"
    
    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger or Logger()
        self.config = Config()
        self.CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    
    def _run_command(
        self, 
        cmd: List[str],
        capture: bool = True,
        input_text: Optional[str] = None
    ) -> tuple[int, str, str]:
        """Run a shell command."""
        self.logger.debug(f"Running: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                input=input_text,
                timeout=120
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            self.logger.error(f"Command failed: {e}")
            return 1, "", str(e)
    
    def detect_installed(self) -> Dict[CloudProviderType, bool]:
        """Detect which cloud tools are installed."""
        installed = {}
        
        tools = {
            CloudProviderType.STORJ: ["uplink"],
            CloudProviderType.RCLONE: ["rclone"],
            CloudProviderType.AWS: ["aws"],
            CloudProviderType.MEGA: ["mega-cmd", "megacmd"],
            CloudProviderType.BACKBLAZE: ["b2"],
            CloudProviderType.WASABI: ["aws"],  # Uses AWS CLI
        }
        
        for provider, binaries in tools.items():
            installed[provider] = any(shutil.which(b) for b in binaries)
        
        return installed
    
    def get_status(self, provider: CloudProviderType) -> CloudStatus:
        """Get status of a cloud provider."""
        installed = self.detect_installed().get(provider, False)
        config_path = self.CONFIG_DIR / f"{provider.value}.json"
        configured = config_path.exists()
        connected = False
        
        if installed and configured:
            connected = self._check_connection(provider)
        
        return CloudStatus(
            provider=provider,
            installed=installed,
            configured=configured,
            connected=connected,
            config_path=config_path
        )
    
    def _check_connection(self, provider: CloudProviderType) -> bool:
        """Check if provider is connected."""
        try:
            if provider == CloudProviderType.STORJ:
                code, _, _ = self._run_command(["uplink", "ls"], capture=True)
                return code == 0
                
            elif provider == CloudProviderType.RCLONE:
                code, _, _ = self._run_command(["rclone", "listremotes"], capture=True)
                return code == 0
                
            elif provider == CloudProviderType.AWS:
                code, _, _ = self._run_command(["aws", "s3", "ls"], capture=True)
                return code == 0
                
            elif provider == CloudProviderType.MEGA:
                code, _, _ = self._run_command(["mega-whoami"], capture=True)
                return code == 0
                
        except Exception:
            pass
        
        return False
    
    def install(self, provider: CloudProviderType) -> bool:
        """Install cloud provider CLI."""
        self.logger.info(f"Installing {provider.value}...")
        
        provider_config = self.config.CLOUD_PROVIDERS.get(provider.value)
        
        if not provider_config:
            self.logger.error(f"Unknown provider: {provider.value}")
            return False
        
        install_cmd = provider_config.install_command
        
        if not install_cmd:
            self.logger.error(f"No install command for {provider.value}")
            return False
        
        # Parse and run install command
        if install_cmd.startswith("curl"):
            # Run curl pipe to bash
            code, _, err = self._run_command(
                ["bash", "-c", install_cmd],
                capture=True
            )
        else:
            # Pacman/yay install
            parts = install_cmd.split()
            if parts[0] == "yay":
                code, _, err = self._run_command(parts, capture=True)
            else:
                code, _, err = self._run_command(
                    ["sudo"] + parts,
                    capture=True
                )
        
        if code == 0:
            self.logger.success(f"{provider.value} installed successfully")
            return True
        else:
            self.logger.error(f"Installation failed: {err}")
            return False
    
    def configure_storj(
        self,
        access_grant: str,
        satellite: str = "us1.storj.io:7777"
    ) -> bool:
        """Configure Storj uplink."""
        self.logger.info("Configuring Storj...")
        
        # Import access grant
        code, _, err = self._run_command(
            ["uplink", "access", "import", "main", access_grant],
            capture=True
        )
        
        if code != 0:
            # Try setup wizard
            self.logger.info("Running Storj setup wizard...")
            code, _, err = self._run_command(
                ["uplink", "setup"],
                capture=False
            )
        
        if code == 0:
            # Save config
            config = {
                "provider": "storj",
                "satellite": satellite,
                "configured": True
            }
            self._save_config(CloudProviderType.STORJ, config)
            self.logger.success("Storj configured successfully")
            return True
        else:
            self.logger.error(f"Storj configuration failed: {err}")
            return False
    
    def configure_rclone(
        self,
        remote_name: str,
        remote_type: str,
        config_options: Dict[str, str]
    ) -> bool:
        """Configure rclone remote."""
        self.logger.info(f"Configuring rclone remote: {remote_name}")
        
        # Create config via rclone config create
        cmd = ["rclone", "config", "create", remote_name, remote_type]
        
        for key, value in config_options.items():
            cmd.extend([key, value])
        
        code, out, err = self._run_command(cmd, capture=True)
        
        if code == 0:
            config = {
                "provider": "rclone",
                "remote_name": remote_name,
                "remote_type": remote_type,
                "configured": True
            }
            self._save_config(CloudProviderType.RCLONE, config)
            self.logger.success(f"rclone remote '{remote_name}' configured")
            return True
        else:
            self.logger.error(f"rclone configuration failed: {err}")
            return False
    
    def configure_aws(
        self,
        access_key: str,
        secret_key: str,
        region: str = "us-east-1",
        bucket: Optional[str] = None
    ) -> bool:
        """Configure AWS S3."""
        self.logger.info("Configuring AWS S3...")
        
        # Configure credentials
        aws_dir = Path.home() / ".aws"
        aws_dir.mkdir(exist_ok=True)
        
        credentials = f"""[default]
aws_access_key_id = {access_key}
aws_secret_access_key = {secret_key}
"""
        
        config_content = f"""[default]
region = {region}
output = json
"""
        
        try:
            (aws_dir / "credentials").write_text(credentials)
            (aws_dir / "credentials").chmod(0o600)
            (aws_dir / "config").write_text(config_content)
            
            # Test connection
            code, _, err = self._run_command(
                ["aws", "s3", "ls"],
                capture=True
            )
            
            if code == 0:
                config = {
                    "provider": "aws",
                    "region": region,
                    "bucket": bucket,
                    "configured": True
                }
                self._save_config(CloudProviderType.AWS, config)
                self.logger.success("AWS S3 configured successfully")
                return True
            else:
                self.logger.error(f"AWS configuration failed: {err}")
                return False
                
        except Exception as e:
            self.logger.error(f"Failed to configure AWS: {e}")
            return False
    
    def configure_mega(
        self,
        email: str,
        password: str
    ) -> bool:
        """Configure MEGA."""
        self.logger.info("Configuring MEGA...")
        
        # Login
        code, _, err = self._run_command(
            ["mega-login", email, password],
            capture=True
        )
        
        if code == 0:
            config = {
                "provider": "mega",
                "email": email,
                "configured": True
            }
            self._save_config(CloudProviderType.MEGA, config)
            self.logger.success("MEGA configured successfully")
            return True
        else:
            self.logger.error(f"MEGA login failed: {err}")
            return False
    
    def _save_config(self, provider: CloudProviderType, config: Dict[str, Any]) -> None:
        """Save provider configuration."""
        config_path = self.CONFIG_DIR / f"{provider.value}.json"
        config_path.write_text(json.dumps(config, indent=2))
    
    def _load_config(self, provider: CloudProviderType) -> Optional[Dict[str, Any]]:
        """Load provider configuration."""
        config_path = self.CONFIG_DIR / f"{provider.value}.json"
        if config_path.exists():
            return json.loads(config_path.read_text())
        return None
    
    def sync_backup(
        self,
        provider: CloudProviderType,
        local_path: Path,
        remote_path: str
    ) -> bool:
        """Sync local directory to cloud."""
        self.logger.info(f"Syncing {local_path} to {provider.value}:{remote_path}")
        
        if provider == CloudProviderType.STORJ:
            code, _, err = self._run_command(
                ["uplink", "sync", str(local_path), f"sj://{remote_path}"],
                capture=True
            )
            
        elif provider == CloudProviderType.RCLONE:
            config = self._load_config(provider)
            remote_name = config.get("remote_name", "remote") if config else "remote"
            code, _, err = self._run_command(
                ["rclone", "sync", str(local_path), f"{remote_name}:{remote_path}"],
                capture=True
            )
            
        elif provider == CloudProviderType.AWS:
            code, _, err = self._run_command(
                ["aws", "s3", "sync", str(local_path), f"s3://{remote_path}"],
                capture=True
            )
            
        elif provider == CloudProviderType.MEGA:
            code, _, err = self._run_command(
                ["mega-sync", str(local_path), remote_path],
                capture=True
            )
        else:
            self.logger.error(f"Sync not supported for {provider.value}")
            return False
        
        if code == 0:
            self.logger.success("Sync completed successfully")
            return True
        else:
            self.logger.error(f"Sync failed: {err}")
            return False
    
    def download_backup(
        self,
        provider: CloudProviderType,
        remote_path: str,
        local_path: Path
    ) -> bool:
        """Download from cloud to local."""
        self.logger.info(f"Downloading {provider.value}:{remote_path} to {local_path}")
        
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        if provider == CloudProviderType.STORJ:
            code, _, err = self._run_command(
                ["uplink", "cp", f"sj://{remote_path}", str(local_path)],
                capture=True
            )
            
        elif provider == CloudProviderType.RCLONE:
            config = self._load_config(provider)
            remote_name = config.get("remote_name", "remote") if config else "remote"
            code, _, err = self._run_command(
                ["rclone", "copy", f"{remote_name}:{remote_path}", str(local_path)],
                capture=True
            )
            
        elif provider == CloudProviderType.AWS:
            code, _, err = self._run_command(
                ["aws", "s3", "cp", f"s3://{remote_path}", str(local_path), "--recursive"],
                capture=True
            )
            
        elif provider == CloudProviderType.MEGA:
            code, _, err = self._run_command(
                ["mega-get", remote_path, str(local_path)],
                capture=True
            )
        else:
            self.logger.error(f"Download not supported for {provider.value}")
            return False
        
        if code == 0:
            self.logger.success("Download completed successfully")
            return True
        else:
            self.logger.error(f"Download failed: {err}")
            return False
    
    def create_scheduled_backup(
        self,
        provider: CloudProviderType,
        local_path: Path,
        remote_path: str,
        schedule: str = "0 2 * * *"  # Daily at 2 AM
    ) -> bool:
        """Create a scheduled backup using systemd timer."""
        self.logger.info("Creating scheduled backup...")
        
        service_name = f"tsijukebox-backup-{provider.value}"
        
        # Create service file
        service_content = f"""[Unit]
Description=TSiJUKEBOX Cloud Backup ({provider.value})
After=network.target

[Service]
Type=oneshot
User={os.getenv('USER', 'root')}
ExecStart=/usr/bin/python3 -c "from scripts.installer.cloud_setup import CloudSetup; cs = CloudSetup(); cs.sync_backup('{provider.value}', '{local_path}', '{remote_path}')"
"""
        
        # Create timer file
        timer_content = f"""[Unit]
Description=TSiJUKEBOX Cloud Backup Timer ({provider.value})

[Timer]
OnCalendar={schedule}
Persistent=true

[Install]
WantedBy=timers.target
"""
        
        try:
            service_path = Path(f"/etc/systemd/system/{service_name}.service")
            timer_path = Path(f"/etc/systemd/system/{service_name}.timer")
            
            # Write files (requires sudo)
            subprocess.run(
                ["sudo", "tee", str(service_path)],
                input=service_content.encode(),
                capture_output=True
            )
            subprocess.run(
                ["sudo", "tee", str(timer_path)],
                input=timer_content.encode(),
                capture_output=True
            )
            
            # Enable timer
            subprocess.run(["sudo", "systemctl", "daemon-reload"], capture_output=True)
            subprocess.run(["sudo", "systemctl", "enable", "--now", f"{service_name}.timer"], capture_output=True)
            
            self.logger.success(f"Scheduled backup created: {schedule}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to create scheduled backup: {e}")
            return False


def main():
    """Test cloud setup functionality."""
    cs = CloudSetup()
    
    print("=== Cloud Setup Test ===\n")
    
    # Check installed providers
    print("Cloud providers:")
    for provider, installed in cs.detect_installed().items():
        status = cs.get_status(provider)
        installed_icon = "✓" if installed else "✗"
        configured = "configured" if status.configured else "not configured"
        connected = "connected" if status.connected else "disconnected"
        
        print(f"  {installed_icon} {provider.value}")
        if installed:
            print(f"      Status: {configured}, {connected}")
    
    print()
    print("Use --configure <provider> to set up a cloud provider")


if __name__ == "__main__":
    main()

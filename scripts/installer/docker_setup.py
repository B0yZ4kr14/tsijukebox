#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Enterprise - Docker Setup
# Alternative installation using Docker containers
# =============================================================================

import subprocess
import shutil
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass

from .utils.logger import Logger

@dataclass
class DockerStatus:
    """Docker installation status."""
    installed: bool
    running: bool
    version: str
    compose_version: str
    containers: List[str]

class DockerSetup:
    """
    Manages Docker-based installation of TSiJUKEBOX.
    Alternative to native installation.
    """
    
    DOCKER_DIR = Path.home() / ".config" / "tsijukebox" / "docker"
    COMPOSE_FILE = "docker-compose.yml"
    
    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger or Logger()
        self.DOCKER_DIR.mkdir(parents=True, exist_ok=True)
    
    def _run_command(
        self, 
        cmd: List[str],
        capture: bool = True,
        cwd: Optional[Path] = None
    ) -> tuple[int, str, str]:
        """Run a shell command."""
        self.logger.debug(f"Running: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                cwd=cwd,
                timeout=600
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            self.logger.error(f"Command failed: {e}")
            return 1, "", str(e)
    
    def is_docker_installed(self) -> bool:
        """Check if Docker is installed."""
        return shutil.which("docker") is not None
    
    def is_docker_running(self) -> bool:
        """Check if Docker daemon is running."""
        code, _, _ = self._run_command(["docker", "info"], capture=True)
        return code == 0
    
    def get_status(self) -> DockerStatus:
        """Get Docker installation status."""
        installed = self.is_docker_installed()
        running = False
        version = "unknown"
        compose_version = "unknown"
        containers = []
        
        if installed:
            running = self.is_docker_running()
            
            # Get Docker version
            code, out, _ = self._run_command(
                ["docker", "--version"],
                capture=True
            )
            if code == 0:
                version = out.strip()
            
            # Get Docker Compose version
            code, out, _ = self._run_command(
                ["docker", "compose", "version"],
                capture=True
            )
            if code == 0:
                compose_version = out.strip()
            
            # Get TSiJUKEBOX containers
            if running:
                code, out, _ = self._run_command(
                    ["docker", "ps", "-a", "--filter", "label=com.tsijukebox.service", "--format", "{{.Names}}"],
                    capture=True
                )
                if code == 0 and out.strip():
                    containers = out.strip().split("\n")
        
        return DockerStatus(
            installed=installed,
            running=running,
            version=version,
            compose_version=compose_version,
            containers=containers
        )
    
    def install_docker(self) -> bool:
        """Install Docker on the system."""
        if self.is_docker_installed():
            self.logger.info("Docker is already installed")
            return True
        
        self.logger.info("Installing Docker...")
        
        # Install via pacman
        code, _, err = self._run_command(
            ["sudo", "pacman", "-S", "--noconfirm", "docker", "docker-compose"],
            capture=True
        )
        
        if code != 0:
            self.logger.error(f"Docker installation failed: {err}")
            return False
        
        # Enable and start Docker service
        subprocess.run(["sudo", "systemctl", "enable", "docker"], capture_output=True)
        subprocess.run(["sudo", "systemctl", "start", "docker"], capture_output=True)
        
        # Add current user to docker group
        import getpass
        username = getpass.getuser()
        subprocess.run(["sudo", "usermod", "-aG", "docker", username], capture_output=True)
        
        self.logger.success("Docker installed successfully")
        self.logger.warning("You may need to log out and back in for group changes to take effect")
        
        return True
    
    def create_compose_file(
        self,
        supabase_url: str = "",
        supabase_key: str = "",
        port: int = 80
    ) -> bool:
        """Create Docker Compose configuration."""
        self.logger.info("Creating Docker Compose configuration...")
        
        compose_content = f"""# TSiJUKEBOX Enterprise - Docker Compose
# Generated automatically by installer

version: '3.9'

services:
  app:
    image: ghcr.io/b0yz4kr14/tsijukebox:latest
    container_name: tsijukebox-app
    restart: unless-stopped
    ports:
      - "{port}:80"
    environment:
      - TZ=America/Sao_Paulo
      - VITE_SUPABASE_URL={supabase_url}
      - VITE_SUPABASE_PUBLISHABLE_KEY={supabase_key}
    volumes:
      - tsijukebox-data:/app/data
      - tsijukebox-logs:/var/log/nginx
    networks:
      - tsijukebox-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "com.tsijukebox.service=app"
      - "com.tsijukebox.version=4.0.0"

networks:
  tsijukebox-network:
    driver: bridge

volumes:
  tsijukebox-data:
    driver: local
  tsijukebox-logs:
    driver: local
"""
        
        compose_path = self.DOCKER_DIR / self.COMPOSE_FILE
        
        try:
            compose_path.write_text(compose_content)
            self.logger.success(f"Docker Compose file created: {compose_path}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to create compose file: {e}")
            return False
    
    def create_env_file(self, env_vars: Dict[str, str]) -> bool:
        """Create .env file for Docker Compose."""
        env_path = self.DOCKER_DIR / ".env"
        
        content = "\n".join(f"{k}={v}" for k, v in env_vars.items())
        
        try:
            env_path.write_text(content)
            self.logger.success("Environment file created")
            return True
        except Exception as e:
            self.logger.error(f"Failed to create .env file: {e}")
            return False
    
    def pull_image(self, image: str = "ghcr.io/b0yz4kr14/tsijukebox:latest") -> bool:
        """Pull Docker image."""
        self.logger.info(f"Pulling Docker image: {image}")
        
        code, out, err = self._run_command(
            ["docker", "pull", image],
            capture=False
        )
        
        if code == 0:
            self.logger.success("Image pulled successfully")
            return True
        else:
            self.logger.error(f"Failed to pull image: {err}")
            return False
    
    def start(self, detach: bool = True) -> bool:
        """Start TSiJUKEBOX containers."""
        self.logger.info("Starting TSiJUKEBOX containers...")
        
        cmd = ["docker", "compose", "up"]
        if detach:
            cmd.append("-d")
        
        code, out, err = self._run_command(
            cmd,
            capture=not detach,
            cwd=self.DOCKER_DIR
        )
        
        if code == 0:
            self.logger.success("TSiJUKEBOX started successfully")
            return True
        else:
            self.logger.error(f"Failed to start: {err}")
            return False
    
    def stop(self) -> bool:
        """Stop TSiJUKEBOX containers."""
        self.logger.info("Stopping TSiJUKEBOX containers...")
        
        code, _, err = self._run_command(
            ["docker", "compose", "down"],
            capture=True,
            cwd=self.DOCKER_DIR
        )
        
        if code == 0:
            self.logger.success("TSiJUKEBOX stopped")
            return True
        else:
            self.logger.error(f"Failed to stop: {err}")
            return False
    
    def restart(self) -> bool:
        """Restart TSiJUKEBOX containers."""
        self.logger.info("Restarting TSiJUKEBOX containers...")
        
        code, _, err = self._run_command(
            ["docker", "compose", "restart"],
            capture=True,
            cwd=self.DOCKER_DIR
        )
        
        return code == 0
    
    def logs(self, follow: bool = False, tail: int = 100) -> str:
        """Get container logs."""
        cmd = ["docker", "compose", "logs"]
        
        if follow:
            cmd.append("-f")
        
        cmd.extend(["--tail", str(tail)])
        
        code, out, err = self._run_command(
            cmd,
            capture=True,
            cwd=self.DOCKER_DIR
        )
        
        return out if code == 0 else err
    
    def update(self) -> bool:
        """Update TSiJUKEBOX to latest version."""
        self.logger.info("Updating TSiJUKEBOX...")
        
        # Pull latest image
        if not self.pull_image():
            return False
        
        # Recreate containers
        code, _, err = self._run_command(
            ["docker", "compose", "up", "-d", "--force-recreate"],
            capture=True,
            cwd=self.DOCKER_DIR
        )
        
        if code == 0:
            self.logger.success("TSiJUKEBOX updated successfully")
            return True
        else:
            self.logger.error(f"Update failed: {err}")
            return False
    
    def cleanup(self, remove_volumes: bool = False) -> bool:
        """Clean up Docker resources."""
        self.logger.info("Cleaning up Docker resources...")
        
        # Stop containers
        self.stop()
        
        # Remove volumes if requested
        if remove_volumes:
            self._run_command(
                ["docker", "compose", "down", "-v"],
                capture=True,
                cwd=self.DOCKER_DIR
            )
        
        # Prune unused resources
        self._run_command(
            ["docker", "system", "prune", "-f"],
            capture=True
        )
        
        self.logger.success("Cleanup complete")
        return True
    
    def get_container_info(self, container_name: str = "tsijukebox-app") -> Optional[Dict[str, Any]]:
        """Get information about a container."""
        code, out, _ = self._run_command(
            ["docker", "inspect", container_name],
            capture=True
        )
        
        if code == 0:
            try:
                info = json.loads(out)
                return info[0] if info else None
            except json.JSONDecodeError:
                pass
        
        return None
    
    def exec_command(self, command: str, container: str = "tsijukebox-app") -> tuple[int, str]:
        """Execute command inside container."""
        code, out, err = self._run_command(
            ["docker", "exec", container, "sh", "-c", command],
            capture=True
        )
        
        return code, out if code == 0 else err
    
    def setup_for_tsijukebox(
        self,
        supabase_url: str = "",
        supabase_key: str = "",
        port: int = 80
    ) -> bool:
        """
        Complete Docker setup for TSiJUKEBOX.
        """
        self.logger.info("Setting up TSiJUKEBOX with Docker...")
        
        # Install Docker if needed
        if not self.install_docker():
            return False
        
        # Check if Docker is running
        if not self.is_docker_running():
            self.logger.error("Docker is not running. Start with: sudo systemctl start docker")
            return False
        
        # Create compose file
        if not self.create_compose_file(supabase_url, supabase_key, port):
            return False
        
        # Create environment file
        self.create_env_file({
            "TZ": "America/Sao_Paulo",
            "APP_PORT": str(port)
        })
        
        # Pull image and start
        if self.pull_image() and self.start():
            self.logger.success("TSiJUKEBOX Docker setup complete!")
            self.logger.info(f"Access at: http://localhost:{port}")
            return True
        
        return False
    
    def create_systemd_service(self) -> bool:
        """Create systemd service for Docker Compose."""
        self.logger.info("Creating systemd service...")
        
        service_content = f"""[Unit]
Description=TSiJUKEBOX Enterprise (Docker)
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory={self.DOCKER_DIR}
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
"""
        
        service_path = Path("/etc/systemd/system/tsijukebox-docker.service")
        
        try:
            proc = subprocess.Popen(
                ["sudo", "tee", str(service_path)],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            proc.communicate(input=service_content.encode())
            
            if proc.returncode == 0:
                subprocess.run(["sudo", "systemctl", "daemon-reload"], capture_output=True)
                subprocess.run(["sudo", "systemctl", "enable", "tsijukebox-docker"], capture_output=True)
                self.logger.success("Systemd service created")
                return True
                
        except Exception as e:
            self.logger.error(f"Failed to create service: {e}")
        
        return False


def main():
    """Test Docker setup functionality."""
    docker = DockerSetup()
    
    print("=== Docker Setup Test ===\n")
    
    status = docker.get_status()
    
    print(f"Docker installed: {'✓' if status.installed else '✗'}")
    
    if status.installed:
        print(f"  Version: {status.version}")
        print(f"  Compose: {status.compose_version}")
        print(f"  Running: {'✓' if status.running else '✗'}")
        
        if status.containers:
            print(f"  TSiJUKEBOX containers: {', '.join(status.containers)}")
        else:
            print("  TSiJUKEBOX containers: none")
    else:
        print("\nRun with --install to set up Docker")


if __name__ == "__main__":
    main()

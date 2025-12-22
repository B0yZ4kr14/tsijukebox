"""
Testes para a classe DockerInstaller do docker-install.py.

Testa instalação, início do daemon, adição de usuário ao grupo
docker e verificação da instalação.
"""

import pytest
from unittest.mock import MagicMock, patch

# Import classes from docker-install.py
import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from importlib.util import spec_from_loader, module_from_spec
from importlib.machinery import SourceFileLoader

# Load docker-install.py as module
loader = SourceFileLoader("docker_install", str(Path(__file__).parent.parent / "docker-install.py"))
spec = spec_from_loader("docker_install", loader)
docker_install = module_from_spec(spec)
loader.exec_module(docker_install)

DockerInstaller = docker_install.DockerInstaller
CommandRunner = docker_install.CommandRunner
Logger = docker_install.Logger


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def docker_installer() -> DockerInstaller:
    """Create a DockerInstaller instance."""
    return DockerInstaller()


@pytest.fixture
def mock_logger(monkeypatch):
    """Mock Logger to suppress output during tests."""
    monkeypatch.setattr(Logger, "info", lambda msg: None)
    monkeypatch.setattr(Logger, "success", lambda msg: None)
    monkeypatch.setattr(Logger, "warning", lambda msg: None)
    monkeypatch.setattr(Logger, "error", lambda msg: None)
    monkeypatch.setattr(Logger, "debug", lambda msg: None)
    monkeypatch.setattr(Logger, "command", lambda cmd: None)


# ============================================================================
# TESTS: DockerInstaller.install()
# ============================================================================

@pytest.mark.unit
class TestDockerInstallerInstall:
    """Tests for DockerInstaller.install() method."""
    
    def test_install_success(self, docker_installer, mock_logger, monkeypatch):
        """Test successful Docker installation."""
        mock_run = MagicMock(return_value=(0, "", ""))
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.install()
        
        assert result is True
        mock_run.assert_called_once()
        call_args = mock_run.call_args[0][0]
        assert "pacman" in call_args
        assert "docker" in call_args
        assert "docker-compose" in call_args
    
    def test_install_failure_pacman_error(self, docker_installer, mock_logger, monkeypatch):
        """Test Docker installation failure due to pacman error."""
        mock_run = MagicMock(return_value=(1, "", "error: failed to synchronize databases"))
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.install()
        
        assert result is False
    
    def test_install_failure_package_not_found(self, docker_installer, mock_logger, monkeypatch):
        """Test Docker installation failure when package not found."""
        mock_run = MagicMock(return_value=(1, "", "error: target not found: docker"))
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.install()
        
        assert result is False


# ============================================================================
# TESTS: DockerInstaller.start_daemon()
# ============================================================================

@pytest.mark.unit
class TestDockerInstallerStartDaemon:
    """Tests for DockerInstaller.start_daemon() method."""
    
    def test_start_daemon_success(self, docker_installer, mock_logger, monkeypatch):
        """Test successful Docker daemon start."""
        # Mock: enable returns 0, start returns 0, docker info returns 0 immediately
        call_count = [0]
        
        def mock_run(cmd, check=True, *args, **kwargs):
            call_count[0] += 1
            # First call: systemctl enable
            # Second call: systemctl start
            # Third+ calls: docker info (return success immediately)
            return (0, "", "")
        
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.start_daemon()
        
        assert result is True
        assert call_count[0] >= 3  # enable, start, at least one docker info
    
    def test_start_daemon_failure_systemctl_error(self, docker_installer, mock_logger, monkeypatch):
        """Test Docker daemon start failure due to systemctl error."""
        call_count = [0]
        
        def mock_run(cmd, check=True, *args, **kwargs):
            call_count[0] += 1
            if "start" in cmd:
                return (1, "", "Failed to start docker.service")
            if "docker" in cmd and "info" in cmd:
                return (1, "", "Cannot connect to Docker daemon")
            return (0, "", "")
        
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        # Patch time.sleep to speed up test
        monkeypatch.setattr("time.sleep", lambda x: None)
        
        result = docker_installer.start_daemon()
        
        assert result is False
    
    def test_start_daemon_timeout(self, docker_installer, mock_logger, monkeypatch):
        """Test Docker daemon start timeout."""
        def mock_run(cmd, check=True, *args, **kwargs):
            if "docker" in cmd and "info" in cmd:
                return (1, "", "Cannot connect to Docker daemon")
            return (0, "", "")
        
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        monkeypatch.setattr("time.sleep", lambda x: None)
        
        result = docker_installer.start_daemon()
        
        assert result is False


# ============================================================================
# TESTS: DockerInstaller.add_user_to_group()
# ============================================================================

@pytest.mark.unit
class TestDockerInstallerAddUserToGroup:
    """Tests for DockerInstaller.add_user_to_group() method."""
    
    def test_add_user_to_group_success(self, docker_installer, mock_logger, monkeypatch):
        """Test successful user addition to docker group."""
        mock_run = MagicMock(return_value=(0, "", ""))
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.add_user_to_group("testuser")
        
        assert result is True
        mock_run.assert_called_once()
        call_args = mock_run.call_args[0][0]
        assert "usermod" in call_args
        assert "-aG" in call_args
        assert "docker" in call_args
        assert "testuser" in call_args
    
    def test_add_user_to_group_root_skip(self, docker_installer, mock_logger, monkeypatch):
        """Test that root user is skipped."""
        mock_run = MagicMock(return_value=(0, "", ""))
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.add_user_to_group("root")
        
        assert result is True
        mock_run.assert_not_called()  # Should not call usermod for root
    
    def test_add_user_to_group_failure(self, docker_installer, mock_logger, monkeypatch):
        """Test user addition failure."""
        mock_run = MagicMock(return_value=(1, "", "usermod: user 'testuser' does not exist"))
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.add_user_to_group("testuser")
        
        assert result is False


# ============================================================================
# TESTS: DockerInstaller.verify()
# ============================================================================

@pytest.mark.unit
class TestDockerInstallerVerify:
    """Tests for DockerInstaller.verify() method."""
    
    def test_verify_success(self, docker_installer, mock_logger, monkeypatch):
        """Test successful Docker verification."""
        mock_run = MagicMock(return_value=(0, "Hello from Docker! This message shows...", ""))
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.verify()
        
        assert result is True
        mock_run.assert_called_once()
        call_args = mock_run.call_args[0][0]
        assert "docker" in call_args
        assert "run" in call_args
        assert "hello-world" in call_args
    
    def test_verify_failure_docker_not_running(self, docker_installer, mock_logger, monkeypatch):
        """Test Docker verification failure when daemon not running."""
        mock_run = MagicMock(return_value=(1, "", "Cannot connect to the Docker daemon"))
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.verify()
        
        assert result is False
    
    def test_verify_failure_no_hello_message(self, docker_installer, mock_logger, monkeypatch):
        """Test Docker verification failure when hello-world doesn't output expected message."""
        mock_run = MagicMock(return_value=(0, "Some other output", ""))
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.verify()
        
        assert result is False
    
    def test_verify_failure_container_error(self, docker_installer, mock_logger, monkeypatch):
        """Test Docker verification failure due to container error."""
        mock_run = MagicMock(return_value=(125, "", "docker: Error response from daemon"))
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        
        result = docker_installer.verify()
        
        assert result is False


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

@pytest.mark.integration
class TestDockerInstallerIntegration:
    """Integration tests for DockerInstaller class."""
    
    def test_full_installation_flow(self, docker_installer, mock_logger, monkeypatch):
        """Test full installation flow: install -> start_daemon -> add_user -> verify."""
        call_sequence = []
        
        def mock_run(cmd, check=True, *args, **kwargs):
            call_sequence.append(cmd)
            if "hello-world" in cmd:
                return (0, "Hello from Docker!", "")
            return (0, "", "")
        
        monkeypatch.setattr(CommandRunner, "run", mock_run)
        monkeypatch.setattr("time.sleep", lambda x: None)
        
        # Run full flow
        assert docker_installer.install() is True
        assert docker_installer.start_daemon() is True
        assert docker_installer.add_user_to_group("testuser") is True
        assert docker_installer.verify() is True
        
        # Verify call sequence
        assert len(call_sequence) >= 5  # install, enable, start, docker info checks, usermod, verify

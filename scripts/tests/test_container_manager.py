"""
TSiJUKEBOX Installer - ContainerManager Tests
==============================================
Tests for the ContainerManager class.
"""

import json
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

# Import from conftest
from conftest import (
    CommandRunner,
    Logger,
    CONFIG,
)
import conftest

# Get ContainerManager from docker_install module
ContainerManager = conftest.docker_install.ContainerManager


# =============================================================================
# INITIALIZATION TESTS
# =============================================================================

@pytest.mark.unit
class TestContainerManagerInit:
    """Tests for ContainerManager initialization."""
    
    def test_init_default_compose_dir(self):
        """Test default compose directory is set."""
        manager = ContainerManager()
        assert manager.compose_dir == CONFIG.COMPOSE_DIR
    
    def test_compose_cmd_builds_correct_command(self, temp_compose_dir: Path):
        """Test _compose_cmd builds docker compose command correctly."""
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        
        cmd = manager._compose_cmd("up", "-d")
        
        assert cmd[0] == "docker"
        assert cmd[1] == "compose"
        assert "-f" in cmd
        assert "up" in cmd
        assert "-d" in cmd


# =============================================================================
# PULL IMAGE TESTS
# =============================================================================

@pytest.mark.unit
class TestContainerManagerPullImage:
    """Tests for pull_image method."""
    
    def test_pull_image_success(self, mock_command_runner, mock_logger):
        """Test successful image pull."""
        mock_command_runner.return_value = (0, "Downloaded newer image", "")
        
        manager = ContainerManager()
        result = manager.pull_image()
        
        assert result is True
        mock_command_runner.assert_called()
    
    def test_pull_image_failure(self, mock_command_runner, mock_logger):
        """Test failed image pull."""
        mock_command_runner.return_value = (1, "", "Error pulling image")
        
        manager = ContainerManager()
        result = manager.pull_image()
        
        assert result is False


# =============================================================================
# START TESTS
# =============================================================================

@pytest.mark.unit
class TestContainerManagerStart:
    """Tests for start method."""
    
    def test_start_success(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test successful container start."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.start()
        
        assert result is True
    
    def test_start_failure(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test failed container start."""
        mock_command_runner.return_value = (1, "", "Error starting containers")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.start()
        
        assert result is False
    
    def test_start_with_profiles_success(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test starting with specific profiles."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.start_with_profiles(["ssl-letsencrypt", "monitoring"])
        
        assert result is True
    
    def test_start_with_profiles_failure(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test failed start with profiles."""
        mock_command_runner.return_value = (1, "", "Profile not found")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.start_with_profiles(["invalid-profile"])
        
        assert result is False


# =============================================================================
# STOP TESTS
# =============================================================================

@pytest.mark.unit
class TestContainerManagerStop:
    """Tests for stop method."""
    
    def test_stop_success(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test successful container stop."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.stop()
        
        assert result is True
    
    def test_stop_with_warning(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test stop with warning still returns True."""
        mock_command_runner.return_value = (0, "", "Warning: some containers already stopped")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.stop()
        
        assert result is True


# =============================================================================
# RESTART TESTS
# =============================================================================

@pytest.mark.unit
class TestContainerManagerRestart:
    """Tests for restart method."""
    
    def test_restart_success(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test successful container restart."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.restart()
        
        assert result is True
    
    def test_restart_failure(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test failed container restart."""
        mock_command_runner.return_value = (1, "", "Error restarting")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.restart()
        
        assert result is False


# =============================================================================
# LOGS TESTS
# =============================================================================

@pytest.mark.unit
class TestContainerManagerLogs:
    """Tests for logs method."""
    
    def test_logs_with_tail(self, mock_command_runner, temp_compose_dir: Path):
        """Test getting logs with tail option."""
        mock_command_runner.return_value = (0, "Container log output", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.logs(tail=50)
        
        assert result == "Container log output"
    
    def test_logs_returns_empty_on_failure(self, mock_command_runner, temp_compose_dir: Path):
        """Test logs returns empty string on failure."""
        mock_command_runner.return_value = (1, "", "Error getting logs")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.logs()
        
        assert result == ""


# =============================================================================
# HEALTH CHECK TESTS
# =============================================================================

@pytest.mark.unit
class TestContainerManagerHealthCheck:
    """Tests for health_check method."""
    
    def test_health_check_success(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test successful health check."""
        mock_command_runner.return_value = (0, "OK", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        
        # Create .env file with PORT
        env_file = temp_compose_dir / ".env"
        env_file.write_text("PORT=8080\n")
        
        result = manager.health_check(timeout=2)
        
        assert result is True
    
    def test_health_check_timeout(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test health check timeout."""
        mock_command_runner.return_value = (1, "", "Connection refused")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.health_check(timeout=1)
        
        assert result is False


# =============================================================================
# STATUS TESTS
# =============================================================================

@pytest.mark.unit
class TestContainerManagerStatus:
    """Tests for status method."""
    
    def test_status_running(self, mock_command_runner, temp_compose_dir: Path):
        """Test status when containers are running."""
        containers_json = json.dumps([
            {"Name": "tsijukebox-app", "State": "running"},
            {"Name": "tsijukebox-nginx", "State": "running"}
        ])
        mock_command_runner.return_value = (0, containers_json, "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.status()
        
        assert result["running"] is True
        assert len(result["containers"]) == 2
    
    def test_status_stopped(self, mock_command_runner, temp_compose_dir: Path):
        """Test status when no containers running."""
        mock_command_runner.return_value = (0, "[]", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.status()
        
        assert result["running"] is False
        assert len(result["containers"]) == 0
    
    def test_status_invalid_json(self, mock_command_runner, temp_compose_dir: Path):
        """Test status with invalid JSON response."""
        mock_command_runner.return_value = (0, "not valid json", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.status()
        
        assert result["running"] is False
        assert result["containers"] == []
    
    def test_status_command_failure(self, mock_command_runner, temp_compose_dir: Path):
        """Test status when command fails."""
        mock_command_runner.return_value = (1, "", "Error")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.status()
        
        assert result["running"] is False


# =============================================================================
# UPDATE TESTS
# =============================================================================

@pytest.mark.unit
class TestContainerManagerUpdate:
    """Tests for update method."""
    
    def test_update_success(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test successful update."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.update()
        
        assert result is True
    
    def test_update_pull_failure(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test update fails if pull fails."""
        mock_command_runner.return_value = (1, "", "Pull failed")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.update()
        
        assert result is False


# =============================================================================
# CLEANUP TESTS
# =============================================================================

@pytest.mark.unit
class TestContainerManagerCleanup:
    """Tests for cleanup method."""
    
    def test_cleanup_without_volumes(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test cleanup without removing volumes."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.cleanup(remove_volumes=False)
        
        assert result is True
    
    def test_cleanup_with_volumes(self, mock_command_runner, mock_logger, temp_compose_dir: Path):
        """Test cleanup with volume removal."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = ContainerManager()
        manager.compose_dir = temp_compose_dir
        result = manager.cleanup(remove_volumes=True)
        
        assert result is True

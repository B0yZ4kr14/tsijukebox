"""
TSiJUKEBOX Installer - SystemdManager Tests
============================================
Tests for the SystemdManager class.
"""

from pathlib import Path
from unittest.mock import patch

import pytest

# Import from conftest
from conftest import (
    CommandRunner,
    Logger,
    CONFIG,
)
import conftest

# Get SystemdManager from docker_install module
SystemdManager = conftest.docker_install.SystemdManager


# =============================================================================
# GENERATE SERVICE TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemdManagerGenerateService:
    """Tests for generate_service method."""
    
    def test_generate_service_without_profiles(self):
        """Test service generation without profiles."""
        manager = SystemdManager()
        service_content = manager.generate_service()
        
        assert "[Unit]" in service_content
        assert "[Service]" in service_content
        assert "[Install]" in service_content
        assert "docker compose up -d" in service_content
        assert "Requires=docker.service" in service_content
    
    def test_generate_service_with_profiles(self):
        """Test service generation with profiles."""
        manager = SystemdManager()
        service_content = manager.generate_service(profiles=["ssl-letsencrypt", "monitoring"])
        
        assert "--profile ssl-letsencrypt" in service_content
        assert "--profile monitoring" in service_content
    
    def test_generate_service_has_restart_policy(self):
        """Test that service has restart policy."""
        manager = SystemdManager()
        service_content = manager.generate_service()
        
        assert "Restart=on-failure" in service_content
        assert "RestartSec=30" in service_content


# =============================================================================
# GENERATE CERTBOT TIMER TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemdManagerGenerateCertbotTimer:
    """Tests for generate_certbot_timer method."""
    
    def test_generate_certbot_timer_content(self):
        """Test certbot timer content is correct."""
        manager = SystemdManager()
        timer_content = manager.generate_certbot_timer()
        
        assert "[Unit]" in timer_content
        assert "[Timer]" in timer_content
        assert "[Install]" in timer_content
        assert "OnCalendar" in timer_content
        assert "Persistent=true" in timer_content
    
    def test_generate_certbot_timer_runs_twice_daily(self):
        """Test timer runs twice daily."""
        manager = SystemdManager()
        timer_content = manager.generate_certbot_timer()
        
        assert "00,12:00:00" in timer_content


# =============================================================================
# GENERATE CERTBOT SERVICE TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemdManagerGenerateCertbotService:
    """Tests for generate_certbot_service method."""
    
    def test_generate_certbot_service_content(self):
        """Test certbot service content is correct."""
        manager = SystemdManager()
        service_content = manager.generate_certbot_service()
        
        assert "[Unit]" in service_content
        assert "[Service]" in service_content
        assert "Type=oneshot" in service_content
        assert "certbot renew" in service_content
    
    def test_generate_certbot_service_reloads_nginx(self):
        """Test service reloads nginx after renewal."""
        manager = SystemdManager()
        service_content = manager.generate_certbot_service()
        
        assert "nginx -s reload" in service_content


# =============================================================================
# CREATE SERVICE TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemdManagerCreateService:
    """Tests for create_service method."""
    
    def test_create_service_success(self, mock_command_runner, mock_logger, temp_dir: Path):
        """Test successful service creation."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = SystemdManager()
        manager.SERVICE_PATH = temp_dir / "tsijukebox.service"
        
        result = manager.create_service()
        
        assert result is True
        assert manager.SERVICE_PATH.exists()
    
    def test_create_service_with_profiles(self, mock_command_runner, mock_logger, temp_dir: Path):
        """Test service creation with profiles."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = SystemdManager()
        manager.SERVICE_PATH = temp_dir / "tsijukebox.service"
        
        result = manager.create_service(profiles=["ssl-cloudflare"])
        
        assert result is True
        content = manager.SERVICE_PATH.read_text()
        assert "--profile ssl-cloudflare" in content
    
    def test_create_service_permission_error(self, mock_command_runner, mock_logger):
        """Test service creation with permission error."""
        manager = SystemdManager()
        manager.SERVICE_PATH = Path("/nonexistent/path/service")
        
        result = manager.create_service()
        
        assert result is False


# =============================================================================
# CREATE CERTBOT RENEWAL TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemdManagerCreateCertbotRenewal:
    """Tests for create_certbot_renewal method."""
    
    def test_create_certbot_renewal_success(self, mock_command_runner, mock_logger, temp_dir: Path):
        """Test successful certbot renewal setup."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = SystemdManager()
        manager.CERTBOT_TIMER_PATH = temp_dir / "tsijukebox-certbot.timer"
        manager.CERTBOT_SERVICE_PATH = temp_dir / "tsijukebox-certbot.service"
        
        result = manager.create_certbot_renewal()
        
        assert result is True
        assert manager.CERTBOT_TIMER_PATH.exists()
        assert manager.CERTBOT_SERVICE_PATH.exists()
    
    def test_create_certbot_renewal_failure(self, mock_command_runner, mock_logger):
        """Test certbot renewal setup failure."""
        manager = SystemdManager()
        manager.CERTBOT_TIMER_PATH = Path("/nonexistent/timer")
        manager.CERTBOT_SERVICE_PATH = Path("/nonexistent/service")
        
        result = manager.create_certbot_renewal()
        
        assert result is False


# =============================================================================
# ENABLE/DISABLE TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemdManagerEnableDisable:
    """Tests for enable and disable methods."""
    
    def test_enable_success(self, mock_command_runner, mock_logger):
        """Test successful service enable."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = SystemdManager()
        result = manager.enable()
        
        assert result is True
    
    def test_enable_failure(self, mock_command_runner):
        """Test failed service enable."""
        mock_command_runner.return_value = (1, "", "Service not found")
        
        manager = SystemdManager()
        result = manager.enable()
        
        assert result is False
    
    def test_disable_success(self, mock_command_runner):
        """Test successful service disable."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = SystemdManager()
        result = manager.disable()
        
        assert result is True
    
    def test_disable_failure(self, mock_command_runner):
        """Test failed service disable."""
        mock_command_runner.return_value = (1, "", "Error")
        
        manager = SystemdManager()
        result = manager.disable()
        
        assert result is False


# =============================================================================
# START/STOP TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemdManagerStartStop:
    """Tests for start and stop methods."""
    
    def test_start_success(self, mock_command_runner):
        """Test successful service start."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = SystemdManager()
        result = manager.start()
        
        assert result is True
    
    def test_start_failure(self, mock_command_runner):
        """Test failed service start."""
        mock_command_runner.return_value = (1, "", "Failed to start")
        
        manager = SystemdManager()
        result = manager.start()
        
        assert result is False
    
    def test_stop_success(self, mock_command_runner):
        """Test successful service stop."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = SystemdManager()
        result = manager.stop()
        
        assert result is True
    
    def test_stop_failure(self, mock_command_runner):
        """Test failed service stop."""
        mock_command_runner.return_value = (1, "", "Failed to stop")
        
        manager = SystemdManager()
        result = manager.stop()
        
        assert result is False


# =============================================================================
# STATUS TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemdManagerStatus:
    """Tests for status method."""
    
    def test_status_active(self, mock_command_runner):
        """Test status when service is active."""
        mock_command_runner.return_value = (0, "active", "")
        
        manager = SystemdManager()
        result = manager.status()
        
        assert result == "active"
    
    def test_status_inactive(self, mock_command_runner):
        """Test status when service is inactive."""
        mock_command_runner.return_value = (3, "inactive", "")
        
        manager = SystemdManager()
        result = manager.status()
        
        assert result == "inactive"
    
    def test_certbot_timer_status_active(self, mock_command_runner):
        """Test certbot timer status when active."""
        mock_command_runner.return_value = (0, "active", "")
        
        manager = SystemdManager()
        result = manager.certbot_timer_status()
        
        assert result == "active"
    
    def test_certbot_timer_status_inactive(self, mock_command_runner):
        """Test certbot timer status when inactive."""
        mock_command_runner.return_value = (3, "", "")
        
        manager = SystemdManager()
        result = manager.certbot_timer_status()
        
        assert result == "inactive"


# =============================================================================
# REMOVE TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemdManagerRemove:
    """Tests for remove method."""
    
    def test_remove_success(self, mock_command_runner, temp_dir: Path):
        """Test successful service removal."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = SystemdManager()
        manager.SERVICE_PATH = temp_dir / "tsijukebox.service"
        manager.CERTBOT_TIMER_PATH = temp_dir / "tsijukebox-certbot.timer"
        manager.CERTBOT_SERVICE_PATH = temp_dir / "tsijukebox-certbot.service"
        
        # Create the files
        manager.SERVICE_PATH.write_text("[Unit]")
        manager.CERTBOT_TIMER_PATH.write_text("[Timer]")
        manager.CERTBOT_SERVICE_PATH.write_text("[Service]")
        
        result = manager.remove()
        
        assert result is True
        assert not manager.SERVICE_PATH.exists()
        assert not manager.CERTBOT_TIMER_PATH.exists()
        assert not manager.CERTBOT_SERVICE_PATH.exists()

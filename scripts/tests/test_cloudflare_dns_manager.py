"""
TSiJUKEBOX Installer - CloudflareDNSManager Tests
=================================================
Unit tests for the CloudflareDNSManager class.
"""

import os
import stat
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

from conftest import (
    CloudflareDNSManager, 
    CommandRunner, 
    Logger, 
    CONFIG
)


# =============================================================================
# INITIALIZATION TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.cloudflare
class TestCloudflareDNSManagerInit:
    """Tests for CloudflareDNSManager initialization."""
    
    def test_init_with_valid_params(
        self, 
        sample_domain: str, 
        sample_email: str,
        sample_cloudflare_token: str
    ):
        """Test initialization with valid parameters."""
        manager = CloudflareDNSManager(
            sample_domain, 
            sample_email, 
            sample_cloudflare_token
        )
        
        assert manager.domain == sample_domain
        assert manager.email == sample_email
        assert manager.api_token == sample_cloudflare_token
        assert manager.staging is False
        assert manager.wildcard is False
    
    def test_init_with_wildcard_enabled(
        self, 
        sample_domain: str, 
        sample_email: str,
        sample_cloudflare_token: str
    ):
        """Test initialization with wildcard mode enabled."""
        manager = CloudflareDNSManager(
            sample_domain, 
            sample_email, 
            sample_cloudflare_token,
            wildcard=True
        )
        
        assert manager.wildcard is True
    
    def test_init_with_staging_enabled(
        self, 
        sample_domain: str, 
        sample_email: str,
        sample_cloudflare_token: str
    ):
        """Test initialization with staging mode enabled."""
        manager = CloudflareDNSManager(
            sample_domain, 
            sample_email, 
            sample_cloudflare_token,
            staging=True
        )
        
        assert manager.staging is True


# =============================================================================
# VALIDATE TOKEN TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.cloudflare
class TestCloudflareDNSManagerValidateToken:
    """Tests for validate_token method."""
    
    def test_validate_token_valid(
        self, 
        cloudflare_manager: CloudflareDNSManager,
        mock_logger: None
    ):
        """Test validation of a valid token."""
        result = cloudflare_manager.validate_token()
        
        assert result is True
    
    def test_validate_token_empty(
        self, 
        sample_domain: str, 
        sample_email: str,
        mock_logger: None
    ):
        """Test validation of an empty token."""
        manager = CloudflareDNSManager(sample_domain, sample_email, "")
        
        result = manager.validate_token()
        
        assert result is False
    
    def test_validate_token_short(
        self, 
        sample_domain: str, 
        sample_email: str,
        sample_short_token: str,
        mock_logger: None
    ):
        """Test validation of a short token (should warn but return True)."""
        manager = CloudflareDNSManager(
            sample_domain, 
            sample_email, 
            sample_short_token
        )
        
        # Short token should still return True, just with a warning
        result = manager.validate_token()
        
        assert result is True
    
    def test_validate_token_none(
        self, 
        sample_domain: str, 
        sample_email: str,
        mock_logger: None
    ):
        """Test validation with None token."""
        manager = CloudflareDNSManager(sample_domain, sample_email, None)
        
        result = manager.validate_token()
        
        assert result is False


# =============================================================================
# SETUP DIRECTORIES TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.cloudflare
class TestCloudflareDNSManagerSetupDirectories:
    """Tests for setup_directories method."""
    
    def test_setup_directories_success(
        self, 
        cloudflare_manager: CloudflareDNSManager,
        mock_logger: None
    ):
        """Test successful directory creation."""
        result = cloudflare_manager.setup_directories()
        
        assert result is True
        assert cloudflare_manager.certs_dir.exists()
        assert cloudflare_manager.credentials_path.parent.exists()
    
    def test_setup_directories_already_exist(
        self, 
        cloudflare_manager: CloudflareDNSManager,
        mock_logger: None
    ):
        """Test setup when directories already exist."""
        # Create directories first
        cloudflare_manager.certs_dir.mkdir(parents=True, exist_ok=True)
        cloudflare_manager.credentials_path.parent.mkdir(parents=True, exist_ok=True)
        
        result = cloudflare_manager.setup_directories()
        
        assert result is True


# =============================================================================
# CREATE CREDENTIALS FILE TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.cloudflare
class TestCloudflareDNSManagerCreateCredentialsFile:
    """Tests for create_credentials_file method."""
    
    def test_create_credentials_file_success(
        self, 
        cloudflare_manager: CloudflareDNSManager,
        mock_logger: None
    ):
        """Test successful credentials file creation."""
        # Ensure parent directory exists
        cloudflare_manager.credentials_path.parent.mkdir(parents=True, exist_ok=True)
        
        result = cloudflare_manager.create_credentials_file()
        
        assert result is True
        assert cloudflare_manager.credentials_path.exists()
    
    def test_create_credentials_file_content(
        self, 
        cloudflare_manager: CloudflareDNSManager,
        sample_cloudflare_token: str,
        mock_logger: None
    ):
        """Test that credentials file contains correct content."""
        cloudflare_manager.credentials_path.parent.mkdir(parents=True, exist_ok=True)
        
        cloudflare_manager.create_credentials_file()
        
        content = cloudflare_manager.credentials_path.read_text()
        assert f"dns_cloudflare_api_token = {sample_cloudflare_token}" in content
    
    def test_create_credentials_file_permissions(
        self, 
        cloudflare_manager: CloudflareDNSManager,
        mock_logger: None
    ):
        """Test that credentials file has restricted permissions (600)."""
        cloudflare_manager.credentials_path.parent.mkdir(parents=True, exist_ok=True)
        
        cloudflare_manager.create_credentials_file()
        
        # Check file permissions
        file_stat = os.stat(cloudflare_manager.credentials_path)
        permissions = stat.S_IMODE(file_stat.st_mode)
        
        # Should be 0o600 (read/write for owner only)
        assert permissions == 0o600


# =============================================================================
# REQUEST CERTIFICATE TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.cloudflare
class TestCloudflareDNSManagerRequestCertificate:
    """Tests for request_certificate method."""
    
    def test_request_certificate_success(
        self,
        cloudflare_manager: CloudflareDNSManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test successful certificate request."""
        mock_command_runner.return_value = (0, "Certificate obtained", "")
        
        result = cloudflare_manager.request_certificate()
        
        assert result is True
        mock_command_runner.assert_called_once()
    
    def test_request_certificate_failure(
        self,
        cloudflare_manager: CloudflareDNSManager,
        mock_command_runner_failure: MagicMock,
        mock_logger: None
    ):
        """Test certificate request failure."""
        result = cloudflare_manager.request_certificate()
        
        assert result is False
    
    def test_request_certificate_includes_dns_cloudflare(
        self,
        cloudflare_manager: CloudflareDNSManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test that --dns-cloudflare flag is included."""
        mock_command_runner.return_value = (0, "Success", "")
        
        cloudflare_manager.request_certificate()
        
        call_args = mock_command_runner.call_args[0][0]
        assert "--dns-cloudflare" in call_args
    
    def test_request_certificate_includes_credentials_path(
        self,
        cloudflare_manager: CloudflareDNSManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test that credentials path is included."""
        mock_command_runner.return_value = (0, "Success", "")
        
        cloudflare_manager.request_certificate()
        
        call_args = mock_command_runner.call_args[0][0]
        assert "--dns-cloudflare-credentials" in call_args
    
    def test_request_certificate_wildcard(
        self,
        cloudflare_manager_wildcard: CloudflareDNSManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test wildcard certificate request."""
        mock_command_runner.return_value = (0, "Wildcard cert obtained", "")
        
        cloudflare_manager_wildcard.request_certificate()
        
        call_args = mock_command_runner.call_args[0][0]
        # Should include both domain and *.domain
        assert f"*.{cloudflare_manager_wildcard.domain}" in call_args
        assert cloudflare_manager_wildcard.domain in call_args
    
    def test_request_certificate_staging_flag(
        self,
        cloudflare_manager_staging: CloudflareDNSManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test that staging flag is added when in staging mode."""
        mock_command_runner.return_value = (0, "Success", "")
        
        cloudflare_manager_staging.request_certificate()
        
        call_args = mock_command_runner.call_args[0][0]
        assert "--staging" in call_args


# =============================================================================
# RENEW CERTIFICATE TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.cloudflare
class TestCloudflareDNSManagerRenewCertificate:
    """Tests for renew_certificate method."""
    
    def test_renew_certificate_success(
        self,
        cloudflare_manager: CloudflareDNSManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test successful certificate renewal."""
        mock_command_runner.return_value = (0, "Renewal successful", "")
        
        result = cloudflare_manager.renew_certificate()
        
        assert result is True
    
    def test_renew_certificate_failure(
        self,
        cloudflare_manager: CloudflareDNSManager,
        mock_command_runner_failure: MagicMock,
        mock_logger: None
    ):
        """Test certificate renewal failure."""
        result = cloudflare_manager.renew_certificate()
        
        assert result is False
    
    def test_renew_certificate_uses_dns_cloudflare(
        self,
        cloudflare_manager: CloudflareDNSManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test that renewal uses DNS Cloudflare method."""
        mock_command_runner.return_value = (0, "Success", "")
        
        cloudflare_manager.renew_certificate()
        
        call_args = mock_command_runner.call_args[0][0]
        assert "--dns-cloudflare" in call_args
        assert "renew" in call_args


# =============================================================================
# CHECK CERTIFICATE EXISTS TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.cloudflare
class TestCloudflareDNSManagerCheckCertificateExists:
    """Tests for check_certificate_exists method."""
    
    def test_check_certificate_exists_true(
        self,
        cloudflare_manager: CloudflareDNSManager,
        sample_domain: str
    ):
        """Test when certificate exists."""
        cert_dir = cloudflare_manager.certs_dir / "live" / sample_domain
        cert_dir.mkdir(parents=True, exist_ok=True)
        (cert_dir / "fullchain.pem").touch()
        
        result = cloudflare_manager.check_certificate_exists()
        
        assert result is True
    
    def test_check_certificate_exists_false(
        self,
        cloudflare_manager: CloudflareDNSManager
    ):
        """Test when certificate does not exist."""
        result = cloudflare_manager.check_certificate_exists()
        
        assert result is False


# =============================================================================
# CLEANUP CREDENTIALS TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.cloudflare
class TestCloudflareDNSManagerCleanupCredentials:
    """Tests for cleanup_credentials method."""
    
    def test_cleanup_credentials_removes_file(
        self,
        cloudflare_manager: CloudflareDNSManager,
        mock_logger: None
    ):
        """Test that credentials file is removed."""
        # Create the file first
        cloudflare_manager.credentials_path.parent.mkdir(parents=True, exist_ok=True)
        cloudflare_manager.credentials_path.write_text("test")
        
        assert cloudflare_manager.credentials_path.exists()
        
        result = cloudflare_manager.cleanup_credentials()
        
        assert result is True
        assert not cloudflare_manager.credentials_path.exists()
    
    def test_cleanup_credentials_file_not_exists(
        self,
        cloudflare_manager: CloudflareDNSManager,
        mock_logger: None
    ):
        """Test cleanup when file doesn't exist."""
        result = cloudflare_manager.cleanup_credentials()
        
        # Should still return True
        assert result is True
    
    def test_cleanup_credentials_permission_error(
        self,
        cloudflare_manager: CloudflareDNSManager,
        mock_logger: None
    ):
        """Test cleanup when permission error occurs."""
        # Create file with restricted permissions
        cloudflare_manager.credentials_path.parent.mkdir(parents=True, exist_ok=True)
        cloudflare_manager.credentials_path.write_text("test")
        
        # Mock unlink to raise permission error
        with patch.object(Path, 'unlink', side_effect=PermissionError("Access denied")):
            result = cloudflare_manager.cleanup_credentials()
        
        # Should return False on error
        assert result is False

"""
TSiJUKEBOX Installer - CertbotManager Tests
============================================
Unit tests for the CertbotManager class.
"""

import os
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

from conftest import (
    CertbotManager, 
    CommandRunner, 
    Logger, 
    CONFIG
)


# =============================================================================
# INITIALIZATION TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.certbot
class TestCertbotManagerInit:
    """Tests for CertbotManager initialization."""
    
    def test_init_with_valid_params(self, sample_domain: str, sample_email: str):
        """Test initialization with valid parameters."""
        manager = CertbotManager(sample_domain, sample_email)
        
        assert manager.domain == sample_domain
        assert manager.email == sample_email
        assert manager.staging is False
        assert manager.certs_dir == CONFIG.CERTS_DIR
        assert manager.webroot_dir == CONFIG.WEBROOT_DIR
    
    def test_init_with_staging_enabled(self, sample_domain: str, sample_email: str):
        """Test initialization with staging mode enabled."""
        manager = CertbotManager(sample_domain, sample_email, staging=True)
        
        assert manager.staging is True
    
    def test_init_with_custom_domain(self, sample_email: str):
        """Test initialization with various domain formats."""
        domains = [
            "example.com",
            "sub.example.com",
            "my-site.example.org",
            "localhost"
        ]
        
        for domain in domains:
            manager = CertbotManager(domain, sample_email)
            assert manager.domain == domain


# =============================================================================
# SETUP DIRECTORIES TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.certbot
class TestCertbotManagerSetupDirectories:
    """Tests for setup_directories method."""
    
    def test_setup_directories_success(
        self, 
        certbot_manager: CertbotManager,
        mock_logger: None
    ):
        """Test successful directory creation."""
        result = certbot_manager.setup_directories()
        
        assert result is True
        assert certbot_manager.certs_dir.exists()
        assert certbot_manager.webroot_dir.exists()
    
    def test_setup_directories_already_exist(
        self, 
        certbot_manager: CertbotManager,
        mock_logger: None
    ):
        """Test setup when directories already exist."""
        # Create directories first
        certbot_manager.certs_dir.mkdir(parents=True, exist_ok=True)
        certbot_manager.webroot_dir.mkdir(parents=True, exist_ok=True)
        
        # Should not fail
        result = certbot_manager.setup_directories()
        assert result is True
    
    def test_setup_directories_permission_error(
        self, 
        sample_domain: str, 
        sample_email: str,
        mock_logger: None
    ):
        """Test setup failure due to permission error."""
        manager = CertbotManager(sample_domain, sample_email)
        manager.certs_dir = Path("/root/restricted/certs")
        manager.webroot_dir = Path("/root/restricted/webroot")
        
        # This should fail (no permission to create in /root)
        result = manager.setup_directories()
        assert result is False


# =============================================================================
# REQUEST CERTIFICATE TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.certbot
class TestCertbotManagerRequestCertificate:
    """Tests for request_certificate method."""
    
    def test_request_certificate_success(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test successful certificate request."""
        mock_command_runner.return_value = (0, "Certificate obtained", "")
        
        result = certbot_manager.request_certificate()
        
        assert result is True
        mock_command_runner.assert_called_once()
    
    def test_request_certificate_failure(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner_failure: MagicMock,
        mock_logger: None
    ):
        """Test certificate request failure."""
        result = certbot_manager.request_certificate()
        
        assert result is False
    
    def test_request_certificate_staging_flag(
        self,
        certbot_manager_staging: CertbotManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test that staging flag is added to command."""
        mock_command_runner.return_value = (0, "Certificate obtained", "")
        
        certbot_manager_staging.request_certificate()
        
        # Check that --staging was passed
        call_args = mock_command_runner.call_args[0][0]
        assert "--staging" in call_args
    
    def test_request_certificate_includes_domain(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test that domain is included in command."""
        mock_command_runner.return_value = (0, "Success", "")
        
        certbot_manager.request_certificate()
        
        call_args = mock_command_runner.call_args[0][0]
        assert "-d" in call_args
        assert certbot_manager.domain in call_args
    
    def test_request_certificate_includes_email(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test that email is included in command."""
        mock_command_runner.return_value = (0, "Success", "")
        
        certbot_manager.request_certificate()
        
        call_args = mock_command_runner.call_args[0][0]
        assert "--email" in call_args
        assert certbot_manager.email in call_args
    
    def test_request_certificate_rate_limit_error(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test handling of rate limit error."""
        mock_command_runner.return_value = (1, "", "Rate limit exceeded")
        
        result = certbot_manager.request_certificate()
        
        assert result is False


# =============================================================================
# RENEW CERTIFICATE TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.certbot
class TestCertbotManagerRenewCertificate:
    """Tests for renew_certificate method."""
    
    def test_renew_certificate_success(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test successful certificate renewal."""
        mock_command_runner.return_value = (0, "Renewal successful", "")
        
        result = certbot_manager.renew_certificate()
        
        assert result is True
    
    def test_renew_certificate_failure(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner_failure: MagicMock,
        mock_logger: None
    ):
        """Test certificate renewal failure."""
        result = certbot_manager.renew_certificate()
        
        assert result is False
    
    def test_renew_certificate_no_action_needed(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        mock_logger: None
    ):
        """Test renewal when no action is needed."""
        mock_command_runner.return_value = (
            0, 
            "Cert not yet due for renewal", 
            ""
        )
        
        result = certbot_manager.renew_certificate()
        
        assert result is True


# =============================================================================
# GENERATE SELF-SIGNED TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.certbot
class TestCertbotManagerGenerateSelfSigned:
    """Tests for generate_self_signed method."""
    
    def test_generate_self_signed_success(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        temp_compose_dir: Path,
        mock_logger: None
    ):
        """Test successful self-signed certificate generation."""
        mock_command_runner.return_value = (0, "", "")
        
        # Patch CONFIG.COMPOSE_DIR
        with patch.object(CONFIG, 'COMPOSE_DIR', temp_compose_dir):
            result = certbot_manager.generate_self_signed()
        
        assert result is True
    
    def test_generate_self_signed_openssl_failure(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        temp_compose_dir: Path,
        mock_logger: None
    ):
        """Test failure when openssl fails."""
        mock_command_runner.return_value = (1, "", "openssl: command not found")
        
        with patch.object(CONFIG, 'COMPOSE_DIR', temp_compose_dir):
            result = certbot_manager.generate_self_signed()
        
        assert result is False
    
    def test_generate_self_signed_includes_domain_in_subject(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        temp_compose_dir: Path,
        mock_logger: None
    ):
        """Test that domain is included in certificate subject."""
        mock_command_runner.return_value = (0, "", "")
        
        with patch.object(CONFIG, 'COMPOSE_DIR', temp_compose_dir):
            certbot_manager.generate_self_signed()
        
        call_args = mock_command_runner.call_args[0][0]
        # Check for -subj with CN=domain
        subj_index = call_args.index("-subj")
        subj_value = call_args[subj_index + 1]
        assert f"CN={certbot_manager.domain}" in subj_value


# =============================================================================
# CHECK CERTIFICATE EXISTS TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.certbot
class TestCertbotManagerCheckCertificateExists:
    """Tests for check_certificate_exists method."""
    
    def test_check_certificate_exists_true(
        self,
        certbot_manager: CertbotManager,
        sample_domain: str
    ):
        """Test when certificate exists."""
        # Create mock certificate file
        cert_dir = certbot_manager.certs_dir / "live" / sample_domain
        cert_dir.mkdir(parents=True, exist_ok=True)
        (cert_dir / "fullchain.pem").touch()
        
        result = certbot_manager.check_certificate_exists()
        
        assert result is True
    
    def test_check_certificate_exists_false(
        self,
        certbot_manager: CertbotManager
    ):
        """Test when certificate does not exist."""
        result = certbot_manager.check_certificate_exists()
        
        assert result is False
    
    def test_check_certificate_exists_partial(
        self,
        certbot_manager: CertbotManager,
        sample_domain: str
    ):
        """Test when only directory exists but not the certificate file."""
        cert_dir = certbot_manager.certs_dir / "live" / sample_domain
        cert_dir.mkdir(parents=True, exist_ok=True)
        # Don't create the fullchain.pem file
        
        result = certbot_manager.check_certificate_exists()
        
        assert result is False


# =============================================================================
# GET CERTIFICATE EXPIRY TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.certbot
class TestCertbotManagerGetCertificateExpiry:
    """Tests for get_certificate_expiry method."""
    
    def test_get_expiry_no_certificate(
        self,
        certbot_manager: CertbotManager
    ):
        """Test when no certificate exists."""
        result = certbot_manager.get_certificate_expiry()
        
        assert result is None
    
    def test_get_expiry_with_certificate(
        self,
        certbot_manager: CertbotManager,
        sample_domain: str,
        mock_command_runner: MagicMock
    ):
        """Test getting expiry date from existing certificate."""
        # Create mock certificate file
        cert_dir = certbot_manager.certs_dir / "live" / sample_domain
        cert_dir.mkdir(parents=True, exist_ok=True)
        (cert_dir / "fullchain.pem").touch()
        
        mock_command_runner.return_value = (
            0, 
            "notAfter=Dec 31 23:59:59 2024 GMT", 
            ""
        )
        
        result = certbot_manager.get_certificate_expiry()
        
        assert result == "Dec 31 23:59:59 2024 GMT"
    
    def test_get_expiry_openssl_failure(
        self,
        certbot_manager: CertbotManager,
        sample_domain: str,
        mock_command_runner: MagicMock
    ):
        """Test handling of openssl failure."""
        # Create mock certificate file
        cert_dir = certbot_manager.certs_dir / "live" / sample_domain
        cert_dir.mkdir(parents=True, exist_ok=True)
        (cert_dir / "fullchain.pem").touch()
        
        mock_command_runner.return_value = (1, "", "Error reading certificate")
        
        result = certbot_manager.get_certificate_expiry()
        
        assert result is None


# =============================================================================
# CREATE DHPARAM TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.certbot
class TestCertbotManagerCreateDhparam:
    """Tests for create_dhparam method."""
    
    def test_create_dhparam_success(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        temp_compose_dir: Path,
        mock_logger: None
    ):
        """Test successful DH parameters generation."""
        mock_command_runner.return_value = (0, "", "")
        
        with patch.object(CONFIG, 'COMPOSE_DIR', temp_compose_dir):
            result = certbot_manager.create_dhparam()
        
        assert result is True
    
    def test_create_dhparam_already_exists(
        self,
        certbot_manager: CertbotManager,
        temp_compose_dir: Path,
        mock_logger: None
    ):
        """Test when DH params file already exists."""
        ssl_dir = temp_compose_dir / "nginx" / "ssl"
        ssl_dir.mkdir(parents=True, exist_ok=True)
        (ssl_dir / "ssl-dhparams.pem").touch()
        
        with patch.object(CONFIG, 'COMPOSE_DIR', temp_compose_dir):
            result = certbot_manager.create_dhparam()
        
        assert result is True
    
    def test_create_dhparam_failure(
        self,
        certbot_manager: CertbotManager,
        mock_command_runner: MagicMock,
        temp_compose_dir: Path,
        mock_logger: None
    ):
        """Test DH parameters generation failure."""
        mock_command_runner.return_value = (1, "", "openssl error")
        
        with patch.object(CONFIG, 'COMPOSE_DIR', temp_compose_dir):
            result = certbot_manager.create_dhparam()
        
        assert result is False

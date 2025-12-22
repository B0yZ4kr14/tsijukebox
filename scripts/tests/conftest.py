"""
TSiJUKEBOX Installer - Pytest Fixtures and Configuration
=========================================================
Shared fixtures for all test modules.
"""

import os
import sys
import tempfile
from pathlib import Path
from typing import Generator
from unittest.mock import MagicMock, patch
import argparse

import pytest

# Add parent directory to path to import docker-install module
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import classes from docker-install.py
# We need to handle the hyphenated filename
import importlib.util

spec = importlib.util.spec_from_file_location(
    "docker_install", 
    Path(__file__).parent.parent / "docker-install.py"
)
docker_install = importlib.util.module_from_spec(spec)
spec.loader.exec_module(docker_install)

# Re-export classes for easy access in tests
Config = docker_install.Config
CONFIG = docker_install.CONFIG
Logger = docker_install.Logger
Colors = docker_install.Colors
CommandRunner = docker_install.CommandRunner
SystemDetector = docker_install.SystemDetector
SystemInfo = docker_install.SystemInfo
CertbotManager = docker_install.CertbotManager
CloudflareDNSManager = docker_install.CloudflareDNSManager
ComposeManager = docker_install.ComposeManager


# =============================================================================
# DIRECTORY FIXTURES
# =============================================================================

@pytest.fixture
def temp_dir() -> Generator[Path, None, None]:
    """Create a temporary directory for tests."""
    with tempfile.TemporaryDirectory(prefix="tsijukebox_test_") as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def temp_certs_dir(temp_dir: Path) -> Path:
    """Create a temporary certificates directory."""
    certs_dir = temp_dir / "letsencrypt"
    certs_dir.mkdir(parents=True, exist_ok=True)
    return certs_dir


@pytest.fixture
def temp_webroot_dir(temp_dir: Path) -> Path:
    """Create a temporary webroot directory."""
    webroot_dir = temp_dir / "webroot"
    webroot_dir.mkdir(parents=True, exist_ok=True)
    return webroot_dir


@pytest.fixture
def temp_compose_dir(temp_dir: Path) -> Path:
    """Create a temporary compose directory."""
    compose_dir = temp_dir / "docker"
    compose_dir.mkdir(parents=True, exist_ok=True)
    return compose_dir


# =============================================================================
# SAMPLE DATA FIXTURES
# =============================================================================

@pytest.fixture
def sample_domain() -> str:
    """Sample domain for testing."""
    return "example.com"


@pytest.fixture
def sample_email() -> str:
    """Sample email for testing."""
    return "admin@example.com"


@pytest.fixture
def sample_cloudflare_token() -> str:
    """Sample Cloudflare API token for testing (valid format)."""
    return "cf_1234567890abcdefghijklmnopqrstuvwxyz"


@pytest.fixture
def sample_short_token() -> str:
    """Sample short Cloudflare token (invalid format)."""
    return "short_token"


# =============================================================================
# MOCK FIXTURES
# =============================================================================

@pytest.fixture
def mock_command_runner() -> Generator[MagicMock, None, None]:
    """Mock CommandRunner.run to prevent actual command execution."""
    with patch.object(CommandRunner, 'run') as mock_run:
        # Default success response
        mock_run.return_value = (0, "Success", "")
        yield mock_run


@pytest.fixture
def mock_command_runner_failure() -> Generator[MagicMock, None, None]:
    """Mock CommandRunner.run to simulate command failure."""
    with patch.object(CommandRunner, 'run') as mock_run:
        mock_run.return_value = (1, "", "Command failed")
        yield mock_run


@pytest.fixture
def mock_check_command_exists() -> Generator[MagicMock, None, None]:
    """Mock CommandRunner.check_command_exists."""
    with patch.object(CommandRunner, 'check_command_exists') as mock:
        mock.return_value = True
        yield mock


@pytest.fixture
def mock_logger() -> Generator[None, None, None]:
    """Suppress logger output during tests."""
    with patch.object(Logger, 'info'), \
         patch.object(Logger, 'success'), \
         patch.object(Logger, 'warning'), \
         patch.object(Logger, 'error'), \
         patch.object(Logger, 'debug'), \
         patch.object(Logger, 'step'):
        yield


# =============================================================================
# CERTBOT MANAGER FIXTURES
# =============================================================================

@pytest.fixture
def certbot_manager(
    sample_domain: str, 
    sample_email: str, 
    temp_certs_dir: Path,
    temp_webroot_dir: Path
) -> CertbotManager:
    """Create a CertbotManager instance with temporary directories."""
    manager = CertbotManager(sample_domain, sample_email, staging=False)
    # Override paths with temp directories
    manager.certs_dir = temp_certs_dir
    manager.webroot_dir = temp_webroot_dir
    return manager


@pytest.fixture
def certbot_manager_staging(
    sample_domain: str, 
    sample_email: str,
    temp_certs_dir: Path,
    temp_webroot_dir: Path
) -> CertbotManager:
    """Create a CertbotManager instance in staging mode."""
    manager = CertbotManager(sample_domain, sample_email, staging=True)
    manager.certs_dir = temp_certs_dir
    manager.webroot_dir = temp_webroot_dir
    return manager


# =============================================================================
# CLOUDFLARE DNS MANAGER FIXTURES
# =============================================================================

@pytest.fixture
def cloudflare_manager(
    sample_domain: str,
    sample_email: str,
    sample_cloudflare_token: str,
    temp_certs_dir: Path,
    temp_dir: Path
) -> CloudflareDNSManager:
    """Create a CloudflareDNSManager instance with temporary directories."""
    manager = CloudflareDNSManager(
        domain=sample_domain,
        email=sample_email,
        api_token=sample_cloudflare_token,
        staging=False,
        wildcard=False
    )
    # Override paths with temp directories
    manager.certs_dir = temp_certs_dir
    manager.credentials_path = temp_dir / "cloudflare.ini"
    return manager


@pytest.fixture
def cloudflare_manager_wildcard(
    sample_domain: str,
    sample_email: str,
    sample_cloudflare_token: str,
    temp_certs_dir: Path,
    temp_dir: Path
) -> CloudflareDNSManager:
    """Create a CloudflareDNSManager instance for wildcard certificates."""
    manager = CloudflareDNSManager(
        domain=sample_domain,
        email=sample_email,
        api_token=sample_cloudflare_token,
        staging=False,
        wildcard=True
    )
    manager.certs_dir = temp_certs_dir
    manager.credentials_path = temp_dir / "cloudflare.ini"
    return manager


@pytest.fixture
def cloudflare_manager_staging(
    sample_domain: str,
    sample_email: str,
    sample_cloudflare_token: str,
    temp_certs_dir: Path,
    temp_dir: Path
) -> CloudflareDNSManager:
    """Create a CloudflareDNSManager instance in staging mode."""
    manager = CloudflareDNSManager(
        domain=sample_domain,
        email=sample_email,
        api_token=sample_cloudflare_token,
        staging=True,
        wildcard=False
    )
    manager.certs_dir = temp_certs_dir
    manager.credentials_path = temp_dir / "cloudflare.ini"
    return manager


# =============================================================================
# COMPOSE MANAGER FIXTURES
# =============================================================================

@pytest.fixture
def default_options() -> argparse.Namespace:
    """Default argparse options for ComposeManager."""
    return argparse.Namespace(
        port=80,
        ssl=False,
        ssl_letsencrypt=False,
        ssl_cloudflare=False,
        monitoring=False,
        cache=False,
        domain="localhost"
    )


@pytest.fixture
def ssl_options() -> argparse.Namespace:
    """Argparse options with SSL enabled."""
    return argparse.Namespace(
        port=80,
        ssl=True,
        ssl_letsencrypt=False,
        ssl_cloudflare=False,
        monitoring=False,
        cache=False,
        domain="example.com"
    )


@pytest.fixture
def full_options() -> argparse.Namespace:
    """Argparse options with all features enabled."""
    return argparse.Namespace(
        port=8080,
        ssl=False,
        ssl_letsencrypt=True,
        ssl_cloudflare=False,
        monitoring=True,
        cache=True,
        domain="example.com"
    )

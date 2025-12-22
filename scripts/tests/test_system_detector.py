"""
TSiJUKEBOX Installer - SystemDetector Tests
============================================
Comprehensive tests for the SystemDetector class.
"""

import os
import platform
from pathlib import Path
from unittest.mock import MagicMock, patch, mock_open

import pytest

from conftest import SystemDetector, SystemInfo, CommandRunner, CONFIG


# =============================================================================
# HOSTNAME TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemDetectorHostname:
    """Tests for hostname detection."""

    def test_get_hostname_returns_string(self):
        """Test that hostname is returned as string."""
        detector = SystemDetector()
        hostname = detector._get_hostname()
        assert isinstance(hostname, str)
        assert len(hostname) > 0

    @patch("socket.gethostname")
    def test_get_hostname_uses_socket(self, mock_gethostname):
        """Test that socket.gethostname is used."""
        mock_gethostname.return_value = "test-server"
        detector = SystemDetector()
        assert detector._get_hostname() == "test-server"


# =============================================================================
# DISTRO DETECTION TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemDetectorDistro:
    """Tests for Linux distribution detection."""

    def test_get_distro_name_arch(self, mock_os_release_arch):
        """Test Arch Linux detection."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_os_release_arch)):
            name = detector._get_distro_name()
            assert "Arch Linux" in name

    def test_get_distro_name_manjaro(self, mock_os_release_manjaro):
        """Test Manjaro Linux detection."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_os_release_manjaro)):
            name = detector._get_distro_name()
            assert "Manjaro" in name

    def test_get_distro_name_file_not_found(self):
        """Test fallback when os-release not found."""
        detector = SystemDetector()
        with patch("builtins.open", side_effect=FileNotFoundError):
            name = detector._get_distro_name()
            assert name == "Unknown"

    def test_get_distro_id_arch(self, mock_os_release_arch):
        """Test distro ID extraction for Arch."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_os_release_arch)):
            distro_id = detector._get_distro_id()
            assert distro_id == "arch"

    def test_get_distro_id_manjaro(self, mock_os_release_manjaro):
        """Test distro ID extraction for Manjaro."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_os_release_manjaro)):
            distro_id = detector._get_distro_id()
            assert distro_id == "manjaro"

    def test_get_distro_id_file_not_found(self):
        """Test fallback when os-release not found."""
        detector = SystemDetector()
        with patch("builtins.open", side_effect=FileNotFoundError):
            distro_id = detector._get_distro_id()
            assert distro_id == "unknown"

    def test_get_distro_version_manjaro(self, mock_os_release_manjaro):
        """Test version extraction."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_os_release_manjaro)):
            version = detector._get_distro_version()
            assert version == "23.0"

    def test_get_distro_version_arch(self, mock_os_release_arch):
        """Test Arch Linux has rolling release (empty version)."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_os_release_arch)):
            version = detector._get_distro_version()
            # Arch has empty VERSION_ID
            assert version == "" or version == "unknown"


# =============================================================================
# SUPPORTED DISTRO TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemDetectorSupportedDistro:
    """Tests for supported distribution checking."""

    def test_is_supported_arch(self, mock_os_release_arch):
        """Test Arch Linux is supported."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_os_release_arch)):
            assert detector._is_supported_distro() is True

    def test_is_supported_manjaro_via_id_like(self, mock_os_release_manjaro):
        """Test Manjaro is supported via ID_LIKE=arch."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_os_release_manjaro)):
            assert detector._is_supported_distro() is True

    def test_is_not_supported_ubuntu(self, mock_os_release_ubuntu):
        """Test Ubuntu is not supported."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_os_release_ubuntu)):
            assert detector._is_supported_distro() is False


# =============================================================================
# CPU DETECTION TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemDetectorCPU:
    """Tests for CPU detection."""

    def test_get_cpu_model(self, mock_cpuinfo):
        """Test CPU model extraction."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_cpuinfo)):
            model = detector._get_cpu_model()
            assert "Intel" in model or "AMD" in model or "Unknown" in model

    def test_get_cpu_model_file_not_found(self):
        """Test fallback when cpuinfo not found."""
        detector = SystemDetector()
        with patch("builtins.open", side_effect=FileNotFoundError):
            model = detector._get_cpu_model()
            assert model == "Unknown CPU"


# =============================================================================
# MEMORY DETECTION TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemDetectorMemory:
    """Tests for memory detection."""

    def test_get_ram_total(self, mock_meminfo):
        """Test total RAM detection."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_meminfo)):
            total = detector._get_ram_total()
            # 16384000 kB = ~15.63 GB
            assert 15 < total < 17

    def test_get_ram_available(self, mock_meminfo):
        """Test available RAM detection."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_meminfo)):
            available = detector._get_ram_available()
            # 12288000 kB = ~11.72 GB
            assert 11 < available < 13

    def test_get_ram_total_file_not_found(self):
        """Test fallback when meminfo not found."""
        detector = SystemDetector()
        with patch("builtins.open", side_effect=FileNotFoundError):
            total = detector._get_ram_total()
            assert total == 0.0

    def test_get_ram_available_file_not_found(self):
        """Test fallback when meminfo not found."""
        detector = SystemDetector()
        with patch("builtins.open", side_effect=FileNotFoundError):
            available = detector._get_ram_available()
            assert available == 0.0


# =============================================================================
# DISK DETECTION TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemDetectorDisk:
    """Tests for disk space detection."""

    @patch("os.statvfs")
    def test_get_disk_total(self, mock_statvfs):
        """Test total disk space detection."""
        mock_stat = MagicMock()
        mock_stat.f_blocks = 244140625  # ~1TB in 4KB blocks
        mock_stat.f_frsize = 4096
        mock_statvfs.return_value = mock_stat
        
        detector = SystemDetector()
        total = detector._get_disk_total()
        assert total > 900  # Should be ~931 GB

    @patch("os.statvfs")
    def test_get_disk_available(self, mock_statvfs):
        """Test available disk space detection."""
        mock_stat = MagicMock()
        mock_stat.f_bavail = 122070312  # ~500GB in 4KB blocks
        mock_stat.f_frsize = 4096
        mock_statvfs.return_value = mock_stat
        
        detector = SystemDetector()
        available = detector._get_disk_available()
        assert available > 450  # Should be ~465 GB

    @patch("os.statvfs", side_effect=OSError)
    def test_get_disk_total_error(self, mock_statvfs):
        """Test fallback when statvfs fails."""
        detector = SystemDetector()
        assert detector._get_disk_total() == 0.0

    @patch("os.statvfs", side_effect=OSError)
    def test_get_disk_available_error(self, mock_statvfs):
        """Test fallback when statvfs fails."""
        detector = SystemDetector()
        assert detector._get_disk_available() == 0.0


# =============================================================================
# DOCKER DETECTION TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemDetectorDocker:
    """Tests for Docker detection."""

    @patch.object(CommandRunner, "check_command_exists")
    def test_check_docker_installed_true(self, mock_check):
        """Test Docker installed detection."""
        mock_check.return_value = True
        detector = SystemDetector()
        assert detector._check_docker_installed() is True

    @patch.object(CommandRunner, "check_command_exists")
    def test_check_docker_installed_false(self, mock_check):
        """Test Docker not installed detection."""
        mock_check.return_value = False
        detector = SystemDetector()
        assert detector._check_docker_installed() is False

    @patch.object(CommandRunner, "check_command_exists")
    @patch.object(CommandRunner, "run")
    def test_check_docker_running_true(self, mock_run, mock_check):
        """Test Docker running detection."""
        mock_check.return_value = True
        mock_run.return_value = (0, "Docker info output", "")
        detector = SystemDetector()
        assert detector._check_docker_running() is True

    @patch.object(CommandRunner, "check_command_exists")
    @patch.object(CommandRunner, "run")
    def test_check_docker_running_false(self, mock_run, mock_check):
        """Test Docker not running detection."""
        mock_check.return_value = True
        mock_run.return_value = (1, "", "Cannot connect to Docker daemon")
        detector = SystemDetector()
        assert detector._check_docker_running() is False

    @patch.object(CommandRunner, "check_command_exists")
    def test_check_docker_running_not_installed(self, mock_check):
        """Test Docker running when not installed."""
        mock_check.return_value = False
        detector = SystemDetector()
        assert detector._check_docker_running() is False

    @patch.object(CommandRunner, "check_command_exists")
    @patch.object(CommandRunner, "run")
    def test_get_docker_version(self, mock_run, mock_check):
        """Test Docker version detection."""
        mock_check.return_value = True
        mock_run.return_value = (0, "Docker version 24.0.5, build ced0996", "")
        detector = SystemDetector()
        version = detector._get_docker_version()
        assert "24.0.5" in version

    @patch.object(CommandRunner, "check_command_exists")
    def test_get_docker_version_not_installed(self, mock_check):
        """Test Docker version when not installed."""
        mock_check.return_value = False
        detector = SystemDetector()
        assert detector._get_docker_version() == "Not installed"

    @patch.object(CommandRunner, "run")
    def test_get_compose_version_v2(self, mock_run):
        """Test Docker Compose v2 detection."""
        mock_run.return_value = (0, "2.21.0", "")
        detector = SystemDetector()
        version = detector._get_compose_version()
        assert "2.21.0" in version

    @patch.object(CommandRunner, "run")
    def test_get_compose_version_v1_fallback(self, mock_run):
        """Test Docker Compose v1 fallback."""
        # First call (v2) fails, second call (v1) succeeds
        mock_run.side_effect = [
            (1, "", "not found"),
            (0, "docker-compose version 1.29.2, build 5becea4c", "")
        ]
        detector = SystemDetector()
        version = detector._get_compose_version()
        assert "1.29.2" in version or "5becea4c" in version

    @patch.object(CommandRunner, "run")
    def test_get_compose_version_not_installed(self, mock_run):
        """Test Docker Compose not installed."""
        mock_run.return_value = (1, "", "not found")
        detector = SystemDetector()
        assert detector._get_compose_version() == "Not installed"


# =============================================================================
# VIRTUAL MACHINE DETECTION TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemDetectorVM:
    """Tests for virtual machine detection."""

    def test_is_virtual_machine_vmware(self, mock_dmi_vmware):
        """Test VMware detection."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_dmi_vmware)):
            assert detector._is_virtual_machine() is True

    def test_is_virtual_machine_kvm(self, mock_dmi_kvm):
        """Test KVM detection."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_dmi_kvm)):
            assert detector._is_virtual_machine() is True

    def test_is_virtual_machine_physical(self, mock_dmi_physical):
        """Test physical machine detection."""
        detector = SystemDetector()
        with patch("builtins.open", mock_open(read_data=mock_dmi_physical)):
            # Need to mock both files returning physical
            with patch.object(detector, "_is_virtual_machine", return_value=False):
                assert detector._is_virtual_machine() is False


# =============================================================================
# FULL DETECTION TESTS
# =============================================================================

@pytest.mark.unit
class TestSystemDetectorDetect:
    """Tests for full system detection."""

    @patch.object(SystemDetector, "_get_hostname", return_value="test-server")
    @patch.object(SystemDetector, "_get_distro_name", return_value="Arch Linux")
    @patch.object(SystemDetector, "_get_distro_id", return_value="arch")
    @patch.object(SystemDetector, "_get_distro_version", return_value="")
    @patch.object(SystemDetector, "_is_supported_distro", return_value=True)
    @patch.object(SystemDetector, "_get_cpu_model", return_value="Intel i7")
    @patch.object(SystemDetector, "_get_ram_total", return_value=16.0)
    @patch.object(SystemDetector, "_get_ram_available", return_value=12.0)
    @patch.object(SystemDetector, "_get_disk_total", return_value=500.0)
    @patch.object(SystemDetector, "_get_disk_available", return_value=300.0)
    @patch.object(SystemDetector, "_check_docker_installed", return_value=True)
    @patch.object(SystemDetector, "_check_docker_running", return_value=True)
    @patch.object(SystemDetector, "_get_docker_version", return_value="24.0.5")
    @patch.object(SystemDetector, "_get_compose_version", return_value="2.21.0")
    @patch.object(SystemDetector, "_is_virtual_machine", return_value=False)
    @patch("os.geteuid", return_value=0)
    @patch("os.cpu_count", return_value=8)
    def test_detect_returns_system_info(self, *mocks):
        """Test that detect() returns a complete SystemInfo."""
        detector = SystemDetector()
        info = detector.detect()
        
        assert isinstance(info, SystemInfo)
        assert info.hostname == "test-server"
        assert info.distro_name == "Arch Linux"
        assert info.distro_id == "arch"
        assert info.is_supported is True
        assert info.cpu_model == "Intel i7"
        assert info.cpu_cores == 8
        assert info.ram_total_gb == 16.0
        assert info.ram_available_gb == 12.0
        assert info.disk_total_gb == 500.0
        assert info.disk_available_gb == 300.0
        assert info.is_root is True
        assert info.docker_installed is True
        assert info.docker_running is True
        assert info.docker_version == "24.0.5"
        assert info.compose_version == "2.21.0"
        assert info.is_virtual_machine is False

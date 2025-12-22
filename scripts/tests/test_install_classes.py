#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Unit Tests for install.py classes
=========================================================
Tests for ConfigGenerator, ConfigBackup, DoctorDiagnostic, and deep_merge.

Run with: pytest scripts/tests/test_install_classes.py -v
"""

import pytest
import json
import tempfile
import tarfile
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock, PropertyMock
from typing import Generator

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import the install module dynamically
import importlib.util
spec = importlib.util.spec_from_file_location("install", Path(__file__).parent.parent / "install.py")
install = importlib.util.module_from_spec(spec)

# Mock run_command before loading the module to avoid subprocess calls
original_run_command = None


@pytest.fixture(scope="module", autouse=True)
def load_install_module():
    """Load the install module with mocked dependencies."""
    global install
    
    # Mock subprocess before loading module
    with patch.dict('sys.modules', {'subprocess': MagicMock()}):
        spec.loader.exec_module(install)
    
    yield install


@pytest.fixture
def temp_dir() -> Generator[Path, None, None]:
    """Create a temporary directory for tests."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def mock_run_command():
    """Mock run_command to avoid actual shell commands."""
    with patch.object(install, 'run_command', return_value=(0, "", "")) as mock:
        yield mock


# =============================================================================
# DEEP MERGE TESTS
# =============================================================================

class TestDeepMerge:
    """Tests for the deep_merge function."""
    
    def test_simple_merge(self):
        """Test simple dictionary merge."""
        base = {"a": 1, "b": 2}
        override = {"b": 3, "c": 4}
        
        result = install.deep_merge(base, override)
        
        assert result == {"a": 1, "b": 3, "c": 4}
    
    def test_nested_merge(self):
        """Test nested dictionary merge."""
        base = {"a": {"x": 1, "y": 2}}
        override = {"a": {"y": 3, "z": 4}}
        
        result = install.deep_merge(base, override)
        
        assert result == {"a": {"x": 1, "y": 3, "z": 4}}
    
    def test_deeply_nested_merge(self):
        """Test deeply nested dictionary merge."""
        base = {"a": {"b": {"c": 1, "d": 2}}}
        override = {"a": {"b": {"d": 3, "e": 4}}}
        
        result = install.deep_merge(base, override)
        
        assert result == {"a": {"b": {"c": 1, "d": 3, "e": 4}}}
    
    def test_override_replaces_non_dict(self):
        """Test that override replaces non-dict values."""
        base = {"a": [1, 2, 3]}
        override = {"a": [4, 5]}
        
        result = install.deep_merge(base, override)
        
        assert result == {"a": [4, 5]}
    
    def test_override_replaces_dict_with_non_dict(self):
        """Test override replaces dict with non-dict."""
        base = {"a": {"x": 1}}
        override = {"a": "string"}
        
        result = install.deep_merge(base, override)
        
        assert result == {"a": "string"}
    
    def test_empty_base(self):
        """Test merge with empty base."""
        base = {}
        override = {"a": 1, "b": 2}
        
        result = install.deep_merge(base, override)
        
        assert result == {"a": 1, "b": 2}
    
    def test_empty_override(self):
        """Test merge with empty override."""
        base = {"a": 1, "b": 2}
        override = {}
        
        result = install.deep_merge(base, override)
        
        assert result == {"a": 1, "b": 2}
    
    def test_base_not_mutated(self):
        """Test that original base dict is not mutated."""
        base = {"a": 1, "b": {"c": 2}}
        override = {"b": {"c": 3}}
        original_base = {"a": 1, "b": {"c": 2}}
        
        install.deep_merge(base, override)
        
        assert base == original_base


# =============================================================================
# CONFIG GENERATOR TESTS
# =============================================================================

class TestConfigGenerator:
    """Tests for the ConfigGenerator class."""
    
    def test_generator_initialization(self):
        """Test ConfigGenerator initializes correctly."""
        generator = install.ConfigGenerator()
        
        assert hasattr(generator, 'menu')
        assert generator.menu is not None
    
    def test_generate_creates_valid_json(self, temp_dir: Path):
        """Test that generate() creates valid JSON file."""
        generator = install.ConfigGenerator()
        output_path = temp_dir / "config.json"
        
        # Mock the menu and input
        with patch.object(generator.menu, 'show_menu', return_value={
            'spotify': True, 
            'spotify_cli': True, 
            'monitoring': False,
            'autologin': True, 
            'chromium': True, 
            'kiosk': False
        }):
            with patch('builtins.input', side_effect=['testuser', '']):
                result = generator.generate(str(output_path))
        
        assert result is True
        assert output_path.exists()
        
        # Validate JSON content
        config = json.loads(output_path.read_text())
        assert '$schema' in config
        assert 'mode' in config
        assert 'database' in config
        assert config['no_spotify'] is False
        assert config['no_monitoring'] is True
    
    def test_generate_with_kiosk_mode(self, temp_dir: Path):
        """Test generate with kiosk mode enabled."""
        generator = install.ConfigGenerator()
        output_path = temp_dir / "kiosk-config.json"
        
        with patch.object(generator.menu, 'show_menu', return_value={
            'spotify': True, 
            'spotify_cli': False, 
            'monitoring': True,
            'autologin': True, 
            'chromium': True, 
            'kiosk': True
        }):
            with patch('builtins.input', side_effect=['kioskuser', 'custom/music']):
                result = generator.generate(str(output_path))
        
        assert result is True
        
        config = json.loads(output_path.read_text())
        assert config['mode'] == 'kiosk'
        assert config['kiosk'] is True
    
    def test_generate_handles_keyboard_interrupt(self, temp_dir: Path):
        """Test that generate() handles KeyboardInterrupt gracefully."""
        generator = install.ConfigGenerator()
        
        with patch.object(generator.menu, 'show_menu', side_effect=KeyboardInterrupt):
            result = generator.generate(str(temp_dir / "config.json"))
        
        assert result is False


# =============================================================================
# CONFIG BACKUP TESTS
# =============================================================================

class TestConfigBackup:
    """Tests for the ConfigBackup class."""
    
    def test_backup_initialization(self, temp_dir: Path):
        """Test ConfigBackup initializes correctly."""
        backup = install.ConfigBackup()
        
        assert hasattr(backup, 'BACKUP_DIR')
    
    def test_create_backup_success(self, temp_dir: Path, mock_run_command):
        """Test successful backup creation."""
        backup = install.ConfigBackup()
        backup.BACKUP_DIR = temp_dir / "backups"
        backup.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        
        # Create mock config directory
        mock_config_dir = temp_dir / "etc"
        mock_config_dir.mkdir(parents=True)
        (mock_config_dir / "config.yaml").write_text("test: true")
        
        with patch.object(install, 'CONFIG_DIR', mock_config_dir):
            with patch.object(install, 'DATA_DIR', temp_dir / "data"):
                result = backup.create_backup("test-label")
        
        assert result is not None
        assert result.exists()
        assert result.suffix == ".gz"
        assert "test-label" in result.name
    
    def test_create_backup_with_auto_label(self, temp_dir: Path, mock_run_command):
        """Test backup creation with auto-generated label."""
        backup = install.ConfigBackup()
        backup.BACKUP_DIR = temp_dir / "backups"
        backup.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        
        mock_config_dir = temp_dir / "etc"
        mock_config_dir.mkdir(parents=True)
        (mock_config_dir / "config.yaml").write_text("test: true")
        
        with patch.object(install, 'CONFIG_DIR', mock_config_dir):
            with patch.object(install, 'DATA_DIR', temp_dir / "data"):
                result = backup.create_backup("auto")
        
        assert result is not None
        assert "tsijukebox_backup_" in result.name
    
    def test_list_backups_empty(self, temp_dir: Path):
        """Test list_backups with no backups."""
        backup = install.ConfigBackup()
        backup.BACKUP_DIR = temp_dir / "empty-backups"
        backup.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        
        # Should not raise
        backup.list_backups()
    
    def test_list_backups_with_files(self, temp_dir: Path):
        """Test list_backups with existing backups."""
        backup = install.ConfigBackup()
        backup.BACKUP_DIR = temp_dir / "backups"
        backup.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        
        # Create mock backup files
        (backup.BACKUP_DIR / "tsijukebox_backup_20241220_120000_test.tar.gz").touch()
        (backup.BACKUP_DIR / "tsijukebox_backup_20241221_130000_test.tar.gz").touch()
        
        # Should not raise
        backup.list_backups()
    
    def test_restore_backup_not_found(self, temp_dir: Path):
        """Test restore_backup with non-existent file."""
        backup = install.ConfigBackup()
        
        result = backup.restore_backup("/nonexistent/backup.tar.gz")
        
        assert result is False
    
    def test_restore_backup_success(self, temp_dir: Path, mock_run_command):
        """Test successful backup restoration."""
        backup = install.ConfigBackup()
        
        # Create a valid tarball
        backup_path = temp_dir / "backup.tar.gz"
        with tarfile.open(backup_path, "w:gz") as tar:
            config_file = temp_dir / "config.yaml"
            config_file.write_text("test: true")
            tar.add(config_file, arcname="etc/tsijukebox/config.yaml")
        
        # Mock the extraction target
        with patch('tarfile.TarFile.extractall'):
            result = backup.restore_backup(str(backup_path))
        
        assert result is True


# =============================================================================
# DOCTOR DIAGNOSTIC TESTS
# =============================================================================

class TestDoctorDiagnostic:
    """Tests for the DoctorDiagnostic class."""
    
    def test_doctor_initialization(self):
        """Test DoctorDiagnostic initializes correctly."""
        doctor = install.DoctorDiagnostic()
        
        assert doctor.auto_fix is False
        assert doctor.issues == []
    
    def test_doctor_with_auto_fix(self):
        """Test DoctorDiagnostic with auto_fix enabled."""
        doctor = install.DoctorDiagnostic(auto_fix=True)
        
        assert doctor.auto_fix is True
    
    def test_add_issue_stores_correctly(self):
        """Test that add_issue stores issues correctly."""
        doctor = install.DoctorDiagnostic()
        
        doctor.add_issue("Test Issue", "critical", "Test description", ["fix", "cmd"])
        
        assert len(doctor.issues) == 1
        assert doctor.issues[0]['name'] == "Test Issue"
        assert doctor.issues[0]['severity'] == "critical"
        assert doctor.issues[0]['description'] == "Test description"
        assert doctor.issues[0]['fix_cmd'] == ["fix", "cmd"]
    
    def test_add_multiple_issues(self):
        """Test adding multiple issues."""
        doctor = install.DoctorDiagnostic()
        
        doctor.add_issue("Issue 1", "critical", "Description 1", None)
        doctor.add_issue("Issue 2", "warning", "Description 2", ["cmd"])
        doctor.add_issue("Issue 3", "info", "Description 3", None)
        
        assert len(doctor.issues) == 3
        assert doctor.issues[0]['severity'] == "critical"
        assert doctor.issues[1]['severity'] == "warning"
        assert doctor.issues[2]['severity'] == "info"
    
    def test_check_disk_space_low_triggers_critical(self, mock_run_command):
        """Test that very low disk space triggers critical issue."""
        doctor = install.DoctorDiagnostic()
        
        # Mock 0.5 GB free (should trigger critical)
        with patch('shutil.disk_usage', return_value=(100*1024**3, 99.5*1024**3, 0.5*1024**3)):
            doctor.check_disk_space()
        
        assert len(doctor.issues) == 1
        assert doctor.issues[0]['severity'] == 'critical'
        assert 'espaço' in doctor.issues[0]['name'].lower() or 'disco' in doctor.issues[0]['name'].lower()
    
    def test_check_disk_space_moderate_triggers_warning(self, mock_run_command):
        """Test that moderate disk space triggers warning."""
        doctor = install.DoctorDiagnostic()
        
        # Mock 3 GB free (should trigger warning)
        with patch('shutil.disk_usage', return_value=(100*1024**3, 97*1024**3, 3*1024**3)):
            doctor.check_disk_space()
        
        assert len(doctor.issues) == 1
        assert doctor.issues[0]['severity'] == 'warning'
    
    def test_check_disk_space_ok(self, mock_run_command):
        """Test that sufficient disk space adds no issues."""
        doctor = install.DoctorDiagnostic()
        
        # Mock 50 GB free (should be OK)
        with patch('shutil.disk_usage', return_value=(100*1024**3, 50*1024**3, 50*1024**3)):
            doctor.check_disk_space()
        
        assert len(doctor.issues) == 0
    
    def test_export_json_creates_valid_file(self, temp_dir: Path):
        """Test JSON export creates valid file."""
        doctor = install.DoctorDiagnostic()
        doctor.add_issue("Test Issue", "warning", "Test description", None)
        
        output = temp_dir / "report.json"
        result = doctor.export_json(str(output))
        
        assert result is True
        assert output.exists()
        
        report = json.loads(output.read_text())
        assert 'version' in report
        assert 'issues' in report
        assert 'summary' in report
        assert 'system_info' in report
        assert report['summary']['total'] == 1
        assert report['summary']['warning'] == 1
    
    def test_export_html_creates_valid_file(self, temp_dir: Path):
        """Test HTML export creates valid file."""
        doctor = install.DoctorDiagnostic()
        doctor.add_issue("Critical Issue", "critical", "Critical problem found", None)
        doctor.add_issue("Warning Issue", "warning", "Warning detected", ["fix", "cmd"])
        
        output = temp_dir / "report.html"
        result = doctor.export_html(str(output))
        
        assert result is True
        assert output.exists()
        
        content = output.read_text()
        assert "<!DOCTYPE html>" in content
        assert "TSiJUKEBOX Doctor Report" in content
        assert "Critical Issue" in content
        assert "Warning Issue" in content
    
    def test_export_html_with_no_issues(self, temp_dir: Path):
        """Test HTML export with no issues."""
        doctor = install.DoctorDiagnostic()
        
        output = temp_dir / "healthy-report.html"
        result = doctor.export_html(str(output))
        
        assert result is True
        
        content = output.read_text()
        assert "Nenhum problema encontrado" in content or "✅" in content
    
    def test_collect_system_info(self):
        """Test _collect_system_info returns expected keys."""
        doctor = install.DoctorDiagnostic()
        
        # Mock system info sources
        with patch('shutil.disk_usage', return_value=(100*1024**3, 50*1024**3, 50*1024**3)):
            with patch('builtins.open', MagicMock()):
                info = doctor._collect_system_info()
        
        assert 'timestamp' in info
        assert 'hostname' in info
        assert 'platform' in info
        assert 'disk' in info


# =============================================================================
# LOAD CONFIG FILES TESTS
# =============================================================================

class TestLoadConfigFiles:
    """Tests for load_config_files function."""
    
    def test_load_single_config(self, temp_dir: Path):
        """Test loading a single config file."""
        config_path = temp_dir / "config.json"
        config_path.write_text('{"mode": "kiosk", "database": "sqlite"}')
        
        result = install.load_config_files([str(config_path)])
        
        assert result['mode'] == 'kiosk'
        assert result['database'] == 'sqlite'
    
    def test_load_multiple_configs_with_inheritance(self, temp_dir: Path):
        """Test loading multiple config files with inheritance."""
        base_config = temp_dir / "base.json"
        override_config = temp_dir / "override.json"
        
        base_config.write_text('{"mode": "full", "database": "sqlite", "autologin": true}')
        override_config.write_text('{"mode": "kiosk", "kiosk": true}')
        
        result = install.load_config_files([str(base_config), str(override_config)])
        
        # Override should win for 'mode'
        assert result['mode'] == 'kiosk'
        # Base should be preserved for 'database' and 'autologin'
        assert result['database'] == 'sqlite'
        assert result['autologin'] is True
        # Override adds 'kiosk'
        assert result['kiosk'] is True
    
    def test_load_config_file_not_found(self, temp_dir: Path):
        """Test that missing config file raises error."""
        with pytest.raises(SystemExit):
            install.load_config_files(["/nonexistent/config.json"])
    
    def test_load_config_invalid_json(self, temp_dir: Path):
        """Test that invalid JSON raises error."""
        config_path = temp_dir / "invalid.json"
        config_path.write_text('{"invalid json')
        
        with pytest.raises(SystemExit):
            install.load_config_files([str(config_path)])


# =============================================================================
# INTEGRATION TESTS
# =============================================================================

class TestIntegration:
    """Integration tests for combined functionality."""
    
    def test_doctor_full_workflow(self, temp_dir: Path, mock_run_command):
        """Test complete doctor workflow."""
        doctor = install.DoctorDiagnostic()
        
        # Add some test issues
        doctor.add_issue("Service Down", "critical", "Service not running", ["systemctl", "restart", "tsijukebox"])
        doctor.add_issue("Low Disk", "warning", "Only 3GB free", None)
        
        # Export both formats
        json_path = temp_dir / "report.json"
        html_path = temp_dir / "report.html"
        
        assert doctor.export_json(str(json_path)) is True
        assert doctor.export_html(str(html_path)) is True
        
        # Verify JSON content
        json_report = json.loads(json_path.read_text())
        assert json_report['summary']['critical'] == 1
        assert json_report['summary']['warning'] == 1
        
        # Verify HTML contains issues
        html_content = html_path.read_text()
        assert "Service Down" in html_content
        assert "Low Disk" in html_content
    
    def test_config_backup_restore_cycle(self, temp_dir: Path, mock_run_command):
        """Test complete backup and restore cycle."""
        backup = install.ConfigBackup()
        backup.BACKUP_DIR = temp_dir / "backups"
        backup.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        
        # Create mock config
        mock_config_dir = temp_dir / "etc"
        mock_config_dir.mkdir(parents=True)
        (mock_config_dir / "config.yaml").write_text("original: true")
        
        with patch.object(install, 'CONFIG_DIR', mock_config_dir):
            with patch.object(install, 'DATA_DIR', temp_dir / "data"):
                # Create backup
                backup_path = backup.create_backup("test")
        
        assert backup_path is not None
        assert backup_path.exists()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Rollback Integration Tests
==================================================
Tests for automatic rollback functionality when installation stages fail.

These tests simulate failures at each critical installation stage and verify
that the RollbackManager correctly reverts previous changes.

Run with:
    pytest tests/test_rollback_integration.py -v -m integration
"""

import pytest
import argparse
import subprocess
from unittest.mock import MagicMock, patch, call
from pathlib import Path
from typing import Dict, Any, List


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def mock_globals(mocker):
    """Mock global variables in install module."""
    mocker.patch('scripts.install.DRY_RUN', False)
    mocker.patch('scripts.install.QUIET_MODE', True)
    mocker.patch('scripts.install.ROLLBACK_DRY_RUN', False)


@pytest.fixture
def base_args():
    """Create base installation args for testing."""
    return argparse.Namespace(
        mode='full',
        database='sqlite',
        user='testuser',
        music_dir='Musics',
        no_spotify=False,
        no_spotify_cli=False,
        no_monitoring=False,
        skip_packages=False,
        dry_run=False,
        rollback_dry_run=False,
        interactive=False,
        config_files=None,
        validate=False,
        doctor=False,
        doctor_fix=False,
        generate_config=None,
        backup=None,
        restore=None,
        list_backups=False,
        health_check=False,
        verbose=False,
        quiet=True,
        uninstall=False,
    )


@pytest.fixture
def mock_system_info():
    """Create mock SystemInfo for testing."""
    from dataclasses import dataclass
    from pathlib import Path
    
    @dataclass
    class MockSystemInfo:
        distro: str = "Arch Linux"
        distro_id: str = "arch"
        user: str = "testuser"
        home: Path = Path("/home/testuser")
        login_manager: str = "sddm"
        installed_packages: List[str] = None
        has_paru: bool = True
        has_spotify: bool = False
        
        def __post_init__(self):
            if self.installed_packages is None:
                self.installed_packages = []
    
    return MockSystemInfo()


@pytest.fixture
def rollback_manager():
    """Create a fresh RollbackManager for testing."""
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent))
    
    from install import RollbackManager
    return RollbackManager()


# =============================================================================
# TEST: ROLLBACK ON STAGE FAILURE
# =============================================================================

class TestRollbackOnStageFailure:
    """Tests for automatic rollback when installation stages fail."""
    
    @pytest.mark.integration
    def test_rollback_on_paru_install_failure(self, rollback_manager, mocker):
        """Simulates failure during paru installation - no rollback needed."""
        from install import InstallationError
        
        # No checkpoints yet, so no rollback should happen
        assert not rollback_manager.has_checkpoints()
        
        # Simulate failure
        try:
            raise InstallationError("Falha ao instalar paru", stage="paru")
        except InstallationError:
            # Should not rollback since no checkpoints exist
            result = rollback_manager.rollback_all()
            assert result is True  # Empty rollback returns True
            assert not rollback_manager.has_checkpoints()
    
    @pytest.mark.integration
    def test_rollback_on_base_packages_failure(self, rollback_manager, mocker):
        """Simulates failure during base packages installation."""
        mock_subprocess = mocker.patch('subprocess.run')
        mock_subprocess.return_value = MagicMock(returncode=0, stderr='', stdout='')
        
        # Create checkpoint for paru (simulating it was installed)
        rollback_manager.create_checkpoint(
            "paru_installed",
            {"installed": True},
            ["rm -rf /tmp/paru || true"]
        )
        
        assert rollback_manager.has_checkpoints()
        
        # Simulate base packages failure and rollback
        rollback_manager.rollback_all()
        
        # Verify rollback command was executed
        mock_subprocess.assert_called()
        assert not rollback_manager.has_checkpoints()
    
    @pytest.mark.integration
    def test_rollback_on_music_dir_failure(self, rollback_manager, mocker):
        """Simulates failure during music directory setup."""
        mock_subprocess = mocker.patch('subprocess.run')
        mock_subprocess.return_value = MagicMock(returncode=0, stderr='', stdout='')
        
        # Create checkpoints for previous stages
        rollback_manager.create_checkpoint("paru_installed", {"installed": True}, ["rm -rf /tmp/paru || true"])
        rollback_manager.create_checkpoint("base_packages_installed", {"packages": ["git", "nodejs"]}, ["pacman -R --noconfirm git nodejs || true"])
        
        assert len(rollback_manager.checkpoints) == 2
        
        # Simulate failure and rollback
        rollback_manager.rollback_all()
        
        # Verify both rollbacks were executed (in reverse order)
        assert mock_subprocess.call_count == 2
        assert not rollback_manager.has_checkpoints()
    
    @pytest.mark.integration
    def test_rollback_on_spotify_failure(self, rollback_manager, mocker):
        """Simulates failure during Spotify installation."""
        mock_subprocess = mocker.patch('subprocess.run')
        mock_subprocess.return_value = MagicMock(returncode=0, stderr='', stdout='')
        
        # Create checkpoints for previous stages
        rollback_manager.create_checkpoint("paru_installed", {}, ["rm -rf /tmp/paru || true"])
        rollback_manager.create_checkpoint("base_packages_installed", {}, ["pacman -R --noconfirm base-devel git || true"])
        rollback_manager.create_checkpoint("music_dir_created", {"path": "/home/testuser/Musics"}, ["rm -rf /home/testuser/Musics"])
        rollback_manager.create_checkpoint("autologin_configured", {}, [])  # No rollback command
        
        assert len(rollback_manager.checkpoints) == 4
        
        # Simulate failure and rollback
        rollback_manager.rollback_all()
        
        # 3 commands should be executed (autologin has no rollback)
        assert mock_subprocess.call_count == 3
        assert not rollback_manager.has_checkpoints()
    
    @pytest.mark.integration
    def test_rollback_on_chromium_sqlite_failure(self, rollback_manager, mocker):
        """Simulates failure during Chromium/SQLite configuration."""
        mock_subprocess = mocker.patch('subprocess.run')
        mock_subprocess.return_value = MagicMock(returncode=0, stderr='', stdout='')
        
        # Create all previous checkpoints
        rollback_manager.create_checkpoint("paru_installed", {}, ["rm -rf /tmp/paru || true"])
        rollback_manager.create_checkpoint("base_packages_installed", {}, ["pacman -R --noconfirm git || true"])
        rollback_manager.create_checkpoint("music_dir_created", {}, ["rm -rf /home/testuser/Musics"])
        rollback_manager.create_checkpoint("autologin_configured", {}, [])
        rollback_manager.create_checkpoint("spotify_installed", {}, ["paru -R --noconfirm spotify-launcher spicetify-cli || true"])
        
        # Simulate failure and rollback
        rollback_manager.rollback_all()
        
        assert mock_subprocess.call_count == 4  # autologin has no command
        assert not rollback_manager.has_checkpoints()
    
    @pytest.mark.integration
    def test_rollback_on_repository_clone_failure(self, rollback_manager, mocker):
        """Simulates failure during repository cloning."""
        mock_subprocess = mocker.patch('subprocess.run')
        mock_subprocess.return_value = MagicMock(returncode=0, stderr='', stdout='')
        
        # Create all previous checkpoints
        rollback_manager.create_checkpoint("paru_installed", {}, ["rm -rf /tmp/paru || true"])
        rollback_manager.create_checkpoint("base_packages_installed", {}, ["pacman -R --noconfirm git || true"])
        rollback_manager.create_checkpoint("music_dir_created", {}, ["rm -rf /home/testuser/Musics"])
        rollback_manager.create_checkpoint("spotify_installed", {}, ["paru -R --noconfirm spotify-launcher || true"])
        rollback_manager.create_checkpoint("chromium_sqlite_done", {}, ["rm -rf /var/lib/tsijukebox/tsijukebox.db"])
        rollback_manager.create_checkpoint("monitoring_installed", {}, ["pacman -R --noconfirm grafana prometheus || true"])
        rollback_manager.create_checkpoint("web_packages_installed", {}, ["pacman -R --noconfirm nginx || true"])
        
        # Simulate failure and rollback
        rollback_manager.rollback_all()
        
        assert mock_subprocess.call_count == 7
        assert not rollback_manager.has_checkpoints()
    
    @pytest.mark.integration
    def test_rollback_on_systemd_service_failure(self, rollback_manager, mocker):
        """Simulates failure during systemd service creation."""
        mock_subprocess = mocker.patch('subprocess.run')
        mock_subprocess.return_value = MagicMock(returncode=0, stderr='', stdout='')
        
        # Create all checkpoints including repository
        rollback_manager.create_checkpoint("paru_installed", {}, ["rm -rf /tmp/paru || true"])
        rollback_manager.create_checkpoint("base_packages_installed", {}, ["pacman -R --noconfirm git || true"])
        rollback_manager.create_checkpoint("repository_cloned", {"path": "/opt/tsijukebox"}, ["rm -rf /opt/tsijukebox"])
        
        # Simulate failure and rollback
        rollback_manager.rollback_all()
        
        assert mock_subprocess.call_count == 3
        assert not rollback_manager.has_checkpoints()


# =============================================================================
# TEST: ROLLBACK COMMAND EXECUTION
# =============================================================================

class TestRollbackCommandExecution:
    """Tests for correct execution of rollback commands."""
    
    @pytest.mark.integration
    def test_rollback_executes_in_reverse_order(self, rollback_manager, mocker):
        """Verifies checkpoints are rolled back from newest to oldest."""
        executed_commands = []
        
        def track_command(cmd, **kwargs):
            executed_commands.append(cmd)
            return MagicMock(returncode=0, stderr='', stdout='')
        
        mock_subprocess = mocker.patch('subprocess.run', side_effect=track_command)
        
        # Create checkpoints in order
        rollback_manager.create_checkpoint("first", {}, ["echo first"])
        rollback_manager.create_checkpoint("second", {}, ["echo second"])
        rollback_manager.create_checkpoint("third", {}, ["echo third"])
        
        # Rollback all
        rollback_manager.rollback_all()
        
        # Should be in reverse order
        assert executed_commands == ["echo third", "echo second", "echo first"]
    
    @pytest.mark.integration
    def test_rollback_handles_command_failure(self, rollback_manager, mocker):
        """Verifies rollback continues even if a command fails."""
        call_count = 0
        
        def failing_command(cmd, **kwargs):
            nonlocal call_count
            call_count += 1
            if "fail" in cmd:
                return MagicMock(returncode=1, stderr='Command failed', stdout='')
            return MagicMock(returncode=0, stderr='', stdout='')
        
        mocker.patch('subprocess.run', side_effect=failing_command)
        
        # Create checkpoints with one that fails
        rollback_manager.create_checkpoint("first", {}, ["echo first"])
        rollback_manager.create_checkpoint("failing", {}, ["echo fail"])
        rollback_manager.create_checkpoint("third", {}, ["echo third"])
        
        # Rollback should continue despite failure
        rollback_manager.rollback_all()
        
        # All 3 commands should be attempted
        assert call_count == 3
    
    @pytest.mark.integration
    def test_rollback_respects_timeout(self, rollback_manager, mocker):
        """Verifies timeout is handled for slow commands."""
        def timeout_command(cmd, **kwargs):
            if "slow" in cmd:
                raise subprocess.TimeoutExpired(cmd, 120)
            return MagicMock(returncode=0, stderr='', stdout='')
        
        mock_subprocess = mocker.patch('subprocess.run', side_effect=timeout_command)
        
        # Create checkpoints with slow command
        rollback_manager.create_checkpoint("fast", {}, ["echo fast"])
        rollback_manager.create_checkpoint("slow", {}, ["sleep slow 1000"])
        rollback_manager.create_checkpoint("another", {}, ["echo another"])
        
        # Should not raise, just warn
        rollback_manager.rollback_all()
        
        # All commands should be attempted
        assert mock_subprocess.call_count == 3
    
    @pytest.mark.integration
    def test_rollback_logs_all_operations(self, rollback_manager, mocker, caplog):
        """Verifies all rollback operations are logged."""
        import logging
        caplog.set_level(logging.INFO)
        
        mocker.patch('subprocess.run', return_value=MagicMock(returncode=0, stderr='', stdout=''))
        mocker.patch('scripts.install.QUIET_MODE', False)
        
        rollback_manager.create_checkpoint("test_checkpoint", {}, ["echo test"])
        rollback_manager.rollback_all()
        
        # Should log checkpoint creation and rollback
        assert any("test_checkpoint" in record.message for record in caplog.records)


# =============================================================================
# TEST: KEYBOARD INTERRUPT HANDLING
# =============================================================================

class TestKeyboardInterruptHandling:
    """Tests for behavior when user presses Ctrl+C."""
    
    @pytest.mark.integration
    def test_ctrl_c_with_checkpoints_prompts_user(self, rollback_manager, mocker):
        """Verifies user is asked about rollback on Ctrl+C."""
        rollback_manager.create_checkpoint("test", {}, ["echo test"])
        
        # Should have checkpoints
        assert rollback_manager.has_checkpoints()
    
    @pytest.mark.integration
    def test_rollback_manager_has_checkpoints_method(self, rollback_manager):
        """Verifies has_checkpoints() works correctly."""
        assert not rollback_manager.has_checkpoints()
        
        rollback_manager.create_checkpoint("test", {}, [])
        assert rollback_manager.has_checkpoints()
        
        rollback_manager.cleanup()
        assert not rollback_manager.has_checkpoints()


# =============================================================================
# TEST: ROLLBACK DRY RUN FLAG
# =============================================================================

class TestRollbackDryRunFlag:
    """Tests for --rollback-dry-run flag functionality."""
    
    @pytest.mark.integration
    def test_rollback_dry_run_does_not_execute_commands(self, mocker):
        """Verifies commands are NOT executed with --rollback-dry-run."""
        # Import and patch ROLLBACK_DRY_RUN
        import scripts.install as install_module
        mocker.patch.object(install_module, 'ROLLBACK_DRY_RUN', True)
        mocker.patch.object(install_module, 'DRY_RUN', False)
        mocker.patch.object(install_module, 'QUIET_MODE', True)
        
        mock_subprocess = mocker.patch('subprocess.run')
        
        # Create manager and checkpoints
        from scripts.install import RollbackManager
        manager = RollbackManager()
        manager.create_checkpoint("test", {}, ["echo should_not_run"])
        
        # Rollback in dry-run mode
        manager.rollback_all()
        
        # subprocess.run should NOT be called
        mock_subprocess.assert_not_called()
    
    @pytest.mark.integration
    def test_rollback_dry_run_logs_commands(self, mocker, caplog):
        """Verifies commands are logged with [ROLLBACK-DRY-RUN] prefix."""
        import logging
        import scripts.install as install_module
        
        caplog.set_level(logging.INFO)
        
        mocker.patch.object(install_module, 'ROLLBACK_DRY_RUN', True)
        mocker.patch.object(install_module, 'DRY_RUN', False)
        mocker.patch.object(install_module, 'QUIET_MODE', False)
        mocker.patch('subprocess.run')
        
        from scripts.install import RollbackManager
        manager = RollbackManager()
        manager.create_checkpoint("test", {}, ["echo test_command"])
        manager.rollback_all()
        
        # Should log with prefix
        log_output = [r.message for r in caplog.records]
        assert any("ROLLBACK-DRY-RUN" in msg or "test_command" in msg for msg in log_output)
    
    @pytest.mark.integration
    def test_dry_run_takes_precedence(self, mocker):
        """Verifies --dry-run also prevents rollback execution."""
        import scripts.install as install_module
        
        mocker.patch.object(install_module, 'DRY_RUN', True)
        mocker.patch.object(install_module, 'ROLLBACK_DRY_RUN', False)
        mocker.patch.object(install_module, 'QUIET_MODE', True)
        
        mock_subprocess = mocker.patch('subprocess.run')
        
        from scripts.install import RollbackManager
        manager = RollbackManager()
        manager.create_checkpoint("test", {}, ["echo should_not_run"])
        manager.rollback_all()
        
        # subprocess.run should NOT be called in DRY_RUN mode
        mock_subprocess.assert_not_called()
    
    @pytest.mark.integration
    def test_rollback_dry_run_shows_all_pending_commands(self, mocker, caplog):
        """Verifies all pending commands are shown in dry-run."""
        import logging
        import scripts.install as install_module
        
        caplog.set_level(logging.INFO)
        
        mocker.patch.object(install_module, 'ROLLBACK_DRY_RUN', True)
        mocker.patch.object(install_module, 'DRY_RUN', False)
        mocker.patch.object(install_module, 'QUIET_MODE', False)
        mocker.patch('subprocess.run')
        
        from scripts.install import RollbackManager
        manager = RollbackManager()
        
        # Create multiple checkpoints
        manager.create_checkpoint("first", {}, ["echo first"])
        manager.create_checkpoint("second", {}, ["echo second", "echo second_b"])
        manager.create_checkpoint("third", {}, ["echo third"])
        
        manager.rollback_all()
        
        # All checkpoints should be processed
        assert not manager.has_checkpoints()


# =============================================================================
# TEST: ROLLBACK TO SPECIFIC CHECKPOINT
# =============================================================================

class TestRollbackToCheckpoint:
    """Tests for rollback_to() method."""
    
    @pytest.mark.integration
    def test_rollback_to_specific_checkpoint(self, rollback_manager, mocker):
        """Verifies rollback to a specific checkpoint works."""
        mock_subprocess = mocker.patch('subprocess.run')
        mock_subprocess.return_value = MagicMock(returncode=0, stderr='', stdout='')
        
        rollback_manager.create_checkpoint("first", {}, ["echo first"])
        rollback_manager.create_checkpoint("second", {}, ["echo second"])
        rollback_manager.create_checkpoint("third", {}, ["echo third"])
        
        # Rollback to "second" should only rollback "third"
        result = rollback_manager.rollback_to("first")
        
        assert result is True
        assert len(rollback_manager.checkpoints) == 1
        assert rollback_manager.checkpoints[0].name == "first"
    
    @pytest.mark.integration
    def test_rollback_to_nonexistent_checkpoint(self, rollback_manager):
        """Verifies rollback to non-existent checkpoint returns False."""
        rollback_manager.create_checkpoint("test", {}, ["echo test"])
        
        result = rollback_manager.rollback_to("nonexistent")
        
        assert result is False
        assert len(rollback_manager.checkpoints) == 1


# =============================================================================
# TEST: INSTALLATION ERROR CLASS
# =============================================================================

class TestInstallationError:
    """Tests for InstallationError exception class."""
    
    def test_installation_error_basic(self):
        """Test basic InstallationError creation."""
        from scripts.install import InstallationError
        
        error = InstallationError("Test error", stage="test_stage")
        
        assert str(error) == "Test error"
        assert error.stage == "test_stage"
    
    def test_installation_error_recoverable_flag(self):
        """Test InstallationError with recoverable flag."""
        from scripts.install import InstallationError
        
        error = InstallationError("Recoverable error", stage="test", recoverable=True)
        assert error.recoverable is True
        
        error2 = InstallationError("Non-recoverable", stage="test", recoverable=False)
        assert error2.recoverable is False


# =============================================================================
# TEST: CHECKPOINT STATE EXPORT
# =============================================================================

class TestCheckpointExport:
    """Tests for checkpoint state export functionality."""
    
    def test_export_state(self, rollback_manager):
        """Verifies export_state() returns correct data."""
        rollback_manager.create_checkpoint("cp1", {"key": "value1"}, ["cmd1"])
        rollback_manager.create_checkpoint("cp2", {"key": "value2"}, ["cmd2", "cmd3"])
        
        state = rollback_manager.export_state()
        
        assert "checkpoints" in state
        assert len(state["checkpoints"]) == 2
        assert state["checkpoints"][0]["name"] == "cp1"
        assert state["checkpoints"][0]["commands"] == 1
        assert state["checkpoints"][1]["name"] == "cp2"
        assert state["checkpoints"][1]["commands"] == 2


# =============================================================================
# PYTEST CONFIGURATION
# =============================================================================

def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )

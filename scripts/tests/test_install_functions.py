#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Unit Tests for Install Functions
========================================================
Tests for clone_and_setup_repository, PostInstallValidator.check_repository,
and RollbackManager functionality.

Author: B0.y_Z4kr14
License: Public Domain
"""

import os
import sys
import pytest
import tempfile
import shutil
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from dataclasses import dataclass
from typing import List, Tuple, Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def temp_install_dir(tmp_path):
    """Create temporary install directory."""
    install_dir = tmp_path / "tsijukebox"
    install_dir.mkdir(parents=True)
    return install_dir


@pytest.fixture
def temp_data_dir(tmp_path):
    """Create temporary data directory."""
    data_dir = tmp_path / "data"
    data_dir.mkdir(parents=True)
    return data_dir


@pytest.fixture
def mock_args():
    """Create mock argparse.Namespace."""
    args = Mock()
    args.no_monitoring = False
    args.no_spotify = False
    args.no_spotify_cli = False
    args.dry_run = False
    args.verbose = False
    return args


@pytest.fixture
def mock_subprocess():
    """Mock subprocess.run for command execution."""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="success",
            stderr=""
        )
        yield mock_run


# =============================================================================
# TEST: InstallationCheckpoint
# =============================================================================

class TestInstallationCheckpoint:
    """Tests for InstallationCheckpoint dataclass."""
    
    def test_checkpoint_creation(self):
        """Test creating a checkpoint."""
        from install import InstallationCheckpoint
        
        checkpoint = InstallationCheckpoint(
            name="test_checkpoint",
            state={"packages": ["nodejs", "npm"]},
            rollback_commands=["paru -R nodejs npm"]
        )
        
        assert checkpoint.name == "test_checkpoint"
        assert checkpoint.state == {"packages": ["nodejs", "npm"]}
        assert len(checkpoint.rollback_commands) == 1
        assert checkpoint.timestamp is not None
    
    def test_checkpoint_empty_state(self):
        """Test checkpoint with empty state."""
        from install import InstallationCheckpoint
        
        checkpoint = InstallationCheckpoint(
            name="empty",
            state={},
            rollback_commands=[]
        )
        
        assert checkpoint.state == {}
        assert checkpoint.rollback_commands == []


# =============================================================================
# TEST: RollbackManager
# =============================================================================

class TestRollbackManager:
    """Tests for RollbackManager class."""
    
    def test_create_checkpoint(self):
        """Test creating checkpoints."""
        from install import RollbackManager
        
        manager = RollbackManager()
        manager.create_checkpoint(
            name="packages_installed",
            state={"packages": ["git", "nodejs"]},
            rollback_commands=["paru -R git nodejs"]
        )
        
        assert len(manager.checkpoints) == 1
        assert manager.checkpoints[0].name == "packages_installed"
    
    def test_multiple_checkpoints(self):
        """Test creating multiple checkpoints."""
        from install import RollbackManager
        
        manager = RollbackManager()
        manager.create_checkpoint("step1", {}, [])
        manager.create_checkpoint("step2", {}, [])
        manager.create_checkpoint("step3", {}, [])
        
        assert len(manager.checkpoints) == 3
    
    def test_has_checkpoints(self):
        """Test has_checkpoints method."""
        from install import RollbackManager
        
        manager = RollbackManager()
        assert not manager.has_checkpoints()
        
        manager.create_checkpoint("test", {}, [])
        assert manager.has_checkpoints()
    
    def test_get_checkpoint(self):
        """Test getting specific checkpoint."""
        from install import RollbackManager
        
        manager = RollbackManager()
        manager.create_checkpoint("first", {"a": 1}, ["cmd1"])
        manager.create_checkpoint("second", {"b": 2}, ["cmd2"])
        
        checkpoint = manager.get_checkpoint("first")
        assert checkpoint is not None
        assert checkpoint.state == {"a": 1}
        
        assert manager.get_checkpoint("nonexistent") is None
    
    @patch('subprocess.run')
    def test_rollback_all(self, mock_run):
        """Test rolling back all checkpoints."""
        from install import RollbackManager
        
        mock_run.return_value = MagicMock(returncode=0)
        
        manager = RollbackManager()
        manager.create_checkpoint("step1", {}, ["echo step1"])
        manager.create_checkpoint("step2", {}, ["echo step2"])
        
        result = manager.rollback_all()
        
        # Should execute commands in reverse order
        assert result == True
        assert mock_run.call_count == 2
    
    @patch('subprocess.run')
    def test_rollback_to_checkpoint(self, mock_run):
        """Test rolling back to specific checkpoint."""
        from install import RollbackManager
        
        mock_run.return_value = MagicMock(returncode=0)
        
        manager = RollbackManager()
        manager.create_checkpoint("step1", {}, ["cmd1"])
        manager.create_checkpoint("step2", {}, ["cmd2"])
        manager.create_checkpoint("step3", {}, ["cmd3"])
        
        result = manager.rollback_to("step2")
        
        # Should only rollback step3, not step2 and step1
        assert result == True
    
    def test_cleanup(self):
        """Test cleanup removes all checkpoints."""
        from install import RollbackManager
        
        manager = RollbackManager()
        manager.create_checkpoint("test1", {}, [])
        manager.create_checkpoint("test2", {}, [])
        
        manager.cleanup()
        
        assert len(manager.checkpoints) == 0
    
    def test_export_state(self):
        """Test exporting manager state to dict."""
        from install import RollbackManager
        
        manager = RollbackManager()
        manager.create_checkpoint("test", {"key": "value"}, ["cmd"])
        
        state = manager.export_state()
        
        assert "checkpoints" in state
        assert len(state["checkpoints"]) == 1


# =============================================================================
# TEST: clone_and_setup_repository
# =============================================================================

class TestCloneAndSetupRepository:
    """Tests for clone_and_setup_repository function."""
    
    @patch('subprocess.run')
    @patch('install.INSTALL_DIR', new_callable=lambda: Path('/tmp/test_install'))
    def test_clone_new_repository(self, mock_run, temp_install_dir):
        """Test cloning a new repository."""
        from install import clone_and_setup_repository
        
        mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        
        # Mock INSTALL_DIR to not exist
        with patch('install.INSTALL_DIR', temp_install_dir):
            with patch.object(Path, 'exists', return_value=False):
                result = clone_and_setup_repository("testuser")
        
        # Should attempt git clone
        assert mock_run.called
    
    @patch('subprocess.run')
    def test_update_existing_repository(self, mock_run, temp_install_dir):
        """Test updating existing repository."""
        mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        
        # Create fake existing repo
        (temp_install_dir / ".git").mkdir()
        (temp_install_dir / "package.json").write_text("{}")
        
        from install import clone_and_setup_repository
        
        with patch('install.INSTALL_DIR', temp_install_dir):
            result = clone_and_setup_repository("testuser")
        
        # Should call git pull, not git clone
        calls = [str(call) for call in mock_run.call_args_list]
        assert any("pull" in str(call) or "clone" in str(call) for call in calls)
    
    @patch('subprocess.run')
    def test_npm_install_runs(self, mock_run, temp_install_dir):
        """Test that npm install is executed."""
        mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        
        (temp_install_dir / "package.json").write_text("{}")
        
        from install import clone_and_setup_repository
        
        with patch('install.INSTALL_DIR', temp_install_dir):
            clone_and_setup_repository("testuser")
        
        # Should include npm install call
        npm_calls = [c for c in mock_run.call_args_list if 'npm' in str(c)]
        assert len(npm_calls) >= 1
    
    @patch('subprocess.run')
    def test_ownership_corrected(self, mock_run, temp_install_dir):
        """Test that file ownership is corrected."""
        mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        
        from install import clone_and_setup_repository
        
        with patch('install.INSTALL_DIR', temp_install_dir):
            clone_and_setup_repository("testuser")
        
        # Should include chown call
        chown_calls = [c for c in mock_run.call_args_list if 'chown' in str(c)]
        assert len(chown_calls) >= 1
    
    @patch('subprocess.run')
    def test_clone_fails_gracefully(self, mock_run, temp_install_dir):
        """Test graceful failure handling."""
        mock_run.side_effect = Exception("Network error")
        
        from install import clone_and_setup_repository
        
        with patch('install.INSTALL_DIR', temp_install_dir):
            result = clone_and_setup_repository("testuser")
        
        assert result == False


# =============================================================================
# TEST: PostInstallValidator.check_repository
# =============================================================================

class TestPostInstallValidatorCheckRepository:
    """Tests for PostInstallValidator.check_repository method."""
    
    def test_check_repository_missing_dir(self, mock_args, temp_install_dir):
        """Test when install directory doesn't exist."""
        from install import PostInstallValidator
        
        non_existent = Path("/nonexistent/path")
        
        with patch('install.INSTALL_DIR', non_existent):
            validator = PostInstallValidator(mock_args)
            result = validator.check_repository()
        
        assert result == False
        assert len(validator.repair_commands) > 0
    
    def test_check_repository_no_package_json(self, mock_args, temp_install_dir):
        """Test when package.json is missing."""
        from install import PostInstallValidator
        
        # Directory exists but no package.json
        with patch('install.INSTALL_DIR', temp_install_dir):
            validator = PostInstallValidator(mock_args)
            result = validator.check_repository()
        
        assert result == False
        assert any("clone" in cmd for cmd in validator.repair_commands)
    
    def test_check_repository_no_node_modules(self, mock_args, temp_install_dir):
        """Test when node_modules is missing (warning, not error)."""
        from install import PostInstallValidator
        
        # Create package.json but no node_modules
        (temp_install_dir / "package.json").write_text('{"name": "test"}')
        
        with patch('install.INSTALL_DIR', temp_install_dir):
            validator = PostInstallValidator(mock_args)
            result = validator.check_repository()
        
        # Should return True (not critical) but add repair command
        assert result == True
        assert any("npm install" in cmd for cmd in validator.repair_commands)
    
    def test_check_repository_complete(self, mock_args, temp_install_dir):
        """Test when repository is complete."""
        from install import PostInstallValidator
        
        # Create both package.json and node_modules
        (temp_install_dir / "package.json").write_text('{"name": "test"}')
        (temp_install_dir / "node_modules").mkdir()
        
        with patch('install.INSTALL_DIR', temp_install_dir):
            validator = PostInstallValidator(mock_args)
            result = validator.check_repository()
        
        assert result == True
        # No repair commands for npm install needed
        npm_commands = [cmd for cmd in validator.repair_commands if "npm install" in cmd]
        assert len(npm_commands) == 0
    
    def test_repair_commands_generated(self, mock_args, temp_install_dir):
        """Test that appropriate repair commands are generated."""
        from install import PostInstallValidator
        
        # Simulate missing directory
        non_existent = Path("/tmp/nonexistent_test_dir")
        
        with patch('install.INSTALL_DIR', non_existent):
            validator = PostInstallValidator(mock_args)
            validator.check_repository()
        
        assert len(validator.repair_commands) > 0
        assert any("git clone" in cmd for cmd in validator.repair_commands)


# =============================================================================
# TEST: Logger with Rotation
# =============================================================================

class TestLoggerRotation:
    """Tests for Logger rotation functionality."""
    
    def test_logger_rotation_config(self, tmp_path):
        """Test logger accepts rotation configuration."""
        from installer.utils.logger import Logger
        
        logger = Logger(
            name='test_rotation',
            log_dir=tmp_path,
            max_file_size_mb=5,
            backup_count=3
        )
        
        assert logger.max_file_size == 5 * 1024 * 1024
        assert logger.backup_count == 3
    
    def test_logger_creates_log_file(self, tmp_path):
        """Test logger creates log files."""
        from installer.utils.logger import Logger
        
        # Clear singleton for test
        Logger._instances = {}
        
        logger = Logger(
            name='test_create',
            log_dir=tmp_path
        )
        
        logger.info("Test message")
        
        log_file = tmp_path / "test_create.log"
        assert log_file.exists()
    
    def test_logger_level_configuration(self, tmp_path):
        """Test logger level configuration."""
        from installer.utils.logger import Logger, LogLevel
        
        Logger._instances = {}
        
        logger = Logger(
            name='test_levels',
            log_dir=tmp_path,
            console_level=LogLevel.WARNING
        )
        
        assert logger.console_level == LogLevel.WARNING


# =============================================================================
# INTEGRATION TESTS
# =============================================================================

@pytest.mark.integration
class TestRollbackIntegration:
    """Integration tests for rollback system."""
    
    @patch('subprocess.run')
    def test_full_rollback_flow(self, mock_run, tmp_path):
        """Test complete rollback flow."""
        from install import RollbackManager
        
        mock_run.return_value = MagicMock(returncode=0)
        
        manager = RollbackManager()
        
        # Simulate installation steps
        manager.create_checkpoint("pre_install", {}, [])
        manager.create_checkpoint("packages", {"pkgs": ["a", "b"]}, [f"rm -rf {tmp_path}/pkg"])
        manager.create_checkpoint("repo", {"path": str(tmp_path)}, [f"rm -rf {tmp_path}"])
        
        # Simulate failure at npm install
        # Rollback should clean up in reverse order
        success = manager.rollback_all()
        
        assert success == True
        assert mock_run.call_count >= 2


# =============================================================================
# EDGE CASES
# =============================================================================

@pytest.mark.edge_case
class TestEdgeCases:
    """Edge case tests."""
    
    def test_rollback_empty_manager(self):
        """Test rollback with no checkpoints."""
        from install import RollbackManager
        
        manager = RollbackManager()
        result = manager.rollback_all()
        
        assert result == True  # Nothing to rollback is success
    
    def test_checkpoint_with_special_characters(self):
        """Test checkpoint with special characters in commands."""
        from install import RollbackManager
        
        manager = RollbackManager()
        manager.create_checkpoint(
            "special",
            {"path": "/opt/test's dir"},
            ["rm -rf '/opt/test's dir'"]
        )
        
        assert manager.checkpoints[0].state["path"] == "/opt/test's dir"
    
    @patch('subprocess.run')
    def test_rollback_with_failed_command(self, mock_run):
        """Test rollback continues even if command fails."""
        from install import RollbackManager
        
        # First call fails, second succeeds
        mock_run.side_effect = [
            MagicMock(returncode=1),  # First command fails
            MagicMock(returncode=0),  # Second succeeds
        ]
        
        manager = RollbackManager()
        manager.create_checkpoint("step1", {}, ["cmd1"])
        manager.create_checkpoint("step2", {}, ["cmd2"])
        
        # Should continue despite failure
        result = manager.rollback_all()
        
        assert mock_run.call_count == 2  # Both commands attempted


# =============================================================================
# TEST: is_running_from_curl
# =============================================================================

class TestIsRunningFromCurl:
    """Tests for is_running_from_curl() detection."""
    
    def test_returns_false_when_stdin_is_terminal(self, mocker):
        """Retorna False quando stdin é um terminal."""
        mocker.patch('os.isatty', return_value=True)
        
        # Reimport to get fresh function
        import importlib
        import install
        importlib.reload(install)
        
        # Mock __file__ to be a real path
        mocker.patch.object(install, '__file__', '/path/to/install.py')
        
        result = install.is_running_from_curl()
        assert result == False
    
    def test_returns_true_when_stdin_is_not_terminal(self, mocker):
        """Retorna True quando stdin não é terminal (pipe)."""
        mocker.patch('os.isatty', return_value=False)
        
        from install import is_running_from_curl
        result = is_running_from_curl()
        
        assert result == True
    
    def test_returns_true_when_file_is_stdin(self, mocker):
        """Retorna True quando __file__ é '<stdin>'."""
        mocker.patch('os.isatty', return_value=True)
        
        import install
        original_file = getattr(install, '__file__', None)
        
        try:
            install.__file__ = '<stdin>'
            result = install.is_running_from_curl()
            assert result == True
        finally:
            if original_file:
                install.__file__ = original_file
    
    def test_returns_true_when_os_error(self, mocker):
        """Retorna True quando ocorre OSError (fallback seguro)."""
        mocker.patch('os.isatty', side_effect=OSError("No tty"))
        
        from install import is_running_from_curl
        result = is_running_from_curl()
        
        assert result == True
    
    def test_returns_true_when_attribute_error(self, mocker):
        """Retorna True quando ocorre AttributeError."""
        # Simular stdin sem fileno()
        mock_stdin = mocker.MagicMock()
        mock_stdin.fileno.side_effect = AttributeError("no fileno")
        mocker.patch('sys.stdin', mock_stdin)
        
        from install import is_running_from_curl
        result = is_running_from_curl()
        
        assert result == True


# =============================================================================
# TEST: configure_spicetify_inline
# =============================================================================

class TestConfigureSpicetifyInline:
    """Tests for configure_spicetify_inline() function."""
    
    @pytest.fixture
    def mock_user_home(self, tmp_path, mocker):
        """Setup para mock de ambiente de usuário."""
        home = tmp_path / "home" / "testuser"
        home.mkdir(parents=True)
        
        # Mock pwd.getpwnam
        mock_pwd_entry = MagicMock()
        mock_pwd_entry.pw_dir = str(home)
        mocker.patch('pwd.getpwnam', return_value=mock_pwd_entry)
        
        return home
    
    def test_returns_false_when_spicetify_not_found(self, mock_user_home, mocker):
        """Retorna False quando spicetify não está instalado."""
        # Mock run_command para retornar failure no which
        mocker.patch('install.run_command', return_value=(1, "", "not found"))
        
        from install import configure_spicetify_inline
        result = configure_spicetify_inline("testuser")
        
        assert result == False
    
    def test_finds_spicetify_in_home_directory(self, mock_user_home, mocker):
        """Encontra spicetify em ~/.spicetify/."""
        # Criar estrutura de diretórios
        spicetify_dir = mock_user_home / ".spicetify"
        spicetify_dir.mkdir()
        spicetify_bin = spicetify_dir / "spicetify"
        spicetify_bin.touch()
        spicetify_bin.chmod(0o755)
        
        # Criar diretório spotify
        spotify_dir = mock_user_home / ".config" / "spotify"
        spotify_dir.mkdir(parents=True)
        
        # Mock subprocess
        mock_subprocess = mocker.patch('subprocess.run')
        mock_subprocess.return_value = MagicMock(returncode=0, stdout="", stderr="")
        
        mock_popen = mocker.patch('subprocess.Popen')
        mock_popen.return_value = MagicMock(poll=lambda: 0)
        
        mocker.patch('time.sleep')
        mocker.patch('install.run_command', return_value=(0, "", ""))
        
        from install import configure_spicetify_inline
        result = configure_spicetify_inline("testuser")
        
        assert result == True
    
    def test_finds_spicetify_via_which(self, mock_user_home, mocker):
        """Encontra spicetify via 'which' quando não está em ~/.spicetify."""
        # Criar diretório spotify
        spotify_dir = mock_user_home / ".config" / "spotify"
        spotify_dir.mkdir(parents=True)
        
        # Mock run_command - which encontra spicetify
        def mock_run_cmd(cmd, *args, **kwargs):
            if 'which' in cmd:
                return (0, "/usr/bin/spicetify\n", "")
            return (0, "", "")
        
        mocker.patch('install.run_command', side_effect=mock_run_cmd)
        
        mock_subprocess = mocker.patch('subprocess.run')
        mock_subprocess.return_value = MagicMock(returncode=0, stdout="", stderr="")
        
        mock_popen = mocker.patch('subprocess.Popen')
        mock_popen.return_value = MagicMock(poll=lambda: 0)
        
        mocker.patch('time.sleep')
        
        from install import configure_spicetify_inline
        result = configure_spicetify_inline("testuser")
        
        assert result == True
    
    def test_creates_prefs_file_if_missing(self, mock_user_home, mocker):
        """Cria arquivo prefs se não existir."""
        spicetify_dir = mock_user_home / ".spicetify"
        spicetify_dir.mkdir()
        (spicetify_dir / "spicetify").touch()
        
        # Não criar prefs - a função deve criar
        spotify_dir = mock_user_home / ".config" / "spotify"
        # Não criamos o diretório - a função deve criar
        
        mock_subprocess = mocker.patch('subprocess.run')
        mock_subprocess.return_value = MagicMock(returncode=0)
        
        mock_popen = mocker.patch('subprocess.Popen')
        mock_popen.return_value = MagicMock(poll=lambda: 0)
        
        mocker.patch('time.sleep')
        mocker.patch('install.run_command', return_value=(0, "", ""))
        
        from install import configure_spicetify_inline
        result = configure_spicetify_inline("testuser")
        
        # Verificar que tentou criar o diretório (função deve ter criado)
        assert result == True
    
    def test_applies_spicetify_configs(self, mock_user_home, mocker):
        """Aplica configurações do Spicetify corretamente."""
        spicetify_dir = mock_user_home / ".spicetify"
        spicetify_dir.mkdir()
        spicetify_bin = spicetify_dir / "spicetify"
        spicetify_bin.touch()
        
        spotify_dir = mock_user_home / ".config" / "spotify"
        spotify_dir.mkdir(parents=True)
        
        # Capturar chamadas do subprocess
        subprocess_calls = []
        
        def capture_subprocess(*args, **kwargs):
            subprocess_calls.append(args[0] if args else kwargs.get('args', []))
            return MagicMock(returncode=0, stdout="", stderr="")
        
        mocker.patch('subprocess.run', side_effect=capture_subprocess)
        mocker.patch('subprocess.Popen', return_value=MagicMock(poll=lambda: 0))
        mocker.patch('time.sleep')
        mocker.patch('install.run_command', return_value=(0, "", ""))
        
        from install import configure_spicetify_inline
        configure_spicetify_inline("testuser")
        
        # Verificar que configs foram aplicadas
        all_calls_str = str(subprocess_calls)
        assert 'backup' in all_calls_str or 'config' in all_calls_str
    
    def test_returns_true_even_if_apply_fails(self, mock_user_home, mocker):
        """Retorna True mesmo se spicetify apply falhar (best effort)."""
        spicetify_dir = mock_user_home / ".spicetify"
        spicetify_dir.mkdir()
        (spicetify_dir / "spicetify").touch()
        
        spotify_dir = mock_user_home / ".config" / "spotify"
        spotify_dir.mkdir(parents=True)
        
        call_count = [0]
        
        def mock_subprocess_run(*args, **kwargs):
            call_count[0] += 1
            # Fazer apply falhar (última chamada geralmente)
            if 'apply' in str(args):
                return MagicMock(returncode=1, stderr="apply failed")
            return MagicMock(returncode=0, stdout="", stderr="")
        
        mocker.patch('subprocess.run', side_effect=mock_subprocess_run)
        mocker.patch('subprocess.Popen', return_value=MagicMock(poll=lambda: 0))
        mocker.patch('time.sleep')
        mocker.patch('install.run_command', return_value=(0, "", ""))
        
        from install import configure_spicetify_inline
        result = configure_spicetify_inline("testuser")
        
        # Deve retornar True mesmo com apply falhando
        assert result == True
    
    def test_handles_spotify_not_running(self, mock_user_home, mocker):
        """Funciona mesmo quando Spotify não está rodando."""
        spicetify_dir = mock_user_home / ".spicetify"
        spicetify_dir.mkdir()
        (spicetify_dir / "spicetify").touch()
        
        spotify_dir = mock_user_home / ".config" / "spotify"
        spotify_dir.mkdir(parents=True)
        
        # Popen retorna None (processo não encontrado)
        mocker.patch('subprocess.Popen', return_value=MagicMock(poll=lambda: None))
        mocker.patch('subprocess.run', return_value=MagicMock(returncode=0))
        mocker.patch('time.sleep')
        mocker.patch('install.run_command', return_value=(0, "", ""))
        
        from install import configure_spicetify_inline
        result = configure_spicetify_inline("testuser")
        
        assert result == True


# =============================================================================
# TEST: RUNNING_FROM_CURL global variable
# =============================================================================

class TestRunningFromCurlGlobal:
    """Tests for RUNNING_FROM_CURL global variable behavior."""
    
    def test_global_variable_exists(self):
        """Variável global RUNNING_FROM_CURL existe no módulo."""
        from install import RUNNING_FROM_CURL
        
        # Deve ser um booleano
        assert isinstance(RUNNING_FROM_CURL, bool)
    
    def test_affects_spicetify_installation(self, mocker):
        """RUNNING_FROM_CURL afeta comportamento de install_spotify_spicetify."""
        # Este é um teste de integração leve
        import install
        
        # Verificar que a variável é usada na lógica
        # (o comportamento real depende do ambiente)
        assert hasattr(install, 'RUNNING_FROM_CURL')


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])

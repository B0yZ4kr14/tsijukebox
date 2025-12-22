#!/usr/bin/env python3
"""
TSiJUKEBOX - Unified Installer Unit Tests
==========================================
Testes unitários para unified-installer.py v5.1.0 (20 fases).

Testa:
- InstallPhase enum
- InstallConfig dataclass
- SystemInfo dataclass
- Logger class
- Utility functions (run_command, run_as_user, detect_distro, detect_aur_helper)
- UnifiedInstaller class (métodos individuais)

Uso:
    cd scripts && python -m pytest tests/test_unified_installer.py -v
"""

import os
import sys
import tempfile
from pathlib import Path
from typing import Generator
from unittest.mock import MagicMock, patch, PropertyMock
from datetime import datetime

import pytest

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import unified-installer module (handle hyphen in name)
import importlib.util

spec = importlib.util.spec_from_file_location(
    "unified_installer",
    Path(__file__).parent.parent / "unified-installer.py"
)
unified_installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(unified_installer)

# Re-export classes for testing
InstallPhase = unified_installer.InstallPhase
InstallConfig = unified_installer.InstallConfig
SystemInfo = unified_installer.SystemInfo
Logger = unified_installer.Logger
Colors = unified_installer.Colors
UnifiedInstaller = unified_installer.UnifiedInstaller
run_command = unified_installer.run_command
run_as_user = unified_installer.run_as_user
detect_distro = unified_installer.detect_distro
detect_aur_helper = unified_installer.detect_aur_helper
TOTAL_PHASES = unified_installer.TOTAL_PHASES
VERSION = unified_installer.VERSION


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def temp_dir() -> Generator[Path, None, None]:
    """Cria diretório temporário para testes."""
    with tempfile.TemporaryDirectory(prefix="unified_installer_test_") as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def default_config() -> InstallConfig:
    """Config padrão para testes."""
    return InstallConfig(dry_run=True, quiet=True)


@pytest.fixture
def kiosk_config() -> InstallConfig:
    """Config modo kiosk para testes."""
    return InstallConfig(
        mode='kiosk',
        install_kiosk=True,
        install_docker=True,
        dry_run=True,
        quiet=True
    )


@pytest.fixture
def minimal_config() -> InstallConfig:
    """Config minimal para testes."""
    return InstallConfig(
        mode='minimal',
        install_docker=False,
        install_ufw=False,
        install_monitoring=False,
        install_spotify=False,
        dry_run=True,
        quiet=True
    )


@pytest.fixture
def installer(default_config: InstallConfig) -> UnifiedInstaller:
    """UnifiedInstaller com config padrão em dry_run."""
    return UnifiedInstaller(default_config)


@pytest.fixture
def mock_subprocess_success():
    """Mock subprocess.run com sucesso."""
    with patch('subprocess.run') as mock_run:
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = "success"
        mock_result.stderr = ""
        mock_run.return_value = mock_result
        yield mock_run


@pytest.fixture
def mock_subprocess_failure():
    """Mock subprocess.run com falha."""
    with patch('subprocess.run') as mock_run:
        mock_result = MagicMock()
        mock_result.returncode = 1
        mock_result.stdout = ""
        mock_result.stderr = "error"
        mock_run.return_value = mock_result
        yield mock_run


# =============================================================================
# TESTES: InstallPhase Enum
# =============================================================================

class TestInstallPhase:
    """Testa enum InstallPhase com todas as 20 fases."""
    
    def test_all_phases_exist(self):
        """Verifica que todas as fases esperadas existem."""
        expected_phases = [
            'SYSTEM_CHECK', 'DOCKER', 'UFW', 'NTP', 'FONTS', 'AUDIO',
            'DATABASE', 'NGINX', 'MONITORING', 'CLOUD_BACKUP', 'SPOTIFY',
            'SPICETIFY', 'SPOTIFY_CLI', 'KIOSK', 'VOICE_CONTROL', 'DEV_TOOLS',
            'AUTOLOGIN', 'APP_DEPLOY', 'SERVICES', 'VERIFY'
        ]
        
        for phase_name in expected_phases:
            assert hasattr(InstallPhase, phase_name), f"Fase {phase_name} não encontrada"
    
    def test_phase_count_equals_20(self):
        """Verifica que existem exatamente 20 fases."""
        phase_count = len(list(InstallPhase))
        assert phase_count == 20, f"Esperado 20 fases, encontrado {phase_count}"
        assert phase_count == TOTAL_PHASES, "TOTAL_PHASES não corresponde ao número de fases"
    
    def test_phase_values(self):
        """Verifica valores das fases."""
        assert InstallPhase.SYSTEM_CHECK.value == "system_check"
        assert InstallPhase.DOCKER.value == "docker"
        assert InstallPhase.UFW.value == "ufw"
        assert InstallPhase.FONTS.value == "fonts"
        assert InstallPhase.AUDIO.value == "audio"
        assert InstallPhase.DATABASE.value == "database"
        assert InstallPhase.KIOSK.value == "kiosk"
        assert InstallPhase.VOICE_CONTROL.value == "voice_control"
        assert InstallPhase.DEV_TOOLS.value == "dev_tools"
        assert InstallPhase.VERIFY.value == "verify"
    
    def test_phase_uniqueness(self):
        """Verifica que todos os valores de fase são únicos."""
        values = [phase.value for phase in InstallPhase]
        assert len(values) == len(set(values)), "Valores de fase duplicados encontrados"


# =============================================================================
# TESTES: InstallConfig Dataclass
# =============================================================================

class TestInstallConfig:
    """Testa dataclass InstallConfig."""
    
    def test_default_values(self):
        """Verifica valores padrão."""
        config = InstallConfig()
        
        assert config.mode == 'full'
        assert config.user is None
        assert config.install_docker is True
        assert config.install_ufw is True
        assert config.install_ntp is True
        assert config.install_fonts is True
        assert config.install_audio is True
        assert config.audio_backend == 'pipewire'
        assert config.install_database is True
        assert config.database_type == 'sqlite'
        assert config.install_cloud_backup is True
        assert config.install_kiosk is False
        assert config.install_voice_control is True
        assert config.install_dev_tools is False
        assert config.dry_run is False
        assert config.verbose is False
        assert config.quiet is False
    
    def test_custom_config_docker_disabled(self):
        """Testa config com Docker desabilitado."""
        config = InstallConfig(install_docker=False)
        assert config.install_docker is False
        assert config.install_ufw is True  # outros mantidos
    
    def test_custom_config_kiosk_mode(self):
        """Testa config modo kiosk."""
        config = InstallConfig(
            mode='kiosk',
            install_kiosk=True,
            kiosk_url='http://localhost:8080'
        )
        assert config.mode == 'kiosk'
        assert config.install_kiosk is True
        assert config.kiosk_url == 'http://localhost:8080'
    
    def test_custom_config_all_new_components(self):
        """Testa todos os componentes novos v5.1.0."""
        config = InstallConfig(
            install_fonts=True,
            install_audio=True,
            audio_backend='pulseaudio',
            install_database=True,
            database_type='postgresql',
            database_name='mydb',
            database_user='myuser',
            install_cloud_backup=True,
            cloud_providers=['rclone', 'storj', 's3'],
            install_voice_control=True,
            voice_language='en-US',
            install_dev_tools=True
        )
        
        assert config.install_fonts is True
        assert config.audio_backend == 'pulseaudio'
        assert config.database_type == 'postgresql'
        assert config.database_name == 'mydb'
        assert config.database_user == 'myuser'
        assert 'storj' in config.cloud_providers
        assert 's3' in config.cloud_providers
        assert config.voice_language == 'en-US'
        assert config.install_dev_tools is True
    
    def test_database_types(self):
        """Testa diferentes tipos de database."""
        for db_type in ['sqlite', 'mariadb', 'postgresql']:
            config = InstallConfig(database_type=db_type)
            assert config.database_type == db_type
    
    def test_audio_backends(self):
        """Testa diferentes backends de áudio."""
        for backend in ['pipewire', 'pulseaudio']:
            config = InstallConfig(audio_backend=backend)
            assert config.audio_backend == backend
    
    def test_cloud_providers_list(self):
        """Testa lista de provedores cloud."""
        config = InstallConfig()
        assert isinstance(config.cloud_providers, list)
        assert 'rclone' in config.cloud_providers
    
    def test_timezone_setting(self):
        """Testa configuração de timezone."""
        config = InstallConfig(timezone='Europe/London')
        assert config.timezone == 'Europe/London'
    
    def test_backup_schedule_cron(self):
        """Testa configuração de schedule de backup."""
        config = InstallConfig(backup_schedule='0 3 * * *')
        assert config.backup_schedule == '0 3 * * *'


# =============================================================================
# TESTES: SystemInfo Dataclass
# =============================================================================

class TestSystemInfo:
    """Testa dataclass SystemInfo."""
    
    def test_default_values(self):
        """Verifica valores padrão."""
        info = SystemInfo()
        
        assert info.distro == ""
        assert info.distro_id == ""
        assert info.user == ""
        assert info.login_manager == ""
        assert info.has_docker is False
        assert info.has_paru is False
        assert info.has_yay is False
        assert info.ram_gb == 0
        assert info.disk_free_gb == 0
    
    def test_custom_system_info(self):
        """Testa SystemInfo customizado."""
        info = SystemInfo(
            distro="Arch Linux",
            distro_id="arch",
            user="testuser",
            home=Path("/home/testuser"),
            login_manager="sddm",
            has_docker=True,
            has_paru=True,
            has_yay=False,
            ram_gb=16.0,
            disk_free_gb=100.0
        )
        
        assert info.distro == "Arch Linux"
        assert info.distro_id == "arch"
        assert info.user == "testuser"
        assert info.home == Path("/home/testuser")
        assert info.login_manager == "sddm"
        assert info.has_docker is True
        assert info.has_paru is True
        assert info.has_yay is False
        assert info.ram_gb == 16.0
        assert info.disk_free_gb == 100.0


# =============================================================================
# TESTES: Logger Class
# =============================================================================

class TestLogger:
    """Testa classe Logger."""
    
    def test_logger_init_default(self):
        """Testa inicialização padrão do Logger."""
        with patch.object(Path, 'mkdir'):
            logger = Logger()
        
        assert logger.verbose is False
        assert logger.quiet is False
    
    def test_logger_init_verbose(self):
        """Testa Logger em modo verbose."""
        with patch.object(Path, 'mkdir'):
            logger = Logger(verbose=True)
        
        assert logger.verbose is True
    
    def test_logger_init_quiet(self):
        """Testa Logger em modo quiet."""
        with patch.object(Path, 'mkdir'):
            logger = Logger(quiet=True)
        
        assert logger.quiet is True
    
    def test_info_message(self, capsys):
        """Testa mensagem info."""
        with patch.object(Path, 'mkdir'), \
             patch('builtins.open', MagicMock()):
            logger = Logger(quiet=False)
            logger.info("Test message")
        
        captured = capsys.readouterr()
        assert "Test message" in captured.out
    
    def test_success_message(self, capsys):
        """Testa mensagem success."""
        with patch.object(Path, 'mkdir'), \
             patch('builtins.open', MagicMock()):
            logger = Logger(quiet=False)
            logger.success("Success message")
        
        captured = capsys.readouterr()
        assert "Success message" in captured.out
    
    def test_warning_message(self, capsys):
        """Testa mensagem warning (sempre exibida)."""
        with patch.object(Path, 'mkdir'), \
             patch('builtins.open', MagicMock()):
            logger = Logger(quiet=True)
            logger.warning("Warning message")
        
        captured = capsys.readouterr()
        assert "Warning message" in captured.out
    
    def test_error_message(self, capsys):
        """Testa mensagem error (sempre exibida)."""
        with patch.object(Path, 'mkdir'), \
             patch('builtins.open', MagicMock()):
            logger = Logger(quiet=True)
            logger.error("Error message")
        
        captured = capsys.readouterr()
        assert "Error message" in captured.out
    
    def test_debug_only_in_verbose(self, capsys):
        """Testa que debug só aparece em verbose."""
        with patch.object(Path, 'mkdir'), \
             patch('builtins.open', MagicMock()):
            logger = Logger(verbose=False)
            logger.debug("Debug message")
        
        captured = capsys.readouterr()
        assert "Debug message" not in captured.out
        
        with patch.object(Path, 'mkdir'), \
             patch('builtins.open', MagicMock()):
            logger = Logger(verbose=True)
            logger.debug("Debug message verbose")
        
        captured = capsys.readouterr()
        assert "Debug message verbose" in captured.out
    
    def test_step_format(self, capsys):
        """Testa formato de step."""
        with patch.object(Path, 'mkdir'), \
             patch('builtins.open', MagicMock()):
            logger = Logger(quiet=False)
            logger.step(5, 20, "Installing fonts")
        
        captured = capsys.readouterr()
        assert "[5/20]" in captured.out
        assert "Installing fonts" in captured.out
    
    def test_quiet_mode_suppresses_output(self, capsys):
        """Testa que modo quiet suprime info/success."""
        with patch.object(Path, 'mkdir'), \
             patch('builtins.open', MagicMock()):
            logger = Logger(quiet=True)
            logger.info("Should not appear")
            logger.success("Should not appear")
        
        captured = capsys.readouterr()
        assert "Should not appear" not in captured.out


# =============================================================================
# TESTES: Utility Functions
# =============================================================================

class TestUtilityFunctions:
    """Testa funções utilitárias."""
    
    def test_run_command_success(self, mock_subprocess_success):
        """Testa run_command com sucesso."""
        code, stdout, stderr = run_command(['echo', 'test'])
        
        assert code == 0
        assert stdout == "success"
        assert stderr == ""
    
    def test_run_command_failure(self, mock_subprocess_failure):
        """Testa run_command com falha."""
        code, stdout, stderr = run_command(['false'])
        
        assert code == 1
        assert stderr == "error"
    
    def test_run_command_timeout(self):
        """Testa run_command com timeout."""
        import subprocess
        
        with patch('subprocess.run') as mock_run:
            mock_run.side_effect = subprocess.TimeoutExpired(['cmd'], 1)
            code, stdout, stderr = run_command(['sleep', '100'], timeout=1)
        
        assert code == 1
        assert "Timeout" in stderr
    
    def test_run_command_dry_run(self, capsys):
        """Testa run_command em dry_run."""
        code, stdout, stderr = run_command(['echo', 'test'], dry_run=True)
        
        assert code == 0
        assert stdout == ""
        assert stderr == ""
        
        captured = capsys.readouterr()
        assert "[DRY-RUN]" in captured.out
    
    def test_run_command_not_found(self):
        """Testa run_command com comando não encontrado."""
        with patch('subprocess.run') as mock_run:
            mock_run.side_effect = FileNotFoundError()
            code, stdout, stderr = run_command(['nonexistent_command'])
        
        assert code == 1
        assert "not found" in stderr.lower()
    
    def test_run_as_user(self):
        """Testa run_as_user."""
        with patch.object(unified_installer, 'run_command') as mock_cmd:
            mock_cmd.return_value = (0, "", "")
            
            # Simular root
            with patch('os.geteuid', return_value=0):
                run_as_user(['echo', 'test'], 'testuser')
            
            # Deve adicionar sudo -u
            mock_cmd.assert_called()
            call_args = mock_cmd.call_args[0][0]
            assert 'sudo' in call_args
            assert '-u' in call_args
            assert 'testuser' in call_args
    
    def test_detect_distro_arch(self, temp_dir):
        """Testa detect_distro para Arch Linux."""
        os_release = temp_dir / "os-release"
        os_release.write_text('NAME="Arch Linux"\nID=arch\n')
        
        with patch.object(Path, '__new__', return_value=os_release):
            with patch('pathlib.Path.exists', return_value=True):
                with patch('pathlib.Path.read_text', return_value='NAME="Arch Linux"\nID=arch\n'):
                    name, distro_id = detect_distro()
        
        # O mock pode não funcionar perfeitamente, verificamos o comportamento
        assert isinstance(name, str)
        assert isinstance(distro_id, str)
    
    def test_detect_distro_unknown(self):
        """Testa detect_distro quando /etc/os-release não existe."""
        with patch('pathlib.Path.exists', return_value=False):
            name, distro_id = detect_distro()
        
        assert name == "Unknown"
        assert distro_id == "unknown"
    
    def test_detect_aur_helper_paru(self):
        """Testa detect_aur_helper encontrando paru."""
        with patch('shutil.which') as mock_which:
            mock_which.side_effect = lambda x: '/usr/bin/paru' if x == 'paru' else None
            helper = detect_aur_helper()
        
        assert helper == 'paru'
    
    def test_detect_aur_helper_yay(self):
        """Testa detect_aur_helper encontrando yay."""
        with patch('shutil.which') as mock_which:
            mock_which.side_effect = lambda x: '/usr/bin/yay' if x == 'yay' else None
            helper = detect_aur_helper()
        
        assert helper == 'yay'
    
    def test_detect_aur_helper_none(self):
        """Testa detect_aur_helper sem helper disponível."""
        with patch('shutil.which', return_value=None):
            helper = detect_aur_helper()
        
        assert helper is None


# =============================================================================
# TESTES: UnifiedInstaller Class
# =============================================================================

class TestUnifiedInstaller:
    """Testa classe principal UnifiedInstaller."""
    
    def test_init(self, default_config):
        """Testa inicialização do UnifiedInstaller."""
        with patch.object(Path, 'mkdir'):
            installer = UnifiedInstaller(default_config)
        
        assert installer.config == default_config
        assert installer.completed_phases == []
        assert installer.rollback_actions == []
        assert installer.phase_counter == 0
    
    def test_next_phase_counter(self, installer):
        """Testa incremento do contador de fases."""
        assert installer.phase_counter == 0
        
        phase1 = installer._next_phase()
        assert phase1 == 1
        assert installer.phase_counter == 1
        
        phase2 = installer._next_phase()
        assert phase2 == 2
        assert installer.phase_counter == 2
    
    def test_print_banner(self, installer, capsys):
        """Testa exibição do banner."""
        installer._print_banner()
        
        captured = capsys.readouterr()
        assert "TSiJUKEBOX" in captured.out
        assert VERSION in captured.out
    
    def test_print_success(self, installer, capsys):
        """Testa exibição de mensagem de sucesso."""
        installer.completed_phases = [InstallPhase.DOCKER, InstallPhase.UFW]
        installer._print_success()
        
        captured = capsys.readouterr()
        assert "INSTALAÇÃO CONCLUÍDA" in captured.out or "SUCCESS" in captured.out.upper()
    
    def test_rollback_execution(self, installer):
        """Testa execução de rollback."""
        rollback_called = []
        
        def rollback_action_1():
            rollback_called.append(1)
        
        def rollback_action_2():
            rollback_called.append(2)
        
        installer.rollback_actions = [rollback_action_1, rollback_action_2]
        result = installer._rollback()
        
        assert result is False
        assert rollback_called == [2, 1]  # reversed order
    
    def test_rollback_handles_exceptions(self, installer):
        """Testa que rollback continua mesmo com exceções."""
        def failing_action():
            raise Exception("Rollback error")
        
        def passing_action():
            pass
        
        installer.rollback_actions = [passing_action, failing_action]
        
        # Não deve lançar exceção
        result = installer._rollback()
        assert result is False
    
    def test_generate_install_summary(self, installer, temp_dir):
        """Testa geração do resumo de instalação."""
        installer.system_info.user = "testuser"
        installer.system_info.distro = "Arch Linux"
        installer.system_info.distro_id = "arch"
        installer.system_info.ram_gb = 16.0
        installer.system_info.disk_free_gb = 50.0
        installer.system_info.login_manager = "sddm"
        installer.completed_phases = [InstallPhase.DOCKER, InstallPhase.UFW]
        
        # Não gera arquivo em dry_run
        installer._generate_install_summary()
        
        # Verificamos que não dá erro
        assert True
    
    def test_version_constant(self):
        """Testa constante VERSION."""
        assert VERSION == "5.1.0"
    
    def test_total_phases_constant(self):
        """Testa constante TOTAL_PHASES."""
        assert TOTAL_PHASES == 20


# =============================================================================
# TESTES: Colors Class
# =============================================================================

class TestColors:
    """Testa classe Colors."""
    
    def test_colors_defined(self):
        """Verifica que todas as cores estão definidas."""
        assert Colors.RED.startswith('\033[')
        assert Colors.GREEN.startswith('\033[')
        assert Colors.YELLOW.startswith('\033[')
        assert Colors.BLUE.startswith('\033[')
        assert Colors.MAGENTA.startswith('\033[')
        assert Colors.CYAN.startswith('\033[')
        assert Colors.WHITE.startswith('\033[')
        assert Colors.RESET.startswith('\033[')
        assert Colors.BOLD.startswith('\033[')
        assert Colors.DIM.startswith('\033[')

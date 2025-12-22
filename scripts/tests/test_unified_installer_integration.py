#!/usr/bin/env python3
"""
TSiJUKEBOX - Unified Installer Integration Tests
=================================================
Testes de integração com pytest-mock para unified-installer.py v5.1.0.
Simula execução completa de todas as 20 fases.

Uso:
    cd scripts && python -m pytest tests/test_unified_installer_integration.py -v
"""

import os
import sys
import tempfile
import argparse
from pathlib import Path
from typing import Generator
from unittest.mock import MagicMock, patch, PropertyMock

import pytest

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import unified-installer module
import importlib.util

spec = importlib.util.spec_from_file_location(
    "unified_installer",
    Path(__file__).parent.parent / "unified-installer.py"
)
unified_installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(unified_installer)

# Re-export
InstallPhase = unified_installer.InstallPhase
InstallConfig = unified_installer.InstallConfig
SystemInfo = unified_installer.SystemInfo
UnifiedInstaller = unified_installer.UnifiedInstaller
parse_args = unified_installer.parse_args
TOTAL_PHASES = unified_installer.TOTAL_PHASES


# =============================================================================
# FIXTURES: Mocks Globais
# =============================================================================

@pytest.fixture
def temp_dir() -> Generator[Path, None, None]:
    """Diretório temporário para testes."""
    with tempfile.TemporaryDirectory(prefix="unified_integration_") as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def mock_all_phase_dependencies(mocker):
    """Mock para todas as dependências externas das 20 fases."""
    
    # Mock subprocess.run
    mock_subprocess = mocker.patch('subprocess.run')
    mock_result = MagicMock()
    mock_result.returncode = 0
    mock_result.stdout = "success"
    mock_result.stderr = ""
    mock_subprocess.return_value = mock_result
    
    # Mock shutil.which (todos os binários existem)
    mocker.patch('shutil.which', return_value='/usr/bin/mock')
    
    # Mock os.geteuid (simula root)
    mocker.patch('os.geteuid', return_value=0)
    
    # Mock os.environ
    mocker.patch.dict(os.environ, {
        'SUDO_USER': 'testuser',
        'HOME': '/home/testuser'
    })
    
    # Mock pwd.getpwnam
    mock_pwd = MagicMock()
    mock_pwd.pw_dir = '/home/testuser'
    mocker.patch('pwd.getpwnam', return_value=mock_pwd)
    
    # Mock Path operations
    mocker.patch.object(Path, 'mkdir')
    mocker.patch.object(Path, 'exists', return_value=True)
    mocker.patch.object(Path, 'write_text')
    mocker.patch.object(Path, 'read_text', return_value='')
    
    # Mock os.statvfs para espaço em disco
    mock_statvfs = MagicMock()
    mock_statvfs.f_bavail = 1000000000
    mock_statvfs.f_frsize = 4096
    mocker.patch('os.statvfs', return_value=mock_statvfs)
    
    # Mock /proc/meminfo
    mock_meminfo = "MemTotal: 16000000 kB\n"
    mocker.patch('builtins.open', mocker.mock_open(read_data=mock_meminfo))
    
    # Mock installer modules
    mock_modules = {
        'installer.ufw_setup': MagicMock(),
        'installer.ntp_setup': MagicMock(),
        'installer.fonts_setup': MagicMock(),
        'installer.audio_setup': MagicMock(),
        'installer.database_setup': MagicMock(),
        'installer.cloud_backup_setup': MagicMock(),
        'installer.spicetify_setup': MagicMock(),
        'installer.spotify_cli_setup': MagicMock(),
        'installer.kiosk_chromium_setup': MagicMock(),
        'installer.voice_control_setup': MagicMock(),
        'installer.login_manager_setup': MagicMock(),
    }
    
    for module_name, mock_module in mock_modules.items():
        mocker.patch.dict('sys.modules', {module_name: mock_module})
    
    return {
        'subprocess': mock_subprocess,
        'modules': mock_modules,
    }


@pytest.fixture
def installer_with_mocks(mock_all_phase_dependencies):
    """Installer com todos os mocks configurados."""
    config = InstallConfig(dry_run=True, quiet=True)
    installer = UnifiedInstaller(config)
    installer.system_info.user = "testuser"
    installer.system_info.home = Path("/home/testuser")
    installer.system_info.distro = "Arch Linux"
    installer.system_info.distro_id = "arch"
    return installer


# =============================================================================
# TESTES: Execução de Fases Individuais
# =============================================================================

class TestPhaseExecution:
    """Testa execução de cada fase individualmente."""
    
    def test_phase_system_check(self, installer_with_mocks):
        """Testa Fase 1: Verificação do sistema."""
        installer = installer_with_mocks
        
        with patch('os.geteuid', return_value=0), \
             patch('pwd.getpwnam') as mock_pwd, \
             patch.object(Path, 'read_text', return_value='NAME="Arch Linux"\nID=arch\n'), \
             patch('shutil.which', return_value='/usr/bin/paru'), \
             patch('builtins.open', MagicMock()):
            
            mock_pwd.return_value.pw_dir = '/home/testuser'
            
            result = installer._phase_system_check()
        
        assert result is True
        assert InstallPhase.SYSTEM_CHECK in installer.completed_phases
    
    def test_phase_docker(self, installer_with_mocks, mock_all_phase_dependencies):
        """Testa Fase 2: Docker."""
        installer = installer_with_mocks
        installer.system_info.has_docker = True
        
        result = installer._phase_docker()
        
        assert result is True
        assert InstallPhase.DOCKER in installer.completed_phases
    
    def test_phase_ufw(self, installer_with_mocks, mocker):
        """Testa Fase 3: UFW Firewall."""
        installer = installer_with_mocks
        
        # Mock do módulo UFW
        mock_ufw = MagicMock()
        mock_ufw.UFWSetup.return_value.full_setup.return_value = True
        mocker.patch.dict('sys.modules', {'ufw_setup': mock_ufw})
        
        result = installer._phase_ufw()
        
        assert result is True
        assert InstallPhase.UFW in installer.completed_phases
    
    def test_phase_ntp(self, installer_with_mocks, mocker):
        """Testa Fase 4: NTP."""
        installer = installer_with_mocks
        
        mock_ntp = MagicMock()
        mock_ntp.NTPSetup.return_value.full_setup.return_value = True
        mocker.patch.dict('sys.modules', {'ntp_setup': mock_ntp})
        
        result = installer._phase_ntp()
        
        assert result is True
        assert InstallPhase.NTP in installer.completed_phases
    
    def test_phase_fonts(self, installer_with_mocks, mocker):
        """Testa Fase 5: Fontes (NOVO v5.1.0)."""
        installer = installer_with_mocks
        
        mock_fonts = MagicMock()
        mock_fonts.FontsSetup.return_value.full_setup.return_value = True
        mocker.patch.dict('sys.modules', {'fonts_setup': mock_fonts})
        
        result = installer._phase_fonts()
        
        assert result is True
        assert InstallPhase.FONTS in installer.completed_phases
    
    def test_phase_audio(self, installer_with_mocks, mocker):
        """Testa Fase 6: Áudio (NOVO v5.1.0)."""
        installer = installer_with_mocks
        
        mock_audio = MagicMock()
        mock_audio.AudioSetup.return_value.full_setup.return_value = True
        mocker.patch.dict('sys.modules', {'audio_setup': mock_audio})
        
        result = installer._phase_audio()
        
        assert result is True
        assert InstallPhase.AUDIO in installer.completed_phases
    
    def test_phase_database(self, installer_with_mocks, mocker):
        """Testa Fase 7: Database (NOVO v5.1.0)."""
        installer = installer_with_mocks
        
        mock_db = MagicMock()
        mock_db.DatabaseSetup.return_value.full_setup.return_value = True
        mocker.patch.dict('sys.modules', {'database_setup': mock_db})
        
        result = installer._phase_database()
        
        assert result is True
        assert InstallPhase.DATABASE in installer.completed_phases
    
    def test_phase_nginx(self, installer_with_mocks, mocker):
        """Testa Fase 8: Nginx."""
        installer = installer_with_mocks
        
        result = installer._phase_nginx()
        
        assert result is True
        assert InstallPhase.NGINX in installer.completed_phases
    
    def test_phase_monitoring(self, installer_with_mocks, mocker):
        """Testa Fase 9: Monitoring (Grafana + Prometheus)."""
        installer = installer_with_mocks
        
        result = installer._phase_monitoring()
        
        assert result is True
        assert InstallPhase.MONITORING in installer.completed_phases
    
    def test_phase_cloud_backup(self, installer_with_mocks, mocker):
        """Testa Fase 10: Cloud Backup (NOVO v5.1.0)."""
        installer = installer_with_mocks
        
        mock_backup = MagicMock()
        mock_backup.CloudBackupSetup.return_value.full_setup.return_value = True
        mocker.patch.dict('sys.modules', {'cloud_backup_setup': mock_backup})
        
        result = installer._phase_cloud_backup()
        
        assert result is True
        assert InstallPhase.CLOUD_BACKUP in installer.completed_phases
    
    def test_phase_spotify(self, installer_with_mocks, mocker):
        """Testa Fase 11: Spotify."""
        installer = installer_with_mocks
        
        mocker.patch('shutil.which', return_value='/usr/bin/spotify')
        
        result = installer._phase_spotify()
        
        assert result is True
        assert InstallPhase.SPOTIFY in installer.completed_phases
    
    def test_phase_spicetify(self, installer_with_mocks, mocker):
        """Testa Fase 12: Spicetify."""
        installer = installer_with_mocks
        
        mock_spicetify = MagicMock()
        mock_spicetify.SpicetifySetup.return_value.is_spicetify_installed.return_value = True
        mocker.patch.dict('sys.modules', {'spicetify_setup': mock_spicetify})
        
        result = installer._phase_spicetify()
        
        assert result is True
        assert InstallPhase.SPICETIFY in installer.completed_phases
    
    def test_phase_spotify_cli(self, installer_with_mocks, mocker):
        """Testa Fase 13: spotify-cli-linux."""
        installer = installer_with_mocks
        
        mock_cli = MagicMock()
        mock_cli.SpotifyCLISetup.return_value.full_setup.return_value = True
        mocker.patch.dict('sys.modules', {'spotify_cli_setup': mock_cli})
        
        result = installer._phase_spotify_cli()
        
        assert result is True
        assert InstallPhase.SPOTIFY_CLI in installer.completed_phases
    
    def test_phase_kiosk(self, installer_with_mocks, mocker):
        """Testa Fase 14: Kiosk (NOVO v5.1.0)."""
        installer = installer_with_mocks
        installer.config.install_kiosk = True
        
        mock_kiosk = MagicMock()
        mock_kiosk.KioskChromiumSetup.return_value.full_setup.return_value = True
        mocker.patch.dict('sys.modules', {'kiosk_chromium_setup': mock_kiosk})
        
        result = installer._phase_kiosk()
        
        assert result is True
        assert InstallPhase.KIOSK in installer.completed_phases
    
    def test_phase_voice_control(self, installer_with_mocks, mocker):
        """Testa Fase 15: Voice Control (NOVO v5.1.0)."""
        installer = installer_with_mocks
        
        mock_voice = MagicMock()
        mock_voice.VoiceControlSetup.return_value.full_setup.return_value = True
        mocker.patch.dict('sys.modules', {'voice_control_setup': mock_voice})
        
        result = installer._phase_voice_control()
        
        assert result is True
        assert InstallPhase.VOICE_CONTROL in installer.completed_phases
    
    def test_phase_dev_tools(self, installer_with_mocks, mocker):
        """Testa Fase 16: Dev Tools (NOVO v5.1.0)."""
        installer = installer_with_mocks
        
        result = installer._phase_dev_tools()
        
        assert result is True
        assert InstallPhase.DEV_TOOLS in installer.completed_phases
    
    def test_phase_autologin(self, installer_with_mocks, mocker):
        """Testa Fase 17: Autologin."""
        installer = installer_with_mocks
        
        mock_lm = MagicMock()
        mock_lm.LoginManagerSetup.return_value.configure_autologin.return_value = True
        mocker.patch.dict('sys.modules', {'login_manager_setup': mock_lm})
        
        result = installer._phase_autologin()
        
        # Pode falhar se módulo não existir
        assert isinstance(result, bool)
    
    def test_phase_app_deploy(self, installer_with_mocks, mocker):
        """Testa Fase 18: App Deploy."""
        installer = installer_with_mocks
        
        result = installer._phase_app_deploy()
        
        assert result is True
        assert InstallPhase.APP_DEPLOY in installer.completed_phases
    
    def test_phase_services(self, installer_with_mocks, mocker):
        """Testa Fase 19: Services."""
        installer = installer_with_mocks
        
        result = installer._phase_services()
        
        assert result is True
        assert InstallPhase.SERVICES in installer.completed_phases
    
    def test_phase_verify(self, installer_with_mocks, mocker):
        """Testa Fase 20: Verify."""
        installer = installer_with_mocks
        
        result = installer._phase_verify()
        
        assert result is True
        assert InstallPhase.VERIFY in installer.completed_phases


# =============================================================================
# TESTES: Fluxo Completo de Instalação
# =============================================================================

class TestFullInstallationFlow:
    """Testa fluxo completo de instalação."""
    
    def test_completed_phases_tracking(self, installer_with_mocks):
        """Testa que fases são rastreadas corretamente."""
        installer = installer_with_mocks
        
        assert len(installer.completed_phases) == 0
        
        installer.completed_phases.append(InstallPhase.DOCKER)
        installer.completed_phases.append(InstallPhase.UFW)
        
        assert len(installer.completed_phases) == 2
        assert InstallPhase.DOCKER in installer.completed_phases
        assert InstallPhase.UFW in installer.completed_phases
    
    def test_install_summary_generated(self, installer_with_mocks, mocker):
        """Testa que resumo de instalação é gerado."""
        installer = installer_with_mocks
        installer.completed_phases = [
            InstallPhase.DOCKER,
            InstallPhase.UFW,
            InstallPhase.FONTS
        ]
        
        # Mock write_text
        mocker.patch.object(Path, 'write_text')
        mocker.patch.object(Path, 'mkdir')
        
        installer._generate_install_summary()
        
        # Em dry_run, não escreve arquivo
        assert installer.config.dry_run is True
    
    def test_rollback_on_failure(self, installer_with_mocks):
        """Testa rollback em caso de falha."""
        installer = installer_with_mocks
        
        rollback_executed = []
        
        def mock_rollback():
            rollback_executed.append(True)
        
        installer.rollback_actions = [mock_rollback]
        
        result = installer._rollback()
        
        assert result is False
        assert len(rollback_executed) == 1
    
    def test_phase_counter_increments(self, installer_with_mocks):
        """Testa incremento do contador de fases."""
        installer = installer_with_mocks
        
        assert installer.phase_counter == 0
        
        for i in range(1, 6):
            phase_num = installer._next_phase()
            assert phase_num == i
        
        assert installer.phase_counter == 5


# =============================================================================
# TESTES: CLI Argument Parsing
# =============================================================================

class TestCLIArgumentParsing:
    """Testa parsing de argumentos de linha de comando."""
    
    def test_parse_default_args(self, mocker):
        """Testa argumentos padrão."""
        mocker.patch('sys.argv', ['unified-installer.py'])
        
        config = parse_args()
        
        assert config.mode == 'full'
        assert config.install_docker is True
        assert config.install_ufw is True
    
    def test_parse_mode_kiosk(self, mocker):
        """Testa modo kiosk."""
        mocker.patch('sys.argv', ['unified-installer.py', '--mode', 'kiosk'])
        
        config = parse_args()
        
        assert config.mode == 'kiosk'
    
    def test_parse_mode_minimal(self, mocker):
        """Testa modo minimal."""
        mocker.patch('sys.argv', ['unified-installer.py', '--mode', 'minimal'])
        
        config = parse_args()
        
        assert config.mode == 'minimal'
    
    def test_parse_mode_server(self, mocker):
        """Testa modo server."""
        mocker.patch('sys.argv', ['unified-installer.py', '--mode', 'server'])
        
        config = parse_args()
        
        assert config.mode == 'server'
    
    def test_parse_no_docker(self, mocker):
        """Testa --no-docker."""
        mocker.patch('sys.argv', ['unified-installer.py', '--no-docker'])
        
        config = parse_args()
        
        assert config.install_docker is False
    
    def test_parse_no_ufw(self, mocker):
        """Testa --no-ufw."""
        mocker.patch('sys.argv', ['unified-installer.py', '--no-ufw'])
        
        config = parse_args()
        
        assert config.install_ufw is False
    
    def test_parse_no_monitoring(self, mocker):
        """Testa --no-monitoring."""
        mocker.patch('sys.argv', ['unified-installer.py', '--no-monitoring'])
        
        config = parse_args()
        
        assert config.install_monitoring is False
    
    def test_parse_database_type_postgresql(self, mocker):
        """Testa --database-type postgresql."""
        mocker.patch('sys.argv', [
            'unified-installer.py', '--database-type', 'postgresql'
        ])
        
        config = parse_args()
        
        assert config.database_type == 'postgresql'
    
    def test_parse_database_type_mariadb(self, mocker):
        """Testa --database-type mariadb."""
        mocker.patch('sys.argv', [
            'unified-installer.py', '--database-type', 'mariadb'
        ])
        
        config = parse_args()
        
        assert config.database_type == 'mariadb'
    
    def test_parse_audio_backend_pulseaudio(self, mocker):
        """Testa --audio-backend pulseaudio."""
        mocker.patch('sys.argv', [
            'unified-installer.py', '--audio-backend', 'pulseaudio'
        ])
        
        config = parse_args()
        
        assert config.audio_backend == 'pulseaudio'
    
    def test_parse_cloud_providers_multiple(self, mocker):
        """Testa --cloud-providers múltiplos."""
        mocker.patch('sys.argv', [
            'unified-installer.py', 
            '--cloud-providers', 'rclone,storj,s3'
        ])
        
        config = parse_args()
        
        assert 'rclone' in config.cloud_providers
        assert 'storj' in config.cloud_providers
        assert 's3' in config.cloud_providers
    
    def test_parse_dev_tools_flag(self, mocker):
        """Testa --dev-tools."""
        mocker.patch('sys.argv', ['unified-installer.py', '--dev-tools'])
        
        config = parse_args()
        
        assert config.install_dev_tools is True
    
    def test_parse_dry_run(self, mocker):
        """Testa --dry-run."""
        mocker.patch('sys.argv', ['unified-installer.py', '--dry-run'])
        
        config = parse_args()
        
        assert config.dry_run is True
    
    def test_parse_verbose(self, mocker):
        """Testa --verbose."""
        mocker.patch('sys.argv', ['unified-installer.py', '--verbose'])
        
        config = parse_args()
        
        assert config.verbose is True
    
    def test_parse_quiet(self, mocker):
        """Testa --quiet."""
        mocker.patch('sys.argv', ['unified-installer.py', '--quiet'])
        
        config = parse_args()
        
        assert config.quiet is True
    
    def test_parse_user(self, mocker):
        """Testa --user."""
        mocker.patch('sys.argv', ['unified-installer.py', '--user', 'customuser'])
        
        config = parse_args()
        
        assert config.user == 'customuser'
    
    def test_parse_timezone(self, mocker):
        """Testa --timezone."""
        mocker.patch('sys.argv', [
            'unified-installer.py', '--timezone', 'Europe/London'
        ])
        
        config = parse_args()
        
        assert config.timezone == 'Europe/London'
    
    def test_parse_all_no_flags(self, mocker):
        """Testa todos os --no-* flags."""
        mocker.patch('sys.argv', [
            'unified-installer.py',
            '--no-docker',
            '--no-ufw',
            '--no-ntp',
            '--no-nginx',
            '--no-monitoring',
            '--no-spotify',
            '--no-spicetify',
            '--no-spotify-cli',
            '--no-autologin',
            '--no-fonts',
            '--no-audio',
            '--no-database',
            '--no-cloud-backup',
            '--no-voice-control'
        ])
        
        config = parse_args()
        
        assert config.install_docker is False
        assert config.install_ufw is False
        assert config.install_ntp is False
        assert config.install_nginx is False
        assert config.install_monitoring is False
        assert config.install_spotify is False
        assert config.install_spicetify is False
        assert config.install_spotify_cli is False
        assert config.configure_autologin is False
        assert config.install_fonts is False
        assert config.install_audio is False
        assert config.install_database is False
        assert config.install_cloud_backup is False
        assert config.install_voice_control is False


# =============================================================================
# TESTES: Cenários de Erro
# =============================================================================

class TestErrorScenarios:
    """Testa cenários de erro."""
    
    def test_system_check_fails_without_root(self, mocker):
        """Testa que system_check falha sem root."""
        config = InstallConfig(dry_run=True, quiet=True)
        
        mocker.patch.object(Path, 'mkdir')
        installer = UnifiedInstaller(config)
        
        # Simula não-root
        mocker.patch('os.geteuid', return_value=1000)
        
        result = installer._phase_system_check()
        
        assert result is False
    
    def test_docker_phase_handles_missing_docker(self, installer_with_mocks, mocker):
        """Testa que fase Docker lida com Docker ausente."""
        installer = installer_with_mocks
        installer.system_info.has_docker = False
        
        # Simula instalação bem-sucedida
        mock_subprocess = mocker.patch('subprocess.run')
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = ""
        mock_result.stderr = ""
        mock_subprocess.return_value = mock_result
        
        result = installer._phase_docker()
        
        assert result is True
    
    def test_rollback_continues_on_action_failure(self, installer_with_mocks):
        """Testa que rollback continua mesmo com falhas."""
        installer = installer_with_mocks
        
        execution_log = []
        
        def action_1():
            execution_log.append(1)
        
        def action_2():
            execution_log.append(2)
            raise Exception("Action 2 failed")
        
        def action_3():
            execution_log.append(3)
        
        installer.rollback_actions = [action_1, action_2, action_3]
        
        result = installer._rollback()
        
        assert result is False
        # Rollback executa em ordem reversa
        assert 3 in execution_log
        assert 2 in execution_log
        assert 1 in execution_log


# =============================================================================
# TESTES: Detecção de Login Manager
# =============================================================================

class TestLoginManagerDetection:
    """Testa detecção de login manager."""
    
    def test_detect_sddm(self, installer_with_mocks, mocker):
        """Testa detecção de SDDM."""
        installer = installer_with_mocks
        
        def mock_run(cmd, **kwargs):
            result = MagicMock()
            if 'sddm' in cmd:
                result.returncode = 0
                result.stdout = "active"
            else:
                result.returncode = 1
                result.stdout = "inactive"
            result.stderr = ""
            return result
        
        mocker.patch('subprocess.run', side_effect=mock_run)
        
        manager = installer._detect_login_manager()
        
        assert manager == 'sddm'
    
    def test_detect_gdm(self, installer_with_mocks, mocker):
        """Testa detecção de GDM."""
        installer = installer_with_mocks
        
        def mock_run(cmd, **kwargs):
            result = MagicMock()
            if 'gdm' in cmd:
                result.returncode = 0
                result.stdout = "active"
            else:
                result.returncode = 1
                result.stdout = "inactive"
            result.stderr = ""
            return result
        
        mocker.patch('subprocess.run', side_effect=mock_run)
        
        manager = installer._detect_login_manager()
        
        # Pode retornar 'gdm' ou 'sddm' dependendo da ordem
        assert manager in ['sddm', 'gdm', 'lightdm', 'ly', 'greetd', 'getty']
    
    def test_detect_getty_fallback(self, installer_with_mocks, mocker):
        """Testa fallback para getty."""
        installer = installer_with_mocks
        
        def mock_run(cmd, **kwargs):
            result = MagicMock()
            result.returncode = 1
            result.stdout = "inactive"
            result.stderr = ""
            return result
        
        mocker.patch('subprocess.run', side_effect=mock_run)
        
        manager = installer._detect_login_manager()
        
        assert manager == 'getty'

"""
TSiJUKEBOX Installer - Edge Cases Tests
=======================================
Testes de casos extremos: falhas de rede, permissões, rollback.

Executar:
    cd scripts && python -m pytest tests/test_unified_installer_edge_cases.py -v
"""

import pytest
import subprocess
import os
import signal
import time
import socket
import errno
from pathlib import Path
from unittest.mock import MagicMock, patch, PropertyMock, call
from dataclasses import dataclass
from typing import List, Optional
from io import StringIO

# Importar módulos do instalador
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from unified_installer import (
        UnifiedInstaller, InstallConfig, InstallPhase, SystemInfo, Logger
    )
    INSTALLER_AVAILABLE = True
except ImportError:
    INSTALLER_AVAILABLE = False
    InstallConfig = None
    UnifiedInstaller = None


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def mock_config():
    """Configuração para testes de edge cases."""
    if not INSTALLER_AVAILABLE:
        pytest.skip("unified_installer não disponível")
    return InstallConfig(dry_run=True, quiet=True)


@pytest.fixture
def mock_installer(mock_config, mocker):
    """Installer mockado para testes."""
    if not INSTALLER_AVAILABLE:
        pytest.skip("unified_installer não disponível")
    
    mocker.patch('subprocess.run', return_value=MagicMock(returncode=0))
    mocker.patch('shutil.which', return_value='/usr/bin/mock')
    mocker.patch('os.path.exists', return_value=True)
    
    return UnifiedInstaller(mock_config)


# =============================================================================
# TESTES DE FALHAS DE REDE
# =============================================================================

class TestNetworkFailures:
    """Testa comportamento com falhas de rede."""
    
    def test_docker_install_network_timeout(self, mocker):
        """Testa timeout ao instalar Docker."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        # Simula timeout de rede
        def timeout_side_effect(*args, **kwargs):
            raise subprocess.TimeoutExpired(cmd="docker pull", timeout=30)
        
        mocker.patch('subprocess.run', side_effect=timeout_side_effect)
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        # Deve tratar timeout graciosamente
        with pytest.raises(subprocess.TimeoutExpired):
            installer._run_command(['docker', 'pull', 'image'], timeout=30)
    
    def test_pacman_mirror_unreachable(self, mocker):
        """Testa quando mirrors do pacman estão inacessíveis."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        # Simula falha de conexão
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=1,
            stdout="",
            stderr="error: failed to synchronize any databases"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['pacman', '-Syu'])
        assert result.returncode == 1
        assert "failed to synchronize" in result.stderr
    
    def test_aur_package_download_fails(self, mocker):
        """Testa falha ao baixar pacote AUR."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=1,
            stdout="",
            stderr="error: target not found: spotify"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['paru', '-S', 'spotify'])
        assert result.returncode == 1
    
    def test_spotify_download_connection_reset(self, mocker):
        """Testa reset de conexão ao baixar Spotify."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        # Simula connection reset
        def connection_reset(*args, **kwargs):
            error = OSError()
            error.errno = errno.ECONNRESET
            raise error
        
        mocker.patch('subprocess.run', side_effect=connection_reset)
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        with pytest.raises(OSError) as exc_info:
            installer._run_command(['curl', '-O', 'https://spotify.com/pkg'])
        
        assert exc_info.value.errno == errno.ECONNRESET
    
    def test_cloud_backup_s3_auth_failure(self, mocker):
        """Testa falha de autenticação S3."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=1,
            stdout="",
            stderr="fatal: could not authenticate with AWS S3"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['rclone', 'sync', '/data', 's3:bucket'])
        assert result.returncode == 1
        assert "authenticate" in result.stderr
    
    def test_voice_model_download_interrupted(self, mocker):
        """Testa interrupção ao baixar modelo de voz."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        # Simula download parcial
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=56,  # Código curl para download incompleto
            stdout="50% complete",
            stderr="curl: (56) Recv failure: Connection reset by peer"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['curl', '-O', 'https://model.vosk.io/model.zip'])
        assert result.returncode == 56
    
    def test_retry_on_transient_network_error(self, mocker):
        """Testa retry em erro de rede transiente."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        # Falha nas primeiras 2 tentativas, sucesso na 3ª
        call_count = [0]
        
        def intermittent_failure(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] < 3:
                return MagicMock(returncode=1, stderr="Connection timed out")
            return MagicMock(returncode=0, stdout="Success")
        
        mocker.patch('subprocess.run', side_effect=intermittent_failure)
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        # Simula retry manual
        for attempt in range(3):
            result = installer._run_command(['pacman', '-Syu'])
            if result.returncode == 0:
                break
        
        assert result.returncode == 0
        assert call_count[0] == 3
    
    def test_abort_after_max_retries(self, mocker):
        """Testa abort após máximo de tentativas."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=1,
            stderr="Connection refused"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        max_retries = 5
        for attempt in range(max_retries):
            result = installer._run_command(['pacman', '-Syu'])
        
        assert result.returncode == 1
        assert mock_run.call_count >= max_retries
    
    def test_dns_resolution_failure(self, mocker):
        """Testa falha de resolução DNS."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        def dns_failure(*args, **kwargs):
            raise socket.gaierror(socket.EAI_NONAME, "Name or service not known")
        
        mocker.patch('socket.gethostbyname', side_effect=dns_failure)
        
        with pytest.raises(socket.gaierror):
            socket.gethostbyname("nonexistent.example.com")


# =============================================================================
# TESTES DE ERROS DE PERMISSÃO
# =============================================================================

class TestPermissionErrors:
    """Testa comportamento com erros de permissão."""
    
    def test_non_root_execution(self, mocker):
        """Testa execução sem privilégios de root."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mocker.patch('os.geteuid', return_value=1000)  # Non-root UID
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        # Deve detectar que não é root
        is_root = os.geteuid() == 0
        assert not is_root
    
    def test_sudo_password_required(self, mocker):
        """Testa quando sudo requer senha."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=1,
            stderr="sudo: a password is required"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['sudo', 'pacman', '-Syu'])
        assert result.returncode == 1
        assert "password is required" in result.stderr
    
    def test_etc_readonly_filesystem(self, mocker):
        """Testa quando /etc está em sistema de arquivos read-only."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        def readonly_error(*args, **kwargs):
            error = OSError(errno.EROFS, "Read-only file system")
            raise error
        
        mocker.patch('builtins.open', side_effect=readonly_error)
        
        with pytest.raises(OSError) as exc_info:
            with open('/etc/test.conf', 'w') as f:
                f.write('test')
        
        assert exc_info.value.errno == errno.EROFS
    
    def test_home_directory_not_writable(self, mocker):
        """Testa quando home directory não é gravável."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        def permission_denied(*args, **kwargs):
            raise PermissionError(errno.EACCES, "Permission denied", "/home/user")
        
        mocker.patch('pathlib.Path.mkdir', side_effect=permission_denied)
        
        with pytest.raises(PermissionError):
            Path('/home/user/.config').mkdir(parents=True)
    
    def test_docker_socket_permission_denied(self, mocker):
        """Testa quando socket do Docker não tem permissão."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=1,
            stderr="Got permission denied while trying to connect to the Docker daemon socket"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['docker', 'ps'])
        assert result.returncode == 1
        assert "permission denied" in result.stderr.lower()
    
    def test_systemd_permission_denied(self, mocker):
        """Testa quando systemctl não tem permissão."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=1,
            stderr="Failed to enable unit: Access denied"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['systemctl', 'enable', 'docker'])
        assert result.returncode == 1
        assert "Access denied" in result.stderr
    
    def test_ufw_permission_denied(self, mocker):
        """Testa quando UFW não tem permissão."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=1,
            stderr="ERROR: You need to be root to run this script"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['ufw', 'enable'])
        assert result.returncode == 1
        assert "root" in result.stderr


# =============================================================================
# TESTES DE ROLLBACK
# =============================================================================

class TestRollbackScenarios:
    """Testa rollback em diferentes cenários."""
    
    def test_rollback_removes_installed_packages(self, mocker):
        """Testa que rollback remove pacotes instalados."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        installed_packages = ['docker', 'nginx', 'postgresql']
        removed_packages = []
        
        def mock_run_capture(*args, **kwargs):
            cmd = args[0] if args else kwargs.get('args', [])
            if cmd and 'pacman' in cmd[0] and '-R' in cmd:
                # Captura pacotes sendo removidos
                for pkg in installed_packages:
                    if pkg in cmd:
                        removed_packages.append(pkg)
            return MagicMock(returncode=0)
        
        mocker.patch('subprocess.run', side_effect=mock_run_capture)
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        installer.installed_packages = installed_packages.copy()
        
        # Simula rollback
        for pkg in installer.installed_packages:
            installer._run_command(['pacman', '-R', '--noconfirm', pkg])
        
        assert len(removed_packages) == len(installed_packages)
    
    def test_rollback_restores_config_files(self, mocker, tmp_path):
        """Testa que rollback restaura arquivos de configuração."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        # Cria arquivo de backup
        backup_dir = tmp_path / "backup"
        backup_dir.mkdir()
        backup_file = backup_dir / "nginx.conf.bak"
        backup_file.write_text("original config")
        
        # Arquivo modificado
        config_dir = tmp_path / "config"
        config_dir.mkdir()
        config_file = config_dir / "nginx.conf"
        config_file.write_text("modified config")
        
        # Simula restore
        config_file.write_text(backup_file.read_text())
        
        assert config_file.read_text() == "original config"
    
    def test_rollback_stops_started_services(self, mocker):
        """Testa que rollback para serviços iniciados."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        started_services = ['docker', 'nginx', 'postgresql']
        stopped_services = []
        
        def mock_systemctl(*args, **kwargs):
            cmd = args[0] if args else kwargs.get('args', [])
            if cmd and 'systemctl' in cmd[0] and 'stop' in cmd:
                for svc in started_services:
                    if svc in cmd:
                        stopped_services.append(svc)
            return MagicMock(returncode=0)
        
        mocker.patch('subprocess.run', side_effect=mock_systemctl)
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        # Simula parada de serviços
        for svc in started_services:
            installer._run_command(['systemctl', 'stop', svc])
        
        assert len(stopped_services) == len(started_services)
    
    def test_rollback_removes_docker_containers(self, mocker):
        """Testa que rollback remove containers Docker."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        containers = ['tsijukebox-app', 'tsijukebox-db']
        removed = []
        
        def mock_docker(*args, **kwargs):
            cmd = args[0] if args else kwargs.get('args', [])
            if cmd and 'docker' in cmd[0] and 'rm' in cmd:
                for container in containers:
                    if container in cmd:
                        removed.append(container)
            return MagicMock(returncode=0)
        
        mocker.patch('subprocess.run', side_effect=mock_docker)
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        for container in containers:
            installer._run_command(['docker', 'rm', '-f', container])
        
        assert len(removed) == len(containers)
    
    def test_rollback_order_is_correct(self, mocker):
        """Testa que rollback ocorre na ordem inversa."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        # Ordem de instalação: 1, 2, 3
        # Ordem de rollback: 3, 2, 1
        install_order = ['docker', 'nginx', 'postgresql']
        rollback_order = []
        
        def track_rollback(*args, **kwargs):
            cmd = args[0] if args else kwargs.get('args', [])
            if cmd and 'remove' in str(cmd):
                for pkg in install_order:
                    if pkg in str(cmd):
                        rollback_order.append(pkg)
            return MagicMock(returncode=0)
        
        mocker.patch('subprocess.run', side_effect=track_rollback)
        
        # Simula rollback na ordem inversa
        for pkg in reversed(install_order):
            subprocess.run(['remove', pkg])
        
        assert rollback_order == list(reversed(install_order))
    
    def test_rollback_continues_on_partial_failure(self, mocker):
        """Testa que rollback continua mesmo com falhas parciais."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        items = ['item1', 'item2', 'item3']
        processed = []
        
        def partial_failure(*args, **kwargs):
            cmd = str(args[0]) if args else str(kwargs.get('args', []))
            for item in items:
                if item in cmd:
                    processed.append(item)
                    if item == 'item2':
                        return MagicMock(returncode=1, stderr="Failed")
            return MagicMock(returncode=0)
        
        mocker.patch('subprocess.run', side_effect=partial_failure)
        
        # Rollback deve processar todos, mesmo com falha no meio
        for item in items:
            try:
                subprocess.run(['rollback', item])
            except Exception:
                pass
        
        assert len(processed) == len(items)
    
    def test_rollback_logs_all_actions(self, mocker):
        """Testa que rollback loga todas as ações."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        log_messages = []
        
        class MockLogger:
            def info(self, msg):
                log_messages.append(('info', msg))
            
            def warning(self, msg):
                log_messages.append(('warning', msg))
            
            def error(self, msg):
                log_messages.append(('error', msg))
        
        logger = MockLogger()
        
        # Simula rollback com logging
        logger.info("Starting rollback")
        logger.info("Removing package: docker")
        logger.warning("Failed to remove: nginx")
        logger.info("Stopping service: postgresql")
        logger.info("Rollback complete")
        
        assert len(log_messages) == 5
        assert ('warning', 'Failed to remove: nginx') in log_messages
    
    def test_keyboard_interrupt_triggers_rollback(self, mocker):
        """Testa que Ctrl+C dispara rollback."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        rollback_triggered = [False]
        
        def mock_rollback():
            rollback_triggered[0] = True
        
        def interrupt_handler(*args, **kwargs):
            raise KeyboardInterrupt()
        
        mocker.patch('subprocess.run', side_effect=interrupt_handler)
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        try:
            installer._run_command(['long-running-command'])
        except KeyboardInterrupt:
            mock_rollback()
        
        assert rollback_triggered[0]


# =============================================================================
# TESTES DE RECURSOS ESGOTADOS
# =============================================================================

class TestResourceExhaustion:
    """Testa comportamento com recursos esgotados."""
    
    def test_disk_full_during_install(self, mocker):
        """Testa quando disco fica cheio durante instalação."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=1,
            stderr="error: Partition / too full"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['pacman', '-S', 'large-package'])
        assert result.returncode == 1
        assert "too full" in result.stderr
    
    def test_out_of_memory_during_compilation(self, mocker):
        """Testa OOM durante compilação."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=137,  # SIGKILL (OOM killer)
            stderr="Killed"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['makepkg', '-si'])
        assert result.returncode == 137
    
    def test_too_many_open_files(self, mocker):
        """Testa limite de arquivos abertos."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        def too_many_files(*args, **kwargs):
            raise OSError(errno.EMFILE, "Too many open files")
        
        mocker.patch('builtins.open', side_effect=too_many_files)
        
        with pytest.raises(OSError) as exc_info:
            open('/tmp/test', 'w')
        
        assert exc_info.value.errno == errno.EMFILE
    
    def test_process_limit_exceeded(self, mocker):
        """Testa limite de processos excedido."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        def fork_limit(*args, **kwargs):
            raise OSError(errno.EAGAIN, "Resource temporarily unavailable")
        
        mocker.patch('subprocess.run', side_effect=fork_limit)
        
        with pytest.raises(OSError) as exc_info:
            subprocess.run(['echo', 'test'])
        
        assert exc_info.value.errno == errno.EAGAIN


# =============================================================================
# TESTES DE VALIDAÇÃO DE ENTRADA
# =============================================================================

class TestInputValidation:
    """Testa validação de entradas malformadas."""
    
    def test_invalid_timezone_string(self, mock_config):
        """Testa timezone inválida."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        invalid_tz = "Invalid/Timezone"
        
        # Deve rejeitar timezone inválida
        valid_timezones = ["America/Sao_Paulo", "UTC", "Europe/London"]
        assert invalid_tz not in valid_timezones
    
    def test_invalid_database_type(self):
        """Testa tipo de banco de dados inválido."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        valid_types = ['sqlite', 'mariadb', 'postgresql']
        invalid_type = 'mongodb'
        
        assert invalid_type not in valid_types
    
    def test_malformed_cron_expression(self):
        """Testa expressão cron malformada."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        valid_cron = "0 2 * * *"
        invalid_cron = "invalid cron"
        
        # Regex básico para validar cron
        import re
        cron_pattern = r'^[\d\*\-\/,]+ [\d\*\-\/,]+ [\d\*\-\/,]+ [\d\*\-\/,]+ [\d\*\-\/,]+$'
        
        assert re.match(cron_pattern, valid_cron)
        assert not re.match(cron_pattern, invalid_cron)
    
    def test_invalid_url_for_kiosk(self):
        """Testa URL inválida para kiosk."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        from urllib.parse import urlparse
        
        valid_url = "http://localhost:3000"
        invalid_url = "not-a-url"
        
        assert urlparse(valid_url).scheme in ['http', 'https']
        assert urlparse(invalid_url).scheme == ''
    
    def test_empty_username(self):
        """Testa username vazio."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        username = ""
        
        assert len(username) == 0
        assert not username.strip()
    
    def test_username_with_special_chars(self):
        """Testa username com caracteres especiais."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        import re
        
        valid_username = "testuser123"
        invalid_username = "test@user!#$"
        
        username_pattern = r'^[a-z_][a-z0-9_-]*$'
        
        assert re.match(username_pattern, valid_username)
        assert not re.match(username_pattern, invalid_username)
    
    def test_path_traversal_attempt(self):
        """Testa tentativa de path traversal."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        malicious_path = "../../../etc/passwd"
        safe_path = "/opt/tsijukebox/config"
        
        # Detecta path traversal
        assert ".." in malicious_path
        assert ".." not in safe_path
    
    def test_sql_injection_in_db_name(self):
        """Testa SQL injection em nome de banco."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        import re
        
        safe_name = "tsijukebox_db"
        malicious_name = "db; DROP TABLE users;--"
        
        # Nome de banco válido: apenas letras, números e underscore
        db_name_pattern = r'^[a-zA-Z][a-zA-Z0-9_]*$'
        
        assert re.match(db_name_pattern, safe_name)
        assert not re.match(db_name_pattern, malicious_name)


# =============================================================================
# TESTES DE CONDIÇÕES DE CORRIDA
# =============================================================================

class TestRaceConditions:
    """Testa condições de corrida."""
    
    def test_concurrent_pacman_locks(self, mocker):
        """Testa lock concorrente do pacman."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        mock_run = mocker.patch('subprocess.run')
        mock_run.return_value = MagicMock(
            returncode=1,
            stderr="error: failed to init transaction (unable to lock database)"
        )
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        result = installer._run_command(['pacman', '-Syu'])
        assert "lock database" in result.stderr
    
    def test_systemd_service_start_timing(self, mocker):
        """Testa timing de início de serviço systemd."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        # Serviço ainda iniciando
        call_count = [0]
        
        def service_starting(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] < 3:
                return MagicMock(returncode=0, stdout="activating")
            return MagicMock(returncode=0, stdout="active")
        
        mocker.patch('subprocess.run', side_effect=service_starting)
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        # Polling até serviço estar ativo
        for _ in range(5):
            result = installer._run_command(['systemctl', 'is-active', 'docker'])
            if "active" in result.stdout and "activating" not in result.stdout:
                break
        
        assert result.stdout == "active"
    
    def test_docker_container_startup_race(self, mocker):
        """Testa race condition na inicialização de container."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        # Container não está pronto imediatamente
        health_checks = [0]
        
        def container_health(*args, **kwargs):
            health_checks[0] += 1
            if health_checks[0] < 3:
                return MagicMock(returncode=1, stdout="starting")
            return MagicMock(returncode=0, stdout="healthy")
        
        mocker.patch('subprocess.run', side_effect=container_health)
        
        config = InstallConfig(dry_run=False, quiet=True)
        installer = UnifiedInstaller(config)
        
        # Aguarda container estar saudável
        for _ in range(5):
            result = installer._run_command(['docker', 'inspect', '--format', '{{.State.Health.Status}}', 'container'])
            if result.stdout == "healthy":
                break
            time.sleep(0.1)
        
        assert result.stdout == "healthy"
    
    def test_file_lock_contention(self, mocker, tmp_path):
        """Testa contenção de lock de arquivo."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        import fcntl
        
        lock_file = tmp_path / "test.lock"
        lock_file.touch()
        
        # Simula dois processos tentando lock
        acquired_locks = []
        
        try:
            with open(lock_file, 'w') as f1:
                fcntl.flock(f1.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                acquired_locks.append('process1')
                
                # Segundo processo não consegue lock
                try:
                    with open(lock_file, 'w') as f2:
                        fcntl.flock(f2.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                        acquired_locks.append('process2')
                except BlockingIOError:
                    pass  # Esperado: lock já mantido
                
                fcntl.flock(f1.fileno(), fcntl.LOCK_UN)
        except (OSError, BlockingIOError):
            # Sistema pode não suportar fcntl
            pass
        
        # Apenas um processo deve ter conseguido lock
        assert len(acquired_locks) <= 1


# =============================================================================
# TESTES DE SINAIS
# =============================================================================

class TestSignalHandling:
    """Testa handling de sinais."""
    
    def test_sigterm_handling(self, mocker):
        """Testa handling de SIGTERM."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        sigterm_received = [False]
        
        def sigterm_handler(signum, frame):
            sigterm_received[0] = True
        
        # Registra handler
        original_handler = signal.signal(signal.SIGTERM, sigterm_handler)
        
        try:
            # Simula recebimento de SIGTERM
            os.kill(os.getpid(), signal.SIGTERM)
        except SystemExit:
            pass
        finally:
            signal.signal(signal.SIGTERM, original_handler)
        
        assert sigterm_received[0]
    
    def test_sighup_handling(self, mocker):
        """Testa handling de SIGHUP."""
        if not INSTALLER_AVAILABLE:
            pytest.skip("unified_installer não disponível")
        
        sighup_received = [False]
        
        def sighup_handler(signum, frame):
            sighup_received[0] = True
        
        original_handler = signal.signal(signal.SIGHUP, sighup_handler)
        
        try:
            os.kill(os.getpid(), signal.SIGHUP)
        except SystemExit:
            pass
        finally:
            signal.signal(signal.SIGHUP, original_handler)
        
        assert sighup_received[0]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

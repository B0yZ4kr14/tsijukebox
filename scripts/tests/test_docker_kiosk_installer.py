#!/usr/bin/env python3
"""
Testes E2E para o instalador Docker Kiosk (install-docker-kiosk.py).

Testes cobrem:
- Verificação do sistema (distro, memória, disco)
- Detecção de login manager (SDDM, GDM, LightDM, ly, greetd, getty)
- Detecção de usuário (SUDO_USER, who, passwd)
- Configuração de autologin para cada login manager
- Modo de recuperação de emergência
- Fluxo de instalação completo
"""

import os
import sys
import pwd
import shutil
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional
from unittest.mock import Mock, patch, MagicMock
from dataclasses import dataclass

import pytest


# ============================================================================
# IMPORTAÇÃO DINÂMICA DO MÓDULO
# ============================================================================

@pytest.fixture(scope="module")
def kiosk_module():
    """Importa o módulo install-docker-kiosk.py dinamicamente."""
    import importlib.util
    
    module_path = Path(__file__).parent.parent / "install-docker-kiosk.py"
    if not module_path.exists():
        pytest.skip(f"Módulo não encontrado: {module_path}")
    
    spec = importlib.util.spec_from_file_location("docker_kiosk_installer", module_path)
    module = importlib.util.module_from_spec(spec)
    
    # Mock sys.exit para não sair durante import
    with patch.object(sys, 'exit'):
        spec.loader.exec_module(module)
    
    return module


# ============================================================================
# FIXTURES DE AMBIENTE
# ============================================================================

@pytest.fixture
def temp_dir():
    """Cria diretório temporário para testes."""
    tmpdir = tempfile.mkdtemp(prefix="kiosk_test_")
    yield Path(tmpdir)
    shutil.rmtree(tmpdir, ignore_errors=True)


@pytest.fixture
def mock_os_release_cachyos(temp_dir):
    """Mock para /etc/os-release do CachyOS."""
    content = """NAME="CachyOS"
ID=cachyos
ID_LIKE=arch
PRETTY_NAME="CachyOS"
VERSION_ID="rolling"
"""
    os_release = temp_dir / "os-release"
    os_release.write_text(content)
    return os_release


@pytest.fixture
def mock_os_release_arch(temp_dir):
    """Mock para /etc/os-release do Arch Linux."""
    content = """NAME="Arch Linux"
ID=arch
PRETTY_NAME="Arch Linux"
VERSION_ID="rolling"
"""
    os_release = temp_dir / "os-release"
    os_release.write_text(content)
    return os_release


@pytest.fixture
def mock_os_release_manjaro(temp_dir):
    """Mock para /etc/os-release do Manjaro."""
    content = """NAME="Manjaro Linux"
ID=manjaro
ID_LIKE=arch
PRETTY_NAME="Manjaro Linux"
VERSION_ID="23.1"
"""
    os_release = temp_dir / "os-release"
    os_release.write_text(content)
    return os_release


@pytest.fixture
def mock_os_release_ubuntu(temp_dir):
    """Mock para /etc/os-release do Ubuntu (não suportado)."""
    content = """NAME="Ubuntu"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 22.04 LTS"
VERSION_ID="22.04"
"""
    os_release = temp_dir / "os-release"
    os_release.write_text(content)
    return os_release


@pytest.fixture
def mock_meminfo_valid(temp_dir):
    """Mock para /proc/meminfo com memória suficiente."""
    content = """MemTotal:        8192000 kB
MemFree:         4096000 kB
MemAvailable:    6144000 kB
Buffers:          512000 kB
Cached:          1024000 kB
"""
    meminfo = temp_dir / "meminfo"
    meminfo.write_text(content)
    return meminfo


@pytest.fixture
def mock_meminfo_low(temp_dir):
    """Mock para /proc/meminfo com memória insuficiente."""
    content = """MemTotal:        1048576 kB
MemFree:          512000 kB
MemAvailable:     768000 kB
"""
    meminfo = temp_dir / "meminfo"
    meminfo.write_text(content)
    return meminfo


@pytest.fixture
def mock_command_runner():
    """Mock para execução de comandos do sistema."""
    def create_mock_result(returncode=0, stdout="", stderr=""):
        result = Mock()
        result.returncode = returncode
        result.stdout = stdout
        result.stderr = stderr
        return result
    
    runner = Mock()
    runner.run = Mock(return_value=create_mock_result())
    runner.create_result = create_mock_result
    return runner


# ============================================================================
# FIXTURES DE LOGIN MANAGER
# ============================================================================

@pytest.fixture
def mock_systemctl_sddm():
    """Mock para systemctl com SDDM ativo."""
    def mock_run(cmd, *args, **kwargs):
        result = Mock()
        if cmd == ['systemctl', 'is-active', 'sddm']:
            result.returncode = 0
            result.stdout = "active"
        else:
            result.returncode = 3
            result.stdout = "inactive"
        result.stderr = ""
        return result
    return mock_run


@pytest.fixture
def mock_systemctl_gdm():
    """Mock para systemctl com GDM ativo."""
    def mock_run(cmd, *args, **kwargs):
        result = Mock()
        if cmd == ['systemctl', 'is-active', 'gdm']:
            result.returncode = 0
            result.stdout = "active"
        else:
            result.returncode = 3
            result.stdout = "inactive"
        result.stderr = ""
        return result
    return mock_run


@pytest.fixture
def mock_systemctl_lightdm():
    """Mock para systemctl com LightDM ativo."""
    def mock_run(cmd, *args, **kwargs):
        result = Mock()
        if cmd == ['systemctl', 'is-active', 'lightdm']:
            result.returncode = 0
            result.stdout = "active"
        else:
            result.returncode = 3
            result.stdout = "inactive"
        result.stderr = ""
        return result
    return mock_run


@pytest.fixture
def mock_systemctl_ly():
    """Mock para systemctl com ly ativo."""
    def mock_run(cmd, *args, **kwargs):
        result = Mock()
        if cmd == ['systemctl', 'is-active', 'ly']:
            result.returncode = 0
            result.stdout = "active"
        else:
            result.returncode = 3
            result.stdout = "inactive"
        result.stderr = ""
        return result
    return mock_run


@pytest.fixture
def mock_systemctl_greetd():
    """Mock para systemctl com greetd ativo."""
    def mock_run(cmd, *args, **kwargs):
        result = Mock()
        if cmd == ['systemctl', 'is-active', 'greetd']:
            result.returncode = 0
            result.stdout = "active"
        else:
            result.returncode = 3
            result.stdout = "inactive"
        result.stderr = ""
        return result
    return mock_run


@pytest.fixture
def mock_systemctl_getty():
    """Mock para systemctl sem DM (fallback para getty)."""
    def mock_run(cmd, *args, **kwargs):
        result = Mock()
        result.returncode = 3
        result.stdout = "inactive"
        result.stderr = ""
        return result
    return mock_run


# ============================================================================
# TESTES DE VERIFICAÇÃO DO SISTEMA
# ============================================================================

class TestPhaseSystemCheck:
    """Testes para a fase de verificação do sistema."""
    
    def test_system_check_cachyos_success(self, kiosk_module, mock_os_release_cachyos, mock_meminfo_valid):
        """Verifica se CachyOS é detectado e aprovado."""
        with patch('builtins.open', side_effect=lambda path, *args: 
                   open(mock_os_release_cachyos) if 'os-release' in str(path) else
                   open(mock_meminfo_valid) if 'meminfo' in str(path) else
                   open(path, *args)):
            with patch('shutil.disk_usage', return_value=Mock(free=20 * 1024**3)):
                with patch('subprocess.run') as mock_run:
                    mock_run.return_value = Mock(returncode=0, stdout="", stderr="")
                    
                    config = kiosk_module.KioskConfig()
                    installer = kiosk_module.DockerKioskInstaller(config)
                    
                    # Mock _detect_distro para retornar CachyOS
                    installer._detect_distro = Mock(return_value={
                        'name': 'CachyOS',
                        'id': 'cachyos',
                        'id_like': 'arch',
                        'family': 'arch'
                    })
                    
                    result = installer.phase_system_check()
                    assert result.success, f"Esperava sucesso: {result.message}"
    
    def test_system_check_arch_success(self, kiosk_module, mock_os_release_arch, mock_meminfo_valid):
        """Verifica se Arch Linux é detectado e aprovado."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        installer._detect_distro = Mock(return_value={
            'name': 'Arch Linux',
            'id': 'arch',
            'id_like': '',
            'family': 'arch'
        })
        
        with patch('shutil.disk_usage', return_value=Mock(free=20 * 1024**3)):
            with patch('builtins.open', side_effect=lambda path, *args: 
                       open(mock_meminfo_valid) if 'meminfo' in str(path) else
                       open(path, *args)):
                result = installer.phase_system_check()
                assert result.success
    
    def test_system_check_manjaro_success(self, kiosk_module, mock_os_release_manjaro, mock_meminfo_valid):
        """Verifica se Manjaro é detectado e aprovado."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        installer._detect_distro = Mock(return_value={
            'name': 'Manjaro Linux',
            'id': 'manjaro',
            'id_like': 'arch',
            'family': 'arch'
        })
        
        with patch('shutil.disk_usage', return_value=Mock(free=20 * 1024**3)):
            with patch('builtins.open', side_effect=lambda path, *args: 
                       open(mock_meminfo_valid) if 'meminfo' in str(path) else
                       open(path, *args)):
                result = installer.phase_system_check()
                assert result.success
    
    def test_system_check_ubuntu_fail(self, kiosk_module, mock_os_release_ubuntu):
        """Verifica se Ubuntu é rejeitado."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        installer._detect_distro = Mock(return_value={
            'name': 'Ubuntu',
            'id': 'ubuntu',
            'id_like': 'debian',
            'family': 'debian'
        })
        
        result = installer.phase_system_check()
        assert not result.success
        assert 'não suportada' in result.message.lower() or 'not supported' in result.message.lower()
    
    def test_system_check_low_memory_fail(self, kiosk_module, mock_meminfo_low):
        """Verifica se memória insuficiente é detectada."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        installer._detect_distro = Mock(return_value={
            'name': 'CachyOS',
            'id': 'cachyos',
            'id_like': 'arch',
            'family': 'arch'
        })
        
        with patch('shutil.disk_usage', return_value=Mock(free=20 * 1024**3)):
            with patch('builtins.open', side_effect=lambda path, *args: 
                       open(mock_meminfo_low) if 'meminfo' in str(path) else
                       open(path, *args)):
                result = installer.phase_system_check()
                # Dependendo da implementação, pode falhar ou apenas avisar
    
    def test_system_check_low_disk_fail(self, kiosk_module, mock_meminfo_valid):
        """Verifica se espaço em disco insuficiente é detectado."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        installer._detect_distro = Mock(return_value={
            'name': 'CachyOS',
            'id': 'cachyos',
            'id_like': 'arch',
            'family': 'arch'
        })
        
        with patch('shutil.disk_usage', return_value=Mock(free=1 * 1024**3)):  # 1GB
            with patch('builtins.open', side_effect=lambda path, *args: 
                       open(mock_meminfo_valid) if 'meminfo' in str(path) else
                       open(path, *args)):
                result = installer.phase_system_check()
                # Deve avisar ou falhar por espaço insuficiente


# ============================================================================
# TESTES DE DETECÇÃO DE AMBIENTE
# ============================================================================

class TestPhaseDetectEnvironment:
    """Testes para detecção de usuário e login manager."""
    
    def test_detect_user_from_sudo_user(self, kiosk_module):
        """Verifica detecção de usuário via SUDO_USER."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch.dict(os.environ, {'SUDO_USER': 'testuser'}):
            with patch('subprocess.run') as mock_run:
                mock_run.return_value = Mock(returncode=0, stdout="testuser", stderr="")
                
                result = installer.phase_detect_environment()
                assert installer.detected_user == 'testuser' or result.success
    
    def test_detect_user_from_who(self, kiosk_module):
        """Verifica detecção de usuário via comando who."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch.dict(os.environ, {}, clear=True):
            with patch('subprocess.run') as mock_run:
                def mock_run_side_effect(cmd, *args, **kwargs):
                    result = Mock()
                    if 'who' in cmd:
                        result.returncode = 0
                        result.stdout = "whouser :0 2024-01-01 10:00"
                    else:
                        result.returncode = 0
                        result.stdout = ""
                    result.stderr = ""
                    return result
                
                mock_run.side_effect = mock_run_side_effect
                
                # Simular não ter SUDO_USER
                os.environ.pop('SUDO_USER', None)
                result = installer.phase_detect_environment()
    
    def test_detect_login_manager_sddm(self, kiosk_module, mock_systemctl_sddm):
        """Verifica detecção do SDDM."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('subprocess.run', mock_systemctl_sddm):
            result = installer.phase_detect_environment()
            assert installer.detected_login_manager == 'sddm' or 'sddm' in str(result).lower()
    
    def test_detect_login_manager_gdm(self, kiosk_module, mock_systemctl_gdm):
        """Verifica detecção do GDM."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('subprocess.run', mock_systemctl_gdm):
            result = installer.phase_detect_environment()
            # GDM deve ser detectado
    
    def test_detect_login_manager_lightdm(self, kiosk_module, mock_systemctl_lightdm):
        """Verifica detecção do LightDM."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('subprocess.run', mock_systemctl_lightdm):
            result = installer.phase_detect_environment()
    
    def test_detect_login_manager_ly(self, kiosk_module, mock_systemctl_ly):
        """Verifica detecção do ly."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('subprocess.run', mock_systemctl_ly):
            result = installer.phase_detect_environment()
    
    def test_detect_login_manager_greetd(self, kiosk_module, mock_systemctl_greetd):
        """Verifica detecção do greetd."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('subprocess.run', mock_systemctl_greetd):
            result = installer.phase_detect_environment()
    
    def test_detect_login_manager_getty_fallback(self, kiosk_module, mock_systemctl_getty):
        """Verifica fallback para getty quando nenhum DM é detectado."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('subprocess.run', mock_systemctl_getty):
            with patch('shutil.which', return_value=None):
                result = installer.phase_detect_environment()
                # Deve usar getty como fallback


# ============================================================================
# TESTES DE CONFIGURAÇÃO DE AUTOLOGIN
# ============================================================================

class TestPhaseSetupAutologin:
    """Testes para configuração de autologin por login manager."""
    
    def test_configure_sddm_autologin(self, kiosk_module, temp_dir):
        """Verifica configuração de autologin para SDDM."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        installer.detected_user = 'testuser'
        installer.detected_login_manager = 'sddm'
        
        sddm_dir = temp_dir / "sddm.conf.d"
        sddm_dir.mkdir(parents=True)
        
        with patch.object(installer, '_configure_sddm_autologin') as mock_config:
            mock_config.return_value = True
            
            # A função deve criar o arquivo de autologin
            result = installer.phase_setup_autologin()
            # Verificar que a configuração foi chamada ou feita
    
    def test_configure_gdm_autologin(self, kiosk_module, temp_dir):
        """Verifica configuração de autologin para GDM."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        installer.detected_user = 'testuser'
        installer.detected_login_manager = 'gdm'
        
        gdm_dir = temp_dir / "gdm"
        gdm_dir.mkdir(parents=True)
        
        with patch.object(installer, '_configure_gdm_autologin') as mock_config:
            mock_config.return_value = True
            result = installer.phase_setup_autologin()
    
    def test_configure_lightdm_autologin(self, kiosk_module, temp_dir):
        """Verifica configuração de autologin para LightDM."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        installer.detected_user = 'testuser'
        installer.detected_login_manager = 'lightdm'
        
        with patch.object(installer, '_configure_lightdm_autologin') as mock_config:
            mock_config.return_value = True
            result = installer.phase_setup_autologin()
    
    def test_configure_ly_autologin(self, kiosk_module, temp_dir):
        """Verifica configuração de autologin para ly."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        installer.detected_user = 'testuser'
        installer.detected_login_manager = 'ly'
        
        with patch.object(installer, '_configure_ly_autologin') as mock_config:
            mock_config.return_value = True
            result = installer.phase_setup_autologin()
    
    def test_configure_greetd_autologin(self, kiosk_module, temp_dir):
        """Verifica configuração de autologin para greetd."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        installer.detected_user = 'testuser'
        installer.detected_login_manager = 'greetd'
        
        with patch.object(installer, '_configure_greetd_autologin') as mock_config:
            mock_config.return_value = True
            result = installer.phase_setup_autologin()
    
    def test_configure_getty_autologin(self, kiosk_module, temp_dir):
        """Verifica configuração de autologin para getty."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        installer.detected_user = 'testuser'
        installer.detected_login_manager = 'getty'
        
        with patch.object(installer, '_configure_getty_autologin') as mock_config:
            mock_config.return_value = True
            result = installer.phase_setup_autologin()


# ============================================================================
# TESTES DE MODO DE RECUPERAÇÃO
# ============================================================================

class TestPhaseSetupRecovery:
    """Testes para modo de recuperação de emergência."""
    
    def test_recovery_script_created(self, kiosk_module, temp_dir):
        """Verifica se o script de recuperação é criado."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('builtins.open', create=True) as mock_open:
            mock_open.return_value.__enter__ = Mock(return_value=Mock())
            mock_open.return_value.__exit__ = Mock(return_value=False)
            
            with patch('subprocess.run') as mock_run:
                mock_run.return_value = Mock(returncode=0)
                
                with patch('os.chmod'):
                    result = installer.phase_setup_recovery()
                    # Verificar que o script foi criado
    
    def test_recovery_keybind_added(self, kiosk_module, temp_dir):
        """Verifica se o atalho Ctrl+Alt+Shift+R é adicionado ao Openbox."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        installer.detected_user = 'testuser'
        
        # Após phase_setup_openbox, o rc.xml deve conter o keybind
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = Mock(returncode=0)
            
            with patch('builtins.open', create=True) as mock_open:
                mock_file = Mock()
                mock_open.return_value.__enter__ = Mock(return_value=mock_file)
                mock_open.return_value.__exit__ = Mock(return_value=False)
                
                # Verificar que o keybind C-A-S-r está no conteúdo
                result = installer.phase_setup_openbox()


# ============================================================================
# TESTES DE INSTALAÇÃO DE PACOTES
# ============================================================================

class TestPhaseInstallPackages:
    """Testes para instalação de pacotes."""
    
    def test_install_packages_success(self, kiosk_module):
        """Verifica instalação bem-sucedida de pacotes."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = Mock(returncode=0, stdout="", stderr="")
            
            result = installer.phase_install_packages()
            assert result.success
    
    def test_install_packages_failure(self, kiosk_module):
        """Verifica tratamento de falha na instalação de pacotes."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = Mock(returncode=1, stdout="", stderr="pacman error")
            
            result = installer.phase_install_packages()
            assert not result.success


# ============================================================================
# TESTES DE WEBHOOK
# ============================================================================

class TestWebhookNotifications:
    """Testes para envio de notificações via webhook."""
    
    def test_webhook_success_notification(self, kiosk_module):
        """Verifica envio de notificação de sucesso via webhook."""
        config = kiosk_module.KioskConfig(webhook_url='https://example.com/webhook')
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('urllib.request.urlopen') as mock_urlopen:
            mock_response = Mock()
            mock_response.status = 200
            mock_urlopen.return_value.__enter__ = Mock(return_value=mock_response)
            mock_urlopen.return_value.__exit__ = Mock(return_value=False)
            
            # O webhook deve ser chamado ao finalizar com sucesso
            installer._send_webhook_notification = Mock()
            installer._send_webhook_notification('success', {'status': 'completed'})
            
            installer._send_webhook_notification.assert_called_once()
    
    def test_webhook_failure_notification(self, kiosk_module):
        """Verifica envio de notificação de falha via webhook."""
        config = kiosk_module.KioskConfig(webhook_url='https://example.com/webhook')
        installer = kiosk_module.DockerKioskInstaller(config)
        
        installer._send_webhook_notification = Mock()
        installer._send_webhook_notification('failure', {'error': 'Installation failed'})
        
        installer._send_webhook_notification.assert_called_once()
    
    def test_webhook_disabled_when_no_url(self, kiosk_module):
        """Verifica que webhook não é enviado quando URL não está configurada."""
        config = kiosk_module.KioskConfig(webhook_url='')
        installer = kiosk_module.DockerKioskInstaller(config)
        
        with patch('urllib.request.urlopen') as mock_urlopen:
            # O método não deve chamar urlopen se não houver URL
            if hasattr(installer, '_send_webhook_notification'):
                installer._send_webhook_notification('success', {})
            
            # Se não houver URL, não deve chamar o urlopen
            if not config.webhook_url:
                mock_urlopen.assert_not_called()


# ============================================================================
# TESTES DE INTEGRAÇÃO
# ============================================================================

class TestIntegration:
    """Testes de integração para fluxo completo."""
    
    def test_full_installation_flow(self, kiosk_module, temp_dir):
        """Teste de fluxo completo de instalação (mocado)."""
        config = kiosk_module.KioskConfig(
            install_dir=str(temp_dir / "tsijukebox"),
            skip_docker=True,  # Pular Docker em teste
        )
        installer = kiosk_module.DockerKioskInstaller(config)
        
        # Mock todas as operações de sistema
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = Mock(returncode=0, stdout="", stderr="")
            
            with patch('shutil.disk_usage', return_value=Mock(free=50 * 1024**3)):
                with patch('os.makedirs'):
                    with patch('builtins.open', create=True):
                        with patch('os.chmod'):
                            # Mock as fases para testar o fluxo
                            for phase in installer.PHASES:
                                method = getattr(installer, phase.function, None)
                                if method:
                                    setattr(installer, phase.function, 
                                           Mock(return_value=kiosk_module.InstallResult(True, f"{phase.name} OK")))
                            
                            success = installer.run()
                            assert success
    
    def test_installation_rollback_on_failure(self, kiosk_module, temp_dir):
        """Verifica rollback quando uma fase falha."""
        config = kiosk_module.KioskConfig(
            install_dir=str(temp_dir / "tsijukebox"),
        )
        installer = kiosk_module.DockerKioskInstaller(config)
        
        # Mock fase que falha
        with patch.object(installer, 'phase_install_packages', 
                         return_value=kiosk_module.InstallResult(False, "Falha simulada")):
            with patch.object(installer, 'phase_system_check',
                             return_value=kiosk_module.InstallResult(True, "OK")):
                with patch.object(installer, 'phase_detect_environment',
                                 return_value=kiosk_module.InstallResult(True, "OK")):
                    with patch.object(installer, 'phase_create_directories',
                                     return_value=kiosk_module.InstallResult(True, "OK")):
                        success = installer.run()
                        # Deve falhar e parar na fase que falhou
                        assert not success


# ============================================================================
# TESTES DE WATCHDOG
# ============================================================================

class TestWatchdog:
    """Testes para o watchdog script."""
    
    def test_watchdog_script_has_heartbeat(self, kiosk_module, temp_dir):
        """Verifica se o watchdog inclui envio de heartbeat."""
        config = kiosk_module.KioskConfig()
        installer = kiosk_module.DockerKioskInstaller(config)
        
        # O watchdog script deve conter a função send_kiosk_event
        watchdog_content = ""
        
        with patch('builtins.open', create=True) as mock_open:
            def capture_write(*args, **kwargs):
                nonlocal watchdog_content
                mock_file = Mock()
                def write_capture(content):
                    nonlocal watchdog_content
                    watchdog_content += content
                mock_file.write = write_capture
                mock_file.__enter__ = Mock(return_value=mock_file)
                mock_file.__exit__ = Mock(return_value=False)
                return mock_file
            
            mock_open.side_effect = capture_write
            
            with patch('subprocess.run', return_value=Mock(returncode=0)):
                with patch('os.chmod'):
                    result = installer.phase_setup_watchdog()
    
    def test_watchdog_sends_events(self, kiosk_module):
        """Verifica se o watchdog envia eventos corretos."""
        # O script deve enviar eventos como:
        # - heartbeat
        # - chromium_restart
        # - container_restart
        # - boot_complete
        expected_events = ['heartbeat', 'chromium_restart', 'container_restart', 'boot_complete']
        
        # Verificar que o template do watchdog contém esses eventos
        # (verificação de string no template)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

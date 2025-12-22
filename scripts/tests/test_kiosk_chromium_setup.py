#!/usr/bin/env python3
"""
Testes unitários para kiosk_chromium_setup.py
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent / 'installer'))

from kiosk_chromium_setup import KioskChromiumSetup, KioskChromiumConfig


class TestKioskChromiumConfig:
    """Testes para KioskChromiumConfig."""
    
    def test_default_config(self):
        """Testa configuração padrão."""
        config = KioskChromiumConfig()
        
        assert config.url == "http://localhost:5173"
        assert config.fullscreen is True
        assert config.resolution == "1920x1080"
        assert config.rotation == "normal"
        assert config.hide_cursor is True
        assert config.auto_restart is True
    
    def test_custom_config(self):
        """Testa configuração customizada."""
        config = KioskChromiumConfig(
            url="http://example.com",
            resolution="1280x720",
            rotation="left",
            hide_cursor=False
        )
        
        assert config.url == "http://example.com"
        assert config.resolution == "1280x720"
        assert config.rotation == "left"
        assert config.hide_cursor is False


class TestKioskChromiumSetup:
    """Testes para KioskChromiumSetup."""
    
    @pytest.fixture
    def setup(self):
        """Fixture que cria KioskChromiumSetup em modo dry-run."""
        config = KioskChromiumConfig(user="testuser")
        return KioskChromiumSetup(config=config, dry_run=True)
    
    def test_init_default(self, setup):
        """Testa inicialização padrão."""
        assert setup.config.fullscreen is True
        assert setup.dry_run is True
    
    def test_packages_defined(self, setup):
        """Testa que pacotes estão definidos."""
        assert 'xorg-server' in setup.XORG_PACKAGES
        assert 'openbox' in setup.WM_PACKAGES
        assert 'chromium' in setup.BROWSER_PACKAGES
        assert 'unclutter' in setup.UTILITY_PACKAGES
    
    def test_install_xorg_dry_run(self, setup):
        """Testa instalação de Xorg em dry-run."""
        result = setup.install_xorg()
        assert result is True
    
    def test_install_openbox_dry_run(self, setup):
        """Testa instalação de Openbox em dry-run."""
        result = setup.install_openbox()
        assert result is True
    
    @patch('kiosk_chromium_setup.shutil.which')
    def test_install_chromium_already_installed(self, mock_which, setup):
        """Testa detecção de Chromium já instalado."""
        mock_which.return_value = "/usr/bin/chromium"
        
        result = setup.install_chromium()
        assert result is True
    
    def test_install_utilities_dry_run(self, setup):
        """Testa instalação de utilitários em dry-run."""
        result = setup.install_utilities()
        assert result is True
    
    def test_configure_xinitrc_dry_run(self, setup):
        """Testa configuração de .xinitrc em dry-run."""
        result = setup.configure_xinitrc()
        assert result is True
    
    def test_configure_openbox_autostart_dry_run(self, setup):
        """Testa configuração de Openbox autostart em dry-run."""
        result = setup.configure_openbox_autostart()
        assert result is True
    
    def test_configure_openbox_rc_dry_run(self, setup):
        """Testa configuração de rc.xml em dry-run."""
        result = setup.configure_openbox_rc()
        assert result is True
    
    def test_configure_bash_profile_dry_run(self, setup):
        """Testa configuração de .bash_profile em dry-run."""
        result = setup.configure_bash_profile()
        assert result is True
    
    def test_configure_autologin_dry_run(self, setup):
        """Testa configuração de autologin em dry-run."""
        result = setup.configure_autologin()
        assert result is True
    
    def test_create_watchdog_service_dry_run(self, setup):
        """Testa criação de serviço watchdog em dry-run."""
        result = setup.create_watchdog_service()
        assert result is True
    
    def test_full_setup_dry_run(self, setup):
        """Testa setup completo em dry-run."""
        result = setup.full_setup()
        assert result is True
    
    @patch('kiosk_chromium_setup.shutil.which')
    def test_get_status(self, mock_which, setup):
        """Testa obtenção de status."""
        mock_which.side_effect = lambda x: f"/usr/bin/{x}" if x in ['Xorg', 'openbox', 'chromium'] else None
        
        status = setup.get_status()
        
        assert 'xorg_installed' in status
        assert 'openbox_installed' in status
        assert 'chromium_installed' in status
        assert 'url' in status


class TestKioskSecurityConfig:
    """Testes para configurações de segurança do kiosk."""
    
    def test_devtools_disabled_by_default(self):
        """Testa que devtools está desabilitado por padrão."""
        config = KioskChromiumConfig()
        assert config.disable_devtools is True
    
    def test_context_menu_disabled_by_default(self):
        """Testa que menu de contexto está desabilitado por padrão."""
        config = KioskChromiumConfig()
        assert config.disable_context_menu is True
    
    def test_crash_recovery_enabled_by_default(self):
        """Testa que recuperação de crash está habilitada por padrão."""
        config = KioskChromiumConfig()
        assert config.crash_recovery is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

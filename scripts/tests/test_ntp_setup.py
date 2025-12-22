#!/usr/bin/env python3
"""
Testes unitários para ntp_setup.py
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent / 'installer'))

from ntp_setup import NTPSetup, NTPConfig


class TestNTPConfig:
    """Testes para NTPConfig."""
    
    def test_default_config(self):
        """Testa configuração padrão."""
        config = NTPConfig()
        
        assert config.backend == "systemd-timesyncd"
        assert config.timezone == "America/Sao_Paulo"
        assert config.enable_on_boot is True
    
    def test_custom_config(self):
        """Testa configuração customizada."""
        config = NTPConfig(
            backend="chrony",
            timezone="Europe/London",
            ntp_servers=["pool.ntp.org"]
        )
        
        assert config.backend == "chrony"
        assert config.timezone == "Europe/London"
        assert "pool.ntp.org" in config.ntp_servers


class TestNTPSetup:
    """Testes para NTPSetup."""
    
    @pytest.fixture
    def setup(self):
        """Fixture que cria NTPSetup em modo dry-run."""
        return NTPSetup(dry_run=True)
    
    @pytest.fixture
    def setup_chrony(self):
        """Fixture para NTPSetup com chrony."""
        config = NTPConfig(backend="chrony")
        return NTPSetup(config=config, dry_run=True)
    
    def test_init_default(self, setup):
        """Testa inicialização padrão."""
        assert setup.config.backend == "systemd-timesyncd"
        assert setup.dry_run is True
    
    def test_configure_timesyncd_dry_run(self, setup):
        """Testa configuração de timesyncd em dry-run."""
        result = setup.configure_timesyncd()
        assert result is True
    
    def test_install_chrony_dry_run(self, setup_chrony):
        """Testa instalação de chrony em dry-run."""
        result = setup_chrony.install_chrony()
        assert result is True
    
    def test_configure_chrony_dry_run(self, setup_chrony):
        """Testa configuração de chrony em dry-run."""
        result = setup_chrony.configure_chrony()
        assert result is True
    
    def test_set_timezone_dry_run(self, setup):
        """Testa definição de timezone em dry-run."""
        result = setup.set_timezone("America/Sao_Paulo")
        assert result is True
    
    def test_enable_ntp_dry_run(self, setup):
        """Testa habilitação de NTP em dry-run."""
        result = setup.enable_ntp()
        assert result is True
    
    def test_full_setup_dry_run(self, setup):
        """Testa setup completo em dry-run."""
        result = setup.full_setup()
        assert result is True
    
    def test_full_setup_chrony_dry_run(self, setup_chrony):
        """Testa setup completo com chrony em dry-run."""
        result = setup_chrony.full_setup()
        assert result is True
    
    @patch('ntp_setup.subprocess.run')
    def test_verify_sync(self, mock_run, setup):
        """Testa verificação de sincronização."""
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="System clock synchronized: yes",
            stderr=""
        )
        
        setup.dry_run = False
        result = setup.verify_sync()
        
        assert result is True
    
    @patch('ntp_setup.subprocess.run')
    def test_get_status(self, mock_run, setup):
        """Testa obtenção de status."""
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="NTP synchronized: yes\nTime zone: America/Sao_Paulo",
            stderr=""
        )
        
        setup.dry_run = False
        status = setup.get_status()
        
        assert 'synchronized' in status
        assert 'timezone' in status


class TestNTPTimezones:
    """Testes para timezones."""
    
    def test_common_timezones(self):
        """Testa timezones comuns."""
        setup = NTPSetup(dry_run=True)
        
        # Lista de timezones comuns que devem ser suportados
        common_timezones = [
            "America/Sao_Paulo",
            "America/New_York",
            "Europe/London",
            "Asia/Tokyo",
            "UTC"
        ]
        
        for tz in common_timezones:
            # Apenas verificar que não gera erro
            config = NTPConfig(timezone=tz)
            assert config.timezone == tz
    
    def test_brazilian_timezones(self):
        """Testa timezones brasileiros."""
        brazilian_timezones = [
            "America/Sao_Paulo",
            "America/Fortaleza",
            "America/Manaus",
            "America/Cuiaba",
            "America/Rio_Branco"
        ]
        
        for tz in brazilian_timezones:
            config = NTPConfig(timezone=tz)
            assert config.timezone == tz


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

#!/usr/bin/env python3
"""
Testes unitários para ufw_setup.py
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent / 'installer'))

from ufw_setup import UFWSetup, UFWConfig


class TestUFWConfig:
    """Testes para UFWConfig."""
    
    def test_default_config(self):
        """Testa configuração padrão."""
        config = UFWConfig()
        
        assert config.default_incoming == "deny"
        assert config.default_outgoing == "allow"
        assert config.enable_logging is True
    
    def test_custom_config(self):
        """Testa configuração customizada."""
        config = UFWConfig(
            default_incoming="allow",
            enable_logging=False
        )
        
        assert config.default_incoming == "allow"
        assert config.enable_logging is False


class TestUFWSetup:
    """Testes para UFWSetup."""
    
    @pytest.fixture
    def setup(self):
        """Fixture que cria UFWSetup em modo dry-run."""
        return UFWSetup(dry_run=True)
    
    def test_init_default(self, setup):
        """Testa inicialização padrão."""
        assert setup.dry_run is True
    
    def test_default_rules_defined(self, setup):
        """Testa que regras padrão estão definidas."""
        assert 'ssh' in setup.DEFAULT_RULES
        assert 'http' in setup.DEFAULT_RULES
        assert 'https' in setup.DEFAULT_RULES
    
    def test_install_dry_run(self, setup):
        """Testa instalação em dry-run."""
        result = setup.install()
        assert result is True
    
    def test_configure_defaults_dry_run(self, setup):
        """Testa configuração de defaults em dry-run."""
        result = setup.configure_defaults()
        assert result is True
    
    def test_allow_port_dry_run(self, setup):
        """Testa permitir porta em dry-run."""
        result = setup.allow_port(8080, "tcp")
        assert result is True
    
    def test_deny_port_dry_run(self, setup):
        """Testa negar porta em dry-run."""
        result = setup.deny_port(23, "tcp")
        assert result is True
    
    def test_enable_dry_run(self, setup):
        """Testa habilitar UFW em dry-run."""
        result = setup.enable()
        assert result is True
    
    def test_full_setup_dry_run(self, setup):
        """Testa setup completo em dry-run."""
        result = setup.full_setup("full")
        assert result is True
    
    def test_full_setup_kiosk_mode_dry_run(self, setup):
        """Testa setup em modo kiosk em dry-run."""
        result = setup.full_setup("kiosk")
        assert result is True
    
    @patch('ufw_setup.subprocess.run')
    @patch('ufw_setup.shutil.which')
    def test_get_status(self, mock_which, mock_run, setup):
        """Testa obtenção de status."""
        mock_which.return_value = "/usr/bin/ufw"
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="Status: active",
            stderr=""
        )
        
        setup.dry_run = False
        status = setup.get_status()
        
        assert 'installed' in status
        assert 'active' in status


class TestUFWRules:
    """Testes para regras UFW."""
    
    def test_kiosk_mode_rules(self):
        """Testa regras específicas do modo kiosk."""
        setup = UFWSetup(dry_run=True)
        
        # Modo kiosk deve ter regras mais restritivas
        kiosk_rules = setup.MODE_RULES.get('kiosk', setup.DEFAULT_RULES)
        
        # Deve ter SSH e porta da aplicação
        assert any('ssh' in str(r).lower() or '22' in str(r) for r in kiosk_rules.keys())
    
    def test_server_mode_rules(self):
        """Testa regras do modo server."""
        setup = UFWSetup(dry_run=True)
        
        # Modo server deve incluir monitoramento
        server_rules = setup.MODE_RULES.get('server', setup.DEFAULT_RULES)
        
        assert 'grafana' in server_rules or 3000 in [r.get('port') for r in server_rules.values() if isinstance(r, dict)]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

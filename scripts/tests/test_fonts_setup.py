#!/usr/bin/env python3
"""
Testes unitários para fonts_setup.py
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent / 'installer'))

from fonts_setup import FontsSetup, FontsConfig


class TestFontsConfig:
    """Testes para FontsConfig."""
    
    def test_default_config(self):
        """Testa configuração padrão."""
        config = FontsConfig()
        
        assert config.install_noto is True
        assert config.install_dejavu is True
        assert config.install_liberation is True
        assert config.install_fontawesome is True
        assert config.install_emoji is True
        assert config.install_cjk is False  # CJK é opcional
    
    def test_custom_config(self):
        """Testa configuração customizada."""
        config = FontsConfig(
            install_noto=False,
            install_cjk=True,
            custom_fonts=['ttf-custom-font']
        )
        
        assert config.install_noto is False
        assert config.install_cjk is True
        assert 'ttf-custom-font' in config.custom_fonts


class TestFontsSetup:
    """Testes para FontsSetup."""
    
    @pytest.fixture
    def setup(self):
        """Fixture que cria FontsSetup em modo dry-run."""
        return FontsSetup(dry_run=True)
    
    def test_init_default(self, setup):
        """Testa inicialização padrão."""
        assert setup.config.install_noto is True
        assert setup.dry_run is True
    
    def test_packages_defined(self, setup):
        """Testa que pacotes estão definidos."""
        assert 'noto-fonts' in setup.NOTO_PACKAGES
        assert 'ttf-dejavu' in setup.DEJAVU_PACKAGES
        assert 'ttf-liberation' in setup.LIBERATION_PACKAGES
        assert 'ttf-font-awesome' in setup.FONTAWESOME_PACKAGES
    
    def test_install_noto_fonts_dry_run(self, setup):
        """Testa instalação de Noto Fonts em dry-run."""
        result = setup.install_noto_fonts()
        assert result is True
    
    def test_install_dejavu_fonts_dry_run(self, setup):
        """Testa instalação de DejaVu Fonts em dry-run."""
        result = setup.install_dejavu_fonts()
        assert result is True
    
    def test_install_liberation_fonts_dry_run(self, setup):
        """Testa instalação de Liberation Fonts em dry-run."""
        result = setup.install_liberation_fonts()
        assert result is True
    
    def test_install_fontawesome_dry_run(self, setup):
        """Testa instalação de Font Awesome em dry-run."""
        result = setup.install_fontawesome()
        assert result is True
    
    def test_install_noto_emoji_dry_run(self, setup):
        """Testa instalação de Noto Emoji em dry-run."""
        result = setup.install_noto_emoji()
        assert result is True
    
    def test_install_noto_cjk_dry_run(self, setup):
        """Testa instalação de Noto CJK em dry-run."""
        result = setup.install_noto_cjk()
        assert result is True
    
    def test_configure_fontconfig_dry_run(self, setup):
        """Testa configuração de fontconfig em dry-run."""
        result = setup.configure_fontconfig()
        assert result is True
    
    def test_update_font_cache_dry_run(self, setup):
        """Testa atualização de cache de fontes em dry-run."""
        result = setup.update_font_cache()
        assert result is True
    
    @patch('fonts_setup.subprocess.run')
    def test_list_installed_fonts(self, mock_run, setup):
        """Testa listagem de fontes instaladas."""
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="Noto Sans\nDejaVu Sans\nLiberation Serif\n",
            stderr=""
        )
        
        setup.dry_run = False
        fonts = setup.list_installed_fonts()
        
        assert len(fonts) > 0
        assert "Noto Sans" in fonts
    
    def test_full_setup_dry_run(self, setup):
        """Testa setup completo em dry-run."""
        result = setup.full_setup()
        assert result is True
    
    @patch('fonts_setup.subprocess.run')
    def test_get_status(self, mock_run, setup):
        """Testa obtenção de status."""
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="Noto Sans\nDejaVu Sans\nFont Awesome\nNoto Color Emoji\n",
            stderr=""
        )
        
        setup.dry_run = False
        status = setup.get_status()
        
        assert 'total_families' in status
        assert 'noto_installed' in status
        assert 'dejavu_installed' in status
        assert 'fontawesome_installed' in status


class TestFontsPackages:
    """Testes para listas de pacotes de fontes."""
    
    def test_noto_packages_not_empty(self):
        """Testa que lista de pacotes Noto não está vazia."""
        setup = FontsSetup(dry_run=True)
        assert len(setup.NOTO_PACKAGES) > 0
    
    def test_additional_packages_exist(self):
        """Testa que pacotes adicionais estão definidos."""
        setup = FontsSetup(dry_run=True)
        
        # Verificar fontes populares
        assert 'ttf-roboto' in setup.ADDITIONAL_PACKAGES
        assert 'ttf-fira-code' in setup.ADDITIONAL_PACKAGES


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

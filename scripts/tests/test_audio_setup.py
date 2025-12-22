#!/usr/bin/env python3
"""
Testes unitários para audio_setup.py
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Adicionar diretório do instalador ao path
sys.path.insert(0, str(Path(__file__).parent.parent / 'installer'))

from audio_setup import AudioSetup, AudioConfig, AudioBackend


class TestAudioConfig:
    """Testes para AudioConfig."""
    
    def test_default_config(self):
        """Testa configuração padrão."""
        config = AudioConfig()
        
        assert config.backend == AudioBackend.PIPEWIRE
        assert config.install_bluetooth is True
        assert config.install_equalizer is True
        assert config.install_control_gui is True
    
    def test_custom_config(self):
        """Testa configuração customizada."""
        config = AudioConfig(
            backend=AudioBackend.PULSEAUDIO,
            install_bluetooth=False,
            default_sink="alsa_output.pci-0000_00_1f.3.analog-stereo"
        )
        
        assert config.backend == AudioBackend.PULSEAUDIO
        assert config.install_bluetooth is False
        assert "alsa_output" in config.default_sink


class TestAudioSetup:
    """Testes para AudioSetup."""
    
    @pytest.fixture
    def setup(self):
        """Fixture que cria AudioSetup em modo dry-run."""
        return AudioSetup(dry_run=True)
    
    @pytest.fixture
    def setup_with_mock_logger(self):
        """Fixture com logger mockado."""
        logger = Mock()
        return AudioSetup(logger=logger, dry_run=True)
    
    def test_init_default(self, setup):
        """Testa inicialização padrão."""
        assert setup.config.backend == AudioBackend.PIPEWIRE
        assert setup.dry_run is True
    
    def test_init_custom_config(self):
        """Testa inicialização com config customizada."""
        config = AudioConfig(backend=AudioBackend.PULSEAUDIO)
        setup = AudioSetup(config=config, dry_run=True)
        
        assert setup.config.backend == AudioBackend.PULSEAUDIO
    
    @patch('audio_setup.subprocess.run')
    def test_detect_current_backend_pipewire(self, mock_run, setup):
        """Testa detecção de PipeWire como backend atual."""
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="active\n",
            stderr=""
        )
        
        # Não dry-run para testar detecção
        setup.dry_run = False
        backend = setup.detect_current_backend()
        
        assert backend == AudioBackend.PIPEWIRE
    
    @patch('audio_setup.subprocess.run')
    def test_detect_audio_devices(self, mock_run, setup):
        """Testa detecção de dispositivos de áudio."""
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="0\talsa_output.pci-0000_00_1f.3.analog-stereo\n",
            stderr=""
        )
        
        setup.dry_run = False
        devices = setup.detect_audio_devices()
        
        assert 'sinks' in devices
        assert 'sources' in devices
    
    def test_install_packages_dry_run(self, setup):
        """Testa instalação de pacotes em dry-run."""
        result = setup.install_packages(['pipewire'])
        assert result is True  # Dry-run sempre retorna True
    
    def test_install_pipewire_dry_run(self, setup):
        """Testa instalação de PipeWire em dry-run."""
        result = setup.install_pipewire()
        assert result is True
    
    def test_install_pulseaudio_dry_run(self, setup):
        """Testa instalação de PulseAudio em dry-run."""
        config = AudioConfig(backend=AudioBackend.PULSEAUDIO)
        setup = AudioSetup(config=config, dry_run=True)
        
        result = setup.install_pulseaudio()
        assert result is True
    
    def test_install_bluetooth_support_dry_run(self, setup):
        """Testa instalação de suporte Bluetooth em dry-run."""
        result = setup.install_bluetooth_support()
        assert result is True
    
    def test_create_asound_conf_dry_run(self, setup):
        """Testa criação de asound.conf em dry-run."""
        result = setup.create_asound_conf()
        assert result is True
    
    def test_full_setup_dry_run(self, setup):
        """Testa setup completo em dry-run."""
        result = setup.full_setup()
        assert result is True
    
    def test_logging(self, setup_with_mock_logger):
        """Testa que logging funciona corretamente."""
        setup = setup_with_mock_logger
        setup._log("Test message", "info")
        
        setup.logger.info.assert_called()


class TestAudioBackendEnum:
    """Testes para AudioBackend enum."""
    
    def test_enum_values(self):
        """Testa valores do enum."""
        assert AudioBackend.PULSEAUDIO.value == "pulseaudio"
        assert AudioBackend.PIPEWIRE.value == "pipewire"
        assert AudioBackend.ALSA.value == "alsa"
    
    def test_enum_from_string(self):
        """Testa criação de enum a partir de string."""
        backend = AudioBackend("pipewire")
        assert backend == AudioBackend.PIPEWIRE


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

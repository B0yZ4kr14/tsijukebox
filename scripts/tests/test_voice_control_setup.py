#!/usr/bin/env python3
"""
Testes unitários para voice_control_setup.py
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent / 'installer'))

from voice_control_setup import VoiceControlSetup, VoiceControlConfig, VoiceEngine


class TestVoiceControlConfig:
    """Testes para VoiceControlConfig."""
    
    def test_default_config(self):
        """Testa configuração padrão."""
        config = VoiceControlConfig()
        
        assert config.engine == VoiceEngine.VOSK
        assert config.language == "pt-BR"
        assert config.model_size == "small"
        assert config.enable_hotword is True
        assert config.hotword == "hey jukebox"
    
    def test_custom_config(self):
        """Testa configuração customizada."""
        config = VoiceControlConfig(
            engine=VoiceEngine.WHISPER,
            language="en-US",
            model_size="large"
        )
        
        assert config.engine == VoiceEngine.WHISPER
        assert config.language == "en-US"
        assert config.model_size == "large"


class TestVoiceControlSetup:
    """Testes para VoiceControlSetup."""
    
    @pytest.fixture
    def setup(self):
        """Fixture que cria VoiceControlSetup em modo dry-run."""
        return VoiceControlSetup(dry_run=True)
    
    @pytest.fixture
    def setup_whisper(self):
        """Fixture para Whisper em dry-run."""
        config = VoiceControlConfig(engine=VoiceEngine.WHISPER)
        return VoiceControlSetup(config=config, dry_run=True)
    
    def test_init_default(self, setup):
        """Testa inicialização padrão."""
        assert setup.config.engine == VoiceEngine.VOSK
        assert setup.dry_run is True
    
    def test_vosk_models_exist(self, setup):
        """Testa que modelos Vosk estão definidos."""
        assert 'pt-BR' in setup.VOSK_MODELS
        assert 'en-US' in setup.VOSK_MODELS
        assert 'small' in setup.VOSK_MODELS['pt-BR']
    
    def test_install_audio_dependencies_dry_run(self, setup):
        """Testa instalação de dependências de áudio em dry-run."""
        result = setup.install_audio_dependencies()
        assert result is True
    
    def test_install_python_packages_dry_run(self, setup):
        """Testa instalação de pacotes Python em dry-run."""
        result = setup.install_python_packages()
        assert result is True
    
    def test_download_vosk_model_dry_run(self, setup):
        """Testa download de modelo Vosk em dry-run."""
        result = setup.download_vosk_model()
        assert result is True
    
    def test_install_whisper_dry_run(self, setup_whisper):
        """Testa instalação de Whisper em dry-run."""
        result = setup_whisper.install_whisper()
        assert result is True
    
    def test_create_voice_config_dry_run(self, setup):
        """Testa criação de configuração de voz em dry-run."""
        result = setup.create_voice_config()
        assert result is True
    
    def test_create_voice_service_dry_run(self, setup):
        """Testa criação de serviço de voz em dry-run."""
        result = setup.create_voice_service()
        assert result is True
    
    def test_create_voice_script_dry_run(self, setup):
        """Testa criação de script de voz em dry-run."""
        result = setup.create_voice_script()
        assert result is True
    
    @patch('voice_control_setup.subprocess.run')
    def test_verify_microphone_found(self, mock_run, setup):
        """Testa verificação de microfone encontrado."""
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="card 0: PCH [HDA Intel PCH]",
            stderr=""
        )
        
        setup.dry_run = False
        result = setup.verify_microphone()
        
        assert result is True
    
    @patch('voice_control_setup.subprocess.run')
    def test_verify_microphone_not_found(self, mock_run, setup):
        """Testa verificação de microfone não encontrado."""
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="",
            stderr=""
        )
        
        setup.dry_run = False
        result = setup.verify_microphone()
        
        assert result is False
    
    def test_full_setup_dry_run(self, setup):
        """Testa setup completo em dry-run."""
        result = setup.full_setup()
        assert result is True


class TestVoiceEngineEnum:
    """Testes para VoiceEngine enum."""
    
    def test_enum_values(self):
        """Testa valores do enum."""
        assert VoiceEngine.VOSK.value == "vosk"
        assert VoiceEngine.WHISPER.value == "whisper"
        assert VoiceEngine.GOOGLE.value == "google"
    
    def test_enum_from_string(self):
        """Testa criação de enum a partir de string."""
        engine = VoiceEngine("vosk")
        assert engine == VoiceEngine.VOSK


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

#!/usr/bin/env python3
"""
TSiJUKEBOX - Voice Control Setup Module
========================================
Configura controle por voz: Vosk, SpeechRecognition, PortAudio.

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import shutil
import subprocess
from pathlib import Path
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass
from enum import Enum


class VoiceEngine(Enum):
    """Engines de reconhecimento de voz."""
    VOSK = "vosk"
    WHISPER = "whisper"
    GOOGLE = "google"  # Requer internet


@dataclass
class VoiceControlConfig:
    """Configuração do controle por voz."""
    engine: VoiceEngine = VoiceEngine.VOSK
    language: str = "pt-BR"
    model_size: str = "small"  # small, medium, large
    
    # Hotword
    enable_hotword: bool = True
    hotword: str = "hey jukebox"
    
    # Configurações
    sample_rate: int = 16000
    channels: int = 1
    
    # Diretórios
    models_dir: Path = Path("/var/lib/tsijukebox/voice-models")
    config_dir: Path = Path("/etc/tsijukebox/voice")


class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'


class VoiceControlSetup:
    """Configura controle por voz para TSiJUKEBOX."""
    
    # Modelos Vosk por idioma
    VOSK_MODELS = {
        'pt-BR': {
            'small': 'https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip',
            'large': 'https://alphacephei.com/vosk/models/vosk-model-pt-fb-v0.1.1-20220516_2113.zip',
        },
        'en-US': {
            'small': 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip',
            'large': 'https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip',
        },
        'es': {
            'small': 'https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip',
        },
    }
    
    # Pacotes necessários
    AUDIO_PACKAGES = [
        'portaudio',
        'alsa-utils',
        'alsa-plugins',
    ]
    
    PYTHON_PACKAGES = [
        'vosk',
        'SpeechRecognition',
        'pyaudio',
        'sounddevice',
        'numpy',
    ]
    
    def __init__(
        self,
        config: Optional[VoiceControlConfig] = None,
        logger: Any = None,
        user: Optional[str] = None,
        dry_run: bool = False
    ):
        self.config = config or VoiceControlConfig()
        self.logger = logger
        self.user = user or os.environ.get('SUDO_USER', 'root')
        self.dry_run = dry_run
        self.home = Path(f"/home/{self.user}") if self.user != 'root' else Path.home()
    
    def _log(self, message: str, level: str = "info"):
        if self.logger:
            getattr(self.logger, level, self.logger.info)(message)
        else:
            color = {
                'info': Colors.BLUE,
                'success': Colors.GREEN,
                'warning': Colors.YELLOW,
                'error': Colors.RED,
            }.get(level, Colors.BLUE)
            print(f"{color}[VOICE]{Colors.RESET} {message}")
    
    def _run(self, cmd: List[str], check: bool = False) -> Tuple[int, str, str]:
        if self.dry_run:
            self._log(f"[DRY-RUN] {' '.join(cmd)}", "info")
            return 0, "", ""
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return 1, "", str(e)
    
    def _run_as_user(self, cmd: List[str]) -> Tuple[int, str, str]:
        if os.geteuid() == 0 and self.user != 'root':
            cmd = ['sudo', '-u', self.user] + cmd
        return self._run(cmd)
    
    def _ensure_directories(self):
        """Cria diretórios necessários."""
        for dir_path in [self.config.models_dir, self.config.config_dir]:
            if not self.dry_run:
                dir_path.mkdir(parents=True, exist_ok=True)
    
    def install_audio_dependencies(self) -> bool:
        """Instala dependências de áudio."""
        self._log("Instalando dependências de áudio...", "info")
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm', '--needed'] + self.AUDIO_PACKAGES)
        
        if code != 0:
            self._log(f"Falha ao instalar pacotes de áudio: {err}", "error")
            return False
        
        self._log("Dependências de áudio instaladas", "success")
        return True
    
    def install_python_packages(self) -> bool:
        """Instala pacotes Python para reconhecimento de voz."""
        self._log("Instalando pacotes Python...", "info")
        
        # Instalar pip se necessário
        if not shutil.which('pip3'):
            self._run(['pacman', '-S', '--noconfirm', 'python-pip'])
        
        # Instalar pacotes
        for package in self.PYTHON_PACKAGES:
            code, _, err = self._run_as_user(['pip', 'install', '--user', package])
            
            if code != 0:
                self._log(f"Aviso: Falha ao instalar {package}: {err}", "warning")
        
        self._log("Pacotes Python instalados", "success")
        return True
    
    def download_vosk_model(self) -> bool:
        """Baixa modelo Vosk para o idioma configurado."""
        self._log(f"Baixando modelo Vosk para {self.config.language}...", "info")
        
        lang_models = self.VOSK_MODELS.get(self.config.language, self.VOSK_MODELS['en-US'])
        model_url = lang_models.get(self.config.model_size, lang_models.get('small'))
        
        if not model_url:
            self._log("Modelo não encontrado para idioma/tamanho", "error")
            return False
        
        model_name = model_url.split('/')[-1].replace('.zip', '')
        model_path = self.config.models_dir / model_name
        
        if model_path.exists():
            self._log("Modelo já existe, pulando download", "info")
            return True
        
        # Baixar
        temp_zip = Path(f"/tmp/{model_name}.zip")
        
        code, _, err = self._run([
            'curl', '-fsSL', '-o', str(temp_zip), model_url
        ])
        
        if code != 0:
            self._log(f"Falha ao baixar modelo: {err}", "error")
            return False
        
        # Extrair
        if not self.dry_run:
            self._run(['unzip', '-o', str(temp_zip), '-d', str(self.config.models_dir)])
            temp_zip.unlink(missing_ok=True)
            
            # Criar symlink para 'current'
            current_link = self.config.models_dir / 'current'
            if current_link.exists():
                current_link.unlink()
            current_link.symlink_to(model_path)
        
        self._log(f"Modelo Vosk instalado: {model_name}", "success")
        return True
    
    def install_whisper(self) -> bool:
        """Instala Whisper (OpenAI) para reconhecimento offline."""
        self._log("Instalando Whisper...", "info")
        
        # Whisper requer mais recursos
        code, _, err = self._run_as_user(['pip', 'install', '--user', 'openai-whisper'])
        
        if code != 0:
            self._log(f"Falha ao instalar Whisper: {err}", "error")
            return False
        
        self._log("Whisper instalado", "success")
        return True
    
    def create_voice_config(self) -> bool:
        """Cria arquivo de configuração de voz."""
        config_content = f"""# TSiJUKEBOX Voice Control Configuration
# Gerado automaticamente

[engine]
type = {self.config.engine.value}
language = {self.config.language}
model_path = {self.config.models_dir}/current

[audio]
sample_rate = {self.config.sample_rate}
channels = {self.config.channels}

[hotword]
enabled = {str(self.config.enable_hotword).lower()}
phrase = {self.config.hotword}

[commands]
# Comandos de voz mapeados para ações
play = tocar, reproduzir, play
pause = pausar, pause
next = próxima, next, skip
previous = anterior, previous
volume_up = aumentar volume, volume up
volume_down = diminuir volume, volume down
search = buscar, procurar, search
"""
        
        config_file = self.config.config_dir / "voice.conf"
        
        if not self.dry_run:
            self.config.config_dir.mkdir(parents=True, exist_ok=True)
            config_file.write_text(config_content)
        
        self._log(f"Configuração criada: {config_file}", "success")
        return True
    
    def create_voice_service(self) -> bool:
        """Cria serviço systemd para controle por voz."""
        service_content = f"""[Unit]
Description=TSiJUKEBOX Voice Control Service
After=network.target sound.target

[Service]
Type=simple
User={self.user}
Environment=VOSK_MODEL_PATH={self.config.models_dir}/current
ExecStart=/usr/bin/python3 /opt/tsijukebox/voice-control.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
"""
        
        service_path = Path("/etc/systemd/system/tsijukebox-voice.service")
        
        if not self.dry_run:
            service_path.write_text(service_content)
            self._run(['systemctl', 'daemon-reload'])
        
        self._log("Serviço de voz criado", "success")
        return True
    
    def create_voice_script(self) -> bool:
        """Cria script Python de controle por voz."""
        script_content = '''#!/usr/bin/env python3
"""
TSiJUKEBOX Voice Control Script
Reconhecimento de voz offline usando Vosk
"""

import os
import sys
import json
import queue
import sounddevice as sd
from vosk import Model, KaldiRecognizer

MODEL_PATH = os.environ.get('VOSK_MODEL_PATH', '/var/lib/tsijukebox/voice-models/current')
SAMPLE_RATE = 16000

# Comandos suportados
COMMANDS = {
    'tocar': 'play',
    'reproduzir': 'play',
    'play': 'play',
    'pausar': 'pause',
    'pause': 'pause',
    'próxima': 'next',
    'next': 'next',
    'anterior': 'previous',
    'previous': 'previous',
    'aumentar volume': 'volume_up',
    'diminuir volume': 'volume_down',
}

def process_command(text: str):
    """Processa comando de voz reconhecido."""
    text_lower = text.lower().strip()
    
    for trigger, action in COMMANDS.items():
        if trigger in text_lower:
            print(f"[VOICE] Comando detectado: {action}")
            # Aqui você pode integrar com a API do TSiJUKEBOX
            return action
    
    return None

def main():
    """Loop principal de reconhecimento."""
    print("[VOICE] Carregando modelo Vosk...")
    
    if not os.path.exists(MODEL_PATH):
        print(f"[VOICE] Modelo não encontrado: {MODEL_PATH}")
        sys.exit(1)
    
    model = Model(MODEL_PATH)
    rec = KaldiRecognizer(model, SAMPLE_RATE)
    
    q = queue.Queue()
    
    def callback(indata, frames, time, status):
        if status:
            print(f"[VOICE] Status: {status}")
        q.put(bytes(indata))
    
    print("[VOICE] Iniciando escuta...")
    
    with sd.RawInputStream(samplerate=SAMPLE_RATE, blocksize=8000, dtype='int16',
                           channels=1, callback=callback):
        while True:
            data = q.get()
            if rec.AcceptWaveform(data):
                result = json.loads(rec.Result())
                text = result.get('text', '')
                
                if text:
                    print(f"[VOICE] Reconhecido: {text}")
                    process_command(text)

if __name__ == '__main__':
    main()
'''
        
        script_path = Path("/opt/tsijukebox/voice-control.py")
        
        if not self.dry_run:
            script_path.parent.mkdir(parents=True, exist_ok=True)
            script_path.write_text(script_content)
            script_path.chmod(0o755)
        
        self._log(f"Script de voz criado: {script_path}", "success")
        return True
    
    def verify_microphone(self) -> bool:
        """Verifica se há microfone disponível."""
        self._log("Verificando microfone...", "info")
        
        code, out, _ = self._run(['arecord', '-l'])
        
        if 'card' not in out.lower():
            self._log("Nenhum microfone detectado", "warning")
            return False
        
        self._log("Microfone detectado", "success")
        return True
    
    def full_setup(self) -> bool:
        """Executa instalação completa do controle por voz."""
        self._log("Iniciando configuração de controle por voz...", "info")
        
        self._ensure_directories()
        
        # Instalar dependências
        if not self.install_audio_dependencies():
            return False
        
        if not self.install_python_packages():
            return False
        
        # Instalar engine
        if self.config.engine == VoiceEngine.VOSK:
            if not self.download_vosk_model():
                return False
        elif self.config.engine == VoiceEngine.WHISPER:
            if not self.install_whisper():
                return False
        
        # Criar configuração
        self.create_voice_config()
        
        # Criar script e serviço
        self.create_voice_script()
        self.create_voice_service()
        
        # Verificar microfone
        self.verify_microphone()
        
        self._log("Configuração de controle por voz concluída!", "success")
        return True
    
    def get_status(self) -> Dict[str, Any]:
        """Retorna status do controle por voz."""
        status = {
            'engine': self.config.engine.value,
            'language': self.config.language,
            'audio_packages_installed': all(
                shutil.which(pkg.split('-')[0]) for pkg in ['arecord']
            ),
            'vosk_installed': False,
            'model_exists': False,
            'microphone_available': False,
        }
        
        # Verificar Vosk
        try:
            import vosk
            status['vosk_installed'] = True
        except ImportError:
            pass
        
        # Verificar modelo
        model_link = self.config.models_dir / 'current'
        status['model_exists'] = model_link.exists()
        
        # Verificar microfone
        code, out, _ = self._run(['arecord', '-l'])
        status['microphone_available'] = 'card' in out.lower()
        
        return status


def main():
    """Ponto de entrada para execução standalone."""
    import argparse
    
    parser = argparse.ArgumentParser(description='TSiJUKEBOX Voice Control Setup')
    parser.add_argument('--engine', choices=['vosk', 'whisper'],
                       default='vosk', help='Engine de reconhecimento')
    parser.add_argument('--language', default='pt-BR', 
                       help='Idioma (pt-BR, en-US, es)')
    parser.add_argument('--model-size', choices=['small', 'large'],
                       default='small', help='Tamanho do modelo')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simular sem executar')
    parser.add_argument('--status', action='store_true',
                       help='Mostrar status')
    
    args = parser.parse_args()
    
    config = VoiceControlConfig(
        engine=VoiceEngine(args.engine),
        language=args.language,
        model_size=args.model_size,
    )
    
    setup = VoiceControlSetup(config=config, dry_run=args.dry_run)
    
    if args.status:
        import json
        status = setup.get_status()
        print(json.dumps(status, indent=2))
        return
    
    success = setup.full_setup()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()

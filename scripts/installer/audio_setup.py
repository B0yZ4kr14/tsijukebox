#!/usr/bin/env python3
"""
TSiJUKEBOX - Audio Setup Module
================================
Configura sistema de áudio: PulseAudio ou PipeWire.

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


class AudioBackend(Enum):
    """Backend de áudio suportado."""
    PULSEAUDIO = "pulseaudio"
    PIPEWIRE = "pipewire"
    ALSA = "alsa"


@dataclass
class AudioConfig:
    """Configuração do sistema de áudio."""
    backend: AudioBackend = AudioBackend.PIPEWIRE
    install_bluetooth: bool = True
    install_equalizer: bool = True
    install_control_gui: bool = True
    default_sink: Optional[str] = None
    default_source: Optional[str] = None


class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'


class AudioSetup:
    """Configura sistema de áudio para TSiJUKEBOX."""
    
    PULSEAUDIO_PACKAGES = [
        'pulseaudio',
        'pulseaudio-alsa',
        'pulseaudio-bluetooth',
        'alsa-utils',
        'alsa-plugins',
    ]
    
    PIPEWIRE_PACKAGES = [
        'pipewire',
        'pipewire-audio',
        'pipewire-pulse',
        'pipewire-alsa',
        'pipewire-jack',
        'wireplumber',
        'alsa-utils',
    ]
    
    OPTIONAL_PACKAGES = {
        'bluetooth': ['bluez', 'bluez-utils'],
        'equalizer': ['easyeffects'],
        'control_gui': ['pavucontrol', 'helvum'],
    }
    
    def __init__(
        self,
        config: Optional[AudioConfig] = None,
        logger: Any = None,
        user: Optional[str] = None,
        dry_run: bool = False
    ):
        self.config = config or AudioConfig()
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
            print(f"{color}[AUDIO]{Colors.RESET} {message}")
    
    def _run(self, cmd: List[str], check: bool = False) -> Tuple[int, str, str]:
        """Executa comando."""
        if self.dry_run:
            self._log(f"[DRY-RUN] {' '.join(cmd)}", "info")
            return 0, "", ""
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return 1, "", str(e)
    
    def _run_as_user(self, cmd: List[str]) -> Tuple[int, str, str]:
        """Executa comando como usuário."""
        if os.geteuid() == 0 and self.user != 'root':
            cmd = ['sudo', '-u', self.user] + cmd
        return self._run(cmd)
    
    def detect_current_backend(self) -> Optional[AudioBackend]:
        """Detecta backend de áudio atual."""
        # Verificar PipeWire
        code, out, _ = self._run(['systemctl', '--user', 'is-active', 'pipewire'])
        if 'active' in out:
            return AudioBackend.PIPEWIRE
        
        # Verificar PulseAudio
        code, out, _ = self._run(['systemctl', '--user', 'is-active', 'pulseaudio'])
        if 'active' in out:
            return AudioBackend.PULSEAUDIO
        
        # Verificar se binários existem
        if shutil.which('pipewire'):
            return AudioBackend.PIPEWIRE
        if shutil.which('pulseaudio'):
            return AudioBackend.PULSEAUDIO
        
        return AudioBackend.ALSA
    
    def detect_audio_devices(self) -> Dict[str, List[str]]:
        """Detecta dispositivos de áudio."""
        devices = {'sinks': [], 'sources': []}
        
        # Tentar pactl
        code, out, _ = self._run(['pactl', 'list', 'short', 'sinks'])
        if code == 0:
            for line in out.strip().split('\n'):
                if line:
                    parts = line.split('\t')
                    if len(parts) >= 2:
                        devices['sinks'].append(parts[1])
        
        code, out, _ = self._run(['pactl', 'list', 'short', 'sources'])
        if code == 0:
            for line in out.strip().split('\n'):
                if line:
                    parts = line.split('\t')
                    if len(parts) >= 2:
                        devices['sources'].append(parts[1])
        
        return devices
    
    def install_packages(self, packages: List[str]) -> bool:
        """Instala pacotes via pacman."""
        self._log(f"Instalando: {', '.join(packages)}", "info")
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm', '--needed'] + packages)
        
        if code != 0:
            self._log(f"Falha ao instalar pacotes: {err}", "error")
            return False
        
        return True
    
    def install_pulseaudio(self) -> bool:
        """Instala PulseAudio."""
        self._log("Instalando PulseAudio...", "info")
        
        # Remover PipeWire se instalado
        self._run(['pacman', '-Rns', '--noconfirm', 'pipewire', 'pipewire-pulse'], check=False)
        
        # Instalar PulseAudio
        if not self.install_packages(self.PULSEAUDIO_PACKAGES):
            return False
        
        # Configurar autostart
        self._run_as_user(['systemctl', '--user', 'enable', 'pulseaudio'])
        self._run_as_user(['systemctl', '--user', 'start', 'pulseaudio'])
        
        self._log("PulseAudio instalado com sucesso", "success")
        return True
    
    def install_pipewire(self) -> bool:
        """Instala PipeWire."""
        self._log("Instalando PipeWire...", "info")
        
        # Remover PulseAudio se instalado (conflita)
        self._run(['pacman', '-Rns', '--noconfirm', 'pulseaudio', 'pulseaudio-bluetooth'], check=False)
        
        # Instalar PipeWire
        if not self.install_packages(self.PIPEWIRE_PACKAGES):
            return False
        
        # Configurar serviços do usuário
        self._run_as_user(['systemctl', '--user', 'enable', 'pipewire'])
        self._run_as_user(['systemctl', '--user', 'enable', 'pipewire-pulse'])
        self._run_as_user(['systemctl', '--user', 'enable', 'wireplumber'])
        
        self._run_as_user(['systemctl', '--user', 'start', 'pipewire'])
        self._run_as_user(['systemctl', '--user', 'start', 'pipewire-pulse'])
        self._run_as_user(['systemctl', '--user', 'start', 'wireplumber'])
        
        self._log("PipeWire instalado com sucesso", "success")
        return True
    
    def install_bluetooth_support(self) -> bool:
        """Instala suporte a Bluetooth."""
        self._log("Instalando suporte Bluetooth...", "info")
        
        packages = self.OPTIONAL_PACKAGES['bluetooth']
        if not self.install_packages(packages):
            return False
        
        # Bluetooth para PipeWire
        if self.config.backend == AudioBackend.PIPEWIRE:
            self._run(['pacman', '-S', '--noconfirm', '--needed', 'pipewire-bluetooth'])
        
        # Habilitar serviço
        self._run(['systemctl', 'enable', 'bluetooth'])
        self._run(['systemctl', 'start', 'bluetooth'])
        
        self._log("Suporte Bluetooth instalado", "success")
        return True
    
    def install_equalizer(self) -> bool:
        """Instala equalizador (EasyEffects)."""
        self._log("Instalando equalizador...", "info")
        
        packages = self.OPTIONAL_PACKAGES['equalizer']
        return self.install_packages(packages)
    
    def install_control_gui(self) -> bool:
        """Instala interface de controle (pavucontrol/helvum)."""
        self._log("Instalando interface de controle...", "info")
        
        packages = self.OPTIONAL_PACKAGES['control_gui']
        return self.install_packages(packages)
    
    def configure_default_devices(self) -> bool:
        """Configura dispositivos padrão."""
        if not self.config.default_sink and not self.config.default_source:
            return True
        
        self._log("Configurando dispositivos padrão...", "info")
        
        if self.config.default_sink:
            self._run(['pactl', 'set-default-sink', self.config.default_sink])
        
        if self.config.default_source:
            self._run(['pactl', 'set-default-source', self.config.default_source])
        
        return True
    
    def create_asound_conf(self) -> bool:
        """Cria configuração ALSA padrão."""
        asound_content = """# TSiJUKEBOX ALSA Configuration
# Redireciona para PulseAudio/PipeWire

pcm.!default {
    type pulse
    fallback "sysdefault"
    hint {
        show on
        description "Default ALSA Output (PulseAudio/PipeWire)"
    }
}

ctl.!default {
    type pulse
    fallback "sysdefault"
}
"""
        
        asound_file = Path("/etc/asound.conf")
        
        if not self.dry_run:
            try:
                asound_file.write_text(asound_content)
                self._log("Configuração ALSA criada", "success")
                return True
            except Exception as e:
                self._log(f"Falha ao criar asound.conf: {e}", "error")
                return False
        
        return True
    
    def verify_audio(self) -> bool:
        """Verifica se áudio está funcionando."""
        self._log("Verificando sistema de áudio...", "info")
        
        # Verificar serviço
        if self.config.backend == AudioBackend.PIPEWIRE:
            code, out, _ = self._run_as_user(['systemctl', '--user', 'is-active', 'pipewire'])
            service_ok = 'active' in out
        else:
            code, out, _ = self._run_as_user(['systemctl', '--user', 'is-active', 'pulseaudio'])
            service_ok = 'active' in out
        
        if not service_ok:
            self._log("Serviço de áudio não está ativo", "warning")
        
        # Verificar dispositivos
        devices = self.detect_audio_devices()
        
        if devices['sinks']:
            self._log(f"Saídas de áudio: {len(devices['sinks'])}", "info")
        else:
            self._log("Nenhuma saída de áudio detectada", "warning")
        
        if devices['sources']:
            self._log(f"Entradas de áudio: {len(devices['sources'])}", "info")
        
        return bool(devices['sinks'])
    
    def full_setup(self) -> bool:
        """Executa instalação completa de áudio."""
        self._log("Iniciando configuração de áudio...", "info")
        
        # Detectar backend atual
        current = self.detect_current_backend()
        self._log(f"Backend atual: {current.value if current else 'nenhum'}", "info")
        
        # Instalar backend escolhido
        if self.config.backend == AudioBackend.PIPEWIRE:
            if not self.install_pipewire():
                return False
        else:
            if not self.install_pulseaudio():
                return False
        
        # Instalar componentes opcionais
        if self.config.install_bluetooth:
            self.install_bluetooth_support()
        
        if self.config.install_equalizer:
            self.install_equalizer()
        
        if self.config.install_control_gui:
            self.install_control_gui()
        
        # Configurar ALSA
        self.create_asound_conf()
        
        # Configurar dispositivos padrão
        self.configure_default_devices()
        
        # Verificar
        self.verify_audio()
        
        self._log("Configuração de áudio concluída!", "success")
        return True


def main():
    """Ponto de entrada para execução standalone."""
    import argparse
    
    parser = argparse.ArgumentParser(description='TSiJUKEBOX Audio Setup')
    parser.add_argument('--backend', choices=['pulseaudio', 'pipewire'], 
                       default='pipewire', help='Backend de áudio')
    parser.add_argument('--no-bluetooth', action='store_true',
                       help='Não instalar suporte Bluetooth')
    parser.add_argument('--no-equalizer', action='store_true',
                       help='Não instalar equalizador')
    parser.add_argument('--no-gui', action='store_true',
                       help='Não instalar interface de controle')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simular sem executar')
    
    args = parser.parse_args()
    
    config = AudioConfig(
        backend=AudioBackend(args.backend),
        install_bluetooth=not args.no_bluetooth,
        install_equalizer=not args.no_equalizer,
        install_control_gui=not args.no_gui,
    )
    
    setup = AudioSetup(config=config, dry_run=args.dry_run)
    success = setup.full_setup()
    
    exit(0 if success else 1)


if __name__ == "__main__":
    main()

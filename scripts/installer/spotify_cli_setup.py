#!/usr/bin/env python3
"""
Spotify CLI Linux Setup
========================
Gerencia instalação e configuração do spotify-cli-linux.

https://github.com/pwittchen/spotify-cli-linux
"""

import os
import shutil
import subprocess
from pathlib import Path
from typing import Optional, Tuple


class SpotifyCLISetup:
    """Gerencia instalação do spotify-cli-linux."""
    
    PACKAGE_NAME = "spotify-cli-linux"
    CLI_COMMAND = "spotifycli"
    
    # Aliases padrão para o .bashrc
    ALIASES = {
        'sp-play': 'spotifycli --play',
        'sp-pause': 'spotifycli --pause',
        'sp-next': 'spotifycli --next',
        'sp-prev': 'spotifycli --prev',
        'sp-status': 'spotifycli --status',
        'sp-lyrics': 'spotifycli --lyrics',
        'sp-art': 'spotifycli --arturl',
        'sp-song': 'spotifycli --song',
        'sp-artist': 'spotifycli --artist',
        'sp-album': 'spotifycli --album',
    }
    
    def __init__(self, user: str, verbose: bool = False):
        self.user = user
        self.verbose = verbose
        self.home = Path(os.path.expanduser(f"~{user}"))
    
    def _log(self, message: str, level: str = "info"):
        """Log mensagem se verbose."""
        if self.verbose:
            prefix = {"info": "ℹ️", "success": "✅", "error": "❌", "warning": "⚠️"}.get(level, "")
            print(f"{prefix} [SpotifyCLI] {message}")
    
    def _run_command(self, cmd: list, user: Optional[str] = None, capture: bool = True) -> Tuple[int, str, str]:
        """Executa comando opcionalmente como outro usuário."""
        if user and os.geteuid() == 0:
            cmd = ['sudo', '-u', user] + cmd
        
        try:
            result = subprocess.run(cmd, capture_output=capture, text=True, timeout=120)
            return result.returncode, result.stdout or "", result.stderr or ""
        except subprocess.TimeoutExpired:
            return 1, "", "Timeout"
        except Exception as e:
            return 1, "", str(e)
    
    def is_installed(self) -> bool:
        """Verifica se spotifycli está instalado."""
        return shutil.which(self.CLI_COMMAND) is not None
    
    def check_dependencies(self) -> Tuple[bool, list]:
        """Verifica dependências necessárias."""
        missing = []
        
        # Python pip
        if not shutil.which('pip') and not shutil.which('pip3'):
            missing.append('python-pip')
        
        # D-Bus (necessário para comunicação com Spotify)
        if not shutil.which('dbus-send'):
            missing.append('dbus')
        
        # python-dbus
        try:
            import dbus
        except ImportError:
            missing.append('python-dbus')
        
        return len(missing) == 0, missing
    
    def install(self) -> bool:
        """Instala spotify-cli-linux via pip."""
        if self.is_installed():
            self._log("spotify-cli-linux já está instalado", "info")
            return True
        
        self._log("Instalando spotify-cli-linux via pip...", "info")
        
        # Instalar via pip como usuário
        code, out, err = self._run_command(
            ['pip', 'install', '--user', self.PACKAGE_NAME],
            user=self.user
        )
        
        if code != 0:
            # Tentar pip3
            code, out, err = self._run_command(
                ['pip3', 'install', '--user', self.PACKAGE_NAME],
                user=self.user
            )
        
        if code == 0:
            self._log("spotify-cli-linux instalado com sucesso", "success")
            
            # Adicionar ~/.local/bin ao PATH se necessário
            self._ensure_local_bin_in_path()
            
            return True
        else:
            self._log(f"Falha ao instalar: {err}", "error")
            return False
    
    def _ensure_local_bin_in_path(self):
        """Garante que ~/.local/bin está no PATH."""
        local_bin = self.home / '.local' / 'bin'
        bashrc = self.home / '.bashrc'
        zshrc = self.home / '.zshrc'
        
        path_export = f'\n# spotify-cli-linux PATH\nexport PATH="$HOME/.local/bin:$PATH"\n'
        
        for rc_file in [bashrc, zshrc]:
            if rc_file.exists():
                content = rc_file.read_text()
                if '.local/bin' not in content:
                    with open(rc_file, 'a') as f:
                        f.write(path_export)
                    self._log(f"PATH atualizado em {rc_file.name}", "info")
    
    def create_aliases(self) -> bool:
        """Cria aliases úteis no .bashrc e .zshrc."""
        self._log("Criando aliases para spotify-cli-linux...", "info")
        
        alias_block = "\n# TSiJUKEBOX - Spotify CLI Aliases\n"
        for alias_name, command in self.ALIASES.items():
            alias_block += f"alias {alias_name}='{command}'\n"
        alias_block += "# Fim Spotify CLI Aliases\n"
        
        # Adicionar ao .bashrc
        bashrc = self.home / '.bashrc'
        if bashrc.exists():
            content = bashrc.read_text()
            if 'TSiJUKEBOX - Spotify CLI Aliases' not in content:
                with open(bashrc, 'a') as f:
                    f.write(alias_block)
                self._log("Aliases adicionados ao .bashrc", "success")
        
        # Adicionar ao .zshrc se existir
        zshrc = self.home / '.zshrc'
        if zshrc.exists():
            content = zshrc.read_text()
            if 'TSiJUKEBOX - Spotify CLI Aliases' not in content:
                with open(zshrc, 'a') as f:
                    f.write(alias_block)
                self._log("Aliases adicionados ao .zshrc", "success")
        
        return True
    
    def create_systemd_service(self) -> bool:
        """Cria serviço systemd para status widget (opcional)."""
        service_content = f"""[Unit]
Description=TSiJUKEBOX Spotify Status Monitor
After=graphical-session.target spotify.service

[Service]
Type=simple
User={self.user}
ExecStart=/usr/bin/env spotifycli --status
Restart=on-failure
RestartSec=5
Environment=DISPLAY=:0

[Install]
WantedBy=graphical-session.target
"""
        
        service_dir = Path('/etc/systemd/user')
        service_dir.mkdir(parents=True, exist_ok=True)
        
        service_file = service_dir / 'tsijukebox-spotify-status.service'
        service_file.write_text(service_content)
        
        self._log("Serviço systemd criado (opcional)", "info")
        return True
    
    def verify_installation(self) -> Tuple[bool, dict]:
        """Verifica instalação e retorna informações."""
        info = {
            'installed': False,
            'version': None,
            'path': None,
            'aliases_configured': False,
        }
        
        # Verificar binário
        cli_path = shutil.which(self.CLI_COMMAND)
        if cli_path:
            info['installed'] = True
            info['path'] = cli_path
            
            # Tentar obter versão
            code, out, _ = self._run_command(['spotifycli', '--version'], user=self.user)
            if code == 0:
                info['version'] = out.strip()
        
        # Verificar aliases
        bashrc = self.home / '.bashrc'
        if bashrc.exists() and 'TSiJUKEBOX - Spotify CLI Aliases' in bashrc.read_text():
            info['aliases_configured'] = True
        
        return info['installed'], info
    
    def full_setup(self) -> bool:
        """Executa setup completo."""
        self._log("Iniciando setup completo do spotify-cli-linux...", "info")
        
        # Verificar dependências
        deps_ok, missing = self.check_dependencies()
        if not deps_ok:
            self._log(f"Dependências faltando: {missing}", "warning")
        
        # Instalar
        if not self.install():
            return False
        
        # Criar aliases
        self.create_aliases()
        
        # Verificar
        is_ok, info = self.verify_installation()
        
        if is_ok:
            self._log(f"Setup completo! Path: {info['path']}", "success")
            return True
        else:
            self._log("Setup incompleto, verifique manualmente", "warning")
            return False


def install_spotify_cli(user: str, verbose: bool = False) -> bool:
    """Função de conveniência para instalar spotify-cli-linux."""
    setup = SpotifyCLISetup(user, verbose)
    return setup.full_setup()


if __name__ == "__main__":
    import sys
    
    user = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('SUDO_USER', os.getlogin())
    verbose = '--verbose' in sys.argv or '-v' in sys.argv
    
    setup = SpotifyCLISetup(user, verbose=True)
    success = setup.full_setup()
    
    sys.exit(0 if success else 1)

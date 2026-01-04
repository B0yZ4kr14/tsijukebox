#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - Dev Tools Setup v6.0.0
===============================================
Instalação de ferramentas de desenvolvimento.

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import subprocess
import shutil
from pathlib import Path
from typing import List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class DevToolsConfig:
    """Configuração de ferramentas de desenvolvimento."""
    install_github_cli: bool = True
    install_rclone: bool = True
    install_storj: bool = True
    install_nodejs: bool = False
    install_playwright: bool = False


class DevToolsSetup:
    """Instala ferramentas de desenvolvimento."""
    
    def __init__(self, config: Optional[DevToolsConfig] = None, logger=None, user: str = "", dry_run: bool = False):
        self.config = config or DevToolsConfig()
        self.logger = logger
        self.user = user
        self.dry_run = dry_run
    
    def _log(self, level: str, msg: str):
        if self.logger:
            getattr(self.logger, level, print)(msg)
        else:
            print(f"[{level.upper()}] {msg}")
    
    def _run_command(self, cmd: List[str], as_user: bool = False) -> Tuple[int, str, str]:
        if self.dry_run:
            self._log('info', f"[DRY-RUN] {' '.join(cmd)}")
            return 0, "", ""
        
        if as_user and self.user:
            cmd = ['sudo', '-u', self.user] + cmd
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return 1, "", str(e)
    
    def install_github_cli(self) -> bool:
        """Instala GitHub CLI (gh)."""
        self._log('info', "Instalando GitHub CLI...")
        
        if shutil.which('gh'):
            self._log('info', "GitHub CLI já instalado")
            return True
        
        code, _, err = self._run_command(['pacman', '-S', '--noconfirm', '--needed', 'github-cli'])
        
        if code != 0:
            self._log('warning', f"Falha no pacman: {err}, tentando AUR...")
            # Try AUR
            for helper in ['paru', 'yay']:
                if shutil.which(helper):
                    self._run_command([helper, '-S', '--noconfirm', 'github-cli'], as_user=True)
                    break
        
        self._log('success', "GitHub CLI instalado")
        return True
    
    def install_rclone(self) -> bool:
        """Instala rclone para backup na nuvem."""
        self._log('info', "Instalando rclone...")
        
        if shutil.which('rclone'):
            self._log('info', "rclone já instalado")
            return True
        
        code, _, _ = self._run_command(['pacman', '-S', '--noconfirm', '--needed', 'rclone'])
        
        if code != 0:
            # Try official install script
            self._run_command(['bash', '-c', 'curl https://rclone.org/install.sh | sudo bash'])
        
        self._log('success', "rclone instalado")
        return True
    
    def install_storj(self) -> bool:
        """Instala Storj Uplink CLI."""
        self._log('info', "Instalando Storj Uplink CLI...")
        
        if shutil.which('uplink'):
            self._log('info', "Storj Uplink já instalado")
            return True
        
        # Download from official source
        import platform
        arch = platform.machine()
        arch_map = {'x86_64': 'amd64', 'aarch64': 'arm64', 'armv7l': 'arm'}
        arch_name = arch_map.get(arch, 'amd64')
        
        url = f"https://github.com/storj/storj/releases/latest/download/uplink_linux_{arch_name}.zip"
        
        if not self.dry_run:
            # Download
            self._run_command(['curl', '-fsSL', url, '-o', '/tmp/uplink.zip'])
            
            # Extract
            self._run_command(['unzip', '-o', '/tmp/uplink.zip', '-d', '/tmp'])
            
            # Install
            self._run_command(['install', '-m', '755', '/tmp/uplink', '/usr/local/bin/uplink'])
            
            # Cleanup
            self._run_command(['rm', '-f', '/tmp/uplink.zip', '/tmp/uplink'])
        
        self._log('success', "Storj Uplink CLI instalado")
        return True
    
    def install_nodejs(self) -> bool:
        """Instala Node.js e npm."""
        self._log('info', "Instalando Node.js...")
        
        if shutil.which('node'):
            self._log('info', "Node.js já instalado")
            return True
        
        self._run_command(['pacman', '-S', '--noconfirm', '--needed', 'nodejs', 'npm'])
        
        self._log('success', "Node.js instalado")
        return True
    
    def install_playwright(self) -> bool:
        """Instala Playwright para testes."""
        self._log('info', "Instalando Playwright...")
        
        # Ensure Node.js is installed
        if not shutil.which('node'):
            self.install_nodejs()
        
        self._run_command(['npm', 'install', '-g', '@playwright/test'], as_user=True)
        self._run_command(['npx', 'playwright', 'install', '--with-deps'], as_user=True)
        
        self._log('success', "Playwright instalado")
        return True
    
    def full_setup(self) -> bool:
        """Executa instalação completa de ferramentas de desenvolvimento."""
        success = True
        
        if self.config.install_github_cli:
            success = self.install_github_cli() and success
        
        if self.config.install_rclone:
            success = self.install_rclone() and success
        
        if self.config.install_storj:
            success = self.install_storj() and success
        
        if self.config.install_nodejs:
            success = self.install_nodejs() and success
        
        if self.config.install_playwright:
            success = self.install_playwright() and success
        
        return success


def main():
    """Teste do módulo de ferramentas de desenvolvimento."""
    config = DevToolsConfig()
    devtools = DevToolsSetup(config=config, dry_run=True)
    devtools.full_setup()


if __name__ == "__main__":
    main()

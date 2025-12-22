#!/usr/bin/env python3
"""
TSiJUKEBOX - Cloud Backup Setup Module
=======================================
Configura provedores de backup na nuvem: rclone, Storj, AWS S3, MEGA.

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import shutil
import subprocess
import json
from pathlib import Path
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass, field
from enum import Enum


class CloudProvider(Enum):
    """Provedores de cloud suportados."""
    RCLONE = "rclone"
    STORJ = "storj"
    AWS_S3 = "aws_s3"
    MEGA = "mega"
    GOOGLE_DRIVE = "google_drive"
    DROPBOX = "dropbox"
    ONEDRIVE = "onedrive"


@dataclass
class CloudBackupConfig:
    """Configuração de backup na nuvem."""
    providers: List[CloudProvider] = field(default_factory=lambda: [CloudProvider.RCLONE])
    backup_dir: Path = Path("/var/backups/tsijukebox")
    config_dir: Path = Path("/etc/tsijukebox/backup")
    
    # Configurações específicas
    aws_region: str = "us-east-1"
    storj_satellite: str = "us1.storj.io:7777"
    
    # Agendamento
    schedule_enabled: bool = True
    schedule_cron: str = "0 3 * * *"  # 3:00 AM diário


class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'


class CloudBackupSetup:
    """Configura backup na nuvem para TSiJUKEBOX."""
    
    RCLONE_PACKAGES = ['rclone']
    STORJ_URL = "https://github.com/storj/storj/releases/latest/download/uplink_linux_amd64.zip"
    MEGA_PACKAGES = ['megatools']
    
    def __init__(
        self,
        config: Optional[CloudBackupConfig] = None,
        logger: Any = None,
        user: Optional[str] = None,
        dry_run: bool = False
    ):
        self.config = config or CloudBackupConfig()
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
            print(f"{color}[CLOUD-BACKUP]{Colors.RESET} {message}")
    
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
        for dir_path in [self.config.backup_dir, self.config.config_dir]:
            if not self.dry_run:
                dir_path.mkdir(parents=True, exist_ok=True)
    
    # =========================================================================
    # RCLONE
    # =========================================================================
    
    def install_rclone(self) -> bool:
        """Instala rclone."""
        self._log("Instalando rclone...", "info")
        
        if shutil.which('rclone'):
            self._log("rclone já instalado", "info")
            return True
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm', 'rclone'])
        
        if code != 0:
            self._log(f"Falha ao instalar rclone: {err}", "error")
            return False
        
        self._log("rclone instalado com sucesso", "success")
        return True
    
    def configure_rclone_remote(
        self,
        name: str,
        remote_type: str,
        config_params: Dict[str, str]
    ) -> bool:
        """Configura um remote do rclone."""
        self._log(f"Configurando rclone remote: {name} ({remote_type})", "info")
        
        rclone_config = self.home / ".config/rclone/rclone.conf"
        
        if not self.dry_run:
            rclone_config.parent.mkdir(parents=True, exist_ok=True)
            
            # Adicionar configuração
            config_lines = [f"\n[{name}]", f"type = {remote_type}"]
            for key, value in config_params.items():
                config_lines.append(f"{key} = {value}")
            
            with open(rclone_config, 'a') as f:
                f.write('\n'.join(config_lines) + '\n')
        
        return True
    
    def create_rclone_backup_script(self) -> bool:
        """Cria script de backup com rclone."""
        script_content = f"""#!/bin/bash
# TSiJUKEBOX Cloud Backup Script
# Gerado automaticamente

set -e

BACKUP_DIR="{self.config.backup_dir}"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/tsijukebox/backup-$DATE.log"

echo "[$DATE] Iniciando backup..." >> "$LOG_FILE"

# Backup de configurações
tar -czf "$BACKUP_DIR/config-$DATE.tar.gz" /etc/tsijukebox/ 2>> "$LOG_FILE"

# Backup de dados
tar -czf "$BACKUP_DIR/data-$DATE.tar.gz" /var/lib/tsijukebox/ 2>> "$LOG_FILE"

# Sincronizar com remotes configurados
for remote in $(rclone listremotes 2>/dev/null); do
    echo "Sincronizando com $remote..." >> "$LOG_FILE"
    rclone sync "$BACKUP_DIR" "${{remote}}tsijukebox-backups/" --log-file="$LOG_FILE" 2>&1
done

# Limpar backups antigos (manter últimos 7)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "[$DATE] Backup concluído!" >> "$LOG_FILE"
"""
        
        script_path = self.config.config_dir / "backup.sh"
        
        if not self.dry_run:
            script_path.write_text(script_content)
            script_path.chmod(0o755)
        
        self._log(f"Script de backup criado: {script_path}", "success")
        return True
    
    # =========================================================================
    # STORJ
    # =========================================================================
    
    def install_storj_uplink(self) -> bool:
        """Instala Storj Uplink CLI."""
        self._log("Instalando Storj Uplink...", "info")
        
        if shutil.which('uplink'):
            self._log("Storj Uplink já instalado", "info")
            return True
        
        # Baixar e instalar
        install_dir = Path("/usr/local/bin")
        temp_zip = Path("/tmp/uplink.zip")
        
        code, _, err = self._run([
            'curl', '-fsSL', '-o', str(temp_zip), self.STORJ_URL
        ])
        
        if code != 0:
            self._log(f"Falha ao baixar Storj: {err}", "error")
            return False
        
        if not self.dry_run:
            self._run(['unzip', '-o', str(temp_zip), '-d', '/tmp/storj'])
            self._run(['mv', '/tmp/storj/uplink', str(install_dir / 'uplink')])
            self._run(['chmod', '+x', str(install_dir / 'uplink')])
            temp_zip.unlink(missing_ok=True)
        
        self._log("Storj Uplink instalado", "success")
        return True
    
    def configure_storj(self, access_grant: str) -> bool:
        """Configura Storj com access grant."""
        self._log("Configurando Storj...", "info")
        
        code, _, err = self._run_as_user([
            'uplink', 'access', 'import', 'tsijukebox', access_grant
        ])
        
        if code != 0:
            self._log(f"Falha ao configurar Storj: {err}", "error")
            return False
        
        self._log("Storj configurado", "success")
        return True
    
    # =========================================================================
    # AWS S3
    # =========================================================================
    
    def install_aws_cli(self) -> bool:
        """Instala AWS CLI."""
        self._log("Instalando AWS CLI...", "info")
        
        if shutil.which('aws'):
            self._log("AWS CLI já instalado", "info")
            return True
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm', 'aws-cli-v2'])
        
        if code != 0:
            # Fallback: pip
            code, _, err = self._run(['pip', 'install', 'awscli'])
        
        if code != 0:
            self._log(f"Falha ao instalar AWS CLI: {err}", "error")
            return False
        
        self._log("AWS CLI instalado", "success")
        return True
    
    def configure_aws(
        self,
        access_key: str,
        secret_key: str,
        region: Optional[str] = None
    ) -> bool:
        """Configura credenciais AWS."""
        self._log("Configurando AWS CLI...", "info")
        
        aws_dir = self.home / ".aws"
        
        if not self.dry_run:
            aws_dir.mkdir(parents=True, exist_ok=True)
            
            # Credentials
            credentials_content = f"""[default]
aws_access_key_id = {access_key}
aws_secret_access_key = {secret_key}
"""
            (aws_dir / "credentials").write_text(credentials_content)
            (aws_dir / "credentials").chmod(0o600)
            
            # Config
            config_content = f"""[default]
region = {region or self.config.aws_region}
output = json
"""
            (aws_dir / "config").write_text(config_content)
        
        self._log("AWS CLI configurado", "success")
        return True
    
    # =========================================================================
    # MEGA
    # =========================================================================
    
    def install_mega(self) -> bool:
        """Instala MEGA tools."""
        self._log("Instalando MEGA tools...", "info")
        
        if shutil.which('megaput'):
            self._log("MEGA tools já instalado", "info")
            return True
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm', 'megatools'])
        
        if code != 0:
            self._log(f"Falha ao instalar MEGA: {err}", "error")
            return False
        
        self._log("MEGA tools instalado", "success")
        return True
    
    def configure_mega(self, email: str, password: str) -> bool:
        """Configura MEGA credentials."""
        mega_rc = self.home / ".megarc"
        
        if not self.dry_run:
            mega_content = f"""[Login]
Username = {email}
Password = {password}
"""
            mega_rc.write_text(mega_content)
            mega_rc.chmod(0o600)
        
        self._log("MEGA configurado", "success")
        return True
    
    # =========================================================================
    # AGENDAMENTO
    # =========================================================================
    
    def setup_cron_backup(self) -> bool:
        """Configura backup agendado via cron/systemd timer."""
        self._log("Configurando backup agendado...", "info")
        
        # Criar systemd timer
        timer_content = f"""[Unit]
Description=TSiJUKEBOX Cloud Backup Timer

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
"""
        
        service_content = f"""[Unit]
Description=TSiJUKEBOX Cloud Backup
After=network.target

[Service]
Type=oneshot
ExecStart={self.config.config_dir}/backup.sh
User=root

[Install]
WantedBy=multi-user.target
"""
        
        if not self.dry_run:
            timer_path = Path("/etc/systemd/system/tsijukebox-backup.timer")
            service_path = Path("/etc/systemd/system/tsijukebox-backup.service")
            
            timer_path.write_text(timer_content)
            service_path.write_text(service_content)
            
            self._run(['systemctl', 'daemon-reload'])
            self._run(['systemctl', 'enable', 'tsijukebox-backup.timer'])
            self._run(['systemctl', 'start', 'tsijukebox-backup.timer'])
        
        self._log("Backup agendado configurado (03:00 diariamente)", "success")
        return True
    
    # =========================================================================
    # SETUP COMPLETO
    # =========================================================================
    
    def full_setup(self) -> bool:
        """Executa instalação completa de backup na nuvem."""
        self._log("Iniciando configuração de backup na nuvem...", "info")
        
        self._ensure_directories()
        
        success = True
        
        for provider in self.config.providers:
            if provider == CloudProvider.RCLONE:
                if not self.install_rclone():
                    success = False
            
            elif provider == CloudProvider.STORJ:
                if not self.install_storj_uplink():
                    success = False
            
            elif provider == CloudProvider.AWS_S3:
                if not self.install_aws_cli():
                    success = False
            
            elif provider == CloudProvider.MEGA:
                if not self.install_mega():
                    success = False
        
        # Criar script de backup
        self.create_rclone_backup_script()
        
        # Configurar agendamento
        if self.config.schedule_enabled:
            self.setup_cron_backup()
        
        self._log("Configuração de backup na nuvem concluída!", "success")
        return success
    
    def get_status(self) -> Dict[str, Any]:
        """Retorna status dos provedores de backup."""
        status = {
            'rclone': shutil.which('rclone') is not None,
            'storj': shutil.which('uplink') is not None,
            'aws': shutil.which('aws') is not None,
            'mega': shutil.which('megaput') is not None,
            'backup_dir_exists': self.config.backup_dir.exists(),
            'timer_active': False,
        }
        
        # Verificar timer
        code, out, _ = self._run(['systemctl', 'is-active', 'tsijukebox-backup.timer'])
        status['timer_active'] = 'active' in out
        
        # Listar remotes do rclone
        if status['rclone']:
            code, out, _ = self._run(['rclone', 'listremotes'])
            status['rclone_remotes'] = out.strip().split('\n') if out.strip() else []
        
        return status


def main():
    """Ponto de entrada para execução standalone."""
    import argparse
    
    parser = argparse.ArgumentParser(description='TSiJUKEBOX Cloud Backup Setup')
    parser.add_argument('--providers', nargs='+', 
                       choices=['rclone', 'storj', 'aws', 'mega'],
                       default=['rclone'], help='Provedores a instalar')
    parser.add_argument('--no-schedule', action='store_true',
                       help='Não configurar backup agendado')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simular sem executar')
    parser.add_argument('--status', action='store_true',
                       help='Mostrar status dos provedores')
    
    args = parser.parse_args()
    
    providers = [CloudProvider(p) for p in args.providers]
    
    config = CloudBackupConfig(
        providers=providers,
        schedule_enabled=not args.no_schedule,
    )
    
    setup = CloudBackupSetup(config=config, dry_run=args.dry_run)
    
    if args.status:
        status = setup.get_status()
        print(json.dumps(status, indent=2))
        return
    
    success = setup.full_setup()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()

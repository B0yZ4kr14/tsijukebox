#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - NTP Time Sync Setup
=============================================
Módulo para configurar sincronização de tempo via NTP.

Suporta: systemd-timesyncd (padrão), chrony, ntpd

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import subprocess
import shutil
from pathlib import Path
from typing import Optional, List, Dict, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime


class NTPProvider(Enum):
    """Provedores NTP suportados."""
    SYSTEMD_TIMESYNCD = "systemd-timesyncd"
    CHRONY = "chrony"
    NTPD = "ntpd"
    UNKNOWN = "unknown"


@dataclass
class TimeInfo:
    """Informações de tempo do sistema."""
    local_time: str
    utc_time: str
    timezone: str
    ntp_enabled: bool
    ntp_synchronized: bool
    provider: NTPProvider


class NTPSetup:
    """
    Configura sincronização de tempo via NTP para TSiJUKEBOX.
    
    Prioridade de provedores:
    1. systemd-timesyncd (padrão em Arch/systemd)
    2. chrony (mais preciso)
    3. ntpd (legado)
    """
    
    # Servidores NTP recomendados
    NTP_SERVERS = [
        "0.arch.pool.ntp.org",
        "1.arch.pool.ntp.org",
        "2.arch.pool.ntp.org",
        "3.arch.pool.ntp.org",
    ]
    
    # Fallback servers
    FALLBACK_SERVERS = [
        "0.pool.ntp.org",
        "1.pool.ntp.org",
        "time.google.com",
        "time.cloudflare.com",
    ]
    
    # Configurações de arquivo
    TIMESYNCD_CONF = Path("/etc/systemd/timesyncd.conf")
    CHRONY_CONF = Path("/etc/chrony.conf")
    NTP_CONF = Path("/etc/ntp.conf")
    
    def __init__(self, logger=None, dry_run: bool = False):
        self.dry_run = dry_run
        self.logger = logger or self._default_logger()
    
    def _default_logger(self):
        """Logger padrão simples."""
        class SimpleLogger:
            def info(self, msg): print(f"[INFO] {msg}")
            def success(self, msg): print(f"[OK] {msg}")
            def warning(self, msg): print(f"[WARN] {msg}")
            def error(self, msg): print(f"[ERROR] {msg}")
            def debug(self, msg): pass
        return SimpleLogger()
    
    def _run_command(
        self, 
        cmd: List[str], 
        capture: bool = True,
        timeout: int = 30
    ) -> Tuple[int, str, str]:
        """Executa comando shell."""
        if self.dry_run:
            self.logger.info(f"[DRY-RUN] {' '.join(cmd)}")
            return 0, "", ""
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                timeout=timeout
            )
            return result.returncode, result.stdout or "", result.stderr or ""
        except subprocess.TimeoutExpired:
            return 1, "", "Timeout"
        except Exception as e:
            return 1, "", str(e)
    
    def detect_provider(self) -> NTPProvider:
        """Detecta qual provedor NTP está instalado/ativo."""
        # Verificar chrony primeiro (mais preciso)
        if shutil.which('chronyd') or shutil.which('chronyc'):
            code, out, _ = self._run_command(['systemctl', 'is-active', 'chronyd'])
            if out.strip() == 'active':
                return NTPProvider.CHRONY
        
        # Verificar systemd-timesyncd (padrão)
        code, out, _ = self._run_command(['systemctl', 'is-active', 'systemd-timesyncd'])
        if out.strip() == 'active':
            return NTPProvider.SYSTEMD_TIMESYNCD
        
        # Verificar ntpd legado
        if shutil.which('ntpd'):
            code, out, _ = self._run_command(['systemctl', 'is-active', 'ntpd'])
            if out.strip() == 'active':
                return NTPProvider.NTPD
        
        return NTPProvider.UNKNOWN
    
    def get_time_info(self) -> TimeInfo:
        """Obtém informações de tempo do sistema."""
        code, out, _ = self._run_command(['timedatectl', 'show', '--no-pager'])
        
        info = {
            'Timezone': 'UTC',
            'NTP': 'no',
            'NTPSynchronized': 'no',
        }
        
        if code == 0:
            for line in out.strip().split('\n'):
                if '=' in line:
                    key, value = line.split('=', 1)
                    info[key] = value
        
        provider = self.detect_provider()
        
        return TimeInfo(
            local_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            utc_time=datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            timezone=info.get('Timezone', 'Unknown'),
            ntp_enabled=info.get('NTP', 'no').lower() == 'yes',
            ntp_synchronized=info.get('NTPSynchronized', 'no').lower() == 'yes',
            provider=provider
        )
    
    def is_synchronized(self) -> bool:
        """Verifica se o tempo está sincronizado."""
        info = self.get_time_info()
        return info.ntp_synchronized
    
    def enable_ntp(self) -> bool:
        """Habilita sincronização NTP via timedatectl."""
        self.logger.info("Habilitando sincronização NTP...")
        
        code, _, err = self._run_command(['sudo', 'timedatectl', 'set-ntp', 'true'])
        
        if code == 0:
            self.logger.success("NTP habilitado via timedatectl")
            return True
        
        self.logger.error(f"Falha ao habilitar NTP: {err}")
        return False
    
    def disable_ntp(self) -> bool:
        """Desabilita sincronização NTP."""
        code, _, err = self._run_command(['sudo', 'timedatectl', 'set-ntp', 'false'])
        
        if code == 0:
            self.logger.success("NTP desabilitado")
            return True
        
        self.logger.error(f"Falha ao desabilitar NTP: {err}")
        return False
    
    def set_timezone(self, timezone: str = "America/Sao_Paulo") -> bool:
        """Define o timezone do sistema."""
        self.logger.info(f"Configurando timezone: {timezone}")
        
        # Verificar se timezone é válido
        code, _, _ = self._run_command(['timedatectl', 'list-timezones'])
        
        code, _, err = self._run_command([
            'sudo', 'timedatectl', 'set-timezone', timezone
        ])
        
        if code == 0:
            self.logger.success(f"Timezone configurado: {timezone}")
            return True
        
        self.logger.error(f"Falha ao configurar timezone: {err}")
        return False
    
    def configure_systemd_timesyncd(self) -> bool:
        """
        Configura systemd-timesyncd (método padrão em Arch).
        
        Este é o método preferido para sistemas com systemd.
        """
        self.logger.info("Configurando systemd-timesyncd...")
        
        # Verificar se systemd-timesyncd está disponível
        code, _, _ = self._run_command(['systemctl', 'cat', 'systemd-timesyncd'])
        if code != 0:
            self.logger.warning("systemd-timesyncd não disponível, instalando...")
            # Em Arch, já vem com systemd
        
        # Criar configuração
        config_content = f"""# TSiJUKEBOX NTP Configuration
# Configurado automaticamente pelo instalador

[Time]
NTP={' '.join(self.NTP_SERVERS)}
FallbackNTP={' '.join(self.FALLBACK_SERVERS)}
RootDistanceMaxSec=5
PollIntervalMinSec=32
PollIntervalMaxSec=2048
"""
        
        if not self.dry_run:
            try:
                # Criar diretório se necessário
                conf_dir = self.TIMESYNCD_CONF.parent / "timesyncd.conf.d"
                conf_dir.mkdir(parents=True, exist_ok=True)
                
                # Escrever configuração em arquivo drop-in
                drop_in = conf_dir / "tsijukebox.conf"
                drop_in.write_text(config_content)
                
                self.logger.success(f"Configuração escrita: {drop_in}")
            except PermissionError:
                # Tentar via sudo
                temp_file = Path("/tmp/timesyncd.conf")
                temp_file.write_text(config_content)
                
                conf_dir = Path("/etc/systemd/timesyncd.conf.d")
                self._run_command(['sudo', 'mkdir', '-p', str(conf_dir)])
                self._run_command(['sudo', 'cp', str(temp_file), str(conf_dir / "tsijukebox.conf")])
                temp_file.unlink()
        
        # Habilitar e iniciar serviço
        self._run_command(['sudo', 'systemctl', 'enable', 'systemd-timesyncd'])
        self._run_command(['sudo', 'systemctl', 'restart', 'systemd-timesyncd'])
        
        # Habilitar NTP
        self.enable_ntp()
        
        self.logger.success("systemd-timesyncd configurado")
        return True
    
    def configure_chrony(self) -> bool:
        """
        Configura chrony (alternativa mais precisa).
        
        Chrony é recomendado para:
        - Sistemas que hibernam/suspendem frequentemente
        - Máquinas virtuais
        - Situações que requerem alta precisão
        """
        self.logger.info("Configurando chrony...")
        
        # Verificar se chrony está instalado
        if not shutil.which('chronyd'):
            self.logger.info("Instalando chrony...")
            code, _, err = self._run_command(['sudo', 'pacman', '-S', '--noconfirm', 'chrony'])
            if code != 0:
                self.logger.error(f"Falha ao instalar chrony: {err}")
                return False
        
        # Criar configuração
        config_content = f"""# TSiJUKEBOX Chrony Configuration
# Configurado automaticamente pelo instalador

# NTP Servers
{'chr '.join(['server ' + s + ' iburst' for s in self.NTP_SERVERS])}

# Fallback servers
{'chr '.join(['server ' + s + ' iburst' for s in self.FALLBACK_SERVERS])}

# Record the rate at which the system clock gains/losses time
driftfile /var/lib/chrony/drift

# Allow the system clock to be stepped in the first three updates
makestep 1.0 3

# Enable kernel synchronisation of the real-time clock (RTC)
rtcsync

# Get TAI-UTC offset and leap seconds from the system tz database
leapsectz right/UTC

# Serve time even if not synchronized to a time source
local stratum 10

# Log files
logdir /var/log/chrony
"""
        
        if not self.dry_run:
            try:
                # Backup configuração existente
                if self.CHRONY_CONF.exists():
                    backup = self.CHRONY_CONF.with_suffix('.conf.bak')
                    self._run_command(['sudo', 'cp', str(self.CHRONY_CONF), str(backup)])
                
                # Escrever nova configuração
                temp_file = Path("/tmp/chrony.conf")
                temp_file.write_text(config_content)
                self._run_command(['sudo', 'cp', str(temp_file), str(self.CHRONY_CONF)])
                temp_file.unlink()
                
            except Exception as e:
                self.logger.error(f"Erro ao configurar chrony: {e}")
                return False
        
        # Desabilitar timesyncd (conflita com chrony)
        self._run_command(['sudo', 'systemctl', 'disable', '--now', 'systemd-timesyncd'])
        
        # Habilitar e iniciar chrony
        self._run_command(['sudo', 'systemctl', 'enable', 'chronyd'])
        self._run_command(['sudo', 'systemctl', 'restart', 'chronyd'])
        
        self.logger.success("chrony configurado")
        return True
    
    def force_sync(self) -> bool:
        """Força sincronização imediata de tempo."""
        self.logger.info("Forçando sincronização de tempo...")
        
        provider = self.detect_provider()
        
        if provider == NTPProvider.CHRONY:
            code, out, _ = self._run_command(['sudo', 'chronyc', 'makestep'])
            if code == 0:
                self.logger.success("Tempo sincronizado via chrony")
                return True
        
        elif provider == NTPProvider.SYSTEMD_TIMESYNCD:
            # Reiniciar serviço força resincronização
            code, _, _ = self._run_command([
                'sudo', 'systemctl', 'restart', 'systemd-timesyncd'
            ])
            if code == 0:
                self.logger.success("Tempo sincronizado via systemd-timesyncd")
                return True
        
        elif provider == NTPProvider.NTPD:
            code, _, _ = self._run_command(['sudo', 'ntpdate', '-u', self.NTP_SERVERS[0]])
            if code == 0:
                self.logger.success("Tempo sincronizado via ntpdate")
                return True
        
        self.logger.warning("Não foi possível forçar sincronização")
        return False
    
    def get_sync_status(self) -> Dict:
        """Obtém status detalhado de sincronização."""
        provider = self.detect_provider()
        status = {
            'provider': provider.value,
            'synchronized': False,
            'offset': None,
            'servers': [],
        }
        
        if provider == NTPProvider.CHRONY:
            code, out, _ = self._run_command(['chronyc', 'tracking'])
            if code == 0:
                for line in out.split('\n'):
                    if 'Leap status' in line and 'Normal' in line:
                        status['synchronized'] = True
                    if 'System time' in line:
                        status['offset'] = line.split(':')[1].strip()
            
            code, out, _ = self._run_command(['chronyc', 'sources'])
            if code == 0:
                status['servers'] = [l for l in out.split('\n') if l.startswith('^')]
        
        elif provider == NTPProvider.SYSTEMD_TIMESYNCD:
            code, out, _ = self._run_command(['timedatectl', 'timesync-status'])
            if code == 0:
                for line in out.split('\n'):
                    if 'Server:' in line:
                        status['servers'].append(line.split(':')[1].strip())
                    if 'Offset:' in line:
                        status['offset'] = line.split(':')[1].strip()
                
                status['synchronized'] = self.is_synchronized()
        
        return status
    
    def full_setup(self, provider: str = 'auto', timezone: Optional[str] = None) -> bool:
        """
        Executa setup completo de NTP.
        
        Args:
            provider: 'auto', 'timesyncd', ou 'chrony'
            timezone: Timezone a configurar (opcional)
        """
        self.logger.info("=== Iniciando setup completo de NTP ===")
        
        # Configurar timezone se especificado
        if timezone:
            self.set_timezone(timezone)
        
        # Selecionar provider
        if provider == 'auto':
            # Preferir timesyncd em sistemas Arch/systemd
            code, _, _ = self._run_command(['systemctl', 'cat', 'systemd-timesyncd'])
            if code == 0:
                provider = 'timesyncd'
            else:
                provider = 'chrony'
        
        # Configurar provider selecionado
        if provider == 'chrony':
            success = self.configure_chrony()
        else:
            success = self.configure_systemd_timesyncd()
        
        if not success:
            return False
        
        # Aguardar sincronização
        import time
        self.logger.info("Aguardando sincronização...")
        time.sleep(3)
        
        # Verificar status
        info = self.get_time_info()
        status = self.get_sync_status()
        
        self.logger.info(f"Provider: {info.provider.value}")
        self.logger.info(f"Timezone: {info.timezone}")
        self.logger.info(f"Sincronizado: {'Sim' if info.ntp_synchronized else 'Não'}")
        
        if status['offset']:
            self.logger.info(f"Offset: {status['offset']}")
        
        self.logger.success("=== Setup de NTP concluído ===")
        return True


def main():
    """Teste do módulo NTP."""
    import argparse
    
    parser = argparse.ArgumentParser(description='NTP Setup para TSiJUKEBOX')
    parser.add_argument('--provider', default='auto', choices=['auto', 'timesyncd', 'chrony'])
    parser.add_argument('--timezone', help='Timezone a configurar')
    parser.add_argument('--dry-run', action='store_true', help='Simular sem executar')
    parser.add_argument('--status', action='store_true', help='Mostrar status atual')
    parser.add_argument('--sync', action='store_true', help='Forçar sincronização')
    
    args = parser.parse_args()
    
    ntp = NTPSetup(dry_run=args.dry_run)
    
    if args.status:
        info = ntp.get_time_info()
        status = ntp.get_sync_status()
        
        print(f"\n=== NTP Status ===")
        print(f"Provider: {info.provider.value}")
        print(f"Timezone: {info.timezone}")
        print(f"Hora local: {info.local_time}")
        print(f"Hora UTC: {info.utc_time}")
        print(f"NTP habilitado: {'Sim' if info.ntp_enabled else 'Não'}")
        print(f"Sincronizado: {'Sim' if info.ntp_synchronized else 'Não'}")
        
        if status['offset']:
            print(f"Offset: {status['offset']}")
        if status['servers']:
            print(f"Servidores: {', '.join(status['servers'][:3])}")
    
    elif args.sync:
        ntp.force_sync()
    
    else:
        success = ntp.full_setup(args.provider, args.timezone)
        exit(0 if success else 1)


if __name__ == "__main__":
    main()

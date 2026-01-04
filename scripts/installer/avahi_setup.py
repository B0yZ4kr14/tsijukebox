#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Avahi/mDNS Setup v6.0.0
Configura descoberta automática de rede via mDNS (midiaserver.local).

Novidades v6.0.0:
- Hostname padrão: midiaserver
- Suporte HTTPS (porta 443)
- Serviço Prometheus
- Integração com SSL Setup
"""

import os
import subprocess
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, List

from .config import Colors, config


@dataclass
class AvahiConfig:
    """Configuração do Avahi v6.0.0"""
    hostname: str = 'midiaserver'  # Alterado em v6.0.0
    domain: str = 'local'
    http_port: int = 443  # HTTPS por padrão em v6.0.0
    https_enabled: bool = True
    enable_ssh: bool = True
    enable_grafana: bool = True
    grafana_port: int = 3000
    enable_prometheus: bool = True  # NOVO em v6.0.0
    prometheus_port: int = 9090  # NOVO em v6.0.0


class AvahiSetup:
    """Gerencia a configuração do Avahi/mDNS v6.0.0"""
    
    VERSION = "6.0.0"
    
    def __init__(self, avahi_config: Optional[AvahiConfig] = None, analytics=None):
        self.config = avahi_config or AvahiConfig()
        self.analytics = analytics
        self.services_dir = Path('/etc/avahi/services')
    
    def _log(self, message: str, color: str = Colors.WHITE):
        """Log colorido"""
        print(f"{color}{message}{Colors.RESET}")
    
    def _run_command(self, cmd: List[str], check: bool = True) -> subprocess.CompletedProcess:
        """Executa comando shell"""
        try:
            result = subprocess.run(cmd, check=check, capture_output=True, text=True)
            return result
        except subprocess.CalledProcessError as e:
            self._log(f"Erro ao executar {' '.join(cmd)}: {e.stderr}", Colors.RED)
            raise
    
    def install_packages(self) -> bool:
        """Instala pacotes do Avahi"""
        self._log("📦 Instalando Avahi...", Colors.CYAN)
        
        packages = [
            'avahi',
            'nss-mdns',
        ]
        
        try:
            self._run_command(['pacman', '-S', '--noconfirm', '--needed'] + packages)
            self._log("✅ Avahi instalado com sucesso", Colors.GREEN)
            return True
        except Exception as e:
            self._log(f"❌ Erro ao instalar Avahi: {e}", Colors.RED)
            return False
    
    def configure_nsswitch(self) -> bool:
        """Configura nsswitch.conf para resolver .local"""
        self._log("📝 Configurando nsswitch.conf...", Colors.CYAN)
        
        nsswitch_path = Path('/etc/nsswitch.conf')
        
        try:
            content = nsswitch_path.read_text()
            
            # Verificar se mdns já está configurado
            if 'mdns' in content:
                self._log("✅ mDNS já configurado em nsswitch.conf", Colors.GREEN)
                return True
            
            # Adicionar mdns_minimal à linha hosts
            new_content = content.replace(
                'hosts: mymachines resolve [!UNAVAIL=return] files myhostname dns',
                'hosts: mymachines mdns_minimal [NOTFOUND=return] resolve [!UNAVAIL=return] files myhostname dns'
            )
            
            # Se não encontrou o padrão exato, tentar outro método
            if new_content == content:
                lines = content.split('\n')
                new_lines = []
                for line in lines:
                    if line.startswith('hosts:') and 'mdns' not in line:
                        # Inserir mdns_minimal após 'hosts:'
                        parts = line.split()
                        if len(parts) > 1:
                            new_line = parts[0] + ' mdns_minimal [NOTFOUND=return] ' + ' '.join(parts[1:])
                            new_lines.append(new_line)
                        else:
                            new_lines.append(line)
                    else:
                        new_lines.append(line)
                new_content = '\n'.join(new_lines)
            
            nsswitch_path.write_text(new_content)
            self._log("✅ nsswitch.conf configurado", Colors.GREEN)
            return True
            
        except Exception as e:
            self._log(f"❌ Erro ao configurar nsswitch.conf: {e}", Colors.RED)
            return False
    
    def set_hostname(self) -> bool:
        """Define o hostname do sistema"""
        self._log(f"🏷️ Definindo hostname para '{self.config.hostname}'...", Colors.CYAN)
        
        try:
            # Definir hostname
            self._run_command(['hostnamectl', 'set-hostname', self.config.hostname])
            
            # Atualizar /etc/hosts
            hosts_path = Path('/etc/hosts')
            content = hosts_path.read_text()
            
            if self.config.hostname not in content:
                new_entry = f"127.0.0.1\t{self.config.hostname}\t{self.config.hostname}.{self.config.domain}\n"
                content = new_entry + content
                hosts_path.write_text(content)
            
            self._log(f"✅ Hostname definido: {self.config.hostname}", Colors.GREEN)
            return True
            
        except Exception as e:
            self._log(f"❌ Erro ao definir hostname: {e}", Colors.RED)
            return False
    
    def create_http_service(self) -> bool:
        """Cria arquivo de serviço HTTP/HTTPS do TSiJUKEBOX"""
        self._log("📝 Criando serviço mDNS do TSiJUKEBOX...", Colors.CYAN)
        
        self.services_dir.mkdir(parents=True, exist_ok=True)
        
        # Determinar tipo de serviço baseado em HTTPS
        service_type = "_https._tcp" if self.config.https_enabled else "_http._tcp"
        protocol = "https" if self.config.https_enabled else "http"
        
        service_content = f"""<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">TSiJUKEBOX on %h</name>
  
  <service>
    <type>{service_type}</type>
    <port>{self.config.http_port}</port>
    <txt-record>path=/</txt-record>
    <txt-record>version={self.VERSION}</txt-record>
    <txt-record>product=TSiJUKEBOX Enterprise</txt-record>
    <txt-record>protocol={protocol}</txt-record>
  </service>
  
  <service>
    <type>_jukebox._tcp</type>
    <port>{self.config.http_port}</port>
    <txt-record>type=music-player</txt-record>
    <txt-record>ssl={str(self.config.https_enabled).lower()}</txt-record>
  </service>
  
</service-group>
"""
        
        service_path = self.services_dir / 'tsijukebox.service'
        service_path.write_text(service_content)
        
        self._log(f"✅ Serviço HTTP/HTTPS criado em {service_path}", Colors.GREEN)
        return True
    
    def create_grafana_service(self) -> bool:
        """Cria arquivo de serviço para Grafana"""
        if not self.config.enable_grafana:
            return True
        
        self._log("📝 Criando serviço mDNS do Grafana...", Colors.CYAN)
        
        service_content = f"""<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">Grafana on %h</name>
  
  <service>
    <type>_http._tcp</type>
    <port>{self.config.grafana_port}</port>
    <txt-record>path=/</txt-record>
    <txt-record>product=Grafana</txt-record>
    <txt-record>version=10.x</txt-record>
  </service>
  
</service-group>
"""
        
        service_path = self.services_dir / 'grafana.service'
        service_path.write_text(service_content)
        
        self._log(f"✅ Serviço Grafana criado", Colors.GREEN)
        return True
    
    def create_prometheus_service(self) -> bool:
        """Cria arquivo de serviço para Prometheus (NOVO em v6.0.0)"""
        if not self.config.enable_prometheus:
            return True
        
        self._log("📝 Criando serviço mDNS do Prometheus...", Colors.CYAN)
        
        service_content = f"""<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">Prometheus on %h</name>
  
  <service>
    <type>_http._tcp</type>
    <port>{self.config.prometheus_port}</port>
    <txt-record>path=/</txt-record>
    <txt-record>product=Prometheus</txt-record>
    <txt-record>version=2.x</txt-record>
    <txt-record>metrics=true</txt-record>
  </service>
  
  <service>
    <type>_prometheus._tcp</type>
    <port>{self.config.prometheus_port}</port>
    <txt-record>scrape=true</txt-record>
  </service>
  
</service-group>
"""
        
        service_path = self.services_dir / 'prometheus.service'
        service_path.write_text(service_content)
        
        self._log(f"✅ Serviço Prometheus criado", Colors.GREEN)
        return True
    
    def create_ssh_service(self) -> bool:
        """Cria arquivo de serviço SSH"""
        if not self.config.enable_ssh:
            return True
        
        self._log("📝 Criando serviço mDNS do SSH...", Colors.CYAN)
        
        service_content = """<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">SSH on %h</name>
  
  <service>
    <type>_ssh._tcp</type>
    <port>22</port>
  </service>
  
</service-group>
"""
        
        service_path = self.services_dir / 'ssh.service'
        service_path.write_text(service_content)
        
        self._log(f"✅ Serviço SSH criado", Colors.GREEN)
        return True
    
    def configure_firewall(self) -> bool:
        """Configura firewall para permitir mDNS"""
        self._log("🔥 Configurando firewall para mDNS...", Colors.CYAN)
        
        try:
            # Verificar se ufw está instalado e ativo
            result = self._run_command(['ufw', 'status'], check=False)
            
            if 'inactive' in result.stdout.lower():
                self._log("⚠️ UFW está inativo, pulando configuração", Colors.YELLOW)
                return True
            
            # Permitir mDNS (porta 5353 UDP)
            self._run_command(['ufw', 'allow', '5353/udp'], check=False)
            
            # Permitir HTTPS se habilitado
            if self.config.https_enabled:
                self._run_command(['ufw', 'allow', '443/tcp'], check=False)
                self._log("✅ Porta HTTPS (443/tcp) liberada", Colors.GREEN)
            
            self._log("✅ Porta mDNS (5353/udp) liberada", Colors.GREEN)
            return True
            
        except FileNotFoundError:
            self._log("⚠️ UFW não instalado, pulando configuração de firewall", Colors.YELLOW)
            return True
        except Exception as e:
            self._log(f"⚠️ Erro ao configurar firewall: {e}", Colors.YELLOW)
            return True  # Não falhar por causa do firewall
    
    def enable_and_start(self) -> bool:
        """Habilita e inicia o serviço Avahi"""
        self._log("🚀 Habilitando e iniciando Avahi...", Colors.CYAN)
        
        try:
            self._run_command(['systemctl', 'enable', 'avahi-daemon'])
            self._run_command(['systemctl', 'start', 'avahi-daemon'])
            self._run_command(['systemctl', 'restart', 'avahi-daemon'])
            
            self._log("✅ Avahi daemon iniciado", Colors.GREEN)
            return True
            
        except Exception as e:
            self._log(f"❌ Erro ao iniciar Avahi: {e}", Colors.RED)
            return False
    
    def verify_setup(self) -> bool:
        """Verifica se a configuração está funcionando"""
        self._log("🔍 Verificando configuração...", Colors.CYAN)
        
        try:
            # Verificar status do serviço
            result = self._run_command(['systemctl', 'is-active', 'avahi-daemon'], check=False)
            
            if 'active' in result.stdout:
                self._log("✅ Avahi daemon está ativo", Colors.GREEN)
            else:
                self._log("❌ Avahi daemon não está ativo", Colors.RED)
                return False
            
            # Listar serviços publicados
            protocol = "https" if self.config.https_enabled else "http"
            self._log(f"\n📡 O sistema estará acessível em:", Colors.CYAN)
            self._log(f"   {protocol}://{self.config.hostname}.{self.config.domain}", Colors.GREEN)
            self._log(f"   {protocol}://{self.config.hostname}.{self.config.domain}:{self.config.grafana_port} (Grafana)", Colors.GREEN)
            
            if self.config.enable_prometheus:
                self._log(f"   {protocol}://{self.config.hostname}.{self.config.domain}:{self.config.prometheus_port} (Prometheus)", Colors.GREEN)
            
            return True
            
        except Exception as e:
            self._log(f"⚠️ Erro na verificação: {e}", Colors.YELLOW)
            return True  # Não falhar por causa da verificação
    
    def setup_full(self) -> bool:
        """Executa configuração completa do Avahi v6.0.0"""
        self._log(f"📡 Iniciando configuração do Avahi/mDNS v{self.VERSION}...", Colors.BOLD + Colors.CYAN)
        
        steps = [
            ('Instalando pacotes', self.install_packages),
            ('Configurando nsswitch', self.configure_nsswitch),
            ('Definindo hostname', self.set_hostname),
            ('Criando serviço HTTP/HTTPS', self.create_http_service),
            ('Criando serviço Grafana', self.create_grafana_service),
            ('Criando serviço Prometheus', self.create_prometheus_service),  # NOVO
            ('Criando serviço SSH', self.create_ssh_service),
            ('Configurando firewall', self.configure_firewall),
            ('Iniciando Avahi', self.enable_and_start),
            ('Verificando configuração', self.verify_setup),
        ]
        
        for step_name, step_func in steps:
            self._log(f"\n🔧 {step_name}...", Colors.YELLOW)
            
            if not step_func():
                self._log(f"❌ Falha em: {step_name}", Colors.RED)
                return False
        
        self._log(f"\n✅ Avahi/mDNS v{self.VERSION} configurado com sucesso!", Colors.BOLD + Colors.GREEN)
        self._log(f"   Hostname: {self.config.hostname}.{self.config.domain}", Colors.GREEN)
        
        if self.config.https_enabled:
            self._log(f"   HTTPS: Habilitado (porta {self.config.http_port})", Colors.GREEN)
        
        if self.analytics:
            self.analytics.track_event('avahi_setup_complete', {
                'hostname': self.config.hostname,
                'https_enabled': self.config.https_enabled,
                'prometheus_enabled': self.config.enable_prometheus,
                'version': self.VERSION,
            })
        
        return True


def main():
    """Função principal para teste"""
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("=" * 60)
    print("  TSiJUKEBOX - Avahi/mDNS Setup Module v6.0.0")
    print("  Hostname: midiaserver.local")
    print("=" * 60)
    print(f"{Colors.RESET}")
    
    setup = AvahiSetup()
    
    if os.geteuid() != 0:
        print(f"{Colors.RED}Este script precisa ser executado como root!{Colors.RESET}")
        return False
    
    return setup.setup_full()


if __name__ == '__main__':
    main()

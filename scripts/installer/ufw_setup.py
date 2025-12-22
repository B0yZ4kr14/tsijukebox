#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - UFW Firewall Setup
============================================
Módulo para configurar UFW (Uncomplicated Firewall).

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import subprocess
import shutil
from pathlib import Path
from typing import Optional, List, Dict, Tuple
from dataclasses import dataclass
from enum import Enum


class FirewallStatus(Enum):
    """Status do firewall."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    NOT_INSTALLED = "not_installed"
    ERROR = "error"


@dataclass
class UFWRule:
    """Representa uma regra UFW."""
    port: int
    protocol: str = "tcp"
    action: str = "allow"
    from_ip: Optional[str] = None
    comment: Optional[str] = None
    
    def to_command(self) -> List[str]:
        """Converte para comando UFW."""
        cmd = ["ufw"]
        
        if self.action == "allow":
            cmd.append("allow")
        else:
            cmd.append("deny")
        
        if self.from_ip:
            cmd.extend(["from", self.from_ip, "to", "any"])
        
        cmd.extend(["port", str(self.port)])
        
        if self.protocol:
            cmd.extend(["proto", self.protocol])
        
        if self.comment:
            cmd.extend(["comment", self.comment])
        
        return cmd


class UFWSetup:
    """
    Configura UFW (Uncomplicated Firewall) para TSiJUKEBOX.
    
    Regras padrão:
    - SSH (22): Permitido
    - HTTP (80): Permitido  
    - HTTPS (443): Permitido
    - TSiJUKEBOX (5173): Permitido
    - Grafana (3000): Permitido
    - Prometheus (9090): Permitido local
    - Node Exporter (9100): Permitido local
    """
    
    # Regras padrão para TSiJUKEBOX
    DEFAULT_RULES: Dict[str, UFWRule] = {
        'ssh': UFWRule(port=22, protocol='tcp', comment='SSH'),
        'http': UFWRule(port=80, protocol='tcp', comment='HTTP'),
        'https': UFWRule(port=443, protocol='tcp', comment='HTTPS'),
        'tsijukebox': UFWRule(port=5173, protocol='tcp', comment='TSiJUKEBOX Web'),
        'grafana': UFWRule(port=3000, protocol='tcp', comment='Grafana'),
        'prometheus': UFWRule(port=9090, protocol='tcp', from_ip='127.0.0.1', comment='Prometheus Local'),
        'node_exporter': UFWRule(port=9100, protocol='tcp', from_ip='127.0.0.1', comment='Node Exporter Local'),
    }
    
    # Perfis de portas por modo
    MODE_PROFILES = {
        'full': ['ssh', 'http', 'https', 'tsijukebox', 'grafana', 'prometheus', 'node_exporter'],
        'kiosk': ['ssh', 'http', 'https', 'tsijukebox', 'grafana'],
        'server': ['ssh', 'http', 'https', 'tsijukebox', 'prometheus', 'node_exporter'],
        'minimal': ['ssh', 'http', 'tsijukebox'],
    }
    
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
        check: bool = False
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
                timeout=60
            )
            return result.returncode, result.stdout or "", result.stderr or ""
        except subprocess.TimeoutExpired:
            return 1, "", "Timeout"
        except Exception as e:
            return 1, "", str(e)
    
    def is_installed(self) -> bool:
        """Verifica se UFW está instalado."""
        return shutil.which('ufw') is not None
    
    def get_status(self) -> FirewallStatus:
        """Obtém status atual do UFW."""
        if not self.is_installed():
            return FirewallStatus.NOT_INSTALLED
        
        code, out, _ = self._run_command(['ufw', 'status'])
        
        if code != 0:
            return FirewallStatus.ERROR
        
        if 'Status: active' in out:
            return FirewallStatus.ACTIVE
        
        return FirewallStatus.INACTIVE
    
    def install(self) -> bool:
        """Instala UFW se não instalado."""
        if self.is_installed():
            self.logger.info("UFW já está instalado")
            return True
        
        self.logger.info("Instalando UFW...")
        
        # Tentar pacman primeiro (Arch)
        code, _, err = self._run_command(['sudo', 'pacman', '-S', '--noconfirm', 'ufw'])
        
        if code == 0:
            self.logger.success("UFW instalado via pacman")
            return True
        
        # Tentar apt (Debian/Ubuntu)
        code, _, err = self._run_command(['sudo', 'apt', 'install', '-y', 'ufw'])
        
        if code == 0:
            self.logger.success("UFW instalado via apt")
            return True
        
        # Tentar dnf (Fedora)
        code, _, err = self._run_command(['sudo', 'dnf', 'install', '-y', 'ufw'])
        
        if code == 0:
            self.logger.success("UFW instalado via dnf")
            return True
        
        self.logger.error(f"Falha ao instalar UFW: {err}")
        return False
    
    def set_defaults(self) -> bool:
        """Configura políticas padrão."""
        self.logger.info("Configurando políticas padrão do UFW...")
        
        # Deny incoming by default
        code1, _, _ = self._run_command(['sudo', 'ufw', 'default', 'deny', 'incoming'])
        
        # Allow outgoing by default
        code2, _, _ = self._run_command(['sudo', 'ufw', 'default', 'allow', 'outgoing'])
        
        if code1 == 0 and code2 == 0:
            self.logger.success("Políticas padrão configuradas (deny incoming, allow outgoing)")
            return True
        
        self.logger.error("Falha ao configurar políticas padrão")
        return False
    
    def add_rule(self, rule: UFWRule) -> bool:
        """Adiciona uma regra ao UFW."""
        cmd = ['sudo'] + rule.to_command()
        
        code, out, err = self._run_command(cmd)
        
        if code == 0:
            self.logger.success(f"Regra adicionada: {rule.comment or rule.port}")
            return True
        
        # Verificar se regra já existe
        if 'Skipping' in out or 'existing' in out.lower():
            self.logger.info(f"Regra já existe: {rule.comment or rule.port}")
            return True
        
        self.logger.error(f"Falha ao adicionar regra {rule.port}: {err}")
        return False
    
    def remove_rule(self, port: int, protocol: str = 'tcp') -> bool:
        """Remove uma regra do UFW."""
        code, _, err = self._run_command([
            'sudo', 'ufw', 'delete', 'allow', str(port) + '/' + protocol
        ])
        
        if code == 0:
            self.logger.success(f"Regra removida: {port}/{protocol}")
            return True
        
        self.logger.warning(f"Falha ao remover regra {port}: {err}")
        return False
    
    def enable(self) -> bool:
        """Ativa o UFW."""
        self.logger.info("Ativando UFW...")
        
        # Usar --force para evitar prompt interativo
        code, _, err = self._run_command(['sudo', 'ufw', '--force', 'enable'])
        
        if code == 0:
            self.logger.success("UFW ativado com sucesso")
            return True
        
        self.logger.error(f"Falha ao ativar UFW: {err}")
        return False
    
    def disable(self) -> bool:
        """Desativa o UFW."""
        code, _, err = self._run_command(['sudo', 'ufw', 'disable'])
        
        if code == 0:
            self.logger.success("UFW desativado")
            return True
        
        self.logger.error(f"Falha ao desativar UFW: {err}")
        return False
    
    def reload(self) -> bool:
        """Recarrega regras do UFW."""
        code, _, err = self._run_command(['sudo', 'ufw', 'reload'])
        
        if code == 0:
            self.logger.success("UFW recarregado")
            return True
        
        self.logger.error(f"Falha ao recarregar UFW: {err}")
        return False
    
    def list_rules(self) -> List[str]:
        """Lista todas as regras ativas."""
        code, out, _ = self._run_command(['sudo', 'ufw', 'status', 'numbered'])
        
        if code != 0:
            return []
        
        rules = []
        for line in out.split('\n'):
            if line.strip() and not line.startswith('Status') and not line.startswith('--'):
                rules.append(line.strip())
        
        return rules
    
    def configure_for_mode(self, mode: str = 'full') -> bool:
        """
        Configura UFW com regras para um modo específico.
        
        Args:
            mode: Modo de instalação (full, kiosk, server, minimal)
        """
        self.logger.info(f"Configurando UFW para modo: {mode}")
        
        # Instalar se necessário
        if not self.is_installed():
            if not self.install():
                return False
        
        # Configurar defaults
        if not self.set_defaults():
            return False
        
        # Obter perfil de regras para o modo
        profile = self.MODE_PROFILES.get(mode, self.MODE_PROFILES['full'])
        
        # Adicionar regras do perfil
        success_count = 0
        for rule_name in profile:
            rule = self.DEFAULT_RULES.get(rule_name)
            if rule:
                if self.add_rule(rule):
                    success_count += 1
        
        self.logger.info(f"Adicionadas {success_count}/{len(profile)} regras")
        
        # Ativar UFW
        if not self.enable():
            return False
        
        self.logger.success(f"UFW configurado para modo {mode}")
        return True
    
    def add_custom_port(
        self, 
        port: int, 
        protocol: str = 'tcp',
        from_ip: Optional[str] = None,
        comment: Optional[str] = None
    ) -> bool:
        """Adiciona uma porta customizada."""
        rule = UFWRule(
            port=port,
            protocol=protocol,
            from_ip=from_ip,
            comment=comment or f"Custom port {port}"
        )
        return self.add_rule(rule)
    
    def configure_rate_limiting(self, port: int = 22) -> bool:
        """
        Configura rate limiting para uma porta (proteção contra brute-force).
        
        Por padrão, limita a 6 conexões em 30 segundos.
        """
        self.logger.info(f"Configurando rate limiting para porta {port}...")
        
        code, _, err = self._run_command([
            'sudo', 'ufw', 'limit', str(port) + '/tcp',
            'comment', f'Rate limit SSH port {port}'
        ])
        
        if code == 0:
            self.logger.success(f"Rate limiting configurado para porta {port}")
            return True
        
        self.logger.error(f"Falha ao configurar rate limiting: {err}")
        return False
    
    def get_summary(self) -> Dict:
        """Retorna resumo da configuração UFW."""
        status = self.get_status()
        rules = self.list_rules() if status == FirewallStatus.ACTIVE else []
        
        return {
            'installed': self.is_installed(),
            'status': status.value,
            'rules_count': len(rules),
            'rules': rules,
        }
    
    def full_setup(self, mode: str = 'full') -> bool:
        """
        Executa setup completo do UFW.
        
        Args:
            mode: Modo de instalação
        """
        self.logger.info("=== Iniciando setup completo do UFW ===")
        
        # Configurar para o modo
        if not self.configure_for_mode(mode):
            return False
        
        # Configurar rate limiting no SSH
        self.configure_rate_limiting(22)
        
        # Exibir resumo
        summary = self.get_summary()
        self.logger.info(f"Status: {summary['status']}")
        self.logger.info(f"Regras ativas: {summary['rules_count']}")
        
        self.logger.success("=== Setup do UFW concluído ===")
        return True


def main():
    """Teste do módulo UFW."""
    import argparse
    
    parser = argparse.ArgumentParser(description='UFW Setup para TSiJUKEBOX')
    parser.add_argument('--mode', default='full', choices=['full', 'kiosk', 'server', 'minimal'])
    parser.add_argument('--dry-run', action='store_true', help='Simular sem executar')
    parser.add_argument('--status', action='store_true', help='Mostrar status atual')
    
    args = parser.parse_args()
    
    ufw = UFWSetup(dry_run=args.dry_run)
    
    if args.status:
        summary = ufw.get_summary()
        print(f"\n=== UFW Status ===")
        print(f"Instalado: {'Sim' if summary['installed'] else 'Não'}")
        print(f"Status: {summary['status']}")
        print(f"Regras: {summary['rules_count']}")
        if summary['rules']:
            print("\nRegras ativas:")
            for rule in summary['rules']:
                print(f"  {rule}")
    else:
        success = ufw.full_setup(args.mode)
        exit(0 if success else 1)


if __name__ == "__main__":
    main()

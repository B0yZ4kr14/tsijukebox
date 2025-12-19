#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Detecção de Sistema e Hardware
Gera log com sugestão de banco de dados baseado no hardware detectado.
"""

import os
import platform
import subprocess
import json
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime

from config import Config, Colors


@dataclass
class HardwareInfo:
    """Informações de hardware do sistema"""
    cpu_model: str = ''
    cpu_cores: int = 0
    cpu_threads: int = 0
    cpu_arch: str = ''
    ram_total_bytes: int = 0
    ram_gb: float = 0.0
    disk_total_bytes: int = 0
    disk_gb: float = 0.0
    disk_type: str = 'unknown'  # ssd, hdd, nvme
    gpu_model: str = ''
    is_arm: bool = False
    is_vm: bool = False


class SystemChecker:
    """Detecta informações do sistema operacional e hardware"""
    
    def __init__(self, log_dir: Path = Config.LOG_DIR):
        self.log_dir = log_dir
        self.log_dir.mkdir(parents=True, exist_ok=True)
    
    def detect_distro(self) -> Dict[str, str]:
        """Detecta a distribuição Linux"""
        distro_info = {
            'name': 'unknown',
            'id': 'unknown',
            'version': '',
            'codename': '',
            'supported': False,
        }
        
        # Ler /etc/os-release
        os_release = Path('/etc/os-release')
        if os_release.exists():
            content = os_release.read_text()
            for line in content.split('\n'):
                if '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"\'')
                    if key == 'NAME':
                        distro_info['name'] = value
                    elif key == 'ID':
                        distro_info['id'] = value.lower()
                    elif key == 'VERSION_ID':
                        distro_info['version'] = value
                    elif key == 'VERSION_CODENAME':
                        distro_info['codename'] = value
        
        # Verificar se é suportada
        supported_ids = ['arch', 'cachyos', 'manjaro', 'endeavouros', 'garuda']
        distro_info['supported'] = any(
            sid in distro_info['id'] for sid in supported_ids
        )
        
        return distro_info
    
    def detect_shell(self) -> str:
        """Detecta o shell padrão do usuário"""
        shell_path = os.environ.get('SHELL', '/bin/bash')
        shell_name = Path(shell_path).name
        return shell_name if shell_name in Config.SUPPORTED_SHELLS else 'bash'
    
    def detect_hardware(self) -> HardwareInfo:
        """Detecta informações de hardware"""
        hw = HardwareInfo()
        
        # CPU
        try:
            with open('/proc/cpuinfo', 'r') as f:
                cpuinfo = f.read()
            
            model_match = re.search(r'model name\s*:\s*(.+)', cpuinfo)
            if model_match:
                hw.cpu_model = model_match.group(1).strip()
            
            hw.cpu_cores = cpuinfo.count('processor')
            hw.cpu_threads = cpuinfo.count('processor')
            
            # Detectar cores físicos vs threads
            cores_match = re.search(r'cpu cores\s*:\s*(\d+)', cpuinfo)
            if cores_match:
                hw.cpu_cores = int(cores_match.group(1))
        except Exception:
            pass
        
        # Arquitetura
        hw.cpu_arch = platform.machine()
        hw.is_arm = hw.cpu_arch.startswith('arm') or hw.cpu_arch.startswith('aarch')
        
        # RAM
        try:
            with open('/proc/meminfo', 'r') as f:
                meminfo = f.read()
            
            match = re.search(r'MemTotal:\s*(\d+)\s*kB', meminfo)
            if match:
                hw.ram_total_bytes = int(match.group(1)) * 1024
                hw.ram_gb = hw.ram_total_bytes / (1024 ** 3)
        except Exception:
            pass
        
        # Disco
        try:
            statvfs = os.statvfs('/')
            hw.disk_total_bytes = statvfs.f_frsize * statvfs.f_blocks
            hw.disk_gb = hw.disk_total_bytes / (1024 ** 3)
            
            # Detectar tipo de disco (SSD/HDD/NVMe)
            hw.disk_type = self._detect_disk_type()
        except Exception:
            pass
        
        # GPU
        try:
            result = subprocess.run(
                ['lspci', '-v'],
                capture_output=True,
                text=True,
                timeout=10
            )
            for line in result.stdout.split('\n'):
                if 'VGA' in line or 'Display' in line or '3D' in line:
                    hw.gpu_model = line.split(':')[-1].strip()
                    break
        except Exception:
            pass
        
        # Verificar se é VM
        hw.is_vm = self._is_virtual_machine()
        
        return hw
    
    def _detect_disk_type(self) -> str:
        """Detecta se o disco principal é SSD, HDD ou NVMe"""
        try:
            # Encontrar dispositivo raiz
            result = subprocess.run(
                ['findmnt', '-n', '-o', 'SOURCE', '/'],
                capture_output=True,
                text=True,
                timeout=5
            )
            root_device = result.stdout.strip()
            
            # Remover partição para obter dispositivo base
            base_device = re.sub(r'p?\d+$', '', root_device)
            device_name = Path(base_device).name
            
            # Verificar rotacional (0 = SSD, 1 = HDD)
            rotational_path = Path(f'/sys/block/{device_name}/queue/rotational')
            if rotational_path.exists():
                is_rotational = rotational_path.read_text().strip() == '1'
                
                # Verificar NVMe
                if 'nvme' in device_name:
                    return 'nvme'
                return 'hdd' if is_rotational else 'ssd'
        except Exception:
            pass
        
        return 'unknown'
    
    def _is_virtual_machine(self) -> bool:
        """Detecta se está rodando em VM"""
        vm_indicators = [
            'VMware', 'VirtualBox', 'QEMU', 'Hyper-V', 'Xen', 'KVM'
        ]
        
        try:
            # Verificar via systemd-detect-virt
            result = subprocess.run(
                ['systemd-detect-virt'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0 and result.stdout.strip() != 'none':
                return True
        except Exception:
            pass
        
        # Verificar via dmesg
        try:
            result = subprocess.run(
                ['dmesg'],
                capture_output=True,
                text=True,
                timeout=10
            )
            for indicator in vm_indicators:
                if indicator.lower() in result.stdout.lower():
                    return True
        except Exception:
            pass
        
        return False
    
    def get_installed_packages(self) -> List[str]:
        """Lista pacotes instalados no sistema"""
        packages = []
        try:
            result = subprocess.run(
                ['pacman', '-Qq'],
                capture_output=True,
                text=True,
                timeout=30
            )
            packages = result.stdout.strip().split('\n')
        except Exception:
            pass
        
        return packages
    
    def check_required_packages(self) -> Dict[str, bool]:
        """Verifica quais pacotes base estão instalados"""
        installed = set(self.get_installed_packages())
        status = {}
        
        for pkg in Config.BASE_PACKAGES:
            status[pkg] = pkg in installed
        
        return status
    
    def suggest_database(self) -> Dict[str, Any]:
        """
        Sugere banco de dados baseado no hardware detectado.
        Gera log detalhado em /var/log/jukebox/hardware.log
        """
        hw = self.detect_hardware()
        
        # Lógica de decisão
        if hw.is_arm or hw.ram_gb < 2:
            recommended = 'sqlite'
            reason = 'RAM limitada ou arquitetura ARM - SQLite é mais leve e eficiente'
            alternatives = []
        elif hw.ram_gb < 4:
            recommended = 'sqlite'
            reason = f'RAM {hw.ram_gb:.1f}GB - SQLite recomendado para melhor performance'
            alternatives = ['mariadb']
        elif hw.ram_gb < 8:
            recommended = 'mariadb'
            reason = f'RAM {hw.ram_gb:.1f}GB - MariaDB oferece bom equilíbrio entre recursos e performance'
            alternatives = ['sqlite', 'postgresql']
        elif hw.ram_gb < 16:
            if hw.disk_type in ['ssd', 'nvme']:
                recommended = 'postgresql'
                reason = f'RAM {hw.ram_gb:.1f}GB + {hw.disk_type.upper()} - PostgreSQL aproveitará bem os recursos'
            else:
                recommended = 'mariadb'
                reason = f'RAM {hw.ram_gb:.1f}GB + HDD - MariaDB é mais tolerante com I/O lento'
            alternatives = ['mariadb', 'postgresql']
        else:
            recommended = 'postgresql'
            reason = f'RAM {hw.ram_gb:.1f}GB + hardware robusto - PostgreSQL oferece recursos avançados'
            alternatives = ['mariadb']
        
        suggestion = {
            'recommended': recommended,
            'reason': reason,
            'alternatives': alternatives,
            'hardware_summary': {
                'cpu': hw.cpu_model,
                'cores': hw.cpu_cores,
                'ram_gb': round(hw.ram_gb, 1),
                'disk_gb': round(hw.disk_gb, 1),
                'disk_type': hw.disk_type,
                'is_arm': hw.is_arm,
                'is_vm': hw.is_vm,
            }
        }
        
        # Gerar log
        self._write_hardware_log(hw, suggestion)
        
        return suggestion
    
    def _write_hardware_log(self, hw: HardwareInfo, suggestion: Dict):
        """Grava log detalhado do hardware e sugestão"""
        log_path = self.log_dir / 'hardware.log'
        
        log_content = f"""
================================================================================
TSiJUKEBOX Hardware Analysis Log
Generated: {datetime.now().isoformat()}
================================================================================

SISTEMA OPERACIONAL
-------------------
{json.dumps(self.detect_distro(), indent=2)}

HARDWARE DETECTADO
------------------
CPU:          {hw.cpu_model}
Cores:        {hw.cpu_cores} cores / {hw.cpu_threads} threads
Arquitetura:  {hw.cpu_arch} {'(ARM)' if hw.is_arm else '(x86_64)'}
RAM:          {hw.ram_gb:.2f} GB
Disco:        {hw.disk_gb:.2f} GB ({hw.disk_type.upper()})
GPU:          {hw.gpu_model or 'Não detectada'}
VM:           {'Sim' if hw.is_vm else 'Não'}

SUGESTÃO DE BANCO DE DADOS
--------------------------
Recomendado:  {suggestion['recommended'].upper()}
Motivo:       {suggestion['reason']}
Alternativas: {', '.join(suggestion['alternatives']) or 'Nenhuma'}

DETALHES TÉCNICOS
-----------------
{json.dumps(suggestion, indent=2)}

================================================================================
"""
        
        log_path.write_text(log_content)
        print(f"{Colors.GREEN}✓ Log de hardware salvo em: {log_path}{Colors.RESET}")
    
    def get_full_report(self) -> Dict[str, Any]:
        """Retorna relatório completo do sistema"""
        return {
            'distro': self.detect_distro(),
            'shell': self.detect_shell(),
            'hardware': self.detect_hardware().__dict__,
            'packages': {
                'installed': len(self.get_installed_packages()),
                'required': self.check_required_packages(),
            },
            'timestamp': datetime.now().isoformat(),
        }


def main():
    """Teste de detecção de sistema"""
    print(f"{Colors.CYAN}=== TSiJUKEBOX System Checker ==={Colors.RESET}\n")
    
    checker = SystemChecker()
    
    # Detectar distro
    distro = checker.detect_distro()
    print(f"{Colors.GREEN}Distro:{Colors.RESET} {distro['name']} ({distro['id']})")
    print(f"{Colors.GREEN}Suportada:{Colors.RESET} {'✓' if distro['supported'] else '✗'}")
    
    # Detectar shell
    shell = checker.detect_shell()
    print(f"{Colors.GREEN}Shell:{Colors.RESET} {shell}")
    
    # Detectar hardware
    hw = checker.detect_hardware()
    print(f"\n{Colors.CYAN}Hardware:{Colors.RESET}")
    print(f"  CPU: {hw.cpu_model}")
    print(f"  Cores: {hw.cpu_cores}")
    print(f"  RAM: {hw.ram_gb:.1f} GB")
    print(f"  Disco: {hw.disk_gb:.1f} GB ({hw.disk_type})")
    print(f"  GPU: {hw.gpu_model or 'N/A'}")
    print(f"  ARM: {'Sim' if hw.is_arm else 'Não'}")
    print(f"  VM: {'Sim' if hw.is_vm else 'Não'}")
    
    # Sugestão de banco
    suggestion = checker.suggest_database()
    print(f"\n{Colors.YELLOW}Banco de dados recomendado:{Colors.RESET}")
    print(f"  {Colors.GREEN}{suggestion['recommended'].upper()}{Colors.RESET}")
    print(f"  Motivo: {suggestion['reason']}")


if __name__ == '__main__':
    main()

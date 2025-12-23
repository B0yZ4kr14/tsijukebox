#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - Hardware Analyzer v6.0.0
=================================================
Analisa hardware do sistema e sugere melhor modo de instalação.

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import re
import subprocess
from pathlib import Path
from typing import List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class HardwareInfo:
    """Informações do hardware detectado."""
    cpu_model: str = ""
    cpu_cores: int = 1
    cpu_threads: int = 1
    ram_gb: float = 0.0
    ram_available_gb: float = 0.0
    disk_total_gb: float = 0.0
    disk_free_gb: float = 0.0
    gpu_vendor: str = ""
    gpu_model: str = ""
    is_raspberry_pi: bool = False
    is_virtual_machine: bool = False
    arch: str = ""
    has_audio_device: bool = False
    has_display: bool = False


@dataclass
class InstallRecommendation:
    """Recomendação de instalação baseada em hardware."""
    mode: str  # 'minimal', 'kiosk', 'full', 'enterprise'
    database: str  # 'sqlite', 'mariadb', 'postgresql'
    audio_backend: str  # 'pipewire', 'pulseaudio', 'alsa'
    skip_components: List[str]
    reason: str
    warnings: List[str]


class HardwareAnalyzer:
    """Analisa hardware e sugere melhor modo de instalação."""
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
    
    def _run_command(self, cmd: List[str]) -> Tuple[int, str, str]:
        """Executa comando shell."""
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return 1, "", str(e)
    
    def _get_cpu_info(self) -> Tuple[str, int, int]:
        """Obtém informações da CPU."""
        model = ""
        cores = 1
        threads = 1
        
        cpuinfo = Path("/proc/cpuinfo")
        if cpuinfo.exists():
            content = cpuinfo.read_text()
            
            # Model name
            match = re.search(r'model name\s*:\s*(.+)', content)
            if match:
                model = match.group(1).strip()
            
            # Count physical cores
            cores = content.count("processor")
            threads = cores
            
            # Try to get actual core count
            match = re.search(r'cpu cores\s*:\s*(\d+)', content)
            if match:
                cores = int(match.group(1))
        
        return model, cores, threads
    
    def _get_memory_info(self) -> Tuple[float, float]:
        """Obtém informações de memória em GB."""
        total_gb = 0.0
        available_gb = 0.0
        
        meminfo = Path("/proc/meminfo")
        if meminfo.exists():
            content = meminfo.read_text()
            
            match = re.search(r'MemTotal:\s*(\d+)', content)
            if match:
                total_gb = int(match.group(1)) / 1024 / 1024
            
            match = re.search(r'MemAvailable:\s*(\d+)', content)
            if match:
                available_gb = int(match.group(1)) / 1024 / 1024
        
        return total_gb, available_gb
    
    def _get_disk_info(self) -> Tuple[float, float]:
        """Obtém informações de disco em GB."""
        try:
            stat = os.statvfs("/")
            total_gb = (stat.f_blocks * stat.f_frsize) / 1024 / 1024 / 1024
            free_gb = (stat.f_bavail * stat.f_frsize) / 1024 / 1024 / 1024
            return total_gb, free_gb
        except:
            return 0.0, 0.0
    
    def _get_gpu_info(self) -> Tuple[str, str]:
        """Detecta GPU."""
        vendor = ""
        model = ""
        
        # Try lspci
        code, out, _ = self._run_command(['lspci'])
        if code == 0:
            for line in out.split('\n'):
                if 'VGA' in line or '3D' in line:
                    if 'NVIDIA' in line.upper():
                        vendor = 'nvidia'
                    elif 'AMD' in line.upper() or 'ATI' in line.upper():
                        vendor = 'amd'
                    elif 'INTEL' in line.upper():
                        vendor = 'intel'
                    model = line.split(':')[-1].strip() if ':' in line else line
                    break
        
        return vendor, model
    
    def _is_raspberry_pi(self) -> bool:
        """Detecta se é Raspberry Pi."""
        model = Path("/proc/device-tree/model")
        if model.exists():
            content = model.read_text().lower()
            return 'raspberry' in content
        
        cpuinfo = Path("/proc/cpuinfo")
        if cpuinfo.exists():
            content = cpuinfo.read_text().lower()
            return 'raspberry' in content or 'bcm2' in content
        
        return False
    
    def _is_virtual_machine(self) -> bool:
        """Detecta se é máquina virtual."""
        # Check systemd-detect-virt
        code, out, _ = self._run_command(['systemd-detect-virt'])
        if code == 0 and out.strip() not in ['none', '']:
            return True
        
        # Check DMI
        dmi = Path("/sys/class/dmi/id/product_name")
        if dmi.exists():
            product = dmi.read_text().lower()
            vm_indicators = ['vmware', 'virtualbox', 'kvm', 'qemu', 'xen', 'hyper-v']
            for indicator in vm_indicators:
                if indicator in product:
                    return True
        
        return False
    
    def _has_audio_device(self) -> bool:
        """Verifica se há dispositivo de áudio."""
        # Check ALSA
        code, out, _ = self._run_command(['aplay', '-l'])
        if code == 0 and 'card' in out.lower():
            return True
        
        # Check /proc/asound
        asound = Path("/proc/asound/cards")
        if asound.exists():
            content = asound.read_text()
            return len(content.strip()) > 0
        
        return False
    
    def _has_display(self) -> bool:
        """Verifica se há display conectado."""
        return os.environ.get('DISPLAY') is not None or Path("/dev/fb0").exists()
    
    def detect_hardware(self) -> HardwareInfo:
        """Detecta todo o hardware do sistema."""
        cpu_model, cpu_cores, cpu_threads = self._get_cpu_info()
        ram_total, ram_available = self._get_memory_info()
        disk_total, disk_free = self._get_disk_info()
        gpu_vendor, gpu_model = self._get_gpu_info()
        
        return HardwareInfo(
            cpu_model=cpu_model,
            cpu_cores=cpu_cores,
            cpu_threads=cpu_threads,
            ram_gb=ram_total,
            ram_available_gb=ram_available,
            disk_total_gb=disk_total,
            disk_free_gb=disk_free,
            gpu_vendor=gpu_vendor,
            gpu_model=gpu_model,
            is_raspberry_pi=self._is_raspberry_pi(),
            is_virtual_machine=self._is_virtual_machine(),
            arch=os.uname().machine,
            has_audio_device=self._has_audio_device(),
            has_display=self._has_display()
        )
    
    def analyze(self, hw: Optional[HardwareInfo] = None) -> InstallRecommendation:
        """Analisa hardware e retorna recomendação de instalação."""
        if hw is None:
            hw = self.detect_hardware()
        
        warnings: List[str] = []
        skip_components: List[str] = []
        
        # Raspberry Pi specific
        if hw.is_raspberry_pi:
            return InstallRecommendation(
                mode='kiosk',
                database='sqlite',
                audio_backend='alsa',
                skip_components=['monitoring', 'voice_control', 'dev_tools'],
                reason='Raspberry Pi detectado - modo kiosk otimizado',
                warnings=['Considere usar cartão SD de alta velocidade']
            )
        
        # Virtual machine
        if hw.is_virtual_machine:
            return InstallRecommendation(
                mode='server',
                database='sqlite' if hw.ram_gb < 4 else 'postgresql',
                audio_backend='pulseaudio',
                skip_components=['kiosk', 'voice_control'] if not hw.has_audio_device else [],
                reason='Máquina virtual detectada - modo servidor',
                warnings=['Áudio pode requerer configuração adicional']
            )
        
        # RAM-based recommendations
        if hw.ram_gb < 2:
            return InstallRecommendation(
                mode='minimal',
                database='sqlite',
                audio_backend='alsa',
                skip_components=['monitoring', 'voice_control', 'dev_tools', 'cloud_backup'],
                reason=f'RAM limitada ({hw.ram_gb:.1f}GB) - instalação mínima',
                warnings=['Sistema pode ficar lento com muitas músicas']
            )
        
        if hw.ram_gb < 4:
            return InstallRecommendation(
                mode='kiosk',
                database='sqlite',
                audio_backend='pipewire',
                skip_components=['dev_tools'],
                reason=f'Hardware modesto ({hw.ram_gb:.1f}GB RAM) - modo kiosk',
                warnings=[]
            )
        
        if hw.ram_gb < 8:
            return InstallRecommendation(
                mode='full',
                database='sqlite',
                audio_backend='pipewire',
                skip_components=[],
                reason=f'Hardware médio ({hw.ram_gb:.1f}GB RAM) - instalação completa',
                warnings=[]
            )
        
        # High-end system
        return InstallRecommendation(
            mode='enterprise',
            database='postgresql',
            audio_backend='pipewire',
            skip_components=[],
            reason=f'Hardware robusto ({hw.ram_gb:.1f}GB RAM) - modo enterprise',
            warnings=[]
        )
    
    def print_report(self, hw: Optional[HardwareInfo] = None):
        """Imprime relatório de hardware."""
        if hw is None:
            hw = self.detect_hardware()
        
        recommendation = self.analyze(hw)
        
        print("\n" + "=" * 60)
        print("  TSiJUKEBOX - Análise de Hardware")
        print("=" * 60)
        
        print(f"\n📊 CPU: {hw.cpu_model}")
        print(f"   Cores: {hw.cpu_cores}, Threads: {hw.cpu_threads}")
        print(f"\n💾 RAM: {hw.ram_gb:.1f} GB (disponível: {hw.ram_available_gb:.1f} GB)")
        print(f"\n💿 Disco: {hw.disk_total_gb:.1f} GB (livre: {hw.disk_free_gb:.1f} GB)")
        print(f"\n🎮 GPU: {hw.gpu_vendor} - {hw.gpu_model}")
        print(f"\n🔊 Áudio: {'Sim' if hw.has_audio_device else 'Não'}")
        print(f"🖥️  Display: {'Sim' if hw.has_display else 'Não'}")
        
        if hw.is_raspberry_pi:
            print("\n🍓 Raspberry Pi detectado!")
        if hw.is_virtual_machine:
            print("\n🖥️  Máquina virtual detectada!")
        
        print("\n" + "-" * 60)
        print("  RECOMENDAÇÃO DE INSTALAÇÃO")
        print("-" * 60)
        print(f"\n✅ Modo: {recommendation.mode.upper()}")
        print(f"📦 Banco de dados: {recommendation.database}")
        print(f"🔊 Backend de áudio: {recommendation.audio_backend}")
        print(f"\n📝 Razão: {recommendation.reason}")
        
        if recommendation.skip_components:
            print(f"\n⏭️  Componentes a pular: {', '.join(recommendation.skip_components)}")
        
        if recommendation.warnings:
            print("\n⚠️  Avisos:")
            for warning in recommendation.warnings:
                print(f"   - {warning}")
        
        print("\n" + "=" * 60)


def main():
    """Teste do módulo de análise de hardware."""
    analyzer = HardwareAnalyzer(verbose=True)
    hw = analyzer.detect_hardware()
    analyzer.print_report(hw)


if __name__ == "__main__":
    main()

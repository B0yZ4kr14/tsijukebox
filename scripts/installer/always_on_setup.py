#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Always-On 24/7 Setup
Configura o sistema para operação contínua sem hibernação ou desligamento de tela.
"""

import os
import subprocess
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, List

from .config import Colors, config


@dataclass
class AlwaysOnConfig:
    """Configuração do modo always-on"""
    disable_dpms: bool = True
    disable_screensaver: bool = True
    disable_suspend: bool = True
    disable_hibernate: bool = True
    ignore_lid_switch: bool = True
    ignore_power_button: bool = False  # Manter power button para emergências
    ignore_idle: bool = True


class AlwaysOnSetup:
    """Gerencia a configuração do modo 24/7"""
    
    def __init__(self, always_on_config: Optional[AlwaysOnConfig] = None, analytics=None):
        self.config = always_on_config or AlwaysOnConfig()
        self.analytics = analytics
    
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
    
    def disable_dpms(self) -> bool:
        """Desabilita DPMS (Display Power Management Signaling)"""
        if not self.config.disable_dpms:
            return True
        
        self._log("🖥️ Desabilitando DPMS...", Colors.CYAN)
        
        # Criar arquivo de configuração do Xorg
        xorg_conf_dir = Path('/etc/X11/xorg.conf.d')
        xorg_conf_dir.mkdir(parents=True, exist_ok=True)
        
        dpms_conf = """# TSiJUKEBOX - Desabilitar DPMS
# Gerado automaticamente pelo instalador

Section "Extensions"
    Option "DPMS" "false"
EndSection

Section "ServerFlags"
    Option "BlankTime" "0"
    Option "StandbyTime" "0"
    Option "SuspendTime" "0"
    Option "OffTime" "0"
EndSection

Section "Monitor"
    Identifier "Monitor0"
    Option "DPMS" "false"
EndSection
"""
        
        dpms_conf_path = xorg_conf_dir / '10-dpms-off.conf'
        dpms_conf_path.write_text(dpms_conf)
        
        self._log(f"✅ DPMS desabilitado em {dpms_conf_path}", Colors.GREEN)
        return True
    
    def disable_screensaver(self) -> bool:
        """Desabilita screensaver"""
        if not self.config.disable_screensaver:
            return True
        
        self._log("🖥️ Desabilitando screensaver...", Colors.CYAN)
        
        # Criar configuração do Xorg para screensaver
        xorg_conf_dir = Path('/etc/X11/xorg.conf.d')
        
        screensaver_conf = """# TSiJUKEBOX - Desabilitar Screensaver
# Gerado automaticamente pelo instalador

Section "ServerLayout"
    Identifier "ServerLayout0"
    Option "BlankTime" "0"
    Option "StandbyTime" "0"
    Option "SuspendTime" "0"
    Option "OffTime" "0"
EndSection
"""
        
        screensaver_conf_path = xorg_conf_dir / '11-screensaver-off.conf'
        screensaver_conf_path.write_text(screensaver_conf)
        
        # Também criar arquivo de autostart para xset
        autostart_dir = Path('/etc/xdg/autostart')
        autostart_dir.mkdir(parents=True, exist_ok=True)
        
        xset_desktop = """[Desktop Entry]
Type=Application
Name=Disable Screensaver
Comment=Disable screensaver and DPMS for TSiJUKEBOX
Exec=/bin/bash -c "xset s off; xset -dpms; xset s noblank"
Terminal=false
NoDisplay=true
X-GNOME-Autostart-enabled=true
"""
        
        xset_desktop_path = autostart_dir / 'tsijukebox-xset.desktop'
        xset_desktop_path.write_text(xset_desktop)
        
        self._log(f"✅ Screensaver desabilitado", Colors.GREEN)
        return True
    
    def disable_system_suspend(self) -> bool:
        """Desabilita suspensão/hibernação do sistema"""
        if not self.config.disable_suspend and not self.config.disable_hibernate:
            return True
        
        self._log("💤 Desabilitando suspensão e hibernação...", Colors.CYAN)
        
        targets_to_mask = []
        
        if self.config.disable_suspend:
            targets_to_mask.extend(['sleep.target', 'suspend.target'])
        
        if self.config.disable_hibernate:
            targets_to_mask.extend(['hibernate.target', 'hybrid-sleep.target'])
        
        for target in targets_to_mask:
            try:
                self._run_command(['systemctl', 'mask', target])
                self._log(f"   ✓ {target} mascarado", Colors.GREEN)
            except Exception as e:
                self._log(f"   ⚠️ Erro ao mascarar {target}: {e}", Colors.YELLOW)
        
        self._log("✅ Suspensão/hibernação desabilitadas", Colors.GREEN)
        return True
    
    def configure_logind(self) -> bool:
        """Configura logind.conf para ignorar eventos de energia"""
        self._log("⚡ Configurando logind.conf...", Colors.CYAN)
        
        logind_conf_dir = Path('/etc/systemd/logind.conf.d')
        logind_conf_dir.mkdir(parents=True, exist_ok=True)
        
        # Construir configuração baseada nas opções
        config_lines = ['[Login]']
        
        if self.config.ignore_lid_switch:
            config_lines.append('HandleLidSwitch=ignore')
            config_lines.append('HandleLidSwitchExternalPower=ignore')
            config_lines.append('HandleLidSwitchDocked=ignore')
        
        if self.config.ignore_power_button:
            config_lines.append('HandlePowerKey=ignore')
        else:
            config_lines.append('HandlePowerKey=poweroff')  # Manter funcional
        
        if self.config.ignore_idle:
            config_lines.append('IdleAction=ignore')
            config_lines.append('IdleActionSec=0')
        
        # Outras configurações úteis
        config_lines.extend([
            'HandleSuspendKey=ignore',
            'HandleHibernateKey=ignore',
            'HandleRebootKey=reboot',
        ])
        
        logind_conf_content = '\n'.join(config_lines) + '\n'
        
        logind_conf_path = logind_conf_dir / 'tsijukebox.conf'
        logind_conf_path.write_text(logind_conf_content)
        
        # Reiniciar systemd-logind para aplicar
        try:
            self._run_command(['systemctl', 'restart', 'systemd-logind'], check=False)
        except Exception:
            self._log("⚠️ Não foi possível reiniciar logind (pode requerer reboot)", Colors.YELLOW)
        
        self._log(f"✅ logind.conf configurado em {logind_conf_path}", Colors.GREEN)
        return True
    
    def disable_kernel_power_management(self) -> bool:
        """Configura parâmetros do kernel para desabilitar gerenciamento de energia"""
        self._log("🔧 Configurando parâmetros do kernel...", Colors.CYAN)
        
        # Criar arquivo de configuração do sysctl
        sysctl_conf = """# TSiJUKEBOX - Configurações de energia do kernel
# Gerado automaticamente pelo instalador

# Desabilitar laptop mode
vm.laptop_mode = 0

# Manter disco sempre ativo
vm.dirty_writeback_centisecs = 1500
"""
        
        sysctl_path = Path('/etc/sysctl.d/99-tsijukebox-power.conf')
        sysctl_path.write_text(sysctl_conf)
        
        # Aplicar configurações
        try:
            self._run_command(['sysctl', '--system'], check=False)
        except Exception:
            pass
        
        self._log("✅ Parâmetros do kernel configurados", Colors.GREEN)
        return True
    
    def create_keep_alive_service(self) -> bool:
        """Cria serviço systemd para manter sistema ativo"""
        self._log("🔄 Criando serviço keep-alive...", Colors.CYAN)
        
        service_content = """[Unit]
Description=TSiJUKEBOX Keep-Alive Service
After=graphical.target

[Service]
Type=simple
ExecStart=/bin/bash -c 'while true; do xdotool mousemove_relative 0 0 2>/dev/null || true; sleep 60; done'
Restart=always
RestartSec=10
User=tsi
Environment=DISPLAY=:0

[Install]
WantedBy=graphical.target
"""
        
        service_path = Path('/etc/systemd/system/tsijukebox-keepalive.service')
        service_path.write_text(service_content)
        
        # Habilitar serviço
        try:
            self._run_command(['systemctl', 'daemon-reload'])
            self._run_command(['systemctl', 'enable', 'tsijukebox-keepalive'])
        except Exception as e:
            self._log(f"⚠️ Erro ao habilitar serviço: {e}", Colors.YELLOW)
        
        self._log("✅ Serviço keep-alive criado", Colors.GREEN)
        return True
    
    def configure_grub_for_always_on(self) -> bool:
        """Configura GRUB para boot otimizado"""
        self._log("🔧 Otimizando configuração do GRUB...", Colors.CYAN)
        
        grub_default = Path('/etc/default/grub')
        
        if not grub_default.exists():
            self._log("⚠️ GRUB não encontrado, pulando...", Colors.YELLOW)
            return True
        
        try:
            content = grub_default.read_text()
            
            # Parâmetros a adicionar
            params_to_add = [
                'consoleblank=0',  # Desabilitar blank do console
                'acpi_osi=',       # Compatibilidade ACPI
            ]
            
            # Verificar linha GRUB_CMDLINE_LINUX_DEFAULT
            new_lines = []
            modified = False
            
            for line in content.split('\n'):
                if line.startswith('GRUB_CMDLINE_LINUX_DEFAULT='):
                    # Extrair valor atual
                    current_value = line.split('=', 1)[1].strip('"\'')
                    
                    # Adicionar novos parâmetros
                    for param in params_to_add:
                        if param not in current_value:
                            current_value += f' {param}'
                            modified = True
                    
                    new_lines.append(f'GRUB_CMDLINE_LINUX_DEFAULT="{current_value.strip()}"')
                else:
                    new_lines.append(line)
            
            if modified:
                grub_default.write_text('\n'.join(new_lines))
                self._log("✅ GRUB configurado (execute 'grub-mkconfig -o /boot/grub/grub.cfg' para aplicar)", Colors.GREEN)
            else:
                self._log("✅ GRUB já está configurado", Colors.GREEN)
            
            return True
            
        except Exception as e:
            self._log(f"⚠️ Erro ao configurar GRUB: {e}", Colors.YELLOW)
            return True  # Não falhar por causa do GRUB
    
    def setup_full(self) -> bool:
        """Executa configuração completa do modo 24/7"""
        self._log("⚡ Iniciando configuração Always-On 24/7...", Colors.BOLD + Colors.CYAN)
        
        steps = [
            ('Desabilitando DPMS', self.disable_dpms),
            ('Desabilitando screensaver', self.disable_screensaver),
            ('Desabilitando suspensão', self.disable_system_suspend),
            ('Configurando logind', self.configure_logind),
            ('Configurando kernel', self.disable_kernel_power_management),
            ('Criando serviço keep-alive', self.create_keep_alive_service),
            ('Otimizando GRUB', self.configure_grub_for_always_on),
        ]
        
        for step_name, step_func in steps:
            self._log(f"\n🔧 {step_name}...", Colors.YELLOW)
            
            if not step_func():
                self._log(f"❌ Falha em: {step_name}", Colors.RED)
                return False
        
        self._log("\n✅ Modo Always-On 24/7 configurado com sucesso!", Colors.BOLD + Colors.GREEN)
        self._log("   O sistema não entrará em standby, hibernação ou desligará a tela.", Colors.GREEN)
        self._log("   ⚠️ Recomenda-se reiniciar para aplicar todas as configurações.", Colors.YELLOW)
        
        if self.analytics:
            self.analytics.track_event('always_on_setup_complete', {
                'dpms_disabled': self.config.disable_dpms,
                'suspend_disabled': self.config.disable_suspend,
            })
        
        return True


def main():
    """Função principal para teste"""
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("=" * 60)
    print("  TSiJUKEBOX - Always-On 24/7 Setup Module")
    print("=" * 60)
    print(f"{Colors.RESET}")
    
    setup = AlwaysOnSetup()
    
    if os.geteuid() != 0:
        print(f"{Colors.RED}Este script precisa ser executado como root!{Colors.RESET}")
        return False
    
    return setup.setup_full()


if __name__ == '__main__':
    main()

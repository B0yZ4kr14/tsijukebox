#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Openbox Window Manager Setup
Configura Openbox para modo kiosk sem decorações de janela.
"""

import os
import subprocess
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, List

from config import Colors, config


@dataclass
class OpenboxConfig:
    """Configuração do Openbox"""
    user: str = 'tsi'
    no_decorations: bool = True
    fullscreen_spotify: bool = True
    context_menu: bool = True  # Menu com click direito
    keyboard_shortcuts: bool = True


class OpenboxSetup:
    """Gerencia a configuração do Openbox"""
    
    def __init__(self, openbox_config: Optional[OpenboxConfig] = None, analytics=None):
        self.config = openbox_config or OpenboxConfig()
        self.analytics = analytics
        self.user_home = Path(f'/home/{self.config.user}')
        self.openbox_dir = self.user_home / '.config' / 'openbox'
    
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
    
    def create_rc_xml(self) -> bool:
        """Cria arquivo rc.xml (configuração principal do Openbox)"""
        self._log("📝 Criando rc.xml...", Colors.CYAN)
        
        self.openbox_dir.mkdir(parents=True, exist_ok=True)
        
        rc_xml_content = """<?xml version="1.0" encoding="UTF-8"?>
<openbox_config xmlns="http://openbox.org/3.4/rc"
                xmlns:xi="http://www.w3.org/2001/XInclude">

  <resistance>
    <strength>10</strength>
    <screen_edge_strength>20</screen_edge_strength>
  </resistance>

  <focus>
    <focusNew>yes</focusNew>
    <followMouse>no</followMouse>
    <focusLast>yes</focusLast>
    <underMouse>no</underMouse>
    <focusDelay>200</focusDelay>
    <raiseOnFocus>no</raiseOnFocus>
  </focus>

  <placement>
    <policy>Smart</policy>
    <center>yes</center>
    <monitor>Primary</monitor>
    <primaryMonitor>1</primaryMonitor>
  </placement>

  <theme>
    <name>Nightmare</name>
    <titleLayout>NLIMC</titleLayout>
    <keepBorder>no</keepBorder>
    <animateIconify>no</animateIconify>
    <font place="ActiveWindow">
      <name>Sans</name>
      <size>10</size>
      <weight>Bold</weight>
      <slant>Normal</slant>
    </font>
    <font place="InactiveWindow">
      <name>Sans</name>
      <size>10</size>
      <weight>Bold</weight>
      <slant>Normal</slant>
    </font>
  </theme>

  <desktops>
    <number>1</number>
    <firstdesk>1</firstdesk>
    <names>
      <name>TSiJUKEBOX</name>
    </names>
    <popupTime>0</popupTime>
  </desktops>

  <resize>
    <drawContents>yes</drawContents>
    <popupShow>Never</popupShow>
    <popupPosition>Center</popupPosition>
    <popupFixedPosition>
      <x>10</x>
      <y>10</y>
    </popupFixedPosition>
  </resize>

  <margins>
    <top>0</top>
    <bottom>0</bottom>
    <left>0</left>
    <right>0</right>
  </margins>

  <dock>
    <position>TopLeft</position>
    <floatingX>0</floatingX>
    <floatingY>0</floatingY>
    <noStrut>no</noStrut>
    <stacking>Above</stacking>
    <direction>Vertical</direction>
    <autoHide>yes</autoHide>
    <hideDelay>300</hideDelay>
    <showDelay>300</showDelay>
    <moveButton>Middle</moveButton>
  </dock>

  <keyboard>
    <!-- Atalhos de emergência -->
    <keybind key="A-F4">
      <action name="Close"/>
    </keybind>
    <keybind key="A-Tab">
      <action name="NextWindow">
        <finalactions>
          <action name="Focus"/>
          <action name="Raise"/>
          <action name="Unshade"/>
        </finalactions>
      </action>
    </keybind>
    <!-- Reiniciar Openbox -->
    <keybind key="C-A-r">
      <action name="Reconfigure"/>
    </keybind>
    <!-- Terminal de emergência -->
    <keybind key="C-A-t">
      <action name="Execute">
        <command>xterm</command>
      </action>
    </keybind>
    <!-- Fullscreen toggle -->
    <keybind key="F11">
      <action name="ToggleFullscreen"/>
    </keybind>
    <!-- Controles de mídia -->
    <keybind key="XF86AudioPlay">
      <action name="Execute">
        <command>dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause</command>
      </action>
    </keybind>
    <keybind key="XF86AudioNext">
      <action name="Execute">
        <command>dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Next</command>
      </action>
    </keybind>
    <keybind key="XF86AudioPrev">
      <action name="Execute">
        <command>dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous</command>
      </action>
    </keybind>
    <keybind key="XF86AudioRaiseVolume">
      <action name="Execute">
        <command>pactl set-sink-volume @DEFAULT_SINK@ +5%</command>
      </action>
    </keybind>
    <keybind key="XF86AudioLowerVolume">
      <action name="Execute">
        <command>pactl set-sink-volume @DEFAULT_SINK@ -5%</command>
      </action>
    </keybind>
    <keybind key="XF86AudioMute">
      <action name="Execute">
        <command>pactl set-sink-mute @DEFAULT_SINK@ toggle</command>
      </action>
    </keybind>
  </keyboard>

  <mouse>
    <dragThreshold>1</dragThreshold>
    <doubleClickTime>500</doubleClickTime>
    <screenEdgeWarpTime>0</screenEdgeWarpTime>
    <screenEdgeWarpMouse>false</screenEdgeWarpMouse>
    
    <context name="Root">
      <mousebind button="Right" action="Press">
        <action name="ShowMenu">
          <menu>root-menu</menu>
        </action>
      </mousebind>
    </context>
    
    <context name="Client">
      <mousebind button="Left" action="Press">
        <action name="Focus"/>
        <action name="Raise"/>
      </mousebind>
    </context>
  </mouse>

  <menu>
    <file>menu.xml</file>
    <hideDelay>200</hideDelay>
    <middle>no</middle>
    <submenuShowDelay>100</submenuShowDelay>
    <submenuHideDelay>400</submenuHideDelay>
    <applicationIcons>yes</applicationIcons>
    <manageDesktops>yes</manageDesktops>
  </menu>

  <applications>
    <!-- Spotify: Sem decorações, fullscreen, sem borda -->
    <application class="Spotify" name="spotify" type="normal">
      <decor>no</decor>
      <shade>no</shade>
      <focus>yes</focus>
      <desktop>1</desktop>
      <layer>normal</layer>
      <iconic>no</iconic>
      <skip_pager>yes</skip_pager>
      <skip_taskbar>yes</skip_taskbar>
      <fullscreen>yes</fullscreen>
      <maximized>true</maximized>
    </application>
    
    <!-- Chromium: Sem decorações para kiosk -->
    <application class="Chromium" name="chromium" type="normal">
      <decor>no</decor>
      <fullscreen>yes</fullscreen>
      <maximized>true</maximized>
    </application>
    
    <!-- Terminal: Manter decorações para emergência -->
    <application class="XTerm" name="xterm" type="normal">
      <decor>yes</decor>
      <focus>yes</focus>
      <layer>above</layer>
    </application>
  </applications>

</openbox_config>
"""
        
        rc_xml_path = self.openbox_dir / 'rc.xml'
        rc_xml_path.write_text(rc_xml_content)
        
        self._log(f"✅ rc.xml criado em {rc_xml_path}", Colors.GREEN)
        return True
    
    def create_menu_xml(self) -> bool:
        """Cria menu.xml (menu de contexto)"""
        self._log("📝 Criando menu.xml...", Colors.CYAN)
        
        menu_xml_content = """<?xml version="1.0" encoding="UTF-8"?>
<openbox_menu xmlns="http://openbox.org/3.4/menu">

  <menu id="root-menu" label="TSiJUKEBOX">
    
    <separator label="🎵 TSiJUKEBOX"/>
    
    <item label="🔄 Reiniciar Player">
      <action name="Execute">
        <command>systemctl --user restart spotify</command>
      </action>
    </item>
    
    <item label="🌐 Abrir Controle Web">
      <action name="Execute">
        <command>chromium --kiosk http://localhost:8080</command>
      </action>
    </item>
    
    <separator/>
    
    <menu id="system-menu" label="⚙️ Sistema">
      <item label="📊 Diagnósticos">
        <action name="Execute">
          <command>chromium http://localhost:8080/settings/diagnostics</command>
        </action>
      </item>
      <item label="📈 Grafana">
        <action name="Execute">
          <command>chromium http://localhost:3000</command>
        </action>
      </item>
      <item label="💻 Terminal">
        <action name="Execute">
          <command>xterm -fa 'Monospace' -fs 12</command>
        </action>
      </item>
    </menu>
    
    <separator/>
    
    <menu id="openbox-menu" label="🪟 Openbox">
      <item label="🔄 Recarregar Configuração">
        <action name="Reconfigure"/>
      </item>
      <item label="🔃 Reiniciar Openbox">
        <action name="Restart"/>
      </item>
    </menu>
    
    <separator/>
    
    <item label="🔴 Desligar Sistema">
      <action name="Execute">
        <command>systemctl poweroff</command>
      </action>
    </item>
    
    <item label="🔁 Reiniciar Sistema">
      <action name="Execute">
        <command>systemctl reboot</command>
      </action>
    </item>
    
  </menu>

</openbox_menu>
"""
        
        menu_xml_path = self.openbox_dir / 'menu.xml'
        menu_xml_path.write_text(menu_xml_content)
        
        self._log(f"✅ menu.xml criado em {menu_xml_path}", Colors.GREEN)
        return True
    
    def create_autostart(self) -> bool:
        """Cria script de autostart do Openbox"""
        self._log("📝 Criando autostart...", Colors.CYAN)
        
        autostart_content = """#!/bin/bash
# TSiJUKEBOX - Openbox Autostart
# Executado automaticamente quando Openbox inicia

# ============================================
# CONFIGURAÇÕES DE DISPLAY
# ============================================

# Desabilitar DPMS (Display Power Management Signaling)
xset -dpms &

# Desabilitar screensaver
xset s off &
xset s noblank &

# Desabilitar bell do sistema
xset b off &

# Esconder cursor após 3 segundos de inatividade
unclutter --timeout 3 --jitter 50 --ignore-scrolling &

# ============================================
# AGUARDAR SERVIÇOS
# ============================================

# Aguardar rede estar disponível
sleep 3

# Aguardar PulseAudio iniciar
while ! pulseaudio --check 2>/dev/null; do
    sleep 1
done

# ============================================
# INICIAR APLICAÇÕES
# ============================================

# Iniciar Spotify
spotify &

# Aguardar Spotify iniciar completamente
sleep 5

# Forçar Spotify para fullscreen
wmctrl -r "Spotify" -b add,maximized_vert,maximized_horz 2>/dev/null
wmctrl -r "Spotify" -b add,fullscreen 2>/dev/null

# ============================================
# LOGS
# ============================================

echo "[$(date)] TSiJUKEBOX Openbox autostart concluído" >> /var/log/jukebox/autostart.log
"""
        
        autostart_path = self.openbox_dir / 'autostart'
        autostart_path.write_text(autostart_content)
        os.chmod(autostart_path, 0o755)
        
        self._log(f"✅ autostart criado em {autostart_path}", Colors.GREEN)
        return True
    
    def fix_permissions(self) -> bool:
        """Corrige permissões dos arquivos de configuração"""
        self._log("🔐 Corrigindo permissões...", Colors.CYAN)
        
        try:
            self._run_command([
                'chown', '-R', 
                f'{self.config.user}:{self.config.user}', 
                str(self.openbox_dir)
            ])
            self._log("✅ Permissões corrigidas", Colors.GREEN)
            return True
        except Exception as e:
            self._log(f"❌ Erro ao corrigir permissões: {e}", Colors.RED)
            return False
    
    def setup_full(self) -> bool:
        """Executa configuração completa do Openbox"""
        self._log("🪟 Iniciando configuração do Openbox...", Colors.BOLD + Colors.CYAN)
        
        steps = [
            ('Criando rc.xml', self.create_rc_xml),
            ('Criando menu.xml', self.create_menu_xml),
            ('Criando autostart', self.create_autostart),
            ('Corrigindo permissões', self.fix_permissions),
        ]
        
        for step_name, step_func in steps:
            self._log(f"\n🔧 {step_name}...", Colors.YELLOW)
            
            if not step_func():
                self._log(f"❌ Falha em: {step_name}", Colors.RED)
                return False
        
        self._log("\n✅ Openbox configurado com sucesso!", Colors.BOLD + Colors.GREEN)
        
        if self.analytics:
            self.analytics.track_event('openbox_setup_complete', {
                'user': self.config.user,
                'fullscreen_spotify': self.config.fullscreen_spotify,
            })
        
        return True


def main():
    """Função principal para teste"""
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("=" * 60)
    print("  TSiJUKEBOX - Openbox Setup Module")
    print("=" * 60)
    print(f"{Colors.RESET}")
    
    setup = OpenboxSetup()
    
    if os.geteuid() != 0:
        print(f"{Colors.RED}Este script precisa ser executado como root!{Colors.RESET}")
        return False
    
    return setup.setup_full()


if __name__ == '__main__':
    main()

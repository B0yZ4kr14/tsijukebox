#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Enterprise - Spicetify Setup
# Handles Spotify customization via Spicetify CLI
# =============================================================================

import subprocess
import os
import shutil
import json
import time
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass

from config import Config
from utils.logger import Logger

@dataclass
class SpicetifyStatus:
    """Spicetify installation status."""
    installed: bool
    version: str
    spotify_path: Path
    config_path: Path
    themes: List[str]
    extensions: List[str]
    applied: bool

class SpicetifySetup:
    """
    Manages Spicetify CLI installation and configuration.
    Provides Spotify theming and extension capabilities.
    """
    
    SPICETIFY_PATH = Path.home() / ".spicetify"
    CONFIG_PATH = Path.home() / ".config" / "spicetify"
    THEMES_PATH = Path.home() / ".config" / "spicetify" / "Themes"
    EXTENSIONS_PATH = Path.home() / ".config" / "spicetify" / "Extensions"
    
    # Default extensions for TSiJUKEBOX
    DEFAULT_EXTENSIONS = [
        "autoSkipVideo.js",
        "bookmark.js",
        "fullAppDisplay.js",
        "keyboardShortcut.js",
        "loopyLoop.js",
        "popupLyrics.js",
        "shuffle+.js",
        "trashbin.js"
    ]
    
    # Recommended themes
    RECOMMENDED_THEMES = [
        "Dribbblish",
        "Sleek",
        "Ziro",
        "Turntable",
        "Bloom"
    ]
    
    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger or Logger()
        self.config = Config()
    
    def _run_command(
        self, 
        cmd: List[str],
        capture: bool = True,
        env: Optional[Dict[str, str]] = None
    ) -> tuple[int, str, str]:
        """Run a shell command."""
        self.logger.debug(f"Running: {' '.join(cmd)}")
        
        full_env = os.environ.copy()
        if env:
            full_env.update(env)
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                env=full_env,
                timeout=300
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            self.logger.error(f"Command failed: {e}")
            return 1, "", str(e)
    
    def is_spotify_installed(self) -> bool:
        """Check if Spotify is installed."""
        # Check common paths
        spotify_paths = [
            Path("/opt/spotify"),
            Path("/usr/share/spotify"),
            Path.home() / ".local" / "share" / "spotify",
            Path("/snap/spotify/current"),
            Path.home() / "snap" / "spotify" / "current"
        ]
        
        for path in spotify_paths:
            if path.exists():
                return True
        
        return shutil.which("spotify") is not None
    
    def is_spicetify_installed(self) -> bool:
        """Check if Spicetify is installed."""
        return shutil.which("spicetify") is not None
    
    def get_status(self) -> SpicetifyStatus:
        """Get Spicetify installation status."""
        installed = self.is_spicetify_installed()
        version = "unknown"
        spotify_path = Path("/opt/spotify")
        themes = []
        extensions = []
        applied = False
        
        if installed:
            # Get version
            code, out, _ = self._run_command(["spicetify", "--version"])
            if code == 0:
                version = out.strip()
            
            # Get Spotify path
            code, out, _ = self._run_command(["spicetify", "config", "spotify_path"])
            if code == 0 and out.strip():
                spotify_path = Path(out.strip())
            
            # List themes
            if self.THEMES_PATH.exists():
                themes = [d.name for d in self.THEMES_PATH.iterdir() if d.is_dir()]
            
            # List extensions
            if self.EXTENSIONS_PATH.exists():
                extensions = [f.name for f in self.EXTENSIONS_PATH.iterdir() if f.suffix == ".js"]
            
            # Check if applied
            backup_path = self.CONFIG_PATH / "Backup"
            applied = backup_path.exists() and any(backup_path.iterdir())
        
        return SpicetifyStatus(
            installed=installed,
            version=version,
            spotify_path=spotify_path,
            config_path=self.CONFIG_PATH,
            themes=themes,
            extensions=extensions,
            applied=applied
        )
    
    def install_spicetify(self) -> bool:
        """Install Spicetify CLI."""
        if self.is_spicetify_installed():
            self.logger.info("Spicetify already installed")
            return True
        
        if not self.is_spotify_installed():
            self.logger.error("Spotify must be installed first")
            return False
        
        self.logger.info("Installing Spicetify...")
        
        # Install via curl (official method)
        install_cmd = "curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh"
        
        code, out, err = self._run_command(
            ["bash", "-c", install_cmd],
            capture=True
        )
        
        if code == 0:
            self.logger.success("Spicetify installed successfully")
            
            # Add to PATH if needed
            self._add_to_path()
            
            return True
        else:
            self.logger.error(f"Spicetify installation failed: {err}")
            
            # Try AUR method
            self.logger.info("Trying AUR installation...")
            code, _, err = self._run_command(
                ["yay", "-S", "--noconfirm", "spicetify-cli"],
                capture=True
            )
            
            return code == 0
    
    def _add_to_path(self) -> None:
        """Add Spicetify to PATH."""
        spicetify_bin = self.SPICETIFY_PATH
        
        # Add to .bashrc
        bashrc = Path.home() / ".bashrc"
        path_line = f'\nexport PATH="$PATH:{spicetify_bin}"\n'
        
        if bashrc.exists():
            content = bashrc.read_text()
            if str(spicetify_bin) not in content:
                bashrc.write_text(content + path_line)
        
        # Also add to current session
        os.environ["PATH"] = f"{os.environ.get('PATH', '')}:{spicetify_bin}"
    
    def backup_spotify(self) -> bool:
        """Create backup of Spotify installation."""
        self.logger.info("Creating Spotify backup...")
        
        code, _, err = self._run_command(["spicetify", "backup"])
        
        if code == 0:
            self.logger.success("Spotify backup created")
            return True
        else:
            self.logger.error(f"Backup failed: {err}")
            return False
    
    def apply_customizations(self) -> bool:
        """Apply Spicetify customizations to Spotify."""
        self.logger.info("Applying Spicetify customizations...")
        
        code, _, err = self._run_command(["spicetify", "apply"])
        
        if code == 0:
            self.logger.success("Customizations applied")
            return True
        else:
            self.logger.error(f"Apply failed: {err}")
            return False
    
    def restore_spotify(self) -> bool:
        """Restore Spotify to original state."""
        self.logger.info("Restoring Spotify...")
        
        code, _, err = self._run_command(["spicetify", "restore"])
        
        if code == 0:
            self.logger.success("Spotify restored")
            return True
        else:
            self.logger.error(f"Restore failed: {err}")
            return False
    
    def install_marketplace(self) -> bool:
        """Install Spicetify Marketplace for easy extension/theme management."""
        self.logger.info("Installing Spicetify Marketplace...")
        
        # Official marketplace installation
        install_cmd = "curl -fsSL https://raw.githubusercontent.com/spicetify/marketplace/main/resources/install.sh | sh"
        
        code, _, err = self._run_command(
            ["bash", "-c", install_cmd],
            capture=True
        )
        
        if code == 0:
            self.logger.success("Marketplace installed")
            
            # Apply to enable marketplace
            self.apply_customizations()
            return True
        else:
            self.logger.error(f"Marketplace installation failed: {err}")
            return False
    
    def install_theme(self, theme_name: str) -> bool:
        """Install a Spicetify theme."""
        self.logger.info(f"Installing theme: {theme_name}")
        
        # Clone theme from spicetify-themes repo
        themes_repo = "https://github.com/spicetify/spicetify-themes.git"
        temp_dir = Path("/tmp/spicetify-themes")
        
        try:
            # Clone if not exists
            if not temp_dir.exists():
                code, _, err = self._run_command(
                    ["git", "clone", "--depth=1", themes_repo, str(temp_dir)],
                    capture=True
                )
                
                if code != 0:
                    self.logger.error(f"Failed to clone themes: {err}")
                    return False
            
            # Find theme
            theme_src = temp_dir / theme_name
            if not theme_src.exists():
                self.logger.error(f"Theme not found: {theme_name}")
                return False
            
            # Copy to themes directory
            self.THEMES_PATH.mkdir(parents=True, exist_ok=True)
            theme_dest = self.THEMES_PATH / theme_name
            
            if theme_dest.exists():
                shutil.rmtree(theme_dest)
            
            shutil.copytree(theme_src, theme_dest)
            
            self.logger.success(f"Theme installed: {theme_name}")
            return True
            
        except Exception as e:
            self.logger.error(f"Theme installation failed: {e}")
            return False
    
    def set_theme(self, theme_name: str, color_scheme: str = "") -> bool:
        """Set the current Spicetify theme."""
        self.logger.info(f"Setting theme: {theme_name}")
        
        code, _, err = self._run_command(
            ["spicetify", "config", "current_theme", theme_name]
        )
        
        if code != 0:
            self.logger.error(f"Failed to set theme: {err}")
            return False
        
        if color_scheme:
            self._run_command(
                ["spicetify", "config", "color_scheme", color_scheme]
            )
        
        # Apply changes
        return self.apply_customizations()
    
    def install_extension(self, extension_url: str) -> bool:
        """Install a Spicetify extension from URL."""
        self.logger.info(f"Installing extension from: {extension_url}")
        
        self.EXTENSIONS_PATH.mkdir(parents=True, exist_ok=True)
        
        # Download extension
        filename = extension_url.split("/")[-1]
        ext_path = self.EXTENSIONS_PATH / filename
        
        code, _, err = self._run_command(
            ["curl", "-sL", "-o", str(ext_path), extension_url],
            capture=True
        )
        
        if code != 0:
            self.logger.error(f"Failed to download extension: {err}")
            return False
        
        # Enable extension
        code, _, err = self._run_command(
            ["spicetify", "config", "extensions", filename]
        )
        
        if code == 0:
            self.logger.success(f"Extension installed: {filename}")
            return True
        else:
            self.logger.error(f"Failed to enable extension: {err}")
            return False
    
    def enable_extension(self, extension_name: str) -> bool:
        """Enable a Spicetify extension."""
        self.logger.info(f"Enabling extension: {extension_name}")
        
        code, _, err = self._run_command(
            ["spicetify", "config", "extensions", extension_name]
        )
        
        return code == 0
    
    def disable_extension(self, extension_name: str) -> bool:
        """Disable a Spicetify extension."""
        self.logger.info(f"Disabling extension: {extension_name}")
        
        code, _, err = self._run_command(
            ["spicetify", "config", "extensions", f"-{extension_name}"]
        )
        
        return code == 0
    
    def setup_for_tsijukebox(self) -> bool:
        """
        Complete Spicetify setup optimized for TSiJUKEBOX.
        Installs marketplace, recommended theme, and extensions.
        """
        self.logger.info("Setting up Spicetify for TSiJUKEBOX...")
        
        # Install Spicetify if needed
        if not self.install_spicetify():
            return False
        
        # Create backup
        if not self.backup_spotify():
            return False
        
        # Install marketplace
        self.install_marketplace()
        
        # Install and set theme
        if self.install_theme("Dribbblish"):
            self.set_theme("Dribbblish", "purple")
        
        # Enable default extensions
        for ext in self.DEFAULT_EXTENSIONS:
            self.enable_extension(ext)
        
        # Apply all changes
        if self.apply_customizations():
            self.logger.success("TSiJUKEBOX Spicetify setup complete!")
            return True
        
        return False
    
    def update_spicetify(self) -> bool:
        """Update Spicetify to latest version."""
        self.logger.info("Updating Spicetify...")
        
        code, _, err = self._run_command(["spicetify", "upgrade"])
        
        if code == 0:
            self.logger.success("Spicetify updated")
            return True
        else:
            self.logger.error(f"Update failed: {err}")
            return False
    
    def get_config(self) -> Dict[str, Any]:
        """Get current Spicetify configuration."""
        config = {}
        
        config_file = self.CONFIG_PATH / "config-xpui.ini"
        if config_file.exists():
            content = config_file.read_text()
            
            for line in content.split("\n"):
                if "=" in line and not line.strip().startswith("["):
                    key, value = line.split("=", 1)
                    config[key.strip()] = value.strip()
        
        return config


def main():
    """Test Spicetify setup functionality."""
    ss = SpicetifySetup()
    
    print("=== Spicetify Setup Test ===\n")
    
    # Check Spotify
    spotify_installed = ss.is_spotify_installed()
    print(f"Spotify installed: {'✓' if spotify_installed else '✗'}")
    
    if not spotify_installed:
        print("\nSpotify must be installed first.")
        print("Install with: yay -S spotify")
        return
    
    # Check Spicetify status
    status = ss.get_status()
    
    print(f"Spicetify installed: {'✓' if status.installed else '✗'}")
    
    if status.installed:
        print(f"  Version: {status.version}")
        print(f"  Spotify path: {status.spotify_path}")
        print(f"  Applied: {'✓' if status.applied else '✗'}")
        print(f"  Themes: {', '.join(status.themes) if status.themes else 'none'}")
        print(f"  Extensions: {len(status.extensions)} installed")
    else:
        print("\nRun with --install to set up Spicetify")


if __name__ == "__main__":
    main()

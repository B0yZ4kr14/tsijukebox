#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Brand Configuration
Configuração dos componentes de marca e splash screen
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, List
from pathlib import Path
import json

from .config import Colors


@dataclass
class BrandConfig:
    """Configuração de marca"""
    splash_enabled: bool = True
    splash_variant: str = 'default'  # default, minimal, cyberpunk, elegant
    splash_duration: int = 3000
    logo_variant: str = 'metal'      # default, ultra, metal, hologram, mirror, etc.
    logo_animation: str = 'splash'   # none, fade, slide-up, glitch, splash, cascade
    tagline_variant: str = 'neon'    # default, subtle, accent, neon, gradient
    tagline_text: Optional[str] = None  # Custom tagline text
    
    # Validação de opções
    VALID_SPLASH_VARIANTS: List[str] = field(default_factory=lambda: [
        'default', 'minimal', 'cyberpunk', 'elegant'
    ])
    VALID_LOGO_VARIANTS: List[str] = field(default_factory=lambda: [
        'default', 'ultra', 'bulge', 'mirror', 'mirror-dark', 
        'silver', 'metal', 'brand', 'hologram'
    ])
    VALID_ANIMATIONS: List[str] = field(default_factory=lambda: [
        'none', 'fade', 'slide-up', 'scale', 'cascade', 'splash', 'glitch'
    ])
    VALID_TAGLINE_VARIANTS: List[str] = field(default_factory=lambda: [
        'default', 'subtle', 'accent', 'neon', 'gradient'
    ])
    
    def validate(self) -> List[str]:
        """Valida configuração e retorna lista de erros"""
        errors = []
        
        if self.splash_variant not in self.VALID_SPLASH_VARIANTS:
            errors.append(f"splash_variant inválido: {self.splash_variant}")
        
        if self.logo_variant not in self.VALID_LOGO_VARIANTS:
            errors.append(f"logo_variant inválido: {self.logo_variant}")
            
        if self.logo_animation not in self.VALID_ANIMATIONS:
            errors.append(f"logo_animation inválido: {self.logo_animation}")
            
        if self.tagline_variant not in self.VALID_TAGLINE_VARIANTS:
            errors.append(f"tagline_variant inválido: {self.tagline_variant}")
            
        if self.splash_duration < 1000 or self.splash_duration > 10000:
            errors.append(f"splash_duration deve estar entre 1000-10000ms")
            
        return errors


class BrandSetup:
    """Gerenciador de configuração de marca"""
    
    def __init__(self, config_dir: Path = Path('/etc/jukebox')):
        self.config_dir = config_dir
        self.brand_config_file = config_dir / 'brand.json'
        
    def get_config(self) -> BrandConfig:
        """Carrega configuração de marca do arquivo"""
        if self.brand_config_file.exists():
            try:
                data = json.loads(self.brand_config_file.read_text())
                return BrandConfig(
                    splash_enabled=data.get('splash_enabled', True),
                    splash_variant=data.get('splash_variant', 'default'),
                    splash_duration=data.get('splash_duration', 3000),
                    logo_variant=data.get('logo_variant', 'metal'),
                    logo_animation=data.get('logo_animation', 'splash'),
                    tagline_variant=data.get('tagline_variant', 'neon'),
                    tagline_text=data.get('tagline_text'),
                )
            except (json.JSONDecodeError, KeyError) as e:
                print(f"{Colors.YELLOW}[BRAND] Erro ao ler config, usando defaults: {e}{Colors.RESET}")
                return BrandConfig()
        return BrandConfig()
    
    def save_config(self, config: BrandConfig) -> bool:
        """Salva configuração de marca"""
        try:
            # Validar antes de salvar
            errors = config.validate()
            if errors:
                for error in errors:
                    print(f"{Colors.RED}[BRAND] Erro de validação: {error}{Colors.RESET}")
                return False
            
            self.config_dir.mkdir(parents=True, exist_ok=True)
            self.brand_config_file.write_text(json.dumps({
                'splash_enabled': config.splash_enabled,
                'splash_variant': config.splash_variant,
                'splash_duration': config.splash_duration,
                'logo_variant': config.logo_variant,
                'logo_animation': config.logo_animation,
                'tagline_variant': config.tagline_variant,
                'tagline_text': config.tagline_text,
            }, indent=2))
            return True
        except Exception as e:
            print(f"{Colors.RED}[BRAND] Erro ao salvar config: {e}{Colors.RESET}")
            return False
    
    def generate_env_vars(self, config: BrandConfig) -> Dict[str, str]:
        """Gera variáveis de ambiente para o build"""
        return {
            'VITE_SPLASH_ENABLED': str(config.splash_enabled).lower(),
            'VITE_SPLASH_VARIANT': config.splash_variant,
            'VITE_SPLASH_DURATION': str(config.splash_duration),
            'VITE_LOGO_VARIANT': config.logo_variant,
            'VITE_LOGO_ANIMATION': config.logo_animation,
            'VITE_TAGLINE_VARIANT': config.tagline_variant,
        }
    
    def generate_dotenv(self, config: BrandConfig) -> str:
        """Gera conteúdo para arquivo .env"""
        env_vars = self.generate_env_vars(config)
        lines = [
            "# TSiJUKEBOX Brand Configuration",
            "# Generated by installer",
            "",
        ]
        for key, value in env_vars.items():
            lines.append(f"{key}={value}")
        return "\n".join(lines)
    
    def print_config_summary(self, config: BrandConfig):
        """Exibe resumo da configuração"""
        print(f"\n{Colors.CYAN}[BRAND] Configuração de Marca:{Colors.RESET}")
        print(f"  Splash Screen: {'Habilitado' if config.splash_enabled else 'Desabilitado'}")
        if config.splash_enabled:
            print(f"    Variante: {config.splash_variant}")
            print(f"    Duração: {config.splash_duration}ms")
        print(f"  Logo:")
        print(f"    Variante: {config.logo_variant}")
        print(f"    Animação: {config.logo_animation}")
        print(f"  Tagline:")
        print(f"    Variante: {config.tagline_variant}")
        if config.tagline_text:
            print(f"    Texto: {config.tagline_text}")


def configure_brand(config_dict: dict, analytics=None) -> BrandConfig:
    """
    Configura componentes de marca baseado no dicionário de configuração.
    Função de conveniência para uso no main.py
    """
    print(f"\n{Colors.CYAN}[BRAND] Configurando componentes de marca...{Colors.RESET}")
    
    brand_setup = BrandSetup()
    brand_config = BrandConfig(
        splash_enabled=config_dict.get('splash_enabled', True),
        splash_variant=config_dict.get('splash_variant', 'default'),
        splash_duration=config_dict.get('splash_duration', 3000),
        logo_variant=config_dict.get('logo_variant', 'metal'),
        logo_animation=config_dict.get('logo_animation', 'splash'),
        tagline_variant=config_dict.get('tagline_variant', 'neon'),
        tagline_text=config_dict.get('tagline_text'),
    )
    
    # Validar
    errors = brand_config.validate()
    if errors:
        print(f"{Colors.YELLOW}[BRAND] Avisos de validação:{Colors.RESET}")
        for error in errors:
            print(f"  - {error}")
    
    # Salvar
    if brand_setup.save_config(brand_config):
        print(f"{Colors.GREEN}✓ Configuração de marca salva{Colors.RESET}")
        brand_setup.print_config_summary(brand_config)
    else:
        print(f"{Colors.RED}✗ Falha ao salvar configuração de marca{Colors.RESET}")
    
    # Analytics
    if analytics:
        analytics.track_config_choice('splash_variant', brand_config.splash_variant)
        analytics.track_config_choice('logo_variant', brand_config.logo_variant)
        analytics.track_config_choice('logo_animation', brand_config.logo_animation)
    
    return brand_config


# Configuração padrão para referência rápida
DEFAULT_BRAND_CONFIG = {
    'splash_enabled': True,
    'splash_variant': 'default',
    'splash_duration': 3000,
    'logo_variant': 'metal',
    'logo_animation': 'splash',
    'tagline_variant': 'neon',
}

# Presets de configuração
BRAND_PRESETS = {
    'default': DEFAULT_BRAND_CONFIG,
    'minimal': {
        'splash_enabled': True,
        'splash_variant': 'minimal',
        'splash_duration': 2000,
        'logo_variant': 'default',
        'logo_animation': 'fade',
        'tagline_variant': 'subtle',
    },
    'cyberpunk': {
        'splash_enabled': True,
        'splash_variant': 'cyberpunk',
        'splash_duration': 3500,
        'logo_variant': 'metal',
        'logo_animation': 'glitch',
        'tagline_variant': 'neon',
    },
    'elegant': {
        'splash_enabled': True,
        'splash_variant': 'elegant',
        'splash_duration': 4000,
        'logo_variant': 'silver',
        'logo_animation': 'cascade',
        'tagline_variant': 'gradient',
    },
    'hologram': {
        'splash_enabled': True,
        'splash_variant': 'cyberpunk',
        'splash_duration': 3500,
        'logo_variant': 'hologram',
        'logo_animation': 'splash',
        'tagline_variant': 'neon',
    },
}

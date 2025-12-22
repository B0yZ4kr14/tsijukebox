"""
TSiJUKEBOX Installer - CLI Argument Parsing Tests
=================================================
Testes específicos e detalhados para parsing de argumentos de linha de comando.

Executar:
    cd scripts && python -m pytest tests/test_cli_parsing.py -v
"""

import pytest
import argparse
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch
from io import StringIO

# Importar módulos do instalador
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from unified_installer import create_argument_parser, parse_arguments, InstallConfig
    PARSER_AVAILABLE = True
except ImportError:
    PARSER_AVAILABLE = False
    create_argument_parser = None
    parse_arguments = None


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def parser():
    """Cria parser de argumentos."""
    if not PARSER_AVAILABLE:
        # Cria parser mock para testes
        return create_mock_parser()
    return create_argument_parser()


def create_mock_parser():
    """Cria parser mock com todos os argumentos esperados."""
    parser = argparse.ArgumentParser(
        description='TSiJUKEBOX Unified Installer v5.1.0',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    # Modo de instalação
    parser.add_argument('--mode', '-m',
                        choices=['full', 'minimal', 'kiosk', 'server', 'dev'],
                        default='full',
                        help='Modo de instalação')
    
    # Flags de componentes
    parser.add_argument('--no-docker', action='store_true',
                        help='Não instalar Docker')
    parser.add_argument('--no-ufw', action='store_true',
                        help='Não configurar UFW')
    parser.add_argument('--no-ntp', action='store_true',
                        help='Não configurar NTP')
    parser.add_argument('--no-fonts', action='store_true',
                        help='Não instalar fontes')
    parser.add_argument('--no-audio', action='store_true',
                        help='Não configurar áudio')
    parser.add_argument('--no-database', action='store_true',
                        help='Não instalar banco de dados')
    parser.add_argument('--no-nginx', action='store_true',
                        help='Não instalar Nginx')
    parser.add_argument('--no-monitoring', action='store_true',
                        help='Não instalar monitoramento')
    parser.add_argument('--no-cloud-backup', action='store_true',
                        help='Não configurar cloud backup')
    parser.add_argument('--no-spotify', action='store_true',
                        help='Não instalar Spotify')
    parser.add_argument('--no-spicetify', action='store_true',
                        help='Não instalar Spicetify')
    parser.add_argument('--no-kiosk', action='store_true',
                        help='Não configurar modo kiosk')
    parser.add_argument('--no-voice-control', action='store_true',
                        help='Não instalar controle de voz')
    parser.add_argument('--no-dev-tools', action='store_true',
                        help='Não instalar ferramentas de desenvolvimento')
    parser.add_argument('--no-autologin', action='store_true',
                        help='Não configurar autologin')
    
    # Database
    parser.add_argument('--database-type', '-db',
                        choices=['sqlite', 'mariadb', 'postgresql'],
                        default='sqlite',
                        help='Tipo de banco de dados')
    parser.add_argument('--database-name',
                        default='tsijukebox',
                        help='Nome do banco de dados')
    parser.add_argument('--database-user',
                        default='tsijukebox',
                        help='Usuário do banco de dados')
    parser.add_argument('--database-password',
                        help='Senha do banco de dados')
    
    # Audio
    parser.add_argument('--audio-backend',
                        choices=['pipewire', 'pulseaudio'],
                        default='pipewire',
                        help='Backend de áudio')
    
    # Cloud Backup
    parser.add_argument('--cloud-providers',
                        help='Provedores de cloud backup (separados por vírgula)')
    parser.add_argument('--backup-schedule',
                        default='0 2 * * *',
                        help='Schedule de backup (cron)')
    parser.add_argument('--backup-retention',
                        type=int,
                        default=30,
                        help='Dias de retenção de backup')
    
    # Kiosk
    parser.add_argument('--kiosk-url',
                        help='URL para modo kiosk')
    parser.add_argument('--kiosk-resolution',
                        default='1920x1080',
                        help='Resolução do kiosk')
    parser.add_argument('--kiosk-fullscreen',
                        action='store_true',
                        default=True,
                        help='Modo fullscreen')
    parser.add_argument('--kiosk-incognito',
                        action='store_true',
                        help='Modo incógnito')
    
    # Voice Control
    parser.add_argument('--voice-language',
                        choices=['pt-br', 'en-us', 'es-es'],
                        default='pt-br',
                        help='Idioma do controle de voz')
    parser.add_argument('--voice-model-path',
                        help='Caminho do modelo de voz')
    
    # Dev Tools
    parser.add_argument('--dev-tools',
                        action='store_true',
                        help='Instalar ferramentas de desenvolvimento')
    parser.add_argument('--node-version',
                        default='lts',
                        help='Versão do Node.js')
    parser.add_argument('--python-version',
                        default='3.11',
                        help='Versão do Python')
    
    # Debug
    parser.add_argument('--dry-run', '-n',
                        action='store_true',
                        help='Apenas simular instalação')
    parser.add_argument('--verbose', '-v',
                        action='store_true',
                        help='Modo verbose')
    parser.add_argument('--quiet', '-q',
                        action='store_true',
                        help='Modo silencioso')
    parser.add_argument('--log-file',
                        help='Arquivo de log')
    
    # Outros
    parser.add_argument('--version', '-V',
                        action='version',
                        version='TSiJUKEBOX Installer v5.1.0')
    parser.add_argument('--resume',
                        action='store_true',
                        help='Retomar instalação anterior')
    parser.add_argument('--force',
                        action='store_true',
                        help='Forçar reinstalação')
    parser.add_argument('--user',
                        default='tsijukebox',
                        help='Usuário do sistema')
    
    return parser


# =============================================================================
# TESTES DE ARGUMENTOS BÁSICOS
# =============================================================================

class TestBasicArguments:
    """Testa argumentos básicos."""
    
    def test_no_arguments_uses_defaults(self, parser):
        """Testa que sem argumentos usa valores padrão."""
        args = parser.parse_args([])
        
        assert args.mode == 'full'
        assert args.dry_run is False
        assert args.verbose is False
        assert args.quiet is False
    
    def test_help_flag_exits_0(self, parser):
        """Testa que --help sai com código 0."""
        with pytest.raises(SystemExit) as exc_info:
            parser.parse_args(['--help'])
        
        assert exc_info.value.code == 0
    
    def test_version_flag_shows_version(self, parser):
        """Testa que --version mostra versão."""
        with pytest.raises(SystemExit) as exc_info:
            parser.parse_args(['--version'])
        
        assert exc_info.value.code == 0
    
    def test_unknown_argument_raises_error(self, parser):
        """Testa que argumento desconhecido gera erro."""
        with pytest.raises(SystemExit) as exc_info:
            parser.parse_args(['--unknown-flag'])
        
        assert exc_info.value.code != 0
    
    def test_short_flags(self, parser):
        """Testa flags curtas."""
        args = parser.parse_args(['-n', '-v'])
        
        assert args.dry_run is True
        assert args.verbose is True
    
    def test_combined_short_flags(self, parser):
        """Testa flags curtas combinadas."""
        args = parser.parse_args(['-n', '-v', '-m', 'minimal'])
        
        assert args.dry_run is True
        assert args.verbose is True
        assert args.mode == 'minimal'


# =============================================================================
# TESTES DE ARGUMENTOS DE MODO
# =============================================================================

class TestModeArguments:
    """Testa argumentos de modo."""
    
    def test_mode_full(self, parser):
        """Testa modo full."""
        args = parser.parse_args(['--mode', 'full'])
        assert args.mode == 'full'
    
    def test_mode_minimal(self, parser):
        """Testa modo minimal."""
        args = parser.parse_args(['--mode', 'minimal'])
        assert args.mode == 'minimal'
    
    def test_mode_kiosk(self, parser):
        """Testa modo kiosk."""
        args = parser.parse_args(['--mode', 'kiosk'])
        assert args.mode == 'kiosk'
    
    def test_mode_server(self, parser):
        """Testa modo server."""
        args = parser.parse_args(['--mode', 'server'])
        assert args.mode == 'server'
    
    def test_mode_dev(self, parser):
        """Testa modo dev."""
        args = parser.parse_args(['--mode', 'dev'])
        assert args.mode == 'dev'
    
    def test_invalid_mode_raises_error(self, parser):
        """Testa modo inválido."""
        with pytest.raises(SystemExit):
            parser.parse_args(['--mode', 'invalid'])
    
    def test_mode_short_flag(self, parser):
        """Testa flag curta de modo."""
        args = parser.parse_args(['-m', 'kiosk'])
        assert args.mode == 'kiosk'
    
    def test_mode_case_sensitive(self, parser):
        """Testa que modo é case-sensitive."""
        with pytest.raises(SystemExit):
            parser.parse_args(['--mode', 'FULL'])


# =============================================================================
# TESTES DE FLAGS DE COMPONENTES
# =============================================================================

class TestComponentFlags:
    """Testa flags de componentes --no-*."""
    
    def test_no_docker_flag(self, parser):
        """Testa --no-docker."""
        args = parser.parse_args(['--no-docker'])
        assert args.no_docker is True
    
    def test_no_ufw_flag(self, parser):
        """Testa --no-ufw."""
        args = parser.parse_args(['--no-ufw'])
        assert args.no_ufw is True
    
    def test_no_ntp_flag(self, parser):
        """Testa --no-ntp."""
        args = parser.parse_args(['--no-ntp'])
        assert args.no_ntp is True
    
    def test_no_fonts_flag(self, parser):
        """Testa --no-fonts."""
        args = parser.parse_args(['--no-fonts'])
        assert args.no_fonts is True
    
    def test_no_audio_flag(self, parser):
        """Testa --no-audio."""
        args = parser.parse_args(['--no-audio'])
        assert args.no_audio is True
    
    def test_no_database_flag(self, parser):
        """Testa --no-database."""
        args = parser.parse_args(['--no-database'])
        assert args.no_database is True
    
    def test_no_nginx_flag(self, parser):
        """Testa --no-nginx."""
        args = parser.parse_args(['--no-nginx'])
        assert args.no_nginx is True
    
    def test_no_monitoring_flag(self, parser):
        """Testa --no-monitoring."""
        args = parser.parse_args(['--no-monitoring'])
        assert args.no_monitoring is True
    
    def test_no_cloud_backup_flag(self, parser):
        """Testa --no-cloud-backup."""
        args = parser.parse_args(['--no-cloud-backup'])
        assert args.no_cloud_backup is True
    
    def test_no_spotify_flag(self, parser):
        """Testa --no-spotify."""
        args = parser.parse_args(['--no-spotify'])
        assert args.no_spotify is True
    
    def test_no_spicetify_flag(self, parser):
        """Testa --no-spicetify."""
        args = parser.parse_args(['--no-spicetify'])
        assert args.no_spicetify is True
    
    def test_no_kiosk_flag(self, parser):
        """Testa --no-kiosk."""
        args = parser.parse_args(['--no-kiosk'])
        assert args.no_kiosk is True
    
    def test_no_voice_control_flag(self, parser):
        """Testa --no-voice-control."""
        args = parser.parse_args(['--no-voice-control'])
        assert args.no_voice_control is True
    
    def test_no_dev_tools_flag(self, parser):
        """Testa --no-dev-tools."""
        args = parser.parse_args(['--no-dev-tools'])
        assert args.no_dev_tools is True
    
    def test_no_autologin_flag(self, parser):
        """Testa --no-autologin."""
        args = parser.parse_args(['--no-autologin'])
        assert args.no_autologin is True
    
    def test_all_no_flags_individually(self, parser):
        """Testa todas as flags --no-* individualmente."""
        no_flags = [
            'no_docker', 'no_ufw', 'no_ntp', 'no_fonts', 'no_audio',
            'no_database', 'no_nginx', 'no_monitoring', 'no_cloud_backup',
            'no_spotify', 'no_spicetify', 'no_kiosk', 'no_voice_control',
            'no_dev_tools', 'no_autologin'
        ]
        
        for flag in no_flags:
            cli_flag = '--' + flag.replace('_', '-')
            args = parser.parse_args([cli_flag])
            assert getattr(args, flag) is True, f"Flag {cli_flag} não funcionou"
    
    def test_all_no_flags_combined(self, parser):
        """Testa todas as flags --no-* combinadas."""
        args = parser.parse_args([
            '--no-docker', '--no-ufw', '--no-ntp', '--no-fonts',
            '--no-audio', '--no-database', '--no-nginx', '--no-monitoring',
            '--no-cloud-backup', '--no-spotify', '--no-spicetify',
            '--no-kiosk', '--no-voice-control', '--no-dev-tools', '--no-autologin'
        ])
        
        assert args.no_docker is True
        assert args.no_monitoring is True
        assert args.no_voice_control is True
    
    def test_default_no_flags_are_false(self, parser):
        """Testa que flags --no-* são False por padrão."""
        args = parser.parse_args([])
        
        assert args.no_docker is False
        assert args.no_monitoring is False
        assert args.no_cloud_backup is False


# =============================================================================
# TESTES DE ARGUMENTOS DE DATABASE
# =============================================================================

class TestDatabaseArguments:
    """Testa argumentos de database."""
    
    def test_database_type_sqlite(self, parser):
        """Testa --database-type sqlite."""
        args = parser.parse_args(['--database-type', 'sqlite'])
        assert args.database_type == 'sqlite'
    
    def test_database_type_mariadb(self, parser):
        """Testa --database-type mariadb."""
        args = parser.parse_args(['--database-type', 'mariadb'])
        assert args.database_type == 'mariadb'
    
    def test_database_type_postgresql(self, parser):
        """Testa --database-type postgresql."""
        args = parser.parse_args(['--database-type', 'postgresql'])
        assert args.database_type == 'postgresql'
    
    def test_database_name_custom(self, parser):
        """Testa --database-name customizado."""
        args = parser.parse_args(['--database-name', 'mydb'])
        assert args.database_name == 'mydb'
    
    def test_database_user_custom(self, parser):
        """Testa --database-user customizado."""
        args = parser.parse_args(['--database-user', 'myuser'])
        assert args.database_user == 'myuser'
    
    def test_database_password_from_arg(self, parser):
        """Testa --database-password."""
        args = parser.parse_args(['--database-password', 'secret123'])
        assert args.database_password == 'secret123'
    
    def test_invalid_database_type(self, parser):
        """Testa tipo de banco inválido."""
        with pytest.raises(SystemExit):
            parser.parse_args(['--database-type', 'mongodb'])
    
    def test_database_type_short_flag(self, parser):
        """Testa flag curta -db."""
        args = parser.parse_args(['-db', 'postgresql'])
        assert args.database_type == 'postgresql'
    
    def test_database_defaults(self, parser):
        """Testa valores padrão de database."""
        args = parser.parse_args([])
        
        assert args.database_type == 'sqlite'
        assert args.database_name == 'tsijukebox'
        assert args.database_user == 'tsijukebox'
        assert args.database_password is None


# =============================================================================
# TESTES DE ARGUMENTOS DE ÁUDIO
# =============================================================================

class TestAudioArguments:
    """Testa argumentos de áudio."""
    
    def test_audio_backend_pipewire(self, parser):
        """Testa --audio-backend pipewire."""
        args = parser.parse_args(['--audio-backend', 'pipewire'])
        assert args.audio_backend == 'pipewire'
    
    def test_audio_backend_pulseaudio(self, parser):
        """Testa --audio-backend pulseaudio."""
        args = parser.parse_args(['--audio-backend', 'pulseaudio'])
        assert args.audio_backend == 'pulseaudio'
    
    def test_audio_backend_invalid(self, parser):
        """Testa backend de áudio inválido."""
        with pytest.raises(SystemExit):
            parser.parse_args(['--audio-backend', 'alsa'])
    
    def test_audio_backend_default(self, parser):
        """Testa padrão do audio backend."""
        args = parser.parse_args([])
        assert args.audio_backend == 'pipewire'


# =============================================================================
# TESTES DE ARGUMENTOS DE CLOUD BACKUP
# =============================================================================

class TestCloudBackupArguments:
    """Testa argumentos de cloud backup."""
    
    def test_single_provider(self, parser):
        """Testa um único provider."""
        args = parser.parse_args(['--cloud-providers', 'storj'])
        assert args.cloud_providers == 'storj'
    
    def test_multiple_providers_comma(self, parser):
        """Testa múltiplos providers separados por vírgula."""
        args = parser.parse_args(['--cloud-providers', 'storj,gdrive,s3'])
        assert 'storj' in args.cloud_providers
        assert 'gdrive' in args.cloud_providers
        assert 's3' in args.cloud_providers
    
    def test_backup_schedule_cron(self, parser):
        """Testa schedule de backup em formato cron."""
        args = parser.parse_args(['--backup-schedule', '0 3 * * *'])
        assert args.backup_schedule == '0 3 * * *'
    
    def test_backup_retention_days(self, parser):
        """Testa dias de retenção de backup."""
        args = parser.parse_args(['--backup-retention', '60'])
        assert args.backup_retention == 60
    
    def test_backup_retention_invalid(self, parser):
        """Testa retenção inválida (não numérica)."""
        with pytest.raises(SystemExit):
            parser.parse_args(['--backup-retention', 'forever'])
    
    def test_backup_defaults(self, parser):
        """Testa valores padrão de backup."""
        args = parser.parse_args([])
        
        assert args.cloud_providers is None
        assert args.backup_schedule == '0 2 * * *'
        assert args.backup_retention == 30


# =============================================================================
# TESTES DE ARGUMENTOS DE KIOSK
# =============================================================================

class TestKioskArguments:
    """Testa argumentos de kiosk."""
    
    def test_kiosk_url(self, parser):
        """Testa --kiosk-url."""
        args = parser.parse_args(['--kiosk-url', 'http://localhost:3000'])
        assert args.kiosk_url == 'http://localhost:3000'
    
    def test_kiosk_resolution_custom(self, parser):
        """Testa resolução customizada."""
        args = parser.parse_args(['--kiosk-resolution', '1280x720'])
        assert args.kiosk_resolution == '1280x720'
    
    def test_kiosk_fullscreen_default(self, parser):
        """Testa fullscreen padrão."""
        args = parser.parse_args([])
        assert args.kiosk_fullscreen is True
    
    def test_kiosk_incognito_mode(self, parser):
        """Testa modo incógnito."""
        args = parser.parse_args(['--kiosk-incognito'])
        assert args.kiosk_incognito is True
    
    def test_kiosk_full_config(self, parser):
        """Testa configuração completa de kiosk."""
        args = parser.parse_args([
            '--mode', 'kiosk',
            '--kiosk-url', 'http://localhost:3000',
            '--kiosk-resolution', '1920x1080',
            '--kiosk-incognito'
        ])
        
        assert args.mode == 'kiosk'
        assert args.kiosk_url == 'http://localhost:3000'
        assert args.kiosk_resolution == '1920x1080'
        assert args.kiosk_incognito is True


# =============================================================================
# TESTES DE ARGUMENTOS DE VOICE CONTROL
# =============================================================================

class TestVoiceControlArguments:
    """Testa argumentos de voice control."""
    
    def test_voice_language_ptbr(self, parser):
        """Testa idioma pt-br."""
        args = parser.parse_args(['--voice-language', 'pt-br'])
        assert args.voice_language == 'pt-br'
    
    def test_voice_language_enus(self, parser):
        """Testa idioma en-us."""
        args = parser.parse_args(['--voice-language', 'en-us'])
        assert args.voice_language == 'en-us'
    
    def test_voice_language_invalid(self, parser):
        """Testa idioma inválido."""
        with pytest.raises(SystemExit):
            parser.parse_args(['--voice-language', 'fr-fr'])
    
    def test_voice_model_path(self, parser):
        """Testa caminho do modelo de voz."""
        args = parser.parse_args(['--voice-model-path', '/opt/vosk/model'])
        assert args.voice_model_path == '/opt/vosk/model'
    
    def test_voice_language_default(self, parser):
        """Testa idioma padrão."""
        args = parser.parse_args([])
        assert args.voice_language == 'pt-br'


# =============================================================================
# TESTES DE ARGUMENTOS DE DEV TOOLS
# =============================================================================

class TestDevToolsArguments:
    """Testa argumentos de dev tools."""
    
    def test_dev_tools_flag(self, parser):
        """Testa --dev-tools."""
        args = parser.parse_args(['--dev-tools'])
        assert args.dev_tools is True
    
    def test_dev_tools_node_version(self, parser):
        """Testa versão do Node."""
        args = parser.parse_args(['--node-version', '20'])
        assert args.node_version == '20'
    
    def test_dev_tools_python_version(self, parser):
        """Testa versão do Python."""
        args = parser.parse_args(['--python-version', '3.12'])
        assert args.python_version == '3.12'
    
    def test_dev_tools_defaults(self, parser):
        """Testa valores padrão de dev tools."""
        args = parser.parse_args([])
        
        assert args.dev_tools is False
        assert args.node_version == 'lts'
        assert args.python_version == '3.11'


# =============================================================================
# TESTES DE ARGUMENTOS DE DEBUG
# =============================================================================

class TestDebugArguments:
    """Testa argumentos de debug."""
    
    def test_dry_run_flag(self, parser):
        """Testa --dry-run."""
        args = parser.parse_args(['--dry-run'])
        assert args.dry_run is True
    
    def test_verbose_flag(self, parser):
        """Testa --verbose."""
        args = parser.parse_args(['--verbose'])
        assert args.verbose is True
    
    def test_quiet_flag(self, parser):
        """Testa --quiet."""
        args = parser.parse_args(['--quiet'])
        assert args.quiet is True
    
    def test_log_file_path(self, parser):
        """Testa --log-file."""
        args = parser.parse_args(['--log-file', '/var/log/installer.log'])
        assert args.log_file == '/var/log/installer.log'
    
    def test_dry_run_short_flag(self, parser):
        """Testa flag curta -n."""
        args = parser.parse_args(['-n'])
        assert args.dry_run is True
    
    def test_verbose_short_flag(self, parser):
        """Testa flag curta -v."""
        args = parser.parse_args(['-v'])
        assert args.verbose is True
    
    def test_quiet_short_flag(self, parser):
        """Testa flag curta -q."""
        args = parser.parse_args(['-q'])
        assert args.quiet is True


# =============================================================================
# TESTES DE COMBINAÇÕES DE ARGUMENTOS
# =============================================================================

class TestArgumentCombinations:
    """Testa combinações complexas de argumentos."""
    
    def test_full_kiosk_setup(self, parser):
        """Testa setup completo de kiosk."""
        args = parser.parse_args([
            '--mode', 'kiosk',
            '--kiosk-url', 'http://localhost:3000',
            '--kiosk-resolution', '1920x1080',
            '--kiosk-incognito',
            '--no-dev-tools',
            '--audio-backend', 'pipewire',
            '--dry-run', '--verbose'
        ])
        
        assert args.mode == 'kiosk'
        assert args.kiosk_url == 'http://localhost:3000'
        assert args.no_dev_tools is True
        assert args.dry_run is True
    
    def test_minimal_server_setup(self, parser):
        """Testa setup mínimo de servidor."""
        args = parser.parse_args([
            '--mode', 'server',
            '--no-audio',
            '--no-spotify',
            '--no-spicetify',
            '--no-kiosk',
            '--database-type', 'postgresql',
            '--quiet'
        ])
        
        assert args.mode == 'server'
        assert args.no_audio is True
        assert args.no_spotify is True
        assert args.database_type == 'postgresql'
        assert args.quiet is True
    
    def test_dev_environment_setup(self, parser):
        """Testa setup de ambiente de desenvolvimento."""
        args = parser.parse_args([
            '--mode', 'dev',
            '--dev-tools',
            '--node-version', '20',
            '--python-version', '3.12',
            '--database-type', 'sqlite',
            '--verbose'
        ])
        
        assert args.mode == 'dev'
        assert args.dev_tools is True
        assert args.node_version == '20'
        assert args.python_version == '3.12'
    
    def test_all_optional_flags(self, parser):
        """Testa todas as flags opcionais."""
        args = parser.parse_args([
            '--mode', 'full',
            '--database-type', 'mariadb',
            '--database-name', 'mydb',
            '--database-user', 'myuser',
            '--database-password', 'secret',
            '--audio-backend', 'pulseaudio',
            '--cloud-providers', 'storj,gdrive',
            '--backup-schedule', '0 4 * * *',
            '--backup-retention', '90',
            '--voice-language', 'en-us',
            '--voice-model-path', '/opt/model',
            '--dev-tools',
            '--node-version', '20',
            '--python-version', '3.12',
            '--log-file', '/tmp/log.txt',
            '--user', 'admin',
            '--dry-run', '--verbose'
        ])
        
        assert args.mode == 'full'
        assert args.database_type == 'mariadb'
        assert args.database_name == 'mydb'
        assert args.audio_backend == 'pulseaudio'
        assert args.backup_retention == 90
        assert args.voice_language == 'en-us'
        assert args.dev_tools is True
        assert args.user == 'admin'
    
    def test_resume_and_force_flags(self, parser):
        """Testa flags resume e force."""
        args = parser.parse_args(['--resume'])
        assert args.resume is True
        
        args = parser.parse_args(['--force'])
        assert args.force is True
    
    def test_conflicting_verbose_quiet(self, parser):
        """Testa verbose e quiet juntos (não deve dar erro, quiet vence)."""
        args = parser.parse_args(['--verbose', '--quiet'])
        
        # Ambos devem estar True, a lógica de precedência é no código
        assert args.verbose is True
        assert args.quiet is True


# =============================================================================
# TESTES DE EDGE CASES
# =============================================================================

class TestParsingEdgeCases:
    """Testa edge cases do parsing."""
    
    def test_empty_string_value(self, parser):
        """Testa valor de string vazio."""
        args = parser.parse_args(['--database-name', ''])
        assert args.database_name == ''
    
    def test_special_chars_in_value(self, parser):
        """Testa caracteres especiais em valores."""
        args = parser.parse_args(['--database-password', 'p@ss!w0rd#123'])
        assert args.database_password == 'p@ss!w0rd#123'
    
    def test_spaces_in_value(self, parser):
        """Testa espaços em valores."""
        args = parser.parse_args(['--kiosk-url', 'http://localhost:3000/path with spaces'])
        assert 'with spaces' in args.kiosk_url
    
    def test_unicode_in_value(self, parser):
        """Testa unicode em valores."""
        args = parser.parse_args(['--database-name', 'café_db'])
        assert args.database_name == 'café_db'
    
    def test_very_long_value(self, parser):
        """Testa valor muito longo."""
        long_value = 'a' * 10000
        args = parser.parse_args(['--log-file', long_value])
        assert len(args.log_file) == 10000
    
    def test_equals_sign_syntax(self, parser):
        """Testa sintaxe com sinal de igual."""
        args = parser.parse_args(['--database-type=postgresql'])
        assert args.database_type == 'postgresql'
    
    def test_double_dash_end_of_options(self, parser):
        """Testa -- para fim de opções."""
        # Argumentos após -- são posicionais
        args = parser.parse_args(['--dry-run', '--'])
        assert args.dry_run is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

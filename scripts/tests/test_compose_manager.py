"""
TSiJUKEBOX Installer - ComposeManager Tests
============================================
Comprehensive tests for the ComposeManager class.
"""

import argparse
from datetime import datetime
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

from conftest import ComposeManager, CONFIG


# =============================================================================
# INITIALIZATION TESTS
# =============================================================================

@pytest.mark.unit
class TestComposeManagerInit:
    """Tests for ComposeManager initialization."""

    def test_init_with_default_options(self, default_options):
        """Test initialization with default options."""
        manager = ComposeManager(default_options)
        assert manager.options == default_options
        assert manager.compose_dir == CONFIG.COMPOSE_DIR

    def test_init_with_full_options(self, full_options):
        """Test initialization with all features enabled."""
        manager = ComposeManager(full_options)
        assert manager.options.monitoring is True
        assert manager.options.cache is True
        assert manager.options.ssl_letsencrypt is True


# =============================================================================
# GENERATE COMPOSE TESTS
# =============================================================================

@pytest.mark.unit
class TestComposeManagerGenerateCompose:
    """Tests for docker-compose.yml generation."""

    def test_generate_compose_basic(self, default_options):
        """Test basic compose file generation."""
        manager = ComposeManager(default_options)
        compose = manager.generate_compose()
        
        assert "version:" in compose
        assert "3.9" in compose
        assert "services:" in compose
        assert "app:" in compose
        assert CONFIG.IMAGE in compose
        assert CONFIG.CONTAINER_NAME in compose

    def test_generate_compose_port_mapping(self, default_options):
        """Test port mapping in compose."""
        default_options.port = 8080
        manager = ComposeManager(default_options)
        compose = manager.generate_compose()
        
        assert "8080:80" in compose

    def test_generate_compose_no_port_with_ssl(self, ssl_options):
        """Test that app ports are not exposed when SSL is enabled."""
        manager = ComposeManager(ssl_options)
        compose = manager.generate_compose()
        
        # With SSL, nginx handles ports, not app directly
        assert "nginx:" in compose
        assert "80:80" in compose
        assert "443:443" in compose

    def test_generate_compose_with_monitoring(self, default_options):
        """Test compose with monitoring stack."""
        default_options.monitoring = True
        manager = ComposeManager(default_options)
        compose = manager.generate_compose()
        
        assert "prometheus:" in compose
        assert "grafana:" in compose
        assert "9090:9090" in compose  # Prometheus port
        assert "3001:3000" in compose  # Grafana port
        assert "prometheus-data:" in compose
        assert "grafana-data:" in compose

    def test_generate_compose_with_cache(self, default_options):
        """Test compose with Redis cache."""
        default_options.cache = True
        manager = ComposeManager(default_options)
        compose = manager.generate_compose()
        
        assert "redis:" in compose
        assert CONFIG.IMAGE_REDIS in compose
        assert "redis-data:" in compose
        assert "redis-server" in compose
        assert "appendonly" in compose

    def test_generate_compose_with_letsencrypt(self, default_options):
        """Test compose with Let's Encrypt SSL."""
        default_options.ssl_letsencrypt = True
        default_options.domain = "example.com"
        manager = ComposeManager(default_options)
        compose = manager.generate_compose()
        
        assert "nginx:" in compose
        assert "certbot:" in compose
        assert "certbot-webroot:" in compose
        assert "ssl-letsencrypt" in compose

    def test_generate_compose_with_cloudflare(self, default_options):
        """Test compose with Cloudflare DNS SSL."""
        default_options.ssl_cloudflare = True
        default_options.domain = "example.com"
        manager = ComposeManager(default_options)
        compose = manager.generate_compose()
        
        assert "nginx:" in compose
        assert "certbot-dns:" in compose
        assert "ssl-cloudflare" in compose
        assert CONFIG.IMAGE_CERTBOT_DNS_CLOUDFLARE in compose

    def test_generate_compose_full_options(self, full_options):
        """Test compose with all features enabled."""
        manager = ComposeManager(full_options)
        compose = manager.generate_compose()
        
        # Check all services
        assert "app:" in compose
        assert "nginx:" in compose
        assert "certbot:" in compose
        assert "prometheus:" in compose
        assert "grafana:" in compose
        assert "redis:" in compose

    def test_generate_compose_healthcheck(self, default_options):
        """Test that healthcheck is included."""
        manager = ComposeManager(default_options)
        compose = manager.generate_compose()
        
        assert "healthcheck:" in compose
        assert "curl" in compose
        assert "/health" in compose

    def test_generate_compose_networks(self, default_options):
        """Test network configuration."""
        manager = ComposeManager(default_options)
        compose = manager.generate_compose()
        
        assert "networks:" in compose
        assert CONFIG.NETWORK_NAME in compose
        assert "bridge" in compose

    def test_generate_compose_volumes(self, default_options):
        """Test volume configuration."""
        manager = ComposeManager(default_options)
        compose = manager.generate_compose()
        
        assert "volumes:" in compose
        assert "tsijukebox-data:" in compose
        assert "tsijukebox-logs:" in compose


# =============================================================================
# GENERATE ENV TESTS
# =============================================================================

@pytest.mark.unit
class TestComposeManagerGenerateEnv:
    """Tests for .env file generation."""

    def test_generate_env_basic(self, default_options):
        """Test basic .env generation."""
        manager = ComposeManager(default_options)
        env = manager.generate_env()
        
        assert "PORT=80" in env
        assert "TZ=America/Sao_Paulo" in env
        assert "GRAFANA_PASSWORD" in env

    def test_generate_env_custom_port(self, default_options):
        """Test .env with custom port."""
        default_options.port = 8080
        manager = ComposeManager(default_options)
        env = manager.generate_env()
        
        assert "PORT=8080" in env

    def test_generate_env_supabase(self, default_options):
        """Test .env with Supabase credentials."""
        default_options.supabase_url = "https://abc.supabase.co"
        default_options.supabase_key = "eyJhbGciOiJI..."
        manager = ComposeManager(default_options)
        env = manager.generate_env()
        
        assert "SUPABASE_URL=https://abc.supabase.co" in env
        assert "SUPABASE_KEY=eyJhbGciOiJI..." in env

    def test_generate_env_timestamp(self, default_options):
        """Test .env includes timestamp."""
        manager = ComposeManager(default_options)
        env = manager.generate_env()
        
        # Should contain ISO format date
        assert "Gerado automaticamente em" in env


# =============================================================================
# GENERATE PROMETHEUS CONFIG TESTS
# =============================================================================

@pytest.mark.unit
class TestComposeManagerPrometheus:
    """Tests for Prometheus configuration generation."""

    def test_generate_prometheus_config(self, default_options):
        """Test Prometheus config generation."""
        manager = ComposeManager(default_options)
        config = manager.generate_prometheus_config()
        
        assert "global:" in config
        assert "scrape_interval: 15s" in config
        assert "scrape_configs:" in config
        assert "job_name: 'prometheus'" in config
        assert "job_name: 'tsijukebox'" in config
        assert "targets: ['app:80']" in config

    def test_prometheus_config_valid_yaml_structure(self, default_options):
        """Test that Prometheus config has valid YAML structure."""
        manager = ComposeManager(default_options)
        config = manager.generate_prometheus_config()
        
        # Check for proper indentation
        assert "  scrape_interval:" in config
        assert "  - job_name:" in config


# =============================================================================
# GENERATE NGINX CONFIG TESTS
# =============================================================================

@pytest.mark.unit
class TestComposeManagerNginxHttpOnly:
    """Tests for HTTP-only Nginx configuration."""

    def test_generate_nginx_http_only_default(self, default_options):
        """Test HTTP-only Nginx config with default domain."""
        manager = ComposeManager(default_options)
        config = manager.generate_nginx_config_http_only()
        
        assert "listen 80;" in config
        assert "server_name localhost" in config
        assert "upstream app" in config
        assert "proxy_pass http://app" in config

    def test_generate_nginx_http_only_custom_domain(self, default_options):
        """Test HTTP-only Nginx config with custom domain."""
        manager = ComposeManager(default_options)
        config = manager.generate_nginx_config_http_only(domain="example.com")
        
        assert "server_name example.com" in config

    def test_generate_nginx_http_only_acme_challenge(self, default_options):
        """Test that ACME challenge location is included."""
        manager = ComposeManager(default_options)
        config = manager.generate_nginx_config_http_only()
        
        assert "/.well-known/acme-challenge/" in config
        assert "/var/www/certbot" in config

    def test_generate_nginx_http_only_proxy_headers(self, default_options):
        """Test proxy headers in HTTP config."""
        manager = ComposeManager(default_options)
        config = manager.generate_nginx_config_http_only()
        
        assert "proxy_set_header Host $host" in config
        assert "proxy_set_header X-Real-IP $remote_addr" in config
        assert "proxy_set_header X-Forwarded-For" in config
        assert "proxy_set_header X-Forwarded-Proto" in config

    def test_generate_nginx_http_only_health_endpoint(self, default_options):
        """Test health endpoint configuration."""
        manager = ComposeManager(default_options)
        config = manager.generate_nginx_config_http_only()
        
        assert "location /health" in config
        assert "access_log off" in config


# =============================================================================
# GENERATE NGINX SSL CONFIG TESTS
# =============================================================================

@pytest.mark.unit
class TestComposeManagerNginxSSL:
    """Tests for SSL Nginx configuration."""

    def test_generate_nginx_config_ssl(self, ssl_options):
        """Test SSL Nginx config generation."""
        manager = ComposeManager(ssl_options)
        config = manager.generate_nginx_config(domain="example.com")
        
        assert "listen 80;" in config
        assert "listen 443 ssl http2;" in config
        assert "server_name example.com" in config

    def test_generate_nginx_config_ssl_certificates(self, ssl_options):
        """Test SSL certificate paths."""
        manager = ComposeManager(ssl_options)
        config = manager.generate_nginx_config(domain="example.com", use_letsencrypt=True)
        
        assert "ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem" in config
        assert "ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem" in config

    def test_generate_nginx_config_self_signed_path(self, ssl_options):
        """Test self-signed certificate paths."""
        manager = ComposeManager(ssl_options)
        config = manager.generate_nginx_config(domain="example.com", use_letsencrypt=False)
        
        assert "/etc/nginx/ssl/fullchain.pem" in config
        assert "/etc/nginx/ssl/privkey.pem" in config

    def test_generate_nginx_config_ssl_redirect(self, ssl_options):
        """Test HTTP to HTTPS redirect."""
        manager = ComposeManager(ssl_options)
        config = manager.generate_nginx_config(domain="example.com")
        
        assert "return 301 https://$server_name$request_uri" in config

    def test_generate_nginx_config_ssl_settings(self, ssl_options):
        """Test SSL settings."""
        manager = ComposeManager(ssl_options)
        config = manager.generate_nginx_config(domain="example.com")
        
        assert "ssl_session_timeout" in config
        assert "ssl_session_cache" in config
        assert "ssl_protocols TLSv1.2 TLSv1.3" in config
        assert "ssl_ciphers" in config

    def test_generate_nginx_config_security_headers(self, ssl_options):
        """Test security headers."""
        manager = ComposeManager(ssl_options)
        config = manager.generate_nginx_config(domain="example.com")
        
        assert "X-Frame-Options" in config
        assert "X-Content-Type-Options" in config
        assert "X-XSS-Protection" in config
        assert "Referrer-Policy" in config


# =============================================================================
# YAML CONVERSION TESTS
# =============================================================================

@pytest.mark.unit
class TestComposeManagerYaml:
    """Tests for YAML conversion utilities."""

    def test_format_value_null(self, default_options):
        """Test null value formatting."""
        manager = ComposeManager(default_options)
        assert manager._format_value(None) == "null"

    def test_format_value_bool_true(self, default_options):
        """Test boolean true formatting."""
        manager = ComposeManager(default_options)
        assert manager._format_value(True) == "true"

    def test_format_value_bool_false(self, default_options):
        """Test boolean false formatting."""
        manager = ComposeManager(default_options)
        assert manager._format_value(False) == "false"

    def test_format_value_string_simple(self, default_options):
        """Test simple string formatting."""
        manager = ComposeManager(default_options)
        assert manager._format_value("hello") == "hello"

    def test_format_value_string_special_chars(self, default_options):
        """Test string with special characters."""
        manager = ComposeManager(default_options)
        # Strings with special YAML chars should be quoted
        assert manager._format_value("key: value") == '"key: value"'
        assert manager._format_value("item #1") == '"item #1"'

    def test_format_value_number(self, default_options):
        """Test number formatting."""
        manager = ComposeManager(default_options)
        assert manager._format_value(8080) == "8080"

    def test_dict_to_yaml_simple(self, default_options):
        """Test simple dict to YAML conversion."""
        manager = ComposeManager(default_options)
        data = {"key": "value"}
        yaml = manager._dict_to_yaml(data)
        assert "key: value" in yaml

    def test_dict_to_yaml_nested(self, default_options):
        """Test nested dict to YAML conversion."""
        manager = ComposeManager(default_options)
        data = {
            "parent": {
                "child": "value"
            }
        }
        yaml = manager._dict_to_yaml(data)
        assert "parent:" in yaml
        assert "child: value" in yaml

    def test_dict_to_yaml_list(self, default_options):
        """Test list to YAML conversion."""
        manager = ComposeManager(default_options)
        data = {
            "items": ["one", "two", "three"]
        }
        yaml = manager._dict_to_yaml(data)
        assert "items:" in yaml
        assert "- one" in yaml
        assert "- two" in yaml
        assert "- three" in yaml

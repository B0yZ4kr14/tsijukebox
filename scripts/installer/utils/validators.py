#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Validation Utilities
=============================================
Provides comprehensive validation for system requirements,
configuration files, and user inputs.

Features:
- System requirement validation (OS, RAM, disk, permissions)
- Configuration file validation with schema checking
- User input sanitization and validation
- Network connectivity checks
- Security validations (ports, permissions, credentials)

Author: B0.y_Z4kr14
License: Public Domain (see docs/CREDITS.md)
"""

import os
import re
import socket
import subprocess
import shutil
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any, Tuple, Callable
from enum import Enum


class ValidationSeverity(Enum):
    """Validation result severity levels"""
    INFO = 'info'
    WARNING = 'warning'
    ERROR = 'error'
    CRITICAL = 'critical'


@dataclass
class ValidationResult:
    """
    Result of a validation check.
    
    Attributes:
        valid: Whether validation passed
        message: Human-readable result message
        severity: Severity level if invalid
        details: Additional details or suggestions
        fix_command: Optional command to fix the issue
    """
    valid: bool
    message: str
    severity: ValidationSeverity = ValidationSeverity.INFO
    details: Optional[str] = None
    fix_command: Optional[str] = None
    
    def __bool__(self) -> bool:
        return self.valid
    
    def __str__(self) -> str:
        status = '✓' if self.valid else '✗'
        return f"[{status}] {self.message}"


@dataclass
class ValidationReport:
    """Collection of validation results"""
    results: List[ValidationResult] = field(default_factory=list)
    
    def add(self, result: ValidationResult) -> None:
        self.results.append(result)
    
    @property
    def is_valid(self) -> bool:
        """Check if all validations passed"""
        return all(r.valid for r in self.results)
    
    @property
    def has_errors(self) -> bool:
        """Check if any error-level failures exist"""
        return any(
            not r.valid and r.severity in (ValidationSeverity.ERROR, ValidationSeverity.CRITICAL)
            for r in self.results
        )
    
    @property
    def has_warnings(self) -> bool:
        """Check if any warnings exist"""
        return any(
            not r.valid and r.severity == ValidationSeverity.WARNING
            for r in self.results
        )
    
    def get_errors(self) -> List[ValidationResult]:
        """Get all error-level failures"""
        return [
            r for r in self.results
            if not r.valid and r.severity in (ValidationSeverity.ERROR, ValidationSeverity.CRITICAL)
        ]
    
    def get_warnings(self) -> List[ValidationResult]:
        """Get all warnings"""
        return [
            r for r in self.results
            if not r.valid and r.severity == ValidationSeverity.WARNING
        ]
    
    def summary(self) -> Dict[str, int]:
        """Get summary counts"""
        return {
            'total': len(self.results),
            'passed': sum(1 for r in self.results if r.valid),
            'warnings': len(self.get_warnings()),
            'errors': len(self.get_errors()),
        }


class SystemValidator:
    """
    Validates system requirements for TSiJUKEBOX installation.
    
    Usage:
        validator = SystemValidator()
        report = validator.validate_all()
        if not report.is_valid:
            for error in report.get_errors():
                print(error)
    """
    
    # Supported distributions
    SUPPORTED_DISTROS = ['arch', 'cachyos', 'manjaro', 'endeavouros', 'artix']
    
    # Minimum requirements
    MIN_RAM_GB = 2.0
    RECOMMENDED_RAM_GB = 4.0
    MIN_DISK_GB = 10.0
    RECOMMENDED_DISK_GB = 50.0
    
    # Required commands
    REQUIRED_COMMANDS = ['pacman', 'systemctl', 'git', 'curl']
    
    def __init__(self):
        self.report = ValidationReport()
    
    def validate_all(self) -> ValidationReport:
        """Run all system validations"""
        self.report = ValidationReport()
        
        self.validate_root_access()
        self.validate_distribution()
        self.validate_architecture()
        self.validate_ram()
        self.validate_disk_space()
        self.validate_required_commands()
        self.validate_internet_connection()
        self.validate_systemd()
        
        return self.report
    
    def validate_root_access(self) -> ValidationResult:
        """Check if running as root"""
        is_root = os.geteuid() == 0
        result = ValidationResult(
            valid=is_root,
            message="Root access" if is_root else "Root access required",
            severity=ValidationSeverity.CRITICAL,
            details="Run with sudo: sudo python3 main.py",
            fix_command="sudo python3 main.py"
        )
        self.report.add(result)
        return result
    
    def validate_distribution(self) -> ValidationResult:
        """Check if running on supported distribution"""
        distro = self._detect_distro()
        is_supported = distro.lower() in self.SUPPORTED_DISTROS
        
        result = ValidationResult(
            valid=is_supported,
            message=f"Distribution: {distro}" if is_supported else f"Unsupported distribution: {distro}",
            severity=ValidationSeverity.ERROR,
            details=f"Supported: {', '.join(self.SUPPORTED_DISTROS)}"
        )
        self.report.add(result)
        return result
    
    def validate_architecture(self) -> ValidationResult:
        """Check if running on x86_64 architecture"""
        import platform
        arch = platform.machine()
        is_valid = arch == 'x86_64'
        
        result = ValidationResult(
            valid=is_valid,
            message=f"Architecture: {arch}" if is_valid else f"Unsupported architecture: {arch}",
            severity=ValidationSeverity.ERROR,
            details="TSiJUKEBOX requires x86_64 architecture"
        )
        self.report.add(result)
        return result
    
    def validate_ram(self) -> ValidationResult:
        """Check available RAM"""
        ram_gb = self._get_ram_gb()
        
        if ram_gb >= self.RECOMMENDED_RAM_GB:
            result = ValidationResult(
                valid=True,
                message=f"RAM: {ram_gb:.1f} GB (recommended: {self.RECOMMENDED_RAM_GB} GB)",
                severity=ValidationSeverity.INFO
            )
        elif ram_gb >= self.MIN_RAM_GB:
            result = ValidationResult(
                valid=True,
                message=f"RAM: {ram_gb:.1f} GB (minimum met, recommended: {self.RECOMMENDED_RAM_GB} GB)",
                severity=ValidationSeverity.WARNING,
                details="Performance may be limited with less than 4GB RAM"
            )
        else:
            result = ValidationResult(
                valid=False,
                message=f"RAM: {ram_gb:.1f} GB (minimum required: {self.MIN_RAM_GB} GB)",
                severity=ValidationSeverity.ERROR,
                details="Insufficient RAM for TSiJUKEBOX"
            )
        
        self.report.add(result)
        return result
    
    def validate_disk_space(self, path: str = '/') -> ValidationResult:
        """Check available disk space"""
        disk_gb = self._get_disk_space_gb(path)
        
        if disk_gb >= self.RECOMMENDED_DISK_GB:
            result = ValidationResult(
                valid=True,
                message=f"Disk space: {disk_gb:.1f} GB available",
                severity=ValidationSeverity.INFO
            )
        elif disk_gb >= self.MIN_DISK_GB:
            result = ValidationResult(
                valid=True,
                message=f"Disk space: {disk_gb:.1f} GB (recommended: {self.RECOMMENDED_DISK_GB} GB)",
                severity=ValidationSeverity.WARNING,
                details="Consider freeing up disk space for music library"
            )
        else:
            result = ValidationResult(
                valid=False,
                message=f"Disk space: {disk_gb:.1f} GB (minimum required: {self.MIN_DISK_GB} GB)",
                severity=ValidationSeverity.ERROR,
                details="Insufficient disk space for installation"
            )
        
        self.report.add(result)
        return result
    
    def validate_required_commands(self) -> ValidationResult:
        """Check if required commands are available"""
        missing = []
        for cmd in self.REQUIRED_COMMANDS:
            if not shutil.which(cmd):
                missing.append(cmd)
        
        if not missing:
            result = ValidationResult(
                valid=True,
                message="Required commands available",
                severity=ValidationSeverity.INFO
            )
        else:
            result = ValidationResult(
                valid=False,
                message=f"Missing commands: {', '.join(missing)}",
                severity=ValidationSeverity.ERROR,
                fix_command=f"sudo pacman -S {' '.join(missing)}"
            )
        
        self.report.add(result)
        return result
    
    def validate_internet_connection(self, timeout: int = 5) -> ValidationResult:
        """Check internet connectivity"""
        hosts = [
            ('archlinux.org', 443),
            ('github.com', 443),
            ('google.com', 443),
        ]
        
        connected = False
        for host, port in hosts:
            try:
                socket.create_connection((host, port), timeout=timeout)
                connected = True
                break
            except (socket.timeout, socket.error):
                continue
        
        result = ValidationResult(
            valid=connected,
            message="Internet connection" if connected else "No internet connection",
            severity=ValidationSeverity.ERROR if not connected else ValidationSeverity.INFO,
            details="Required for package downloads and updates"
        )
        self.report.add(result)
        return result
    
    def validate_systemd(self) -> ValidationResult:
        """Check if systemd is running"""
        try:
            result_proc = subprocess.run(
                ['systemctl', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            is_running = result_proc.returncode == 0
        except Exception:
            is_running = False
        
        result = ValidationResult(
            valid=is_running,
            message="Systemd available" if is_running else "Systemd not available",
            severity=ValidationSeverity.ERROR,
            details="TSiJUKEBOX requires systemd for service management"
        )
        self.report.add(result)
        return result
    
    def _detect_distro(self) -> str:
        """Detect Linux distribution"""
        try:
            with open('/etc/os-release', 'r') as f:
                for line in f:
                    if line.startswith('ID='):
                        return line.split('=')[1].strip().strip('"')
        except Exception:
            pass
        return 'unknown'
    
    def _get_ram_gb(self) -> float:
        """Get total RAM in GB"""
        try:
            with open('/proc/meminfo', 'r') as f:
                for line in f:
                    if line.startswith('MemTotal:'):
                        kb = int(line.split()[1])
                        return kb / (1024 * 1024)
        except Exception:
            pass
        return 0.0
    
    def _get_disk_space_gb(self, path: str = '/') -> float:
        """Get available disk space in GB"""
        try:
            stat = os.statvfs(path)
            return (stat.f_bavail * stat.f_frsize) / (1024 ** 3)
        except Exception:
            return 0.0


class ConfigValidator:
    """
    Validates configuration files and settings.
    
    Usage:
        validator = ConfigValidator()
        result = validator.validate_database_config(config)
    """
    
    # Valid database types
    VALID_DB_TYPES = ['sqlite', 'mariadb', 'postgresql', 'firebird']
    
    # Valid cloud providers
    VALID_CLOUD_PROVIDERS = ['storj', 'gdrive', 'dropbox', 'mega', 'aws', 'onedrive']
    
    def validate_database_config(self, config: Dict[str, Any]) -> ValidationResult:
        """Validate database configuration"""
        db_type = config.get('type', '').lower()
        
        if db_type not in self.VALID_DB_TYPES:
            return ValidationResult(
                valid=False,
                message=f"Invalid database type: {db_type}",
                severity=ValidationSeverity.ERROR,
                details=f"Valid types: {', '.join(self.VALID_DB_TYPES)}"
            )
        
        # Type-specific validation
        if db_type == 'sqlite':
            path = config.get('path', '')
            if not path:
                return ValidationResult(
                    valid=False,
                    message="SQLite requires 'path' configuration",
                    severity=ValidationSeverity.ERROR
                )
            
            # Check if parent directory exists or can be created
            parent = Path(path).parent
            if not parent.exists():
                try:
                    parent.mkdir(parents=True, exist_ok=True)
                except PermissionError:
                    return ValidationResult(
                        valid=False,
                        message=f"Cannot create directory: {parent}",
                        severity=ValidationSeverity.ERROR
                    )
        
        else:
            # Network databases require host and credentials
            required_fields = ['host', 'user', 'password', 'name']
            missing = [f for f in required_fields if not config.get(f)]
            
            if missing:
                return ValidationResult(
                    valid=False,
                    message=f"Missing database fields: {', '.join(missing)}",
                    severity=ValidationSeverity.ERROR
                )
            
            # Validate port
            port = config.get('port', 0)
            if port and (port < 1 or port > 65535):
                return ValidationResult(
                    valid=False,
                    message=f"Invalid port number: {port}",
                    severity=ValidationSeverity.ERROR
                )
        
        return ValidationResult(
            valid=True,
            message=f"Database configuration valid ({db_type})",
            severity=ValidationSeverity.INFO
        )
    
    def validate_cloud_config(self, provider: str, config: Dict[str, Any]) -> ValidationResult:
        """Validate cloud provider configuration"""
        provider = provider.lower()
        
        if provider not in self.VALID_CLOUD_PROVIDERS:
            return ValidationResult(
                valid=False,
                message=f"Unknown cloud provider: {provider}",
                severity=ValidationSeverity.ERROR,
                details=f"Valid providers: {', '.join(self.VALID_CLOUD_PROVIDERS)}"
            )
        
        # Provider-specific required fields
        required_fields = {
            'storj': ['access_grant'],
            'gdrive': ['client_id', 'client_secret'],
            'dropbox': ['token'],
            'mega': ['email', 'password'],
            'aws': ['access_key', 'secret_key', 'region', 'bucket'],
            'onedrive': ['client_id', 'client_secret'],
        }
        
        missing = [f for f in required_fields.get(provider, []) if not config.get(f)]
        
        if missing:
            return ValidationResult(
                valid=False,
                message=f"Missing {provider} fields: {', '.join(missing)}",
                severity=ValidationSeverity.ERROR
            )
        
        return ValidationResult(
            valid=True,
            message=f"Cloud configuration valid ({provider})",
            severity=ValidationSeverity.INFO
        )
    
    def validate_user_config(self, username: str, shell: str = 'bash') -> ValidationResult:
        """Validate user configuration"""
        # Username validation
        if not re.match(r'^[a-z_][a-z0-9_-]{0,31}$', username):
            return ValidationResult(
                valid=False,
                message=f"Invalid username: {username}",
                severity=ValidationSeverity.ERROR,
                details="Username must start with lowercase letter or underscore, max 32 chars"
            )
        
        # Shell validation
        valid_shells = ['bash', 'zsh', 'fish', 'sh']
        if shell not in valid_shells:
            return ValidationResult(
                valid=False,
                message=f"Invalid shell: {shell}",
                severity=ValidationSeverity.WARNING,
                details=f"Recommended shells: {', '.join(valid_shells)}"
            )
        
        # Check if shell is installed
        shell_path = shutil.which(shell)
        if not shell_path:
            return ValidationResult(
                valid=False,
                message=f"Shell not installed: {shell}",
                severity=ValidationSeverity.ERROR,
                fix_command=f"sudo pacman -S {shell}"
            )
        
        return ValidationResult(
            valid=True,
            message=f"User configuration valid ({username}, {shell})",
            severity=ValidationSeverity.INFO
        )


class InputValidator:
    """
    Validates and sanitizes user inputs.
    
    Usage:
        validator = InputValidator()
        result = validator.validate_email('user@example.com')
        clean_path = validator.sanitize_path('/var/lib/../lib/test')
    """
    
    # Regex patterns
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    URL_PATTERN = re.compile(
        r'^https?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$',
        re.IGNORECASE
    )
    IP_PATTERN = re.compile(
        r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}'
        r'(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
    )
    
    def validate_email(self, email: str) -> ValidationResult:
        """Validate email address format"""
        email = email.strip().lower()
        is_valid = bool(self.EMAIL_PATTERN.match(email))
        
        return ValidationResult(
            valid=is_valid,
            message="Valid email" if is_valid else f"Invalid email format: {email}",
            severity=ValidationSeverity.ERROR
        )
    
    def validate_url(self, url: str) -> ValidationResult:
        """Validate URL format"""
        is_valid = bool(self.URL_PATTERN.match(url))
        
        return ValidationResult(
            valid=is_valid,
            message="Valid URL" if is_valid else f"Invalid URL format: {url}",
            severity=ValidationSeverity.ERROR
        )
    
    def validate_ip(self, ip: str) -> ValidationResult:
        """Validate IP address format"""
        is_valid = bool(self.IP_PATTERN.match(ip))
        
        return ValidationResult(
            valid=is_valid,
            message="Valid IP" if is_valid else f"Invalid IP format: {ip}",
            severity=ValidationSeverity.ERROR
        )
    
    def validate_port(self, port: int) -> ValidationResult:
        """Validate port number"""
        is_valid = 1 <= port <= 65535
        
        return ValidationResult(
            valid=is_valid,
            message=f"Valid port: {port}" if is_valid else f"Invalid port: {port}",
            severity=ValidationSeverity.ERROR,
            details="Port must be between 1 and 65535"
        )
    
    def validate_password(
        self,
        password: str,
        min_length: int = 8,
        require_upper: bool = True,
        require_lower: bool = True,
        require_digit: bool = True,
        require_special: bool = False,
    ) -> ValidationResult:
        """Validate password strength"""
        issues = []
        
        if len(password) < min_length:
            issues.append(f"at least {min_length} characters")
        if require_upper and not any(c.isupper() for c in password):
            issues.append("uppercase letter")
        if require_lower and not any(c.islower() for c in password):
            issues.append("lowercase letter")
        if require_digit and not any(c.isdigit() for c in password):
            issues.append("digit")
        if require_special and not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
            issues.append("special character")
        
        if issues:
            return ValidationResult(
                valid=False,
                message=f"Password requires: {', '.join(issues)}",
                severity=ValidationSeverity.ERROR
            )
        
        return ValidationResult(
            valid=True,
            message="Password meets requirements",
            severity=ValidationSeverity.INFO
        )
    
    def sanitize_path(self, path: str) -> str:
        """Sanitize and normalize file path"""
        # Resolve path to absolute, remove .. and symlinks
        return str(Path(path).resolve())
    
    def sanitize_string(
        self,
        value: str,
        max_length: int = 255,
        allowed_chars: str = None,
        strip: bool = True,
    ) -> str:
        """Sanitize string input"""
        if strip:
            value = value.strip()
        
        if len(value) > max_length:
            value = value[:max_length]
        
        if allowed_chars:
            value = ''.join(c for c in value if c in allowed_chars)
        
        return value
    
    def validate_path_writable(self, path: str) -> ValidationResult:
        """Check if path is writable"""
        path_obj = Path(path)
        
        # Check if path exists
        if path_obj.exists():
            is_writable = os.access(path_obj, os.W_OK)
        else:
            # Check if parent is writable
            parent = path_obj.parent
            is_writable = parent.exists() and os.access(parent, os.W_OK)
        
        return ValidationResult(
            valid=is_writable,
            message=f"Path writable: {path}" if is_writable else f"Path not writable: {path}",
            severity=ValidationSeverity.ERROR
        )

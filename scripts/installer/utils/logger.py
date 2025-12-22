#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Unified Logging System
==============================================
Provides structured logging with colored output, file logging, and JSON export.

Features:
- Colored console output with severity levels
- File logging with automatic rotation
- JSON structured logging for debugging
- Progress bars and spinners
- Timestamps and context tracking
- Configurable verbosity levels via env var or flag

Author: B0.y_Z4kr14
License: Public Domain (see docs/CREDITS.md)
"""

import os
import sys
import json
import logging
import threading
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field, asdict
from logging.handlers import RotatingFileHandler


class LogLevel(Enum):
    """Log severity levels with color codes and numeric values."""
    TRACE = ('TRACE', '\033[90m', 5)       # Dark gray - most verbose
    DEBUG = ('DEBUG', '\033[90m', 10)      # Gray
    INFO = ('INFO', '\033[94m', 20)        # Blue
    SUCCESS = ('SUCCESS', '\033[92m', 25)  # Green
    WARNING = ('WARNING', '\033[93m', 30)  # Yellow
    ERROR = ('ERROR', '\033[91m', 40)      # Red
    CRITICAL = ('CRITICAL', '\033[95m', 50) # Magenta
    
    @property
    def label(self) -> str:
        return self.value[0]
    
    @property
    def color(self) -> str:
        return self.value[1]
    
    @property
    def level(self) -> int:
        return self.value[2]
    
    @classmethod
    def from_string(cls, level_str: str) -> 'LogLevel':
        """Convert string to LogLevel."""
        level_map = {
            'trace': cls.TRACE,
            'debug': cls.DEBUG,
            'info': cls.INFO,
            'success': cls.SUCCESS,
            'warning': cls.WARNING,
            'warn': cls.WARNING,
            'error': cls.ERROR,
            'critical': cls.CRITICAL,
        }
        return level_map.get(level_str.lower(), cls.INFO)


@dataclass
class LogEntry:
    """Structured log entry for JSON export."""
    timestamp: str
    level: str
    message: str
    context: Optional[str] = None
    module: Optional[str] = None
    function: Optional[str] = None
    extra: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class Logger:
    """
    Unified logging system with colored output, file logging, and rotation.
    
    Features:
    - Console output with colors and severity levels
    - File logging with automatic rotation
    - JSON structured logging
    - Configurable via environment variables
    - Thread-safe singleton pattern
    
    Environment Variables:
        TSIJUKEBOX_LOG_LEVEL: Set log level (trace, debug, info, warning, error, critical)
        TSIJUKEBOX_LOG_DIR: Override log directory
        TSIJUKEBOX_LOG_JSON: Enable/disable JSON logging (true/false)
    
    Usage:
        logger = Logger(name='installer', log_dir='/var/log/jukebox')
        logger.info('Installation started')
        logger.success('Package installed', extra={'package': 'nodejs'})
        logger.error('Failed to connect', extra={'host': 'localhost'})
    """
    
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    
    _instances: Dict[str, 'Logger'] = {}
    _lock = threading.Lock()
    
    def __new__(cls, name: str = 'default', **kwargs):
        """Singleton pattern per logger name."""
        with cls._lock:
            if name not in cls._instances:
                instance = super().__new__(cls)
                cls._instances[name] = instance
            return cls._instances[name]
    
    def __init__(
        self,
        name: str = 'default',
        log_dir: Optional[Path] = None,
        console_level: Optional[LogLevel] = None,
        file_level: LogLevel = LogLevel.DEBUG,
        json_logging: bool = True,
        max_file_size_mb: int = 10,
        backup_count: int = 5,
    ):
        """
        Initialize logger with console and file handlers.
        
        Args:
            name: Logger name (used for file naming)
            log_dir: Directory for log files (default: /var/log/jukebox)
            console_level: Minimum level for console output (auto-detect from env if None)
            file_level: Minimum level for file output
            json_logging: Whether to create JSON log file
            max_file_size_mb: Max size before rotation (default: 10MB)
            backup_count: Number of backup files to keep (default: 5)
        """
        if hasattr(self, '_initialized'):
            return
        
        self.name = name
        
        # Check environment variables for configuration
        env_log_dir = os.environ.get('TSIJUKEBOX_LOG_DIR')
        env_log_level = os.environ.get('TSIJUKEBOX_LOG_LEVEL')
        env_json = os.environ.get('TSIJUKEBOX_LOG_JSON', 'true').lower()
        
        self.log_dir = Path(env_log_dir) if env_log_dir else (log_dir or Path('/var/log/jukebox'))
        
        # Determine console level from env, parameter, or default
        if console_level:
            self.console_level = console_level
        elif env_log_level:
            self.console_level = LogLevel.from_string(env_log_level)
        else:
            self.console_level = LogLevel.INFO
        
        self.file_level = file_level
        self.json_logging = json_logging if env_json != 'false' else False
        self.max_file_size = max_file_size_mb * 1024 * 1024
        self.backup_count = backup_count
        
        self._entries: List[LogEntry] = []
        self._context: Optional[str] = None
        self._start_time = datetime.now()
        self._file_handler: Optional[RotatingFileHandler] = None
        
        # Ensure log directory exists (only if we can)
        try:
            self.log_dir.mkdir(parents=True, exist_ok=True)
        except PermissionError:
            # Fall back to temp directory if we can't write to log dir
            import tempfile
            self.log_dir = Path(tempfile.gettempdir()) / 'tsijukebox-logs'
            self.log_dir.mkdir(parents=True, exist_ok=True)
        
        # Log file paths
        self.log_file = self.log_dir / f'{name}.log'
        self.json_file = self.log_dir / f'{name}.json'
        
        # Setup rotating file handler
        self._setup_file_handler()
        
        self._initialized = True
    
    def _setup_file_handler(self):
        """Setup rotating file handler for log rotation."""
        try:
            self._file_handler = RotatingFileHandler(
                self.log_file,
                maxBytes=self.max_file_size,
                backupCount=self.backup_count,
                encoding='utf-8'
            )
            self._file_handler.setLevel(logging.DEBUG)
            
            formatter = logging.Formatter(
                '%(asctime)s [%(levelname)s] %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            self._file_handler.setFormatter(formatter)
        except Exception:
            self._file_handler = None
    
    def set_level(self, level: LogLevel) -> None:
        """Set console log level dynamically."""
        self.console_level = level
    
    def set_context(self, context: str) -> None:
        """Set current context (e.g., 'database_setup', 'package_install')."""
        self._context = context
    
    def clear_context(self) -> None:
        """Clear current context."""
        self._context = None
    
    def _format_message(self, level: LogLevel, message: str, extra: Optional[Dict] = None) -> str:
        """Format message with colors and timestamp for console."""
        timestamp = datetime.now().strftime('%H:%M:%S')
        
        # Build formatted message
        parts = [
            f"{self.DIM}{timestamp}{self.RESET}",
            f"{level.color}{self.BOLD}[{level.label:^8}]{self.RESET}",
        ]
        
        if self._context:
            parts.append(f"{self.DIM}({self._context}){self.RESET}")
        
        parts.append(f"{level.color}{message}{self.RESET}")
        
        if extra:
            extra_str = ' '.join(f"{k}={v}" for k, v in extra.items())
            parts.append(f"{self.DIM}{extra_str}{self.RESET}")
        
        return ' '.join(parts)
    
    def _format_file_message(self, level: LogLevel, message: str, extra: Optional[Dict] = None) -> str:
        """Format message for file output (no colors)."""
        timestamp = datetime.now().isoformat()
        
        parts = [timestamp, f"[{level.label}]"]
        
        if self._context:
            parts.append(f"({self._context})")
        
        parts.append(message)
        
        if extra:
            extra_str = ' '.join(f"{k}={v}" for k, v in extra.items())
            parts.append(f"| {extra_str}")
        
        return ' '.join(parts)
    
    def _create_entry(self, level: LogLevel, message: str, extra: Optional[Dict] = None) -> LogEntry:
        """Create structured log entry."""
        import inspect
        
        # Get caller info
        frame = inspect.currentframe()
        caller_info = {}
        if frame:
            # Go up 3 frames: _create_entry -> _log -> (debug|info|etc) -> caller
            caller_frame = frame.f_back.f_back.f_back if frame.f_back and frame.f_back.f_back else None
            if caller_frame:
                caller_info = {
                    'module': caller_frame.f_globals.get('__name__', 'unknown'),
                    'function': caller_frame.f_code.co_name,
                }
        
        return LogEntry(
            timestamp=datetime.now().isoformat(),
            level=level.label,
            message=message,
            context=self._context,
            extra=extra or {},
            **caller_info
        )
    
    def _log(self, level: LogLevel, message: str, extra: Optional[Dict] = None) -> None:
        """Core logging method."""
        # Console output
        if level.level >= self.console_level.level:
            print(self._format_message(level, message, extra))
        
        # File output with rotation
        if level.level >= self.file_level.level:
            try:
                if self._file_handler:
                    # Use RotatingFileHandler for automatic rotation
                    record = logging.LogRecord(
                        name=self.name,
                        level=level.level,
                        pathname='',
                        lineno=0,
                        msg=self._format_file_message(level, message, extra),
                        args=(),
                        exc_info=None
                    )
                    record.levelname = level.label
                    self._file_handler.emit(record)
                else:
                    # Fallback to direct file write
                    with open(self.log_file, 'a', encoding='utf-8') as f:
                        f.write(self._format_file_message(level, message, extra) + '\n')
            except Exception:
                pass  # Fail silently for file logging
        
        # JSON logging
        if self.json_logging:
            entry = self._create_entry(level, message, extra)
            self._entries.append(entry)
    
    def trace(self, message: str, **extra) -> None:
        """Log trace message (most verbose)."""
        self._log(LogLevel.TRACE, message, extra or None)
    
    def debug(self, message: str, **extra) -> None:
        """Log debug message."""
        self._log(LogLevel.DEBUG, message, extra or None)
    
    def info(self, message: str, **extra) -> None:
        """Log info message."""
        self._log(LogLevel.INFO, message, extra or None)
    
    def success(self, message: str, **extra) -> None:
        """Log success message."""
        self._log(LogLevel.SUCCESS, message, extra or None)
    
    def warning(self, message: str, **extra) -> None:
        """Log warning message."""
        self._log(LogLevel.WARNING, message, extra or None)
    
    def error(self, message: str, **extra) -> None:
        """Log error message."""
        self._log(LogLevel.ERROR, message, extra or None)
    
    def critical(self, message: str, **extra) -> None:
        """Log critical message."""
        self._log(LogLevel.CRITICAL, message, extra or None)
    
    def progress(self, current: int, total: int, message: str = '', width: int = 40) -> None:
        """Display progress bar."""
        percent = current / total if total > 0 else 0
        filled = int(width * percent)
        bar = '█' * filled + '░' * (width - filled)
        
        sys.stdout.write(f'\r{LogLevel.INFO.color}[{bar}] {percent:.1%} {message}{self.RESET}')
        sys.stdout.flush()
        
        if current >= total:
            print()  # New line when complete
    
    def spinner(self, message: str, frames: List[str] = None) -> 'SpinnerContext':
        """Create spinner context manager."""
        return SpinnerContext(self, message, frames)
    
    def section(self, title: str) -> None:
        """Print section header."""
        line = '─' * 60
        print(f"\n{LogLevel.INFO.color}{line}{self.RESET}")
        print(f"{self.BOLD}{LogLevel.INFO.color}  {title}{self.RESET}")
        print(f"{LogLevel.INFO.color}{line}{self.RESET}\n")
    
    def export_json(self, filepath: Optional[Path] = None) -> Path:
        """Export all log entries to JSON file."""
        output_path = filepath or self.json_file
        
        export_data = {
            'logger': self.name,
            'started_at': self._start_time.isoformat(),
            'exported_at': datetime.now().isoformat(),
            'total_entries': len(self._entries),
            'summary': self.get_summary(),
            'entries': [entry.to_dict() for entry in self._entries],
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        return output_path
    
    def get_summary(self) -> Dict[str, int]:
        """Get count of entries by level."""
        summary = {level.label: 0 for level in LogLevel}
        for entry in self._entries:
            if entry.level in summary:
                summary[entry.level] += 1
        return summary
    
    def get_entries(self, level: Optional[LogLevel] = None) -> List[LogEntry]:
        """Get log entries, optionally filtered by level."""
        if level is None:
            return self._entries.copy()
        return [e for e in self._entries if e.level == level.label]
    
    def clear_entries(self) -> None:
        """Clear all stored log entries."""
        self._entries.clear()
    
    def close(self) -> None:
        """Close file handlers and export JSON."""
        if self.json_logging and self._entries:
            self.export_json()
        
        if self._file_handler:
            self._file_handler.close()


class SpinnerContext:
    """Context manager for spinner animation."""
    
    DEFAULT_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    
    def __init__(self, logger: Logger, message: str, frames: List[str] = None):
        self.logger = logger
        self.message = message
        self.frames = frames or self.DEFAULT_FRAMES
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._frame_index = 0
    
    def __enter__(self):
        self._running = True
        self._thread = threading.Thread(target=self._animate, daemon=True)
        self._thread.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self._running = False
        if self._thread:
            self._thread.join(timeout=0.5)
        
        # Clear spinner line
        sys.stdout.write('\r' + ' ' * 80 + '\r')
        sys.stdout.flush()
        
        if exc_type is None:
            self.logger.success(f"{self.message} ✓")
        else:
            self.logger.error(f"{self.message} ✗")
        
        return False
    
    def _animate(self):
        import time
        while self._running:
            frame = self.frames[self._frame_index % len(self.frames)]
            sys.stdout.write(f'\r{LogLevel.INFO.color}{frame} {self.message}...{Logger.RESET}')
            sys.stdout.flush()
            self._frame_index += 1
            time.sleep(0.1)


def setup_logger(
    name: str = 'installer',
    log_dir: Optional[Path] = None,
    verbose: bool = False,
    log_level: Optional[str] = None,
    rotation_mb: int = 10,
    backup_count: int = 5,
) -> Logger:
    """
    Factory function to create configured logger.
    
    Args:
        name: Logger name
        log_dir: Log directory path
        verbose: Enable debug output (overridden by log_level)
        log_level: Explicit log level string (trace, debug, info, warning, error, critical)
        rotation_mb: Max file size in MB before rotation
        backup_count: Number of backup files to keep
    
    Returns:
        Configured Logger instance
    """
    # Determine console level
    if log_level:
        console_level = LogLevel.from_string(log_level)
    elif verbose:
        console_level = LogLevel.DEBUG
    else:
        console_level = LogLevel.INFO
    
    return Logger(
        name=name,
        log_dir=log_dir,
        console_level=console_level,
        file_level=LogLevel.DEBUG,
        json_logging=True,
        max_file_size_mb=rotation_mb,
        backup_count=backup_count,
    )

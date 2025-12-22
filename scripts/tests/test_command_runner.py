"""
TSiJUKEBOX Installer - CommandRunner Tests
==========================================
Unit tests for the CommandRunner class.
"""

import subprocess
from unittest.mock import patch, MagicMock

import pytest

from conftest import CommandRunner, Logger


# =============================================================================
# RUN COMMAND TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.command
class TestCommandRunnerRun:
    """Tests for CommandRunner.run method."""
    
    def test_run_successful_command(self, mock_logger: None):
        """Test running a successful command."""
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="output",
                stderr=""
            )
            
            code, stdout, stderr = CommandRunner.run(["echo", "test"])
            
            assert code == 0
            assert stdout == "output"
            assert stderr == ""
    
    def test_run_failed_command(self, mock_logger: None):
        """Test running a failed command."""
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(
                returncode=1,
                stdout="",
                stderr="error message"
            )
            
            code, stdout, stderr = CommandRunner.run(
                ["false"], 
                check=False
            )
            
            assert code == 1
            assert stderr == "error message"
    
    def test_run_command_not_found(self, mock_logger: None):
        """Test running a non-existent command."""
        with patch('subprocess.run', side_effect=FileNotFoundError()):
            code, stdout, stderr = CommandRunner.run(
                ["nonexistent_command"]
            )
            
            assert code == -1
            assert "Command not found" in stderr
    
    def test_run_command_timeout(self, mock_logger: None):
        """Test command timeout handling."""
        with patch('subprocess.run', side_effect=subprocess.TimeoutExpired(
            cmd=["slow_command"], 
            timeout=10
        )):
            code, stdout, stderr = CommandRunner.run(
                ["slow_command"], 
                timeout=10
            )
            
            assert code == -1
            assert "timed out" in stderr
    
    def test_run_with_environment(self, mock_logger: None):
        """Test running command with custom environment."""
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="",
                stderr=""
            )
            
            CommandRunner.run(
                ["echo", "test"],
                env={"CUSTOM_VAR": "value"}
            )
            
            # Check that environment was passed
            call_kwargs = mock_run.call_args[1]
            assert "CUSTOM_VAR" in call_kwargs["env"]
    
    def test_run_with_working_directory(self, mock_logger: None, temp_dir):
        """Test running command with custom working directory."""
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="",
                stderr=""
            )
            
            CommandRunner.run(
                ["ls"],
                cwd=temp_dir
            )
            
            call_kwargs = mock_run.call_args[1]
            assert call_kwargs["cwd"] == temp_dir
    
    def test_run_strips_output(self, mock_logger: None):
        """Test that stdout/stderr are stripped of whitespace."""
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="  output with spaces  \n",
                stderr="  warning  \n"
            )
            
            code, stdout, stderr = CommandRunner.run(["test"])
            
            assert stdout == "output with spaces"
            assert stderr == "warning"


# =============================================================================
# RUN INTERACTIVE TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.command
class TestCommandRunnerRunInteractive:
    """Tests for CommandRunner.run_interactive method."""
    
    def test_run_interactive_success(self, mock_logger: None):
        """Test successful interactive command."""
        with patch('subprocess.call', return_value=0):
            result = CommandRunner.run_interactive(["echo", "test"])
            
            assert result == 0
    
    def test_run_interactive_failure(self, mock_logger: None):
        """Test failed interactive command."""
        with patch('subprocess.call', return_value=1):
            result = CommandRunner.run_interactive(["false"])
            
            assert result == 1
    
    def test_run_interactive_exception(self, mock_logger: None):
        """Test interactive command exception handling."""
        with patch('subprocess.call', side_effect=Exception("Error")):
            result = CommandRunner.run_interactive(["error_cmd"])
            
            assert result == -1


# =============================================================================
# CHECK COMMAND EXISTS TESTS
# =============================================================================

@pytest.mark.unit
@pytest.mark.command
class TestCommandRunnerCheckCommandExists:
    """Tests for CommandRunner.check_command_exists method."""
    
    def test_check_command_exists_true(self):
        """Test checking for existing command."""
        with patch('shutil.which', return_value="/usr/bin/python"):
            result = CommandRunner.check_command_exists("python")
            
            assert result is True
    
    def test_check_command_exists_false(self):
        """Test checking for non-existing command."""
        with patch('shutil.which', return_value=None):
            result = CommandRunner.check_command_exists("nonexistent")
            
            assert result is False

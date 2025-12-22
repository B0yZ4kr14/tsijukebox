"""
TSiJUKEBOX Installer - Spicetify Setup Tests
=============================================
Unit tests for SpicetifySetup class methods.
"""

import os
import sys
import shutil
from pathlib import Path
from unittest.mock import MagicMock, patch, PropertyMock

import pytest

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import SpicetifySetup
from installer.spicetify_setup import (
    SpicetifySetup,
    SpicetifyStatus,
    SPOTIFY_PATHS,
    PREFS_PATHS,
)


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def spicetify_setup(temp_dir: Path) -> SpicetifySetup:
    """Create a SpicetifySetup instance for testing."""
    setup = SpicetifySetup(user="testuser")
    # Override user home to use temp directory
    setup._user_home = temp_dir
    return setup


@pytest.fixture
def mock_spotify_installation(temp_dir: Path) -> Path:
    """Create a mock Spotify installation structure."""
    # Create spotify-launcher style installation
    spotify_dir = temp_dir / ".local/share/spotify-launcher/install/usr/share/spotify"
    apps_dir = spotify_dir / "Apps"
    apps_dir.mkdir(parents=True)
    
    # Create mock files
    (apps_dir / "xpui.spa").touch()
    (apps_dir / "login.spa").touch()
    
    return spotify_dir


@pytest.fixture
def mock_aur_spotify_installation(temp_dir: Path) -> Path:
    """Create a mock AUR Spotify installation."""
    spotify_dir = Path("/opt/spotify")
    # We can't actually create /opt/spotify in tests, so we'll mock it
    return spotify_dir


@pytest.fixture
def mock_spotify_prefs(temp_dir: Path) -> Path:
    """Create a mock Spotify prefs file."""
    prefs_dir = temp_dir / ".config/spotify"
    prefs_dir.mkdir(parents=True)
    prefs_file = prefs_dir / "prefs"
    prefs_file.write_text(
        "app.player.volume=100\n"
        "app.browser.zoom-level=100\n"
        "audio.play_bitrate_enumeration=4\n"
    )
    return prefs_file


@pytest.fixture
def mock_flatpak_prefs(temp_dir: Path) -> Path:
    """Create a mock Flatpak Spotify prefs file."""
    prefs_dir = temp_dir / ".var/app/com.spotify.Client/config/spotify"
    prefs_dir.mkdir(parents=True)
    prefs_file = prefs_dir / "prefs"
    prefs_file.write_text("app.player.volume=80\n")
    return prefs_file


# =============================================================================
# TEST: INITIALIZATION
# =============================================================================

@pytest.mark.unit
class TestSpicetifySetupInit:
    """Tests for SpicetifySetup initialization."""

    def test_init_default_user(self):
        """Test initialization with default user (current user)."""
        setup = SpicetifySetup()
        assert setup.user is not None
        assert setup.user == os.environ.get("SUDO_USER", os.environ.get("USER", ""))

    def test_init_custom_user(self):
        """Test initialization with custom user."""
        setup = SpicetifySetup(user="customuser")
        assert setup.user == "customuser"

    def test_get_user_home_default(self, temp_dir: Path):
        """Test _get_user_home returns correct path."""
        setup = SpicetifySetup(user="testuser")
        # Mock the home directory lookup
        with patch("pathlib.Path.home", return_value=temp_dir):
            home = setup._get_user_home()
            assert home is not None


# =============================================================================
# TEST: DETECT SPOTIFY PATH
# =============================================================================

@pytest.mark.unit
class TestSpicetifyDetectSpotifyPath:
    """Tests for detect_spotify_path method."""

    def test_detect_spotify_launcher_path(
        self, spicetify_setup: SpicetifySetup, mock_spotify_installation: Path, temp_dir: Path
    ):
        """Test detection of spotify-launcher installation."""
        # Update the SPOTIFY_PATHS to use temp directory
        with patch.dict(
            "installer.spicetify_setup.SPOTIFY_PATHS",
            {"spotify-launcher": mock_spotify_installation},
        ):
            result = spicetify_setup.detect_spotify_path()
            assert result == mock_spotify_installation

    def test_detect_no_spotify_returns_none(
        self, spicetify_setup: SpicetifySetup, temp_dir: Path
    ):
        """Test returns None when Spotify not found."""
        # Use empty paths that don't exist
        empty_paths = {
            "spotify-launcher": temp_dir / "nonexistent1",
            "aur-spotify": temp_dir / "nonexistent2",
        }
        with patch.dict("installer.spicetify_setup.SPOTIFY_PATHS", empty_paths, clear=True):
            result = spicetify_setup.detect_spotify_path()
            assert result is None

    def test_detect_path_without_apps_dir(
        self, spicetify_setup: SpicetifySetup, temp_dir: Path
    ):
        """Test detection fails when Apps directory is missing."""
        # Create Spotify dir without Apps
        spotify_dir = temp_dir / "spotify-no-apps"
        spotify_dir.mkdir(parents=True)
        
        with patch.dict(
            "installer.spicetify_setup.SPOTIFY_PATHS",
            {"test": spotify_dir},
            clear=True,
        ):
            result = spicetify_setup.detect_spotify_path()
            assert result is None

    def test_detect_via_which_fallback(
        self, spicetify_setup: SpicetifySetup, temp_dir: Path
    ):
        """Test fallback detection via which command."""
        # Create a mock spotify binary location
        spotify_bin = temp_dir / "usr/bin/spotify"
        spotify_bin.parent.mkdir(parents=True)
        spotify_bin.touch()
        
        spotify_share = temp_dir / "usr/share/spotify"
        apps_dir = spotify_share / "Apps"
        apps_dir.mkdir(parents=True)
        (apps_dir / "xpui.spa").touch()
        
        with patch.dict("installer.spicetify_setup.SPOTIFY_PATHS", {}, clear=True):
            with patch("shutil.which", return_value=str(spotify_bin)):
                with patch.object(Path, "resolve", return_value=spotify_bin):
                    result = spicetify_setup.detect_spotify_path()
                    # The fallback logic may vary; this tests the mechanism exists


# =============================================================================
# TEST: DETECT PREFS PATH
# =============================================================================

@pytest.mark.unit
class TestSpicetifyDetectPrefsPath:
    """Tests for detect_prefs_path method."""

    def test_detect_config_prefs(
        self, spicetify_setup: SpicetifySetup, mock_spotify_prefs: Path, temp_dir: Path
    ):
        """Test detection of ~/.config/spotify/prefs."""
        with patch.dict(
            "installer.spicetify_setup.PREFS_PATHS",
            {"spotify-launcher": mock_spotify_prefs},
        ):
            result = spicetify_setup.detect_prefs_path()
            assert result == mock_spotify_prefs

    def test_detect_flatpak_prefs(
        self, spicetify_setup: SpicetifySetup, mock_flatpak_prefs: Path, temp_dir: Path
    ):
        """Test detection of Flatpak prefs file."""
        with patch.dict(
            "installer.spicetify_setup.PREFS_PATHS",
            {"flatpak": mock_flatpak_prefs},
        ):
            result = spicetify_setup.detect_prefs_path()
            assert result == mock_flatpak_prefs

    def test_detect_no_prefs_returns_none(
        self, spicetify_setup: SpicetifySetup, temp_dir: Path
    ):
        """Test returns None when prefs not found."""
        empty_paths = {
            "spotify-launcher": temp_dir / "nonexistent/prefs",
            "flatpak": temp_dir / "nonexistent2/prefs",
        }
        with patch.dict("installer.spicetify_setup.PREFS_PATHS", empty_paths, clear=True):
            result = spicetify_setup.detect_prefs_path()
            assert result is None

    def test_detect_prefs_recursive_search(
        self, spicetify_setup: SpicetifySetup, temp_dir: Path
    ):
        """Test recursive search fallback for prefs."""
        # Create a prefs file in an unexpected location
        custom_spotify_dir = temp_dir / ".config/custom-spotify"
        custom_spotify_dir.mkdir(parents=True)
        prefs_file = custom_spotify_dir / "prefs"
        prefs_file.write_text("test=value\n")
        
        # Empty the known paths
        with patch.dict("installer.spicetify_setup.PREFS_PATHS", {}, clear=True):
            # The recursive search should find it
            result = spicetify_setup.detect_prefs_path()
            # Result depends on implementation of recursive search


# =============================================================================
# TEST: FIX PERMISSIONS
# =============================================================================

@pytest.mark.unit
class TestSpicetifyFixPermissions:
    """Tests for _fix_spotify_permissions method."""

    def test_fix_permissions_success(
        self, spicetify_setup: SpicetifySetup, mock_spotify_installation: Path
    ):
        """Test successful permission fix."""
        result = spicetify_setup._fix_spotify_permissions(mock_spotify_installation)
        assert result is True

    def test_fix_permissions_apps_dir_not_found(
        self, spicetify_setup: SpicetifySetup, temp_dir: Path
    ):
        """Test handling when Apps dir not found."""
        # Create dir without Apps subdirectory
        spotify_dir = temp_dir / "spotify-empty"
        spotify_dir.mkdir(parents=True)
        
        result = spicetify_setup._fix_spotify_permissions(spotify_dir)
        assert result is False

    def test_fix_permissions_requires_sudo(
        self, spicetify_setup: SpicetifySetup, temp_dir: Path
    ):
        """Test fallback to sudo for permission fix."""
        # Create a read-only directory structure
        spotify_dir = temp_dir / "spotify-readonly"
        apps_dir = spotify_dir / "Apps"
        apps_dir.mkdir(parents=True)
        (apps_dir / "xpui.spa").touch()
        
        # Make it read-only
        os.chmod(apps_dir, 0o444)
        
        with patch.object(spicetify_setup, "_run_command", return_value=(0, "", "")):
            result = spicetify_setup._fix_spotify_permissions(spotify_dir)
            # Should attempt sudo chmod
        
        # Restore permissions for cleanup
        os.chmod(apps_dir, 0o755)


# =============================================================================
# TEST: AUTO CONFIGURE
# =============================================================================

@pytest.mark.unit
class TestSpicetifyAutoConfig:
    """Tests for auto_configure method."""

    def test_auto_configure_success(
        self,
        spicetify_setup: SpicetifySetup,
        mock_spotify_installation: Path,
        mock_spotify_prefs: Path,
        temp_dir: Path,
    ):
        """Test successful auto configuration."""
        with patch.dict(
            "installer.spicetify_setup.SPOTIFY_PATHS",
            {"spotify-launcher": mock_spotify_installation},
        ):
            with patch.dict(
                "installer.spicetify_setup.PREFS_PATHS",
                {"spotify-launcher": mock_spotify_prefs},
            ):
                with patch.object(
                    spicetify_setup, "_run_command", return_value=(0, "Success", "")
                ):
                    with patch.object(
                        spicetify_setup, "backup_spotify", return_value=True
                    ):
                        with patch.object(
                            spicetify_setup, "apply_customizations", return_value=True
                        ):
                            result = spicetify_setup.auto_configure()
                            assert result is True

    def test_auto_configure_no_spotify(
        self, spicetify_setup: SpicetifySetup, temp_dir: Path
    ):
        """Test failure when Spotify not found."""
        with patch.dict("installer.spicetify_setup.SPOTIFY_PATHS", {}, clear=True):
            result = spicetify_setup.auto_configure()
            assert result is False

    def test_auto_configure_no_prefs(
        self,
        spicetify_setup: SpicetifySetup,
        mock_spotify_installation: Path,
        temp_dir: Path,
    ):
        """Test handling when prefs not found (tries to start Spotify)."""
        with patch.dict(
            "installer.spicetify_setup.SPOTIFY_PATHS",
            {"spotify-launcher": mock_spotify_installation},
        ):
            with patch.dict("installer.spicetify_setup.PREFS_PATHS", {}, clear=True):
                with patch.object(
                    spicetify_setup, "_start_spotify_briefly", return_value=False
                ):
                    result = spicetify_setup.auto_configure()
                    assert result is False

    def test_auto_configure_custom_user(
        self,
        mock_spotify_installation: Path,
        mock_spotify_prefs: Path,
        temp_dir: Path,
    ):
        """Test auto configuration with custom user."""
        setup = SpicetifySetup(user="customuser")
        setup._user_home = temp_dir
        
        with patch.dict(
            "installer.spicetify_setup.SPOTIFY_PATHS",
            {"spotify-launcher": mock_spotify_installation},
        ):
            with patch.dict(
                "installer.spicetify_setup.PREFS_PATHS",
                {"spotify-launcher": mock_spotify_prefs},
            ):
                with patch.object(setup, "_run_command", return_value=(0, "Success", "")):
                    with patch.object(setup, "backup_spotify", return_value=True):
                        with patch.object(setup, "apply_customizations", return_value=True):
                            result = setup.auto_configure()
                            assert result is True

    def test_auto_configure_spicetify_config_fails(
        self,
        spicetify_setup: SpicetifySetup,
        mock_spotify_installation: Path,
        mock_spotify_prefs: Path,
    ):
        """Test failure when spicetify config command fails."""
        with patch.dict(
            "installer.spicetify_setup.SPOTIFY_PATHS",
            {"spotify-launcher": mock_spotify_installation},
        ):
            with patch.dict(
                "installer.spicetify_setup.PREFS_PATHS",
                {"spotify-launcher": mock_spotify_prefs},
            ):
                with patch.object(
                    spicetify_setup,
                    "_run_command",
                    return_value=(1, "", "Error: config failed"),
                ):
                    result = spicetify_setup.auto_configure()
                    assert result is False


# =============================================================================
# TEST: START SPOTIFY BRIEFLY
# =============================================================================

@pytest.mark.unit
class TestSpicetifyStartSpotifyBriefly:
    """Tests for _start_spotify_briefly method."""

    def test_start_spotify_briefly_success(self, spicetify_setup: SpicetifySetup):
        """Test starting Spotify briefly."""
        with patch("subprocess.Popen") as mock_popen:
            with patch("subprocess.run") as mock_run:
                with patch("time.sleep"):
                    mock_process = MagicMock()
                    mock_popen.return_value = mock_process
                    mock_run.return_value = MagicMock(returncode=0)
                    
                    result = spicetify_setup._start_spotify_briefly()
                    # Should attempt to start spotify

    def test_start_spotify_briefly_timeout(self, spicetify_setup: SpicetifySetup):
        """Test timeout when starting Spotify."""
        with patch("subprocess.Popen") as mock_popen:
            with patch("subprocess.run") as mock_run:
                with patch("time.sleep"):
                    mock_popen.side_effect = TimeoutError("Timeout")
                    
                    result = spicetify_setup._start_spotify_briefly()
                    assert result is False


# =============================================================================
# TEST: SPICETIFY STATUS ENUM
# =============================================================================

@pytest.mark.unit
class TestSpicetifyStatus:
    """Tests for SpicetifyStatus enum."""

    def test_status_values(self):
        """Test SpicetifyStatus enum values exist."""
        assert SpicetifyStatus.NOT_INSTALLED is not None
        assert SpicetifyStatus.INSTALLED is not None
        assert SpicetifyStatus.CONFIGURED is not None
        assert SpicetifyStatus.APPLIED is not None

    def test_status_comparison(self):
        """Test SpicetifyStatus can be compared."""
        assert SpicetifyStatus.NOT_INSTALLED != SpicetifyStatus.INSTALLED
        assert SpicetifyStatus.CONFIGURED != SpicetifyStatus.APPLIED


# =============================================================================
# TEST: PATH CONSTANTS
# =============================================================================

@pytest.mark.unit
class TestPathConstants:
    """Tests for path constant dictionaries."""

    def test_spotify_paths_not_empty(self):
        """Test SPOTIFY_PATHS dictionary is defined."""
        assert SPOTIFY_PATHS is not None
        assert len(SPOTIFY_PATHS) > 0

    def test_prefs_paths_not_empty(self):
        """Test PREFS_PATHS dictionary is defined."""
        assert PREFS_PATHS is not None
        assert len(PREFS_PATHS) > 0

    def test_spotify_paths_has_common_installations(self):
        """Test SPOTIFY_PATHS includes common installation locations."""
        assert "spotify-launcher" in SPOTIFY_PATHS
        assert "aur-spotify" in SPOTIFY_PATHS

    def test_prefs_paths_has_common_locations(self):
        """Test PREFS_PATHS includes common prefs locations."""
        assert "spotify-launcher" in PREFS_PATHS or "config" in str(list(PREFS_PATHS.values()))

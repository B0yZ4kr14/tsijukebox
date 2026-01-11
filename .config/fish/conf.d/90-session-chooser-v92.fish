# File: /home/b0y_z4kr14/.config/fish/conf.d/90-session-chooser.fish
# TTY1 Session Chooser - Kernel V9.2 Logic (Enhanced with Robustness)
# Author: b0y_z4kr14
# Description: Interactive session selection with error handling, logging, and retry logic

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================

set -l TTY_REQUIRED "/dev/tty1"
set -l LOG_FILE "$HOME/.config/fish/logs/session-chooser.log"
set -l LOG_DIR (dirname $LOG_FILE)
set -l MAX_RETRIES 3
set -l INPUT_TIMEOUT 30

# Color definitions
set -l COLOR_CYAN (set_color cyan)
set -l COLOR_GREEN (set_color green)
set -l COLOR_RED (set_color red)
set -l COLOR_YELLOW (set_color yellow)
set -l COLOR_RESET (set_color normal)

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

function log_message --description "Log messages with timestamp"
    set -l timestamp (date "+%Y-%m-%d %H:%M:%S")
    
    # Create log directory if it doesn't exist
    if not test -d $LOG_DIR
        mkdir -p $LOG_DIR 2>/dev/null
    end
    
    # Write to log file
    echo "[$timestamp] $argv" >> $LOG_FILE
end

function check_command --description "Verify if command exists and is executable"
    if not command -v $argv[1] &>/dev/null
        return 1
    end
    return 0
end

# ============================================================================
# MAIN EXECUTION
# ============================================================================

# Only run on login shell at TTY1
if status is-login; and test (tty) = $TTY_REQUIRED
    
    log_message "Session chooser initialized by user: $(whoami)"
    
    set -l retry_count 0
    
    while test $retry_count -lt $MAX_RETRIES
        # ====================================================================
        # UI RENDERING - BANNER WITH "DON'T TREAD ON ME!"
        # ====================================================================
        
        clear
        $COLOR_CYAN
        echo "------------------------------------------"
        echo "B0.y_Z4kr14: DON'T TREAD ON ME!"
        echo "------------------------------------------"
        $COLOR_RESET
        echo "1. Hyprland     (Wayland Native)"
        echo "2. XFCE4        (X11 Fallback)"
        echo "3. GNOME Shell  (Wayland Manual)"
        echo "4. Exit         (CLI)"
        $COLOR_CYAN
        echo "------------------------------------------"
        $COLOR_RESET
        echo ""
        
        # ====================================================================
        # INPUT HANDLING WITH TIMEOUT
        # ====================================================================
        
        if read -P "Choice [1-4]: " -t $INPUT_TIMEOUT choice
            
            # Validate input
            switch $choice
                case 1
                    echo ":: Initializing Hyprland Protocol..."
                    log_message "User selected: Hyprland"
                    
                    # Verify Hyprland is installed
                    if not check_command Hyprland
                        $COLOR_RED
                        echo "ERROR: Hyprland not found in PATH"
                        $COLOR_RESET
                        log_message "ERROR: Hyprland command not found"
                        set retry_count (math $retry_count + 1)
                        
                        if test $retry_count -lt $MAX_RETRIES
                            echo ""
                            $COLOR_YELLOW
                            echo "Retrying... (Attempt $retry_count of $MAX_RETRIES)"
                            $COLOR_RESET
                            sleep 2
                        end
                        continue
                    end
                    
                    # Wayland Environment Standardization
                    set -x XDG_SESSION_TYPE wayland
                    set -x GDK_BACKEND wayland
                    set -x QT_QPA_PLATFORM "wayland;xcb"
                    set -x SDL_VIDEODRIVER wayland
                    set -x CLUTTER_BACKEND wayland
                    set -x QT_WAYLAND_DISABLE_WINDOWDECORATION 1
                    set -x _JAVA_AWT_WM_NONREPARENTING 1
                    set -x MOZ_ENABLE_WAYLAND 1
                    
                    # Exec: Wrapped in DBus for Portal support
                    log_message "Executing: dbus-run-session Hyprland"
                    exec dbus-run-session Hyprland
                
                case 2
                    echo ":: Initializing XFCE4 Legacy..."
                    log_message "User selected: XFCE4"
                    
                    # Verify XFCE4 is installed
                    if not check_command startxfce4
                        $COLOR_RED
                        echo "ERROR: XFCE4 not found in PATH"
                        $COLOR_RESET
                        log_message "ERROR: startxfce4 command not found"
                        set retry_count (math $retry_count + 1)
                        
                        if test $retry_count -lt $MAX_RETRIES
                            echo ""
                            $COLOR_YELLOW
                            echo "Retrying... (Attempt $retry_count of $MAX_RETRIES)"
                            $COLOR_RESET
                            sleep 2
                        end
                        continue
                    end
                    
                    # Direct binary call prevents .xinitrc misconfiguration
                    log_message "Executing: startxfce4"
                    exec startxfce4
                
                case 3
                    echo ":: Initializing GNOME Runtime..."
                    log_message "User selected: GNOME Shell"
                    
                    # Verify GNOME is installed
                    if not check_command gnome-session
                        $COLOR_RED
                        echo "ERROR: GNOME Shell not found in PATH"
                        $COLOR_RESET
                        log_message "ERROR: gnome-session command not found"
                        set retry_count (math $retry_count + 1)
                        
                        if test $retry_count -lt $MAX_RETRIES
                            echo ""
                            $COLOR_YELLOW
                            echo "Retrying... (Attempt $retry_count of $MAX_RETRIES)"
                            $COLOR_RESET
                            sleep 2
                        end
                        continue
                    end
                    
                    # Verify session file exists
                    set -l session_file "/usr/share/gnome-session/sessions/gnome.session"
                    if not test -f $session_file
                        $COLOR_YELLOW
                        echo "WARNING: Session file not found at $session_file"
                        $COLOR_RESET
                        log_message "WARNING: GNOME session file missing"
                    end
                    
                    # CRITICAL: Manual Environment Injection for Non-GDM boot
                    set -x XDG_SESSION_TYPE wayland
                    set -x XDG_CURRENT_DESKTOP GNOME
                    set -x XDG_SESSION_DESKTOP gnome
                    set -x GNOME_SHELL_SESSION_MODE user
                    set -x GDM_SKIP_INITIAL_SETUP 1
                    
                    # Fix: Ensure DBus + Session type matches binary expectation
                    log_message "Executing: dbus-run-session gnome-session --session=gnome"
                    exec dbus-run-session gnome-session --session=gnome
                
                case 4
                    echo ":: Dropping to TTY Shell."
                    log_message "User selected: Exit - dropping to shell"
                    return 0
                
                case "*"
                    $COLOR_RED
                    echo "!! Invalid Input. Please choose 1-4."
                    $COLOR_RESET
                    log_message "WARN: Invalid input received: $choice"
                    set retry_count (math $retry_count + 1)
                    
                    if test $retry_count -lt $MAX_RETRIES
                        echo ""
                        $COLOR_YELLOW
                        echo "Retrying... (Attempt $retry_count of $MAX_RETRIES)"
                        $COLOR_RESET
                        sleep 2
                    end
            end
        else
            # Timeout reached
            $COLOR_YELLOW
            echo "Input timeout. Dropping to shell."
            $COLOR_RESET
            log_message "Input timeout reached - dropping to shell"
            return 0
        end
    end
    
    # Max retries reached
    $COLOR_RED
    echo "Maximum retries exceeded. Dropping to shell."
    $COLOR_RESET
    log_message "Maximum retries exceeded - dropping to shell"
end

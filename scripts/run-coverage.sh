#!/usr/bin/env bash
# =============================================================================
# TSiJUKEBOX Installer - Local Coverage Report Generator
# =============================================================================
# Runs Python tests with coverage and generates HTML report.
#
# Usage:
#   ./run-coverage.sh              # Run all tests with coverage
#   ./run-coverage.sh --unit       # Run only unit tests
#   ./run-coverage.sh --quick      # Run fast tests only (no slow/benchmark)
#   ./run-coverage.sh --open       # Run and open HTML report in browser
#
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default options
RUN_MODE="all"
OPEN_REPORT=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --unit)
            RUN_MODE="unit"
            shift
            ;;
        --quick)
            RUN_MODE="quick"
            shift
            ;;
        --integration)
            RUN_MODE="integration"
            shift
            ;;
        --edge)
            RUN_MODE="edge"
            shift
            ;;
        --open)
            OPEN_REPORT=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --unit         Run only unit tests"
            echo "  --quick        Run fast tests only (excludes slow, benchmark, docker, e2e)"
            echo "  --integration  Run integration tests"
            echo "  --edge         Run edge case tests"
            echo "  --open         Open HTML report in browser after completion"
            echo "  -v, --verbose  Verbose output"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🐍 TSiJUKEBOX Installer - Coverage Report Generator       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [[ ! -f "requirements-test.txt" ]]; then
    echo -e "${RED}Error: requirements-test.txt not found. Run from scripts/ directory.${NC}"
    exit 1
fi

# Install dependencies if needed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
pip install -q -r requirements-test.txt 2>/dev/null || {
    echo -e "${YELLOW}Installing test dependencies...${NC}"
    pip install -r requirements-test.txt
}

# Clean previous coverage data
echo -e "${YELLOW}🧹 Cleaning previous coverage data...${NC}"
rm -rf htmlcov/ .coverage coverage.xml 2>/dev/null || true

# Build pytest command based on mode
PYTEST_OPTS="-v --tb=short --cov=. --cov-report=html:htmlcov --cov-report=xml:coverage.xml --cov-report=term-missing"

case $RUN_MODE in
    unit)
        echo -e "${GREEN}🧪 Running unit tests with coverage...${NC}"
        PYTEST_CMD="pytest tests/test_unified_installer.py tests/test_cli_parsing.py tests/test_audio_setup.py tests/test_database_setup.py tests/test_fonts_setup.py tests/test_ntp_setup.py tests/test_ufw_setup.py tests/test_spicetify_setup.py $PYTEST_OPTS -m 'not integration and not e2e and not docker and not benchmark and not slow' --ignore=tests/e2e/"
        ;;
    quick)
        echo -e "${GREEN}⚡ Running quick tests with coverage...${NC}"
        PYTEST_CMD="pytest tests/ $PYTEST_OPTS -m 'not slow and not benchmark and not docker and not e2e' --ignore=tests/e2e/"
        ;;
    integration)
        echo -e "${GREEN}🔗 Running integration tests with coverage...${NC}"
        PYTEST_CMD="pytest tests/test_unified_installer_integration.py $PYTEST_OPTS -m 'not docker and not e2e'"
        ;;
    edge)
        echo -e "${GREEN}⚠️ Running edge case tests with coverage...${NC}"
        PYTEST_CMD="pytest tests/test_unified_installer_edge_cases.py $PYTEST_OPTS"
        ;;
    all)
        echo -e "${GREEN}🧪 Running all tests with coverage...${NC}"
        PYTEST_CMD="pytest tests/ $PYTEST_OPTS -m 'not docker and not e2e and not benchmark and not slow' --ignore=tests/e2e/"
        ;;
esac

if [[ "$VERBOSE" == true ]]; then
    PYTEST_CMD="$PYTEST_CMD -vv"
fi

echo -e "${BLUE}Command: $PYTEST_CMD${NC}"
echo ""

# Run tests
eval "$PYTEST_CMD" || {
    echo -e "${YELLOW}⚠️ Some tests failed, but coverage report was generated.${NC}"
}

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Coverage report generated!${NC}"
echo ""
echo -e "${BLUE}📊 Reports:${NC}"
echo "   HTML Report: htmlcov/index.html"
echo "   XML Report:  coverage.xml"
echo ""

# Show quick summary
if [[ -f "coverage.xml" ]]; then
    echo -e "${BLUE}📈 Coverage Summary:${NC}"
    python3 << 'EOF'
import xml.etree.ElementTree as ET
try:
    tree = ET.parse('coverage.xml')
    root = tree.getroot()
    line_rate = float(root.get('line-rate', 0)) * 100
    branch_rate = float(root.get('branch-rate', 0)) * 100
    lines_valid = root.get('lines-valid', 'N/A')
    lines_covered = root.get('lines-covered', 'N/A')
    print(f"   Lines:    {line_rate:.1f}% ({lines_covered}/{lines_valid})")
    print(f"   Branches: {branch_rate:.1f}%")
except Exception as e:
    print(f"   Could not parse coverage: {e}")
EOF
    echo ""
fi

# Open browser if requested
if [[ "$OPEN_REPORT" == true ]]; then
    echo -e "${YELLOW}🌐 Opening coverage report in browser...${NC}"
    if command -v xdg-open &> /dev/null; then
        xdg-open htmlcov/index.html &
    elif command -v open &> /dev/null; then
        open htmlcov/index.html &
    elif command -v start &> /dev/null; then
        start htmlcov/index.html &
    else
        echo -e "${YELLOW}Could not detect browser. Open manually: htmlcov/index.html${NC}"
    fi
fi

echo -e "${GREEN}Done!${NC}"

#!/bin/bash
# =============================================================================
# TSiJUKEBOX Installer - Python Test Runner
# =============================================================================
# Usage:
#   ./run-python-tests.sh              # Run all tests
#   ./run-python-tests.sh --coverage   # Run with coverage report
#   ./run-python-tests.sh -k certbot   # Run only certbot tests
#   ./run-python-tests.sh -m unit      # Run only unit tests
# =============================================================================

set -e

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Navigate to scripts directory
cd "$(dirname "$0")"

echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       TSiJUKEBOX - Python Installer Tests                ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}▶ Creating virtual environment...${NC}"
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo -e "${CYAN}▶ Installing test dependencies...${NC}"
pip install -r requirements-test.txt -q

# Run tests
echo -e "${CYAN}▶ Running tests...${NC}"
echo ""

if [ "$1" == "--coverage" ]; then
    pytest tests/ \
        --cov=. \
        --cov-report=term-missing \
        --cov-report=html:../coverage-python \
        --cov-exclude=tests/* \
        "${@:2}"
    
    echo ""
    echo -e "${GREEN}✓ Coverage report generated at: coverage-python/index.html${NC}"
else
    pytest tests/ "$@"
fi

echo ""
echo -e "${GREEN}✓ Tests completed${NC}"

#!/bin/bash

################################################################################
# Gym Management System - Development Environment Setup Script
#
# This script initializes the development environment for the NestJS Gym
# Management System, including dependency installation, database setup,
# and server startup.
#
# Usage: ./init.sh [--skip-db] [--skip-install]
# Options:
#   --skip-db      Skip database setup
#   --skip-install Skip npm install
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Gym Management System"
DEFAULT_PORT=3000
DB_NAME="${POSTGRES_DB:-gym_db}"
DB_USER="${POSTGRES_USER:-chandangaur}"

# Functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        print_info "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    print_success "Node.js $(node -v) installed"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm -v) installed"

    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) not found"
        print_info "Please install PostgreSQL from https://www.postgresql.org/download/"
        exit 1
    fi
    print_success "PostgreSQL client installed"

    echo ""
}

install_dependencies() {
    if [[ "$SKIP_INSTALL" == "true" ]]; then
        print_info "Skipping npm install (--skip-install flag set)"
        return
    fi

    print_header "Installing Dependencies"

    if [ -d "node_modules" ]; then
        print_info "node_modules already exists, skipping install"
        print_info "Remove node_modules and run again to force reinstall"
        return
    fi

    print_info "Running: npm install"
    npm install
    print_success "Dependencies installed"
    echo ""
}

setup_database() {
    if [[ "$SKIP_DB" == "true" ]]; then
        print_info "Skipping database setup (--skip-db flag set)"
        return
    fi

    print_header "Database Setup"

    # Check if database exists
    print_info "Checking database connection..."
    if psql -h localhost -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_success "Database '$DB_NAME' already exists"
    else
        print_info "Creating database '$DB_NAME'..."
        createdb -h localhost -U "$DB_USER" "$DB_NAME"
        print_success "Database created"
    fi

    # The NestJS app will auto-sync schema on first run (synchronize: true)
    print_info "Database schema will be auto-synced on first server start"
    echo ""
}

setup_environment() {
    print_header "Environment Configuration"

    if [ ! -f ".env" ]; then
        print_error ".env file not found"
        print_info "Creating .env file from template..."

        cat > .env << EOF
# Database Configuration
POSTGRES_URL="postgresql://${DB_USER}@localhost:5432/${DB_NAME}"

# JWT Configuration
JWT_SECRET="56r67a7d9asd76gs9a7dg6796as786d078as6d789sa"
JWT_EXPIRES_IN="1d"

# Server Configuration
PORT="3000"

# Environment
NODE_ENV="development"
EOF
        print_success ".env file created"
        print_info "Please review and update .env with your configuration"
    else
        print_success ".env file already exists"
    fi
    echo ""
}

build_project() {
    print_header "Building Project"

    print_info "Running: npm run build"
    npm run build
    print_success "Project built successfully"
    echo ""
}

run_tests() {
    print_header "Running Tests"

    print_info "Running: npm run test"
    if npm run test; then
        print_success "All tests passed"
    else
        print_error "Some tests failed"
        print_info "You can continue, but please review test failures"
    fi
    echo ""
}

start_server() {
    print_header "Starting Development Server"

    print_info "Starting server in background..."
    nohup npm run start:dev > logs/server.log 2>&1 &
    SERVER_PID=$!

    # Save PID for later
    echo $SERVER_PID > .server.pid

    print_info "Waiting for server to start..."
    sleep 10

    # Check if server is running
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_success "Server started successfully (PID: $SERVER_PID)"
        print_info "Logs: tail -f logs/server.log"
    else
        print_error "Server failed to start"
        print_info "Check logs: cat logs/server.log"
        return 1
    fi
    echo ""
}

print_access_info() {
    print_header "Access Information"

    echo -e "${GREEN}Development server is running!${NC}"
    echo ""
    echo -e "API Documentation (Swagger): ${BLUE}http://localhost:${DEFAULT_PORT}/api${NC}"
    echo -e "Health Check:              ${BLUE}http://localhost:${DEFAULT_PORT}/health${NC}"
    echo -e "API Base URL:              ${BLUE}http://localhost:${DEFAULT_PORT}${NC}"
    echo ""
    echo -e "Test Credentials:"
    echo -e "  SUPERADMIN:  ${YELLOW}superadmin@fitnessfirstelite.com${NC} / ${YELLOW}SuperAdmin123!${NC}"
    echo -e "  ADMIN:       ${YELLOW}admin@fitnessfirstelite.com${NC} / ${YELLOW}Admin123!${NC}"
    echo -e "  TRAINER:     ${YELLOW}mike.johnson-smith0@email.com${NC} / ${YELLOW}Trainer123!${NC}"
    echo -e "  MEMBER:      ${YELLOW}sophia.johnson-smith0@email.com${NC} / ${YELLOW}Member123!${NC}"
    echo ""
    echo -e "Useful Commands:"
    echo -e "  Stop server:  ${YELLOW}kill \$(cat .server.pid)${NC}"
    echo -e "  View logs:    ${YELLOW}tail -f logs/server.log${NC}"
    echo -e "  Run tests:    ${YELLOW}npm run test${NC}"
    echo ""
}

# Parse command line arguments
SKIP_INSTALL=false
SKIP_DB=false

for arg in "$@"; do
    case $arg in
        --skip-install)
            SKIP_INSTALL=true
            shift
            ;;
        --skip-db)
            SKIP_DB=true
            shift
            ;;
        *)
            # Unknown option
            ;;
    esac
done

# Main execution
main() {
    print_header "$PROJECT_NAME - Environment Setup"
    echo ""

    # Create logs directory
    mkdir -p logs

    # Execute setup steps
    check_prerequisites
    install_dependencies
    setup_database
    setup_environment
    build_project

    # Ask if user wants to start server
    echo -e "${YELLOW}Do you want to start the development server now? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        start_server
        print_access_info
    else
        print_info "Server not started. Run 'npm run start:dev' to start manually."
    fi

    print_success "Setup complete!"
}

# Run main function
main

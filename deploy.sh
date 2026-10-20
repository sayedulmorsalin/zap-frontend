#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
#  ZAP FOOTWEAR — Automated VPS Deployment Script
#  Supported OS: Ubuntu 20.04 / 22.04 / 24.04, Debian 11 / 12
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║          ZAP FOOTWEAR — VPS DEPLOYMENT ENGINE            ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════╝${NC}"

# Check for root / sudo privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this script with sudo or as root: sudo bash deploy.sh${NC}"
  exit 1
fi

# ── 1. Install Docker & Docker Compose if missing ──
echo -e "\n${BLUE}[1/6] Checking Docker & Docker Compose...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Docker not found. Installing latest Docker Engine...${NC}"
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release ufw

  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc 2>/dev/null || \
  curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc

  chmod a+r /etc/apt/keyrings/docker.asc

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$(lsb_release -is | tr '[:upper:]' '[:lower:]') \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo -e "${GREEN}✓ Docker successfully installed!${NC}"
else
  echo -e "${GREEN}✓ Docker is already installed: $(docker --version)${NC}"
fi

# ── 2. Configure Firewall (UFW) ──
echo -e "\n${BLUE}[2/6] Configuring Firewall (UFW)...${NC}"
if command -v ufw &> /dev/null; then
  ufw allow 22/tcp || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  echo "y" | ufw enable || true
  echo -e "${GREEN}✓ Ports 22 (SSH), 80 (HTTP), and 443 (HTTPS) opened.${NC}"
fi

# ── 3. Prepare Environment & Secrets ──
echo -e "\n${BLUE}[3/6] Setting up production environment...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f .env.production ]; then
  echo -e "${YELLOW}Creating .env.production with cryptographically secure keys...${NC}"
  DB_PASS=$(openssl rand -hex 16)
  JWT_ACC=$(openssl rand -hex 32)
  JWT_REF=$(openssl rand -hex 32)
  cat > .env.production <<EOL
DOMAIN_NAME=localhost
SITE_URL=http://localhost
POSTGRES_USER=shoeshop
POSTGRES_PASSWORD=${DB_PASS}
POSTGRES_DB=shoeshop_db
JWT_ACCESS_SECRET=${JWT_ACC}
JWT_REFRESH_SECRET=${JWT_REFREF:-$JWT_REF}
SEED_DATABASE=true
FRONTEND_PORT=3000
API_PORT=3001
EOL
  echo -e "${GREEN}✓ .env.production generated with secure database credentials.${NC}"
else
  echo -e "${GREEN}✓ Existing .env.production found.${NC}"
fi

# ── 4. Create Necessary Directories ──
echo -e "\n${BLUE}[4/6] Creating volume directories...${NC}"
mkdir -p nginx/ssl
mkdir -p nginx/logs

# ── 5. Build and Launch Containers ──
echo -e "\n${BLUE}[5/6] Building and starting Docker containers...${NC}"
# Use standalone or full-stack compose
if [ -d "../nest js/zap api/shoe-shop-api" ] || [ -d "../shoe-shop-api" ] || [ -d "./api" ]; then
  # Determine API directory location
  if [ -d "./api" ]; then
    export API_DIR="./api"
  elif [ -d "../shoe-shop-api" ]; then
    export API_DIR="../shoe-shop-api"
  else
    export API_DIR="../nest js/zap api/shoe-shop-api"
  fi
  echo -e "${CYAN}Building full stack (Frontend + Backend + PostgreSQL + Nginx)...${NC}"
  docker compose --env-file .env.production -f docker-compose.prod.yml down --remove-orphans || true
  docker compose --env-file .env.production -f docker-compose.prod.yml build
  docker compose --env-file .env.production -f docker-compose.prod.yml up -d
else
  echo -e "${CYAN}Building Zap Frontend container...${NC}"
  docker compose --env-file .env.production -f docker-compose.yml down || true
  docker compose --env-file .env.production -f docker-compose.yml build
  docker compose --env-file .env.production -f docker-compose.yml up -d
fi

# ── 6. Health & Status Check ──
echo -e "\n${BLUE}[6/6] Verifying container health...${NC}"
sleep 8
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n${GREEN}══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎉 ZAP APPLICATION DEPLOYED SUCCESSFULLY!             ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo -e "Storefront & Admin: ${CYAN}http://$(curl -s ifconfig.me || echo 'YOUR_VPS_IP'):80${NC}"
echo -e "Admin Panel URL:    ${CYAN}http://$(curl -s ifconfig.me || echo 'YOUR_VPS_IP')/admin${NC}"
echo -e "API Health:         ${CYAN}http://$(curl -s ifconfig.me || echo 'YOUR_VPS_IP')/api/health${NC}"
echo -e "\nTo view live logs:  ${YELLOW}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "To restart:         ${YELLOW}docker compose -f docker-compose.prod.yml restart${NC}"
echo -e "To stop:            ${YELLOW}docker compose -f docker-compose.prod.yml down${NC}"

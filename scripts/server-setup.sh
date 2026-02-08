#!/bin/bash
# =============================================================
# VoteLive -- Hetzner Server Setup Script
# Run this ONCE on a fresh Hetzner VPS (Ubuntu 22.04+)
# =============================================================
set -euo pipefail

echo "=== VoteLive Server Setup ==="

# 1. Update system
echo ">>> Updating system..."
apt-get update && apt-get upgrade -y

# 2. Install Docker
echo ">>> Installing Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 3. Install Docker Compose plugin (if not included)
echo ">>> Docker version:"
docker --version
docker compose version

# 4. Create app directory
echo ">>> Setting up app directory..."
mkdir -p /opt/votelive/backups
cd /opt/votelive

# 5. Create .env file (EDIT THESE VALUES!)
if [ ! -f .env ]; then
  cat > .env <<'ENVEOF'
DOMAIN=votelive.example.com
POSTGRES_PASSWORD=CHANGE_ME_TO_SOMETHING_SECURE
ENVEOF
  echo ">>> Created .env file -- EDIT /opt/votelive/.env with your domain and password!"
fi

# 6. Setup firewall
echo ">>> Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# 7. Setup automatic security updates
echo ">>> Enabling automatic security updates..."
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# 8. Setup log rotation for Docker
cat > /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker

# 9. Setup cron for daily backup
(crontab -l 2>/dev/null; echo "0 3 * * * cd /opt/votelive && docker compose -f docker-compose.prod.yml run --rm db-backup >> /var/log/votelive-backup.log 2>&1") | crontab -

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Edit /opt/votelive/.env with your domain and a strong password"
echo "  2. Copy docker-compose.prod.yml and Caddyfile to /opt/votelive/"
echo "  3. Run: cd /opt/votelive && docker compose -f docker-compose.prod.yml up -d"
echo "  4. Set up GitHub Secrets:"
echo "     - SERVER_HOST: $(curl -s ifconfig.me)"
echo "     - SERVER_USER: root"
echo "     - SERVER_SSH_KEY: (your private SSH key)"
echo ""

#!/bin/bash

# Configuration
REPO_URL="https://github.com/Ricardo45000/jessiemoves.git"
APP_DIR="/var/www/jessiemoves"
CLIENT_DIR="$APP_DIR/client"
SERVER_DIR="$APP_DIR/server"
DOMAIN="your_domain_or_ip" # Replace this with your actual domain or IP

# 1. System Update & Dependencies
echo "Updating system..."
sudo apt update && sudo apt upgrade -y
echo "Installing Node.js, Nginx, Git..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Install PM2 globally
sudo npm install -g pm2

# 2. Clone/Update Repository
if [ -d "$APP_DIR" ]; then
    echo "Updating existing repository..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "Cloning repository..."
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
    git clone "$REPO_URL" "$APP_DIR"
fi

# 3. Setup Backend
echo "Setting up Backend..."
cd "$SERVER_DIR"
npm install
# Note: You must manually create .env here if not present
if [ ! -f .env ]; then
    echo "WARNING: .env file missing in server directory. Please create it manually."
    cp .env.example .env 2>/dev/null || true
fi

# Start Backend with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | bash # Execute the command PM2 suggests

# 4. Setup Frontend
echo "Setting up Frontend..."
cd "$CLIENT_DIR"
npm install
echo "Building React App..."
npm run build

# 5. Configure Nginx
echo "Configuring Nginx..."
sudo cp "$APP_DIR/nginx.conf.example" /etc/nginx/sites-available/jessiemoves
# Update domain in config if provided
# sed -i "s/your_domain_or_ip/$DOMAIN/g" /etc/nginx/sites-available/jessiemoves

sudo ln -sf /etc/nginx/sites-available/jessiemoves /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 6. Final Steps
echo "Deployment Complete!"
echo "Backend running on port 5000 (proxied via Nginx)."
echo "Frontend served at http://$DOMAIN"
echo "Don't forget to configure your .env file in $SERVER_DIR!"

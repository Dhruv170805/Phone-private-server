#!/bin/bash

# Assistant Server Termux Setup Script
echo "Starting Assistant Server Setup..."

# Update packages
pkg update && pkg upgrade -y

# Install Node.js and SQLite
pkg install nodejs-lts sqlite -y

# Install PM2 for process management
npm install -g pm2

# Install project dependencies
npm install

# Setup data directory
mkdir -p data

# Create .env from template if it doesn't exist
if [ ! -f .env ]; then
    cp .env.template .env
    echo "Created .env from template. Please edit it with your credentials."
else
    echo ".env already exists."
fi

echo "----------------------------------------"
echo "Setup Complete!"
echo "1. Edit the .env file with your email credentials."
echo "2. Start the server with: pm2 start src/server.js --name assistant"
echo "3. View logs with: pm2 logs assistant"
echo "4. Access the dashboard at: http://localhost:3000"
echo "----------------------------------------"

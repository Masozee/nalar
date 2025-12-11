#!/bin/bash
# Add server IP to ALLOWED_HOSTS in .env.production

set -e

# Get the IP to add (passed as argument or auto-detect)
SERVER_IP=${1:-$(hostname -I | awk '{print $1}')}

echo "Adding IP $SERVER_IP to ALLOWED_HOSTS..."

cd "$(dirname "$0")/.."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "Error: .env.production not found"
    exit 1
fi

# Backup .env.production
cp .env.production .env.production.backup

# Check if ALLOWED_HOSTS exists
if grep -q "^ALLOWED_HOSTS=" .env.production; then
    # Get current value
    CURRENT=$(grep "^ALLOWED_HOSTS=" .env.production | cut -d= -f2)

    # Check if IP already in list
    if echo "$CURRENT" | grep -q "$SERVER_IP"; then
        echo "✓ IP $SERVER_IP already in ALLOWED_HOSTS"
    else
        # Add IP to existing list
        NEW_VALUE="$CURRENT,$SERVER_IP"
        sed -i.bak "s|^ALLOWED_HOSTS=.*|ALLOWED_HOSTS=$NEW_VALUE|" .env.production
        echo "✓ Added $SERVER_IP to ALLOWED_HOSTS"
    fi
else
    # ALLOWED_HOSTS doesn't exist, add it
    echo "" >> .env.production
    echo "# Django Allowed Hosts" >> .env.production
    echo "ALLOWED_HOSTS=localhost,127.0.0.1,$SERVER_IP,backend" >> .env.production
    echo "✓ Created ALLOWED_HOSTS with $SERVER_IP"
fi

echo ""
echo "Current ALLOWED_HOSTS:"
grep "^ALLOWED_HOSTS=" .env.production

echo ""
echo "Now restart backend:"
echo "  docker compose restart backend"

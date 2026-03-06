#!/bin/bash
set -euo pipefail

# Pull latest code and redeploy on Azure VM
# Usage: bash scripts/azure-redeploy.sh

# Auto-detect az CLI (handles Windows Git Bash where az isn't in PATH)
if command -v az &>/dev/null; then
    AZ=az
elif [ -f "/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" ]; then
    AZ() { "/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" "$@"; }
else
    echo "ERROR: Azure CLI not found. Install it or add to PATH." && exit 1
fi

RESOURCE_GROUP="notes-app-rg"
VM_NAME="notes-app-vm"
VM_USER="azureuser"

VM_IP=$(AZ vm show --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --show-details --query publicIps -o tsv)

echo "Redeploying on VM ($VM_IP)..."
ssh -o StrictHostKeyChecking=no "${VM_USER}@${VM_IP}" << 'EOF'
cd notes-taking-app
git pull
docker compose up -d --build
EOF

DNS_FQDN=$(AZ network public-ip list --resource-group "$RESOURCE_GROUP" --query "[0].dnsSettings.fqdn" -o tsv)
echo ""
echo "=== Redeployment complete ==="
echo "Frontend: http://${DNS_FQDN}:3000"
echo "Backend:  http://${DNS_FQDN}:8000/api/"

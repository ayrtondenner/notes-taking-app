#!/bin/bash
set -euo pipefail

# Pull latest code and redeploy on Azure VM
# Usage: bash scripts/azure-redeploy.sh

RESOURCE_GROUP="notes-app-rg"
VM_NAME="notes-app-vm"
VM_USER="azureuser"

VM_IP=$(az vm show --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --show-details --query publicIps -o tsv)

echo "Redeploying on VM ($VM_IP)..."
ssh -o StrictHostKeyChecking=no "${VM_USER}@${VM_IP}" << 'EOF'
cd notes-taking-app
git pull
docker compose up -d --build
EOF

DNS_FQDN=$(az network public-ip list --resource-group "$RESOURCE_GROUP" --query "[0].dnsSettings.fqdn" -o tsv)
echo ""
echo "=== Redeployment complete ==="
echo "Frontend: http://${DNS_FQDN}:3000"
echo "Backend:  http://${DNS_FQDN}:8000/api/"

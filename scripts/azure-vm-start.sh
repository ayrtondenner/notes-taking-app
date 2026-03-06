#!/bin/bash
set -euo pipefail

# Start Azure VM and bring up containers
# Usage: bash scripts/azure-vm-start.sh

RESOURCE_GROUP="notes-app-rg"
VM_NAME="notes-app-vm"
VM_USER="azureuser"

echo "Starting VM '$VM_NAME'..."
az vm start --resource-group "$RESOURCE_GROUP" --name "$VM_NAME"

VM_IP=$(az vm show --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --show-details --query publicIps -o tsv)
echo "VM started. IP: $VM_IP"

echo "Starting containers..."
ssh -o StrictHostKeyChecking=no "${VM_USER}@${VM_IP}" "cd notes-taking-app && docker compose up -d"

DNS_FQDN=$(az network public-ip list --resource-group "$RESOURCE_GROUP" --query "[0].dnsSettings.fqdn" -o tsv)
echo ""
echo "=== VM is running ==="
echo "Frontend: http://${DNS_FQDN}:3000"
echo "Backend:  http://${DNS_FQDN}:8000/api/"

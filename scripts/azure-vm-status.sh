#!/bin/bash
set -euo pipefail

# Check Azure VM allocation status
# Usage: bash scripts/azure-vm-status.sh

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

STATUS=$(AZ vm get-instance-view \
    --resource-group "$RESOURCE_GROUP" \
    --name "$VM_NAME" \
    --query "instanceView.statuses[1].displayStatus" \
    -o tsv 2>&1) || { echo "ERROR: Failed to query VM status."; exit 1; }

echo "VM '$VM_NAME' status: $STATUS"

if [[ "$STATUS" == "VM running" ]]; then
    DNS_FQDN=$(AZ network public-ip list --resource-group "$RESOURCE_GROUP" --query "[0].dnsSettings.fqdn" -o tsv)
    echo "Frontend: https://${DNS_FQDN}"
    echo "Backend:  https://${DNS_FQDN}/api/"
    exit 0
else
    exit 1
fi

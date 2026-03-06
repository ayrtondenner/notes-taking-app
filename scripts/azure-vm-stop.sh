#!/bin/bash
set -euo pipefail

# Stop/deallocate Azure VM to save costs
# Compute billing stops; disk + public IP still billed (~$14/mo)
# Usage: bash scripts/azure-vm-stop.sh

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

echo "Deallocating VM '$VM_NAME' (stops compute billing)..."
AZ vm deallocate --resource-group "$RESOURCE_GROUP" --name "$VM_NAME"

echo ""
echo "=== VM deallocated ==="
echo "Compute billing stopped. Disk + IP still billed (~\$14/mo)."
echo "To start again: bash scripts/azure-vm-start.sh"

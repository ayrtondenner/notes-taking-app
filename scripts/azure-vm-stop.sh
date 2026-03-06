#!/bin/bash
set -euo pipefail

# Stop/deallocate Azure VM to save costs
# Compute billing stops; disk + public IP still billed (~$14/mo)
# Usage: bash scripts/azure-vm-stop.sh

RESOURCE_GROUP="notes-app-rg"
VM_NAME="notes-app-vm"

echo "Deallocating VM '$VM_NAME' (stops compute billing)..."
az vm deallocate --resource-group "$RESOURCE_GROUP" --name "$VM_NAME"

echo ""
echo "=== VM deallocated ==="
echo "Compute billing stopped. Disk + IP still billed (~\$14/mo)."
echo "To start again: bash scripts/azure-vm-start.sh"

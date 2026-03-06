#!/bin/bash
set -euo pipefail

# Azure VM Deployment Script for Notes-Taking App
# Usage: bash scripts/azure-deploy.sh
#
# Prerequisites:
#   - Azure CLI installed and logged in (az login)
#   - SSH key pair (~/.ssh/id_rsa) or will be auto-generated

RESOURCE_GROUP="notes-app-rg"
VM_NAME="notes-app-vm"
LOCATION="eastus"
VM_SIZE="Standard_B2s"
VM_USER="azureuser"
DNS_LABEL="notes-app"
REPO_URL="https://github.com/ayrtondenner/notes-taking-app.git"

echo "=== Azure VM Deployment for Notes-Taking App ==="
echo ""

# Check Azure CLI login
if ! az account show &>/dev/null; then
    echo "Not logged in to Azure CLI. Running 'az login'..."
    az login
fi

echo "[1/6] Creating resource group '$RESOURCE_GROUP' in '$LOCATION'..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

echo "[2/6] Creating VM '$VM_NAME' (Ubuntu 24.04, $VM_SIZE)..."
VM_OUTPUT=$(az vm create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$VM_NAME" \
    --image Ubuntu2404 \
    --size "$VM_SIZE" \
    --admin-username "$VM_USER" \
    --generate-ssh-keys \
    --public-ip-sku Standard \
    --output json)

VM_IP=$(echo "$VM_OUTPUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['publicIpAddress'])")
echo "   VM created with IP: $VM_IP"

echo "[3/6] Opening ports 3000 (frontend) and 8000 (backend)..."
az vm open-port --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --port 3000 --priority 1010 --output none
az vm open-port --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --port 8000 --priority 1020 --output none

echo "[4/6] Setting DNS label '$DNS_LABEL'..."
NIC_ID=$(az vm show --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --query "networkProfile.networkInterfaces[0].id" -o tsv)
PIP_ID=$(az network nic show --ids "$NIC_ID" --query "ipConfigurations[0].publicIPAddress.id" -o tsv)
az network public-ip update --ids "$PIP_ID" --dns-name "$DNS_LABEL" --output none

DNS_FQDN="${DNS_LABEL}.${LOCATION}.cloudapp.azure.com"
echo "   DNS: $DNS_FQDN"

echo "[5/6] Setting up Docker on VM..."
ssh -o StrictHostKeyChecking=no "${VM_USER}@${VM_IP}" << 'SETUP_EOF'
sudo apt-get update -qq
sudo apt-get install -y -qq docker.io docker-compose-v2 > /dev/null 2>&1
sudo usermod -aG docker $USER
SETUP_EOF

echo "[6/6] Deploying application on VM..."
# Generate secure passwords
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')
DJANGO_SECRET_KEY=$(openssl rand -base64 48 | tr -d '/+=')

ssh -o StrictHostKeyChecking=no "${VM_USER}@${VM_IP}" << DEPLOY_EOF
# Need to use sg to activate docker group in this session
sg docker << 'INNER_EOF'
git clone ${REPO_URL}
cd notes-taking-app

cat > .env << ENV_CONTENT
POSTGRES_DB=notes_db
POSTGRES_USER=notes_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_HOST=db
POSTGRES_PORT=5432
DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=${VM_IP},${DNS_FQDN},backend,localhost
NEXT_PUBLIC_API_URL=http://${DNS_FQDN}:8000/api
CORS_ALLOWED_ORIGINS=http://${DNS_FQDN}:3000
ENV_CONTENT

docker compose up -d --build
INNER_EOF
DEPLOY_EOF

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Frontend: http://${DNS_FQDN}:3000"
echo "Backend:  http://${DNS_FQDN}:8000/api/"
echo "API Docs: http://${DNS_FQDN}:8000/api/docs/"
echo "VM IP:    ${VM_IP}"
echo ""
echo "SSH: ssh ${VM_USER}@${VM_IP}"
echo ""
echo "To stop VM (save costs):  bash scripts/azure-vm-stop.sh"
echo "To start VM:              bash scripts/azure-vm-start.sh"
echo "To redeploy:              bash scripts/azure-redeploy.sh"

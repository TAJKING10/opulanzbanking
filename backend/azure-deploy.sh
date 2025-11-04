#!/bin/bash

###############################################################################
# Azure App Service Deployment Script
# This script deploys the Opulanz Banking backend to Azure App Service
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="opulanz-banking-api"
RESOURCE_GROUP="opulanz-resources"
LOCATION="westeurope"  # France/Luxembourg nearby region
RUNTIME="NODE|20-lts"
SKU="B1"  # Basic tier (upgrade to P1V2 for production)

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Opulanz Banking API - Azure Deployment Script       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}✗ Azure CLI is not installed${NC}"
    echo "Install from: https://aka.ms/installazurecli"
    exit 1
fi

echo -e "${GREEN}✓ Azure CLI found${NC}"

# Login check
echo -e "${BLUE}→ Checking Azure login status...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠ Not logged in. Starting login process...${NC}"
    az login
else
    ACCOUNT=$(az account show --query name -o tsv)
    echo -e "${GREEN}✓ Logged in as: ${ACCOUNT}${NC}"
fi

# Create resource group (if not exists)
echo ""
echo -e "${BLUE}→ Creating resource group: ${RESOURCE_GROUP}${NC}"
az group create --name ${RESOURCE_GROUP} --location ${LOCATION} --output none || true
echo -e "${GREEN}✓ Resource group ready${NC}"

# Create App Service Plan (if not exists)
echo ""
echo -e "${BLUE}→ Creating App Service Plan...${NC}"
if ! az appservice plan show --name ${APP_NAME}-plan --resource-group ${RESOURCE_GROUP} &> /dev/null; then
    az appservice plan create \
        --name ${APP_NAME}-plan \
        --resource-group ${RESOURCE_GROUP} \
        --location ${LOCATION} \
        --sku ${SKU} \
        --is-linux \
        --output none
    echo -e "${GREEN}✓ App Service Plan created${NC}"
else
    echo -e "${GREEN}✓ App Service Plan already exists${NC}"
fi

# Create Web App (if not exists)
echo ""
echo -e "${BLUE}→ Creating Web App: ${APP_NAME}${NC}"
if ! az webapp show --name ${APP_NAME} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
    az webapp create \
        --name ${APP_NAME} \
        --resource-group ${RESOURCE_GROUP} \
        --plan ${APP_NAME}-plan \
        --runtime ${RUNTIME} \
        --output none
    echo -e "${GREEN}✓ Web App created${NC}"
else
    echo -e "${GREEN}✓ Web App already exists${NC}"
fi

# Configure app settings (environment variables)
echo ""
echo -e "${BLUE}→ Configuring environment variables...${NC}"

# Load from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

az webapp config appsettings set \
    --name ${APP_NAME} \
    --resource-group ${RESOURCE_GROUP} \
    --settings \
        NODE_ENV=production \
        DB_HOST=${DB_HOST:-opulanz-pg.postgres.database.azure.com} \
        DB_USER=${DB_USER:-opulanz_admin} \
        DB_PASSWORD=${DB_PASSWORD} \
        DB_NAME=${DB_NAME:-postgres} \
        DB_PORT=${DB_PORT:-5432} \
        PORT=8080 \
        WEBSITE_NODE_DEFAULT_VERSION="~20" \
    --output none

echo -e "${GREEN}✓ Environment variables configured${NC}"

# Configure deployment settings
echo ""
echo -e "${BLUE}→ Configuring deployment settings...${NC}"

# Set startup command
az webapp config set \
    --name ${APP_NAME} \
    --resource-group ${RESOURCE_GROUP} \
    --startup-file "npm start" \
    --output none

echo -e "${GREEN}✓ Deployment settings configured${NC}"

# Deploy the application
echo ""
echo -e "${BLUE}→ Deploying application...${NC}"
echo -e "${YELLOW}  This may take a few minutes...${NC}"

# Create deployment zip
rm -f deploy.zip
zip -r deploy.zip . \
    -x "*.git*" \
    -x "node_modules/*" \
    -x "*.log" \
    -x "deploy.zip" \
    -x ".env" \
    -x "test-*.js" \
    -x "*.md" \
    > /dev/null

# Deploy
az webapp deployment source config-zip \
    --name ${APP_NAME} \
    --resource-group ${RESOURCE_GROUP} \
    --src deploy.zip \
    --output none

# Clean up
rm deploy.zip

echo -e "${GREEN}✓ Application deployed${NC}"

# Get the URL
echo ""
URL="https://${APP_NAME}.azurewebsites.net"
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Deployment Complete!                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🎉 Your API is now live at:${NC}"
echo -e "   ${URL}"
echo ""
echo -e "${BLUE}Test endpoints:${NC}"
echo -e "   Health: ${URL}/health"
echo -e "   Users:  ${URL}/api/users"
echo ""
echo -e "${BLUE}View logs:${NC}"
echo -e "   az webapp log tail --name ${APP_NAME} --resource-group ${RESOURCE_GROUP}"
echo ""
echo -e "${BLUE}Open in browser:${NC}"
echo -e "   ${URL}"
echo ""

# Open browser (optional)
read -p "Open in browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open ${URL}
    elif command -v open &> /dev/null; then
        open ${URL}
    elif command -v start &> /dev/null; then
        start ${URL}
    fi
fi

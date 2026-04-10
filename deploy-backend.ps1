# Opulanz Backend - Azure Deployment Script

$APP_NAME = "rg-opulanz-backend"
$RESOURCE_GROUP = "opulanz-rg"
$BACKEND_PATH = "C:\Users\Toufi\AndroidStudioProjects\azuree\backend"

Set-Location $BACKEND_PATH

# STEP 1: Set environment variables
Write-Host "`nStep 1: Setting environment variables..." -ForegroundColor Cyan

az webapp config appsettings set --name $APP_NAME --resource-group $RESOURCE_GROUP --settings `
  "NODE_ENV=production" `
  "PORT=8080" `
  "DB_HOST=opulanz-pg.postgres.database.azure.com" `
  "DB_USER=opulanz_admin" `
  "DB_PASSWORD=Advensys2025Secure!" `
  "DB_NAME=postgres" `
  "DB_PORT=5432" `
  "DB_SSL=true" `
  "USE_MOCK_NARVI=false" `
  "NARVI_BASE_URL=https://api.narvi.com" `
  "NARVI_API_KEY_ID=EY66Z3MKPW4K26K6" `
  "NARVI_PRIVATE_KEY_PATH=/home/site/wwwroot/banking_private.pem" `
  "SUMSUB_APP_TOKEN=sbx:1R2OAmEMuMV2FGIMwp21Au9q.Jt28im5B9G88a0xOyE0NzTDgXfpm9T0j" `
  "SUMSUB_SECRET_KEY=Ud00OHuxEgCQFKnWgLDYMlENsza8fB8q" `
  "EMAIL_USER=opulanz.banking@gmail.com" `
  "EMAIL_PASS=dpbqsmhgoqgblbub" `
  "JWT_SECRET=opulanz-super-secret-jwt-key-2025" `
  "JWT_EXPIRES_IN=7d" `
  "GOOGLE_CLIENT_ID=213751673679-2iucu4qt4itvq18kjnj7e4rvbe9tm3hs.apps.googleusercontent.com" `
  "FRONTEND_URL=https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net" `
  "WEBSITE_NODE_DEFAULT_VERSION=~20" `
  "SCM_DO_BUILD_DURING_DEPLOYMENT=false" `
  "WEBSITE_RUN_FROM_PACKAGE=0" | Out-Null

Write-Host "Environment variables set." -ForegroundColor Green

# STEP 2: Install production dependencies locally
Write-Host "`nStep 2: Installing production dependencies..." -ForegroundColor Cyan
npm install --omit=dev
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed!" -ForegroundColor Red; exit 1 }
Write-Host "Dependencies installed." -ForegroundColor Green

# STEP 3: Create staging folder with node_modules included
Write-Host "`nStep 3: Creating deployment package..." -ForegroundColor Cyan

$stagingPath = "$env:TEMP\opulanz-backend-deploy"
if (Test-Path $stagingPath) { Remove-Item $stagingPath -Recurse -Force }
New-Item -ItemType Directory -Path $stagingPath | Out-Null

Copy-Item -Path "$BACKEND_PATH\src" -Destination "$stagingPath\src" -Recurse
Copy-Item -Path "$BACKEND_PATH\node_modules" -Destination "$stagingPath\node_modules" -Recurse
Copy-Item -Path "$BACKEND_PATH\package.json" -Destination "$stagingPath\package.json"
if (Test-Path "$BACKEND_PATH\package-lock.json") {
    Copy-Item -Path "$BACKEND_PATH\package-lock.json" -Destination "$stagingPath\package-lock.json"
}
if (Test-Path "$BACKEND_PATH\banking_private.pem") {
    Copy-Item -Path "$BACKEND_PATH\banking_private.pem" -Destination "$stagingPath\banking_private.pem"
}

Write-Host "Package ready." -ForegroundColor Green

# STEP 4: Create zip
Write-Host "`nStep 4: Creating deployment zip..." -ForegroundColor Cyan

$zipPath = "$env:TEMP\opulanz-backend.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }

Compress-Archive -Path "$stagingPath\*" -DestinationPath $zipPath -CompressionLevel Optimal

$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
Write-Host "Zip created: $zipSize MB (includes node_modules)" -ForegroundColor Green

# STEP 5: Enable basic auth + deploy via Kudu
Write-Host "`nStep 5: Enabling SCM basic auth and deploying..." -ForegroundColor Cyan

# Enable basic auth for SCM (needed for curl upload)
$subId = (az account show --query id --output tsv)
az rest --method put `
    --uri "https://management.azure.com/subscriptions/$subId/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$APP_NAME/basicPublishingCredentialsPolicies/scm?api-version=2022-03-01" `
    --body "{`"properties`":{`"allow`":true}}" | Out-Null
Write-Host "Basic auth enabled." -ForegroundColor Green

# Get publishing credentials
$publishCreds = az webapp deployment list-publishing-credentials `
    --name $APP_NAME --resource-group $RESOURCE_GROUP `
    --query "{user:publishingUserName, pass:publishingPassword}" | ConvertFrom-Json

Write-Host "Uploading zip via curl..." -ForegroundColor Cyan
$kuduUrl = "https://rg-opulanz-backend-ffa3bgfze4a4g6gf.scm.canadacentral-01.azurewebsites.net/api/zipdeploy"
$curlUser = $publishCreds.user
$curlPass = $publishCreds.pass
curl.exe -X POST -u "${curlUser}:${curlPass}" --data-binary "@$zipPath" $kuduUrl --max-time 600 --silent --show-error -w "HTTP Status: %{http_code}`n"
Write-Host "Upload complete. Waiting 90 seconds for Azure to extract files..." -ForegroundColor Green
Start-Sleep -Seconds 90

# STEP 6: Set startup command
Write-Host "`nStep 6: Setting startup command..." -ForegroundColor Cyan
az webapp config set --name $APP_NAME --resource-group $RESOURCE_GROUP --startup-file "node src/index.js" | Out-Null
Write-Host "Done." -ForegroundColor Green

# STEP 7: Restart
Write-Host "`nStep 7: Restarting app..." -ForegroundColor Cyan
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP | Out-Null
Write-Host "Restarted. Waiting 40 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 40

# STEP 8: Health check
Write-Host "`nStep 8: Health check..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net/health" -Method Get -TimeoutSec 30
    Write-Host "Backend is LIVE and healthy!" -ForegroundColor Green
    Write-Host ($health | ConvertTo-Json)
} catch {
    Write-Host "Not responding yet - fetching live logs..." -ForegroundColor Yellow
    az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP
}

# Cleanup
Remove-Item $stagingPath -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $zipPath -ErrorAction SilentlyContinue

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Backend URL:" -ForegroundColor Green
Write-Host "https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Green

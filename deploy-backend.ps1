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

# STEP 2: Create source zip (backend source files, no node_modules)
Write-Host "`nStep 2: Creating backend source zip..." -ForegroundColor Cyan

if (Test-Path "deploy-backend.zip") { Remove-Item "deploy-backend.zip" }

Add-Type -Assembly "System.IO.Compression.FileSystem"
$zip = [System.IO.Compression.ZipFile]::Open("$BACKEND_PATH\deploy-backend.zip", "Create")

$include = @("src", "package.json", "package-lock.json")

foreach ($item in $include) {
    $fullPath = Join-Path $BACKEND_PATH $item
    if (Test-Path $fullPath -PathType Container) {
        $files = Get-ChildItem -Path $fullPath -Recurse -File
        foreach ($file in $files) {
            # Use forward slashes for Linux compatibility
            $relative = $file.FullName.Substring($BACKEND_PATH.Length + 1).Replace("\", "/")
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relative) | Out-Null
        }
    } elseif (Test-Path $fullPath -PathType Leaf) {
        $relative = $item
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $fullPath, $relative) | Out-Null
    }
}

$zip.Dispose()
$zipSize = [math]::Round((Get-Item "deploy-backend.zip").Length / 1MB, 2)
Write-Host "Zip created: $zipSize MB" -ForegroundColor Green

# STEP 3: Deploy source files via az webapp deploy
Write-Host "`nStep 3: Deploying backend source to Azure..." -ForegroundColor Cyan

az webapp deploy --name $APP_NAME --resource-group $RESOURCE_GROUP `
    --src-path "$BACKEND_PATH\deploy-backend.zip" --type zip --async true

Write-Host "Source files uploaded (async deploy). Waiting 30s for extraction..." -ForegroundColor Green
Start-Sleep -Seconds 30
Remove-Item "deploy-backend.zip" -ErrorAction SilentlyContinue

# STEP 4: Run npm install on Azure server via Kudu command API
Write-Host "`nStep 4: Running npm install on Azure server..." -ForegroundColor Cyan

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$token = (az account get-access-token --query accessToken --output tsv)
$apiHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}
$kuduCmd = "https://rg-opulanz-backend-ffa3bgfze4a4g6gf.scm.canadacentral-01.azurewebsites.net/api/command"

try {
    Write-Host "Cleaning old node_modules..." -ForegroundColor Cyan
    $cleanBody = ConvertTo-Json @{ command = "rm -rf node_modules"; dir = "site/wwwroot" }
    Invoke-RestMethod -Uri $kuduCmd -Method Post -Headers $apiHeaders -Body $cleanBody -TimeoutSec 60 | Out-Null
    Write-Host "Cleaned." -ForegroundColor Green

    Write-Host "Running npm install --production on Azure server (2-4 minutes)..." -ForegroundColor Cyan
    $installBody = ConvertTo-Json @{ command = "npm install --production"; dir = "site/wwwroot" }
    $result = Invoke-RestMethod -Uri $kuduCmd -Method Post -Headers $apiHeaders -Body $installBody -TimeoutSec 600
    Write-Host "npm install done!" -ForegroundColor Green
    if ($result.Error) { Write-Host "npm errors: $($result.Error)" -ForegroundColor Yellow }
} catch {
    Write-Host "Kudu command API error: $_" -ForegroundColor Red
}

# STEP 5: Run database migrations
Write-Host "`nStep 5: Running database migrations..." -ForegroundColor Cyan

$migrations = @(
    "009_create_investment_admins_table.sql",
    "010_create_investment_investors_table.sql",
    "011_create_investment_properties_table.sql",
    "012_create_investment_activity_logs_table.sql",
    "013_create_investments_table.sql",
    "014_create_investment_inquiries_table.sql",
    "015_auth_tables.sql",
    "016_add_google_oauth.sql"
)

foreach ($migration in $migrations) {
    $migPath = "site/wwwroot/src/migrations/$migration"
    Write-Host "Running $migration..." -ForegroundColor Cyan
    try {
        $migCmd = "node -e `"const {pool}=require('./src/config/db');const fs=require('fs');pool.query(fs.readFileSync('src/migrations/$migration','utf8')).then(()=>{console.log('OK');pool.end()}).catch(e=>{console.error(e.message);pool.end()})`""
        $migBody = ConvertTo-Json @{ command = $migCmd; dir = "site/wwwroot" }
        $migResult = Invoke-RestMethod -Uri $kuduCmd -Method Post -Headers $apiHeaders -Body $migBody -TimeoutSec 60
        Write-Host "  $migration : $($migResult.Output)" -ForegroundColor Green
        if ($migResult.Error -and $migResult.Error -notlike "*already exists*") {
            Write-Host "  Warning: $($migResult.Error)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  Migration error for $migration : $_" -ForegroundColor Yellow
    }
}

Write-Host "Migrations complete." -ForegroundColor Green

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

# STEP 9: Test admin login
Write-Host "`nStep 9: Testing admin login..." -ForegroundColor Cyan
try {
    $testLogin = Invoke-RestMethod -Uri "https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net/api/investment/admins/login" `
        -Method Post -ContentType "application/json" `
        -Body '{"accessCode":"OPULANZ-ADMIN-2025"}' -TimeoutSec 15
    if ($testLogin.success) {
        Write-Host "Admin login WORKS! Code OPULANZ-ADMIN-2025 is valid." -ForegroundColor Green
    } else {
        Write-Host "Admin login returned: $($testLogin | ConvertTo-Json)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Admin login test failed: $_" -ForegroundColor Red
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Backend URL:" -ForegroundColor Green
Write-Host "https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Green

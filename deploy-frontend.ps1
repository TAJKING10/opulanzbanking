# ============================================================
# Opulanz Frontend - Azure Deployment (Standalone output)
# ============================================================

$APP_NAME       = "rg-opulanz-frontend"
$RESOURCE_GROUP = "opulanz-rg"
$FRONTEND_PATH  = "C:\Users\Toufi\AndroidStudioProjects\azuree"
$DEPLOY_DIR     = "$FRONTEND_PATH\__deploy_tmp__"
$ZIP_PATH       = "$FRONTEND_PATH\deploy-frontend.zip"
$STANDALONE_SRC = "$FRONTEND_PATH\.next\standalone"

Set-Location $FRONTEND_PATH

# ── STEP 1: Verify standalone output exists ──────────────────
Write-Host "`nStep 1: Checking standalone build output..." -ForegroundColor Cyan
if (-not (Test-Path $STANDALONE_SRC)) {
    Write-Host "ERROR: .next/standalone not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "$STANDALONE_SRC\server.js")) {
    Write-Host "ERROR: server.js not found in .next/standalone. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}
Write-Host "Standalone output found." -ForegroundColor Green

# ── STEP 2: Assemble deploy folder ───────────────────────────
Write-Host "`nStep 2: Assembling deployment folder..." -ForegroundColor Cyan
if (Test-Path $DEPLOY_DIR) { Remove-Item $DEPLOY_DIR -Recurse -Force }

# Copy standalone folder (contains server.js + minimal node_modules + .next)
Write-Host "  Copying .next/standalone..." -ForegroundColor Gray
Copy-Item $STANDALONE_SRC $DEPLOY_DIR -Recurse -Force

# Copy static assets into the right place
Write-Host "  Copying .next/static..." -ForegroundColor Gray
$staticDst = "$DEPLOY_DIR\.next\static"
if (-not (Test-Path $staticDst)) { New-Item -ItemType Directory -Path $staticDst | Out-Null }
Copy-Item "$FRONTEND_PATH\.next\static" $staticDst -Recurse -Force

# Copy public folder
Write-Host "  Copying public..." -ForegroundColor Gray
Copy-Item "$FRONTEND_PATH\public" "$DEPLOY_DIR\public" -Recurse -Force

Write-Host "Files assembled." -ForegroundColor Green

# ── STEP 3: Zip ───────────────────────────────────────────────
Write-Host "`nStep 3: Creating zip..." -ForegroundColor Cyan
if (Test-Path $ZIP_PATH) { Remove-Item $ZIP_PATH }
Add-Type -Assembly "System.IO.Compression.FileSystem"
[System.IO.Compression.ZipFile]::CreateFromDirectory($DEPLOY_DIR, $ZIP_PATH)
$zipMB = [math]::Round((Get-Item $ZIP_PATH).Length / 1MB, 0)
Write-Host "Zip created: $zipMB MB" -ForegroundColor Green
Remove-Item $DEPLOY_DIR -Recurse -Force

# ── STEP 4: Configure + Upload ────────────────────────────────
Write-Host "`nStep 4: Getting Azure token..." -ForegroundColor Cyan
$token = (az account get-access-token --query accessToken --output tsv)
$subId = "40a036d5-6362-4263-a3f8-52b5b1db0417"
$baseUrl = "https://management.azure.com/subscriptions/$subId/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$APP_NAME"
$mgmtHeaders = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# Step 4a: App settings
Write-Host "  Configuring app settings..." -ForegroundColor Gray
$settingsBody = @{ properties = @{
    WEBSITE_RUN_FROM_PACKAGE      = "0"
    SCM_DO_BUILD_DURING_DEPLOYMENT = "false"
    WEBSITE_NODE_DEFAULT_VERSION  = "~20"
    PORT                          = "8080"
}} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/config/appsettings?api-version=2022-03-01" -Method Put -Headers $mgmtHeaders -Body $settingsBody | Out-Null

# Step 4b: Startup command — use node server.js (standalone mode)
Write-Host "  Setting startup command (node server.js)..." -ForegroundColor Gray
$webBody = @{ properties = @{ appCommandLine = "node server.js" } } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/config/web?api-version=2022-03-01" -Method Patch -Headers $mgmtHeaders -Body $webBody | Out-Null

# Step 4c: Restart to apply settings
Write-Host "  Restarting app..." -ForegroundColor Gray
Invoke-RestMethod -Uri "$baseUrl/restart?api-version=2022-03-01" -Method Post -Headers $mgmtHeaders | Out-Null
Write-Host "  Waiting 20s..." -ForegroundColor Gray
Start-Sleep -Seconds 20

# Step 4d: Get Kudu credentials and upload
Write-Host "`nStep 4d: Getting Kudu publishing credentials..." -ForegroundColor Cyan
$kuduCredsRaw = Invoke-WebRequest -Uri "$baseUrl/publishxml?api-version=2022-03-01" -Method Post -Headers $mgmtHeaders -UseBasicParsing
$kuduCredsStr = $kuduCredsRaw.Content
$null = $kuduCredsStr -match 'userName="([^"]+)"'
$pubUser = $Matches[1]
$null = $kuduCredsStr -match 'userPWD="([^"]+)"'
$pubPwd = $Matches[1]

if ($pubUser -and $pubPwd) {
    Write-Host "Uploading zip via Kudu API (async)..." -ForegroundColor Cyan
    $kuduUrl = "https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.scm.canadacentral-01.azurewebsites.net/api/zipdeploy?isAsync=true"
    $kuduB64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${pubUser}:${pubPwd}"))
    $kuduHeaders = @{ "Authorization" = "Basic $kuduB64" }

    $zipBytes = [System.IO.File]::ReadAllBytes($ZIP_PATH)
    try {
        $response = Invoke-WebRequest -Uri $kuduUrl -Method Post -Headers $kuduHeaders `
            -Body $zipBytes -ContentType "application/zip" -TimeoutSec 120 -UseBasicParsing
        $pollUrl = $response.Headers["Location"]
        Write-Host "Upload submitted. Polling for completion..." -ForegroundColor Yellow
        $elapsed = 0
        do {
            Start-Sleep -Seconds 10
            $elapsed += 10
            $status = Invoke-RestMethod -Uri $pollUrl -Headers $kuduHeaders
            Write-Host "  Status: $($status.status) / $($status.status_text) ($elapsed`s)" -ForegroundColor Gray
        } while ($status.status -lt 3 -and $elapsed -lt 600)
        if ($status.status -eq 4) {
            Write-Host "Deployment complete!" -ForegroundColor Green
        } else {
            Write-Host "Deployment failed (status $($status.status)). Check logs:" -ForegroundColor Red
            Write-Host "az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP" -ForegroundColor White
            Remove-Item $ZIP_PATH -ErrorAction SilentlyContinue
            exit 1
        }
    } catch {
        Write-Host "Kudu upload error: $($_.Exception.Message)" -ForegroundColor Red
        Remove-Item $ZIP_PATH -ErrorAction SilentlyContinue
        exit 1
    }
} else {
    Write-Host "Could not get Kudu credentials." -ForegroundColor Red
    Remove-Item $ZIP_PATH -ErrorAction SilentlyContinue
    exit 1
}
Remove-Item $ZIP_PATH -ErrorAction SilentlyContinue

# Step 4e: Final restart
Write-Host "  Final restart..." -ForegroundColor Gray
Invoke-RestMethod -Uri "$baseUrl/restart?api-version=2022-03-01" -Method Post -Headers $mgmtHeaders | Out-Null
Write-Host "App restarting... waiting 45s" -ForegroundColor Yellow
Start-Sleep -Seconds 45

# ── STEP 5: Test ──────────────────────────────────────────────
Write-Host "`nStep 5: Testing..." -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net/en" -UseBasicParsing -TimeoutSec 30
    Write-Host "Frontend LIVE! Status: $($r.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Not responding yet. Run this to see logs:" -ForegroundColor Yellow
    Write-Host "az webapp log tail --name rg-opulanz-frontend --resource-group opulanz-rg" -ForegroundColor White
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Green

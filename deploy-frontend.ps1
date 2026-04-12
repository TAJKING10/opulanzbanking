# ============================================================
# Opulanz Frontend - Azure Deployment Script (Source Deploy)
# ============================================================

$APP_NAME = "rg-opulanz-frontend"
$RESOURCE_GROUP = "opulanz-rg"
$FRONTEND_PATH = "C:\Users\Toufi\AndroidStudioProjects\azuree"

Set-Location $FRONTEND_PATH

# ── STEP 1: Set environment variables ───────────────────────
Write-Host "`nStep 1: Setting environment variables..." -ForegroundColor Cyan

az webapp config appsettings set --name $APP_NAME --resource-group $RESOURCE_GROUP --settings `
  "NEXT_PUBLIC_API_URL=https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net" `
  "NEXT_PUBLIC_APP_URL=https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net" `
  "NEXT_PUBLIC_APP_NAME=Opulanz Banking" `
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID=213751673679-2iucu4qt4itvq18kjnj7e4rvbe9tm3hs.apps.googleusercontent.com" `
  "NEXT_PUBLIC_PAYPAL_CLIENT_ID=AY2J7gUncxDdmNXWjLaw5E9A4Gz6X-hcQvagQBhi2erpaMLeHoaHbGIi7dgns3GZ3oFxg-wO0Xhwy0qo" `
  "NEXT_PUBLIC_PAYPAL_CURRENCY=EUR" `
  "NEXT_PUBLIC_ENABLE_ANALYTICS=false" `
  "NEXT_PUBLIC_ENABLE_DEBUG=false" `
  "NEXT_PUBLIC_ENVIRONMENT=production" `
  "NEXT_PUBLIC_BASE_URL=https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net" `
  "WEBSITE_NODE_DEFAULT_VERSION=~20" `
  "SCM_DO_BUILD_DURING_DEPLOYMENT=true" `
  "WEBSITE_RUN_FROM_PACKAGE=0" | Out-Null

Write-Host "Environment variables set." -ForegroundColor Green

# ── STEP 2: Create source zip (no node_modules, no .next) ────
Write-Host "`nStep 2: Creating source zip for Azure Oryx build..." -ForegroundColor Cyan

if (Test-Path "deploy-frontend.zip") { Remove-Item "deploy-frontend.zip" }

Add-Type -Assembly "System.IO.Compression.FileSystem"
$zip = [System.IO.Compression.ZipFile]::Open("$FRONTEND_PATH\deploy-frontend.zip", "Create")

# Source directories/files to include (Oryx will npm install + next build)
$include = @(
    "app", "components", "lib", "shared", "hooks", "contexts", "types",
    "public", "messages", "i18n",
    "package.json", "package-lock.json",
    "next.config.js", "tailwind.config.ts", "tsconfig.json",
    "postcss.config.js", "middleware.ts"
)

foreach ($item in $include) {
    $fullPath = Join-Path $FRONTEND_PATH $item
    if (Test-Path $fullPath -PathType Container) {
        $files = Get-ChildItem -Path $fullPath -Recurse -File
        foreach ($file in $files) {
            # Use forward slashes so the zip is Linux-compatible (Oryx runs on Linux)
            $relative = $file.FullName.Substring($FRONTEND_PATH.Length + 1).Replace("\", "/")
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relative) | Out-Null
        }
    } elseif (Test-Path $fullPath -PathType Leaf) {
        $relative = $item
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $fullPath, $relative) | Out-Null
    }
}

$zip.Dispose()
$zipSize = [math]::Round((Get-Item "deploy-frontend.zip").Length / 1MB, 1)
Write-Host "Zip created: $zipSize MB (source only, Oryx will build on Azure)" -ForegroundColor Green

# ── STEP 3: Deploy (Oryx will npm install + next build on Azure) ──
Write-Host "`nStep 3: Deploying to Azure (Oryx build takes 5-10 minutes)..." -ForegroundColor Cyan

az webapp deploy --name $APP_NAME --resource-group $RESOURCE_GROUP `
    --src-path "$FRONTEND_PATH\deploy-frontend.zip" --type zip --timeout 600

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed! Check Azure logs." -ForegroundColor Red
    Remove-Item "deploy-frontend.zip" -ErrorAction SilentlyContinue
    exit 1
}
Write-Host "Deployed and built successfully!" -ForegroundColor Green

# ── STEP 4: Set startup command ──────────────────────────────
Write-Host "`nStep 4: Setting startup command..." -ForegroundColor Cyan
az webapp config set --name $APP_NAME --resource-group $RESOURCE_GROUP `
    --startup-file "node_modules/.bin/next start -p 8080" | Out-Null
Write-Host "Done." -ForegroundColor Green

# ── STEP 5: Restart ──────────────────────────────────────────
Write-Host "`nStep 5: Restarting app..." -ForegroundColor Cyan
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP | Out-Null
Write-Host "Restarted. Waiting 40 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 40

# ── STEP 6: Test ─────────────────────────────────────────────
Write-Host "`nStep 6: Testing frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net/en" -Method Get -ErrorAction Stop
    Write-Host "Frontend is LIVE! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Not responding yet - fetching live logs..." -ForegroundColor Yellow
    az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP
}

Remove-Item "deploy-frontend.zip" -ErrorAction SilentlyContinue

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Frontend URL:" -ForegroundColor Green
Write-Host "https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Green
